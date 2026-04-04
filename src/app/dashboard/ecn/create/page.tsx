'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  FileEdit, 
  Save,
  AlertTriangle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type ChangeType,
  type Priority,
  saveECN,
  getECNs,
} from '@/types/misc';

const changeTypes: ChangeType[] = ['工艺变更', '物料变更', '尺寸变更', '颜色变更', '包装变更', '其他变更'];
const priorities: Priority[] = ['紧急', '普通', '低'];

export default function ECNCreatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    changeType: '工艺变更' as ChangeType,
    priority: '普通' as Priority,
    bomNo: '',
    orderNo: '',
    changeContent: '',
    changeReason: '',
  });

  const handleSubmit = async () => {
    if (!formData.changeContent.trim()) {
      alert('请填写变更内容');
      return;
    }
    if (!formData.changeReason.trim()) {
      alert('请填写变更原因');
      return;
    }

    setSaving(true);
    
    // 生成ECN编号
    const ecns = getECNs();
    const ecnNo = `ECN${Date.now().toString().slice(-8)}`;
    
    const newECN = {
      id: Date.now().toString(),
      ecnNo,
      changeType: formData.changeType,
      priority: formData.priority,
      bomNo: formData.bomNo,
      orderNo: formData.orderNo,
      changeContent: formData.changeContent,
      beforeContent: '',
      afterContent: formData.changeContent,
      changeReason: formData.changeReason,
      affectedOrders: 0,
      affectBOM: false,
      affectCutting: false,
      affectWorkshop: false,
      affectPurchase: false,
      applicant: 'admin',
      status: '申请中' as const,
      attachments: [],
      remark: '',
      createdAt: new Date().toLocaleString('zh-CN'),
      updatedAt: new Date().toLocaleString('zh-CN'),
    };
    
    saveECN(newECN);
    
    setSaving(false);
    alert('ECN申请已提交！');
    router.push('/dashboard/ecn');
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard/ecn')}>
            <ArrowLeft className="w-4 h-4 mr-2" />返回
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">申请工程变更</h1>
            <p className="text-muted-foreground text-sm">填写变更信息并提交审批</p>
          </div>
        </div>

        {/* 表单 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileEdit className="w-5 h-5" />
              变更信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>变更类型 <span className="text-red-500">*</span></Label>
                <Select 
                  value={formData.changeType} 
                  onValueChange={(v) => setFormData({ ...formData, changeType: v as ChangeType })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {changeTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>紧急程度 <span className="text-red-500">*</span></Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(v) => setFormData({ ...formData, priority: v as Priority })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(p => (
                      <SelectItem key={p} value={p}>
                        <span className={p === '紧急' ? 'text-red-600' : ''}>{p}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>关联BOM</Label>
                <Input 
                  placeholder="输入BOM编号" 
                  value={formData.bomNo}
                  onChange={(e) => setFormData({ ...formData, bomNo: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>关联订单</Label>
                <Input 
                  placeholder="输入订单编号" 
                  value={formData.orderNo}
                  onChange={(e) => setFormData({ ...formData, orderNo: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>变更内容 <span className="text-red-500">*</span></Label>
              <Textarea 
                placeholder="请详细描述变更内容..."
                value={formData.changeContent}
                onChange={(e) => setFormData({ ...formData, changeContent: e.target.value })}
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div>
              <Label>变更原因 <span className="text-red-500">*</span></Label>
              <Textarea 
                placeholder="请说明变更原因..."
                value={formData.changeReason}
                onChange={(e) => setFormData({ ...formData, changeReason: e.target.value })}
                className="mt-1 min-h-[80px]"
              />
            </div>

            <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">提交后需经过评审审批，请确保信息准确完整。</span>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard/ecn')}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                提交中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                提交申请
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
