import { User, UserRole } from '../models/user.model';
import { Employee } from '../models/employee.model';
import { ApiError } from '../utils/ApiError';
import mongoose from 'mongoose';

export class EmployeeService {
    async addEmployee(userData: any, employeeData: any, tenantId: string) {
        try {
            if (!userData.email || !userData.firstName || !userData.lastName) {
                throw new ApiError(400, "Incomplete user profile data provided");
            }

            const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
            if (existingUser) {
                throw new ApiError(400, "A user with this email already exists in the system");
            }

            // Find the highest sequence number for this year to avoid duplicates
            const year = new Date().getFullYear();
            const yearPrefix = `EMP-${year}-`;
            
            const lastUser = await User.findOne({ 
                tenantId, 
                employeeId: new RegExp(`^${yearPrefix}`) 
            }).sort({ employeeId: -1 });

            let nextSequence = 1;
            if (lastUser && lastUser.employeeId) {
                const lastSequence = parseInt(lastUser.employeeId.split('-')[2]);
                if (!isNaN(lastSequence)) {
                    nextSequence = lastSequence + 1;
                }
            }

            const sequence = String(nextSequence).padStart(4, '0');
            const generatedEmployeeId = `${yearPrefix}${sequence}`;

            const newUser = new User({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email.toLowerCase(),
                role: userData.role || UserRole.EMPLOYEE,
                tenantId: tenantId,
                password: userData.password || 'Welcome@123',
                isEmailVerified: true,
                isActive: true,
                employeeId: generatedEmployeeId
            });

            await newUser.save();

            const newEmployee = new Employee({
                userId: newUser._id,
                tenantId: tenantId,
                joiningDate: employeeData.joiningDate || new Date(),
                phone: employeeData.phone || '',
                department: employeeData.department || undefined,
                designation: employeeData.designation || undefined,
                gender: employeeData.gender || 'Other',
                maritalStatus: employeeData.maritalStatus || 'Single'
            });

            await newEmployee.save();

            return { 
                user: {
                    _id: newUser._id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    role: newUser.role,
                    employeeId: newUser.employeeId
                }, 
                employee: newEmployee 
            };
        } catch (error: any) {
            console.error("CRITICAL: addEmployee failed ->", error);
            if (error.code === 11000) {
                throw new ApiError(400, "Duplicate entry detected: " + JSON.stringify(error.keyValue));
            }
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, error.message || "Internal server failure during employee registration");
        }
    }

    async getEmployeeProfile(userId: string, tenantId: string) {
        let employee = await Employee.findOne({ userId, tenantId })
            .populate('userId', 'firstName lastName email role avatar isActive employeeId')
            .populate('department', 'name')
            .populate('designation', 'title')
            .populate('manager', 'firstName lastName');

        if (!employee) {
            const user = await User.findOne({ _id: userId, tenantId });
            if (!user) {
                throw new ApiError(404, "User not found");
            }
            return {
                userId: user,
                tenantId: user.tenantId,
                department: null,
                designation: null,
                joiningDate: user.createdAt ?? new Date(),
                documents: [],
                bankDetails: {},
                address: {}
            };
        }

        return employee;
    }

    async updateEmployeeProfile(userId: string, updateData: any, tenantId: string) {
        const flattenedData: any = {};
        for (const key in updateData) {
            if (typeof updateData[key] === 'object' && updateData[key] !== null && !Array.isArray(updateData[key]) && !(updateData[key] instanceof Date)) {
                for (const subKey in updateData[key]) {
                    flattenedData[`${key}.${subKey}`] = updateData[key][subKey];
                }
            } else {
                flattenedData[key] = updateData[key];
            }
        }

        const employee = await Employee.findOneAndUpdate(
            { userId: new mongoose.Types.ObjectId(userId), tenantId: new mongoose.Types.ObjectId(tenantId) },
            { $set: flattenedData },
            { new: true, upsert: true, runValidators: true }
        );

        return employee;
    }

    async getAllEmployees(tenantId: string, filter: any = {}) {
        // We want ALL users in the tenant (active + inactive), including Admins/HR, join with Employee data if available
        const users = await User.aggregate([
            { $match: { tenantId: new mongoose.Types.ObjectId(tenantId) } },
            {
                $lookup: {
                    from: 'employees',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'employeeProfile'
                }
            },
            { $unwind: { path: '$employeeProfile', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'employeeProfile.department',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            {
                $lookup: {
                    from: 'designations',
                    localField: 'employeeProfile.designation',
                    foreignField: '_id',
                    as: 'designation'
                }
            },
            { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$designation', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: { $ifNull: ['$employeeProfile._id', '$_id'] },
                    userId: {
                        _id: '$_id',
                        firstName: '$firstName',
                        lastName: '$lastName',
                        email: '$email',
                        role: '$role',
                        employeeId: '$employeeId',
                        avatar: '$avatar',
                        isActive: '$isActive'
                    },
                    department: '$department',
                    designation: '$designation',
                    phone: '$employeeProfile.phone',
                    joiningDate: '$employeeProfile.joiningDate'
                }
            }
        ]);
        return users;
    }
}
