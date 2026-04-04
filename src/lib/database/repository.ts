/**
 * 通用数据仓库类
 * 提供CRUD操作的基础类
 */

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface QueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QueryResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class Repository<T extends BaseEntity> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  // 获取所有数据
  getAll(): T[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // 根据ID获取
  getById(id: string): T | null {
    const items = this.getAll();
    return items.find(item => item.id === id) || null;
  }

  // 条件查询
  find(predicate: (item: T) => boolean): T[] {
    return this.getAll().filter(predicate);
  }

  // 分页查询
  query(options: QueryOptions, predicate?: (item: T) => boolean): QueryResult<T> {
    let items = predicate ? this.find(predicate) : this.getAll();
    
    // 排序
    if (options.sortBy) {
      items.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[options.sortBy!];
        const bVal = (b as Record<string, unknown>)[options.sortBy!];
        if (aVal === undefined || aVal === null || bVal === undefined || bVal === null) return 0;
        const compare = String(aVal) < String(bVal) ? -1 : String(aVal) > String(bVal) ? 1 : 0;
        return options.sortOrder === 'desc' ? -compare : compare;
      });
    }

    // 分页
    const page = options.page || 1;
    const pageSize = options.pageSize || 20;
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const data = items.slice(start, start + pageSize);

    return { data, total, page, pageSize, totalPages };
  }

  // 创建
  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T {
    const newItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as T;

    const items = this.getAll();
    items.push(newItem);
    this.save(items);

    return newItem;
  }

  // 批量创建
  createMany(items: Array<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): T[] {
    const newItems: T[] = [];
    const allItems = this.getAll();

    items.forEach(item => {
      const newItem = {
        ...item,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as T;
      newItems.push(newItem);
      allItems.push(newItem);
    });

    this.save(allItems);
    return newItems;
  }

  // 更新
  update(id: string, updates: Partial<T>): T | null {
    const items = this.getAll();
    const index = items.findIndex(item => item.id === id);

    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    } as T;

    this.save(items);
    return items[index];
  }

  // 删除
  delete(id: string): boolean {
    const items = this.getAll();
    const index = items.findIndex(item => item.id === id);

    if (index === -1) return false;

    items.splice(index, 1);
    this.save(items);
    return true;
  }

  // 批量删除
  deleteMany(ids: string[]): number {
    const items = this.getAll();
    const initialLength = items.length;
    const filtered = items.filter(item => !ids.includes(item.id));
    
    this.save(filtered);
    return initialLength - filtered.length;
  }

  // 统计数量
  count(predicate?: (item: T) => boolean): number {
    return predicate ? this.find(predicate).length : this.getAll().length;
  }

  // 检查是否存在
  exists(id: string): boolean {
    return this.getById(id) !== null;
  }

  // 清空
  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.key, JSON.stringify([]));
    }
  }

  // 保存到存储
  private save(items: T[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.key, JSON.stringify(items));
    }
  }

  // 生成ID
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ==================== 具体仓库实例 ====================

import { DB_KEYS } from './index';
import type { Customer, Supplier } from '@/types/partner';
import type { Employee, Team } from '@/types/employee';
import type { Order } from '@/types/order';
import type { BOM } from '@/types/bom';

// 客户仓库
export const customerRepository = new Repository<Customer>(DB_KEYS.CUSTOMERS);

// 供应商仓库
export const supplierRepository = new Repository<Supplier>(DB_KEYS.SUPPLIERS);

// 员工仓库
export const employeeRepository = new Repository<Employee>(DB_KEYS.EMPLOYEES);

// 班组仓库
export const teamRepository = new Repository<Team>(DB_KEYS.TEAMS);

// 订单仓库
export const orderRepository = new Repository<Order>(DB_KEYS.ORDERS);

// BOM仓库
export const bomRepository = new Repository<BOM>(DB_KEYS.BOMS);

// ==================== 辅助函数 ====================

// 生成业务编号
export function generateBusinessNo(prefix: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${dateStr}${random}`;
}
