import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Sparkles, User, Briefcase, Globe, Database, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../lib/authStore';
import { Logo } from '../components/Logo';
import { toast } from 'sonner@2.0.3';

export function Onboarding() {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    team: '',
    jobRole: '',
    geographies: [] as string[],
    dataIdentifiers: '',
  });
  const [geoInput, setGeoInput] = useState('');

  const handleAddGeography = () => {
    if (geoInput.trim() && !formData.geographies.includes(geoInput.trim())) {
      setFormData({
        ...formData,
        geographies: [...formData.geographies, geoInput.trim()],
      });
      setGeoInput('');
    }
  };

  const handleRemoveGeography = (geo: string) => {
    setFormData({
      ...formData,
      geographies: formData.geographies.filter((g) => g !== geo),
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    completeOnboarding({
      team: formData.team,
      jobRole: formData.jobRole,
      geographies: formData.geographies,
      dataIdentifiers: formData.dataIdentifiers,
    });

    toast.success('Welcome to AlchemData AI!');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E0F7F7] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Logo size={56} />
            <h1 className="text-[#333333]">AlchemData AI</h1>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-[#00B5B3]" />
            <h2 className="text-xl text-[#333333]">Welcome! Let's personalize your experience</h2>
          </div>
          <p className="text-sm text-[#666666]">
            Tell us a bit about yourself to help us provide better insights
          </p>
        </div>

        <Card className="p-8 border-2 border-[#EEEEEE]">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-[#00B5B3]" />
                <Label htmlFor="name" className="text-sm font-medium text-[#333333]">
                  Full Name *
                </Label>
              </div>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Sarah Chen"
                className="border-2 border-[#DDDDDD] focus:border-[#00B5B3] h-11"
              />
            </div>

            {/* Team */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-[#00B5B3]" />
                <Label htmlFor="team" className="text-sm font-medium text-[#333333]">
                  Team
                </Label>
              </div>
              <Input
                id="team"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                placeholder="e.g., West Coast Sales, Data Analytics"
                className="border-2 border-[#DDDDDD] focus:border-[#00B5B3] h-11"
              />
            </div>

            {/* Job Role */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-[#00B5B3]" />
                <Label htmlFor="jobRole" className="text-sm font-medium text-[#333333]">
                  Job Role
                </Label>
              </div>
              <Input
                id="jobRole"
                value={formData.jobRole}
                onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                placeholder="e.g., Sales Manager, Senior Analyst"
                className="border-2 border-[#DDDDDD] focus:border-[#00B5B3] h-11"
              />
            </div>

            {/* Geographies */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-[#00B5B3]" />
                <Label className="text-sm font-medium text-[#333333]">
                  Geographies You Work With
                </Label>
              </div>
              <div className="flex gap-2 mb-3">
                <Input
                  value={geoInput}
                  onChange={(e) => setGeoInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddGeography();
                    }
                  }}
                  placeholder="e.g., California, Oregon"
                  className="border-2 border-[#DDDDDD] focus:border-[#00B5B3] h-10"
                />
                <Button
                  type="button"
                  onClick={handleAddGeography}
                  variant="outline"
                  className="border-2 border-[#00B5B3] text-[#00B5B3] hover:bg-[#E6F7F7]"
                >
                  Add
                </Button>
              </div>
              {formData.geographies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.geographies.map((geo) => (
                    <Badge
                      key={geo}
                      variant="secondary"
                      className="bg-[#E6F7F7] text-[#00B5B3] border-0 px-3 py-1 cursor-pointer hover:bg-[#D0F0EF]"
                      onClick={() => handleRemoveGeography(geo)}
                    >
                      {geo} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Data Identifiers */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-[#00B5B3]" />
                <Label htmlFor="dataIdentifiers" className="text-sm font-medium text-[#333333]">
                  Data Identifiers
                </Label>
              </div>
              <p className="text-xs text-[#666666] mb-2">
                Any specific identifiers in the data that represent you (e.g., sales rep ID, user ID)
              </p>
              <Textarea
                id="dataIdentifiers"
                value={formData.dataIdentifiers}
                onChange={(e) => setFormData({ ...formData, dataIdentifiers: e.target.value })}
                placeholder="e.g., sales_rep_id = 101, user_id = 'sarah.chen'"
                rows={3}
                className="border-2 border-[#DDDDDD] focus:border-[#00B5B3] resize-none"
              />
            </div>

            {/* Info Card */}
            <div className="p-4 bg-[#F0FFFE] rounded-lg border border-[#E0F7F7]">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#00B5B3] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-[#333333] mb-2">
                    This information helps us:
                  </p>
                  <ul className="text-xs text-[#666666] space-y-1">
                    <li>• Automatically filter data relevant to your role and region</li>
                    <li>• Create personalized cohorts and saved views</li>
                    <li>• Provide more contextual AI assistance</li>
                    <li>• Save you time by pre-applying common filters</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              className="w-full bg-[#00B5B3] hover:bg-[#009996] h-12"
            >
              Get Started
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Skip Option */}
        <div className="text-center mt-4">
          <button
            onClick={() => {
              completeOnboarding({});
              navigate('/');
            }}
            className="text-sm text-[#666666] hover:text-[#00B5B3] transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
