'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Settings,
  Users,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ChevronDown,
  ClipboardList,
  Scissors,
  ScanLine,
  Tag,
  DollarSign,
  Zap,
  Moon,
  Sun,
  Send,
  Route,
  Building2,
  Activity,
  FileSearch,
  Printer,
  BarChart3,
  Smartphone,
  Calendar,
  CheckCircle,
  Package,
  Shirt,
  Calculator,
  RefreshCw,
  Trash2,
  Ruler,
  FileEdit,
  Bell,
  Warehouse,
  Wallet,
  Archive,
  Layers,
  PackageOpen,
  Factory,
  FileText,
  ShoppingCart,
  QrCode,
  AlertTriangle,
  TrendingUp,
  ClipboardCheck,
  PauseCircle,
  MessageSquare,
  Truck,
  ArrowRightLeft,
  FlaskConical,
  PackageX,
  Clock,
  Globe,
  CreditCard,
} from 'lucide-react';
import { getCurrentUser, clearCurrentUser, type CurrentUser } from '@/types/user';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useInitDemoData } from '@/hooks/useInitDemoData';
import { useLanguage, languageNames, type Language } from '@/lib/i18n';

interface MenuItem {
  icon: React.ElementType;
  labelKey: string; // 翻译键
  path: string;
  permissions?: string[];
}

interface MenuGroup {
  icon: React.ElementType;
  labelKey: string; // 翻译键
  items: MenuItem[];
}

// 菜单配置 - 使用翻译键
const menuGroups: MenuGroup[] = [
  // 首页看板
  {
    icon: Home,
    labelKey: 'menuGroup.dashboard',
    items: [
      { icon: Home, labelKey: 'menu.home', path: '/dashboard' },
      { icon: Activity, labelKey: 'menu.productionBoard', path: '/dashboard/board', permissions: ['all', 'board:view'] },
      { icon: AlertTriangle, labelKey: 'menu.alertCenter', path: '/dashboard/alert-center', permissions: ['all'] },
      { icon: FileSearch, labelKey: 'menu.fullTraceability', path: '/dashboard/traceability', permissions: ['all'] },
    ]
  },
  // 销售管理
  {
    icon: ClipboardList,
    labelKey: 'menuGroup.sales',
    items: [
      { icon: ClipboardList, labelKey: 'menu.order', path: '/dashboard/orders', permissions: ['all', 'order:create', 'order:view'] },
      { icon: FileText, labelKey: 'menu.preOrder', path: '/dashboard/pre-order', permissions: ['all', 'preorder:view'] },
      { icon: Shirt, labelKey: 'menu.sample', path: '/dashboard/sample', permissions: ['all', 'sample:view'] },
      { icon: Shirt, labelKey: 'menu.style', path: '/dashboard/styles', permissions: ['all', 'style:view'] },
    ]
  },
  // 生产管理
  {
    icon: Factory,
    labelKey: 'menuGroup.production',
    items: [
      { icon: Calendar, labelKey: 'menu.schedule', path: '/dashboard/schedule', permissions: ['all', 'schedule:view'] },
      { icon: FileText, labelKey: 'menu.bom', path: '/dashboard/bom', permissions: ['all', 'bom:create', 'bom:view'] },
      { icon: Route, labelKey: 'menu.processRoute', path: '/dashboard/process-route', permissions: ['all', 'process:view'] },
      { icon: Zap, labelKey: 'menu.process', path: '/dashboard/processes', permissions: ['all', 'process:view'] },
      { icon: Ruler, labelKey: 'menu.sizeSpec', path: '/dashboard/size-spec', permissions: ['all', 'size:view'] },
      { icon: Scissors, labelKey: 'menu.cutting', path: '/dashboard/cutting', permissions: ['all', 'cutting:create', 'cutting:view'] },
      { icon: Tag, labelKey: 'menu.zahao', path: '/dashboard/zahao', permissions: ['all', 'cutting:view'] },
      { icon: ScanLine, labelKey: 'menu.workshop', path: '/dashboard/workshop', permissions: ['all', 'workshop:view', 'workshop:report'] },
      { icon: Tag, labelKey: 'menu.tail', path: '/dashboard/tail', permissions: ['all', 'tail:view'] },
      { icon: Smartphone, labelKey: 'menu.scanReport', path: '/dashboard/scan', permissions: ['all', 'workshop:report'] },
      { icon: PackageOpen, labelKey: 'menu.materialRequisition', path: '/dashboard/material-requisition', permissions: ['all', 'requisition:view'] },
      { icon: Archive, labelKey: 'menu.materialReturn', path: '/dashboard/material-return', permissions: ['all', 'return:view'] },
      { icon: Layers, labelKey: 'menu.batch', path: '/dashboard/batch', permissions: ['all', 'batch:view'] },
      { icon: ClipboardCheck, labelKey: 'menu.preProduction', path: '/dashboard/pre-production', permissions: ['all', 'preproduction:view'] },
      { icon: PauseCircle, labelKey: 'menu.productionStop', path: '/dashboard/production-stop', permissions: ['all', 'stop:view'] },
    ]
  },
  // 品质管理
  {
    icon: CheckCircle,
    labelKey: 'menuGroup.quality',
    items: [
      { icon: CheckCircle, labelKey: 'menu.quality', path: '/dashboard/quality', permissions: ['all', 'quality:view'] },
      { icon: CheckCircle, labelKey: 'menu.iqc', path: '/dashboard/iqc', permissions: ['all', 'iqc:view'] },
      { icon: FlaskConical, labelKey: 'menu.fabricTest', path: '/dashboard/fabric-test', permissions: ['all', 'fabrictest:view'] },
      { icon: RefreshCw, labelKey: 'menu.rework', path: '/dashboard/rework', permissions: ['all', 'rework:view'] },
      { icon: Trash2, labelKey: 'menu.scrap', path: '/dashboard/scrap', permissions: ['all', 'scrap:view'] },
      { icon: PackageX, labelKey: 'menu.afterSalesReturn', path: '/dashboard/after-sales-return', permissions: ['all', 'return:view'] },
    ]
  },
  // 物料管理
  {
    icon: Package,
    labelKey: 'menuGroup.material',
    items: [
      { icon: Package, labelKey: 'menu.materials', path: '/dashboard/materials', permissions: ['all', 'material:view'] },
      { icon: Package, labelKey: 'menu.inventory', path: '/dashboard/inventory', permissions: ['all', 'inventory:view'] },
      { icon: Warehouse, labelKey: 'menu.warehouse', path: '/dashboard/warehouse', permissions: ['all', 'warehouse:view'] },
      { icon: RefreshCw, labelKey: 'menu.transfer', path: '/dashboard/transfer', permissions: ['all', 'transfer:view'] },
      { icon: CheckCircle, labelKey: 'menu.check', path: '/dashboard/check', permissions: ['all', 'check:view'] },
      { icon: Calculator, labelKey: 'menu.mrp', path: '/dashboard/mrp', permissions: ['all', 'mrp:view'] },
      { icon: Layers, labelKey: 'menu.substitute', path: '/dashboard/substitute', permissions: ['all', 'substitute:view'] },
      { icon: PackageOpen, labelKey: 'menu.borrow', path: '/dashboard/borrow', permissions: ['all', 'borrow:view'] },
      { icon: Archive, labelKey: 'menu.customerMaterial', path: '/dashboard/customer-material', permissions: ['all', 'customer:view'] },
      { icon: ShoppingCart, labelKey: 'menu.purchase', path: '/dashboard/purchase', permissions: ['all', 'purchase:view'] },
    ]
  },
  // 外协管理
  {
    icon: Send,
    labelKey: 'menuGroup.outsource',
    items: [
      { icon: Send, labelKey: 'menu.outsource', path: '/dashboard/outsource', permissions: ['all', 'outsource:view'] },
    ]
  },
  // 财务管理
  {
    icon: DollarSign,
    labelKey: 'menuGroup.finance',
    items: [
      { icon: DollarSign, labelKey: 'menu.finance', path: '/dashboard/finance', permissions: ['all', 'finance:view'] },
      { icon: Calculator, labelKey: 'menu.cost', path: '/dashboard/cost', permissions: ['all', 'cost:view'] },
      { icon: Calculator, labelKey: 'menu.orderBudget', path: '/dashboard/order-budget', permissions: ['all', 'budget:view'] },
      { icon: Wallet, labelKey: 'menu.salary', path: '/dashboard/finance/salary', permissions: ['all', 'salary:view'] },
      { icon: CreditCard, labelKey: 'menu.wallet', path: '/dashboard/finance/wallet', permissions: ['all', 'wallet:view'] },
      { icon: TrendingUp, labelKey: 'menu.employeePerformance', path: '/dashboard/employee-performance', permissions: ['all', 'performance:view'] },
      { icon: Truck, labelKey: 'menu.logisticsFee', path: '/dashboard/logistics-fee', permissions: ['all', 'logistics:view'] },
    ]
  },
  // 工程变更
  {
    icon: FileEdit,
    labelKey: 'menuGroup.engineering',
    items: [
      { icon: FileEdit, labelKey: 'menu.ecn', path: '/dashboard/ecn', permissions: ['all', 'ecn:view'] },
    ]
  },
  // 基础资料
  {
    icon: Building2,
    labelKey: 'menuGroup.basic',
    items: [
      { icon: Users, labelKey: 'menu.employee', path: '/dashboard/employee', permissions: ['all', 'employee:view'] },
      { icon: Building2, labelKey: 'menu.partner', path: '/dashboard/partner', permissions: ['all', 'partner:view'] },
      { icon: Shirt, labelKey: 'menu.sampleInventory', path: '/dashboard/sample-inventory', permissions: ['all', 'sampleinv:view'] },
    ]
  },
  // 系统管理
  {
    icon: Settings,
    labelKey: 'menuGroup.system',
    items: [
      { icon: Users, labelKey: 'menu.roles', path: '/dashboard/roles', permissions: ['all', 'role:view'] },
      { icon: CheckCircle, labelKey: 'menu.audit', path: '/dashboard/audit', permissions: ['all', 'audit:view', 'audit:approve'] },
      { icon: MessageSquare, labelKey: 'menu.systemMessage', path: '/dashboard/system-message', permissions: ['all'] },
      { icon: FileSearch, labelKey: 'menu.logs', path: '/dashboard/logs', permissions: ['all'] },
      { icon: Printer, labelKey: 'menu.printTemplate', path: '/dashboard/print-template', permissions: ['all'] },
      { icon: ArrowRightLeft, labelKey: 'menu.internalTransfer', path: '/dashboard/internal-transfer', permissions: ['all', 'transfer:view'] },
      { icon: Users, labelKey: 'menu.users', path: '/dashboard/users', permissions: ['all'] },
      { icon: Settings, labelKey: 'menu.settings', path: '/dashboard/settings', permissions: ['all'] },
    ]
  },
  // 报表中心
  {
    icon: BarChart3,
    labelKey: 'menuGroup.report',
    items: [
      { icon: BarChart3, labelKey: 'menu.report', path: '/dashboard/report', permissions: ['all', 'report:view'] },
      { icon: Smartphone, labelKey: 'menu.scan', path: '/dashboard/scan', permissions: ['all', 'scan:view'] },
    ]
  },
];

// 获取嵌套翻译值的辅助函数
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let result: unknown = obj;
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path; // 如果找不到翻译，返回原始键
    }
  }
  return typeof result === 'string' ? result : path;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 初始化演示数据
  useInitDemoData();
  
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleMode } = useTheme();
  const { t, language } = useLanguage();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(menuGroups.map(g => g.labelKey));
  const [mounted, setMounted] = useState(false);

  // 翻译后的菜单数据
  const translatedMenuGroups = useMemo(() => {
    return menuGroups.map(group => ({
      ...group,
      label: getNestedValue(t as Record<string, unknown>, group.labelKey),
      items: group.items.map(item => ({
        ...item,
        label: getNestedValue(t as Record<string, unknown>, item.labelKey),
      }))
    }));
  }, [t]);

  // 扁平化菜单用于面包屑
  const allMenuItems = useMemo(() => {
    return translatedMenuGroups.flatMap(g => g.items);
  }, [translatedMenuGroups]);

  useEffect(() => {
    setMounted(true);
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
    } else {
      setCurrentUser(user);
    }
  }, [router]);

  const handleLogout = () => {
    clearCurrentUser();
    router.push('/login');
  };

  const hasPermission = (permissions?: string[]) => {
    if (!permissions || !currentUser) return true;
    return permissions.some(perm => currentUser.permissions.includes(perm));
  };

  const toggleGroup = (labelKey: string) => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
    }
    setExpandedGroups(prev => 
      prev.includes(labelKey) ? prev.filter(g => g !== labelKey) : [...prev, labelKey]
    );
  };

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((seg, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/');
      const item = allMenuItems.find(m => m.path === path);
      return {
        label: item?.label || (seg === 'form' ? t.common.add : seg === 'create' ? t.common.add : seg === 'edit' ? t.common.edit : seg),
        path,
      };
    });
  };

  if (!mounted || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-muted-foreground">{t.common.loading}</div>
        </div>
      </div>
    );
  }

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 顶部导航栏 */}
      <header className="bg-card border-b h-14 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-accent transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold text-foreground hidden sm:block">{t.system.appName}</h1>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground hidden md:flex">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} className="flex items-center">
              {index > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
              <span className={index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''}>
                {crumb.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* 语言切换按钮 */}
          <LanguageSwitcher />
          
          {/* 主题切换按钮 */}
          <button
            onClick={toggleMode}
            className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-accent transition-colors"
            title={t.system.switchTheme}
          >
            {theme.mode === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-foreground">{currentUser.username}</div>
            <div className="text-xs text-muted-foreground">{currentUser.role}</div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            title={t.system.logout}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* 主体区域 */}
      <div className="flex flex-1 mt-14">
        {/* 移动端遮罩层 */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        {/* 左侧菜单栏 */}
        <aside
          className={`bg-card border-r fixed left-0 top-14 bottom-0 z-40 transition-all duration-300 overflow-y-auto ${
            sidebarCollapsed ? 'lg:w-14 w-52' : 'w-52'
          } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg hover:opacity-90 transition-opacity z-10"
          >
            {sidebarCollapsed ? <Menu className="w-3 h-3" /> : <X className="w-3 h-3" />}
          </button>

          <nav className="py-2">
            {translatedMenuGroups.map((group) => {
              const availableItems = group.items.filter(item => hasPermission(item.permissions));
              if (availableItems.length === 0) return null;
              
              const isExpanded = expandedGroups.includes(group.labelKey);
              const GroupIcon = group.icon;
              const hasActiveChild = availableItems.some(item => pathname === item.path || pathname.startsWith(item.path + '/'));
              
              return (
                <div key={group.labelKey} className="mb-1">
                  <button
                    onClick={() => toggleGroup(group.labelKey)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-all ${
                      hasActiveChild
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <GroupIcon className="w-4 h-4 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="text-sm font-medium flex-1">{group.label}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                      </>
                    )}
                  </button>
                  
                  {!sidebarCollapsed && isExpanded && (
                    <div className="bg-muted/30">
                      {availableItems.map((item) => {
                        const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                        const Icon = item.icon;
                        
                        return (
                          <button
                            key={item.path}
                            onClick={() => { router.push(item.path); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 pl-9 text-left transition-all ${
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                            }`}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* 折叠状态下的悬停菜单 */}
                  {sidebarCollapsed && (
                    <div className="group relative">
                      {availableItems.map((item) => {
                        const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                        const Icon = item.icon;
                        
                        return (
                          <button
                            key={item.path}
                            onClick={() => { router.push(item.path); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center justify-center py-2 transition-all ${
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                            }`}
                            title={item.label}
                          >
                            <Icon className="w-4 h-4" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* 主内容区 */}
        <main
          className={`flex-1 transition-all duration-300 p-4 bg-muted/30 ${
            sidebarCollapsed ? 'lg:ml-14' : 'lg:ml-52'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

// 语言切换器组件
function LanguageSwitcher() {
  const { language, setLanguage, languageName } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  const languages: Language[] = ['zh-CN', 'en-US', 'ja-JP'];
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-accent transition-colors"
        title="切换语言"
      >
        <Globe className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-36 bg-card border rounded-lg shadow-lg z-50 py-1">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => { setLanguage(lang); setIsOpen(false); }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                  language === lang 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'hover:bg-accent'
                }`}
              >
                {languageNames[lang]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
