'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Plus, Search, RotateCcw, Package, AlertTriangle, CheckCircle, Clock, Send, Inbox } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type CustomerMaterial,
  type CustomerMaterialStatus,
  type CustomerMaterialType,
  getCustomerMaterials,
  initMiscData,
} from '@/types/misc';

const statusColors: Record<CustomerMaterialStatus, string> = {
  '待收货': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '已入库': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '已发料': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  '已用完': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const typeLabels: Record<CustomerMaterialType, string> = {
  '客供料': '客供料',
  '委外加工': '委外加工',
};

export default function CustomerMaterialPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<CustomerMaterial[]>([]);
  
  const [searchNo, setSearchNo] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');
  const [searchType, setSearchType] = useState('全部');
  const [activeTab, setActiveTab] = useState('customer');
  
  useEffect(() => {
    initMiscData();
    loadData();
  }, []);
  
  const loadData = () => {
    setMaterials(getCustomerMaterials());
  };
  
  const filteredMaterials = materials.filter(m => {
    if (searchNo && !m.materialNo.includes(searchNo)) return false;
    if (searchCustomer && !m.customerName.includes(searchCustomer)) return false;
    if (searchStatus !== '全部' && m.status !== searchStatus) return false;
    if (searchType !== '全部' && m.materialType !== searchType) return false;
    if (activeTab === 'customer' && m.materialType !== '客供料') return false;
    if (activeTab === 'outsource' && m.materialType !== '委外加工') return false;
    return true;
  });
  
  const handleReset = () => {
    setSearchNo('');
    setSearchCustomer('');
    setSearchStatus('全部');
    setSearchType('全部');
  };
  
  const stats = {
    total: materials.length,
    customer: materials.filter(m => m.materialType === '客供料').length,
    outsource: materials.filter(m => m.materialType === '委外加工').length,
    pending: materials.filter(m => m.status === '待收货').length,
  };
  
  const customerStats = {
    total: materials.filter(m => m.materialType === '客供料').length,
    inStock: materials.filter(m => m.materialType === '客供料' && m.status === '已入库').length,
    issued: materials.filter(m => m.materialType === '客供料' && m.status === '已发料').length,
  };
  
  const outsourceStats = {
    total: materials.filter(m => m.materialType === '委外加工').length,
    inProgress: materials.filter(m => m.materialType === '委外加工' && (m.status === '已入库' || m.status === '已发料')).length,
    completed: materials.filter(m => m.materialType === '委外加工' && m.status === '已用完').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">客供料/委外仓储</h1>
              <p className="text-muted-foreground text-sm">客供物料管理、委外加工物料跟踪</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/dashboard/customer-material/create?type=customer')}>
              <Inbox className="w-4 h-4 mr-2" />客供料入库
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard/customer-material/create?type=outsource')}>
              <Send className="w-4 h-4 mr-2" />委外发料
            </Button>
          </div>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">物料总数</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">客供料</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.customer}</p>
                </div>
                <Inbox className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">委外加工</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.outsource}</p>
                </div>
                <Send className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待收货</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer">客供料管理</TabsTrigger>
            <TabsTrigger value="outsource">委外加工管理</TabsTrigger>
          </TabsList>
          
          {/* 查询区 */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label>物料编号</Label>
                  <Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>客户</Label>
                  <Input placeholder="请输入" value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>状态</Label>
                  <Select value={searchStatus} onValueChange={setSearchStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="全部">全部</SelectItem>
                      <SelectItem value="待收货">待收货</SelectItem>
                      <SelectItem value="已入库">已入库</SelectItem>
                      <SelectItem value="已发料">已发料</SelectItem>
                      <SelectItem value="已用完">已用完</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={loadData} className="flex-1">查询</Button>
                  <Button variant="outline" onClick={handleReset}><RotateCcw className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 列表 */}
          <Card className="mt-4">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>物料编号</TableHead>
                    <TableHead>物料名称</TableHead>
                    <TableHead>客户</TableHead>
                    <TableHead>关联订单</TableHead>
                    <TableHead className="text-right">应收数量</TableHead>
                    <TableHead className="text-right">已收数量</TableHead>
                    <TableHead className="text-right">已发数量</TableHead>
                    <TableHead>仓库</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="w-20">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                        暂无{activeTab === 'customer' ? '客供料' : '委外加工'}记录
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMaterials.map(mat => (
                      <TableRow key={mat.id}>
                        <TableCell className="font-medium">{mat.materialNo}</TableCell>
                        <TableCell>{mat.materialName}</TableCell>
                        <TableCell>{mat.customerName}</TableCell>
                        <TableCell>{mat.orderNo}</TableCell>
                        <TableCell className="text-right">{mat.totalQuantity}</TableCell>
                        <TableCell className="text-right">{mat.receivedQuantity}</TableCell>
                        <TableCell className="text-right">{mat.issuedQuantity}</TableCell>
                        <TableCell>{mat.warehouseName}</TableCell>
                        <TableCell><Badge className={statusColors[mat.status]}>{mat.status}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/customer-material/${mat.id}`)}>
                              查看
                            </Button>
                            {mat.status === '待收货' && (
                              <Button size="sm" variant="ghost" className="text-green-600">
                                收货
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="p-4 border-t text-sm text-muted-foreground">
                共 {filteredMaterials.length} 条记录
              </div>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
