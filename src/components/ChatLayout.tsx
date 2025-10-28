import { useState, createContext, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  MessageSquarePlus,
  Database,
  MessageSquare,
  FileText,
  Code,
  BookOpen,
  Settings as SettingsIcon,
  ChevronDown,
  LogOut,
  User,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuthStore } from '../lib/authStore';
import { useConversationStore } from '../lib/conversationStore';
import { motion, AnimatePresence } from 'motion/react';

// Context for sidebar collapse state
interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within ChatLayout');
  }
  return context;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  permission?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'agents', label: 'Agents', icon: Database, path: '/agents' },
  { id: 'chats', label: 'Chats', icon: MessageSquare, path: '/chat/dashboard' },
  { id: 'rules', label: 'Rules', icon: FileText, path: '/rules' },
  { id: 'sql', label: 'SQL Workbench', icon: Code, path: '/sql-workbench' },
  { id: 'catalog', label: 'Data Catalog', icon: BookOpen, path: '/data-catalog' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings' },
];

function formatConversationTime(date: Date | string): string {
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const diff = now.getTime() - dateObj.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (hours < 1) return 'Just now';
  if (hours < 24) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return 'This week';
  
  return dateObj.toLocaleDateString();
}

export function ChatLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { getAllConversations } = useConversationStore();
  const [hoveredConv, setHoveredConv] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAnalystOrAdmin = user?.role === 'analyst' || user?.role === 'admin';

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const conversations = getAllConversations()
    .filter(conv => isAnalystOrAdmin ? true : conv.userId === user?.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);

  const handleNewChat = () => {
    navigate('/chat');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActiveRoute = (path: string) => {
    if (path === '/agents') return location.pathname.startsWith('/agents');
    if (path === '/chat/dashboard') return location.pathname === '/chat/dashboard';
    if (path.startsWith('/chat')) return location.pathname.startsWith('/chat') && location.pathname !== '/chat/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleSidebar }}>
      <div className="h-screen flex bg-white">
        {/* Left Sidebar */}
        <motion.div
          animate={{ width: isCollapsed ? 64 : 256 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="border-r border-[#EEEEEE] flex flex-col bg-[#FAFAFA] overflow-hidden"
        >
          {/* Logo / Toggle */}
          <div className="p-4 border-b border-[#EEEEEE]">
            {!isCollapsed ? (
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => navigate('/chat')} 
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <Logo size={28} />
                  <span className="font-medium text-[#333333]">AlchemData AI</span>
                </button>
                <Button
                  onClick={toggleSidebar}
                  variant="ghost"
                  size="sm"
                  className="text-[#666666] hover:text-[#333333]"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={toggleSidebar}
                variant="ghost"
                size="icon"
                className="w-full text-[#666666] hover:text-[#333333] hover:bg-[#F5F5F5]"
                title="Expand sidebar"
              >
                <PanelLeft className="w-5 h-5" />
              </Button>
            )}</div>

          {/* New Chat Button */}
          <div className={isCollapsed ? "p-3" : "p-4"}>
            {!isCollapsed ? (
              <Button
                onClick={handleNewChat}
                className="w-full bg-[#00B5B3] hover:bg-[#009996] text-white"
              >
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            ) : (
              <Button
                onClick={handleNewChat}
                size="icon"
                className="w-full bg-[#00B5B3] hover:bg-[#009996] text-white"
                title="New Chat"
              >
                <MessageSquarePlus className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Navigation Items */}
          <div className="px-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              
              if (isCollapsed) {
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`
                      w-full flex items-center justify-center p-3 rounded-lg
                      transition-colors
                      ${isActive 
                        ? 'bg-[#E6F7F7] text-[#00B5B3]' 
                        : 'text-[#666666] hover:bg-[#F5F5F5]'
                      }
                    `}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              }
              
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg
                    transition-colors text-left
                    ${isActive 
                      ? 'bg-[#E6F7F7] text-[#00B5B3]' 
                      : 'text-[#666666] hover:bg-[#F5F5F5]'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Recent Chats - Only show when expanded */}
          {!isCollapsed && (
            <div className="flex-1 flex flex-col mt-6 min-h-0">
              <div className="px-4 pb-2 flex-shrink-0">
                <div className="text-xs text-[#999999] uppercase tracking-wide">
                  Recent Chats
                </div>
              </div>
              
              <div className="flex-1 min-h-0 px-2">
                <ScrollArea className="h-full">
                  <div className="space-y-1 pb-4 pr-3">
                    {conversations.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-[#999999]">
                        No recent chats
                      </div>
                    ) : (
                      conversations.map((conv) => {
                        const isActive = location.pathname === `/chat/${conv.id}`;
                        
                        return (
                          <motion.button
                            key={conv.id}
                            onClick={() => navigate(`/chat/${conv.id}`)}
                            onMouseEnter={() => setHoveredConv(conv.id)}
                            onMouseLeave={() => setHoveredConv(null)}
                            className={`
                              w-full text-left px-3 py-2 rounded-lg
                              transition-colors group
                              ${isActive 
                                ? 'bg-[#E6F7F7] text-[#00B5B3]' 
                                : 'text-[#666666] hover:bg-[#F5F5F5]'
                              }
                            `}
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.15 }}
                          >
                            <div className="text-sm truncate mb-1">
                              {conv.title}
                            </div>
                            <div className="text-xs text-[#999999]">
                              {formatConversationTime(conv.updatedAt)}
                            </div>
                          </motion.button>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {/* User Profile at Bottom */}
          <div className="border-t border-[#EEEEEE] p-3 mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {!isCollapsed ? (
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F5F5F5] transition-colors text-left">
                    <Avatar className="h-8 w-8 bg-[#00B5B3]">
                      <AvatarFallback className="bg-[#00B5B3] text-white text-xs">
                        {user ? getInitials(user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#333333] truncate">
                        {user?.name || 'User'}
                      </div>
                      <div className="text-xs text-[#999999] capitalize">
                        {user?.role || 'user'}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#999999]" />
                  </button>
                ) : (
                  <button className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors">
                    <Avatar className="h-8 w-8 bg-[#00B5B3]">
                      <AvatarFallback className="bg-[#00B5B3] text-white text-xs">
                        {user ? getInitials(user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
