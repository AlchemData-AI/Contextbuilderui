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
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { 
  Database, 
  Users, 
  Network, 
  TrendingUp, 
  MessageSquare,
  CheckCircle2,
  Rocket,
  Globe,
  Lock,
  Mail,
  X
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function Step6ReviewPublish() {
  const navigate = useNavigate();
  const [agentName, setAgentName] = useState('Sales Analytics Agent');
  const [agentDescription, setAgentDescription] = useState('Analyzes sales performance, inventory trends, and customer behavior');
  const [isPublishing, setIsPublishing] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [sharedEmails, setSharedEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');

  const handleAddEmail = () => {
    if (!newEmail.trim()) {
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (sharedEmails.includes(newEmail.toLowerCase())) {
      toast.error('This email is already added');
      return;
    }

    setSharedEmails([...sharedEmails, newEmail.toLowerCase()]);
    setNewEmail('');
    toast.success('Email added');
  };

  const handleRemoveEmail = (email: string) => {
    setSharedEmails(sharedEmails.filter(e => e !== email));
  };

  const handlePublish = async () => {
    if (!agentName.trim()) {
      toast.error('Please provide an agent name');
      return;
    }

    if (visibility === 'private' && sharedEmails.length === 0) {
      toast.error('Please add at least one email for private agents');
      return;
    }

    setIsPublishing(true);
    
    // Simulate publishing
    setTimeout(() => {
      // Navigate to success screen
      navigate('/publish-success');
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
        <Card className="p-6 border-2 border-[#EEEEEE]">
          <h3 className="font-semibold text-[#333333] mb-4">Agent Details</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="agentName">Agent Name *</Label>
              <Input
                id="agentName"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g., Sales Analytics Agent"
                className="mt-2 border-2 border-[#DDDDDD] focus:border-[#00B5B3] h-11"
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
                className="mt-2 resize-none border-2 border-[#DDDDDD] focus:border-[#00B5B3]"
              />
            </div>
          </div>
        </Card>

        {/* Configuration Summary */}
        <Card className="p-6 border-2 border-[#EEEEEE]">
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

        {/* Sharing Settings */}
        <Card className="p-6 border-2 border-[#EEEEEE]">
          <h3 className="font-semibold text-[#333333] mb-4">Sharing Settings</h3>
          
          <RadioGroup value={visibility} onValueChange={(value: 'public' | 'private') => setVisibility(value)}>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 border-2 border-[#DDDDDD] rounded-lg hover:border-[#00B5B3] transition-colors cursor-pointer" onClick={() => setVisibility('public')}>
                <RadioGroupItem value="public" id="public" className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-[#00B5B3]" />
                    <Label htmlFor="public" className="font-medium text-[#333333] cursor-pointer">
                      Public
                    </Label>
                  </div>
                  <p className="text-sm text-[#666666]">
                    Available to everyone in your organization
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border-2 border-[#DDDDDD] rounded-lg hover:border-[#00B5B3] transition-colors cursor-pointer" onClick={() => setVisibility('private')}>
                <RadioGroupItem value="private" id="private" className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-4 h-4 text-[#00B5B3]" />
                    <Label htmlFor="private" className="font-medium text-[#333333] cursor-pointer">
                      Private
                    </Label>
                  </div>
                  <p className="text-sm text-[#666666]">
                    Share with specific people by email
                  </p>
                </div>
              </div>
            </div>
          </RadioGroup>

          {/* Private Sharing Section */}
          {visibility === 'private' && (
            <div className="mt-4 p-4 bg-[#F5F5F5] rounded-lg">
              <Label className="text-sm font-medium text-[#333333] mb-3 block">
                Share with specific people
              </Label>
              
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#999999]" />
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEmail();
                      }
                    }}
                    placeholder="Enter email address"
                    className="pl-10 border-2 border-[#DDDDDD] focus:border-[#00B5B3] h-10"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddEmail}
                  variant="outline"
                  className="border-2 border-[#00B5B3] text-[#00B5B3] hover:bg-[#E6F7F7]"
                >
                  Add
                </Button>
              </div>

              {sharedEmails.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-[#666666] mb-2">
                    {sharedEmails.length} {sharedEmails.length === 1 ? 'person' : 'people'} will have access
                  </p>
                  {sharedEmails.map((email) => (
                    <div key={email} className="flex items-center justify-between p-2 bg-white rounded border border-[#EEEEEE]">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#666666]" />
                        <span className="text-sm text-[#333333]">{email}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveEmail(email)}
                        className="text-[#999999] hover:text-[#FF4444] transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Publish */}
        <Card className="p-6 bg-[#F0FFFE] border-2 border-[#00B5B3]">
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
                className="bg-[#00B5B3] hover:bg-[#009996] h-11"
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
