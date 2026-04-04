/**
 * 安全工具库
 * 
 * 提供加密、哈希、输入验证、XSS防护等安全功能
 */

// ==================== 密码哈希相关 ====================

/**
 * 使用PBKDF2哈希密码（增强版）
 * 注意：这是客户端实现，生产环境应在服务端使用bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  // 使用PBKDF2派生密钥
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // 生成随机盐值
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // 使用PBKDF2派生密钥
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    data,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  // 转换为十六进制字符串
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // 返回格式：$2a$10$salt$hash（模拟bcrypt格式）
  return `$2a$10$${saltHex}$${hashHex}`;
}

/**
 * 验证密码
 */
export async function verifyPassword(
  password: string, 
  storedHash: string
): Promise<boolean> {
  try {
    // 解析存储的哈希值（模拟bcrypt格式）
    const parts = storedHash.split('$');
    if (parts.length !== 5) return false;
    
    const [, version, cost, saltHex, hashHex] = parts;
    if (!saltHex || !hashHex) return false;
    
    // 转换盐值为Uint8Array
    const salt = new Uint8Array(saltHex.match(/.{2}/g)?.map(h => parseInt(h, 16)) || []);
    
    // 重新计算哈希
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      data,
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    
    const newHashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // 使用常量时间比较防止时序攻击
    return constantTimeCompare(hashHex, newHashHex);
  } catch {
    return false;
  }
}

/**
 * 生成随机盐值
 */
function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 常量时间比较（防止时序攻击）
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

// ==================== 密码强度验证 ====================

export interface PasswordStrength {
  score: number; // 0-4: 弱、中、强、很强
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  suggestions: string[];
  isValid: boolean;
}

/**
 * 验证密码强度
 */
export function validatePasswordStrength(password: string): PasswordStrength {
  const suggestions: string[] = [];
  let score = 0;
  
  // 基本长度检查
  if (password.length < 8) {
    suggestions.push('密码长度至少8位');
  } else if (password.length >= 12) {
    score += 1;
  }
  
  // 包含小写字母
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('建议包含小写字母');
  }
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('建议包含大写字母');
  }
  
  // 包含数字
  if (/\d/.test(password)) {
    score += 1;
  } else {
    suggestions.push('建议包含数字');
  }
  
  // 包含特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('建议包含特殊字符');
  }
  
  // 检查常见弱密码
  const weakPasswords = [
    'password', '123456', '12345678', 'qwerty', 'abc123',
    'monkey', 'master', 'dragon', 'letmein', 'login',
    'admin', 'admin123', 'welcome', 'password123'
  ];
  
  if (weakPasswords.some(weak => password.toLowerCase().includes(weak))) {
    score = Math.max(0, score - 2);
    suggestions.push('密码包含常见弱密码模式');
  }
  
  // 检查重复字符
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    suggestions.push('避免重复字符');
  }
  
  // 检查连续字符
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    score = Math.max(0, score - 1);
    suggestions.push('避免连续字符');
  }
  
  const levels: PasswordStrength['level'][] = ['weak', 'fair', 'good', 'strong', 'very-strong'];
  const level = levels[Math.min(score, 4)];
  
  return {
    score: Math.min(score, 4),
    level,
    suggestions,
    isValid: score >= 2 && password.length >= 8
  };
}

// ==================== XSS防护 ====================

/**
 * HTML转义，防止XSS攻击
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return str.replace(/[&<>"'`=/]/g, char => htmlEscapes[char] || char);
}

/**
 * 移除HTML标签
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * 清理用户输入（移除潜在危险字符）
 */
export function sanitizeInput(str: string): string {
  return str
    .replace(/[<>]/g, '') // 移除尖括号
    .replace(/javascript:/gi, '') // 移除javascript协议
    .replace(/on\w+=/gi, '') // 移除事件处理器
    .trim();
}

// ==================== 输入验证 ====================

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号（中国大陆）
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证用户名（字母开头，允许字母数字下划线，3-20位）
 */
export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
  return usernameRegex.test(username);
}

/**
 * 验证URL
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证数字范围
 */
export function validateNumberRange(value: number, min: number, max: number): boolean {
  return !isNaN(value) && value >= min && value <= max;
}

/**
 * 验证字符串长度
 */
export function validateLength(str: string, min: number, max: number): boolean {
  return str.length >= min && str.length <= max;
}

/**
 * 验证ID（防止注入攻击）
 */
export function validateId(id: string): boolean {
  // 只允许字母、数字、横杠、下划线
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

// ==================== 安全的ID生成 ====================

/**
 * 生成安全的随机ID
 */
export function generateSecureId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const randomBytes = new Uint8Array(8);
  crypto.getRandomValues(randomBytes);
  const randomPart = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return prefix ? `${prefix}_${timestamp}${randomPart}` : `${timestamp}${randomPart}`;
}

/**
 * 生成UUID v4
 */
export function generateUUID(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  
  // 设置版本号和变体
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // 版本4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // 变体
  
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// ==================== 登录安全机制 ====================

const LOGIN_ATTEMPTS_KEY = 'erp_login_attempts';
const LOCKOUT_KEY = 'erp_lockout';

interface LoginAttempt {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

interface LockoutInfo {
  username: string;
  lockedUntil: number;
  reason: string;
}

/**
 * 检查账户是否被锁定
 */
export function isAccountLocked(username: string): { locked: boolean; remainingTime?: number; reason?: string } {
  try {
    const cleanUsername = escapeHtml(username);
    const lockoutData = localStorage.getItem(LOCKOUT_KEY);
    if (!lockoutData) return { locked: false };
    
    const lockouts: Record<string, LockoutInfo> = JSON.parse(lockoutData);
    const lockout = lockouts[cleanUsername.toLowerCase()];
    
    if (!lockout) return { locked: false };
    
    const now = Date.now();
    if (now < lockout.lockedUntil) {
      const remainingTime = Math.ceil((lockout.lockedUntil - now) / 1000);
      return { locked: true, remainingTime, reason: lockout.reason };
    }
    
    // 锁定已过期，移除记录
    delete lockouts[cleanUsername.toLowerCase()];
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(lockouts));
    
    return { locked: false };
  } catch {
    return { locked: false };
  }
}

/**
 * 记录登录尝试
 */
export function recordLoginAttempt(username: string, success: boolean): { allowed: boolean; remainingAttempts?: number } {
  try {
    const cleanUsername = escapeHtml(username);
    const attemptsData = localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}';
    const attempts: Record<string, LoginAttempt> = JSON.parse(attemptsData);
    const key = cleanUsername.toLowerCase();
    const now = Date.now();
    
    if (success) {
      // 登录成功，清除尝试记录
      delete attempts[key];
      localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
      return { allowed: true };
    }
    
    // 登录失败
    const attempt = attempts[key] || { count: 0, firstAttempt: now, lastAttempt: now };
    
    // 如果距离上次尝试超过15分钟，重置计数
    if (now - attempt.lastAttempt > 15 * 60 * 1000) {
      attempt.count = 1;
      attempt.firstAttempt = now;
    } else {
      attempt.count += 1;
    }
    
    attempt.lastAttempt = now;
    attempts[key] = attempt;
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
    
    // 最多允许5次尝试
    const maxAttempts = 5;
    const remainingAttempts = maxAttempts - attempt.count;
    
    if (attempt.count >= maxAttempts) {
      // 锁定账户15分钟
      lockAccount(cleanUsername, 15 * 60, '登录失败次数过多');
      return { allowed: false, remainingAttempts: 0 };
    }
    
    return { allowed: true, remainingAttempts };
  } catch {
    return { allowed: true };
  }
}

/**
 * 锁定账户
 */
function lockAccount(username: string, durationSeconds: number, reason: string): void {
  try {
    const cleanUsername = escapeHtml(username);
    const lockoutData = localStorage.getItem(LOCKOUT_KEY) || '{}';
    const lockouts: Record<string, LockoutInfo> = JSON.parse(lockoutData);
    
    lockouts[cleanUsername.toLowerCase()] = {
      username: cleanUsername,
      lockedUntil: Date.now() + durationSeconds * 1000,
      reason
    };
    
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(lockouts));
  } catch {
    // 忽略错误
  }
}

/**
 * 清除登录尝试记录
 */
export function clearLoginAttempts(username: string): void {
  try {
    const cleanUsername = escapeHtml(username);
    const attemptsData = localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}';
    const attempts: Record<string, LoginAttempt> = JSON.parse(attemptsData);
    delete attempts[cleanUsername.toLowerCase()];
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch {
    // 忽略错误
  }
}

// ==================== 安全审计日志 ====================

export interface SecurityLog {
  id: string;
  timestamp: string;
  type: 'login' | 'permission' | 'data_access' | 'data_modify' | 'security_event';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  username?: string;
  action: string;
  resource?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
}

const SECURITY_LOGS_KEY = 'erp_security_logs';

/**
 * 记录安全审计日志
 */
export function logSecurityEvent(log: Omit<SecurityLog, 'id' | 'timestamp'>): void {
  try {
    const logsData = localStorage.getItem(SECURITY_LOGS_KEY) || '[]';
    const logs: SecurityLog[] = JSON.parse(logsData);
    
    const newLog: SecurityLog = {
      ...log,
      id: generateSecureId('LOG'),
      timestamp: new Date().toISOString()
    };
    
    // 保留最近10000条日志
    logs.unshift(newLog);
    if (logs.length > 10000) {
      logs.splice(10000);
    }
    
    localStorage.setItem(SECURITY_LOGS_KEY, JSON.stringify(logs));
  } catch {
    // 忽略错误
  }
}

/**
 * 获取安全审计日志
 */
export function getSecurityLogs(limit?: number): SecurityLog[] {
  try {
    const logsData = localStorage.getItem(SECURITY_LOGS_KEY) || '[]';
    const logs: SecurityLog[] = JSON.parse(logsData);
    return limit ? logs.slice(0, limit) : logs;
  } catch {
    return [];
  }
}

// ==================== 数据加密 ====================

/**
 * 使用AES-GCM加密数据（客户端加密，适用于非高敏感数据）
 */
export async function encryptData(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // 从密码派生密钥
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBuffer
  );
  
  // 组合：salt(16) + iv(12) + encrypted
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

/**
 * 解密数据
 */
export async function decryptData(encryptedData: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const data = combined.slice(28);
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  return decoder.decode(decrypted);
}

// ==================== 会话管理 ====================

const SESSION_KEY = 'erp_session';

interface Session {
  userId: string;
  username: string;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
}

/**
 * 创建会话
 */
export function createSession(userId: string, username: string, maxAgeHours: number = 24): void {
  const now = Date.now();
  const session: Session = {
    userId: escapeHtml(userId),
    username: escapeHtml(username),
    createdAt: now,
    expiresAt: now + maxAgeHours * 60 * 60 * 1000,
    lastActivity: now
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * 获取当前会话
 */
export function getSession(): Session | null {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;
    
    const session: Session = JSON.parse(sessionData);
    
    // 检查是否过期
    if (Date.now() > session.expiresAt) {
      destroySession();
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

/**
 * 更新会话活动时间
 */
export function updateSessionActivity(): void {
  try {
    const session = getSession();
    if (session) {
      session.lastActivity = Date.now();
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch {
    // 忽略错误
  }
}

/**
 * 销毁会话
 */
export function destroySession(): void {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * 检查会话是否有效
 */
export function isSessionValid(): boolean {
  return getSession() !== null;
}

// ==================== 增强安全机制 ====================

/**
 * 会话超时管理
 * 检查会话是否超时（30分钟无活动）
 */
export function isSessionTimedOut(): boolean {
  const session = getSession();
  if (!session) return true;
  
  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;
  
  return now - session.lastActivity > thirtyMinutes;
}

/**
 * 刷新会话活动时间
 */
export function refreshSession(): void {
  const session = getSession();
  if (session) {
    session.lastActivity = Date.now();
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

/**
 * 生成CSRF令牌
 */
export function generateCsrfToken(): string {
  const token = generateSecureId('CSRF');
  if (typeof window !== 'undefined') {
    localStorage.setItem('erp_csrf_token', token);
    document.cookie = `erp_csrf_token=${token}; path=/; sameSite=strict`;
  }
  return token;
}

/**
 * 验证CSRF令牌
 */
export function validateCsrfToken(token: string): boolean {
  if (!token) return false;
  if (typeof window === 'undefined') return false;

  const storedToken = localStorage.getItem('erp_csrf_token');
  return storedToken === token;
}

/**
 * 获取或创建 CSRF 令牌
 */
export function getCsrfToken(): string {
  if (typeof window === 'undefined') return '';

  let token = localStorage.getItem('erp_csrf_token');
  if (!token) {
    token = generateCsrfToken();
  }

  return token;
}

/**
 * 防止XSS攻击的输入清理
 */
export function sanitizeForXSS(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;');
}

/**
 * 防止SQL注入的输入清理
 */
export function sanitizeForSQL(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/"/g, '""')
    .replace(/\//g, '&#x2F;')
    .replace(/\;/g, '&#x3B;')
    .replace(/\-/g, '&#x2D;')
    .replace(/\+/g, '&#x2B;')
    .replace(/\*/g, '&#x2A;')
    .replace(/\%/g, '&#x25;');
}

/**
 * 检查密码是否被泄露（模拟）
 */
export async function checkPasswordBreach(password: string): Promise<boolean> {
  // 模拟检查密码是否在泄露数据库中
  // 实际应用中应调用第三方API
  const commonPasswords = [
    'password', '123456', '12345678', 'qwerty', 'abc123',
    'monkey', 'master', 'dragon', 'letmein', 'login',
    'admin', 'admin123', 'welcome', 'password123'
  ];
  
  return commonPasswords.includes(password.toLowerCase());
}

/**
 * 生成安全的随机密码
 */
export function generateSecurePassword(length: number = 12): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
  let password = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  
  return password;
}

/**
 * 检查IP地址是否为恶意IP（模拟）
 */
export function isMaliciousIP(ip: string): boolean {
  // 模拟检查恶意IP
  // 实际应用中应使用IP黑名单服务
  const maliciousIPs = [
    '127.0.0.1', // 本地测试
    '192.168.1.1' // 本地网络
  ];
  
  return maliciousIPs.includes(ip);
}

/**
 * 获取客户端IP地址（模拟）
 */
export function getClientIP(): string {
  // 模拟获取客户端IP
  // 实际应用中应从请求头或服务器端获取
  return '192.168.1.100';
}

/**
 * 获取用户代理信息
 */
export function getUserAgent(): string {
  return navigator.userAgent || '';
}

/**
 * 安全的JSON解析
 */
export function safeJSONParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * 安全的本地存储操作
 */
export function safeLocalStorageGet(key: string, defaultValue: any = null): any {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * 安全的本地存储设置
 */
export function safeLocalStorageSet(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * 安全的本地存储删除
 */
export function safeLocalStorageRemove(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// ==================== 实名绑定与账户安全 ====================

const REAL_NAME_BINDINGS_KEY = 'erp_real_name_bindings';
const BANK_CARD_BINDINGS_KEY = 'erp_bank_card_bindings';
const RISK_LOCKOUTS_KEY = 'erp_risk_lockouts';

interface RealNameBinding {
  userId: string;
  realName: string;
  idCard: string;
  verified: boolean;
  boundAt: string;
}

interface BankCardBinding {
  userId: string;
  cardType: '银行卡' | '支付宝' | '微信';
  cardNumber: string;
  cardName: string;
  boundAt: string;
}

interface RiskLockout {
  userId: string;
  lockedUntil: number;
  reason: string;
  lockedBy: string;
  lockedAt: string;
}

/**
 * 绑定实名信息
 */
export function bindRealName(userId: string, realName: string, idCard: string): { success: boolean; message: string } {
  try {
    // 验证身份证格式
    const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
    if (!idCardRegex.test(idCard)) {
      return { success: false, message: '身份证号码格式不正确' };
    }
    
    // 验证姓名格式
    const nameRegex = /^[\u4e00-\u9fa5]{2,4}$/;
    if (!nameRegex.test(realName)) {
      return { success: false, message: '姓名格式不正确' };
    }
    
    // 检查是否已绑定
    const bindingsData = localStorage.getItem(REAL_NAME_BINDINGS_KEY) || '{}';
    const bindings: Record<string, RealNameBinding> = JSON.parse(bindingsData);
    
    if (bindings[userId]) {
      return { success: false, message: '您已经绑定过实名信息' };
    }
    
    // 检查身份证是否被其他用户绑定
    const existingBinding = Object.values(bindings).find(b => b.idCard === idCard);
    if (existingBinding) {
      return { success: false, message: '该身份证已被其他用户绑定' };
    }
    
    // 模拟实名验证（实际应用中应调用第三方API）
    const isVerified = true; // 模拟验证通过
    
    bindings[userId] = {
      userId,
      realName,
      idCard,
      verified: isVerified,
      boundAt: new Date().toISOString()
    };
    
    localStorage.setItem(REAL_NAME_BINDINGS_KEY, JSON.stringify(bindings));
    
    // 记录安全事件
    logSecurityEvent({
      type: 'security_event',
      severity: 'medium',
      action: '绑定实名信息',
      details: `用户 ${userId} 绑定了实名信息: ${realName}`,
      success: isVerified
    });
    
    return { success: true, message: '实名绑定成功' };
  } catch (error) {
    console.error('绑定实名信息失败:', error);
    return { success: false, message: '绑定实名信息失败' };
  }
}

/**
 * 获取实名绑定信息
 */
export function getRealNameBinding(userId: string): RealNameBinding | null {
  try {
    const bindingsData = localStorage.getItem(REAL_NAME_BINDINGS_KEY) || '{}';
    const bindings: Record<string, RealNameBinding> = JSON.parse(bindingsData);
    return bindings[userId] || null;
  } catch {
    return null;
  }
}

/**
 * 绑定银行卡/支付宝/微信
 */
export function bindPaymentMethod(userId: string, cardType: '银行卡' | '支付宝' | '微信', cardNumber: string, cardName: string): { success: boolean; message: string } {
  try {
    // 验证支付方式
    if (!['银行卡', '支付宝', '微信'].includes(cardType)) {
      return { success: false, message: '无效的支付方式' };
    }
    
    // 检查是否已绑定同类型的支付方式
    const bindingsData = localStorage.getItem(BANK_CARD_BINDINGS_KEY) || '[]';
    const bindings: BankCardBinding[] = JSON.parse(bindingsData);
    
    const existingBinding = bindings.find(b => b.userId === userId && b.cardType === cardType);
    if (existingBinding) {
      return { success: false, message: `您已经绑定过${cardType}` };
    }
    
    // 检查卡号是否被其他用户绑定
    const cardExists = bindings.find(b => b.cardNumber === cardNumber);
    if (cardExists) {
      return { success: false, message: '该支付方式已被其他用户绑定' };
    }
    
    // 验证卡号格式
    if (cardType === '银行卡') {
      const cardRegex = /^\d{16,19}$/;
      if (!cardRegex.test(cardNumber)) {
        return { success: false, message: '银行卡号格式不正确' };
      }
    } else if (cardType === '支付宝') {
      const alipayRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$|^1[3-9]\d{9}$/;
      if (!alipayRegex.test(cardNumber)) {
        return { success: false, message: '支付宝账号格式不正确' };
      }
    } else if (cardType === '微信') {
      const wechatRegex = /^[a-zA-Z0-9_-]{6,20}$|^1[3-9]\d{9}$/;
      if (!wechatRegex.test(cardNumber)) {
        return { success: false, message: '微信号格式不正确' };
      }
    }
    
    // 添加绑定
    const newBinding: BankCardBinding = {
      userId,
      cardType,
      cardNumber,
      cardName,
      boundAt: new Date().toISOString()
    };
    
    bindings.push(newBinding);
    localStorage.setItem(BANK_CARD_BINDINGS_KEY, JSON.stringify(bindings));
    
    // 记录安全事件
    logSecurityEvent({
      type: 'security_event',
      severity: 'medium',
      action: '绑定支付方式',
      details: `用户 ${userId} 绑定了${cardType}`,
      success: true
    });
    
    return { success: true, message: `${cardType}绑定成功` };
  } catch (error) {
    console.error('绑定支付方式失败:', error);
    return { success: false, message: '绑定支付方式失败' };
  }
}

/**
 * 获取用户绑定的支付方式
 */
export function getPaymentMethods(userId: string): BankCardBinding[] {
  try {
    const bindingsData = localStorage.getItem(BANK_CARD_BINDINGS_KEY) || '[]';
    const bindings: BankCardBinding[] = JSON.parse(bindingsData);
    return bindings.filter(b => b.userId === userId);
  } catch {
    return [];
  }
}

/**
 * 检查频繁换卡行为
 */
export function checkFrequentCardChanges(userId: string, cardType: '银行卡' | '支付宝' | '微信'): { risky: boolean; message?: string } {
  try {
    const bindingsData = localStorage.getItem(BANK_CARD_BINDINGS_KEY) || '[]';
    const bindings: BankCardBinding[] = JSON.parse(bindingsData);
    
    // 获取用户该类型的所有绑定记录
    const userBindings = bindings
      .filter(b => b.userId === userId && b.cardType === cardType)
      .sort((a, b) => new Date(b.boundAt).getTime() - new Date(a.boundAt).getTime());
    
    // 检查24小时内的换卡次数
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    
    const recentBindings = userBindings.filter(b => new Date(b.boundAt).getTime() > twentyFourHoursAgo);
    
    if (recentBindings.length >= 2) {
      return { risky: true, message: '24小时内频繁更换支付方式，存在风险' };
    }
    
    return { risky: false };
  } catch {
    return { risky: false };
  }
}

/**
 * 风险锁定账户
 */
export function riskLockAccount(userId: string, reason: string, lockedBy: string, durationHours: number = 24): void {
  try {
    const lockoutsData = localStorage.getItem(RISK_LOCKOUTS_KEY) || '{}';
    const lockouts: Record<string, RiskLockout> = JSON.parse(lockoutsData);
    
    lockouts[userId] = {
      userId,
      lockedUntil: Date.now() + durationHours * 60 * 60 * 1000,
      reason,
      lockedBy,
      lockedAt: new Date().toISOString()
    };
    
    localStorage.setItem(RISK_LOCKOUTS_KEY, JSON.stringify(lockouts));
    
    // 记录安全事件
    logSecurityEvent({
      type: 'security_event',
      severity: 'high',
      action: '风险锁定账户',
      details: `用户 ${userId} 因 ${reason} 被锁定 ${durationHours} 小时`,
      success: true
    });
  } catch (error) {
    console.error('锁定账户失败:', error);
  }
}

/**
 * 检查账户是否被风险锁定
 */
export function isAccountRiskLocked(userId: string): { locked: boolean; remainingTime?: number; reason?: string } {
  try {
    const lockoutsData = localStorage.getItem(RISK_LOCKOUTS_KEY) || '{}';
    const lockouts: Record<string, RiskLockout> = JSON.parse(lockoutsData);
    
    const lockout = lockouts[userId];
    if (!lockout) return { locked: false };
    
    const now = Date.now();
    if (now < lockout.lockedUntil) {
      const remainingTime = Math.ceil((lockout.lockedUntil - now) / (1000 * 60 * 60));
      return { locked: true, remainingTime, reason: lockout.reason };
    }
    
    // 锁定已过期，移除记录
    delete lockouts[userId];
    localStorage.setItem(RISK_LOCKOUTS_KEY, JSON.stringify(lockouts));
    
    return { locked: false };
  } catch {
    return { locked: false };
  }
}

/**
 * 解除风险锁定（仅老板可操作）
 */
export function unlockRiskAccount(userId: string, unlockedBy: string, isBoss: boolean): { success: boolean; message: string } {
  if (!isBoss) {
    return { success: false, message: '只有老板可以解除风险锁定' };
  }
  
  try {
    const lockoutsData = localStorage.getItem(RISK_LOCKOUTS_KEY) || '{}';
    const lockouts: Record<string, RiskLockout> = JSON.parse(lockoutsData);
    
    if (!lockouts[userId]) {
      return { success: false, message: '账户未被风险锁定' };
    }
    
    delete lockouts[userId];
    localStorage.setItem(RISK_LOCKOUTS_KEY, JSON.stringify(lockouts));
    
    // 记录安全事件
    logSecurityEvent({
      type: 'security_event',
      severity: 'medium',
      action: '解除风险锁定',
      details: `用户 ${userId} 的风险锁定被 ${unlockedBy} 解除`,
      success: true
    });
    
    return { success: true, message: '风险锁定已解除' };
  } catch (error) {
    console.error('解除风险锁定失败:', error);
    return { success: false, message: '解除风险锁定失败' };
  }
}

/**
 * 检查异地登录
 */
export function checkRemoteLogin(userId: string, ipAddress: string, userAgent: string): { risky: boolean; message?: string } {
  try {
    const loginHistoryKey = 'erp_login_history';
    const historyData = localStorage.getItem(loginHistoryKey) || '{}';
    const history: Record<string, { ip: string; userAgent: string; timestamp: number }[]> = JSON.parse(historyData);
    
    if (!history[userId]) {
      // 首次登录，记录信息
      history[userId] = [{
        ip: ipAddress,
        userAgent,
        timestamp: Date.now()
      }];
      localStorage.setItem(loginHistoryKey, JSON.stringify(history));
      return { risky: false };
    }
    
    // 获取最近的登录记录
    const recentLogins = history[userId].slice(-5); // 最近5次登录
    const lastLogin = recentLogins[recentLogins.length - 1];
    
    // 检查IP地址是否不同
    if (lastLogin.ip !== ipAddress) {
      return { risky: true, message: '检测到异地登录，存在风险' };
    }
    
    // 更新登录历史
    history[userId].push({
      ip: ipAddress,
      userAgent,
      timestamp: Date.now()
    });
    
    // 只保留最近10次登录记录
    if (history[userId].length > 10) {
      history[userId] = history[userId].slice(-10);
    }
    
    localStorage.setItem(loginHistoryKey, JSON.stringify(history));
    return { risky: false };
  } catch {
    return { risky: false };
  }
}

/**
 * 记录所有操作日志
 */
export function logOperation(userId: string, action: string, resource: string, details: string, success: boolean): void {
  try {
    const logsData = localStorage.getItem('erp_operation_logs') || '[]';
    const logs: any[] = JSON.parse(logsData);
    
    const newLog = {
      id: generateSecureId('OP'),
      timestamp: new Date().toISOString(),
      userId,
      action,
      resource,
      details,
      ipAddress: getClientIP(),
      userAgent: getUserAgent(),
      success
    };
    
    // 保留最近50000条日志
    logs.unshift(newLog);
    if (logs.length > 50000) {
      logs.splice(50000);
    }
    
    localStorage.setItem('erp_operation_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('记录操作日志失败:', error);
  }
}

/**
 * 获取操作日志
 */
export function getOperationLogs(limit?: number): any[] {
  try {
    const logsData = localStorage.getItem('erp_operation_logs') || '[]';
    const logs: any[] = JSON.parse(logsData);
    return limit ? logs.slice(0, limit) : logs;
  } catch {
    return [];
  }
}
