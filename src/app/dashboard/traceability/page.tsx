'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, QrCode, Download, Package, Scissors, Users, Truck, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { getZahaos, type Zhahao } from '@/types/zhahao';
import { getOrders, type Order } from '@/types/order';

interface TraceStep {
  stage: string;
  stageName: string;
  status: 'pending' | 'in_progress' | 'completed';
  operator?: string;
  time?: string;
  quantity?: number;
  location?: string;
}

export default function TraceabilityPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedZhahao, setSelectedZhahao] = useState<Zhahao | null>(null);
  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);
  const [zhahaos, setZhahaos] = useState<Zhahao[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setZhahaos(getZahaos());
    setOrders(getOrders());
  };

  const handleSearch = () => {
    const zhahao = zhahaos.find(z => 
      z.zhahaoCode === searchText || 
      z.orderNo.includes(searchText)
    );
    
    if (zhahao) {
      setSelectedZhahao(zhahao);
      buildTraceSteps(zhahao);
    } else {
      alert('未找到对应的扎号记录');
    }
  };

  const buildTraceSteps = (zhahao: Zhahao) => {
    const steps: TraceStep[] = [
      {
        stage: 'cutting',
        stageName: '裁床',
        status: zhahao.cuttingQuantity > 0 ? 'completed' : 'pending',
        operator: zhahao.cuttingOperator,
        time: zhahao.cuttingTime,
        quantity: zhahao.cuttingQuantity,
        location: zhahao.cuttingBed,
      },
      {
        stage: 'bundling',
        stageName: '扎包',
        status: zhahao.bundleQuantity > 0 ? 'completed' : 'pending',
        quantity: zhahao.bundleQuantity,
      },
      {
        stage: 'workshop',
        stageName: '车间生产',
        status: zhahao.workshopQuantity > 0 ? 'completed' : 'pending',
        operator: zhahao.workshopOperator,
        time: zhahao.workshopTime,
        quantity: zhahao.workshopQuantity,
      },
      {
        stage: 'tail',
        stageName: '尾部',
        status: zhahao.tailQuantity > 0 ? 'completed' : 'pending',
        quantity: zhahao.tailQuantity,
      },
      {
        stage: 'quality',
        stageName: '质检',
        status: zhahao.qualityQuantity > 0 ? 'completed' : 'pending',
        quantity: zhahao.qualityQuantity,
      },
      {
        stage: 'packing',
        stageName: '装箱',
        status: zhahao.packingQuantity > 0 ? 'completed' : 'pending',
        quantity: zhahao.packingQuantity,
      },
      {
        stage: 'inbound',
        stageName: '入库',
        status: zhahao.inboundQuantity > 0 ? 'completed' : 'pending',
        quantity: zhahao.inboundQuantity,
      },
      {
        stage: 'outbound',
        stageName: '发货',
        status: zhahao.outboundQuantity > 0 ? 'completed' : 'pending',
        quantity: zhahao.outboundQuantity,
      },
    ];

    // 根据当前进度设置进行中状态
    let foundInProgress = false;
    for (let i = steps.length - 1; i >= 0; i--) {
      if (!foundInProgress && steps[i].status === 'completed' && i + 1 < steps.length && steps[i + 1].status === 'pending') {
        steps[i + 1].status = 'in_progress';
        foundInProgress = true;
      }
    }

    setTraceSteps(steps);
  };

  const handleExport = () => {
    if (!selectedZhahao) return;

    const headers = ['扎号', '订单号', '颜色', '尺码', '数量', '工序', '操作人', '时间', '数量', '状态'];
    const rows: string[][] = [];
    
    traceSteps.forEach(step => {
      rows.push([
        selectedZhahao.zhahaoCode,
        selectedZhahao.orderNo,
        selectedZhahao.color,
        selectedZhahao.size,
        selectedZhahao.quantity.toString(),
        step.stageName,
        step.operator || '-',
        step.time || '-',
        step.quantity?.toString() || '-',
        step.status === 'completed' ? '已完成' : step.status === 'in_progress' ? '进行中' : '待处理',
      ]);
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `扎号追溯_${selectedZhahao.zhahaoCode}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-6 h-6 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'cutting':
        return <Scissors className="w-5 h-5" />;
      case 'workshop':
        return <Users className="w-5 h-5" />;
      case 'packing':
      case 'inbound':
        return <Package className="w-5 h-5" />;
      case 'outbound':
        return <Truck className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const order = selectedZhahao ? orders.find(o => o.orderNo === selectedZhahao.orderNo) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <QrCode className="w-6 h-6" />
              全流程追溯
            </h1>
            <p className="text-muted-foreground mt-1">扫描扎号条码，查看从裁床到发货的全流程记录</p>
          </div>
          {selectedZhahao && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出追溯报告
            </Button>
          )}
        </div>

        {/* 搜索区域 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>扎号条码</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="请输入扎号或扫描条码..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch}>
                    <Search className="w-4 h-4 mr-2" />
                    查询
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedZhahao && (
          <>
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>扎号信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">扎号</p>
                    <p className="font-bold text-lg">{selectedZhahao.zhahaoCode}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">订单号</p>
                    <p className="font-medium">{selectedZhahao.orderNo}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">款号</p>
                    <p className="font-medium">{order?.styleNo || '-'}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">颜色</p>
                    <p className="font-medium">{selectedZhahao.color}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">尺码</p>
                    <p className="font-medium">{selectedZhahao.size}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">数量</p>
                    <p className="font-bold text-lg text-primary">{selectedZhahao.quantity} 件</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 流程追溯图 */}
            <Card>
              <CardHeader>
                <CardTitle>生产流程追溯</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between overflow-x-auto pb-4">
                  {traceSteps.map((step, index) => (
                    <div key={step.stage} className="flex items-center flex-1 min-w-0">
                      <div className="flex flex-col items-center flex-1">
                        <div className={`
                          w-16 h-16 rounded-full flex items-center justify-center mb-2
                          ${step.status === 'completed' ? 'bg-green-500 text-white' : 
                            step.status === 'in_progress' ? 'bg-blue-500 text-white' : 
                            'bg-muted text-muted-foreground'}
                        `}>
                          {getStageIcon(step.stage)}
                        </div>
                        <p className="font-medium text-sm">{step.stageName}</p>
                        {step.quantity !== undefined && step.quantity > 0 && (
                          <p className="text-xs text-muted-foreground">{step.quantity} 件</p>
                        )}
                        {step.operator && (
                          <p className="text-xs text-muted-foreground">{step.operator}</p>
                        )}
                        {step.time && (
                          <p className="text-xs text-muted-foreground">{step.time}</p>
                        )}
                        <Badge 
                          variant={step.status === 'completed' ? 'default' : step.status === 'in_progress' ? 'secondary' : 'outline'}
                          className="mt-1"
                        >
                          {step.status === 'completed' ? '已完成' : step.status === 'in_progress' ? '进行中' : '待处理'}
                        </Badge>
                      </div>
                      {index < traceSteps.length - 1 && (
                        <div className="px-2">
                          <ArrowRight className={`w-5 h-5 ${
                            step.status === 'completed' ? 'text-green-500' : 'text-muted-foreground'
                          }`} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 详细记录 */}
            <Card>
              <CardHeader>
                <CardTitle>详细记录</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>工序</TableHead>
                      <TableHead>数量</TableHead>
                      <TableHead>操作人</TableHead>
                      <TableHead>时间</TableHead>
                      <TableHead>位置</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {traceSteps.map(step => (
                      <TableRow key={step.stage}>
                        <TableCell className="font-medium">{step.stageName}</TableCell>
                        <TableCell>{step.quantity || '-'} 件</TableCell>
                        <TableCell>{step.operator || '-'}</TableCell>
                        <TableCell>{step.time || '-'}</TableCell>
                        <TableCell>{step.location || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            step.status === 'completed' ? 'default' : 
                            step.status === 'in_progress' ? 'secondary' : 'outline'
                          }>
                            {step.status === 'completed' ? '已完成' : 
                             step.status === 'in_progress' ? '进行中' : '待处理'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* 最近扎号列表 */}
            <Card>
              <CardHeader>
                <CardTitle>最近扎号</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>扎号</TableHead>
                      <TableHead>订单号</TableHead>
                      <TableHead>颜色</TableHead>
                      <TableHead>尺码</TableHead>
                      <TableHead>数量</TableHead>
                      <TableHead>当前工序</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {zhahaos.slice(0, 5).map(z => (
                      <TableRow key={z.id} className={selectedZhahao.id === z.id ? 'bg-primary/5' : ''}>
                        <TableCell className="font-mono">{z.zhahaoCode}</TableCell>
                        <TableCell>{z.orderNo}</TableCell>
                        <TableCell>{z.color}</TableCell>
                        <TableCell>{z.size}</TableCell>
                        <TableCell>{z.quantity}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{z.currentProcess || '裁床'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedZhahao(z);
                              buildTraceSteps(z);
                            }}
                          >
                            查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {!selectedZhahao && (
          <Card>
            <CardContent className="py-12 text-center">
              <QrCode className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">请输入扎号条码进行查询</p>
              <p className="text-sm text-muted-foreground mt-2">支持扫描枪或手动输入扎号</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
