/**
 * ERP系统统一数据库服务层
 * 
 * 功能：
 * 1. 自动CRUD操作
 * 2. 自动编号生成
 * 3. 数据关联处理
 * 4. 自动同步到服务端
 */

import { TABLES, CODE_PREFIX, type BaseEntity, type Sequence } from './schema';

// ==================== 序列号管理 ====================

/**
 * 生成下一个序列号
 */
function getNextSequence(prefix: string): number {
  if (typeof window === 'undefined') return 1;
  
  const sequencesKey = TABLES.SEQUENCES;
  let sequences: Sequence[] = [];
  
  try {
    const stored = localStorage.getItem(sequencesKey);
    if (stored) {
      sequences = JSON.parse(stored);
    }
  } catch {
    sequences = [];
  }
  
  const existingSeq = sequences.find(s => s.prefix === prefix);
  
  if (existingSeq) {
    existingSeq.currentValue += 1;
    existingSeq.updatedAt = new Date().toISOString();
  } else {
    sequences.push({
      prefix,
      currentValue: 1,
      updatedAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem(sequencesKey, JSON.stringify(sequences));
  return existingSeq ? existingSeq.currentValue : 1;
}

/**
 * 生成业务编号
 * 格式：前缀 + 年月日 + 3位流水号
 */
export function generateCode(tableKey: string): string {
  const prefix = CODE_PREFIX[tableKey] || 'ERP';
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = getNextSequence(prefix);
  return `${prefix}${today}${seq.toString().padStart(3, '0')}`;
}

/**
 * 生成带年月的编号
 * 格式：前缀 + 年月 + 4位流水号
 */
export function generateMonthlyCode(tableKey: string): string {
  const prefix = CODE_PREFIX[tableKey] || 'ERP';
  const yearMonth = new Date().toISOString().slice(0, 7).replace(/-/g, '');
  const seq = getNextSequence(`${prefix}${yearMonth}`);
  return `${prefix}${yearMonth}${seq.toString().padStart(4, '0')}`;
}

/**
 * 生成简单ID
 */
export function generateId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== 数据库操作类 ====================

export class DatabaseService {
  private static instance: DatabaseService;
  private syncTimeout: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // ==================== 基础CRUD ====================

  /**
   * 获取所有数据
   */
  getAll<T extends BaseEntity>(tableName: string): T[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(tableName);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`[DB] 读取失败: ${tableName}`, error);
      return [];
    }
  }

  /**
   * 根据ID获取单条数据
   */
  getById<T extends BaseEntity>(tableName: string, id: string): T | null {
    const items = this.getAll<T>(tableName);
    return items.find(item => item.id === id) || null;
  }

  /**
   * 根据字段查询
   */
  getByField<T extends BaseEntity>(tableName: string, field: string, value: unknown): T[] {
    const items = this.getAll<T>(tableName);
    return items.filter(item => (item as Record<string, unknown>)[field] === value);
  }

  /**
   * 根据条件查询
   */
  query<T extends BaseEntity>(tableName: string, predicate: (item: T) => boolean): T[] {
    const items = this.getAll<T>(tableName);
    return items.filter(predicate);
  }

  /**
   * 新增数据
   */
  create<T extends BaseEntity>(tableName: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T {
    const items = this.getAll<T>(tableName);
    const now = new Date().toISOString();
    
    const newItem = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    } as T;
    
    items.push(newItem);
    this.save(tableName, items);
    
    return newItem;
  }

  /**
   * 批量新增
   */
  createMany<T extends BaseEntity>(tableName: string, dataList: Array<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): T[] {
    const items = this.getAll<T>(tableName);
    const now = new Date().toISOString();
    
    const newItems = dataList.map(data => ({
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    } as T));
    
    items.push(...newItems);
    this.save(tableName, items);
    
    return newItems;
  }

  /**
   * 更新数据
   */
  update<T extends BaseEntity>(tableName: string, id: string, data: Partial<T>): T | null {
    const items = this.getAll<T>(tableName);
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    items[index] = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    this.save(tableName, items);
    return items[index];
  }

  /**
   * 批量更新
   */
  updateMany<T extends BaseEntity>(tableName: string, updates: Array<{ id: string; data: Partial<T> }>): number {
    const items = this.getAll<T>(tableName);
    let count = 0;
    
    updates.forEach(({ id, data }) => {
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        items[index] = {
          ...items[index],
          ...data,
          updatedAt: new Date().toISOString()
        };
        count++;
      }
    });
    
    if (count > 0) {
      this.save(tableName, items);
    }
    
    return count;
  }

  /**
   * 删除数据
   */
  delete(tableName: string, id: string): boolean {
    const items = this.getAll(tableName);
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return false;
    
    items.splice(index, 1);
    this.save(tableName, items);
    return true;
  }

  /**
   * 批量删除
   */
  deleteMany(tableName: string, ids: string[]): number {
    const items = this.getAll(tableName);
    const initialLength = items.length;
    
    const remaining = items.filter(item => !ids.includes(item.id));
    
    if (remaining.length < initialLength) {
      this.save(tableName, remaining);
    }
    
    return initialLength - remaining.length;
  }

  /**
   * 根据条件删除
   */
  deleteBy<T extends BaseEntity>(tableName: string, predicate: (item: T) => boolean): number {
    const items = this.getAll<T>(tableName);
    const initialLength = items.length;
    
    const remaining = items.filter(item => !predicate(item));
    
    if (remaining.length < initialLength) {
      this.save(tableName, remaining);
    }
    
    return initialLength - remaining.length;
  }

  /**
   * 统计数量
   */
  count(tableName: string): number {
    return this.getAll(tableName).length;
  }

  /**
   * 根据条件统计
   */
  countBy<T extends BaseEntity>(tableName: string, predicate: (item: T) => boolean): number {
    return this.getAll<T>(tableName).filter(predicate).length;
  }

  /**
   * 检查是否存在
   */
  exists(tableName: string, id: string): boolean {
    return this.getById(tableName, id) !== null;
  }

  // ==================== 排序和分页 ====================

  /**
   * 分页查询
   */
  paginate<T extends BaseEntity>(
    tableName: string,
    options: {
      page?: number;
      pageSize?: number;
      sortBy?: keyof T;
      sortOrder?: 'asc' | 'desc';
      filter?: (item: T) => boolean;
    }
  ): { data: T[]; total: number; page: number; pageSize: number; totalPages: number } {
    const { page = 1, pageSize = 20, sortBy, sortOrder = 'desc', filter } = options;
    
    let items = this.getAll<T>(tableName);
    
    // 过滤
    if (filter) {
      items = items.filter(filter);
    }
    
    // 排序
    if (sortBy) {
      items.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    // 分页
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const data = items.slice(start, start + pageSize);
    
    return { data, total, page, pageSize, totalPages };
  }

  // ==================== 关联查询 ====================

  /**
   * 获取关联数据
   */
  getRelated<R extends BaseEntity>(
    tableName: string,
    id: string,
    relatedTable: string,
    foreignKey: string
  ): R[] {
    return this.getByField<R>(relatedTable, foreignKey, id);
  }

  /**
   * 填充关联字段
   */
  populate<T extends BaseEntity, R extends BaseEntity>(
    item: T,
    relatedTable: string,
    localField: keyof T,
    foreignField: string
  ): T & { [key: string]: R | null } {
    const localValue = item[localField];
    if (!localValue) return { ...item, [String(localField) + '_populated']: null };
    
    const related = this.getByField<R>(relatedTable, String(foreignField), localValue)[0];
    return { ...item, [String(localField) + '_populated']: related || null };
  }

  // ==================== 聚合统计 ====================

  /**
   * 求和
   */
  sum<T extends BaseEntity>(tableName: string, field: keyof T, filter?: (item: T) => boolean): number {
    let items = this.getAll<T>(tableName);
    if (filter) items = items.filter(filter);
    
    return items.reduce((sum, item) => {
      const val = item[field];
      return sum + (typeof val === 'number' ? val : 0);
    }, 0);
  }

  /**
   * 分组统计
   */
  groupBy<T extends BaseEntity>(
    tableName: string,
    groupField: keyof T,
    aggregateField: keyof T,
    aggregateType: 'sum' | 'count' | 'avg' | 'max' | 'min'
  ): Record<string, number> {
    const items = this.getAll<T>(tableName);
    const groups: Record<string, number[]> = {};
    
    items.forEach(item => {
      const key = String(item[groupField] || 'unknown');
      const val = item[aggregateField];
      
      if (!groups[key]) groups[key] = [];
      if (typeof val === 'number') groups[key].push(val);
    });
    
    const result: Record<string, number> = {};
    
    Object.entries(groups).forEach(([key, values]) => {
      switch (aggregateType) {
        case 'sum':
          result[key] = values.reduce((a, b) => a + b, 0);
          break;
        case 'count':
          result[key] = values.length;
          break;
        case 'avg':
          result[key] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
          break;
        case 'max':
          result[key] = Math.max(...values);
          break;
        case 'min':
          result[key] = Math.min(...values);
          break;
      }
    });
    
    return result;
  }

  // ==================== 数据持久化 ====================

  /**
   * 保存数据并触发同步
   */
  private save(tableName: string, data: unknown[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(tableName, JSON.stringify(data));
      this.triggerSync();
    } catch (error) {
      console.error(`[DB] 保存失败: ${tableName}`, error);
    }
  }

  /**
   * 触发同步（防抖）
   */
  private triggerSync(): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    
    this.syncTimeout = setTimeout(() => {
      import('./sync').then(({ debouncedSave }) => {
        debouncedSave();
      }).catch(() => {});
    }, 1000);
  }

  // ==================== 批量操作 ====================

  /**
   * 批量保存多个表的数据
   */
  saveMultiple(data: Record<string, unknown[]>): void {
    Object.entries(data).forEach(([tableName, items]) => {
      this.save(tableName, items);
    });
  }

  /**
   * 清空表数据
   */
  clear(tableName: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(tableName);
    this.triggerSync();
  }

  /**
   * 清空所有数据
   */
  clearAll(): void {
    if (typeof window === 'undefined') return;
    Object.values(TABLES).forEach(tableName => {
      localStorage.removeItem(tableName);
    });
    this.triggerSync();
  }

  // ==================== 导入导出 ====================

  /**
   * 导出所有数据
   */
  exportAll(): Record<string, unknown[]> {
    const result: Record<string, unknown[]> = {};
    
    Object.entries(TABLES).forEach(([key, tableName]) => {
      const data = this.getAll(tableName);
      if (data.length > 0) {
        result[tableName] = data;
      }
    });
    
    return result;
  }

  /**
   * 导入数据
   */
  importAll(data: Record<string, unknown[]>): { success: boolean; imported: number } {
    let imported = 0;
    
    try {
      Object.entries(data).forEach(([tableName, items]) => {
        if (Array.isArray(items)) {
          this.save(tableName, items);
          imported += items.length;
        }
      });
      
      return { success: true, imported };
    } catch (error) {
      console.error('[DB] 导入失败', error);
      return { success: false, imported };
    }
  }

  // ==================== 统计信息 ====================

  /**
   * 获取数据库统计
   */
  getStats(): { totalRecords: number; tableStats: Record<string, number>; totalSize: number } {
    let totalRecords = 0;
    let totalSize = 0;
    const tableStats: Record<string, number> = {};
    
    Object.entries(TABLES).forEach(([key, tableName]) => {
      const items = this.getAll(tableName);
      tableStats[key] = items.length;
      totalRecords += items.length;
      
      const stored = localStorage.getItem(tableName);
      if (stored) {
        totalSize += new Blob([stored]).size;
      }
    });
    
    return { totalRecords, tableStats, totalSize };
  }
}

// 导出单例
export const db = DatabaseService.getInstance();

// ==================== 便捷方法 ====================

// 为每个表创建便捷方法
export const customers = {
  getAll: () => db.getAll(TABLES.CUSTOMERS),
  getById: (id: string) => db.getById(TABLES.CUSTOMERS, id),
  create: (data: any) => ({ ...data, code: generateCode('CUSTOMERS'), ...db.create(TABLES.CUSTOMERS, data) }),
  update: (id: string, data: any) => db.update(TABLES.CUSTOMERS, id, data),
  delete: (id: string) => db.delete(TABLES.CUSTOMERS, id),
};

export const suppliers = {
  getAll: () => db.getAll(TABLES.SUPPLIERS),
  getById: (id: string) => db.getById(TABLES.SUPPLIERS, id),
  create: (data: any) => ({ ...data, code: generateCode('SUPPLIERS'), ...db.create(TABLES.SUPPLIERS, data) }),
  update: (id: string, data: any) => db.update(TABLES.SUPPLIERS, id, data),
  delete: (id: string) => db.delete(TABLES.SUPPLIERS, id),
};

export const employees = {
  getAll: () => db.getAll(TABLES.EMPLOYEES),
  getById: (id: string) => db.getById(TABLES.EMPLOYEES, id),
  create: (data: any) => ({ ...data, code: generateCode('EMPLOYEES'), ...db.create(TABLES.EMPLOYEES, data) }),
  update: (id: string, data: any) => db.update(TABLES.EMPLOYEES, id, data),
  delete: (id: string) => db.delete(TABLES.EMPLOYEES, id),
};

export const orders = {
  getAll: () => db.getAll(TABLES.ORDERS),
  getById: (id: string) => db.getById(TABLES.ORDERS, id),
  getByNo: (orderNo: string) => db.getByField(TABLES.ORDERS, 'orderNo', orderNo)[0],
  create: (data: any) => ({ ...data, orderNo: generateCode('ORDERS'), ...db.create(TABLES.ORDERS, data) }),
  update: (id: string, data: any) => db.update(TABLES.ORDERS, id, data),
  delete: (id: string) => db.delete(TABLES.ORDERS, id),
};

export const boms = {
  getAll: () => db.getAll(TABLES.BOMS),
  getById: (id: string) => db.getById(TABLES.BOMS, id),
  getByNo: (bomNo: string) => db.getByField(TABLES.BOMS, 'bomNo', bomNo)[0],
  create: (data: any) => ({ ...data, bomNo: generateCode('BOMS'), ...db.create(TABLES.BOMS, data) }),
  update: (id: string, data: any) => db.update(TABLES.BOMS, id, data),
  delete: (id: string) => db.delete(TABLES.BOMS, id),
};

export const cuttingTasks = {
  getAll: () => db.getAll(TABLES.CUTTING_TASKS),
  getById: (id: string) => db.getById(TABLES.CUTTING_TASKS, id),
  getByNo: (taskNo: string) => db.getByField(TABLES.CUTTING_TASKS, 'taskNo', taskNo)[0],
  create: (data: any) => ({ ...data, taskNo: generateCode('CUTTING_TASKS'), ...db.create(TABLES.CUTTING_TASKS, data) }),
  update: (id: string, data: any) => db.update(TABLES.CUTTING_TASKS, id, data),
  delete: (id: string) => db.delete(TABLES.CUTTING_TASKS, id),
};

export const workReports = {
  getAll: () => db.getAll(TABLES.WORK_REPORTS),
  getById: (id: string) => db.getById(TABLES.WORK_REPORTS, id),
  create: (data: any) => ({ ...data, reportNo: generateCode('WORK_REPORTS'), ...db.create(TABLES.WORK_REPORTS, data) }),
  update: (id: string, data: any) => db.update(TABLES.WORK_REPORTS, id, data),
  delete: (id: string) => db.delete(TABLES.WORK_REPORTS, id),
};

export const stockItems = {
  getAll: () => db.getAll(TABLES.STOCK_ITEMS),
  getById: (id: string) => db.getById(TABLES.STOCK_ITEMS, id),
  getByCode: (code: string) => db.getByField(TABLES.STOCK_ITEMS, 'materialCode', code),
  create: (data: any) => db.create(TABLES.STOCK_ITEMS, data),
  update: (id: string, data: any) => db.update(TABLES.STOCK_ITEMS, id, data),
  delete: (id: string) => db.delete(TABLES.STOCK_ITEMS, id),
};

export const receivables = {
  getAll: () => db.getAll(TABLES.RECEIVABLES),
  getById: (id: string) => db.getById(TABLES.RECEIVABLES, id),
  create: (data: any) => ({ ...data, receivableNo: generateCode('RECEIVABLES'), ...db.create(TABLES.RECEIVABLES, data) }),
  update: (id: string, data: any) => db.update(TABLES.RECEIVABLES, id, data),
  delete: (id: string) => db.delete(TABLES.RECEIVABLES, id),
};

export const payables = {
  getAll: () => db.getAll(TABLES.PAYABLES),
  getById: (id: string) => db.getById(TABLES.PAYABLES, id),
  create: (data: any) => ({ ...data, payableNo: generateCode('PAYABLES'), ...db.create(TABLES.PAYABLES, data) }),
  update: (id: string, data: any) => db.update(TABLES.PAYABLES, id, data),
  delete: (id: string) => db.delete(TABLES.PAYABLES, id),
};

export const systemLogs = {
  getAll: () => db.getAll(TABLES.LOGS),
  create: (data: any) => ({ ...data, logNo: generateCode('LOGS'), ...db.create(TABLES.LOGS, data) }),
};

// 导出所有表名和工具
export { TABLES } from './schema';
