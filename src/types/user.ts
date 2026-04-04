/**
 * 用户相关类型定义
 *
 * 安全增强：
 * - 密码使用SHA-256哈希存储（带盐值）
 * - 实现登录速率限制和账户锁定机制
 * - 支持密码强度验证
 * - 使用安全ID生成算法
 */

import { DB_KEYS } from '@/lib/database';
import { setItem, getItem } from '@/lib/storage';
import { 
  hashPassword, 
  verifyPassword, 
  generateUUID,
  validateUsername,
  validateEmail,
  validatePhone,
  validatePasswordStrength,
  isAccountLocked,
  recordLoginAttempt,
  clearLoginAttempts,
  logSecurityEvent,
  createSession,
  getSession,
  destroySession,
  escapeHtml
} from '@/lib/security';

// 用户角色类型
export type UserRole = '管理员' | '业务员' | '跟单员' | '车间工人' | '组长' | '财务';

// 用户状态
export type UserStatus = '启用' | '禁用';

// 用户信息接口
export interface User {
  id: string;
  username: string;       // 登录账号
  password: string;       // 密码哈希（格式：salt$hash）
  realName: string;       // 真实姓名
  role: UserRole;         // 角色
  department: string;     // 部门
  phone?: string;         // 手机号
  email?: string;         // 邮箱
  permissions: string[];  // 权限列表
  status: UserStatus;     // 状态
  lastLogin?: string;     // 最后登录时间
  createdAt: string;      // 创建时间
  updatedAt?: string;     // 更新时间
  passwordChangedAt?: string; // 密码最后修改时间
}

// 当前登录用户信息（不包含敏感信息）
export interface CurrentUser {
  id: string;
  username: string;
  realName: string;
  role: UserRole;
  permissions: string[];
  loginTime?: string;
}

// 角色权限映射
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  '管理员': ['all'],
  '业务员': ['order:create', 'order:view', 'order:edit', 'order:delete', 'bom:create', 'bom:view', 'customer:view', 'customer:edit', 'wallet:view'],
  '跟单员': ['order:view', 'bom:view', 'cutting:view', 'workshop:view', 'tail:view', 'schedule:view', 'wallet:view'],
  '车间工人': ['workshop:report', 'cutting:view', 'bundle:view', 'order:view', 'wallet:view'],
  '组长': ['workshop:view', 'workshop:report', 'workshop:audit', 'cutting:view', 'tail:view', 'employee:view', 'wallet:view'],
  '财务': ['finance:view', 'finance:audit', 'order:view', 'report:view', 'wallet:view'],
};

const USERS_KEY = DB_KEYS.USERS;
const CURRENT_USER_KEY = 'erp_current_user';
const REMEMBERED_USERNAME_KEY = 'erp_remembered_username';

// 默认密码（用于初始化，实际使用时应强制用户修改）
const DEFAULT_ADMIN_PASSWORD = 'Admin@2024!';
const DEFAULT_USER_PASSWORD = 'User@2024!';
const DEFAULT_WORKER_PASSWORD = 'Worker@2024!';

/**
 * 强制重置用户数据（使用新的哈希密码）
 */
export async function forceResetUsers(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // 先生成所有哈希密码
    const [adminHash, userHash, workerHash] = await Promise.all([
      hashPassword(DEFAULT_ADMIN_PASSWORD),
      hashPassword(DEFAULT_USER_PASSWORD),
      hashPassword(DEFAULT_WORKER_PASSWORD)
    ]);

    // 使用哈希密码创建默认用户
    const defaultUsers: User[] = [
      {
        id: generateUUID(),
        username: 'admin',
        password: adminHash,
        realName: '系统管理员',
        role: '管理员',
        department: '信息部',
        phone: '13800138000',
        email: 'admin@example.com',
        permissions: ['all'],
        status: '启用',
        createdAt: new Date().toISOString(),
        passwordChangedAt: new Date().toISOString(),
      },
      {
        id: generateUUID(),
        username: 'user',
        password: userHash,
        realName: '张三',
        role: '业务员',
        department: '业务部',
        phone: '13900139000',
        email: 'user@example.com',
        permissions: ROLE_PERMISSIONS['业务员'],
        status: '启用',
        createdAt: new Date().toISOString(),
        passwordChangedAt: new Date().toISOString(),
      },
      {
        id: generateUUID(),
        username: 'worker',
        password: workerHash,
        realName: '李四',
        role: '车间工人',
        department: '缝制车间',
        phone: '13700137000',
        email: 'worker@example.com',
        permissions: ROLE_PERMISSIONS['车间工人'],
        status: '启用',
        createdAt: new Date().toISOString(),
        passwordChangedAt: new Date().toISOString(),
      },
    ];

    setItem(USERS_KEY, defaultUsers);
    
    logSecurityEvent({
      type: 'security_event',
      severity: 'high',
      action: '强制重置用户数据',
      details: '系统强制重置了用户数据，应用新的密码哈希策略',
      success: true
    });
    
    console.log('用户数据重置成功');
  } catch (error) {
    console.error('重置用户数据失败:', error);
    throw error;
  }
}

/**
 * 初始化默认用户数据（异步版本）
 */
export async function initDefaultUsersAsync(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    const users = getItem<User[]>(USERS_KEY);
    
    // 如果没有用户数据
    if (!users || !Array.isArray(users) || users.length === 0) {
      console.log('无用户数据，正在初始化...');
      await forceResetUsers();
      return;
    }
    
    // 检查密码格式（哈希密码包含$符号）
    const firstUser = users[0];
    if (!firstUser?.password?.includes('$')) {
      console.log('检测到旧密码格式，正在升级...');
      await forceResetUsers();
      return;
    }
    
    console.log('用户数据已是最新格式');
  } catch (error) {
    console.error('初始化用户数据失败:', error);
    // 出错时也尝试重置
    await forceResetUsers();
  }
}

// 初始化默认用户数据（同步版本，用于向后兼容）
export function initDefaultUsers(): void {
  if (typeof window === 'undefined') return;
  initDefaultUsersAsync().catch(console.error);
}

// 获取所有用户
export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  initDefaultUsers();
  return getItem<User[]>(USERS_KEY) || [];
}

// 保存用户列表
export function saveUsers(users: User[]): void {
  setItem(USERS_KEY, users);
}

// 根据 ID 获取用户
export function getUserById(id: string): User | null {
  return getUsers().find(u => u.id === id) || null;
}

// 根据用户名获取用户
export function getUserByUsername(username: string): User | null {
  return getUsers().find(u => u.username === username) || null;
}

export function getUserByEmail(email: string): User | null {
  if (!email) return null;
  return getUsers().find(u => u.email?.toLowerCase() === email.toLowerCase()) || null;
}

export function getUserByPhone(phone: string): User | null {
  if (!phone) return null;
  const normalized = phone.replace(/\D/g, '');
  return getUsers().find(u => u.phone?.replace(/\D/g, '') === normalized) || null;
}

export function isEmailExists(email: string, excludeId?: string): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase();
  return getUsers().some(u => u.email?.toLowerCase() === normalized && u.id !== excludeId);
}

export function isPhoneExists(phone: string, excludeId?: string): boolean {
  if (!phone) return false;
  const normalized = phone.replace(/\D/g, '');
  return getUsers().some(u => u.phone?.replace(/\D/g, '') === normalized && u.id !== excludeId);
}

export async function registerUser(params: {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  realName?: string;
  role?: UserRole;
}): Promise<User> {
  const cleanUsername = escapeHtml(params.username.trim());
  const email = params.email?.trim().toLowerCase();
  const phone = params.phone?.trim();

  if (!cleanUsername) {
    throw new Error('用户名不能为空');
  }

  if (!validateUsername(cleanUsername)) {
    throw new Error('用户名格式不正确，需以字母开头，支持字母、数字和下划线，长度3-20位');
  }

  if (isUsernameExists(cleanUsername)) {
    throw new Error('用户名已存在');
  }

  if (!params.password || params.password.length < 8) {
    throw new Error('密码长度至少为8位');
  }

  const passwordStrength = validatePasswordStrength(params.password);
  if (!passwordStrength.isValid) {
    throw new Error(`密码强度不足：${passwordStrength.suggestions.join('、')}`);
  }

  if (email) {
    if (!validateEmail(email)) {
      throw new Error('邮箱格式不正确');
    }
    if (isEmailExists(email)) {
      throw new Error('邮箱已被占用');
    }
  }

  if (phone) {
    if (!validatePhone(phone)) {
      throw new Error('手机号格式不正确');
    }
    if (isPhoneExists(phone)) {
      throw new Error('手机号已被占用');
    }
  }

  if (!email && !phone) {
    throw new Error('请至少提供邮箱或手机号之一');
  }

  const passwordHash = await hashPassword(params.password);
  const role = params.role ?? '业务员';
  const user: User = {
    id: generateUUID(),
    username: cleanUsername,
    password: passwordHash,
    realName: params.realName ? escapeHtml(params.realName.trim()) : cleanUsername,
    role,
    department: '业务部',
    phone,
    email,
    permissions: ROLE_PERMISSIONS[role],
    status: '启用',
    createdAt: new Date().toISOString(),
    passwordChangedAt: new Date().toISOString(),
  };

  saveUser(user);

  logSecurityEvent({
    type: 'security_event',
    severity: 'medium',
    action: '用户注册',
    details: `新用户 ${user.username} 注册成功`,
    success: true,
  });

  return user;
}

/**
 * 验证用户登录（增强版）
 */
export async function validateUserAsync(
  username: string, 
  password: string
): Promise<{ user: User | null; error?: string }> {
  const cleanUsername = escapeHtml(username.trim());
  
  // 检查账户锁定
  const lockStatus = isAccountLocked(cleanUsername);
  if (lockStatus.locked) {
    const mins = Math.ceil((lockStatus.remainingTime || 0) / 60);
    return { user: null, error: `账户已锁定，请${mins}分钟后再试` };
  }
  
  try {
    // 等待用户数据初始化完成
    await initDefaultUsersAsync();
  } catch (error) {
    console.error('初始化用户数据失败:', error);
    // 初始化失败后仍然继续，使用现有的用户数据
  }
  
  const users = getUsers();
  const user = users.find(u => u.username === cleanUsername);
  
  if (!user) {
    recordLoginAttempt(cleanUsername, false);
    return { user: null, error: '账号或密码不正确' };
  }
  
  try {
    // 验证密码
    const isValid = await verifyPassword(password, user.password);
    
    if (!isValid) {
      const result = recordLoginAttempt(cleanUsername, false);
      if (!result.allowed) {
        return { user: null, error: '登录失败次数过多，账户已被锁定15分钟' };
      }
      return { user: null, error: `账号或密码不正确，剩余${result.remainingAttempts}次机会` };
    }
    
    if (user.status === '禁用') {
      return { user: null, error: '账号已被禁用' };
    }
    
    // 登录成功
    clearLoginAttempts(cleanUsername);
    createSession(user.id, user.username, 24);
    
    // 更新最后登录
    user.lastLogin = new Date().toLocaleString('zh-CN');
    saveUsers(users);
    
    return { user };
  } catch (error) {
    console.error('验证密码失败:', error);
    recordLoginAttempt(cleanUsername, false);
    return { user: null, error: '登录失败，请稍后重试' };
  }
}

// 同步版本（向后兼容）
export function validateUser(username: string, password: string): User | null {
  const users = getUsers();
  return users.find(u => u.username === username) || null;
}

// 保存用户
export function saveUser(user: User): void {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  
  if (index >= 0) {
    users[index] = { ...user, updatedAt: new Date().toISOString() };
  } else {
    if (!user.id) user.id = generateUUID();
    user.createdAt = new Date().toISOString();
    users.push(user);
  }
  
  saveUsers(users);
}

// 更新用户密码
export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('用户不存在');
  }
  
  // 哈希新密码
  const passwordHash = await hashPassword(newPassword);
  
  // 更新用户密码
  users[userIndex] = {
    ...users[userIndex],
    password: passwordHash,
    passwordChangedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  saveUsers(users);
  
  // 记录安全事件
  logSecurityEvent({
    type: 'security_event',
    severity: 'medium',
    action: '密码重置',
    details: `用户 ${users[userIndex].username} 重置了密码`,
    success: true
  });
}

// 删除用户
export function deleteUser(id: string): void {
  const users = getUsers().filter(u => u.id !== id);
  saveUsers(users);
}

// 生成用户ID
export function generateUserId(): string {
  return generateUUID();
}

// 检查用户名是否存在
export function isUsernameExists(username: string, excludeId?: string): boolean {
  const users = getUsers();
  return users.some(u => u.username === username && u.id !== excludeId);
}

// 保存当前登录用户
export function saveCurrentUser(user: CurrentUser): void {
  user.loginTime = new Date().toISOString();
  setItem(CURRENT_USER_KEY, user);
}

// 获取当前登录用户
export function getCurrentUser(): CurrentUser | null {
  const session = getSession();
  if (!session) return null;
  
  const user = getItem<CurrentUser>(CURRENT_USER_KEY);
  if (!user) return null;
  
  if (!user.id) user.id = user.username;
  return user;
}

// 清除当前登录用户
export function clearCurrentUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CURRENT_USER_KEY);
    destroySession();
  }
}

// ==================== 风控冻结逻辑 ====================

// 锁定用户账户
export function lockUserAccount(userId: string, durationMinutes: number, reason: string): void {
  if (typeof window === 'undefined') return;
  
  const lockoutsKey = 'erp_user_lockouts';
  const lockouts = getItem<Record<string, { lockedUntil: number; reason: string }>>(lockoutsKey) || {};
  
  lockouts[userId] = {
    lockedUntil: Date.now() + durationMinutes * 60 * 1000,
    reason
  };
  
  setItem(lockoutsKey, lockouts);
  
  // 记录安全事件
  logSecurityEvent({
    type: 'security_event',
    severity: 'high',
    action: '账户锁定',
    details: `用户 ${userId} 因 ${reason} 被锁定 ${durationMinutes} 分钟`,
    success: true
  });
}

// 解锁用户账户
export function unlockUserAccount(userId: string): void {
  if (typeof window === 'undefined') return;
  
  const lockoutsKey = 'erp_user_lockouts';
  const lockouts = getItem<Record<string, { lockedUntil: number; reason: string }>>(lockoutsKey) || {};
  
  delete lockouts[userId];
  setItem(lockoutsKey, lockouts);
  
  // 记录安全事件
  logSecurityEvent({
    type: 'security_event',
    severity: 'medium',
    action: '账户解锁',
    details: `用户 ${userId} 账户已解锁`,
    success: true
  });
}

// 检查用户账户是否被锁定
export function isUserLocked(userId: string): { locked: boolean; remainingTime?: number; reason?: string } {
  if (typeof window === 'undefined') return { locked: false };
  
  const lockoutsKey = 'erp_user_lockouts';
  const lockouts = getItem<Record<string, { lockedUntil: number; reason: string }>>(lockoutsKey) || {};
  
  const lockout = lockouts[userId];
  if (!lockout) return { locked: false };
  
  const now = Date.now();
  if (now < lockout.lockedUntil) {
    const remainingTime = Math.ceil((lockout.lockedUntil - now) / 1000 / 60);
    return { locked: true, remainingTime, reason: lockout.reason };
  }
  
  // 锁定已过期，自动解锁
  delete lockouts[userId];
  setItem(lockoutsKey, lockouts);
  
  return { locked: false };
}

// 检查异地登录
export function check异地登录(userId: string, ipAddress: string, userAgent: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const loginHistoryKey = 'erp_login_history';
  const loginHistory = getItem<Record<string, { ip: string; userAgent: string; timestamp: number }[]>>(loginHistoryKey) || {};
  
  if (!loginHistory[userId]) {
    // 首次登录，记录登录信息
    loginHistory[userId] = [{
      ip: ipAddress,
      userAgent,
      timestamp: Date.now()
    }];
    setItem(loginHistoryKey, loginHistory);
    return false;
  }
  
  // 获取最近的登录记录
  const recentLogins = loginHistory[userId].slice(-5); // 最近5次登录
  const lastLogin = recentLogins[recentLogins.length - 1];
  
  // 检查IP地址是否不同
  if (lastLogin.ip !== ipAddress) {
    // 记录异地登录事件
    logSecurityEvent({
      type: 'security_event',
      severity: 'medium',
      action: '异地登录检测',
      details: `用户 ${userId} 从新IP ${ipAddress} 登录，上次登录IP为 ${lastLogin.ip}`,
      success: true
    });
    
    // 锁定账户24小时
    lockUserAccount(userId, 24 * 60, '异地登录检测');
    return true;
  }
  
  // 更新登录历史
  loginHistory[userId].push({
    ip: ipAddress,
    userAgent,
    timestamp: Date.now()
  });
  
  // 只保留最近10次登录记录
  if (loginHistory[userId].length > 10) {
    loginHistory[userId] = loginHistory[userId].slice(-10);
  }
  
  setItem(loginHistoryKey, loginHistory);
  return false;
}

// 检查频繁换卡
export function check频繁换卡(userId: string, bankCard: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const cardHistoryKey = 'erp_card_history';
  const cardHistory = getItem<Record<string, { card: string; timestamp: number }[]>>(cardHistoryKey) || {};
  
  if (!cardHistory[userId]) {
    // 首次绑定银行卡，记录信息
    cardHistory[userId] = [{
      card: bankCard,
      timestamp: Date.now()
    }];
    setItem(cardHistoryKey, cardHistory);
    return false;
  }
  
  // 获取最近的换卡记录
  const recentCards = cardHistory[userId].slice(-3); // 最近3次换卡
  const lastCard = recentCards[recentCards.length - 1];
  
  // 检查是否是新卡
  if (lastCard.card !== bankCard) {
    // 检查换卡频率（24小时内）
    const now = Date.now();
    const recentCardChanges = recentCards.filter(c => now - c.timestamp < 24 * 60 * 60 * 1000);
    
    if (recentCardChanges.length >= 2) {
      // 24小时内换卡超过2次，锁定账户
      logSecurityEvent({
        type: 'security_event',
        severity: 'high',
        action: '频繁换卡检测',
        details: `用户 ${userId} 在24小时内频繁更换银行卡，已锁定账户`,
        success: true
      });
      
      lockUserAccount(userId, 24 * 60, '频繁换卡检测');
      return true;
    }
    
    // 记录新卡信息
    cardHistory[userId].push({
      card: bankCard,
      timestamp: Date.now()
    });
    
    // 只保留最近10次换卡记录
    if (cardHistory[userId].length > 10) {
      cardHistory[userId] = cardHistory[userId].slice(-10);
    }
    
    setItem(cardHistoryKey, cardHistory);
  }
  
  return false;
}

// 检查唯一实名校验
export function verifyRealName(userId: string, realName: string, idCard: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const realNameKey = 'erp_real_name_verification';
  const verifications = getItem<Record<string, { realName: string; idCard: string; verified: boolean }>>(realNameKey) || {};
  
  if (verifications[userId]) {
    // 已验证过，检查是否匹配
    return verifications[userId].realName === realName && 
           verifications[userId].idCard === idCard && 
           verifications[userId].verified;
  }
  
  // 模拟实名校验（实际应调用第三方API）
  const isVerified = /^[\u4e00-\u9fa5]{2,4}$/.test(realName) && 
                    /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idCard);
  
  verifications[userId] = {
    realName,
    idCard,
    verified: isVerified
  };
  
  setItem(realNameKey, verifications);
  
  // 记录实名校验事件
  logSecurityEvent({
    type: 'security_event',
    severity: 'medium',
    action: '实名校验',
    details: `用户 ${userId} 实名校验${isVerified ? '成功' : '失败'}`,
    success: isVerified
  });
  
  return isVerified;
}

// 更新用户最后登录时间
export function updateLastLogin(username: string): void {
  const users = getUsers();
  const user = users.find(u => u.username === username);
  if (user) {
    user.lastLogin = new Date().toLocaleString('zh-CN');
    saveUsers(users);
  }
}

// 保存记住密码的用户名
export function saveRememberedUsername(username: string): void {
  setItem(REMEMBERED_USERNAME_KEY, escapeHtml(username));
}

// 获取记住密码的用户名
export function getRememberedUsername(): string | null {
  return getItem<string>(REMEMBERED_USERNAME_KEY);
}

// 清除记住密码的用户名
export function clearRememberedUsername(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REMEMBERED_USERNAME_KEY);
}

/**
 * 修改密码
 */
export async function changePassword(
  userId: string, 
  oldPassword: string, 
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const user = getUserById(userId);
  if (!user) return { success: false, error: '用户不存在' };
  
  const isValid = await verifyPassword(oldPassword, user.password);
  if (!isValid) return { success: false, error: '原密码错误' };
  
  const strengthCheck = validatePasswordStrength(newPassword);
  if (!strengthCheck.isValid) {
    return { success: false, error: `密码强度不足：${strengthCheck.suggestions.join('、')}` };
  }
  
  user.password = await hashPassword(newPassword);
  user.passwordChangedAt = new Date().toISOString();
  user.updatedAt = new Date().toISOString();
  
  saveUser(user);
  return { success: true };
}

/**
 * 获取默认密码提示
 */
export function getDefaultPasswordHint(): Record<string, string> {
  return {
    admin: 'Admin@2024!',
    user: 'User@2024!',
    worker: 'Worker@2024!'
  };
}
