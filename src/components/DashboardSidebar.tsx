import { LayoutDashboard, RefreshCw, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function DashboardSidebar() {
  const { logout } = useAuth();

  const menuItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <Sidebar className="border-r border-sidebar-border" collapsible="icon">
      <SidebarContent>
        <div className="px-6 py-6 border-b border-sidebar-border">
          <h2 className="text-xl font-bold text-sidebar-foreground bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            PayGateway
          </h2>
          <p className="text-xs text-sidebar-foreground/60">Dashboard Pro</p>
        </div>

        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-sidebar-foreground/70">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm'
                          : 'hover:bg-sidebar-accent/50 transition-colors'
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
