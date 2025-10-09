import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
}

export const StatCard = ({ title, value, icon: Icon }: StatCardProps) => {
  return (
    <Card className="p-6 md:p-8 hover:shadow-xl transition-all duration-300 border-2 border-primary/10 bg-gradient-to-br from-card via-card to-primary/5 hover:scale-[1.03] hover:border-primary/30 group animate-scale-in">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent break-words">{value}</p>
        </div>
        <div className="p-3 md:p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all shadow-lg">
          <Icon className="h-6 w-6 md:h-7 md:w-7 text-primary" />
        </div>
      </div>
    </Card>
  );
};
