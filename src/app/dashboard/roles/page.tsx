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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Plus, Edit, Trash2, Download, Users } from 'lucide-react';
import { getCurrentUser } from '@/types/user';

interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  status: '启用' | '停用';
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  module: string;
  name: string;
  code: string;
  actions: { name: string; code: string }[];
}

// 权限模块定义
const permissionModules: Permission[] = [
  {
    module: 'dashboard',
    name: '工作台',
    code: 'dashboard',
    actions: [
      { name: '查看', code: 'view' },
    ]
  },
  {
    module: 'order',
    name: '订单管理',
    code: 'order',
    actions: [
      { name: '查看', code: 'view' },
      { name: '新增', code: 'create' },
      { name: '编辑', code: 'edit' },
      { name: '删除', code: 'delete' },
      { name: '审核', code: 'audit' },
      { name: '导出', code: 'export' },
      { name: '打印', code: 'print' },
    ]
  },
  {
    module: 'bom',
    name: 'BOM管理',
    code: 'bom',
    actions: [
      { name: '查看', code: 'view' },
      { name: '新增', code: 'create' },
      { name: '编辑', code: 'edit' },
      { name: '删除', code: 'delete' },
      { name: '审核', code: 'audit' },
      { name: '导出', code: 'export' },
      { name: '打印', code: 'print' },
    ]
  },
  {
    module: 'cutting',
    name: '裁床管理',
    code: 'cutting',
    actions: [
      { name: '查看', code: 'view' },
      { name: '新增', code: 'create' },
      { name: '编辑', code: 'edit' },
      { name: '删除', code: 'delete' },
      { name: '导出', code: 'export' },
      { name: '打印', code: 'print' },
    ]
  },
  {
    module: 'workshop',
    name: '车间报工',
    code: 'workshop',
    actions: [
      { name: '查看', code: 'view' },
      { name: '报工', code: 'report' },
      { name: '审核', code: 'audit' },
      { name: '导出', code: 'export' },
    ]
  },
  {
    module: 'tail',
    name: '尾部管理',
    code: 'tail',
    actions: [
      { name: '查看', code: 'view' },
      { name: '操作', code: 'operate' },
      { name: '导出', code: 'export' },
    ]
  },
  {
    module: 'inventory',
    name: '库存管理',
    code: 'inventory',
    actions: [
      { name: '查看', code: 'view' },
      { name: '入库', code: 'in' },
      { name: '出库', code: 'out' },
      { name: '调拨', code: 'transfer' },
      { name: '盘点', code: 'check' },
    ]
  },
  {
    module: 'finance',
    name: '财务管理',
    code: 'finance',
    actions: [
      { name: '查看', code: 'view' },
      { name: '成本核算', code: 'cost' },
      { name: '应收管理', code: 'receivable' },
      { name: '应付管理', code: 'payable' },
      { name: '导出', code: 'export' },
    ]
  },
  {
    module: 'quality',
    name: '品质管理',
    code: 'quality',
    actions: [
      { name: '查看', code: 'view' },
      { name: 'IQC检验', code: 'iqc' },
      { name: 'IPQC检验', code: 'ipqc' },
      { name: 'FQC检验', code: 'fqc' },
      { name: 'OQC检验', code: 'oqc' },
    ]
  },
  {
    module: 'outsource',
    name: '外协管理',
    code: 'outsource',
    actions: [
      { name: '查看', code: 'view' },
      { name: '新增', code: 'create' },
      { name: '编辑', code: 'edit' },
      { name: '删除', code: 'delete' },
    ]
  },
  {
    module: 'user',
    name: '用户管理',
    code: 'user',
    actions: [
      { name: '查看', code: 'view' },
      { name: '新增', code: 'create' },
      { name: '编辑', code: 'edit' },
      { name: '删除', code: 'delete' },
      { name: '重置密码', code: 'reset' },
    ]
  },
  {
    module: 'system',
    name: '系统管理',
    code: 'system',
    actions: [
      { name: '日志查看', code: 'log' },
      { name: '系统设置', code: 'settings' },
      { name: '数据备份', code: 'backup' },
    ]
  },
];

export default function RolePage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    description: string;
    status: '启用' | '停用';
  }>({
    name: '',
    code: '',
    description: '',
    status: '启用',
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = () => {
    const stored = localStorage.getItem('erp_roles');
    if (stored) {
      setRoles(JSON.parse(stored));
    } else {
      // 默认角色
      const defaultRoles: Role[] = [
        {
          id: '1',
          name: '系统管理员',
          code: 'admin',
          description: '拥有系统所有权限',
          permissions: ['all'],
          status: '启用',
          createdAt: new Date().toLocaleString('zh-CN'),
          updatedAt: new Date().toLocaleString('zh-CN'),
        },
        {
          id: '2',
          name: '订单管理员',
          code: 'order_manager',
          description: '负责订单和BOM管理',
          permissions: ['order:view', 'order:create', 'order:edit', 'bom:view', 'bom:create', 'bom:edit'],
          status: '启用',
          createdAt: new Date().toLocaleString('zh-CN'),
          updatedAt: new Date().toLocaleString('zh-CN'),
        },
        {
          id: '3',
          name: '车间管理员',
          code: 'workshop_manager',
          description: '负责裁床和车间报工',
          permissions: ['cutting:view', 'cutting:create', 'cutting:edit', 'workshop:view', 'workshop:report', 'workshop:audit'],
          status: '启用',
          createdAt: new Date().toLocaleString('zh-CN'),
          updatedAt: new Date().toLocaleString('zh-CN'),
        },
        {
          id: '4',
          name: '仓库管理员',
          code: 'warehouse_manager',
          description: '负责库存和出入库管理',
          permissions: ['inventory:view', 'inventory:in', 'inventory:out', 'inventory:transfer', 'inventory:check'],
          status: '启用',
          createdAt: new Date().toLocaleString('zh-CN'),
          updatedAt: new Date().toLocaleString('zh-CN'),
        },
        {
          id: '5',
          name: '财务管理员',
          code: 'finance_manager',
          description: '负责财务和成本管理',
          permissions: ['finance:view', 'finance:cost', 'finance:receivable', 'finance:payable', 'finance:export'],
          status: '启用',
          createdAt: new Date().toLocaleString('zh-CN'),
          updatedAt: new Date().toLocaleString('zh-CN'),
        },
        {
          id: '6',
          name: '品质管理员',
          code: 'quality_manager',
          description: '负责品质检验管理',
          permissions: ['quality:view', 'quality:iqc', 'quality:ipqc', 'quality:fqc', 'quality:oqc'],
          status: '启用',
          createdAt: new Date().toLocaleString('zh-CN'),
          updatedAt: new Date().toLocaleString('zh-CN'),
        },
      ];
      localStorage.setItem('erp_roles', JSON.stringify(defaultRoles));
      setRoles(defaultRoles);
    }
  };

  const saveRoles = (newRoles: Role[]) => {
    localStorage.setItem('erp_roles', JSON.stringify(newRoles));
    setRoles(newRoles);
  };

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        code: role.code,
        description: role.description,
        status: role.status,
      });
      setSelectedPermissions(role.permissions);
    } else {
      setEditingRole(null);
      setFormData({ name: '', code: '', description: '', status: '启用' });
      setSelectedPermissions([]);
    }
    setShowDialog(true);
  };

  const handleSaveRole = () => {
    if (!formData.name || !formData.code) {
      alert('请填写角色名称和编码');
      return;
    }

    const now = new Date().toLocaleString('zh-CN');
    if (editingRole) {
      const updated = roles.map(r => 
        r.id === editingRole.id 
          ? { ...r, ...formData, permissions: selectedPermissions, updatedAt: now }
          : r
      );
      saveRoles(updated);
    } else {
      const newRole: Role = {
        id: Date.now().toString(),
        ...formData,
        permissions: selectedPermissions,
        createdAt: now,
        updatedAt: now,
      };
      saveRoles([...roles, newRole]);
    }
    setShowDialog(false);
  };

  const handleDeleteRole = (id: string) => {
    if (confirm('确定要删除此角色吗？')) {
      saveRoles(roles.filter(r => r.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = roles.map(r => 
      r.id === id 
        ? { ...r, status: (r.status === '启用' ? '停用' : '启用') as '启用' | '停用', updatedAt: new Date().toLocaleString('zh-CN') }
        : r
    );
    saveRoles(updated);
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permission]);
    } else {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permission));
    }
  };

  const handleSelectAllModule = (module: Permission, checked: boolean) => {
    const permissions = module.actions.map(a => `${module.code}:${a.code}`);
    if (checked) {
      setSelectedPermissions([...new Set([...selectedPermissions, ...permissions])]);
    } else {
      setSelectedPermissions(selectedPermissions.filter(p => !permissions.includes(p)));
    }
  };

  const handleExport = () => {
    const headers = ['角色名称', '角色编码', '描述', '权限数量', '状态', '创建时间'];
    const rows = roles.map(r => [
      r.name,
      r.code,
      r.description,
      r.permissions.length.toString(),
      r.status,
      r.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `角色权限_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6" />
              角色权限管理
            </h1>
            <p className="text-muted-foreground mt-1">管理系统角色和权限分配</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              新增角色
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">角色总数</p>
                  <p className="text-2xl font-bold text-foreground">{roles.length}</p>
                </div>
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">启用角色</p>
                  <p className="text-2xl font-bold text-green-600">{roles.filter(r => r.status === '启用').length}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">权限模块</p>
                  <p className="text-2xl font-bold text-blue-600">{permissionModules.length}</p>
                </div>
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 角色列表 */}
        <Card>
          <CardHeader>
            <CardTitle>角色列表</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>角色名称</TableHead>
                  <TableHead>角色编码</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>权限数量</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map(role => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="font-mono">{role.code}</TableCell>
                    <TableCell className="max-w-xs truncate">{role.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{role.permissions.includes('all') ? '全部' : role.permissions.length} 项</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={role.status === '启用' ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => handleToggleStatus(role.id)}
                      >
                        {role.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{role.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(role)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {role.code !== 'admin' && (
                          <Button size="sm" variant="outline" onClick={() => handleDeleteRole(role.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 新增/编辑角色对话框 */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRole ? '编辑角色' : '新增角色'}</DialogTitle>
              <DialogDescription>配置角色基本信息和权限</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>角色名称 *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="如：订单管理员"
                  />
                </div>
                <div className="space-y-2">
                  <Label>角色编码 *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="如：order_manager"
                    disabled={editingRole?.code === 'admin'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>状态</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as '启用' | '停用' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="启用">启用</SelectItem>
                      <SelectItem value="停用">停用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>描述</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="角色描述"
                  />
                </div>
              </div>

              {/* 权限配置 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">权限配置</Label>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedPermissions(['all'])}
                    >
                      全选
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedPermissions([])}
                    >
                      清空
                    </Button>
                  </div>
                </div>
                
                {permissionModules.map(module => (
                  <div key={module.module} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Checkbox
                        checked={module.actions.every(a => 
                          selectedPermissions.includes(`${module.code}:${a.code}`)
                        )}
                        onCheckedChange={(checked) => handleSelectAllModule(module, checked as boolean)}
                      />
                      <Label className="font-medium">{module.name}</Label>
                    </div>
                    <div className="flex flex-wrap gap-4 pl-6">
                      {module.actions.map(action => {
                        const permCode = `${module.code}:${action.code}`;
                        return (
                          <div key={action.code} className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedPermissions.includes(permCode) || selectedPermissions.includes('all')}
                              onCheckedChange={(checked) => handlePermissionChange(permCode, checked as boolean)}
                            />
                            <Label className="text-sm font-normal">{action.name}</Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>取消</Button>
              <Button onClick={handleSaveRole}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
