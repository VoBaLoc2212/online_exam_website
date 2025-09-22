import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/i18n";
import { Link } from "wouter";
import { 
  Clock, 
  Calendar,
  Target,
  Award,
  Eye,
  BarChart3,
  Dumbbell,
  ClipboardCheck,
  TrendingUp
} from "lucide-react";

interface TestHistoryItem {
  id: string;
  type: 'practice' | 'mock-test';
  name: string;
  score: number;
  totalScore: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
  testType?: string;
  questionBankName?: string;
}

interface TestHistoryData {
  practiceResults: TestHistoryItem[];
  mockTestResults: TestHistoryItem[];
  totalCount: number;
  averageScore: number;
}

export default function TestHistory() {
  const { t } = useTranslation();

  const { data: testHistory, isLoading } = useQuery<TestHistoryData>({
    queryKey: ['/api/test-history'],
  });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  const renderTestItem = (item: TestHistoryItem) => (
    <Card key={item.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              {item.type === 'practice' ? (
                <Dumbbell className="w-5 h-5 text-primary" />
              ) : (
                <ClipboardCheck className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">{item.name}</h4>
              <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(item.completedAt)}
                </span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDuration(item.timeSpent)}
                </span>
                {item.testType && (
                  <Badge variant="outline" className="text-xs">
                    {item.testType.toUpperCase()}
                  </Badge>
                )}
                {item.questionBankName && (
                  <span className="text-xs text-muted-foreground">
                    {item.questionBankName}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className={`text-lg font-bold ${getScoreColor(item.percentage)}`}>
                {item.percentage}%
              </div>
              <div className="text-xs text-muted-foreground">
                {item.score}/{item.totalScore}
              </div>
            </div>
            
            <Button variant="ghost" size="sm" asChild>
              <Link href={item.type === 'practice' ? `/practice-results/${item.id}` : `/results/${item.id}`}>
                <Eye className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="test-history-loading">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-64 mt-2 animate-pulse"></div>
          </div>
        </div>
        
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center space-x-4 p-3 rounded-lg animate-pulse">
                    <div className="w-10 h-10 bg-muted rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                    <div className="w-16 h-6 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!testHistory) {
    return (
      <div className="space-y-6" data-testid="test-history-error">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Test History</h1>
            <p className="text-muted-foreground">Unable to load history data</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Data Loading Error</h3>
            <p className="text-muted-foreground mb-4">
              Unable to load test history. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="test-history-page">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('totalTestsCompleted')}</p>
                <p className="text-2xl font-bold text-foreground">
                  {testHistory.totalCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('averageScore')}</p>
                <p className="text-2xl font-bold text-foreground">
                  {testHistory.averageScore.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('practiceSessions')}</p>
                <p className="text-2xl font-bold text-foreground">
                  {testHistory.practiceResults.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test History Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">{t('all')}</TabsTrigger>
          <TabsTrigger value="practice">{t('practice')} ({testHistory.practiceResults.length})</TabsTrigger>
          <TabsTrigger value="mock-test">{t('mockTests')} ({testHistory.mockTestResults.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {testHistory.totalCount === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No test history yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start practicing or take mock tests to see your history here
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild>
                    <Link href="/practice">Start Practicing</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/mock-test">Take Mock Test</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {[...testHistory.practiceResults, ...testHistory.mockTestResults]
                .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                .map(renderTestItem)
              }
            </div>
          )}
        </TabsContent>

        <TabsContent value="practice" className="space-y-4">
          {testHistory.practiceResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Dumbbell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No practice sessions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start practicing skills to improve your abilities
                </p>
                <Button asChild>
                  <Link href="/practice">Start Practicing</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {testHistory.practiceResults
                .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                .map(renderTestItem)
              }
            </div>
          )}
        </TabsContent>

        <TabsContent value="mock-test" className="space-y-4">
          {testHistory.mockTestResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ClipboardCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No mock tests yet</h3>
                <p className="text-muted-foreground mb-4">
                  {t('takeMockTest')} {t('simulateRealExamConditions')}
                </p>
                <Button asChild>
                  <Link href="/mock-test">Take Mock Test</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {testHistory.mockTestResults
                .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                .map(renderTestItem)
              }
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}