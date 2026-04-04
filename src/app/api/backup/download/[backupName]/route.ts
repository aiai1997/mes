/**
 * 下载备份文件API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api-response';
import { withPermissionCheck } from '@/lib/api-response';
import * as fs from 'fs';
import * as path from 'path';

// 下载备份文件
const downloadBackup = createApiHandler(
  withPermissionCheck(
    async (request: NextRequest, { params }: { params: { backupName: string } }) => {
      const backupName = params.backupName;

      const backupDir = path.join(process.cwd(), 'backups');
      const backupPath = path.join(backupDir, `${backupName}.sql`);

      if (!fs.existsSync(backupPath)) {
        throw new Error('备份文件不存在');
      }

      // 读取文件内容
      const fileContent = fs.readFileSync(backupPath);

      // 返回文件流
      return new NextResponse(fileContent, {
        headers: {
          'Content-Type': 'application/sql',
          'Content-Disposition': `attachment; filename="${backupName}.sql"`,
          'Content-Length': fileContent.length.toString(),
        },
      });
    },
    ['backup:create'] // 使用创建权限来控制下载
  )
);

export const GET = downloadBackup;