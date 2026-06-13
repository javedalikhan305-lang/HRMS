import { User, IUser } from '../models/user.model';
import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository<IUser> {
    constructor() {
        super(User);
    }

    async findByEmail(email: string, tenantId?: string): Promise<IUser | null> {
        const query: any = { email };
        if (tenantId) query.tenantId = tenantId;
        return await User.findOne(query).select("+password +refreshToken");
    }
}
