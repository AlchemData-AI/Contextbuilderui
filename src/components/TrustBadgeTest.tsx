import { Badge } from './ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from './ui/hover-card';
import { Shield, Sparkles, Brain } from 'lucide-react';

/**
 * Simple test component to verify the trust badge is working
 * Add this anywhere in your app to test the badge functionality
 */
export function TrustBadgeTest() {
  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-md">
      <h2 className="text-lg font-semibold mb-4 text-[#333333]">Trust Badge Test</h2>
      
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-[#666666]">Hover over the badge below:</span>
      </div>
      
      <HoverCard>
        <HoverCardTrigger asChild>
          <div>
            <Badge className="bg-[#00B98E] hover:bg-[#00B98E] text-white text-xs cursor-help">
              ✓ Trusted Query
            </Badge>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-4" side="right">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00B98E]" />
              <h4 className="font-medium text-sm text-[#333333]">Trusted Query Breakdown</h4>
            </div>
            
            <div className="h-px bg-[#E5E7EB]" />
            
            {/* Golden Query Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span className="text-xs font-medium text-[#333333]">Golden Query</span>
                </div>
                <span className="text-xs font-bold text-[#00B98E]">70%</span>
              </div>
              <ul className="space-y-1 pl-5">
                <li className="text-xs text-[#666666] list-disc">Base revenue calculation</li>
                <li className="text-xs text-[#666666] list-disc">Regional grouping logic</li>
                <li className="text-xs text-[#666666] list-disc">Customer count aggregation</li>
              </ul>
            </div>
            
            {/* Semantic Model Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-[#00B5B3]" />
                  <span className="text-xs font-medium text-[#333333]">Semantic Model</span>
                </div>
                <span className="text-xs font-bold text-[#00B5B3]">30%</span>
              </div>
              <ul className="space-y-1 pl-5">
                <li className="text-xs text-[#666666] list-disc">Q3 2025 date filtering</li>
                <li className="text-xs text-[#666666] list-disc">Column selection and naming</li>
              </ul>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
      
      <div className="mt-4 p-3 bg-[#F0F9FF] border border-[#BAE6FD] rounded text-xs text-[#0369A1]">
        ✓ If you can see this tooltip on hover, the trust badge is working correctly!
      </div>
    </div>
  );
}
