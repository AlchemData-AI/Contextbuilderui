import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Slider } from '../components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Database,
  Search,
  Plus,
  Settings as SettingsIcon,
  Zap,
  Users,
  Bell,
  Shield,
  Lock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { useAuthStore, hasPermission } from '../lib/authStore';
import { useSettingsStore } from '../lib/settingsStore';
import { toast } from 'sonner@2.0.3';
import connectorImage from 'figma:asset/82963222c05b1b913661609a48c1a62ea9e1bd2f.png';

// Data source types
interface DataSource {
  id: string;
  name: string;
  icon: string;
  category: 'database' | 'cloud' | 'file' | 'api';
  description: string;
  status?: 'connected' | 'disconnected' | 'error';
  configured?: boolean;
}

const availableDataSources: DataSource[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: '☁️',
    category: 'cloud',
    description: 'Connect to Salesforce CRM data',
  },
  {
    id: 'sap',
    name: 'SAP Business Data Cloud',
    icon: '📊',
    category: 'cloud',
    description: 'SAP enterprise data integration',
  },
  {
    id: 'workday',
    name: 'Workday Reports',
    icon: '📈',
    category: 'cloud',
    description: 'Workday HR and financial data',
  },
  {
    id: 'servicenow',
    name: 'ServiceNow',
    icon: '🔧',
    category: 'cloud',
    description: 'ServiceNow service management data',
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics Raw Data',
    icon: '📉',
    category: 'api',
    description: 'Google Analytics metrics and events',
  },
  {
    id: 'sql-server',
    name: 'SQL Server',
    icon: '🗄️',
    category: 'database',
    description: 'Microsoft SQL Server database',
    status: 'connected',
    configured: true,
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    icon: '🐘',
    category: 'database',
    description: 'PostgreSQL database connection',
  },
  {
    id: 'mysql',
    name: 'MySQL',
    icon: '🐬',
    category: 'database',
    description: 'MySQL database connection',
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    icon: '❄️',
    category: 'cloud',
    description: 'Snowflake data warehouse',
    status: 'connected',
    configured: true,
  },
  {
    id: 'bigquery',
    name: 'Google BigQuery',
    icon: '🔍',
    category: 'cloud',
    description: 'Google BigQuery data warehouse',
  },
  {
    id: 'redshift',
    name: 'Amazon Redshift',
    icon: '🚀',
    category: 'cloud',
    description: 'Amazon Redshift data warehouse',
  },
  {
    id: 'azure-sql',
    name: 'Azure SQL Database',
    icon: '☁️',
    category: 'cloud',
    description: 'Microsoft Azure SQL Database',
  },
];

// This will be replaced by store data

export function Settings() {
  const user = useAuthStore((state) => state.user);
  const canAccessDataSources = user ? hasPermission(user.role, 'canAccessDataSources') : false;
  
  // Settings store
  const { samplingScale, setSamplingScale: setStoreSamplingScale, dataConnectors, addDataConnector, removeDataConnector } = useSettingsStore();

  const [activeTab, setActiveTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConnectorDialog, setShowConnectorDialog] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<DataSource | null>(null);
  
  // Local slider state
  const [localSamplingScale, setLocalSamplingScale] = useState([samplingScale]);

  const filteredDataSources = availableDataSources.filter(
    (ds) =>
      !ds.configured &&
      (searchQuery === '' ||
        ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleConnectDataSource = (dataSource: DataSource) => {
    setSelectedConnector(dataSource);
    setShowConnectorDialog(true);
  };

  const handleSaveConnection = () => {
    if (selectedConnector) {
      addDataConnector({
        name: selectedConnector.name,
        type: selectedConnector.id,
        status: 'connected',
      });
      toast.success(`${selectedConnector.name} connected successfully!`);
    }
    setShowConnectorDialog(false);
    setSelectedConnector(null);
  };

  const handleSaveSamplingSettings = () => {
    setStoreSamplingScale(localSamplingScale[0] as 0 | 1 | 2);
    toast.success('Sampling settings saved!');
  };

  const getSamplingLabel = (value: number) => {
    switch (value) {
      case 0:
        return 'Fast';
      case 1:
        return 'Balanced';
      case 2:
        return 'Comprehensive';
      default:
        return 'Balanced';
    }
  };

  const getSamplingDescription = (value: number) => {
    switch (value) {
      case 0:
        return 'Quick analysis with 10% data sampling. Best for rapid prototyping and initial exploration.';
      case 1:
        return 'Balanced approach with 50% data sampling. Recommended for most use cases.';
      case 2:
        return 'Full data analysis with 100% sampling. Most accurate but slower processing.';
      default:
        return '';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#FAFBFC]">
      {/* Header */}
      <div className="border-b border-[#EEEEEE] bg-white px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl text-[#333333] mb-1">Settings</h1>
            <p className="text-sm text-[#666666]">
              Manage your workspace configuration and preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs px-3 py-1">
              {user?.role === 'admin' ? '🌟 Admin' : user?.role === 'analyst' ? '🛡️ Analyst' : '👤 User'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b border-[#EEEEEE] bg-white px-6">
            <TabsList className="bg-transparent h-12 p-0 border-b-0">
              <TabsTrigger
                value="general"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#00B5B3] rounded-none bg-transparent px-4"
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger
                value="context-builder"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#00B5B3] rounded-none bg-transparent px-4"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Context Builder
              </TabsTrigger>
              {canAccessDataSources && (
                <TabsTrigger
                  value="data-connectors"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-[#00B5B3] rounded-none bg-transparent px-4"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Data Connectors
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto">
            {/* General Settings */}
            <TabsContent value="general" className="p-6 m-0">
              <div className="max-w-4xl mx-auto space-y-6">
                <Card className="p-6 border-2 border-[#EEEEEE]">
                  <h3 className="text-sm font-medium text-[#333333] mb-4">User Profile</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-[#666666]">Name</Label>
                      <Input
                        value={user?.name || ''}
                        disabled
                        className="mt-1 border-2 border-[#DDDDDD]"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-[#666666]">Email</Label>
                      <Input
                        value={user?.email || ''}
                        disabled
                        className="mt-1 border-2 border-[#DDDDDD]"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-[#666666]">Role</Label>
                      <Input
                        value={user?.role || ''}
                        disabled
                        className="mt-1 border-2 border-[#DDDDDD] capitalize"
                      />
                    </div>
                  </div>
                </Card>

                {user?.onboardingData && (
                  <Card className="p-6 border-2 border-[#EEEEEE]">
                    <h3 className="text-sm font-medium text-[#333333] mb-4">Onboarding Information</h3>
                    <div className="space-y-4">
                      {user.onboardingData.team && (
                        <div>
                          <Label className="text-sm text-[#666666]">Team</Label>
                          <Input
                            value={user.onboardingData.team}
                            disabled
                            className="mt-1 border-2 border-[#DDDDDD]"
                          />
                        </div>
                      )}
                      {user.onboardingData.jobRole && (
                        <div>
                          <Label className="text-sm text-[#666666]">Job Role</Label>
                          <Input
                            value={user.onboardingData.jobRole}
                            disabled
                            className="mt-1 border-2 border-[#DDDDDD]"
                          />
                        </div>
                      )}
                      {user.onboardingData.geographies && user.onboardingData.geographies.length > 0 && (
                        <div>
                          <Label className="text-sm text-[#666666] mb-2 block">Geographies</Label>
                          <div className="flex flex-wrap gap-2">
                            {user.onboardingData.geographies.map((geo) => (
                              <Badge key={geo} variant="outline" className="bg-[#E6F7F7] text-[#00B5B3] border-0">
                                {geo}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Context Builder Settings */}
            <TabsContent value="context-builder" className="p-6 m-0">
              <div className="max-w-4xl mx-auto space-y-6">
                <Card className="p-6 border-2 border-[#EEEEEE]">
                  <div className="flex items-start gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[#E0F7F7] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-[#00B5B3]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#333333] mb-1">
                        Sampling Scale
                      </h3>
                      <p className="text-sm text-[#666666]">
                        Choose the level of data sampling for context analysis. Higher sampling provides more accuracy but takes longer to process.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Slider */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-[#333333]">Analysis Mode</Label>
                        <Badge
                          variant="outline"
                          className="bg-[#E0F7F7] text-[#00B5B3] border-0 px-3 py-1"
                        >
                          {getSamplingLabel(localSamplingScale[0])}
                        </Badge>
                      </div>

                      <div className="px-2">
                        <Slider
                          value={localSamplingScale}
                          onValueChange={setLocalSamplingScale}
                          max={2}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-[#999999]">Fast</span>
                          <span className="text-xs text-[#999999]">Balanced</span>
                          <span className="text-xs text-[#999999]">Comprehensive</span>
                        </div>
                      </div>
                    </div>

                    {/* Description Card */}
                    <div className="p-4 bg-[#F0FFFE] rounded-lg border border-[#E0F7F7]">
                      <div className="flex items-start gap-3">
                        {localSamplingScale[0] === 0 && <Zap className="w-5 h-5 text-[#00B5B3] mt-0.5 flex-shrink-0" />}
                        {localSamplingScale[0] === 1 && <BarChart3 className="w-5 h-5 text-[#00B5B3] mt-0.5 flex-shrink-0" />}
                        {localSamplingScale[0] === 2 && <TrendingUp className="w-5 h-5 text-[#00B5B3] mt-0.5 flex-shrink-0" />}
                        <div>
                          <p className="text-sm text-[#333333] mb-2">
                            <span className="font-medium">{getSamplingLabel(localSamplingScale[0])} Mode:</span>
                          </p>
                          <p className="text-sm text-[#666666]">
                            {getSamplingDescription(localSamplingScale[0])}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#EEEEEE]">
                      <div className="text-center">
                        <div className="text-2xl font-semibold text-[#333333] mb-1">
                          {localSamplingScale[0] === 0 ? '10%' : localSamplingScale[0] === 1 ? '50%' : '100%'}
                        </div>
                        <div className="text-xs text-[#666666]">Data Sampling</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-semibold text-[#333333] mb-1">
                          {localSamplingScale[0] === 0 ? '~2min' : localSamplingScale[0] === 1 ? '~5min' : '~10min'}
                        </div>
                        <div className="text-xs text-[#666666]">Avg. Processing</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-semibold text-[#333333] mb-1">
                          {localSamplingScale[0] === 0 ? 'Low' : localSamplingScale[0] === 1 ? 'Medium' : 'High'}
                        </div>
                        <div className="text-xs text-[#666666]">Cost Impact</div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t border-[#EEEEEE]">
                      <Button
                        className="bg-[#00B5B3] hover:bg-[#009996]"
                        onClick={handleSaveSamplingSettings}
                      >
                        Save Settings
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Data Connectors (Admin Only) */}
            {canAccessDataSources && (
              <TabsContent value="data-connectors" className="p-6 m-0">
                <div className="max-w-6xl mx-auto space-y-6">
                  {/* Connected Sources */}
                  {dataConnectors.length > 0 && (
                    <div>
                      <h2 className="text-sm font-medium text-[#333333] mb-4">Connected Data Sources</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {dataConnectors.map((connector) => {
                          const sourceInfo = availableDataSources.find(s => s.id === connector.type) || {
                            icon: '🔗',
                            name: connector.name,
                            description: 'Connected data source'
                          };
                          return (
                          <Card
                            key={connector.id}
                            className="p-4 border-2 border-[#E0F7F7] bg-gradient-to-br from-white to-[#F0FFFE]"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="text-3xl">{sourceInfo.icon}</div>
                                <div>
                                  <h3 className="text-sm font-medium text-[#333333]">{connector.name}</h3>
                                  <Badge
                                    variant="outline"
                                    className={`mt-1 border-0 text-[10px] px-2 py-0 ${
                                      connector.status === 'connected' 
                                        ? 'bg-green-100 text-green-700'
                                        : connector.status === 'error'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {connector.status === 'connected' && <CheckCircle className="w-3 h-3 mr-1" />}
                                    {connector.status === 'error' && <XCircle className="w-3 h-3 mr-1" />}
                                    {connector.status.charAt(0).toUpperCase() + connector.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-[#666666] mb-1">{sourceInfo.description}</p>
                            {connector.host && (
                              <p className="text-xs text-[#999999] mb-3 font-mono">{connector.host}</p>
                            )}
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-2 border-[#DDDDDD] text-xs h-8"
                              >
                                Configure
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  removeDataConnector(connector.id);
                                  toast.success(`${connector.name} disconnected`);
                                }}
                                className="flex-1 border-2 border-[#DDDDDD] text-xs h-8 text-red-600 hover:text-red-700"
                              >
                                Disconnect
                              </Button>
                            </div>
                          </Card>
                        );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Add New Connector */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-medium text-[#333333]">Available Data Connectors</h2>
                      <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#999999]" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search data sources..."
                          className="pl-10 border-2 border-[#DDDDDD] focus:border-[#00B5B3] h-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {filteredDataSources.map((source) => (
                        <Card
                          key={source.id}
                          className="p-4 border-2 border-[#EEEEEE] hover:border-[#00B5B3] hover:shadow-md transition-all cursor-pointer"
                          onClick={() => handleConnectDataSource(source)}
                        >
                          <div className="text-center">
                            <div className="text-4xl mb-2">{source.icon}</div>
                            <h3 className="text-xs font-medium text-[#333333] mb-1 line-clamp-2">
                              {source.name}
                            </h3>
                            <Button
                              size="sm"
                              className="w-full bg-[#00B5B3] hover:bg-[#009996] h-7 text-xs mt-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConnectDataSource(source);
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Connect
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {filteredDataSources.length === 0 && searchQuery && (
                      <div className="text-center py-12">
                        <Database className="w-12 h-12 text-[#CCCCCC] mx-auto mb-3" />
                        <p className="text-sm text-[#666666]">No data sources found matching "{searchQuery}"</p>
                      </div>
                    )}
                  </div>

                  {/* Reference Image */}
                  <div className="mt-8 p-4 bg-[#F5F5F5] rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <ExternalLink className="w-4 h-4 text-[#00B5B3]" />
                      <p className="text-xs text-[#666666]">
                        Design reference from Databricks platform
                      </p>
                    </div>
                    <img
                      src={connectorImage}
                      alt="Databricks connector reference"
                      className="w-full rounded border border-[#DDDDDD]"
                    />
                  </div>
                </div>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>

      {/* Connection Dialog */}
      <Dialog open={showConnectorDialog} onOpenChange={setShowConnectorDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="text-3xl">{selectedConnector?.icon}</div>
              <span>Connect to {selectedConnector?.name}</span>
            </DialogTitle>
            <DialogDescription>{selectedConnector?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="connection-name" className="text-sm text-[#666666]">
                Connection Name
              </Label>
              <Input
                id="connection-name"
                placeholder={`My ${selectedConnector?.name} Connection`}
                className="mt-1 border-2 border-[#DDDDDD] focus:border-[#00B5B3]"
              />
            </div>

            <div>
              <Label htmlFor="host" className="text-sm text-[#666666]">
                Host/Server
              </Label>
              <Input
                id="host"
                placeholder="server.example.com"
                className="mt-1 border-2 border-[#DDDDDD] focus:border-[#00B5B3]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username" className="text-sm text-[#666666]">
                  Username
                </Label>
                <Input
                  id="username"
                  placeholder="username"
                  className="mt-1 border-2 border-[#DDDDDD] focus:border-[#00B5B3]"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-sm text-[#666666]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="mt-1 border-2 border-[#DDDDDD] focus:border-[#00B5B3]"
                />
              </div>
            </div>

            <div className="p-3 bg-[#FFF9E6] border border-[#FFE8A3] rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-[#D4A500] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#8B7300] mb-1 font-medium">Security Note</p>
                  <p className="text-xs text-[#8B7300]">
                    Credentials are encrypted and stored securely. Only administrators can view and modify connection settings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConnectorDialog(false)}
              className="border-2 border-[#DDDDDD]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveConnection}
              className="bg-[#00B5B3] hover:bg-[#009996]"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Connect
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
