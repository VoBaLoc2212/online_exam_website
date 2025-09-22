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
import PracticeSession from "@/pages/practice-session";
import PracticeResult from "@/pages/practice-result";
import MockTest from "@/pages/mock-test";
import Results from "@/pages/results";
import ResultDetail from "@/pages/result-detail";
import TestHistory from "@/pages/test-history";
import QuestionBank from "@/pages/question-bank";
import TestManagement from "@/pages/test-management";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";
import QuestionsPage from "./pages/questions";

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

  // Show login page if user is not authenticated
  if (user === null) {
    return (
      <Switch>
        <Route path="/register" component={Register} />
        <Route component={Login} />
      </Switch>
    );
  }
  
  const pageRoutes = [
    { path: "/", title: t('dashboard'), subtitle: t('welcomeBack') },
    { path: "/practice", title: t('practice'), subtitle: t('practiceSubtitle') },
    { path: "/practice/:id/session", title: "Practice Session", subtitle: "Complete your practice session" },
    { path: "/practice/result/:id", title: "Practice Result", subtitle: "View your practice results and detailed analysis" },
    { path: "/mock-test", title: t('mockTests'), subtitle: t('mockTestSubtitle') },
    { path: "/mock-test/:id", title: "Mock Test", subtitle: "Take a full mock test to simulate real exam conditions" },
    { path: "/results", title: t('results'), subtitle: t('resultsSubtitle') },
    { path: "/results/:id", title: "Test Result", subtitle: "View detailed results and analysis" },
    { path: "/test-history", title: t('testHistory'), subtitle: t('testHistorySubtitle') },
    { path: "/question-bank", title: t('questionBank'), subtitle: t('questionBankSubtitle') },
    { path: "/test-management", title: t('testManagement'), subtitle: t('testManagementSubtitle') },
    { path: "/question-bank/:questionbankId/questions", title: t("Questions"), subtitle: "View and manage questions in this question bank" },
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
          {/* Full-screen practice session without sidebar/topbar */}
          <Route path="/practice/:id/session" component={PracticeSession} />
          
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
                      <Route path="/practice/result/:id" component={PracticeResult} />
                      <Route path="/mock-test" component={MockTest} />
                      <Route path="/mock-test/:id" component={MockTest} />
                      <Route path="/results" component={Results} />
                      <Route path="/results/:id">
                        {(params) => <ResultDetail id={params.id} />}
                      </Route>
                      <Route path="/test-history" component={TestHistory} />
                      <Route path="/question-bank" component={QuestionBank} />
                      <Route path="/test-management" component={TestManagement} />
                      <Route path="/question-bank/:questionbankId/questions" component={QuestionsPage}/>
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
