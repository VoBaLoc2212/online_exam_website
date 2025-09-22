import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/lib/i18n";
import { Link } from "wouter";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Award,
  Eye,
  Download,
  Filter
} from "lucide-react";

interface Result {
  id: string;
  score: number;
  totalScore: number;
  percentage: number;
  skillBreakdown: { [skill: string]: { correct: number; total: number } };
  timeSpent: number;
  completedAt: string;
  test: {
    id: string;
    name: string;
    testType: string;
  };
}

interface AnalyticsData {
  totalTests: number;
  averageScore: number;
  bestScore: number;
  timeSpent: number;
  skillProgress: { [skill: string]: number };
  recentTrend: number;
}

export default function Results() {
  const { t } = useTranslation();

  const { data: results, isLoading } = useQuery<Result[]>({
    queryKey: ['/api/results']
  });

  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics/stats']
  });

  const { data: skillProgress } = useQuery<{ [skill: string]: number }>({
    queryKey: ['/api/analytics/skills']
  });

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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const recentResults = results?.slice(0, 10) || [];
  const skillNames = ['reading', 'listening', 'grammar', 'vocabulary'];

  return (
    <div className="space-y-6" data-testid="results-page">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="detailed">{t('detailedResults')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="total-tests">
                      {results?.length || 0}
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
                    <p className="text-2xl font-bold text-foreground" data-testid="average-score">
                      {analytics?.averageScore || 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {(analytics?.recentTrend || 0) >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${(analytics?.recentTrend || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(analytics?.recentTrend || 0).toFixed(1)}%
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">{t('vsLastMonth')}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('bestScore')}</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="best-score">
                      {analytics?.bestScore || 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('timeSpent')}</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="time-spent">
                      {formatDuration(analytics?.timeSpent || 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills Progress */}
          <Card>
            <CardHeader>
              <CardTitle>{t('skillsProgress')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillNames.map((skill) => {
                  const progress = skillProgress?.[skill] || 0;
                  return (
                    <div key={skill}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {t(skill)}
                        </span>
                        <span className="text-sm text-muted-foreground" data-testid={`skill-${skill}-progress`}>
                          {progress}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('recentTests')}</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="#detailed">{t('viewAll')}</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 rounded-lg animate-pulse">
                      <div className="w-10 h-10 bg-muted rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                      </div>
                      <div className="w-16 h-6 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : recentResults.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No test results found</p>
                  <Link href="/practice">
                    <Button variant="outline" className="mt-2" size="sm">
                      Take your first test
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentResults.slice(0, 5).map((result, index) => (
                    <div key={result.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-accent/50 transition-colors" data-testid={`recent-result-${index}`}>
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{result.test.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.completedAt).toLocaleDateString()} • {formatDuration(result.timeSpent)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getScoreBadgeVariant(result.percentage)}>
                          {result.percentage}%
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/results/${result.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('allTestResults')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-lg animate-pulse">
                      <div className="w-12 h-12 bg-muted rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                      <div className="w-20 h-6 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : results?.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No results yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Take some tests to see your results here
                  </p>
                  <Link href="/practice">
                    <Button>Start practicing</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {(results || []).map((result) => (
                    <div key={result.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors" data-testid={`result-${result.id}`}>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground">{result.test.name}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(result.completedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDuration(result.timeSpent)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {result.test.testType.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(result.percentage)}`}>
                          {result.percentage}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {result.score}/{result.totalScore}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/results/${result.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('performanceTrend')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                    <p>{t('performanceChart')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('skillDistribution')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Target className="w-12 h-12 mx-auto mb-2" />
                    <p>Skill distribution chart would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
