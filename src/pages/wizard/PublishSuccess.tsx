import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { CheckCircle2, Sparkles, ArrowRight, Home } from 'lucide-react';

export function PublishSuccess() {
  const navigate = useNavigate();
  // Check if user has already configured connections
  const hasConnections = localStorage.getItem('agentConnectionsConfigured') === 'true';
  const [showDialog, setShowDialog] = useState(!hasConnections);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#F0FFFE] to-[#E0F7F7]">
      <Card className="max-w-2xl w-full mx-4 p-8 border-2 border-[#00B5B3]">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-[#00B98E] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-[#333333] mb-2">
            Agent Published Successfully! 🎉
          </h1>
          <p className="text-sm text-[#666666] mb-8">
            Your Sales Analytics Agent is now live and ready to use
          </p>

          {/* Next Steps */}
          <div className="space-y-4 text-left mb-8">
            <div className="flex items-start gap-3 p-4 bg-[#F0FFFE] rounded-lg border border-[#E0F7F7]">
              <div className="w-6 h-6 rounded-full bg-[#00B5B3] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[#333333] mb-1">
                  Configure Agent Relationships (Recommended)
                </h3>
                <p className="text-xs text-[#666666]">
                  Connect to other agents to unlock cross-domain insights. AI will suggest connections based on shared data.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-[#EEEEEE]">
              <div className="w-6 h-6 rounded-full bg-[#DDDDDD] text-[#666666] flex items-center justify-center text-xs font-semibold flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[#333333] mb-1">
                  Define Golden Queries & Metrics
                </h3>
                <p className="text-xs text-[#666666]">
                  Create pre-validated queries that showcase your agent's capabilities to end users.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/agents/sales-analytics-agent')}
              className="border-[#DDDDDD]"
            >
              <Home className="w-4 h-4 mr-2" />
              View Agent
            </Button>
            <Button
              className="bg-[#00B5B3] hover:bg-[#009996]"
              onClick={() => {
                if (hasConnections) {
                  navigate('/configure-relationships/sales-analytics-agent');
                } else {
                  setShowDialog(true);
                }
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {hasConnections ? 'View Relationships' : 'Configure Relationships'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Relationship Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00B5B3]" />
              Configure Agent Relationships
            </DialogTitle>
            <DialogDescription>
              Connect this agent to other agents for comprehensive analysis
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-[#F0FFFE] rounded-lg p-4 border border-[#E0F7F7]">
              <h4 className="text-sm font-semibold text-[#333333] mb-2">Why Relationships Matter</h4>
              <ul className="text-xs text-[#666666] space-y-1.5">
                <li>• Enable cross-domain insights (Sales + Customer + Inventory)</li>
                <li>• AI automatically routes complex queries to specialized agents</li>
                <li>• Provide more comprehensive answers to users</li>
                <li>• Leverage foreign key connections between distinct datasets</li>
              </ul>
            </div>

            <div className="bg-[#FFF9F0] rounded-lg p-4 border border-[#F79009]">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#F79009] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-[#333333] mb-1">AI Will Suggest Connections</p>
                  <p className="text-xs text-[#666666]">
                    We'll analyze foreign key relationships and shared tables to recommend the best connections.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                navigate('/agents/sales-analytics-agent');
              }}
              className="flex-1"
            >
              Skip for Now
            </Button>
            <Button
              className="bg-[#00B5B3] hover:bg-[#009996] flex-1"
              onClick={() => navigate('/configure-relationships/sales-analytics-agent')}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
