import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Users, Upload, FileText, ChevronRight, X, Plus, Code } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SqlWorkbench } from '../../components/SqlWorkbench';

interface GoldenQuery {
  id: string;
  query: string;
  context: string;
}

export function Step2PersonaDefinition() {
  const navigate = useNavigate();
  const [businessContext, setBusinessContext] = useState('');
  const [targetUserRole, setTargetUserRole] = useState('');
  const [userIdentifierTable, setUserIdentifierTable] = useState('');
  const [userIdentifierColumn, setUserIdentifierColumn] = useState('');
  const [goldenQueries, setGoldenQueries] = useState<GoldenQuery[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentContext, setCurrentContext] = useState('');
  const [importMethod, setImportMethod] = useState<'paste' | 'databricks'>('paste');
  
  // SQL Workbench state
  const [sqlWorkbenchOpen, setSqlWorkbenchOpen] = useState(false);
  const [editingQueryId, setEditingQueryId] = useState<string | null>(null);

  const handleAddQuery = () => {
    if (!currentQuery.trim() || !currentContext.trim()) {
      toast.error('Please provide both query and context');
      return;
    }
    const newQuery: GoldenQuery = {
      id: Date.now().toString(),
      query: currentQuery,
      context: currentContext,
    };
    setGoldenQueries([...goldenQueries, newQuery]);
    setCurrentQuery('');
    setCurrentContext('');
    toast.success('Golden query added');
  };

  const handleRemoveQuery = (id: string) => {
    setGoldenQueries(goldenQueries.filter((q) => q.id !== id));
    toast.success('Query removed');
  };

  const handleContinue = () => {
    if (!businessContext.trim()) {
      toast.error('Please provide business context');
      return;
    }
    const wizardData = {
      businessContext,
      targetUserRole,
      userIdentifierTable,
      userIdentifierColumn,
      goldenQueries,
    };
    localStorage.setItem('wizardData', JSON.stringify({ 
      ...JSON.parse(localStorage.getItem('wizardData') || '{}'),
      ...wizardData 
    }));
    toast.success('Persona defined successfully');
    navigate('/agents/create/step-3');
  };

  return (
    <WizardLayout
      currentStep={2}
      totalSteps={5}
      title="Persona Definition"
      onBack={() => navigate('/agents/create/step-1')}
      onSaveDraft={() => {
        localStorage.setItem('wizardDraft', JSON.stringify({ 
          step: 2, 
          businessContext,
          targetUserRole,
          goldenQueries 
        }));
        toast.success('Draft saved');
      }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Business Context */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="businessContext">Business Context *</Label>
              <p className="text-sm text-[#666666] mt-1 mb-3">
                Describe the business domain and what insights this agent should provide
              </p>
              <Textarea
                id="businessContext"
                placeholder="e.g., This agent helps sales managers analyze revenue trends, track top-performing products, and monitor customer purchasing patterns across different regions..."
                value={businessContext}
                onChange={(e) => setBusinessContext(e.target.value)}
                rows={4}
                className="resize-none border-2 border-[#DDDDDD] focus:border-[#00B5B3] transition-colors"
              />
            </div>
          </div>
        </Card>

        {/* Target Users */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E0F7F7] flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-[#00B5B3]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#333333] mb-2">Who is this agent for?</h3>
                <p className="text-sm text-[#666666] mb-4">
                  Define the target user roles and how to identify them in your data
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userRole">Target User Role</Label>
                    <Input
                      id="userRole"
                      placeholder="e.g., Sales Managers, Analysts"
                      value={targetUserRole}
                      onChange={(e) => setTargetUserRole(e.target.value)}
                      className="mt-2 border-2 border-[#DDDDDD] focus:border-[#00B5B3] h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userTable">User Identifier Table</Label>
                    <Select value={userIdentifierTable} onValueChange={setUserIdentifierTable}>
                      <SelectTrigger id="userTable" className="mt-2 border-2 border-[#DDDDDD] h-11">
                        <SelectValue placeholder="Select table" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ecommerce.users">ecommerce.users</SelectItem>
                        <SelectItem value="ecommerce.employees">ecommerce.employees</SelectItem>
                        <SelectItem value="ecommerce.customers">ecommerce.customers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {userIdentifierTable && (
                  <div className="mt-4">
                    <Label htmlFor="userColumn">User Role Column</Label>
                    <Select value={userIdentifierColumn} onValueChange={setUserIdentifierColumn}>
                      <SelectTrigger id="userColumn" className="mt-2 border-2 border-[#DDDDDD] h-11">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="role">role</SelectItem>
                        <SelectItem value="job_title">job_title</SelectItem>
                        <SelectItem value="department">department</SelectItem>
                        <SelectItem value="user_type">user_type</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Golden Query Set */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-[#333333] mb-2">Import Golden Query Set</h3>
              <p className="text-sm text-[#666666] mb-4">
                Provide example queries that represent the types of questions this agent should answer
              </p>

              <Tabs value={importMethod} onValueChange={(v) => setImportMethod(v as 'paste' | 'databricks')}>
                <TabsList className="mb-4">
                  <TabsTrigger value="paste">
                    <FileText className="w-4 h-4 mr-2" />
                    Paste Query
                  </TabsTrigger>
                  <TabsTrigger value="databricks">
                    <Upload className="w-4 h-4 mr-2" />
                    Import from Databricks
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="paste" className="space-y-4">
                  <div>
                    <Label htmlFor="query">SQL Query</Label>
                    <Button
                      variant="outline"
                      className="mt-2 w-full justify-start h-auto py-3"
                      onClick={() => {
                        setEditingQueryId(null);
                        setSqlWorkbenchOpen(true);
                      }}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      {currentQuery ? (
                        <span className="font-mono text-xs text-left truncate">{currentQuery}</span>
                      ) : (
                        <span className="text-[#999999]">Click to write or edit SQL query</span>
                      )}
                    </Button>
                  </div>
                  <div>
                    <Label htmlFor="context">Query Context & Purpose</Label>
                    <Input
                      id="context"
                      placeholder="e.g., Shows all orders from Q1 2024 for quarterly reporting"
                      value={currentContext}
                      onChange={(e) => setCurrentContext(e.target.value)}
                      className="mt-2 border-2 border-[#DDDDDD] focus:border-[#00B5B3] h-11"
                    />
                  </div>
                  <Button onClick={handleAddQuery} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Query
                  </Button>
                </TabsContent>

                <TabsContent value="databricks" className="space-y-4">
                  <div className="border-2 border-dashed border-[#CCCCCC] rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-[#999999] mx-auto mb-3" />
                    <p className="text-sm text-[#666666] mb-3">
                      Connect to Databricks to import saved queries
                    </p>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Connect to Databricks
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Added Queries */}
              {goldenQueries.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-medium text-[#333333]">
                    Added Queries ({goldenQueries.length})
                  </h4>
                  {goldenQueries.map((gq) => (
                    <div key={gq.id} className="border border-[#EEEEEE] rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              SQL
                            </Badge>
                            <p className="text-sm text-[#666666]">{gq.context}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveQuery(gq.id)}
                          className="flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-8"
                        onClick={() => {
                          setEditingQueryId(gq.id);
                          setSqlWorkbenchOpen(true);
                        }}
                      >
                        <Code className="w-3 h-3 mr-1" />
                        View & Edit SQL
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Continue Button */}
        <div className="flex justify-end">
          <Button onClick={handleContinue} className="bg-[#00B5B3] hover:bg-[#009996]">
            Continue
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* SQL Workbench */}
      <SqlWorkbench
        open={sqlWorkbenchOpen}
        onOpenChange={setSqlWorkbenchOpen}
        initialSql={editingQueryId ? goldenQueries.find((q) => q.id === editingQueryId)?.query || '' : currentQuery}
        title={editingQueryId ? 'Edit SQL Query' : 'Add SQL Query'}
        description={editingQueryId ? 'Edit and test your SQL query' : 'Write and test your SQL query'}
        onSave={(sql) => {
          if (editingQueryId) {
            // Update existing query
            setGoldenQueries((prev) =>
              prev.map((q) => (q.id === editingQueryId ? { ...q, query: sql } : q))
            );
            toast.success('Query updated');
          } else {
            // Set current query for new addition
            setCurrentQuery(sql);
            toast.success('Query ready to add');
          }
        }}
      />
    </WizardLayout>
  );
}
