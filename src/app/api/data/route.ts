import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sanitizeInput } from '@/lib/security';

function getCsrfTokenFromRequest(request: NextRequest): string | null {
  const headerToken = request.headers.get('x-csrf-token');
  if (headerToken) return headerToken;

  try {
    const url = new URL(request.url);
    return url.searchParams.get('csrf_token');
  } catch {
    return null;
  }
}

function isCsrfValid(request: NextRequest): boolean {
  const token = getCsrfTokenFromRequest(request);
  if (!token) return false;

  const cookieToken = request.cookies.get('erp_csrf_token')?.value;
  return Boolean(cookieToken && cookieToken === token);
}

// 数据文件路径 - 生产环境用 /tmp，开发环境用项目目录
const getDataPath = () => {
  const isProd = process.env.COZE_PROJECT_ENV === 'PROD';
  if (isProd) {
    return '/tmp/erp-data.json';
  }
  // 使用项目根目录（process.cwd()）替代不存在的 /workspace/projects
  const baseDir = process.env.COZE_WORKSPACE_PATH || process.cwd();
  return path.join(baseDir, 'data', 'erp-data.json');
};

// 确保目录存在
const ensureDir = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * 安全的JSON解析
 */
function safeJsonParse(str: string): { success: boolean; data?: unknown; error?: string } {
  try {
    // 限制JSON大小（最大10MB）
    if (str.length > 10 * 1024 * 1024) {
      return { success: false, error: '数据大小超过限制' };
    }
    
    const data = JSON.parse(str);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'JSON格式错误' };
  }
}

/**
 * 深度清理对象中的XSS威胁
 */
function sanitizeObject(obj: unknown, depth: number = 0): unknown {
  // 防止循环引用导致的栈溢出
  if (depth > 50) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // 移除危险属性名
      if (key.startsWith('__') || key.includes('prototype') || key.includes('constructor')) {
        continue;
      }
      sanitized[key] = sanitizeObject(value, depth + 1);
    }
    return sanitized;
  }
  
  return obj;
}

// GET - 读取所有数据
export async function GET(request: NextRequest) {
  try {
    // 添加基本的安全头
    const headers = {
      'Cache-Control': 'no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    };
    
    const dataPath = getDataPath();
    
    if (!fs.existsSync(dataPath)) {
      // 文件不存在，返回空数据
      return NextResponse.json(
        { success: true, data: null, exists: false },
        { headers }
      );
    }
    
    const content = fs.readFileSync(dataPath, 'utf-8');
    const parseResult = safeJsonParse(content);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error || '数据解析失败' },
        { status: 500, headers }
      );
    }
    
    // 移除敏感信息（如密码哈希）
    const data = parseResult.data as Record<string, unknown>;
    if (data && typeof data === 'object') {
      // 如果包含用户数据，移除密码字段
      if (data.erp_users && Array.isArray(data.erp_users)) {
        data.erp_users = data.erp_users.map((user: Record<string, unknown>) => {
          const { password, ...safeUser } = user;
          return safeUser;
        });
      }
    }
    
    return NextResponse.json(
      { success: true, data, exists: true },
      { headers }
    );
  } catch (error) {
    console.error('读取数据失败:', error);
    return NextResponse.json(
      { success: false, error: '读取数据失败' },
      { status: 500 }
    );
  }
}

// POST - 保存所有数据
export async function POST(request: NextRequest) {
  try {
    // 添加基本的安全头
    const headers = {
      'Cache-Control': 'no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    };
    
    // 获取请求体大小限制
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: '请求体大小超过限制（最大10MB）' },
        { status: 413, headers }
      );
    }
    
    if (!isCsrfValid(request)) {
      return NextResponse.json(
        { success: false, error: 'CSRF 验证失败' },
        { status: 403, headers }
      );
    }

    const bodyText = await request.text();
    const parseResult = safeJsonParse(bodyText);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error || '请求数据格式错误' },
        { status: 400, headers }
      );
    }
    
    // 清理输入数据
    const sanitizedData = sanitizeObject(parseResult.data);
    
    const dataPath = getDataPath();
    ensureDir(dataPath);
    
    // 添加保存时间戳和版本
    const dataToSave: Record<string, unknown> = {
      ...(typeof sanitizedData === 'object' && sanitizedData !== null ? sanitizedData : {}),
      _savedAt: new Date().toISOString(),
      _version: '2.1.0',
      _security: 'enhanced'
    };
    
    // 使用安全的文件写入方式
    const tempPath = `${dataPath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
    
    // 原子性操作：重命名临时文件
    fs.renameSync(tempPath, dataPath);
    
    return NextResponse.json(
      { 
        success: true, 
        message: '数据保存成功',
        savedAt: dataToSave._savedAt
      },
      { headers }
    );
  } catch (error) {
    console.error('保存数据失败:', error);
    return NextResponse.json(
      { success: false, error: '保存数据失败' },
      { status: 500 }
    );
  }
}

// DELETE - 清除所有数据（添加确认机制）
export async function DELETE(request: NextRequest) {
  try {
    // 添加基本的安全头
    const headers = {
      'Cache-Control': 'no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    };
    
    // 检查确认参数（防止误操作）
    const url = new URL(request.url);
    const confirm = url.searchParams.get('confirm');
    
    if (!isCsrfValid(request)) {
      return NextResponse.json(
        { success: false, error: 'CSRF 验证失败' },
        { status: 403, headers }
      );
    }

    if (confirm !== 'DELETE_ALL_DATA_CONFIRMED') {
      return NextResponse.json(
        { 
          success: false, 
          error: '请提供确认参数以执行删除操作',
          hint: '添加 ?confirm=DELETE_ALL_DATA_CONFIRMED 参数确认删除'
        },
        { status: 400, headers }
      );
    }
    
    const dataPath = getDataPath();
    
    if (fs.existsSync(dataPath)) {
      // 安全删除：先移动到备份，再删除
      const backupPath = `${dataPath}.backup.${Date.now()}`;
      fs.renameSync(dataPath, backupPath);
      fs.unlinkSync(backupPath);
    }
    
    return NextResponse.json(
      { success: true, message: '数据已清除' },
      { headers }
    );
  } catch (error) {
    console.error('清除数据失败:', error);
    return NextResponse.json(
      { success: false, error: '清除数据失败' },
      { status: 500 }
    );
  }
}
