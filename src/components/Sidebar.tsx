import { NavLink } from 'react-router-dom';
import { Database, LayoutDashboard, FileText, Settings, HelpCircle } from 'lucide-react';
import { Logo } from './Logo';

export function Sidebar() {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Agents' },
    { to: '/data-sources', icon: Database, label: 'Data Sources' },
    { to: '/documentation', icon: FileText, label: 'Documentation' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-[240px] bg-white border-r border-[#EEEEEE] flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#EEEEEE]">
        <div className="flex items-center gap-3">
          <Logo size={40} />
          <span className="font-semibold text-[#333333]">AlchemData AI</span>
        </div>
      </div>

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
      <div className="p-3 border-t border-[#EEEEEE]">
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded text-[#666666] hover:bg-[#F8F9FA] hover:text-[#333333] transition-colors">
          <HelpCircle className="w-5 h-5" strokeWidth={1.5} />
          <span>Help & Support</span>
        </button>
      </div>
    </aside>
  );
}
