import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockRules, type Rule } from './mockData';

// ═══════════════════════════════════════════════════════════════════
// RULES STORE
// ═══════════════════════════════════════════════════════════════════

interface RulesState {
  rules: Rule[];
  addRule: (rule: Omit<Rule, 'id' | 'createdAt'>) => Rule;
  updateRule: (id: string, updates: Partial<Rule>) => void;
  deleteRule: (id: string) => void;
  getRule: (id: string) => Rule | undefined;
  getRulesByOwner: (owner: string) => Rule[];
  getRulesByType: (type: Rule['type']) => Rule[];
}

export const useRulesStore = create<RulesState>()(
  persist(
    (set, get) => ({
      rules: mockRules,

      addRule: (rule) => {
        const newRule: Rule = {
          ...rule,
          id: `rule-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          rules: [...state.rules, newRule],
        }));

        return newRule;
      },

      updateRule: (id, updates) => {
        set((state) => ({
          rules: state.rules.map((rule) =>
            rule.id === id ? { ...rule, ...updates } : rule
          ),
        }));
      },

      deleteRule: (id) => {
        set((state) => ({
          rules: state.rules.filter((rule) => rule.id !== id),
        }));
      },

      getRule: (id) => {
        return get().rules.find((rule) => rule.id === id);
      },

      getRulesByOwner: (owner) => {
        return get().rules.filter((rule) => rule.owner === owner);
      },

      getRulesByType: (type) => {
        return get().rules.filter((rule) => rule.type === type);
      },
    }),
    {
      name: 'alchemdata-rules-store',
    }
  )
);
