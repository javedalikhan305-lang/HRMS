import { Employee } from '../models/employee.model';
import { Attendance } from '../models/attendance.model';
import { Leave, LeaveStatus } from '../models/leave.model';
import { UserRole } from '../models/user.model';
import mongoose from 'mongoose';
import moment from 'moment';

export class IntentService {
    async executeIntent(intentData: any, tenantId: string) {
        const { intent, params } = intentData;
        const tenantObjectId = new mongoose.Types.ObjectId(tenantId);

        switch (intent) {
            case 'total_employees':
                const total = await Employee.countDocuments({ tenantId: tenantObjectId });
                return { answer: `There are a total of ${total} employees in the organization.` };

            case 'employees_on_leave_today':
                const today = moment().startOf('day').toDate();
                const leaves = await Leave.find({
                    tenantId: tenantObjectId,
                    status: LeaveStatus.APPROVED,
                    startDate: { $lte: today },
                    endDate: { $gte: today }
                }).populate('userId', 'firstName lastName');
                
                if (leaves.length === 0) return { answer: "There are no employees on approved leave today." };
                const names = leaves.map((l: any) => `${l.userId.firstName} ${l.userId.lastName}`).join(', ');
                return { answer: `${leaves.length} employees are on leave today: ${names}` };

            case 'employees_joined_this_month':
                const startOfMonth = moment().startOf('month').toDate();
                const joinersMonth = await Employee.find({
                    tenantId: tenantObjectId,
                    joiningDate: { $gte: startOfMonth }
                }).populate('userId', 'firstName lastName');
                
                if (joinersMonth.length === 0) return { answer: "No employees joined this month." };
                return { answer: `${joinersMonth.length} employees joined this month: ${joinersMonth.map((e: any) => `${e.userId.firstName} ${e.userId.lastName}`).join(', ')}` };

            case 'employees_joined_last_30_days':
                const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
                const joiners30 = await Employee.find({
                    tenantId: tenantObjectId,
                    joiningDate: { $gte: thirtyDaysAgo }
                }).populate('userId', 'firstName lastName');

                if (joiners30.length === 0) return { answer: "No employees joined in the last 30 days." };
                return { answer: `${joiners30.length} employees joined in the last 30 days.` };

            case 'present_employees_today':
                const dateToday = moment().startOf('day').toDate();
                const present = await Attendance.countDocuments({
                    tenantId: tenantObjectId,
                    date: dateToday,
                    status: { $in: ['Present', 'Late', 'Half Day'] }
                });
                return { answer: `${present} employees are present today.` };

            case 'absent_employees_today':
                const dateTodayAbs = moment().startOf('day').toDate();
                const absent = await Attendance.countDocuments({
                    tenantId: tenantObjectId,
                    date: dateTodayAbs,
                    status: 'Absent'
                });
                return { answer: `${absent} employees are marked as absent today.` };

            case 'pending_leave_requests':
                const pending = await Leave.countDocuments({
                    tenantId: tenantObjectId,
                    status: LeaveStatus.PENDING
                });
                return { answer: `There are ${pending} pending leave requests awaiting approval.` };

            case 'department_employee_count':
                // Logic to find department by name first or use aggregation
                const deptCount = await Employee.aggregate([
                    { $match: { tenantId: tenantObjectId } },
                    { $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'deptInfo' } },
                    { $unwind: '$deptInfo' },
                    { $match: { 'deptInfo.name': { $regex: params.departmentName, $options: 'i' } } },
                    { $count: 'count' }
                ]);
                const count = deptCount.length > 0 ? deptCount[0].count : 0;
                return { answer: `There are ${count} employees in the ${params.departmentName} department.` };

            case 'employee_search_by_name':
                const searchUsers = await Employee.aggregate([
                    { $match: { tenantId: tenantObjectId } },
                    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userInfo' } },
                    { $unwind: '$userInfo' },
                    { $match: { 
                        $or: [
                            { 'userInfo.firstName': { $regex: params.searchTerm, $options: 'i' } },
                            { 'userInfo.lastName': { $regex: params.searchTerm, $options: 'i' } }
                        ]
                    }},
                    { $project: { 'userInfo.firstName': 1, 'userInfo.lastName': 1, 'userInfo.email': 1 } }
                ]);
                if (searchUsers.length === 0) return { answer: `No employee found matching "${params.searchTerm}".` };
                const userList = searchUsers.map((u: any) => `${u.userInfo.firstName} ${u.userInfo.lastName} (${u.userInfo.email})`).join(', ');
                return { answer: `Found ${searchUsers.length} employee(s): ${userList}` };

            case 'employee_search_by_skill':
                const skillUsers = await Employee.find({
                    tenantId: tenantObjectId,
                    skills: { $regex: params.skill, $options: 'i' }
                }).populate('userId', 'firstName lastName');
                
                if (skillUsers.length === 0) return { answer: `No employees found with the skill "${params.skill}".` };
                return { answer: `Found ${skillUsers.length} employee(s) with ${params.skill} skills: ${skillUsers.map((e: any) => `${e.userId.firstName} ${e.userId.lastName}`).join(', ')}` };

            default:
                return { answer: "I'm sorry, I couldn't understand that request. Could you please rephrase it? I can help with employee counts, leaves, attendance, and searching for colleagues." };
        }
    }
}
