import { Request, Response } from 'express';
import { GroqService } from '../services/groq.service';
import { IntentService } from '../services/intent.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

const groqService = new GroqService();
const intentService = new IntentService();

export const chatWithAI = asyncHandler(async (req: any, res: Response) => {
    const { message } = req.body;
    const tenantId = req.user.tenantId;

    if (!message) {
        throw new ApiError(400, "Message is required");
    }

    // 1. Detect Intent using Groq
    const intentData = await groqService.detectIntent(message);
    
    // 2. Execute DB Query based on Intent
    const result = await intentService.executeIntent(intentData, tenantId);

    return res.status(200).json(
        new ApiResponse(200, result, "AI response generated successfully")
    );
});
