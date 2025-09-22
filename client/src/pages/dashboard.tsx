import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import { Link } from "wouter";
import { 
  Dumbbell, 
  GraduationCap, 
  Upload, 
  BarChart3,
  Play,
  TrendingUp,
  Calendar,
  Target,
  Lightbulb
} from "lucide-react";

interface UserStats {
  totalPractice: number;
  mockTests: number;
  averageScore: number;
  studyStreak: number;
}

interface SkillProgress {
  [skill: string]: number;
}

interface RecentTest {
  id: string;
  name: string;
  score: number;
  completedAt: string;
  type: string;
}

export default function Dashboard() {
  const { t } = useTranslation();
  
  const { data: stats } = useQuery<UserStats>({
    queryKey: ['/api/analytics/stats']
  });
  
  const { data: skillProgress } = useQuery<SkillProgress>({
    queryKey: ['/api/analytics/skills']
  });
  
  const { data: recentTests } = useQuery<RecentTest[]>({
    queryKey: ['/api/results']
  });

  const quickActions = [
    {
      title: t('startAptis'),
      subtitle: t('grammarVocabSkills'),
      icon: Play,
      href: '/practice?type=aptis',
      color: 'text-primary'
    },
    {
      title: t('vstepMockTest'),
      subtitle: t('fullSkillsAssessment'),
      icon: GraduationCap,
      href: '/mock-test?type=vstep',
      color: 'text-green-600'
    },
    {
      title: t('importQuestions'),
      subtitle: t('wordExcelFormats'),
      icon: Upload,
      href: '/question-bank?action=import',
      color: 'text-amber-600'
    },
    {
      title: t('viewProgress'),
      subtitle: t('detailedAnalytics'),
      icon: BarChart3,
      href: '/results',
      color: 'text-purple-600'
    }
  ];

  const skillNames = ['reading', 'listening', 'grammar', 'vocabulary'];

  return (
    <div className="space-y-6" data-testid="dashboard-content">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('totalPractice')}
                </p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-total-practice">
                  {stats?.totalPractice || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">+12%</span>
              <span className="text-sm text-muted-foreground ml-2">{t('vsLastWeek')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('mockTests')}
                </p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-mock-tests">
                  {stats?.mockTests || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-600 font-medium">+3</span>
              <span className="text-sm text-muted-foreground ml-2">{t('completed')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('averageScore')}
                </p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-average-score">
                  {stats?.averageScore || 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">+5.2%</span>
              <span className="text-sm text-muted-foreground ml-2">{t('improvement')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('studyStreak')}
                </p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-study-streak">
                  {stats?.studyStreak || 0} <span className="text-base">{t('days')}</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">{t('keepItUp')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('quickActions')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} href={action.href}>
                  <a className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all group">
                    <Icon className={`w-8 h-8 ${action.color} mb-3 group-hover:scale-110 transition-transform`} />
                    <span className="font-medium text-foreground text-center mb-1" data-testid={`quick-action-${index}`}>
                      {action.title}
                    </span>
                    <span className="text-sm text-muted-foreground text-center">
                      {action.subtitle}
                    </span>
                  </a>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tests */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{t('recentTests')}</h3>
              <Link href="/results">
                <Button variant="ghost" size="sm">
                  {t('viewAllArrow')}
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentTests?.slice(0, 3).map((test, index) => (
                <div key={test.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-accent/50 transition-colors" data-testid={`recent-test-${index}`}>
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {test.type === 'reading' && <Dumbbell className="w-5 h-5 text-primary" />}
                    {test.type === 'listening' && <GraduationCap className="w-5 h-5 text-green-600" />}
                    {test.type === 'grammar' && <Target className="w-5 h-5 text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{test.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(test.completedAt).toLocaleDateString()} {test.score}% {t('score').toLowerCase()}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    Completed
                  </Badge>
                </div>
              )) || (
                <div className="text-center text-muted-foreground py-8">
                  <p>No recent tests found</p>
                  <Link href="/practice">
                    <Button variant="outline" className="mt-2" size="sm">
                      {t('startPracticingNow')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills Progress */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('skillsProgress')}</h3>
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
            
            <div className="mt-6 p-4 bg-accent/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-1" />
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">{t('recommendation')}</h4>
                  <p className="text-xs text-muted-foreground">
                    {t('focusVocabularyPractice')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
