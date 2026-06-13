import { DocumentModel, DocumentStatus } from '../models/document.model';
import { ApiError } from '../utils/ApiError';
import { cloudinary } from '../config/cloudinary';
import mongoose from 'mongoose';

export class DocumentService {
    async uploadDocument(userId: string, tenantId: string, file: any, documentData: any) {
        if (!file) throw new ApiError(400, "File is required");

        const document = new DocumentModel({
            userId: new mongoose.Types.ObjectId(userId),
            tenantId: new mongoose.Types.ObjectId(tenantId),
            name: documentData.name || file.originalname,
            description: documentData.description,
            category: documentData.category,
            documentType: documentData.documentType,
            url: file.path,
            cloudinaryId: file.filename,
            fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
            fileType: file.mimetype.split('/')[1].toUpperCase(),
            expiryDate: documentData.expiryDate ? new Date(documentData.expiryDate) : undefined
        });

        await document.save();
        return document;
    }

    async getDocuments(tenantId: string, filter: any) {
        const query: any = { tenantId: new mongoose.Types.ObjectId(tenantId) };
        
        if (filter.userId) query.userId = new mongoose.Types.ObjectId(filter.userId);
        if (filter.category && filter.category !== 'All') query.category = filter.category;
        if (filter.status) query.status = filter.status;
        if (filter.search) {
            query.name = { $regex: filter.search, $options: 'i' };
        }

        return await DocumentModel.find(query)
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 });
    }

    async verifyDocument(documentId: string, tenantId: string, verifiedBy: string, status: DocumentStatus, remarks?: string) {
        const document = await DocumentModel.findOneAndUpdate(
            { _id: documentId, tenantId: new mongoose.Types.ObjectId(tenantId) },
            { 
                status, 
                verifiedBy: new mongoose.Types.ObjectId(verifiedBy), 
                verificationRemarks: remarks 
            },
            { new: true }
        );

        if (!document) throw new ApiError(404, "Document not found");
        return document;
    }

    async deleteDocument(documentId: string, tenantId: string) {
        const document = await DocumentModel.findOne({ _id: documentId, tenantId: new mongoose.Types.ObjectId(tenantId) });
        if (!document) throw new ApiError(404, "Document not found");

        // Delete from Cloudinary
        try {
            await cloudinary.uploader.destroy(document.cloudinaryId);
        } catch (error) {
            console.error("Cloudinary deletion failed:", error);
        }

        await DocumentModel.deleteOne({ _id: documentId });
        return { message: "Document deleted successfully" };
    }
}
