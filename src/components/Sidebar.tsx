import { NavLink, useNavigate } from 'react-router-dom';
import { Database, LayoutDashboard, FileText, Settings, HelpCircle, MessageSquare, LogOut, User } from 'lucide-react';
import { Logo } from './Logo';
import { useAuthStore, hasPermission } from '../lib/authStore';
import { Badge } from './ui/badge';

export function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allNavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Agents', permission: 'canViewAgents' },
    { to: '/chat', icon: MessageSquare, label: 'AI Chat', permission: 'canAccessChat' },
    { to: '/data-sources', icon: Database, label: 'Data Sources', permission: 'canAccessDataSources' },
    { to: '/documentation', icon: FileText, label: 'Documentation', permission: 'canAccessDocumentation' },
    { to: '/settings', icon: Settings, label: 'Settings', permission: 'canAccessSettings' },
  ];

  // Filter navigation items based on user permissions
  const navItems = allNavItems.filter((item) =>
    user ? hasPermission(user.role, item.permission as any) : false
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'user':
        return 'bg-blue-100 text-blue-700';
      case 'analyst':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <aside className="w-[240px] bg-white border-r border-[#EEEEEE] flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#EEEEEE]">
        <div className="flex items-center gap-3">
          <Logo size={40} />
          <span className="font-semibold text-[#333333]">AlchemData AI</span>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-3 py-4 border-b border-[#EEEEEE]">
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-[#E0F7F7] flex items-center justify-center text-[#00B5B3]">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#333333] truncate">{user.name}</p>
              <Badge className={`text-xs mt-1 ${getRoleBadgeColor(user.role)}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                    isActive
                      ? 'bg-[#E0F7F7] text-[#00B5B3]'
                      : 'text-[#666666] hover:bg-[#F8F9FA] hover:text-[#333333]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                    <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[#EEEEEE] space-y-1">
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded text-[#666666] hover:bg-[#F8F9FA] hover:text-[#333333] transition-colors">
          <HelpCircle className="w-5 h-5" strokeWidth={1.5} />
          <span>Help & Support</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded text-[#666666] hover:bg-[#F8F9FA] hover:text-[#333333] transition-colors"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
