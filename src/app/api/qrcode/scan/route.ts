/**
 * 二维码扫描API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api-response';
import { scanQrcode } from '@/lib/qrcode-service';
import { withPermissionCheck } from '@/lib/api-response';

// 扫描二维码进行出入库操作
const scanQrcodeApi = createApiHandler(
  withPermissionCheck(
    async (request: NextRequest) => {
      const body = await request.json();

      const result = await scanQrcode({
        qrcodeNo: body.qrcodeNo,
        action: body.action,
        location: body.location,
        operatorId: body.operatorId,
        operatorName: body.operatorName,
        ipAddress: request.headers.get('x-forwarded-for') ||
                  request.headers.get('x-real-ip') ||
                  'unknown'
      });

      return result;
    },
    ['material:scan']
  )
);

export const POST = scanQrcodeApi;