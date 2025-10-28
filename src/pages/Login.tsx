import { useNavigate } from 'react-router-dom';
import { User, Shield, Star } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuthStore, DEMO_USERS } from '../lib/authStore';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleLogin = (userId: string) => {
    const user = DEMO_USERS.find((u) => u.id === userId);
    if (user) {
      login(user);
      navigate('/');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'user':
        return <User className="w-6 h-6" />;
      case 'analyst':
        return <Shield className="w-6 h-6" />;
      case 'admin':
        return <Star className="w-6 h-6" />;
      default:
        return <User className="w-6 h-6" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'user':
        return 'View agents, chat with AI, and request analyst reviews';
      case 'analyst':
        return 'Create and edit agents, review queries, and analyze data';
      case 'admin':
        return 'Full access to all features including data connectors';
      default:
        return '';
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E0F7F7] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Logo size={56} />
            <h1 className="text-[#333333]">AlchemData AI</h1>
          </div>
          <p className="text-[#666666]">
            Context Builder - Select your role to continue
          </p>
        </div>

        {/* User Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEMO_USERS.map((user) => (
            <Card
              key={user.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#00B5B3]"
              onClick={() => handleLogin(user.id)}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-[#E0F7F7] flex items-center justify-center text-[#00B5B3]">
                  {getRoleIcon(user.role)}
                </div>

                {/* Name & Email */}
                <div>
                  <h3 className="text-[#333333] mb-1">{user.name}</h3>
                  <p className="text-[#999999] text-sm">{user.email}</p>
                </div>

                {/* Role Badge */}
                <div
                  className={`px-3 py-1 rounded-full text-sm ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </div>

                {/* Description */}
                <p className="text-[#666666] text-sm min-h-[60px]">
                  {getRoleDescription(user.role)}
                </p>

                {/* Login Button */}
                <Button
                  className="w-full bg-[#00B5B3] hover:bg-[#009B99] text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogin(user.id);
                  }}
                >
                  Continue as {user.role}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-white rounded-lg px-6 py-4 shadow-sm">
            <h4 className="text-[#333333] mb-3">Role Access Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-left">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-[#333333]">Business User</span>
                </div>
                <ul className="text-[#666666] space-y-1 ml-6 list-disc text-xs">
                  <li>View agents</li>
                  <li>Chat with AI</li>
                  <li>Request reviews</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span className="text-[#333333]">Data Analyst</span>
                </div>
                <ul className="text-[#666666] space-y-1 ml-6 list-disc text-xs">
                  <li>Create/edit agents</li>
                  <li>Review queries</li>
                  <li>Validate analyses</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-amber-600" />
                  <span className="text-[#333333]">Administrator</span>
                </div>
                <ul className="text-[#666666] space-y-1 ml-6 list-disc text-xs">
                  <li>Full access</li>
                  <li>Data connectors</li>
                  <li>All permissions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
