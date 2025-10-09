import { SidebarTrigger } from '@/components/ui/sidebar';
import { Menu } from 'lucide-react';

export const MobileHeader = () => {
  return (
    <header className="lg:hidden sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <SidebarTrigger className="mr-4">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
        <div>
          <h2 className="text-lg font-bold text-foreground">PayGateway</h2>
          <p className="text-xs text-muted-foreground">Dashboard Pro</p>
        </div>
      </div>
    </header>
  );
};
