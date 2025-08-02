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
  HelpCircle,
  LogOut
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
  const pathname = usePathname() || '/';
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true);

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
    <div className="flex h-screen bg-gray-100">
      
      <aside className="flex-shrink-0">
        <div
          className={`
            bg-black flex flex-col h-screen
            transition-all duration-300 ease-in-out
            ${isCollapsed ? 'w-[50px]' : 'w-[260px]'}
          `}
        >
          {/* Logo and Toggle */}
          <div className="h-[50px] flex items-center px-2">
            {!isCollapsed && (
              <div className="flex items-center gap-3 px-2">
                <span className="text-white/90 font-semibold text-lg">FormEz</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-white/70 hover:text-white hover:bg-white/10 transition-colors ml-auto"
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center h-[50px] text-sm
                    transition-colors group relative
                    ${isCollapsed ? 'justify-center px-2' : 'px-4 gap-3'}
                    ${isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <span className="flex-shrink-0 w-6 flex justify-center">{item.icon}</span>
                  {!isCollapsed && <span>{item.label}</span>}
                  {isCollapsed && !isActive && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white/90 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="py-2">
            {/* Help Button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={`
                    w-full h-[50px] text-white/70 hover:bg-white/10 hover:text-white transition-colors
                    ${isCollapsed ? 'px-2 justify-center' : 'px-4 justify-start gap-3'}
                  `}
                >
                  <HelpCircle className="h-5 w-5" />
                  {!isCollapsed && <span>Help & Support</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 bg-gray-800 border-0 text-white/90 shadow-xl ml-2" align="start" side="right">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Quick Help</h3>
                    <div className="space-y-2 text-sm text-white/70">
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-white/90">My Forms:</span>
                        <span>View and manage all your forms</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-white/90">Responses:</span>
                        <span>Analyze submissions across forms</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-white/90">Settings:</span>
                        <span>Configure your account preferences</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <p className="text-xs text-white/50 mb-2">Need more help?</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs border-white/20 text-white/90 hover:bg-white/10">
                        Documentation
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs border-white/20 text-white/90 hover:bg-white/10">
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Sign Out Button */}
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className={`
                w-full h-[50px] text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-colors
                ${isCollapsed ? 'px-2 justify-center' : 'px-4 justify-start gap-3'}
              `}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span>Sign Out</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Modern floating design */}
        {!(pathname.includes('/form/') && pathname.includes('/edit')) && (
          <header className="p-3.5">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-lg flex items-center justify-between px-5 py-3">
              {/* Page Title Section */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-black tracking-tight">
                    {pathname === '/dashboard' && 'Dashboard'}
                    {pathname === '/responses' && 'Responses'}
                    {pathname === '/settings' && 'Settings'}
                    {pathname === '/' && 'Create Form'}
                    {pathname.includes('/form/') && pathname.includes('/edit') && 'Edit Form'}
                    {pathname.includes('/form/') && pathname.includes('/submissions') && 'Form Analytics'}
                  </h1>
                  {pathname === '/dashboard' && (
                    <span className="text-sm text-gray-500 font-medium">Manage your forms</span>
                  )}
                  {pathname === '/responses' && (
                    <span className="text-sm text-gray-500 font-medium">View submissions</span>
                  )}
                  {pathname === '/settings' && (
                    <span className="text-sm text-gray-500 font-medium">Configure preferences</span>
                  )}
                </div>
              </div>
              
              {/* User Profile Section - Enhanced design */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-gray-50/60 rounded-full px-3.5 py-1.5 border border-gray-200/30">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-black">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.email}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold ring-2 ring-white shadow-sm">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </header>
        )}
        
        {/* Page Content */}
        <div className={`flex-1 overflow-auto ${pathname.includes('/form/') && pathname.includes('/edit') ? '' : 'px-3.5 pb-3.5'}`}>
          {children}
        </div>
      </main>
    </div>
  );
} 