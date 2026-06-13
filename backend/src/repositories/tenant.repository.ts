import { Tenant, ITenant } from '../models/tenant.model';
import { BaseRepository } from './base.repository';

export class TenantRepository extends BaseRepository<ITenant> {
    constructor() {
        super(Tenant);
    }

    async findByEmail(adminEmail: string): Promise<ITenant | null> {
        return await Tenant.findOne({ adminEmail });
    }
}
