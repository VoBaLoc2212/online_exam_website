import { Switch, Route } from "wouter";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useTranslation } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";

// Pages
import Dashboard from "@/pages/dashboard";
import Practice from "@/pages/practice";
import MockTest from "@/pages/mock-test";
import Results from "@/pages/results";
import QuestionBank from "@/pages/question-bank";
import TestManagement from "@/pages/test-management";
import NotFound from "@/pages/not-found";

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation();

  const { data: user } = useQuery({
    queryKey: ['/api/me'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/me', { credentials: 'include' });
        if (!response.ok) {
          if (response.status === 401) {
            return null;
          }
          throw new Error('Failed to fetch user');
        }
        const data = await response.json();
        return data.user;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: Infinity,
  });

  // For now, we'll show the main app regardless of auth status
  // In production, you'd want to implement proper auth flows
  
  const pageRoutes = [
    { path: "/", title: t('dashboard'), subtitle: t('welcomeBack') },
    { path: "/practice", title: "Practice", subtitle: "Practice individual skills to improve your performance" },
    { path: "/mock-test", title: t('mockTests'), subtitle: "Take full mock tests to simulate real exam conditions" },
    { path: "/results", title: t('results'), subtitle: "Track your progress and analyze your performance" },
    { path: "/question-bank", title: t('questionBank'), subtitle: "Manage your question collections and import new content" },
    { path: "/test-management", title: t('testManagement'), subtitle: "Create and manage your test configurations" },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        user={user}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          {pageRoutes.map(route => (
            <Route key={route.path} path={route.path}>
              {() => (
                <>
                  <Topbar 
                    onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
                    title={route.title}
                    subtitle={route.subtitle}
                  />
                  <main className="flex-1 overflow-y-auto p-6">
                    <Switch>
                      <Route path="/" component={Dashboard} />
                      <Route path="/practice" component={Practice} />
                      <Route path="/mock-test" component={MockTest} />
                      <Route path="/results" component={Results} />
                      <Route path="/question-bank" component={QuestionBank} />
                      <Route path="/test-management" component={TestManagement} />
                    </Switch>
                  </main>
                </>
              )}
            </Route>
          ))}
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="edutest-theme">
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
