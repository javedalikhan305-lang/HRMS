import { Response } from 'express';
import { DocumentService } from '../services/document.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/auth.middleware';

const documentService = new DocumentService();

export const uploadDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error("Unauthorized");
    
    // For HR/Admin uploading for another user
    const targetUserId = req.body.userId || req.user._id;
    
    const document = await documentService.uploadDocument(
        targetUserId, 
        req.user.tenantId.toString(), 
        req.file, 
        req.body
    );
    
    return res.status(201).json(new ApiResponse(201, document, "Document uploaded successfully"));
});

export const getMyDocuments = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error("Unauthorized");
    
    const documents = await documentService.getDocuments(req.user.tenantId.toString(), { 
        userId: req.user._id,
        ...req.query
    });
    
    return res.status(200).json(new ApiResponse(200, documents, "Documents fetched successfully"));
});

export const getAllDocuments = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error("Unauthorized");
    
    const documents = await documentService.getDocuments(req.user.tenantId.toString(), req.query);
    
    return res.status(200).json(new ApiResponse(200, documents, "All documents fetched successfully"));
});

export const verifyDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error("Unauthorized");
    const { status, remarks } = req.body;
    
    const document = await documentService.verifyDocument(
        req.params.id as string, 
        req.user.tenantId.toString(), 
        req.user._id.toString(), 
        status, 
        remarks
    );
    
    return res.status(200).json(new ApiResponse(200, document, "Document status updated"));
});

export const deleteDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error("Unauthorized");
    
    await documentService.deleteDocument(req.params.id as string, req.user.tenantId.toString());
    
    return res.status(200).json(new ApiResponse(200, null, "Document deleted successfully"));
});
