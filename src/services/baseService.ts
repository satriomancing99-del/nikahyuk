import { cloudflareApi } from '../lib/cloudflare-api';

export class BaseService<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async getAll(filter?: Record<string, any>): Promise<T[]> {
    const d1Filter: Record<string, string> = {};
    if (filter) {
      Object.entries(filter).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          d1Filter[k] = String(v);
        }
      });
    }
    return await cloudflareApi.getTableRows<T>(this.tableName, d1Filter);
  }

  async getById(id: string): Promise<T> {
    return await cloudflareApi.getTableRowById<T>(this.tableName, id);
  }

  async create(payload: Partial<T>): Promise<T> {
    return await cloudflareApi.createTableRow<T>(this.tableName, payload);
  }

  async update(id: string, payload: Partial<T>): Promise<T> {
    return await cloudflareApi.updateTableRow<T>(this.tableName, id, payload);
  }

  async delete(id: string): Promise<boolean> {
    return await cloudflareApi.deleteTableRow(this.tableName, id);
  }

  async deleteMany(filter: Record<string, any>): Promise<boolean> {
    const d1Filter: Record<string, string> = {};
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        d1Filter[k] = String(v);
      }
    });
    return await cloudflareApi.deleteTableRows(this.tableName, d1Filter);
  }
}
