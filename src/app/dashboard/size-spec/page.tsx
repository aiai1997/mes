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
import { Ruler, Plus, Search, RotateCcw, FileSpreadsheet, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type SizeSpec,
  type SizeSpecDetail,
  getSizeSpecs,
  initMiscData,
} from '@/types/misc';

export default function SizeSpecPage() {
  const router = useRouter();
  const [specs, setSpecs] = useState<SizeSpec[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<SizeSpec | null>(null);
  
  const [searchName, setSearchName] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  
  useEffect(() => {
    initMiscData();
    loadData();
  }, []);
  
  const loadData = () => {
    const allSpecs = getSizeSpecs();
    setSpecs(allSpecs);
    if (allSpecs.length > 0 && !selectedSpec) {
      setSelectedSpec(allSpecs[0]);
    }
  };
  
  const filteredSpecs = specs.filter(s => {
    if (searchName && !s.name.includes(searchName)) return false;
    if (searchCustomer && !s.customer.includes(searchCustomer)) return false;
    return true;
  });
  
  const handleReset = () => {
    setSearchName('');
    setSearchCustomer('');
  };
  
  // 获取尺码列
  const sizeColumns = selectedSpec?.sizes || [];
  
  // 获取测量点
  const measurePoints = selectedSpec?.measurePoints || [];

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Ruler className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">尺码规格表</h1>
              <p className="text-muted-foreground text-sm">服装尺寸规格模板，支持多客户、多品类</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/size-spec/create')}>
            <Plus className="w-4 h-4 mr-2" />新建规格表
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 规格表列表 */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex justify-between items-center">
                规格表列表
                <Badge variant="outline">{specs.length}</Badge>
              </CardTitle>
              <div className="flex gap-2 mt-2">
                <Input placeholder="名称" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="h-8" />
                <Input placeholder="客户" value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} className="h-8" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredSpecs.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">暂无规格表</div>
                ) : (
                  filteredSpecs.map(spec => (
                    <div
                      key={spec.id}
                      className={`p-3 cursor-pointer hover:bg-muted/50 ${selectedSpec?.id === spec.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedSpec(spec)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{spec.name}</div>
                          <div className="text-sm text-muted-foreground">{spec.customer}</div>
                        </div>
                        <Badge variant="outline">{spec.category}</Badge>
                      </div>
                      <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                        <span>尺码: {spec.sizes.join('/')}</span>
                        <span>|</span>
                        <span>测量点: {spec.measurePoints.length}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* 规格表详情 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  {selectedSpec?.name || '规格表详情'}
                </div>
                {selectedSpec && (
                  <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/size-spec/${selectedSpec.id}/edit`)}>
                    <Edit2 className="w-4 h-4 mr-1" />编辑
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!selectedSpec ? (
                <div className="p-8 text-center text-muted-foreground">请选择一个规格表</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="sticky left-0 bg-muted/50 min-w-[120px]">测量点</TableHead>
                        <TableHead className="w-16">单位</TableHead>
                        <TableHead className="w-16">允差</TableHead>
                        {sizeColumns.map(size => (
                          <TableHead key={size} className="text-center min-w-[80px]">{size}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {measurePoints.map((point, idx) => {
                        const detail = selectedSpec.details.find(d => d.measurePoint === point) || {
                          measurePoint: point,
                          unit: 'cm',
                          tolerance: '±0.5',
                          values: {},
                        };
                        return (
                          <TableRow key={point}>
                            <TableCell className="sticky left-0 bg-background font-medium">{point}</TableCell>
                            <TableCell>{detail.unit}</TableCell>
                            <TableCell>{detail.tolerance}</TableCell>
                            {sizeColumns.map(size => (
                              <TableCell key={size} className="text-center">
                                {detail.values[size] || '-'}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  
                  <div className="p-4 border-t bg-muted/30">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">客户：</span>
                        <span className="font-medium">{selectedSpec.customer}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">品类：</span>
                        <span className="font-medium">{selectedSpec.category}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">版本：</span>
                        <span className="font-medium">{selectedSpec.version}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">更新时间：</span>
                        <span className="font-medium">{selectedSpec.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
