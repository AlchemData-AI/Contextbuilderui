import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  Database,
  ArrowLeft,
  MessageSquarePlus,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuthStore } from '../lib/authStore';
import { useConversationStore } from '../lib/conversationStore';
import { motion } from 'motion/react';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface ChatConversation {
  id: string;
  title: string;
  user: string;
  agent: string;
  status: 'review-needed' | 'reviewed' | 'in-progress' | 'completed';
  lastMessage: string;
  timestamp: string;
  messageCount: number;
  isReviewedByMe?: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

const formatTimestamp = (date: Date | string): string => {
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const diff = now.getTime() - dateObj.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  
  return dateObj.toLocaleDateString();
};

// ══════════════════════════════════════════════════════════════�����═══
// MAIN COMPONENT
// ══════════════════════════════════════��════════════════════════════

export function ChatDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getAllConversations } = useConversationStore();

  const isAnalystOrAdmin = user?.role === 'analyst' || user?.role === 'admin';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');

  // Get all conversations from the store and transform them
  const allConversations = getAllConversations();
  
  // Filter by user if not analyst/admin
  const userConversations = isAnalystOrAdmin 
    ? allConversations 
    : allConversations.filter(conv => conv.userId === user?.id);
  
  const conversations: ChatConversation[] = userConversations.map((conv) => {
    const lastMessage = conv.messages[conv.messages.length - 1];
    return {
      id: conv.id,
      title: conv.title,
      user: conv.userName,
      agent: conv.agentName,
      status: conv.status,
      lastMessage: lastMessage?.content || 'No messages yet',
      timestamp: formatTimestamp(conv.updatedAt),
      messageCount: conv.messages.length,
      isReviewedByMe: conv.reviewedBy === user?.name,
    };
  });

  // Get unique users and agents for filters
  const uniqueUsers = Array.from(new Set(conversations.map(c => c.user)));
  const uniqueAgents = Array.from(new Set(conversations.map(c => c.agent)));

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.agent.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    const matchesUser = userFilter === 'all' || conv.user === userFilter;
    const matchesAgent = agentFilter === 'all' || conv.agent === agentFilter;

    return matchesSearch && matchesStatus && matchesUser && matchesAgent;
  });

  // Status badge styling
  const getStatusBadge = (status: ChatConversation['status']) => {
    switch (status) {
      case 'review-needed':
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            Review Needed
          </Badge>
        );
      case 'reviewed':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Reviewed
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            In Progress
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            Completed
          </Badge>
        );
    }
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
  };

  const handleNewChat = () => {
    navigate('/chat');
  };

  // Simple view for regular users
  if (!isAnalystOrAdmin) {
    return (
      <div className="h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="border-b border-[#EEEEEE] px-6 py-4 flex-shrink-0">
          <h1 className="text-[#333333] mb-2">My Chats</h1>
          <p className="text-sm text-[#999999]">Your conversation history</p>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-[#EEEEEE] flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredConversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquarePlus className="w-12 h-12 text-[#CCCCCC] mx-auto mb-3" />
                <p className="text-[#999999] mb-4">No chats found</p>
                <Button
                  onClick={handleNewChat}
                  className="bg-[#00B5B3] hover:bg-[#009B99] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-w-4xl mx-auto">
                {filteredConversations.map((conv) => (
                  <motion.button
                    key={conv.id}
                    onClick={() => handleConversationClick(conv.id)}
                    className="w-full text-left p-4 rounded-lg border border-[#EEEEEE] hover:border-[#00B5B3] hover:bg-[#F8F9FA] transition-all group"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-[#333333] group-hover:text-[#00B5B3] transition-colors">
                        {conv.title}
                      </h3>
                      <span className="text-xs text-[#999999] flex-shrink-0 ml-4">
                        {conv.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-[#999999] line-clamp-2 mb-2">
                      {conv.lastMessage}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#666666]">
                      <Database className="w-3 h-3" />
                      {conv.agent}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
        </div>
      </div>
    );
  }

  // Full dashboard for analysts/admins
  return (
    <div className="h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white border-b border-[#EEEEEE] flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-[#F8F9FA] rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#666666]" />
          </button>
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <h1 className="text-[#333333]">AI Chat Dashboard</h1>
              <p className="text-sm text-[#999999]">All conversations across your team</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleNewChat}
            className="bg-[#00B5B3] hover:bg-[#009B99] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[1600px] mx-auto"
        >
          {/* Filters Section */}
          <div className="bg-white rounded-lg border border-[#EEEEEE] p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="w-5 h-5 text-[#666666]" />
              <h2 className="text-[#333333]">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="review-needed">Review Needed</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              {/* User Filter */}
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              {/* Agent Filter */}
              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {uniqueAgents.map((agent) => (
                    <SelectItem key={agent} value={agent}>
                      {agent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(searchQuery || statusFilter !== 'all' || userFilter !== 'all' || agentFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setUserFilter('all');
                    setAgentFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#999999]">Total Conversations</p>
                  <p className="text-2xl text-[#333333] mt-1">{conversations.length}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-[#00B5B3]" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#EEEEEE] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#999999]">Review Needed</p>
                  <p className="text-2xl text-[#333333] mt-1">
                    {conversations.filter(c => c.status === 'review-needed').length}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-700" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#EEEEEE] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#999999]">Reviewed</p>
                  <p className="text-2xl text-[#333333] mt-1">
                    {conversations.filter(c => c.status === 'reviewed').length}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Database className="w-4 h-4 text-green-700" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#EEEEEE] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#999999]">Active Users</p>
                  <p className="text-2xl text-[#333333] mt-1">{uniqueUsers.length}</p>
                </div>
                <User className="w-8 h-8 text-[#00B5B3]" />
              </div>
            </div>
          </div>

          {/* Conversations Table */}
          <div className="bg-white rounded-lg border border-[#EEEEEE] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%]">Conversation</TableHead>
                  <TableHead className="w-[15%]">User</TableHead>
                  <TableHead className="w-[15%]">Agent</TableHead>
                  <TableHead className="w-[12%]">Status</TableHead>
                  <TableHead className="w-[13%]">Last Activity</TableHead>
                  <TableHead className="w-[10%]">Messages</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConversations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <MessageSquarePlus className="w-12 h-12 text-[#CCCCCC] mx-auto mb-3" />
                      <p className="text-[#999999]">No conversations found</p>
                      <Button
                        onClick={handleNewChat}
                        variant="outline"
                        className="mt-4"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Start New Chat
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConversations.map((conv) => (
                    <TableRow
                      key={conv.id}
                      className="cursor-pointer hover:bg-[#F8F9FA] transition-colors"
                      onClick={() => handleConversationClick(conv.id)}
                    >
                      <TableCell className="max-w-0">
                        <div className="min-w-0">
                          <p className="text-[#333333] truncate">{conv.title}</p>
                          <p className="text-sm text-[#999999] mt-1 line-clamp-1">{conv.lastMessage}</p>
                        </div>
                      </TableCell>
                      <TableCell className="w-[15%]">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#E0F7F7] flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-[#00B5B3]" />
                          </div>
                          <span className="text-[#666666] truncate">{conv.user}</span>
                        </div>
                      </TableCell>
                      <TableCell className="w-[15%]">
                        <span className="text-[#666666] truncate block">{conv.agent}</span>
                      </TableCell>
                      <TableCell className="w-[12%]">{getStatusBadge(conv.status)}</TableCell>
                      <TableCell className="text-[#999999] w-[13%]">{conv.timestamp}</TableCell>
                      <TableCell className="w-[10%]">
                        <Badge variant="outline" className="text-[#666666]">
                          {conv.messageCount}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
