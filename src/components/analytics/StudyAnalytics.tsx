import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export const StudyAnalytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Study Analytics</h2>
      </div>

      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>Analytics are being updated. Check back soon!</p>
        </CardContent>
      </Card>
    </div>
  );
};
