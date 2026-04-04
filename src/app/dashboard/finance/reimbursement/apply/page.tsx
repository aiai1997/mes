'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Plus, Save, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, type CurrentUser } from '@/types/user';
import { addReimbursementApplication, type ReimbursementApplication } from '@/types/finance';

const reimbursementCategories = [
  { value: '出差车费', label: '出差车费' },
  { value: '油费', label: '油费' },
  { value: '路费', label: '路费' },
  { value: '采购辅料', label: '采购辅料' },
  { value: '配件小额杂费', label: '配件小额杂费' },
  { value: '快递物流费', label: '快递物流费' },
  { value: '食堂食材杂费', label: '食堂食材杂费' },
  { value: '办公耗材费', label: '办公耗材费' },
  { value: '维修设备费', label: '维修设备费' },
  { value: '其他因公临时杂费', label: '其他因公临时杂费' },
];

export default function ReimbursementApplyPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 表单数据
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    useDate: '',
    description: '',
    attachments: [] as File[],
  });

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.category) {
      setError('请选择报销类目');
      return false;
    }
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      setError('请输入有效的报销金额');
      return false;
    }
    if (!formData.useDate) {
      setError('请选择使用日期');
      return false;
    }
    if (!formData.description.trim()) {
      setError('请输入报销说明');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    if (!currentUser) {
      setError('用户未登录');
      return;
    }

    setLoading(true);

    try {
      const newApplication: Omit<ReimbursementApplication, 'id'> = {
        reimbursementNo: `BX${Date.now()}`,
        employeeId: currentUser.id,
        employeeName: currentUser.realName,
        category: formData.category as ReimbursementApplication['category'],
        amount: Number(formData.amount),
        useDate: formData.useDate,
        description: formData.description,
        status: '待审核',
        attachments: formData.attachments.map(file => file.name),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addReimbursementApplication(newApplication);

      // 跳转回列表页
      router.push('/dashboard/finance/reimbursement');
    } catch (err) {
      setError('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">报销申请</h1>
            <p className="text-muted-foreground">提交因公费用报销申请</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 申请表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>报销信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 报销类目 */}
              <div>
                <Label htmlFor="category">报销类目 *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择报销类目" />
                  </SelectTrigger>
                  <SelectContent>
                    {reimbursementCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 报销金额 */}
              <div>
                <Label htmlFor="amount">报销金额 *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">¥</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="请输入报销金额"
                    className="pl-8"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                  />
                </div>
              </div>

              {/* 使用日期 */}
              <div>
                <Label htmlFor="useDate">使用日期 *</Label>
                <Input
                  id="useDate"
                  type="date"
                  value={formData.useDate}
                  onChange={(e) => handleInputChange('useDate', e.target.value)}
                />
              </div>

              {/* 报销说明 */}
              <div>
                <Label htmlFor="description">报销说明 *</Label>
                <Textarea
                  id="description"
                  placeholder="请详细说明报销事由、用途等信息"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 附件上传 */}
          <Card>
            <CardHeader>
              <CardTitle>附件上传</CardTitle>
              <p className="text-sm text-muted-foreground">请上传相关发票、收据等证明材料</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 文件上传区域 */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                        点击上传文件
                      </span>
                      <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                        支持 JPG、PNG、PDF 格式，大小不超过 10MB
                      </span>
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>

              {/* 已上传文件列表 */}
              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  <Label>已上传文件</Label>
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? '提交中...' : '提交申请'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}