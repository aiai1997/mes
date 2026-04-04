// 验证码存储服务
// 注意：生产环境应使用数据库存储

interface VerificationCode {
  code: string;
  expires: number;
  attempts: number;
}

class VerificationCodeStore {
  private codes = new Map<string, VerificationCode>();

  set(key: string, code: string, expiresInMinutes: number = 5): void {
    const expires = Date.now() + expiresInMinutes * 60 * 1000;
    this.codes.set(key, { code, expires, attempts: 0 });
  }

  get(key: string): VerificationCode | undefined {
    return this.codes.get(key);
  }

  delete(key: string): void {
    this.codes.delete(key);
  }

  has(key: string): boolean {
    return this.codes.has(key);
  }

  // 清理过期验证码
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.codes.entries()) {
      if (value.expires < now) {
        this.codes.delete(key);
      }
    }
  }

  // 增加尝试次数
  incrementAttempts(key: string): boolean {
    const code = this.codes.get(key);
    if (!code) return false;

    code.attempts++;
    return true;
  }

  // 获取所有键（用于清理）
  keys(): string[] {
    return Array.from(this.codes.keys());
  }
}

// 全局验证码存储实例
export const verificationCodeStore = new VerificationCodeStore();

// 定期清理过期验证码
if (typeof global !== 'undefined') {
  setInterval(() => {
    verificationCodeStore.cleanup();
  }, 60000); // 每分钟清理一次
}