import { Model, Document, QueryOptions } from 'mongoose';

type FilterQuery<T> = any;
type UpdateQuery<T> = any;

export class BaseRepository<T extends Document> {
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async create(data: Partial<T>, options: QueryOptions = {}): Promise<T> {
        const docs = await (this.model as any).create([data], options);
        return docs[0];
    }

    async findById(id: string, tenantId?: string, options: QueryOptions = {}): Promise<T | null> {
        const query: FilterQuery<T> = { _id: id } as any;
        if (tenantId) query.tenantId = tenantId;
        return await this.model.findOne(query, null, options);
    }

    async findOne(filter: FilterQuery<T>, options: QueryOptions = {}): Promise<T | null> {
        return await this.model.findOne(filter, null, options);
    }

    async find(filter: FilterQuery<T>, options: QueryOptions = {}): Promise<T[]> {
        return await this.model.find(filter, null, options);
    }

    async update(id: string, updateData: UpdateQuery<T>, tenantId?: string, options: QueryOptions = {}): Promise<T | null> {
        const query: FilterQuery<T> = { _id: id } as any;
        if (tenantId) query.tenantId = tenantId;
        return await this.model.findOneAndUpdate(query, updateData, { ...options, new: true });
    }

    async delete(id: string, tenantId?: string, options: QueryOptions = {}): Promise<T | null> {
        const query: FilterQuery<T> = { _id: id } as any;
        if (tenantId) query.tenantId = tenantId;
        return await this.model.findOneAndDelete(query, options);
    }
}
