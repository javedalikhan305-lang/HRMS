import { Router } from 'express';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { WorkflowService } from '../services/workflow.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { UserRole } from '../models/user.model';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles(UserRole.HR_ADMIN));

router.get('/', asyncHandler(async (req: any, res) => {
    const workflows = await WorkflowService.getAllWorkflows(req.user.tenantId);
    return res.status(200).json(new ApiResponse(200, workflows, "Workflows fetched"));
}));

router.post('/', asyncHandler(async (req: any, res) => {
    const workflow = await WorkflowService.createWorkflow(req.user.tenantId, req.body);
    return res.status(201).json(new ApiResponse(201, workflow, "Workflow created"));
}));

router.delete('/:id', asyncHandler(async (req: any, res) => {
    await WorkflowService.deleteWorkflow(req.user.tenantId, req.params.id);
    return res.status(200).json(new ApiResponse(200, {}, "Workflow deleted"));
}));

export default router;
