import { Link, useLocation } from "wouter";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { AntiCheatStats } from "@/hooks/use-anti-cheat";
import { 
  Home, 
  Dumbbell, 
  ClipboardCheck, 
  BarChart3, 
  Database, 
  Settings,
  GraduationCap,
  X,
  Shield,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    id: string;
    username: string;
    email: string;
    fullName: string;
  };
  antiCheatStats?: AntiCheatStats;
  isTestMode?: boolean;
}

const navigationItems = [
  { href: "/", icon: Home, key: "dashboard" },
  { href: "/practice", icon: Dumbbell, key: "practice" },
  { href: "/mock-test", icon: ClipboardCheck, key: "mockTests" },
  { href: "/results", icon: BarChart3, key: "results" },
  { href: "/question-bank", icon: Database, key: "questionBank" },
  { href: "/test-management", icon: Settings, key: "testManagement" },
];

export function Sidebar({ isOpen, onClose, user, antiCheatStats, isTestMode }: SidebarProps) {
  const [location] = useLocation();
  const { t } = useTranslation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
          onClick={onClose}
          data-testid="sidebar-backdrop"
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-card border-r border-border transition-transform duration-300 md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        data-testid="sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">EduTest Pro</h1>
                <p className="text-xs text-muted-foreground">Language Testing Platform</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="md:hidden"
              data-testid="sidebar-close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                    data-testid={`nav-${item.key}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{t(item.key)}</span>
                  </a>
                </Link>
              );
            })}
          </nav>

          {/* Security Monitor (when in test mode) */}
          {isTestMode && antiCheatStats && (
            <div className="px-4 pb-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="w-4 h-4 text-destructive animate-pulse" />
                  <span className="text-destructive font-medium">{t('monitoringActive')}</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{t('tabSwitches')}</span>
                    <span className="font-medium" data-testid="tab-switch-count">
                      {antiCheatStats.tabSwitchCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('warnings')}</span>
                    <span className="font-medium" data-testid="warning-count">
                      {antiCheatStats.warningCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Profile */}
          {user && (
            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="" alt={user.fullName} />
                  <AvatarFallback>
                    {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate" data-testid="user-name">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate" data-testid="user-email">
                    {user.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={async () => {
                    try {
                      await fetch('/api/logout', { 
                        method: 'POST',
                        credentials: 'include'
                      });
                      window.location.reload();
                    } catch (error) {
                      console.error('Logout failed:', error);
                    }
                  }}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
