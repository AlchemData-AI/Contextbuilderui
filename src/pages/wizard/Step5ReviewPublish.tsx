import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { 
  Database, 
  Users, 
  Network, 
  TrendingUp, 
  MessageSquare,
  CheckCircle2,
  Rocket
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function Step5ReviewPublish() {
  const navigate = useNavigate();
  const [agentName, setAgentName] = useState('Sales Analytics Agent');
  const [agentDescription, setAgentDescription] = useState('Analyzes sales performance, inventory trends, and customer behavior');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (!agentName.trim()) {
      toast.error('Please provide an agent name');
      return;
    }

    setIsPublishing(true);
    
    // Simulate publishing
    setTimeout(() => {
      toast.success('Agent published successfully!');
      navigate('/');
    }, 2000);
  };

  return (
    <WizardLayout
      currentStep={6}
      totalSteps={6}
      title="Review & Publish"
      onBack={() => navigate('/agents/create/step-5')}
      onSaveDraft={() => {
        localStorage.setItem('wizardDraft', JSON.stringify({ 
          step: 6, 
          agentName, 
          agentDescription 
        }));
        toast.success('Draft saved');
      }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Agent Details */}
        <Card className="p-6">
          <h3 className="font-semibold text-[#333333] mb-4">Agent Details</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="agentName">Agent Name *</Label>
              <Input
                id="agentName"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g., Sales Analytics Agent"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="agentDescription">Description</Label>
              <Textarea
                id="agentDescription"
                value={agentDescription}
                onChange={(e) => setAgentDescription(e.target.value)}
                placeholder="Describe what this agent does..."
                rows={3}
                className="mt-2 resize-none"
              />
            </div>
          </div>
        </Card>

        {/* Configuration Summary */}
        <Card className="p-6">
          <h3 className="font-semibold text-[#333333] mb-4">Configuration Summary</h3>
          
          <div className="space-y-4">
            {/* Tables */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E0F7F7] flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5 text-[#00B5B3]" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-[#333333] mb-2">Data Tables</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">ecommerce.orders</Badge>
                  <Badge variant="outline">ecommerce.order_items</Badge>
                  <Badge variant="outline">ecommerce.customers</Badge>
                  <Badge variant="outline">ecommerce.products</Badge>
                  <Badge variant="outline">warehouse.inventory</Badge>
                  <Badge variant="outline">logistics.shipments</Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Persona */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E0F7F7] flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-[#00B5B3]" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-[#333333] mb-2">Target Users</h4>
                <p className="text-sm text-[#666666]">Sales Managers, Business Analysts</p>
              </div>
            </div>

            <Separator />

            {/* Relationships */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E0F7F7] flex items-center justify-center flex-shrink-0">
                <Network className="w-5 h-5 text-[#00B5B3]" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-[#333333] mb-2">Validated Relationships</h4>
                <p className="text-sm text-[#666666]">3 table relationships configured</p>
              </div>
            </div>

            <Separator />

            {/* Metrics */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E0F7F7] flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-[#00B5B3]" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-[#333333] mb-2">Key Metrics</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Total Revenue</Badge>
                  <Badge variant="outline">Average Order Value</Badge>
                  <Badge variant="outline">Active Customers</Badge>
                  <Badge variant="outline">Inventory Turnover</Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Sample Queries */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E0F7F7] flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-[#00B5B3]" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-[#333333] mb-2">Sample Queries</h4>
                <p className="text-sm text-[#666666]">3 validated sample queries</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Publish */}
        <Card className="p-6 bg-[#F0FFFE] border-[#00B5B3]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#00B5B3] flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#333333] mb-2">Ready to Publish</h3>
              <p className="text-sm text-[#666666] mb-4">
                Your agent is configured and ready to use. Click "Publish Agent" to make it available to your team.
              </p>
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                className="bg-[#00B5B3] hover:bg-[#009996]"
              >
                {isPublishing ? (
                  <>Publishing...</>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Publish Agent
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </WizardLayout>
  );
}
