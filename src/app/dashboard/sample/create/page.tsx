'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import {
  type Sample,
  type SampleMaterial,
  type SampleType,
  initSampleData,
  saveSample,
  generateSampleNo,
} from '@/types/sample';
import { getCustomers, type Customer } from '@/types/partner';
import { getTeams, type Team } from '@/types/employee';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '其他'];

export default function SampleCreatePage() {
  const router = useRouter();
  
  // 基本信息
  const [sampleType, setSampleType] = useState<SampleType>('确认样');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [styleNo, setStyleNo] = useState('');
  const [productName, setProductName] = useState('');
  const [size, setSize] = useState('M');
  const [customSize, setCustomSize] = useState('');
  const [color, setColor] = useState('');
  
  // 打样要求
  const [requirements, setRequirements] = useState('');
  const [materialRequirement, setMaterialRequirement] = useState('');
  const [processRequirement, setProcessRequirement] = useState('');
  
  // 打样信息
  const [designer, setDesigner] = useState('');
  
  // 用料明细
  const [materials, setMaterials] = useState<SampleMaterial[]>([
    { id: '1', materialId: '', materialName: '', unit: '米', quantity: 0, unitPrice: 0, amount: 0 }
  ]);
  
  // 成本
  const [laborCost, setLaborCost] = useState(50);
  const [remark, setRemark] = useState('');

  // 初始化数据
  const customers = getCustomers().filter(c => c.status === '启用');
  const teamsData = getTeams().filter(t => t.status === '启用');
  const [teams] = useState(teamsData);
  const [customersList] = useState(customers);
  
  // 默认选择打样组
  const sampleTeam = teamsData.find(t => t.teamName.includes('打样') || t.teamType === '其他');
  const [teamId, setTeamId] = useState(sampleTeam?.id || '');
  const [teamName, setTeamName] = useState(sampleTeam?.teamName || '');

  // 计算材料成本
  const materialCost = materials.reduce((sum, m) => sum + m.amount, 0);
  const totalCost = materialCost + laborCost;

  // 选择客户
  const handleCustomerChange = (id: string) => {
    setCustomerId(id);
    const customer = customersList.find(c => c.id === id);
    setCustomerName(customer?.customerName || '');
  };

  // 选择班组
  const handleTeamChange = (id: string) => {
    setTeamId(id);
    const team = teams.find(t => t.id === id);
    setTeamName(team?.teamName || '');
  };

  // 更新材料
  const updateMaterial = (index: number, field: keyof SampleMaterial, value: string | number) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: value };
    
    // 自动计算金额
    if (field === 'quantity' || field === 'unitPrice') {
      updated[index].amount = Number(updated[index].quantity) * Number(updated[index].unitPrice);
    }
    
    setMaterials(updated);
  };

  // 添加材料行
  const addMaterial = () => {
    setMaterials([
      ...materials,
      { id: Date.now().toString(), materialId: '', materialName: '', unit: '米', quantity: 0, unitPrice: 0, amount: 0 }
    ]);
  };

  // 删除材料行
  const removeMaterial = (index: number) => {
    if (materials.length > 1) {
      setMaterials(materials.filter((_, i) => i !== index));
    }
  };

  // 保存
  const handleSave = () => {
    if (!customerName) {
      alert('请选择客户');
      return;
    }
    if (!styleNo) {
      alert('请输入款号');
      return;
    }
    if (!productName) {
      alert('请输入产品名称');
      return;
    }
    
    const finalSize = size === '其他' ? customSize : size;
    
    const newSample: Sample = {
      id: Date.now().toString(),
      sampleNo: generateSampleNo(),
      sampleType,
      customerId,
      customerName,
      styleNo,
      productName,
      size: finalSize,
      color,
      requirements,
      materialRequirement,
      processRequirement,
      teamId,
      teamName,
      designer,
      materials: materials.filter(m => m.materialName),
      materialCost,
      laborCost,
      totalCost,
      status: '申请中',
      photos: [],
      remark,
      createdBy: 'admin',
      createdAt: new Date().toLocaleString('zh-CN'),
      updatedAt: new Date().toLocaleString('zh-CN'),
    };
    
    saveSample(newSample);
    router.push('/dashboard/sample');
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/sample')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">申请打样</h1>
            <p className="text-muted-foreground">填写样衣申请信息</p>
          </div>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />提交申请
          </Button>
        </div>

        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>样衣类型 *</Label>
                <Select value={sampleType} onValueChange={(v) => setSampleType(v as SampleType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="初样">初样</SelectItem>
                    <SelectItem value="修改样">修改样</SelectItem>
                    <SelectItem value="确认样">确认样</SelectItem>
                    <SelectItem value="产前样">产前样</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>客户 *</Label>
                <Select value={customerId} onValueChange={handleCustomerChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择客户" />
                  </SelectTrigger>
                  <SelectContent>
                    {customersList.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.customerName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>款号 *</Label>
                <Input 
                  value={styleNo} 
                  onChange={(e) => setStyleNo(e.target.value)}
                  placeholder="如：ST2024001"
                />
              </div>
              <div className="space-y-2">
                <Label>产品名称 *</Label>
                <Input 
                  value={productName} 
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="如：男士休闲T恤"
                />
              </div>
              <div className="space-y-2">
                <Label>尺寸</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {size === '其他' && (
                <div className="space-y-2">
                  <Label>自定义尺寸</Label>
                  <Input 
                    value={customSize} 
                    onChange={(e) => setCustomSize(e.target.value)}
                    placeholder="输入尺寸"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>颜色</Label>
                <Input 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="如：白色"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 打样要求 */}
        <Card>
          <CardHeader>
            <CardTitle>打样要求</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>整体要求</Label>
              <Textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="描述样衣的整体要求，如面料质感、版型风格等"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>面料要求</Label>
                <Textarea
                  value={materialRequirement}
                  onChange={(e) => setMaterialRequirement(e.target.value)}
                  placeholder="如：纯棉、涤纶、混纺等"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>工艺要求</Label>
                <Textarea
                  value={processRequirement}
                  onChange={(e) => setProcessRequirement(e.target.value)}
                  placeholder="如：平缝、包边、压条等"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 打样信息 */}
        <Card>
          <CardHeader>
            <CardTitle>打样信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>打样组</Label>
                <Select value={teamId} onValueChange={handleTeamChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择班组" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.teamName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>设计师</Label>
                <Input 
                  value={designer} 
                  onChange={(e) => setDesigner(e.target.value)}
                  placeholder="设计师姓名"
                />
              </div>
              <div className="space-y-2">
                <Label>人工成本</Label>
                <Input 
                  type="number"
                  value={laborCost} 
                  onChange={(e) => setLaborCost(Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 用料明细 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>用料明细</CardTitle>
            <Button size="sm" variant="outline" onClick={addMaterial}>
              <Plus className="w-4 h-4 mr-1" />添加物料
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">物料名称</TableHead>
                  <TableHead className="w-[100px]">单位</TableHead>
                  <TableHead className="w-[120px]">数量</TableHead>
                  <TableHead className="w-[120px]">单价</TableHead>
                  <TableHead className="w-[120px]">金额</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material, index) => (
                  <TableRow key={material.id}>
                    <TableCell>
                      <Input
                        value={material.materialName}
                        onChange={(e) => updateMaterial(index, 'materialName', e.target.value)}
                        placeholder="输入物料名称"
                      />
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={material.unit} 
                        onValueChange={(v) => updateMaterial(index, 'unit', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="米">米</SelectItem>
                          <SelectItem value="码">码</SelectItem>
                          <SelectItem value="千克">千克</SelectItem>
                          <SelectItem value="个">个</SelectItem>
                          <SelectItem value="套">套</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={material.quantity || ''}
                        onChange={(e) => updateMaterial(index, 'quantity', Number(e.target.value))}
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={material.unitPrice || ''}
                        onChange={(e) => updateMaterial(index, 'unitPrice', Number(e.target.value))}
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      ¥{material.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeMaterial(index)}
                        disabled={materials.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 成本汇总 */}
        <Card>
          <CardHeader>
            <CardTitle>成本汇总</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">材料成本</p>
                <p className="text-2xl font-bold">¥{materialCost.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">人工成本</p>
                <p className="text-2xl font-bold">¥{laborCost.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-primary">总成本</p>
                <p className="text-2xl font-bold text-primary">¥{totalCost.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 备注 */}
        <Card>
          <CardHeader>
            <CardTitle>备注</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="其他说明事项"
              rows={3}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
