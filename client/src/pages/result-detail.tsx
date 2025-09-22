import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/i18n";
import { Link } from "wouter";
import { 
  ArrowLeft,
  Clock,
  Calendar,
  Target,
  Award,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  BarChart3,
  AlertCircle
} from "lucide-react";

interface DetailedResult {
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
    timeLimit: number;
    totalQuestions: number;
  };
  session: {
    id: string;
    startTime: string;
    endTime: string;
    isCompleted: boolean;
  };
}

interface ResultDetailProps {
  id: string;
}

export default function ResultDetail({ id }: ResultDetailProps) {
  const { t } = useTranslation();

  const { data: result, isLoading, error } = useQuery<DetailedResult>({
    queryKey: [`/api/results/${id}`],
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

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 80) return <Award className="w-5 h-5 text-green-600" />;
    if (percentage >= 60) return <Target className="w-5 h-5 text-amber-600" />;
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="result-detail-loading">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
          <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
        </div>
        
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="space-y-6" data-testid="result-detail-error">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/results">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardContent className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Result Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The result you're looking for could not be found or you don't have permission to view it.
            </p>
            <Button asChild>
              <Link href="/results">Back to Results</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const skillNames = Object.keys(result.skillBreakdown || {});

  return (
    <div className="space-y-6" data-testid="result-detail-page">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/results">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{result.test.name}</h1>
          <p className="text-muted-foreground">Test Result Details</p>
        </div>
      </div>

      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              {getPerformanceIcon(result.percentage)}
              <span>{t('overallPerformance')}</span>
            </CardTitle>
            <Badge variant={getScoreBadgeVariant(result.percentage)} className="text-lg px-3 py-1">
              {result.percentage}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(result.percentage)}`}>
                {result.score}
              </div>
              <div className="text-sm text-muted-foreground">
                out of {result.totalScore} points
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {Math.round((result.score / result.totalScore) * result.test.totalQuestions)}
              </div>
              <div className="text-sm text-muted-foreground">
                correct answers out of {result.test.totalQuestions}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {formatDuration(result.timeSpent)}
              </div>
              <div className="text-sm text-muted-foreground">
                time spent (limit: {Math.floor(result.test.timeLimit / 60)}m)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Information */}
      <Card>
        <CardHeader>
          <CardTitle>Test Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Test Type</div>
                <div className="text-sm text-muted-foreground">{result.test.testType.toUpperCase()}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Completed At</div>
                <div className="text-sm text-muted-foreground">{formatDate(result.completedAt)}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Test Duration</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(result.session.startTime)} - {formatDate(result.session.endTime)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium">Status</div>
                <div className="text-sm text-muted-foreground">
                  {result.session.isCompleted ? 'Completed' : 'Incomplete'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill Breakdown */}
      {skillNames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skill Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {skillNames.map((skill) => {
                const skillData = result.skillBreakdown[skill];
                const skillPercentage = Math.round((skillData.correct / skillData.total) * 100);
                
                return (
                  <div key={skill}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground capitalize">
                        {t(skill) || skill}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {skillData.correct}/{skillData.total}
                        </span>
                        <span className={`text-sm font-medium ${getScoreColor(skillPercentage)}`}>
                          {skillPercentage}%
                        </span>
                      </div>
                    </div>
                    <Progress value={skillPercentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center justify-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex-1">
              <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Test already completed - retaking not allowed
              </span>
            </div>
            
            <Button variant="outline" asChild className="flex-1">
              <Link href="/results">
                View All Results
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="flex-1">
              <Link href="/practice">
                Practice More
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}