import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { cookieOptions } from '../config/env';

const authService = new AuthService();

export const registerTenant = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.registerTenant(req.body);
    return res.status(201).json(
        new ApiResponse(201, result, "Tenant registered successfully")
    );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const { user, accessToken, refreshToken } = await authService.login(email, password);

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, { user, accessToken, refreshToken }, "Logged in successfully")
        );
});

export const logout = asyncHandler(async (req: any, res: Response) => {
    const user = req.user;
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    const { accessToken, refreshToken } = await authService.refreshAccessToken(incomingRefreshToken);

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed")
        );
});
