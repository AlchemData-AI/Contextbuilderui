import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'user' | 'analyst' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isOnboarded?: boolean;
  onboardingData?: {
    team?: string;
    jobRole?: string;
    geographies?: string[];
    dataIdentifiers?: string; // e.g., "sales_rep_id = 101"
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  login: (user: User) => void;
  logout: () => void;
  completeOnboarding: (onboardingData: User['onboardingData']) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      needsOnboarding: false,
      login: (user) => set({ 
        user, 
        isAuthenticated: true, 
        needsOnboarding: !user.isOnboarded 
      }),
      logout: () => set({ user: null, isAuthenticated: false, needsOnboarding: false }),
      completeOnboarding: (onboardingData) => set((state) => ({
        user: state.user ? {
          ...state.user,
          isOnboarded: true,
          onboardingData,
        } : null,
        needsOnboarding: false,
      })),
    }),
    {
      name: 'alchemdata-auth',
    }
  )
);

// Predefined users for demo purposes
export const DEMO_USERS: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    role: 'user',
    isOnboarded: true,
    onboardingData: {
      team: 'West Coast Sales',
      jobRole: 'Sales Manager',
      geographies: ['California', 'Oregon', 'Washington'],
      dataIdentifiers: 'sales_rep_id = 101',
    },
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@company.com',
    role: 'analyst',
    isOnboarded: true,
    onboardingData: {
      team: 'Data Analytics',
      jobRole: 'Senior Data Analyst',
      geographies: ['United States'],
    },
  },
  {
    id: '3',
    name: 'Jessica Williams',
    email: 'jessica.williams@company.com',
    role: 'admin',
    isOnboarded: true,
    onboardingData: {
      team: 'Engineering',
      jobRole: 'VP of Data',
      geographies: ['Global'],
    },
  },
  {
    id: '4',
    name: 'New User',
    email: 'new.user@company.com',
    role: 'user',
    isOnboarded: false, // For testing onboarding flow
  },
];

// Role permissions
export const rolePermissions = {
  user: {
    canViewAgents: true,
    canCreateAgents: false,
    canEditAgents: false,
    canDeleteAgents: false,
    canAccessChat: true,
    canAccessDataSources: false,
    canAccessAnalystReview: false, // Cannot see the analyst review part
    canRequestAnalystReview: true, // But can request review
    canAccessDocumentation: true,
    canAccessSettings: true,
  },
  analyst: {
    canViewAgents: true,
    canCreateAgents: true,
    canEditAgents: true,
    canDeleteAgents: false,
    canAccessChat: true,
    canAccessDataSources: false,
    canAccessAnalystReview: true,
    canRequestAnalystReview: true,
    canAccessDocumentation: true,
    canAccessSettings: true,
  },
  admin: {
    canViewAgents: true,
    canCreateAgents: true,
    canEditAgents: true,
    canDeleteAgents: true,
    canAccessChat: true,
    canAccessDataSources: true,
    canAccessAnalystReview: true,
    canRequestAnalystReview: true,
    canAccessDocumentation: true,
    canAccessSettings: true,
  },
};

export function hasPermission(role: UserRole, permission: keyof typeof rolePermissions.admin): boolean {
  return rolePermissions[role][permission];
}
