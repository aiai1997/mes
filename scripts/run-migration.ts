#!/usr/bin/env node

/**
 * 数据库迁移执行脚本
 * 执行RBAC权限系统相关的数据库迁移
 */

const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('开始执行RBAC数据库迁移...');

    // 读取迁移文件
    const migrationPath = path.join(__dirname, '../../database/migrations/20260404_rbac_migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // 这里需要根据实际的数据库连接方式执行SQL
    // 由于使用Supabase，我们可以通过Supabase客户端执行

    console.log('迁移SQL文件已准备就绪，请通过以下方式之一执行：');
    console.log('1. 在Supabase管理界面中执行SQL');
    console.log('2. 使用psql命令行工具执行');
    console.log('3. 通过应用程序代码执行');

    console.log('\n迁移文件路径:', migrationPath);
    console.log('迁移文件大小:', migrationSQL.length, '字符');

    // 验证SQL语法（基本检查）
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);
    console.log('SQL语句数量:', statements.length);

    console.log('RBAC数据库迁移准备完成！');

  } catch (error) {
    console.error('迁移执行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };