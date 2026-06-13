import { Payroll, PayrollStatus, IPayroll } from '../models/payroll.model';
import { Employee } from '../models/employee.model';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError';

export class PayrollService {
    static async generateMonthlyPayroll(tenantId: string, month: number, year: number) {
        // Fetch all active employees for this tenant
        const employees = await Employee.find({ tenantId, isActive: true }).populate('userId');

        const payrolls: IPayroll[] = [];

        for (const emp of employees) {
            const baseSalary = emp.salary?.base || 0;
            const bonuses = emp.salary?.allowances?.reduce((sum, item) => sum + item.amount, 0) || 0;
            const deductions = emp.salary?.deductions?.reduce((sum, item) => sum + item.amount, 0) || 0;

            const totalEarnings = baseSalary + bonuses;
            const totalDeductions = deductions;
            const netSalary = totalEarnings - totalDeductions;

            // Check if payroll already exists
            const existingPayroll = await Payroll.findOne({
                tenantId,
                userId: emp.userId,
                month,
                year
            });

            if (existingPayroll) continue;

            const payroll = new Payroll({
                tenantId,
                userId: emp.userId,
                month,
                year,
                baseSalary,
                bonuses,
                deductions: totalDeductions,
                totalEarnings,
                totalDeductions,
                netSalary,
                status: PayrollStatus.PENDING
            });

            payrolls.push(await payroll.save());
        }

        return payrolls;
    }

    static async getEmployeePayrolls(userId: string, tenantId: string) {
        return await Payroll.find({ userId, tenantId }).sort({ year: -1, month: -1 });
    }

    static async getPayrollById(payrollId: string, tenantId: string) {
        const payroll = await Payroll.findOne({ _id: payrollId, tenantId }).populate('userId');
        if (!payroll) {
            throw new ApiError(404, 'Payroll record not found');
        }
        return payroll;
    }

    static async updatePayrollStatus(payrollId: string, tenantId: string, status: PayrollStatus) {
        const payroll = await Payroll.findOneAndUpdate(
            { _id: payrollId, tenantId },
            { 
                status, 
                paidAt: status === PayrollStatus.PAID ? new Date() : undefined 
            },
            { new: true }
        );

        if (!payroll) {
            throw new ApiError(404, 'Payroll record not found');
        }

        return payroll;
    }
}
