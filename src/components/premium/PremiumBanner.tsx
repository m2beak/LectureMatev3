import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Zap, Cloud, Users, FileDown, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PremiumBannerProps {
  variant?: 'compact' | 'full';
}

export const PremiumBanner = ({ variant = 'full' }: PremiumBannerProps) => {
  const { isPremium, profile } = useAuth();

  if (isPremium) return null;

  const features = [
    { icon: Zap, label: 'Unlimited AI calls', description: 'No daily limits' },
    { icon: Cloud, label: 'Unlimited cloud sync', description: 'Across all devices' },
    { icon: Users, label: 'Collaboration', description: 'Share with teammates' },
    { icon: FileDown, label: 'Export options', description: 'PDF, Anki, Notion' },
    { icon: BarChart3, label: 'Analytics', description: 'Track your progress' },
  ];

  if (variant === 'compact') {
    return (
      <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">Upgrade to Premium</p>
            <p className="text-xs text-muted-foreground">
              {profile?.aiCallsToday || 0}/5 AI calls used today
            </p>
          </div>
          <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shrink-0">
            Upgrade
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-amber-500/30">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5" />
      <CardHeader className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Upgrade to Premium</CardTitle>
            <CardDescription>Unlock the full potential of LecturerMate</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {features.map((feature) => (
            <div key={feature.label} className="text-center">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium">{feature.label}</p>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
          <div>
            <p className="text-2xl font-bold">$9.99<span className="text-base font-normal text-muted-foreground">/month</span></p>
            <p className="text-sm text-muted-foreground">or $99/year (save 17%)</p>
          </div>
          <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Free tier: {profile?.aiCallsToday || 0}/5 AI calls used today. Resets daily.
        </p>
      </CardContent>
    </Card>
  );
};
