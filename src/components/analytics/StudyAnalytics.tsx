import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, TrendingUp, Clock, Target, Crown, Brain, Calendar } from 'lucide-react';
import { PremiumBanner } from '@/components/premium/PremiumBanner';

interface StudyStats {
  totalSessions: number;
  totalCardsStudied: number;
  totalCorrect: number;
  totalDuration: number;
  streak: number;
  lastStudyDate: Date | null;
}

export const StudyAnalytics = () => {
  const { user, isPremium } = useAuth();
  const [stats, setStats] = useState<StudyStats>({
    totalSessions: 0,
    totalCardsStudied: 0,
    totalCorrect: 0,
    totalDuration: 0,
    streak: 0,
    lastStudyDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1000);

        if (error) throw error;

        if (data && data.length > 0) {
          const totalSessions = data.length;
          const totalCardsStudied = data.reduce((acc, s) => acc + s.cards_studied, 0);
          const totalCorrect = data.reduce((acc, s) => acc + s.correct_answers, 0);
          const totalDuration = data.reduce((acc, s) => acc + s.duration_seconds, 0);

          // Calculate streak
          let streak = 0;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const sortedDates = data
            .map(s => new Date(s.created_at))
            .filter(d => !isNaN(d.getTime()))
            .sort((a, b) => b.getTime() - a.getTime());

          if (sortedDates.length > 0) {
            const lastDate = new Date(sortedDates[0]);
            lastDate.setHours(0, 0, 0, 0);

            const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff <= 1) {
              streak = 1;
              let currentDate = lastDate;

              for (let i = 1; i < sortedDates.length; i++) {
                const prevDate = new Date(sortedDates[i]);
                prevDate.setHours(0, 0, 0, 0);
                const diff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

                if (diff === 1) {
                  streak++;
                  currentDate = prevDate;
                } else if (diff > 1) {
                  break;
                }
              }
            }
          }

          setStats({
            totalSessions,
            totalCardsStudied,
            totalCorrect,
            totalDuration,
            streak,
            lastStudyDate: sortedDates[0] || null,
          });
        }
      } catch (error) {
        console.error('Error fetching study stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const accuracy = stats.totalCardsStudied > 0
    ? Math.round((stats.totalCorrect / stats.totalCardsStudied) * 100)
    : 0;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Study Analytics</h2>
          <Badge variant="outline" className="ml-2">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 blur-sm pointer-events-none">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-20 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="p-6 text-center max-w-sm">
              <Crown className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <p className="font-medium">Upgrade to Premium</p>
              <p className="text-sm text-muted-foreground">
                Unlock detailed study analytics and progress tracking
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Study Analytics</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <Brain className="w-4 h-4" />
              Cards Studied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalCardsStudied}</p>
            <p className="text-xs text-muted-foreground">
              {stats.totalSessions} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <Target className="w-4 h-4" />
              Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">
              {stats.totalCorrect} correct
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              Study Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatDuration(stats.totalDuration)}</p>
            <p className="text-xs text-muted-foreground">
              Total time spent
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              Study Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{stats.streak} 🔥</p>
            <p className="text-xs text-muted-foreground">
              days in a row
            </p>
          </CardContent>
        </Card>
      </div>

      {stats.lastStudyDate && (
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Last studied: {stats.lastStudyDate.toLocaleDateString()} at {stats.lastStudyDate.toLocaleTimeString()}
            </span>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
