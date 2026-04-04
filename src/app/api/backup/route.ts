/**
 * 数据备份和恢复API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api-response';
import { withPermissionCheck } from '@/lib/api-response';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// 创建数据备份
const createBackup = createApiHandler(
  withPermissionCheck(
    async (request: NextRequest) => {
      const { backupType = 'full' } = await request.json();

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `mes_backup_${backupType}_${timestamp}`;
      const backupDir = path.join(process.cwd(), 'backups');

      // 确保备份目录存在
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const backupPath = path.join(backupDir, `${backupName}.sql`);

      try {
        // 使用pg_dump创建数据库备份
        const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_URL;
        if (!dbUrl) {
          throw new Error('数据库连接配置缺失');
        }

        // 解析数据库URL
        const url = new URL(dbUrl);
        const dbName = url.pathname.slice(1);
        const dbHost = url.hostname;
        const dbPort = url.port || '5432';
        const dbUser = url.username;
        const dbPassword = url.password;

        // 执行pg_dump命令
        const dumpCommand = `PGPASSWORD=${dbPassword} pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f ${backupPath} --no-owner --no-privileges`;

        await execAsync(dumpCommand);

        // 记录备份操作日志
        const { createOperationLog } = await import('@/lib/operation-log-middleware');
        await createOperationLog({
          module: '系统管理',
          action: '数据备份',
          description: `创建${backupType}备份：${backupName}`,
          operatorId: 'system',
          resourceId: backupName,
          resourceType: 'backup',
          status: '成功'
        });

        return {
          backupName,
          backupPath,
          backupType,
          fileSize: fs.statSync(backupPath).size,
          createdAt: new Date().toISOString()
        };
      } catch (error) {
        console.error('备份失败:', error);

        // 记录失败日志
        try {
          const { createOperationLog } = await import('@/lib/operation-log-middleware');
          await createOperationLog({
            module: '系统管理',
            action: '数据备份',
            description: `备份失败：${error instanceof Error ? error.message : '未知错误'}`,
            operatorId: 'system',
            resourceId: backupName,
            resourceType: 'backup',
            status: '失败',
            errorMessage: error instanceof Error ? error.message : '未知错误'
          });
        } catch (logError) {
          console.error('记录备份失败日志时出错:', logError);
        }

        throw error;
      }
    },
    ['system:admin']
  )
);

// 获取备份列表
const getBackupList = createApiHandler(
  withPermissionCheck(
    async (request: NextRequest) => {
      const backupDir = path.join(process.cwd(), 'backups');

      if (!fs.existsSync(backupDir)) {
        return { backups: [] };
      }

      const files = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.sql'))
        .map(file => {
          const filePath = path.join(backupDir, file);
          const stats = fs.statSync(filePath);

          return {
            name: file.replace('.sql', ''),
            fileName: file,
            path: filePath,
            size: stats.size,
            createdAt: stats.birthtime.toISOString(),
            modifiedAt: stats.mtime.toISOString()
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return { backups: files };
    },
    ['system:admin']
  )
);

// 恢复数据备份
const restoreBackup = createApiHandler(
  withPermissionCheck(
    async (request: NextRequest) => {
      const { backupName } = await request.json();

      const backupDir = path.join(process.cwd(), 'backups');
      const backupPath = path.join(backupDir, `${backupName}.sql`);

      if (!fs.existsSync(backupPath)) {
        throw new Error('备份文件不存在');
      }

      try {
        // 使用psql恢复数据库
        const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_URL;
        if (!dbUrl) {
          throw new Error('数据库连接配置缺失');
        }

        // 解析数据库URL
        const url = new URL(dbUrl);
        const dbName = url.pathname.slice(1);
        const dbHost = url.hostname;
        const dbPort = url.port || '5432';
        const dbUser = url.username;
        const dbPassword = url.password;

        // 执行psql恢复命令
        const restoreCommand = `PGPASSWORD=${dbPassword} psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f ${backupPath}`;

        await execAsync(restoreCommand);

        // 记录恢复操作日志
        const { createOperationLog } = await import('@/lib/operation-log-middleware');
        await createOperationLog({
          module: '系统管理',
          action: '数据恢复',
          description: `从备份恢复数据：${backupName}`,
          operatorId: 'system',
          resourceId: backupName,
          resourceType: 'backup',
          status: '成功'
        });

        return {
          backupName,
          restoredAt: new Date().toISOString(),
          status: 'success'
        };
      } catch (error) {
        console.error('恢复失败:', error);

        // 记录失败日志
        try {
          const { createOperationLog } = await import('@/lib/operation-log-middleware');
          await createOperationLog({
            module: '系统管理',
            action: '数据恢复',
            description: `恢复失败：${error instanceof Error ? error.message : '未知错误'}`,
            operatorId: 'system',
            resourceId: backupName,
            resourceType: 'backup',
            status: '失败',
            errorMessage: error instanceof Error ? error.message : '未知错误'
          });
        } catch (logError) {
          console.error('记录恢复失败日志时出错:', logError);
        }

        throw error;
      }
    },
    ['system:admin']
  )
);

// 删除备份文件
const deleteBackup = createApiHandler(
  withPermissionCheck(
    async (request: NextRequest) => {
      const { backupName } = await request.json();

      const backupDir = path.join(process.cwd(), 'backups');
      const backupPath = path.join(backupDir, `${backupName}.sql`);

      if (!fs.existsSync(backupPath)) {
        throw new Error('备份文件不存在');
      }

      // 删除文件
      fs.unlinkSync(backupPath);

      // 记录删除操作日志
      const { createOperationLog } = await import('@/lib/operation-log-middleware');
      await createOperationLog({
        module: '系统管理',
        action: '删除备份',
        description: `删除备份文件：${backupName}`,
        operatorId: 'system',
        resourceId: backupName,
        resourceType: 'backup',
        status: '成功'
      });

      return {
        backupName,
        deletedAt: new Date().toISOString()
      };
    },
    ['system:admin']
  )
);

export const GET = getBackupList;
export const POST = createBackup;
export const DELETE = deleteBackup;

// 支持恢复操作
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'restore') {
    return restoreBackup(request);
  }

  return NextResponse.json(
    { success: false, error: '无效的操作' },
    { status: 400 }
  );
}