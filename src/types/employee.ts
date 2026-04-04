/**
 * 员工和班组相关类型定义
 */

// 班组类型
export type TeamType = '缝制' | '裁床' | '尾部' | '品管' | '包装' | '其他';

// 班组状态
export type TeamStatus = '启用' | '停用';

// 员工状态
export type EmployeeStatus = '在职' | '离职';

// 员工性别
export type Gender = '男' | '女';

// 班组
export interface Team {
  id: string;
  teamCode: string;
  teamName: string;
  teamType: TeamType;
  leaderName: string;
  memberCount: number;
  status: TeamStatus;
  createdAt: string;
  updatedAt?: string;
}

// 员工
export interface Employee {
  id: string;
  employeeNo: string;
  name: string;
  gender: Gender;
  idCard?: string;
  phone: string;
  teamId: string;
  teamName: string;
  position: string;
  wageLevel: string;
  baseWage: number;
  subsidy: number;
  entryDate: string;
  status: EmployeeStatus;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

// 考勤记录
export interface Attendance {
  id: string;
  employeeId: string;
  employeeNo: string;
  employeeName: string;
  date: string;
  status: '出勤' | '请假' | '旷工' | '迟到' | '早退';
  remark?: string;
  createdAt: string;
}

// ==================== 数据操作函数 ====================

import { DB_KEYS } from '@/lib/database';

const TEAMS_KEY = DB_KEYS.TEAMS;
const EMPLOYEES_KEY = DB_KEYS.EMPLOYEES;

// 初始化班组数据（创建空数组）
export function initEmployeeData(): void {
  if (typeof window === 'undefined') return;
  
  const storedTeams = localStorage.getItem(TEAMS_KEY);
  if (!storedTeams) {
    localStorage.setItem(TEAMS_KEY, JSON.stringify([]));
  }
  
  const storedEmployees = localStorage.getItem(EMPLOYEES_KEY);
  if (!storedEmployees) {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify([]));
  }
}

// 获取班组列表
export function getTeams(): Team[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(TEAMS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// 获取员工列表
export function getEmployees(): Employee[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(EMPLOYEES_KEY);
  return stored ? JSON.parse(stored) : [];
}

// 根据工号获取员工
export function getEmployeeByNo(employeeNo: string): Employee | undefined {
  return getEmployees().find(e => e.employeeNo === employeeNo);
}

// 根据ID获取员工
export function getEmployeeById(id: string): Employee | null {
  return getEmployees().find(e => e.id === id) || null;
}

// 根据ID获取班组
export function getTeamById(id: string): Team | null {
  return getTeams().find(t => t.id === id) || null;
}

// 保存员工
export function saveEmployee(employee: Employee): void {
  if (typeof window === 'undefined') return;
  const employees = getEmployees();
  const index = employees.findIndex(e => e.id === employee.id);
  if (index >= 0) {
    employees[index] = { ...employee, updatedAt: new Date().toISOString() };
  } else {
    employees.push(employee);
  }
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
}

// 保存班组
export function saveTeam(team: Team): void {
  if (typeof window === 'undefined') return;
  const teams = getTeams();
  const index = teams.findIndex(t => t.id === team.id);
  if (index >= 0) {
    teams[index] = { ...team, updatedAt: new Date().toISOString() };
  } else {
    teams.push(team);
  }
  localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
}

// 删除员工
export function deleteEmployee(id: string): void {
  if (typeof window === 'undefined') return;
  const employees = getEmployees().filter(e => e.id !== id);
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
}

// 删除班组
export function deleteTeam(id: string): void {
  if (typeof window === 'undefined') return;
  const teams = getTeams().filter(t => t.id !== id);
  localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
}

// 生成员工工号
export function generateEmployeeNo(): string {
  const employees = getEmployees();
  const maxNo = employees.reduce((max, e) => {
    const num = parseInt(e.employeeNo.replace('EMP', '')) || 0;
    return num > max ? num : max;
  }, 0);
  return `EMP${String(maxNo + 1).padStart(3, '0')}`;
}

// 生成班组编号
export function generateTeamCode(): string {
  const teams = getTeams();
  const maxCode = teams.reduce((max, t) => {
    const num = parseInt(t.teamCode.replace('T', '')) || 0;
    return num > max ? num : max;
  }, 0);
  return `T${String(maxCode + 1).padStart(3, '0')}`;
}

// 更新班组人数
export function updateTeamMemberCount(teamId: string): void {
  const employees = getEmployees().filter(e => e.teamId === teamId && e.status === '在职');
  const teams = getTeams();
  const team = teams.find(t => t.id === teamId);
  if (team) {
    team.memberCount = employees.length;
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
  }
}
