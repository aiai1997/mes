'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// 数据类型定义
interface DashboardData {
  productionProgress: Array<{ name: string; progress: number; target: number }>;
  salesData: Array<{ month: string; amount: number }>;
  inventoryData: Array<{ name: string; value: number }>;
  salaryData: Array<{ month: string; amount: number }>;
  paymentData: Array<{ month: string; amount: number }>;
  orderData: Array<{ status: string; value: number }>;
  keyMetrics: Array<{ name: string; value: string; change: string }>;
}

// 初始数据
const initialData: DashboardData = {
  productionProgress: [],
  salesData: [],
  inventoryData: [],
  salaryData: [],
  paymentData: [],
  orderData: [],
  keyMetrics: [],
};

// 颜色配置
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// 核心指标卡片组件
const MetricCard = ({ name, value, change }: { name: string; value: string; change: string }) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`text-sm ${change.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </div>
      </CardContent>
    </Card>
  );
};

// 生产进度图表组件
const ProductionProgressChart = ({ data }: { data: Array<{ name: string; progress: number; target: number }> }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>生产进度</CardTitle>
        <CardDescription>各订单生产完成情况</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="progress" name="完成进度" fill="#0088FE" />
            <Bar dataKey="target" name="目标" fill="#FF8042" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// 销售额图表组件
const SalesChart = ({ data }: { data: Array<{ month: string; amount: number }> }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>销售额趋势</CardTitle>
        <CardDescription>近6个月销售额变化</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" name="销售额" stroke="#0088FE" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// 库存分布图表组件
const InventoryChart = ({ data }: { data: Array<{ name: string; value: number }> }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>库存分布</CardTitle>
        <CardDescription>各类型库存占比</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// 工资支出图表组件
const SalaryChart = ({ data }: { data: Array<{ month: string; amount: number }> }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>工资支出</CardTitle>
        <CardDescription>近6个月工资支出变化</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" name="工资支出" stroke="#00C49F" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// 回款图表组件
const PaymentChart = ({ data }: { data: Array<{ month: string; amount: number }> }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>回款情况</CardTitle>
        <CardDescription>近6个月回款变化</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" name="回款金额" fill="#FFBB28" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// 订单状态图表组件
const OrderStatusChart = ({ data }: { data: Array<{ status: string; value: number }> }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>订单状态</CardTitle>
        <CardDescription>各状态订单数量分布</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// 主页面组件
const DashboardPage = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedWorkshop, setSelectedWorkshop] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardData>(initialData);
  const [error, setError] = useState<string | null>(null);

  // 从API获取数据
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/dashboard?timeRange=${selectedTimeRange}&department=${selectedDepartment}&workshop=${selectedWorkshop}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError('获取数据失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('获取数据失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载和参数变化时获取数据
  useEffect(() => {
    fetchData();
  }, [selectedTimeRange, selectedDepartment, selectedWorkshop]);

  // 处理刷新按钮点击
  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">数据大屏</h1>
          <p className="text-gray-500">实时监控企业运营数据</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">近7天</SelectItem>
              <SelectItem value="30days">近30天</SelectItem>
              <SelectItem value="3months">近3个月</SelectItem>
              <SelectItem value="6months">近6个月</SelectItem>
              <SelectItem value="1year">近1年</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="部门" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部部门</SelectItem>
              <SelectItem value="production">生产部</SelectItem>
              <SelectItem value="sales">销售部</SelectItem>
              <SelectItem value="finance">财务部</SelectItem>
              <SelectItem value="warehouse">仓库</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedWorkshop} onValueChange={setSelectedWorkshop}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="车间" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部车间</SelectItem>
              <SelectItem value="cutting">裁床车间</SelectItem>
              <SelectItem value="sewing">缝纫车间</SelectItem>
              <SelectItem value="finishing">尾部车间</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh}>刷新数据</Button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map((_, index) => (
            <Card key={index} className="h-full">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-1/4 mt-2" />
              </CardContent>
            </Card>
          ))
        ) : (
          data.keyMetrics.map((metric, index) => (
            <MetricCard
              key={index}
              name={metric.name}
              value={metric.value}
              change={metric.change}
            />
          ))
        )}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-80 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <ProductionProgressChart data={data.productionProgress} />
            <SalesChart data={data.salesData} />
            <InventoryChart data={data.inventoryData} />
            <SalaryChart data={data.salaryData} />
            <PaymentChart data={data.paymentData} />
            <OrderStatusChart data={data.orderData} />
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
