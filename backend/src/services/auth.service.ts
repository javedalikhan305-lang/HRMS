import { UserRepository } from '../repositories/user.repository';
import { TenantRepository } from '../repositories/tenant.repository';
import { ApiError } from '../utils/ApiError';
import { UserRole } from '../models/user.model';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const userRepository = new UserRepository();
const tenantRepository = new TenantRepository();

export class AuthService {
    async registerTenant(tenantData: any) {
        const { name, adminEmail, password, firstName, lastName } = tenantData;

        // Check if tenant already exists
        const existingTenant = await tenantRepository.findByEmail(adminEmail);
        if (existingTenant) {
            throw new ApiError(400, "Tenant with this admin email already exists");
        }

        const session = await mongoose.startSession();
        session.startTransaction();
        console.log("Registration started for:", adminEmail);

        try {
            // 1. Create Tenant
            console.log("Creating tenant...");
            const tenant = await tenantRepository.create({
                name,
                adminEmail,
                isActive: true
            }, { session });
            console.log("Tenant created:", tenant._id);

            // 2. Create HR Admin User for this tenant
            console.log("Creating user...");
            const user = await userRepository.create({
                tenantId: tenant._id as mongoose.Types.ObjectId,
                email: adminEmail,
                password,
                firstName,
                lastName,
                role: UserRole.HR_ADMIN,
                isEmailVerified: true
            }, { session });
            console.log("User created:", user._id);

            await session.commitTransaction();
            session.endSession();
            console.log("Transaction committed successfully");

            return { tenant, user };
        } catch (error) {
            console.log("Registration transaction failed. Aborting...");
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async login(email: string, password: string) {
        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw new ApiError(401, "Invalid credentials");
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid credentials");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { user, accessToken, refreshToken };
    }

    async refreshAccessToken(incomingRefreshToken: string) {
        try {
            const decodedToken: any = jwt.verify(
                incomingRefreshToken,
                env.refreshTokenSecret
            );

            const user = await userRepository.findById(decodedToken?._id);

            if (!user) {
                throw new ApiError(401, "Invalid refresh token");
            }

            if (incomingRefreshToken !== user.refreshToken) {
                throw new ApiError(401, "Refresh token is expired or used");
            }

            const accessToken = user.generateAccessToken();
            const newRefreshToken = user.generateRefreshToken();

            user.refreshToken = newRefreshToken;
            await user.save({ validateBeforeSave: false });

            return { accessToken, refreshToken: newRefreshToken };
        } catch (error: any) {
            throw new ApiError(401, error?.message || "Invalid refresh token");
        }
    }
}
