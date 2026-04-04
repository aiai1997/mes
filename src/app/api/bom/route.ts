import { NextRequest, NextResponse } from 'next/server';
import { BOM, initBOMData, getBOMs, saveBOM, deleteBOM, auditBOM, rejectBOM, submitBOMAudit, cancelBOM, getMaterials, getOrdersForBOM, checkOrderHasBOM, getBOMByOrderNo, generateBOMNo } from '@/types/bom';

// 初始化数据
initBOMData();

// GET - 获取BOM数据
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const orderNo = url.searchParams.get('orderNo');
    const bomId = url.searchParams.get('id');
    
    if (bomId) {
      const boms = getBOMs();
      const bom = boms.find(b => b.id === bomId);
      if (bom) {
        return NextResponse.json({
          success: true,
          data: bom
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'BOM不存在' },
          { status: 404 }
        );
      }
    } else if (orderNo) {
      const bom = getBOMByOrderNo(orderNo);
      if (bom) {
        return NextResponse.json({
          success: true,
          data: bom
        });
      } else {
        return NextResponse.json(
          { success: false, error: '该订单没有BOM' },
          { status: 404 }
        );
      }
    } else {
      const boms = getBOMs();
      return NextResponse.json({
        success: true,
        data: boms
      });
    }
  } catch (error) {
    console.error('获取BOM数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取数据失败' },
      { status: 500 }
    );
  }
}

// POST - 创建BOM
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.orderNo) {
      return NextResponse.json(
        { success: false, error: '缺少订单编号' },
        { status: 400 }
      );
    }
    
    // 检查订单是否已有BOM
    if (checkOrderHasBOM(body.orderNo)) {
      return NextResponse.json(
        { success: false, error: '该订单已有BOM，不能重复创建' },
        { status: 400 }
      );
    }
    
    // 生成BOM编号
    const bomNo = generateBOMNo(body.orderNo);
    
    const newBOM: BOM = {
      id: `bom_${Date.now()}`,
      bomNo,
      orderNo: body.orderNo,
      styleNo: body.styleNo || '',
      productName: body.productName || '',
      customerName: body.customerName || '',
      orderQuantity: body.orderQuantity || 0,
      colorSizeMatrix: body.colorSizeMatrix || [],
      deliveryDate: body.deliveryDate || new Date().toISOString().split('T')[0],
      bomVersion: body.bomVersion || '01',
      bomType: body.bomType || '订单BOM',
      status: '草稿',
      printEmbroidery: body.printEmbroidery || [],
      washRequirement: body.washRequirement || { washType: '普洗', colorEffect: '原色', shrinkageRate: '≤3%', ecoRequirement: [] },
      packingRequirement: body.packingRequirement || { packingMethod: '独立包装', peBagSize: '自动匹配', cartonSize: '60×40×30cm', piecesPerCarton: 50, sizeRatio: '1:2:2:1', cartonLabelType: '英文', sticker: '', barcode: '', moistureProof: false, desiccant: false, tissuePaper: false },
      tailRequirement: body.tailRequirement || { trimThread: false, ironing: false, inspection: false, spareButtons: 0, spareThread: '', hangTag: '', hangRope: '', foldMethod: '' },
      fabrics: body.fabrics || [],
      accessories: body.accessories || [],
      prints: body.prints || [],
      washes: body.washes || [],
      tails: body.tails || [],
      packings: body.packings || [],
      fabricTotalCost: 0,
      accessoryTotalCost: 0,
      printTotalCost: 0,
      washTotalCost: 0,
      tailTotalCost: 0,
      packingTotalCost: 0,
      pieceCost: 0,
      totalCost: 0,
      createdBy: body.createdBy || 'user',
      createdAt: new Date().toISOString(),
    };
    
    saveBOM(newBOM);
    
    return NextResponse.json({
      success: true,
      message: 'BOM创建成功',
      data: newBOM
    });
  } catch (error) {
    console.error('创建BOM失败:', error);
    return NextResponse.json(
      { success: false, error: '创建BOM失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新BOM
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: '缺少BOM ID' },
        { status: 400 }
      );
    }
    
    const boms = getBOMs();
    const existingBOM = boms.find(b => b.id === body.id);
    
    if (!existingBOM) {
      return NextResponse.json(
        { success: false, error: 'BOM不存在' },
        { status: 404 }
      );
    }
    
    const updatedBOM: BOM = {
      ...existingBOM,
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    saveBOM(updatedBOM);
    
    return NextResponse.json({
      success: true,
      message: 'BOM更新成功',
      data: updatedBOM
    });
  } catch (error) {
    console.error('更新BOM失败:', error);
    return NextResponse.json(
      { success: false, error: '更新BOM失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除BOM
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const bomId = url.searchParams.get('id');
    
    if (!bomId) {
      return NextResponse.json(
        { success: false, error: '缺少BOM ID' },
        { status: 400 }
      );
    }
    
    deleteBOM(bomId);
    
    return NextResponse.json({
      success: true,
      message: 'BOM删除成功'
    });
  } catch (error) {
    console.error('删除BOM失败:', error);
    return NextResponse.json(
      { success: false, error: '删除BOM失败' },
      { status: 500 }
    );
  }
}
