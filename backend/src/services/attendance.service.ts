import { Attendance } from '../models/attendance.model';
import { Shift } from '../models/organization.model';
import { Employee } from '../models/employee.model';
import { ApiError } from '../utils/ApiError';
import moment from 'moment';

export class AttendanceService {
    async punchIn(userId: string, tenantId: string, punchData: any) {
        const today = moment().startOf('day').toDate();
        const employee = await Employee.findOne({ userId, tenantId }).populate('shift');
        if (!employee) throw new ApiError(404, "Employee profile not found. Please ensure profile is complete.");

        let status: any = 'Present';
        const now = moment();
        const shift = employee.shift as any;
        const shiftStartTimeString = shift?.startTime || "09:00";
        const gracePeriod = shift?.gracePeriod || 15;
        const shiftStart = moment(shiftStartTimeString, "HH:mm");
        const graceTime = shiftStart.clone().add(gracePeriod, 'minutes');

        if (now.isAfter(graceTime)) {
            status = 'Late';
        }

        let locationObj = {};
        if (typeof punchData.location === 'string') {
            locationObj = { address: punchData.location };
        } else {
            locationObj = punchData.location;
        }

        const attendance = await Attendance.findOneAndUpdate(
            { userId, date: today, tenantId },
            {
                punchIn: new Date(),
                status,
                location: locationObj,
                ipAddress: punchData.ipAddress || 'Unknown',
                tenantId
            },
            { upsert: true, new: true }
        );

        return attendance;
    }

    async punchOut(userId: string, tenantId: string, punchData: any) {
        const today = moment().startOf('day').toDate();
        const attendance = await Attendance.findOne({ userId, date: today, tenantId });
        if (!attendance || !attendance.punchIn) {
            throw new ApiError(400, "No active check-in session found for today. Please punch-in first.");
        }

        const punchOutTime = new Date();
        const diffMs = punchOutTime.getTime() - attendance.punchIn.getTime();
        const workHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

        attendance.punchOut = punchOutTime;
        attendance.workHours = workHours;
        
        if (workHours < 4 && workHours > 0) {
            attendance.status = 'Half Day';
        } else if (workHours >= 4 && attendance.status === 'Half Day') {
             attendance.status = 'Present';
        }

        await attendance.save();
        return attendance;
    }

    async getAttendanceHistory(tenantId: string, filter: any = {}) {
        const query: any = { tenantId };
        if (filter.userId) query.userId = filter.userId;
        if (filter.month && filter.year) {
            const startOfMonth = moment([filter.year, filter.month - 1]).startOf('month').toDate();
            const endOfMonth = moment([filter.year, filter.month - 1]).endOf('month').toDate();
            query.date = { $gte: startOfMonth, $lte: endOfMonth };
        }
        return await Attendance.find(query)
            .populate('userId', 'firstName lastName avatar')
            .sort({ date: -1 });
    }

    async getMemberAttendance(userId: string, tenantId: string) {
        return await Attendance.find({ userId, tenantId }).sort({ date: -1 }).limit(30);
    }

    async markManualAttendance(tenantId: string, data: any) {
        const { userId, date, status, punchIn, punchOut } = data;
        const attendanceDate = moment(date).startOf('day').toDate();
        const punchInDate = punchIn ? new Date(`${date}T${punchIn}`) : undefined;
        const punchOutDate = punchOut ? new Date(`${date}T${punchOut}`) : undefined;
        
        let workHours = 0;
        if (punchInDate && punchOutDate) {
            const diffMs = punchOutDate.getTime() - punchInDate.getTime();
            workHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
        }

        const attendance = await Attendance.findOneAndUpdate(
            { userId, date: attendanceDate, tenantId },
            {
                status,
                punchIn: punchInDate,
                punchOut: punchOutDate,
                workHours: workHours || undefined,
                location: { address: 'Manual Entry' },
                tenantId
            },
            { upsert: true, new: true }
        );

        return attendance;
    }

    async getTodayAttendance(tenantId: string) {
        const today = moment().startOf('day').toDate();
        return await Attendance.find({ 
            tenantId, 
            date: today 
        }).select('userId status punchIn punchOut workHours');
    }
}
