/**
 * ERP系统统一数据库管理模块
 * 
 * 功能：
 * 1. 统一的数据存储和读取
 * 2. 数据导入导出
 * 3. 数据验证
 * 4. 数据迁移
 */

// 加载环境变量
if (typeof window === 'undefined') {
  import('dotenv').then(dotenv => {
    dotenv.config();
  });
}

// ==================== 数据库存储键 ====================
export const DB_KEYS = {
  // 基础资料
  CUSTOMERS: 'erp_customers',
  SUPPLIERS: 'erp_suppliers',
  EMPLOYEES: 'erp_employees',
  TEAMS: 'erp_teams',
  USERS: 'erp_users',
  ROLES: 'erp_roles',
  PRODUCTS: 'erp_products',
  
  // 订单相关
  ORDERS: 'erp_orders',
  ORDER_PROGRESS: 'erp_order_progress',
  SAMPLES: 'erp_samples',
  
  // 生产相关
  BOMS: 'erp_boms',
  MATERIALS: 'erp_materials',
  PROCESSES: 'erp_processes',
  PROCESS_ROUTES: 'erp_process_routes',
  CUTTING_TASKS: 'erp_cutting_tasks',
  BUNDLES: 'erp_bundles',
  WORK_REPORTS: 'erp_work_reports',
  TAIL_TASKS: 'erp_tail_tasks',
  SCHEDULES: 'erp_schedules',
  
  // 库存相关
  STOCK_ITEMS: 'erp_stock_items',
  STOCK_IN: 'erp_stock_in',
  STOCK_OUT: 'erp_stock_out',
  STOCK_TRANSFERS: 'erp_stock_transfers',
  STOCK_CHECKS: 'erp_stock_checks',
  
  // 质量相关
  QC_RECORDS: 'erp_qc_records',
  REWORK_RECORDS: 'erp_rework_records',
  SCRAP_RECORDS: 'erp_scrap_records',
  
  // 财务相关
  RECEIVABLES: 'erp_receivables',
  PAYABLES: 'erp_payables',
  PAYMENTS: 'erp_payments',
  RECEIPTS: 'erp_receipts',
  
  // 钱包管理
  WALLET_FLOW: 'erp_wallet_flow',
  ADVANCE_LOG: 'erp_advance_log',
  REIMBURSE: 'erp_reimburse',
  RISK_EXCEPTIONS: 'erp_risk_exceptions',
  
  // 计件工资
  PIECE_RATE_RECORDS: 'erp_piece_rate_records',
  PAY_SLIPS: 'erp_pay_slips',
  SALARY_REPORTS: 'erp_salary_reports',
  
  // 发货相关
  DELIVERIES: 'erp_deliveries',
  PACKING_BOXES: 'erp_packing_boxes',
  
  // 外协相关
  OUTSOURCING: 'erp_outsourcing',
  
  // 系统相关
  SETTINGS: 'erp_settings',
  LOGS: 'erp_logs',
  AUDIT_LOGS: 'erp_audit_logs',
  
  // 初始化标记
  INITIALIZED: 'erp_db_initialized',
  VERSION: 'erp_db_version',
} as const;

// ==================== 数据库版本 ====================
export const DB_VERSION = '2.0.0';

// ==================== 环境配置 ====================
export const CONFIG = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'erp_secret_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  appName: process.env.APP_NAME || '服装生产ERP系统',
  appVersion: process.env.APP_VERSION || '1.0.0',
  uploadMaxSize: process.env.UPLOAD_MAX_SIZE || '5mb',
  uploadAllowedTypes: process.env.UPLOAD_ALLOWED_TYPES?.split(',') || ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'],
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  rateLimitWindow: process.env.RATE_LIMIT_WINDOW || '60s',
  backupInterval: process.env.BACKUP_INTERVAL || '24h',
  backupRetention: process.env.BACKUP_RETENTION || '7d',
};

// ==================== 导出数据结构 ====================
export interface ExportData {
  version: string;
  exportTime: string;
  appVersion: string;
  modules: {
    basic: {
      customers: unknown[];
      suppliers: unknown[];
      employees: unknown[];
      teams: unknown[];
      users: unknown[];
      roles: unknown[];
    };
    orders: {
      orders: unknown[];
      samples: unknown[];
    };
    production: {
      boms: unknown[];
      materials: unknown[];
      processes: unknown[];
      processRoutes: unknown[];
      cuttingTasks: unknown[];
      bundles: unknown[];
      workReports: unknown[];
      tailTasks: unknown[];
      schedules: unknown[];
    };
    inventory: {
      stockItems: unknown[];
      stockIn: unknown[];
      stockOut: unknown[];
      transfers: unknown[];
      checks: unknown[];
    };
    quality: {
      qcRecords: unknown[];
      reworkRecords: unknown[];
      scrapRecords: unknown[];
    };
    finance: {
      receivables: unknown[];
      payables: unknown[];
      payments: unknown[];
      receipts: unknown[];
    };
    wallet: {
      walletFlow: unknown[];
      advanceLogs: unknown[];
      reimburses: unknown[];
      riskExceptions: unknown[];
    };
    delivery: {
      deliveries: unknown[];
      packingBoxes: unknown[];
    };
    outsource: {
      outsourcing: unknown[];
    };
    system: {
      settings: unknown;
      auditLogs: unknown[];
    };
  };
  statistics: {
    totalRecords: number;
    moduleCounts: Record<string, number>;
  };
}

// ==================== 数据库操作类 ====================
class Database {
  private isClient = typeof window !== 'undefined';
  private syncEnabled = true; // 是否启用自动同步

  // 读取数据
  get<T>(key: string): T | null {
    if (!this.isClient) return null;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`[Database] 读取失败: ${key}`, error);
      return null;
    }
  }

  // 写入数据
  set<T>(key: string, value: T): boolean {
    if (!this.isClient) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // 触发自动同步到服务端
      this.triggerSync();
      return true;
    } catch (error) {
      console.error(`[Database] 写入失败: ${key}`, error);
      return false;
    }
  }

  // 删除数据
  remove(key: string): boolean {
    if (!this.isClient) return false;
    try {
      localStorage.removeItem(key);
      // 触发自动同步到服务端
      this.triggerSync();
      return true;
    } catch (error) {
      console.error(`[Database] 删除失败: ${key}`, error);
      return false;
    }
  }

  // 触发同步（防抖）
  private syncTimeout: NodeJS.Timeout | null = null;
  private triggerSync(): void {
    if (!this.syncEnabled || !this.isClient) return;
    
    // 动态导入同步模块，避免循环依赖
    import('./sync').then(({ debouncedSave }) => {
      debouncedSave();
    }).catch(() => {
      // 忽略同步错误
    });
  }

  // 禁用/启用自动同步
  setSyncEnabled(enabled: boolean): void {
    this.syncEnabled = enabled;
  }

  // 批量读取
  getMultiple<T>(keys: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {};
    keys.forEach(key => {
      result[key] = this.get<T>(key);
    });
    return result;
  }

  // 批量写入
  setMultiple(data: Record<string, unknown>): boolean {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value);
    });
    return true;
  }

  // 清空所有数据
  clearAll(): void {
    if (!this.isClient) return;
    Object.values(DB_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // 导出所有数据
  exportAll(): ExportData {
    const exportData: ExportData = {
      version: DB_VERSION,
      exportTime: new Date().toISOString(),
      appVersion: '1.0.0',
      modules: {
        basic: {
          customers: this.get(DB_KEYS.CUSTOMERS) || [],
          suppliers: this.get(DB_KEYS.SUPPLIERS) || [],
          employees: this.get(DB_KEYS.EMPLOYEES) || [],
          teams: this.get(DB_KEYS.TEAMS) || [],
          users: this.get(DB_KEYS.USERS) || [],
          roles: this.get(DB_KEYS.ROLES) || [],
        },
        orders: {
          orders: this.get(DB_KEYS.ORDERS) || [],
          samples: this.get(DB_KEYS.SAMPLES) || [],
        },
        production: {
          boms: this.get(DB_KEYS.BOMS) || [],
          materials: this.get(DB_KEYS.MATERIALS) || [],
          processes: this.get(DB_KEYS.PROCESSES) || [],
          processRoutes: this.get(DB_KEYS.PROCESS_ROUTES) || [],
          cuttingTasks: this.get(DB_KEYS.CUTTING_TASKS) || [],
          bundles: this.get(DB_KEYS.BUNDLES) || [],
          workReports: this.get(DB_KEYS.WORK_REPORTS) || [],
          tailTasks: this.get(DB_KEYS.TAIL_TASKS) || [],
          schedules: this.get(DB_KEYS.SCHEDULES) || [],
        },
        inventory: {
          stockItems: this.get(DB_KEYS.STOCK_ITEMS) || [],
          stockIn: this.get(DB_KEYS.STOCK_IN) || [],
          stockOut: this.get(DB_KEYS.STOCK_OUT) || [],
          transfers: this.get(DB_KEYS.STOCK_TRANSFERS) || [],
          checks: this.get(DB_KEYS.STOCK_CHECKS) || [],
        },
        quality: {
          qcRecords: this.get(DB_KEYS.QC_RECORDS) || [],
          reworkRecords: this.get(DB_KEYS.REWORK_RECORDS) || [],
          scrapRecords: this.get(DB_KEYS.SCRAP_RECORDS) || [],
        },
        finance: {
          receivables: this.get(DB_KEYS.RECEIVABLES) || [],
          payables: this.get(DB_KEYS.PAYABLES) || [],
          payments: this.get(DB_KEYS.PAYMENTS) || [],
          receipts: this.get(DB_KEYS.RECEIPTS) || [],
        },
        wallet: {
          walletFlow: this.get(DB_KEYS.WALLET_FLOW) || [],
          advanceLogs: this.get(DB_KEYS.ADVANCE_LOG) || [],
          reimburses: this.get(DB_KEYS.REIMBURSE) || [],
          riskExceptions: this.get(DB_KEYS.RISK_EXCEPTIONS) || [],
        },
        delivery: {
          deliveries: this.get(DB_KEYS.DELIVERIES) || [],
          packingBoxes: this.get(DB_KEYS.PACKING_BOXES) || [],
        },
        outsource: {
          outsourcing: this.get(DB_KEYS.OUTSOURCING) || [],
        },
        system: {
          settings: this.get(DB_KEYS.SETTINGS) || {},
          auditLogs: this.get(DB_KEYS.AUDIT_LOGS) || [],
        },
      },
      statistics: {
        totalRecords: 0,
        moduleCounts: {},
      },
    };

    // 计算统计信息
    let totalCount = 0;
    const moduleCounts: Record<string, number> = {};
    
    Object.entries(exportData.modules).forEach(([module, data]) => {
      let moduleCount = 0;
      Object.values(data as Record<string, unknown[]>).forEach((arr) => {
        if (Array.isArray(arr)) {
          moduleCount += arr.length;
          totalCount += arr.length;
        }
      });
      moduleCounts[module] = moduleCount;
    });

    exportData.statistics.totalRecords = totalCount;
    exportData.statistics.moduleCounts = moduleCounts;

    return exportData;
  }

  // 导入数据
  importAll(data: ExportData): { success: boolean; message: string; imported: number } {
    try {
      // 验证数据格式
      if (!data.version || !data.modules) {
        return { success: false, message: '无效的数据格式', imported: 0 };
      }

      // 清空现有数据
      this.clearAll();

      let importedCount = 0;

      // 导入各模块数据
      const modules = data.modules as Record<string, Record<string, unknown[]>>;
      Object.entries(modules).forEach(([module, moduleData]) => {
        Object.entries(moduleData).forEach(([key, value]) => {
          const dbKey = this.getDbKey(module, key);
          if (dbKey) {
            this.set(dbKey, value);
            if (Array.isArray(value)) {
              importedCount += value.length;
            }
          }
        });
      });

      // 更新版本号
      this.set(DB_KEYS.VERSION, data.version);
      this.set(DB_KEYS.INITIALIZED, 'true');

      return { success: true, message: '数据导入成功', imported: importedCount };
    } catch (error) {
      console.error('[Database] 导入失败', error);
      return { success: false, message: '数据导入失败', imported: 0 };
    }
  }

  // 获取数据库键名映射
  private getDbKey(module: string, key: string): string | null {
    const keyMap: Record<string, Record<string, string>> = {
      basic: {
        customers: DB_KEYS.CUSTOMERS,
        suppliers: DB_KEYS.SUPPLIERS,
        employees: DB_KEYS.EMPLOYEES,
        teams: DB_KEYS.TEAMS,
        users: DB_KEYS.USERS,
        roles: DB_KEYS.ROLES,
      },
      orders: {
        orders: DB_KEYS.ORDERS,
        samples: DB_KEYS.SAMPLES,
      },
      production: {
        boms: DB_KEYS.BOMS,
        materials: DB_KEYS.MATERIALS,
        processes: DB_KEYS.PROCESSES,
        processRoutes: DB_KEYS.PROCESS_ROUTES,
        cuttingTasks: DB_KEYS.CUTTING_TASKS,
        bundles: DB_KEYS.BUNDLES,
        workReports: DB_KEYS.WORK_REPORTS,
        tailTasks: DB_KEYS.TAIL_TASKS,
        schedules: DB_KEYS.SCHEDULES,
      },
      inventory: {
        stockItems: DB_KEYS.STOCK_ITEMS,
        stockIn: DB_KEYS.STOCK_IN,
        stockOut: DB_KEYS.STOCK_OUT,
        transfers: DB_KEYS.STOCK_TRANSFERS,
        checks: DB_KEYS.STOCK_CHECKS,
      },
      quality: {
        qcRecords: DB_KEYS.QC_RECORDS,
        reworkRecords: DB_KEYS.REWORK_RECORDS,
        scrapRecords: DB_KEYS.SCRAP_RECORDS,
      },
      finance: {
        receivables: DB_KEYS.RECEIVABLES,
        payables: DB_KEYS.PAYABLES,
        payments: DB_KEYS.PAYMENTS,
        receipts: DB_KEYS.RECEIPTS,
      },
      wallet: {
        walletFlow: DB_KEYS.WALLET_FLOW,
        advanceLogs: DB_KEYS.ADVANCE_LOG,
        reimburses: DB_KEYS.REIMBURSE,
        riskExceptions: DB_KEYS.RISK_EXCEPTIONS,
      },
      delivery: {
        deliveries: DB_KEYS.DELIVERIES,
        packingBoxes: DB_KEYS.PACKING_BOXES,
      },
      outsource: {
        outsourcing: DB_KEYS.OUTSOURCING,
      },
      system: {
        settings: DB_KEYS.SETTINGS,
        auditLogs: DB_KEYS.AUDIT_LOGS,
      },
    };

    return keyMap[module]?.[key] || null;
  }

  // 获取数据库统计
  getStats(): { totalSize: number; keyCount: number; moduleStats: Record<string, number> } {
    if (!this.isClient) {
      return { totalSize: 0, keyCount: 0, moduleStats: {} };
    }

    let totalSize = 0;
    let keyCount = 0;
    const moduleStats: Record<string, number> = {};

    Object.entries(DB_KEYS).forEach(([name, key]) => {
      const data = localStorage.getItem(key);
      if (data) {
        const size = new Blob([data]).size;
        totalSize += size;
        keyCount++;
        
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            moduleStats[name] = parsed.length;
          } else if (typeof parsed === 'object') {
            moduleStats[name] = Object.keys(parsed).length;
          }
        } catch {
          moduleStats[name] = 1;
        }
      }
    });

    return { totalSize, keyCount, moduleStats };
  }
}

// 导出单例
export const db = new Database();

// ==================== 初始化函数 ====================
export async function initializeDatabase(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  // 先尝试从服务端恢复数据
  try {
    const { initializeSync, startSyncWatch } = await import('./sync');
    const result = await initializeSync();
    
    if (result.fromServer) {
      console.log('[Database] 已从服务端恢复数据');
    }
    
    // 启动同步监听
    startSyncWatch();
  } catch (error) {
    console.error('[Database] 同步初始化失败:', error);
  }
  
  const initialized = localStorage.getItem(DB_KEYS.INITIALIZED);
  if (initialized) return;

  // 初始化空数据结构
  Object.values(DB_KEYS).forEach(key => {
    if (key !== DB_KEYS.INITIALIZED && key !== DB_KEYS.VERSION) {
      const existing = localStorage.getItem(key);
      if (!existing) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    }
  });

  // 设置版本号
  localStorage.setItem(DB_KEYS.VERSION, DB_VERSION);
  localStorage.setItem(DB_KEYS.INITIALIZED, 'true');
  
  console.log('[Database] 数据库初始化完成，版本:', DB_VERSION);
}

// 重置数据库
export function resetDatabase(): void {
  if (typeof window === 'undefined') return;
  
  Object.values(DB_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('[Database] 数据库已重置');
}

// 导出工具函数
export function downloadExportFile(data: ExportData, filename?: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `erp_export_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 导入工具函数
export function readImportFile(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data as ExportData);
      } catch (error) {
        reject(new Error('无效的JSON文件'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}
