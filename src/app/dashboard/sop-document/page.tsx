'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileQuestion, Plus, Eye, RotateCcw, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getSOPDocuments, type SOPDocument } from '@/types/production-advanced-2';

const categoryColors: Record<string, string> = {
  '裁剪': 'bg-yellow-100 text-yellow-700',
  '缝制': 'bg-blue-100 text-blue-700',
  '整烫': 'bg-purple-100 text-purple-700',
  '包装': 'bg-green-100 text-green-700',
  '品质': 'bg-red-100 text-red-700',
};

export default function SOPDocumentPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<SOPDocument[]>([]);
  const [searchName, setSearchName] = useState('');
  const [searchCategory, setSearchCategory] = useState('全部');

  useEffect(() => { setDocs(getSOPDocuments()); }, []);

  const handleReset = () => { setSearchName(''); setSearchCategory('全部'); };

  const filtered = docs.filter(d => {
    if (searchName && !d.name.includes(searchName)) return false;
    if (searchCategory !== '全部' && d.category !== searchCategory) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <FileQuestion className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">生产SOP工艺文档管理</h1>
              <p className="text-muted-foreground text-sm">标准作业程序文件上传与管理</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/sop-document/create')}>
            <Plus className="w-4 h-4 mr-2" />新增文档
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">文档总数</p><p className="text-2xl font-bold">{docs.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">裁剪</p><p className="text-2xl font-bold text-yellow-600">{docs.filter(d => d.category === '裁剪').length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">缝制</p><p className="text-2xl font-bold text-blue-600">{docs.filter(d => d.category === '缝制').length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">品质</p><p className="text-2xl font-bold text-red-600">{docs.filter(d => d.category === '品质').length}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>文档名称</Label><Input placeholder="请输入" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="mt-1" /></div>
              <div><Label>分类</Label>
                <Select value={searchCategory} onValueChange={setSearchCategory}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="裁剪">裁剪</SelectItem>
                    <SelectItem value="缝制">缝制</SelectItem>
                    <SelectItem value="整烫">整烫</SelectItem>
                    <SelectItem value="包装">包装</SelectItem>
                    <SelectItem value="品质">品质</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button className="flex-1">查询</Button>
                <Button variant="outline" onClick={handleReset}><RotateCcw className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>文档编号</TableHead>
                  <TableHead>文档名称</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>工序</TableHead>
                  <TableHead>版本</TableHead>
                  <TableHead>文件名</TableHead>
                  <TableHead>上传人</TableHead>
                  <TableHead>上传时间</TableHead>
                  <TableHead className="w-24">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.code}</TableCell>
                    <TableCell>{d.name}</TableCell>
                    <TableCell><Badge className={categoryColors[d.category]}>{d.category}</Badge></TableCell>
                    <TableCell>{d.process}</TableCell>
                    <TableCell>V{d.version}</TableCell>
                    <TableCell className="text-sm">{d.fileName}</TableCell>
                    <TableCell>{d.uploadedBy}</TableCell>
                    <TableCell className="text-sm">{d.uploadedAt}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost"><Download className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">共 {filtered.length} 条记录</div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
