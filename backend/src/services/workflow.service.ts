import { Workflow, IWorkflow } from '../models/workflow.model';
import { ApiError } from '../utils/ApiError';
import mongoose from 'mongoose';

export class WorkflowService {
    static async getWorkflowForTrigger(tenantId: string, trigger: IWorkflow['trigger']) {
        return await Workflow.findOne({ 
            tenantId: new mongoose.Types.ObjectId(tenantId), 
            trigger, 
            isActive: true 
        });
    }

    static async createWorkflow(tenantId: string, data: Partial<IWorkflow>) {
        if (!data.trigger) {
            throw new ApiError(400, "Trigger event is required");
        }
        const existing = await Workflow.findOne({ 
            tenantId: new mongoose.Types.ObjectId(tenantId), 
            trigger: data.trigger as any
        });
        if (existing) {
            throw new ApiError(400, `A workflow for ${data.trigger} already exists. Please edit the existing one.`);
        }
        return await Workflow.create({ ...data, tenantId: new mongoose.Types.ObjectId(tenantId) });
    }

    static async getAllWorkflows(tenantId: string) {
        return await Workflow.find({ 
            tenantId: new mongoose.Types.ObjectId(tenantId) 
        }).sort({ createdAt: -1 });
    }

    static async deleteWorkflow(tenantId: string, id: string) {
        return await Workflow.deleteOne({ 
            _id: new mongoose.Types.ObjectId(id), 
            tenantId: new mongoose.Types.ObjectId(tenantId) 
        });
    }
}
