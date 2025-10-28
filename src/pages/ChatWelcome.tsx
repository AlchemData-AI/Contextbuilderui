import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Send, Sparkles, Database, Globe, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { mockAgents } from '../lib/mockData';
import { useAuthStore } from '../lib/authStore';

export function ChatWelcome() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Get published agents the user has access to
  const sharedAgents = useMemo(() => {
    if (!user) return [];
    
    return mockAgents
      .filter((agent) => {
        // Must be published
        if (agent.status !== 'published') return false;
        
        // Public agents are available to all
        if (agent.visibility === 'public') return true;
        
        // Private agents - check if user has access
        if (agent.visibility === 'private') {
          return agent.sharedWith?.includes(user.email) || false;
        }
        
        // Default to public if visibility not specified
        return true;
      })
      .slice(0, 3); // Show top 3 agents
  }, [user]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    
    // Navigate to new chat with the query in state
    navigate('/chat/new', { state: { initialMessage: input } });
  };

  const handleAgentClick = (agentName: string, agentContext: string) => {
    const prompt = `Using the ${agentName}, ${agentContext}`;
    navigate('/chat/new', { state: { initialMessage: prompt, agentName } });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 py-12">
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-[#00B5B3]" />
        </div>
        <h1 className="text-[#333333] mb-2">
          What can I help you analyze today?
        </h1>
        <p className="text-[#666666]">
          Ask questions about your data, run analysis, or explore insights
        </p>
      </motion.div>

      {/* Main Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-3xl"
      >
        <form onSubmit={handleSubmit}>
          <div
            className={`
              relative rounded-lg border-2 transition-all
              ${isFocused 
                ? 'border-[#00B5B3] shadow-lg shadow-[#00B5B3]/10' 
                : 'border-[#EEEEEE] hover:border-[#DDDDDD]'
              }
            `}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="How can I help you today?"
              className="min-h-[120px] resize-none border-0 focus-visible:ring-0 text-[#333333] placeholder:text-[#999999] pr-12"
            />
            <div className="absolute bottom-3 right-3">
              <Button
                type="submit"
                disabled={!input.trim()}
                size="sm"
                className="bg-[#00B5B3] hover:bg-[#009996] disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Helper Text */}
          <div className="mt-2 text-xs text-[#999999] text-center">
            Press <kbd className="px-1.5 py-0.5 bg-[#F5F5F5] rounded border border-[#EEEEEE]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-[#F5F5F5] rounded border border-[#EEEEEE]">Shift + Enter</kbd> for new line
          </div>
        </form>
      </motion.div>

      {/* Shared Agents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-5xl mt-12"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-[#666666]">
            Agents shared with you:
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/agents')}
            className="text-xs text-[#00B5B3] hover:text-[#009996] h-auto p-0"
          >
            View all agents →
          </Button>
        </div>
        
        {sharedAgents.length === 0 ? (
          <div className="text-center py-12 border border-[#EEEEEE] rounded-lg">
            <Database className="w-12 h-12 text-[#CCCCCC] mx-auto mb-3" />
            <p className="text-sm text-[#666666] mb-1">No agents shared with you yet</p>
            <p className="text-xs text-[#999999]">
              Contact your team admin to get access to agents
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sharedAgents.map((agent) => (
              <motion.button
                key={agent.id}
                onClick={() => handleAgentClick(agent.name, agent.contextDescription || 'analyze data')}
                className="group p-4 rounded-lg border border-[#EEEEEE] hover:border-[#00B5B3] hover:shadow-md transition-all text-left"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#F5F5F5] group-hover:bg-[#E6F7F7] transition-colors flex-shrink-0">
                    <Database className="w-4 h-4 text-[#666666] group-hover:text-[#00B5B3] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="text-sm font-medium text-[#333333] line-clamp-1">
                        {agent.name}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="bg-[#E6F7F7] text-[#00B5B3] border-0 text-[10px] px-1.5 py-0 flex-shrink-0"
                      >
                        {agent.category}
                      </Badge>
                    </div>
                    <div className="text-xs text-[#999999] line-clamp-2 leading-relaxed">
                      {agent.description}
                    </div>
                    {agent.tables && agent.tables.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <div className="text-[10px] text-[#999999]">
                          {agent.tables.length} {agent.tables.length === 1 ? 'table' : 'tables'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12 text-xs text-[#999999]"
      >
        Powered by AlchemData Context Agents
      </motion.div>
    </div>
  );
}
