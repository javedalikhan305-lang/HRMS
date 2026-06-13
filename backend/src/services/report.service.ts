import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Attendance } from '../models/attendance.model';
import { LeaveRequest } from '../models/leave.model';
import { Employee } from '../models/employee.model';
import { Payroll } from '../models/payroll.model';
import ExcelJS from 'exceljs';
import moment from 'moment';

export class ReportService {
    async getHeadcountReport(tenantId: string) {
        const tenantObjectId = new mongoose.Types.ObjectId(tenantId);

        return await User.aggregate([
            { $match: { tenantId: tenantObjectId, isActive: true } },
            { $group: { _id: '$role', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
    }

    async generateAttendanceExcel(tenantId: string, startDate: Date, endDate: Date) {
        const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
        const attendanceData = await Attendance.find({
            tenantId: tenantObjectId,
            date: { $gte: startDate, $lte: endDate }
        }).populate('userId', 'firstName lastName email');

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Attendance');

        worksheet.columns = [
            { header: 'Employee Name', key: 'name', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Date', key: 'date', width: 18 },
            { header: 'Punch In', key: 'punchIn', width: 20 },
            { header: 'Punch Out', key: 'punchOut', width: 20 },
            { header: 'Status', key: 'status', width: 18 },
            { header: 'Work Hours', key: 'workHours', width: 15 }
        ];

        attendanceData.forEach((record: any) => {
            const user = record.userId || {};
            worksheet.addRow({
                name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Unknown Employee',
                email: user.email || '-',
                date: record.date ? record.date.toLocaleDateString() : '-',
                punchIn: record.punchIn ? record.punchIn.toLocaleTimeString() : '-',
                punchOut: record.punchOut ? record.punchOut.toLocaleTimeString() : '-',
                status: record.status || 'Unknown',
                workHours: typeof record.workHours === 'number' ? record.workHours.toFixed(2) : '0.00'
            });
        });

        return workbook;
    }

    async getEmployeeStats(tenantId: string, userId: string) {
        const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const attendance = await Attendance.find({ 
            userId: userObjectId, 
            tenantId: tenantObjectId 
        }).sort({ date: -1 });

        const leaves = await LeaveRequest.find({
            userId: userObjectId,
            tenantId: tenantObjectId
        });

        const totalWorkedDays = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
        const totalLateDays = attendance.filter(a => a.status === 'Late').length;
        const totalLeaveDays = leaves.filter(l => l.status === 'Approved').reduce((acc, curr) => acc + (curr.duration || 0), 0);
        
        const avgWorkHours = attendance.length > 0 
            ? attendance.reduce((acc, curr) => acc + (curr.workHours || 0), 0) / attendance.length 
            : 0;

        return {
            summary: {
                totalWorkedDays,
                totalLateDays,
                totalLeaveDays,
                avgWorkHours: avgWorkHours.toFixed(2)
            },
            recentAttendance: attendance.slice(0, 10),
            recentLeaves: leaves.slice(0, 5)
        };
    }

    async getTalentAcquisitionStats(tenantId: string) {
        const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
        const months = 6;
        const stats = [];

        for (let i = months - 1; i >= 0; i--) {
            const start = moment().subtract(i, 'months').startOf('month').toDate();
            const end = moment().subtract(i, 'months').endOf('month').toDate();

            const [hires, pipeline, interviews] = await Promise.all([
                User.countDocuments({ tenantId: tenantObjectId, createdAt: { $gte: start, $lte: end } }),
                Promise.resolve(Math.floor(Math.random() * 20) + 10), // Mocked for now as we don't have a Lead model
                Promise.resolve(Math.floor(Math.random() * 15) + 5)
            ]);

            stats.push({
                month: moment(start).format('MMM'),
                hires,
                pipeline,
                interviews
            });
        }
        return stats;
    }

    async getOperationalMetrics(tenantId: string) {
        const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
        
        // Detailed attendance and leave overlap
        const attendanceTrend = await Attendance.aggregate([
            { $match: { tenantId: tenantObjectId } },
            { $group: { 
                _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                avgWorkHours: { $avg: "$workHours" },
                presentCount: { $sum: 1 }
            }},
            { $sort: { "_id": 1 } },
            { $limit: 6 }
        ]);

        const leaveTrend = await LeaveRequest.aggregate([
            { $match: { tenantId: tenantObjectId, status: 'Approved' } },
            { $group: { 
                _id: { $dateToString: { format: "%Y-%m", date: "$startDate" } },
                totalDays: { $sum: "$duration" }
            }},
            { $sort: { "_id": 1 } },
            { $limit: 6 }
        ]);

        return {
            attendanceTrend: attendanceTrend.map(a => ({ month: a._id, hours: a.avgWorkHours.toFixed(1) })),
            leaveTrend: leaveTrend.map(l => ({ month: l._id, days: l.totalDays }))
        };
    }

    async getGrowthTrends(tenantId: string) {
        const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
        const months = 6;
        const trends = [];

        for (let i = months - 1; i >= 0; i--) {
            const start = moment().subtract(i, 'months').startOf('month').toDate();
            const end = moment().subtract(i, 'months').endOf('month').toDate();

            const [headcount, hiring, exits] = await Promise.all([
                User.countDocuments({ tenantId: tenantObjectId, createdAt: { $lte: end }, isActive: true }),
                User.countDocuments({ tenantId: tenantObjectId, createdAt: { $gte: start, $lte: end } }),
                User.countDocuments({ tenantId: tenantObjectId, isActive: false, updatedAt: { $gte: start, $lte: end } })
            ]);

            trends.push({
                month: moment(start).format('MMM'),
                headcount,
                hiring,
                exits
            });
        }
        return trends;
    }

    async getCapitalAllocation(tenantId: string) {
        const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
        const payrollData = await Payroll.aggregate([
            { $match: { tenantId: tenantObjectId } },
            { 
                $group: { 
                    _id: null, 
                    netSalary: { $sum: "$netSalary" },
                    deductions: { $sum: "$deductions" },
                    bonus: { $sum: "$bonus" }
                } 
            }
        ]);

        const data = payrollData[0] || { netSalary: 0, deductions: 0, bonus: 0 };
        
        return [
            { name: 'Net Salaries', value: data.netSalary, color: '#6366f1' },
            { name: 'Deductions', value: data.deductions, color: '#ef4444' },
            { name: 'Bonus/Incentives', value: data.bonus, color: '#10b981' },
            { name: 'Provident Fund', value: Math.floor(data.netSalary * 0.12), color: '#f59e0b' }
        ];
    }
}

