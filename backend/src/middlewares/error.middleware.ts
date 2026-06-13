import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let error = err;
    console.error("DEBUG ERROR:", err);

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || (error instanceof Error ? 400 : 500);
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, err?.errors || [], err.stack);
    }

    const response = {
        success: false,
        message: error.message,
        errors: error.errors,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };

    res.status(error.statusCode).json(response);
};
