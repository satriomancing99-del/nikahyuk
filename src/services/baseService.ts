import { supabase } from '../lib/supabase';
import { cloudflareApi } from '../lib/cloudflare-api';

const USE_D1 = import.meta.env.VITE_USE_D1_AUTH === 'true';

export class BaseService<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async getAll(): Promise<T[]> {
    if (USE_D1) {
      return await cloudflareApi.getTableRows<T>(this.tableName);
    }
    const { data, error } = await supabase.from(this.tableName).select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as T[];
  }

  async getById(id: string): Promise<T> {
    if (USE_D1) {
      return await cloudflareApi.getTableRowById<T>(this.tableName, id);
    }
    const { data, error } = await supabase.from(this.tableName).select('*').eq('id', id).single();
    if (error) throw error;
    return data as T;
  }

  async create(payload: Partial<T>): Promise<T> {
    if (USE_D1) {
      return await cloudflareApi.createTableRow<T>(this.tableName, payload);
    }
    const { data, error } = await supabase.from(this.tableName).insert(payload as any).select().single();
    if (error) throw error;
    return data as T;
  }

  async update(id: string, payload: Partial<T>): Promise<T> {
    if (USE_D1) {
      return await cloudflareApi.updateTableRow<T>(this.tableName, id, payload);
    }
    const { data, error } = await supabase.from(this.tableName).update(payload as any).eq('id', id).select().single();
    if (error) throw error;
    return data as T;
  }

  async delete(id: string): Promise<boolean> {
    if (USE_D1) {
      return await cloudflareApi.deleteTableRow(this.tableName, id);
    }
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}
