/**
 * 二维码生成API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api-response';
import { generateMaterialQrcodes } from '@/lib/qrcode-service';
import { withPermissionCheck } from '@/lib/api-response';

// 生成物料二维码
const generateQrcodes = createApiHandler(
  withPermissionCheck(
    async (request: NextRequest) => {
      const body = await request.json();

      const qrcodes = await generateMaterialQrcodes({
        materialId: body.materialId,
        materialCode: body.materialCode,
        materialName: body.materialName,
        batchNo: body.batchNo,
        quantity: body.quantity,
        unit: body.unit,
        manufactureDate: body.manufactureDate,
        count: body.count || 1
      });

      return qrcodes;
    },
    ['material:manage']
  )
);

export const POST = generateQrcodes;