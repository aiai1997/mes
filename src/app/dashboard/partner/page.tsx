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
import {
  Building2,
  Truck,
  Plus,
  Eye,
  Edit,
  DollarSign,
  Package,
  RotateCcw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type Customer,
  type Supplier,
  getCustomers,
  getSuppliers,
  initPartnerData,
} from '@/types/partner';

export default function PartnerPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [activeTab, setActiveTab] = useState('customers');
  
  const [searchLevel, setSearchLevel] = useState('全部');
  const [searchKeyword, setSearchKeyword] = useState('');
  
  useEffect(() => {
    initPartnerData();
    loadData();
  }, []);
  
  const loadData = () => {
    setCustomers(getCustomers());
    setSuppliers(getSuppliers());
  };
  
  const filteredCustomers = customers.filter(c => {
    if (searchLevel !== '全部' && c.level !== searchLevel) return false;
    if (searchKeyword && !c.customerName.includes(searchKeyword) && !c.shortName.includes(searchKeyword)) return false;
    return true;
  });
  
  const stats = {
    customers: customers.length,
    suppliers: suppliers.length,
    totalReceivable: customers.reduce((sum, c) => sum + (c.totalAmount || 0), 0),
    totalPayable: suppliers.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">客户与供应商管理</h1>
              <p className="text-muted-foreground text-sm">客户档案、供应商档案、应收应付</p>
            </div>
          </div>
          <Button className="gap-2" onClick={() => router.push('/dashboard/partner/create')}>
            <Plus className="w-4 h-4" />新增客商
          </Button>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">客户数量</p>
                  <p className="text-2xl font-bold text-foreground">{stats.customers}</p>
                </div>
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">供应商数量</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.suppliers}</p>
                </div>
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">应收总额</p>
                  <p className="text-2xl font-bold text-green-600">¥{stats.totalReceivable.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">应付总额</p>
                  <p className="text-2xl font-bold text-orange-600">¥{stats.totalPayable.toLocaleString()}</p>
                </div>
                <Package className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="customers">客户管理</TabsTrigger>
            <TabsTrigger value="suppliers">供应商管理</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 items-end">
                  <div>
                    <Label>客户等级</Label>
                    <Select value={searchLevel} onValueChange={setSearchLevel}>
                      <SelectTrigger className="mt-1 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="全部">全部</SelectItem>
                        <SelectItem value="A级">A级</SelectItem>
                        <SelectItem value="B级">B级</SelectItem>
                        <SelectItem value="C级">C级</SelectItem>
                        <SelectItem value="D级">D级</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label>搜索</Label>
                    <Input placeholder="客户名称/简称" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} className="mt-1" />
                  </div>
                  <Button onClick={loadData}>查询</Button>
                  <Button variant="outline" onClick={() => { setSearchLevel('全部'); setSearchKeyword(''); }}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>客户编码</TableHead>
                        <TableHead>客户名称</TableHead>
                        <TableHead>简称</TableHead>
                        <TableHead>联系人</TableHead>
                        <TableHead>电话</TableHead>
                        <TableHead>等级</TableHead>
                        <TableHead>账期</TableHead>
                        <TableHead className="text-right">订单金额</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className="w-20">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                            暂无客户数据
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCustomers.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">{c.customerCode}</TableCell>
                            <TableCell>{c.customerName}</TableCell>
                            <TableCell>{c.shortName}</TableCell>
                            <TableCell>{c.contact}</TableCell>
                            <TableCell>{c.phone}</TableCell>
                            <TableCell>
                              <Badge className={c.level === 'A级' ? 'bg-green-100 text-green-700' : c.level === 'B级' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                                {c.level}
                              </Badge>
                            </TableCell>
                            <TableCell>{c.creditDays}天</TableCell>
                            <TableCell className="text-right">¥{(c.totalAmount || 0).toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge className={c.status === '启用' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                {c.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/partner/${c.id}`)} title="查看"><Eye className="w-4 h-4" /></Button>
                                <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/partner/${c.id}/edit`)} title="编辑"><Edit className="w-4 h-4" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="suppliers" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">供应商列表</CardTitle>
                <Button size="sm" className="gap-2" onClick={() => router.push('/dashboard/partner/create')}>
                  <Plus className="w-4 h-4" />新增供应商
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>供应商编码</TableHead>
                        <TableHead>供应商名称</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>联系人</TableHead>
                        <TableHead>电话</TableHead>
                        <TableHead>付款方式</TableHead>
                        <TableHead className="text-right">采购金额</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className="w-20">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suppliers.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.supplierCode}</TableCell>
                          <TableCell>{s.supplierName}</TableCell>
                          <TableCell>
                            <Badge className={
                              s.supplierType === '面料' ? 'bg-blue-100 text-blue-700' :
                              s.supplierType === '辅料' ? 'bg-green-100 text-green-700' :
                              'bg-purple-100 text-purple-700'
                            }>
                              {s.supplierType}
                            </Badge>
                          </TableCell>
                          <TableCell>{s.contact}</TableCell>
                          <TableCell>{s.phone}</TableCell>
                          <TableCell>{s.paymentMethod}</TableCell>
                          <TableCell className="text-right">¥{(s.totalAmount || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={s.status === '启用' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {s.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/partner/${s.id}`)} title="查看"><Eye className="w-4 h-4" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/partner/${s.id}/edit`)} title="编辑"><Edit className="w-4 h-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
