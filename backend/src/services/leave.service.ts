import { Leave, LeaveStatus, LeaveBalance } from '../models/leave.model';
import { ApiError } from '../utils/ApiError';
import { Employee } from '../models/employee.model';
import { NotificationService } from './notification.service';
import { WorkflowService } from './workflow.service';
import { User } from '../models/user.model';
import moment from 'moment';
import mongoose from 'mongoose';

export class LeaveService {
    async applyLeave(userId: string, tenantId: string, leaveData: any) {
        const { leaveType, startDate, endDate, reason } = leaveData;
        
        const start = moment(startDate);
        const end = moment(endDate);
        const totalDays = end.diff(start, 'days') + 1;

        if (totalDays <= 0) throw new ApiError(400, "Invalid date range");

        // 1. Check for Active Workflow
        const workflow = await WorkflowService.getWorkflowForTrigger(tenantId, 'LEAVE');
        
        const leave = await Leave.create({
            userId,
            tenantId,
            leaveType,
            startDate,
            endDate,
            reason,
            totalDays,
            workflowId: workflow?._id as any,
            workflowStep: workflow ? 1 : 0
        });

        // 2. Notification Logic
        const employee = await Employee.findOne({ userId, tenantId }).populate('userId', 'firstName lastName');
        
        if (workflow) {
            const currentStep = workflow.steps.find(s => s.level === 1);
            if (currentStep) {
                // Find users with this role to notify
                const approvers = await User.find({ 
                    tenantId: new mongoose.Types.ObjectId(tenantId), 
                    role: currentStep.role as any 
                });
                for (const appv of approvers) {
                    await NotificationService.sendInApp({
                        userId: appv._id.toString(),
                        tenantId,
                        title: `Workflow: ${currentStep.title}`,
                        message: `${(employee?.userId as any).firstName} ${(employee?.userId as any).lastName} has requested leave. Level 1 approval required.`,
                        type: 'info',
                        link: '/dashboard/approvals'
                    });
                }
            }
        } else if (employee && employee.manager) {
            // Fallback to legacy manager approval
            await NotificationService.sendInApp({
                userId: employee.manager.toString(),
                tenantId,
                title: "New Leave Request",
                message: `${(employee.userId as any).firstName} ${(employee.userId as any).lastName} has requested ${totalDays} day(s) of ${leaveType} leave.`,
                type: 'info',
                link: '/dashboard/approvals'
            });
        }

        return leave;
    }

    async getLeaveRequests(tenantId: string, filter: any = {}) {
        const query: any = { tenantId };
        if (filter.userId) query.userId = filter.userId;
        if (filter.status) query.status = filter.status;

        return await Leave.find(query)
            .populate('userId', 'firstName lastName avatar')
            .sort({ createdAt: -1 });
    }

    async updateLeaveStatus(leaveId: string, tenantId: string, status: LeaveStatus, approverId: string, remarks?: string) {
        const leave = await Leave.findOne({ _id: leaveId, tenantId });
        if (!leave) throw new ApiError(404, "Leave request not found");

        if (leave.status !== LeaveStatus.PENDING) {
            throw new ApiError(400, "Only pending leaves can be updated");
        }

        // Check Workflow Progression
        if (status === LeaveStatus.APPROVED && leave.workflowStep > 0) {
            const workflow = await WorkflowService.getWorkflowForTrigger(tenantId, 'LEAVE');
            if (workflow) {
                const nextStep = workflow.steps.find(s => s.level === leave.workflowStep + 1);
                if (nextStep) {
                    // Move to next step instead of final approval
                    leave.workflowStep += 1;
                    leave.remarks = remarks || '';
                    await leave.save();

                    // Notify next approvers
                    const approvers = await User.find({ 
                        tenantId: new mongoose.Types.ObjectId(tenantId), 
                        role: nextStep.role as any 
                    });
                    const employee = await User.findById(leave.userId);
                    for (const appv of approvers) {
                        await NotificationService.sendInApp({
                            userId: appv._id.toString(),
                            tenantId,
                            title: `Workflow: ${nextStep.title}`,
                            message: `Leave request from ${employee?.firstName} moved to ${nextStep.title} stage.`,
                            type: 'info',
                            link: '/dashboard/approvals'
                        });
                    }

                    return leave;
                }
            }
        }

        leave.status = status;
        leave.approvedBy = approverId as any;
        leave.remarks = remarks || '';

        // If approved, update Leave Balance (Improved: Upsert if record doesn't exist)
        if (status === LeaveStatus.APPROVED) {
            const year = moment().year();
            
            // 1. Try to update existing balance
            const result = await LeaveBalance.findOneAndUpdate(
                { userId: leave.userId, tenantId, year, "balances.leaveType": leave.leaveType },
                { $inc: { "balances.$.used": leave.totalDays } },
                { new: true }
            );

            // 2. If no record was updated, check if the main record exists and push a new balance entry, or create whole document
            if (!result) {
                const mainRecord = await LeaveBalance.findOne({ userId: leave.userId, tenantId, year });
                
                if (mainRecord) {
                    // Main record (year) exists, but this specific leaveType block doesn't. Push it.
                    await LeaveBalance.findOneAndUpdate(
                        { userId: leave.userId, tenantId, year },
                        { $push: { balances: { leaveType: leave.leaveType, used: leave.totalDays, allotted: 15 } } }
                    );
                } else {
                    // Create new document for the year
                    await LeaveBalance.create({
                        userId: leave.userId,
                        tenantId,
                        year,
                        balances: [{
                            leaveType: leave.leaveType,
                            allotted: 15,
                            used: leave.totalDays
                        }]
                    });
                }
            }
        }

        await leave.save();

        // Notify Employee
        await NotificationService.sendInApp({
            userId: leave.userId.toString(),
            tenantId,
            title: `Leave Request ${status}`,
            message: `Your requested leave (${leave.leaveType}) from ${moment(leave.startDate).format('MMM Do')} has been ${status.toLowerCase()}.`,
            type: status === LeaveStatus.APPROVED ? 'success' : 'error',
            link: '/dashboard/leave'
        });

        return leave;
    }
}
