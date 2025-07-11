'use client';

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  LayoutDashboard, 
  FilePlus2, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  BarChart3,
  Copy,
  Settings,
  HelpCircle
} from "lucide-react";

const navigationItems = [
  {
    label: "My Forms",
    href: "/dashboard",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "Responses",
    href: "/responses",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  // For unauthenticated users, just render the children (which will be the LandingPage)
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside 
        className={`
          bg-sidebar border-r border-sidebar-border flex flex-col
          transition-all duration-200 ease-in-out
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Logo and Toggle */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
          {!sidebarCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold text-sidebar-foreground">FormEz</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                  transition-colors duration-150
                  ${isActive 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }
                `}
              >
                <span className="flex-shrink-0 w-6">{item.icon}</span>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-2 border-t border-sidebar-border">
          <div className={`
            flex items-center gap-3 px-3 py-2 rounded-md
            ${sidebarCollapsed ? 'justify-center' : ''}
          `}>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
              {(user.displayName || user.email || 'U')[0].toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.displayName || user.email}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="h-auto p-0 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  Sign out
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {pathname === '/dashboard' && <><FileText className="h-4 w-4" /> My Forms</>}
            {pathname === '/responses' && <><BarChart3 className="h-4 w-4" /> Responses</>}
            {pathname === '/settings' && <><Settings className="h-4 w-4" /> Settings</>}
            {pathname === '/' && <><FilePlus2 className="h-4 w-4" /> Create Form</>}
            {pathname.includes('/form/') && pathname.includes('/edit') && '✏️ Edit Form'}
            {pathname.includes('/form/') && pathname.includes('/submissions') && '📊 Form Submissions'}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Help Button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  title="Help & Support"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Quick Help</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-foreground">My Forms:</span>
                        <span>View and manage all your forms</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-foreground">Responses:</span>
                        <span>Analyze submissions across forms</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-foreground">Settings:</span>
                        <span>Configure your account preferences</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs text-muted-foreground mb-2">Need more help?</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        Documentation
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
} 