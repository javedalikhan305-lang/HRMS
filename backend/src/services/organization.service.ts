import { Department, Designation, Shift } from '../models/organization.model';
import { ApiError } from '../utils/ApiError';
import mongoose from 'mongoose';

export class OrganizationService {
    async createDepartment(data: any, tenantId: string) {
        if (data.parentDeptId) {
            await this.checkCircularHierarchy(data.parentDeptId, null, tenantId);
        }
        return await Department.create({ ...data, tenantId });
    }

    async updateDepartment(id: string, data: any, tenantId: string) {
        if (data.parentDeptId) {
            if (data.parentDeptId.toString() === id.toString()) {
                throw new ApiError(400, "A department cannot be its own parent.");
            }
            await this.checkCircularHierarchy(data.parentDeptId, id, tenantId);
        }

        const dept = await Department.findOneAndUpdate(
            { _id: id, tenantId },
            data,
            { new: true }
        );

        if (!dept) throw new ApiError(404, "Department not found");
        return dept;
    }

    async deleteDepartment(id: string, tenantId: string) {
        const hasChildren = await Department.findOne({ parentDeptId: id, tenantId });
        if (hasChildren) {
            throw new ApiError(400, "Cannot delete department with sub-departments.");
        }
        const result = await Department.deleteOne({ _id: id, tenantId });
        if (result.deletedCount === 0) throw new ApiError(404, "Department not found");
        return true;
    }

    private async checkCircularHierarchy(parentId: string, currentDeptId: string | null, tenantId: string) {
        let tempParentId = parentId;
        while (tempParentId) {
            const parent = await Department.findOne({ _id: tempParentId, tenantId });
            if (!parent) break;
            if (currentDeptId && parent._id.toString() === currentDeptId) {
                throw new ApiError(400, "Circular hierarchy detected in departments.");
            }
            if (!parent.parentDeptId) break;
            tempParentId = parent.parentDeptId.toString();
        }
    }

    // Designation methods
    async createDesignation(data: any, tenantId: string) {
        return await Designation.create({ ...data, tenantId });
    }

    async updateDesignation(id: string, data: any, tenantId: string) {
        const designation = await Designation.findOneAndUpdate(
            { _id: id, tenantId },
            data,
            { new: true }
        );
        if (!designation) throw new ApiError(404, "Designation not found");
        return designation;
    }

    async deleteDesignation(id: string, tenantId: string) {
        const result = await Designation.deleteOne({ _id: id, tenantId });
        if (result.deletedCount === 0) throw new ApiError(404, "Designation not found");
        return true;
    }

    // Shift methods
    async createShift(data: any, tenantId: string) {
        return await Shift.create({ ...data, tenantId });
    }

    async updateShift(id: string, data: any, tenantId: string) {
        const shift = await Shift.findOneAndUpdate(
            { _id: id, tenantId },
            data,
            { new: true }
        );
        if (!shift) throw new ApiError(404, "Shift not found");
        return shift;
    }

    async deleteShift(id: string, tenantId: string) {
        const result = await Shift.deleteOne({ _id: id, tenantId });
        if (result.deletedCount === 0) throw new ApiError(404, "Shift not found");
        return true;
    }

    async getDepartments(tenantId: string) {
        return await Department.find({ tenantId, isActive: true }).populate('managerId', 'firstName lastName avatar');
    }

    async getDesignations(tenantId: string) {
        return await Designation.find({ tenantId, isActive: true });
    }

    async getShifts(tenantId: string) {
        return await Shift.find({ tenantId });
    }

    async getOrgChartData(tenantId: string) {
        const departments = await Department.find({ tenantId, isActive: true })
            .populate('managerId', 'firstName lastName avatar role')
            .lean();

        // Build hierarchy
        const deptMap: any = {};
        const roots: any[] = [];

        departments.forEach((dept: any) => {
            dept.children = [];
            deptMap[dept._id.toString()] = dept;
        });

        departments.forEach((dept: any) => {
            if (dept.parentDeptId && deptMap[dept.parentDeptId.toString()]) {
                deptMap[dept.parentDeptId.toString()].children.push(dept);
            } else {
                roots.push(dept);
            }
        });

        return roots;
    }

    async getOrgMetrics(tenantId: string) {
        const [deptCount, designationCount, shiftCount] = await Promise.all([
            Department.countDocuments({ tenantId }),
            Designation.countDocuments({ tenantId }),
            Shift.countDocuments({ tenantId })
        ]);
        return { deptCount, designationCount, shiftCount };
    }
}
