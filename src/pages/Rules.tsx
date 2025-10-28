import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Plus,
  Search,
  Filter,
  Globe,
  Lock,
  Calendar,
  MoreVertical,
  X,
  Send,
  Sparkles,
  Check,
  Users,
  MapPin,
  Tag,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { type Rule } from '../lib/mockData';
import { useAuthStore } from '../lib/authStore';
import { useRulesStore } from '../lib/rulesStore';
import { useSidebar } from '../components/ChatLayout';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';

export function Rules() {
  const user = useAuthStore((state) => state.user);
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const rules = useRulesStore((state) => state.rules);
  const addRule = useRulesStore((state) => state.addRule);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | Rule['type']>('all');
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter rules
  const filteredRules = rules.filter((rule) => {
    // Access filter - show public rules or private rules shared with user
    const hasAccess = rule.visibility === 'public' || 
      (rule.visibility === 'private' && rule.sharedWith?.includes(user?.email || ''));
    
    if (!hasAccess) return false;

    // Search filter
    const matchesSearch = !searchQuery || 
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    const matchesType = filterType === 'all' || rule.type === filterType;

    return matchesSearch && matchesType;
  });

  const handleStartRuleCreation = () => {
    setShowChatPanel(true);
    // Collapse the left sidebar for better focus
    if (!isCollapsed) {
      setIsCollapsed(true);
    }
    setChatMessages([
      {
        role: 'assistant',
        content: "Hi! I'll help you create a new rule. Rules can help you save filters, cohorts, or reference data you use frequently.\n\nWhat kind of rule would you like to create? For example:\n• A customer cohort (e.g., high-value customers)\n• A territory filter (e.g., specific regions or states)\n• A time period reference (e.g., holiday season)\n• A product category filter",
      },
    ]);
  };

  const handleCloseChatPanel = () => {
    setShowChatPanel(false);
    setChatMessages([]);
    setChatInput('');
    setIsProcessing(false);
    // Optionally expand the sidebar when closing
    // Uncomment if you want sidebar to auto-expand on close
    // if (isCollapsed) {
    //   setIsCollapsed(false);
    // }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isProcessing) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    
    // Add user message
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsProcessing(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simple rule creation flow simulation
    if (chatMessages.length === 1) {
      // First response - ask for details
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Great! Let me help you create a rule for "${userMessage}".\n\nPlease provide:\n1. A clear name for this rule\n2. A description of what it represents\n3. The filter criteria or definition (e.g., "customer_value > 10000" or "state IN ('CA', 'OR', 'WA')")`,
        },
      ]);
    } else if (chatMessages.length === 3) {
      // Second response - confirm and create
      const newRule = addRule({
        name: userMessage.split('\n')[0] || 'New Rule',
        owner: user?.email || '',
        type: 'custom',
        description: 'AI-generated rule from chat',
        definition: userMessage,
        visibility: 'private',
        sharedWith: [user?.email || ''],
        metadata: {},
        sourceType: 'manual',
      });

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Perfect! I've created your rule.\n\n**Rule Created:**\n• Name: ${newRule.name}\n• Type: Custom\n• Visibility: Private (only you can see it)\n\nYou can now use this rule in your analyses. Would you like to:\n1. Make it public so others can use it?\n2. Create another rule?\n3. Close this chat?`,
        },
      ]);

      toast.success('Rule created successfully!');
    } else {
      // Handle follow-up actions
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Great! The rule has been saved. You can close this chat and see it in your rules list.",
        },
      ]);
    }

    setIsProcessing(false);
  };

  const getRuleTypeIcon = (type: Rule['type']) => {
    switch (type) {
      case 'cohort':
        return <Users className="w-4 h-4" />;
      case 'filter':
        return <Filter className="w-4 h-4" />;
      case 'reference':
        return <Tag className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getRuleTypeBadgeColor = (type: Rule['type']) => {
    switch (type) {
      case 'cohort':
        return 'bg-purple-100 text-purple-700';
      case 'filter':
        return 'bg-blue-100 text-blue-700';
      case 'reference':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="h-screen flex bg-white">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${showChatPanel ? 'mr-[480px]' : ''} transition-all duration-300`}>
        {/* Header */}
        <div className="border-b border-[#EEEEEE] px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl text-[#333333] mb-1">Rules</h1>
              <p className="text-sm text-[#666666]">
                Save filters, cohorts, and reference data for quick access
              </p>
            </div>
            <Button 
              className="bg-[#00B5B3] hover:bg-[#009996]"
              onClick={handleStartRuleCreation}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Rule
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#999999]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rules..."
                className="pl-10 border-2 border-[#DDDDDD] focus:border-[#00B5B3] h-10"
              />
            </div>

            <div className="flex items-center gap-2">
              {['all', 'cohort', 'filter', 'reference', 'custom'].map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(type as typeof filterType)}
                  className={
                    filterType === type
                      ? 'bg-[#00B5B3] hover:bg-[#009996]'
                      : 'border-2 border-[#DDDDDD] hover:border-[#00B5B3]'
                  }
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Rules Grid */}
        <div className="flex-1 overflow-auto p-6">
          {filteredRules.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F5F5F5] mb-4">
                  <Sparkles className="w-8 h-8 text-[#999999]" />
                </div>
                <h2 className="text-lg text-[#333333] mb-2">
                  {searchQuery || filterType !== 'all' ? 'No rules found' : 'No rules yet'}
                </h2>
                <p className="text-sm text-[#666666] mb-6">
                  {searchQuery || filterType !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create rules to save commonly used filters and cohorts'}
                </p>
                {!searchQuery && filterType === 'all' && (
                  <Button 
                    className="bg-[#00B5B3] hover:bg-[#009996]"
                    onClick={handleStartRuleCreation}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Rule
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredRules.map((rule) => (
                <Card
                  key={rule.id}
                  className="p-4 border-2 border-[#EEEEEE] hover:border-[#00B5B3] hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${getRuleTypeBadgeColor(rule.type)} bg-opacity-20`}>
                        {getRuleTypeIcon(rule.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <h3 className="text-sm font-medium text-[#333333] line-clamp-1">
                            {rule.name}
                          </h3>
                          {rule.visibility === 'private' ? (
                            <Lock className="w-3.5 h-3.5 text-[#999999] flex-shrink-0" />
                          ) : (
                            <Globe className="w-3.5 h-3.5 text-[#00B5B3] flex-shrink-0" />
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${getRuleTypeBadgeColor(rule.type)}`}
                        >
                          {rule.type}
                        </Badge>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem>Share</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-xs text-[#666666] mb-3 line-clamp-2">{rule.description}</p>

                  <div className="p-2 bg-[#F5F5F5] rounded text-xs font-mono text-[#333333] mb-3 overflow-x-auto">
                    {rule.definition}
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#999999]">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Created {rule.createdAt}</span>
                    </div>
                    {rule.lastUsed && (
                      <div className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#00B5B3]" />
                        <span>Used {rule.lastUsed}</span>
                      </div>
                    )}
                  </div>

                  {rule.metadata && Object.keys(rule.metadata).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#EEEEEE] flex flex-wrap gap-2">
                      {rule.metadata.team && (
                        <Badge variant="outline" className="text-[10px] px-2 py-0">
                          <Users className="w-3 h-3 mr-1" />
                          {rule.metadata.team}
                        </Badge>
                      )}
                      {rule.metadata.geography && (
                        <Badge variant="outline" className="text-[10px] px-2 py-0">
                          <MapPin className="w-3 h-3 mr-1" />
                          {rule.metadata.geography}
                        </Badge>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Panel for Rule Creation */}
      <AnimatePresence>
        {showChatPanel && (
          <motion.div
            initial={{ x: 480 }}
            animate={{ x: 0 }}
            exit={{ x: 480 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 w-[480px] h-screen bg-white border-l-2 border-[#EEEEEE] flex flex-col z-50"
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-[#EEEEEE] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E0F7F7] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#00B5B3]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#333333]">Create New Rule</h3>
                  <p className="text-xs text-[#666666]">AI-assisted rule creation</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseChatPanel}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-[#00B5B3] text-white'
                        : 'bg-[#F5F5F5] text-[#333333]'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-[#F5F5F5] rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00B5B3] rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-[#00B5B3] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-[#00B5B3] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-[#EEEEEE] flex-shrink-0">
              <div className="flex gap-2">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Describe the rule you want to create..."
                  rows={3}
                  className="resize-none border-2 border-[#DDDDDD] focus:border-[#00B5B3]"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isProcessing}
                  className="bg-[#00B5B3] hover:bg-[#009996] h-auto px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
