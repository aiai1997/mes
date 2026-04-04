'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, Database } from 'lucide-react';

export default function SyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    setSyncing(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/sync-data');
      const result = await response.json();
      
      if (result.success) {
        // 同步用户数据
        localStorage.setItem('erp_users', JSON.stringify(result.data.users));
        
        // 同步员工数据
        localStorage.setItem('erp_employees', JSON.stringify(result.data.employees));
        
        // 同步客户数据
        localStorage.setItem('erp_customers', JSON.stringify(result.data.customers));
        
        // 同步供应商数据
        localStorage.setItem('erp_suppliers', JSON.stringify(result.data.suppliers));
        
        // 同步班组数据
        localStorage.setItem('erp_teams', JSON.stringify(result.data.teams));
        
        // 同步订单数据
        localStorage.setItem('erp_orders', JSON.stringify(result.data.orders));
        
        // 同步物料数据
        localStorage.setItem('erp_materials', JSON.stringify(result.data.materials));
        
        setSynced(true);
        setMessage(`同步成功！已同步 ${result.data.users.length} 个用户、${result.data.employees.length} 个员工、${result.data.orders.length} 个订单等数据。`);
        
        // 3秒后跳转到登录页
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setMessage('同步失败：' + result.error);
      }
    } catch (error) {
      setMessage('同步失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    // 检查是否已经同步过
    const users = localStorage.getItem('erp_users');
    if (users) {
      setSynced(true);
      setMessage('数据已同步，即将跳转到登录页...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Database className="w-8 h-8 text-blue-600 dark:text-blue-300" />
          </div>
          <CardTitle className="text-2xl font-bold">
            数据同步
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            将云端数据库数据同步到本地浏览器
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {synced ? (
            <div className="text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
              <p className="text-xs text-gray-500">正在跳转到登录页...</p>
            </div>
          ) : (
            <>
              <Button 
                onClick={handleSync} 
                disabled={syncing}
                className="w-full"
                size="lg"
              >
                {syncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    正在同步...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    开始同步数据
                  </>
                )}
              </Button>
              
              {message && (
                <p className="text-sm text-red-500 text-center">{message}</p>
              )}
              
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>将同步以下数据：</p>
                <ul className="list-disc list-inside ml-2">
                  <li>用户账号（管理员、员工账号）</li>
                  <li>员工信息</li>
                  <li>客户与供应商</li>
                  <li>订单与物料</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
