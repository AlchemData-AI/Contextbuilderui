import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SamplingScale = 0 | 1 | 2; // 0 = Fast, 1 = Balanced, 2 = Comprehensive

export interface DataConnector {
  id: string;
  name: string;
  type: string;
  host?: string;
  username?: string;
  status: 'connected' | 'disconnected' | 'error';
  createdAt: string;
  lastSync?: string;
}

interface SettingsState {
  samplingScale: SamplingScale;
  dataConnectors: DataConnector[];
  setSamplingScale: (scale: SamplingScale) => void;
  addDataConnector: (connector: Omit<DataConnector, 'id' | 'createdAt'>) => void;
  removeDataConnector: (id: string) => void;
  updateDataConnector: (id: string, updates: Partial<DataConnector>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      samplingScale: 1, // Default to Balanced
      dataConnectors: [
        {
          id: 'sql-server-1',
          name: 'Production SQL Server',
          type: 'sql-server',
          host: 'prod-db.company.com',
          username: 'alchemdata_user',
          status: 'connected',
          createdAt: '2025-09-15',
          lastSync: '2025-10-28',
        },
        {
          id: 'snowflake-1',
          name: 'Snowflake Analytics',
          type: 'snowflake',
          host: 'company.snowflakecomputing.com',
          username: 'analytics_user',
          status: 'connected',
          createdAt: '2025-08-20',
          lastSync: '2025-10-27',
        },
      ],
      setSamplingScale: (scale) => set({ samplingScale: scale }),
      addDataConnector: (connector) =>
        set((state) => ({
          dataConnectors: [
            ...state.dataConnectors,
            {
              ...connector,
              id: `connector-${Date.now()}`,
              createdAt: new Date().toISOString().split('T')[0],
            },
          ],
        })),
      removeDataConnector: (id) =>
        set((state) => ({
          dataConnectors: state.dataConnectors.filter((c) => c.id !== id),
        })),
      updateDataConnector: (id, updates) =>
        set((state) => ({
          dataConnectors: state.dataConnectors.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
    }),
    {
      name: 'alchemdata-settings',
    }
  )
);
