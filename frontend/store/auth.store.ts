import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 
  | 'SUPER_ADMIN' 
  | 'PURCHASE_MANAGER' 
  | 'BRANCH_MANAGER' 
  | 'DEPARTMENT_HEAD' 
  | 'WAREHOUSE_KEEPER' 
  | 'ACCOUNTANT' 
  | 'EMPLOYEE';

export interface User {
  id: string;
  employeeId: string;
  nameAr: string;
  nameEn?: string | null;
  email: string;
  role: Role;
  branchId?: string | null;
  departmentId?: string | null;
  branch?: { id: string; nameAr: string; code: string; nameEn?: string | null; managerName?: string | null } | null;
  department?: { id: string; nameAr: string; nameEn?: string | null } | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('erp_token', token);
        }
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('erp_token');
          localStorage.removeItem('erp_user');
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { 
      name: 'erp_user_storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: 'الإدارة العليا / مدير النظام',
  PURCHASE_MANAGER: 'مدير المشتريات',
  BRANCH_MANAGER: 'مدير الفرع',
  DEPARTMENT_HEAD: 'رئيس القسم',
  WAREHOUSE_KEEPER: 'أمين المخزن',
  ACCOUNTANT: 'محاسب',
  EMPLOYEE: 'موظف',
};
