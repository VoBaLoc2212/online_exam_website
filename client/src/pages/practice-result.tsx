import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/lib/i18n";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  TrendingUp, 
  Home,
  RotateCcw,
  ArrowRight
} from "lucide-react";

interface PracticeResult {
  id: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  answers: Record<string, string>;
  completedAt: string;
  questionBank: {
    id: string;
    name: string;
    testType: string;
    skillType: string;
  };
}

interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  orderIndex: number;
}

export default function PracticeResult() {
  const { id: resultId } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  // Fetch practice result
  const { data: result, isLoading: resultLoading } = useQuery<PracticeResult>({
    queryKey: ["practiceResult", resultId],
    queryFn: async () => {
      const response = await fetch(`/api/practice-results/${resultId}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch practice result");
      return response.json();
    },
    enabled: !!resultId,
  });

  // Fetch questions for detailed review
  const { data: questions, isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ["questions", result?.questionBank.id],
    queryFn: async () => {
      const response = await fetch(`/api/question-banks/${result?.questionBank.id}/questions`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch questions");
      return response.json();
    },
    enabled: !!result?.questionBank.id && showDetailedResults,
  });

  if (resultLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('error')}</h3>
          <p className="text-muted-foreground mb-4">{t('practiceResultNotFound')}</p>
          <Button onClick={() => setLocation('/practice')}>
            {t('practiceMode')}
          </Button>
        </div>
      </div>
    );
  }

  const scorePercentage = (result.score / 10) * 100;
  const accuracyPercentage = (result.correctAnswers / result.totalQuestions) * 100;
  const timeInMinutes = Math.floor(result.timeSpent / 60);
  const timeInSeconds = result.timeSpent % 60;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{t('results')}</h1>
              <p className="text-muted-foreground">{result.questionBank.name}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/practice')}
                className="flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>{t('practiceMode')}</span>
              </Button>
              <Button 
                onClick={() => setLocation(`/practice/${result.questionBank.id}/session`)}
                className="flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('practiceAgain')}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('score')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <span className={`text-2xl font-bold ${getScoreColor(scorePercentage)}`}>
                  {result.score}/10
                </span>
                <Badge variant={getScoreBadgeVariant(scorePercentage)}>
                  {scorePercentage.toFixed(0)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('accuracy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{accuracyPercentage.toFixed(0)}%</span>
                  <span className="text-sm text-muted-foreground">
                    {result.correctAnswers}/{result.totalQuestions}
                  </span>
                </div>
                <Progress value={accuracyPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('timeSpent')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {timeInMinutes}:{timeInSeconds.toString().padStart(2, '0')}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('skillCategory')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-muted-foreground" />
                <span className="text-lg font-medium capitalize">
                  {t(result.questionBank.skillType)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>{t('overallPerformance')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">{t('performanceSummary')}</h4>
                <p className="text-muted-foreground">
                  {scorePercentage >= 80 
                    ? t('excellentWork')
                    : scorePercentage >= 60
                    ? t('goodEffort')
                    : t('keepPracticing')
                  }
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">{t('recommendation')}</h4>
                <p className="text-muted-foreground">
                  {accuracyPercentage < 60 
                    ? t('focusOnFundamentals', { skill: t(result.questionBank.skillType) })
                    : t('continuePracticing', { skill: t(result.questionBank.skillType) })
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle>{t('detailedResults')}</CardTitle>
          </CardHeader>
          <CardContent>
            {!showDetailedResults ? (
              <div className="text-center py-8">
                <Button 
                  onClick={() => setShowDetailedResults(true)}
                  className="flex items-center space-x-2"
                >
                  <span>{t('viewQuestionAnalysis')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div>
                {questionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">{t('loadingDetailedResults')}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {questions?.map((question, index) => {
                      const userAnswer = result.answers[question.id];
                      const isCorrect = userAnswer === question.correctAnswer;
                      
                      return (
                        <div key={question.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium">
                              Question {index + 1}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {isCorrect ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                              <Badge variant={question.difficulty === 'easy' ? 'secondary' : question.difficulty === 'medium' ? 'default' : 'destructive'}>
                                {t(question.difficulty)}
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="mb-4 text-sm">{question.content}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                            {question.options.map((option, optionIndex) => {
                              const optionLetter = String.fromCharCode(65 + optionIndex);
                              const isUserAnswer = userAnswer === optionLetter;
                              const isCorrectAnswer = question.correctAnswer === optionLetter;
                              
                              return (
                                <div 
                                  key={optionIndex}
                                  className={`p-2 rounded text-sm border ${
                                    isCorrectAnswer 
                                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                      : isUserAnswer && !isCorrect
                                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                      : 'border-gray-200 dark:border-gray-700'
                                  }`}
                                >
                                  <span className="font-medium">{optionLetter}.</span> {option}
                                  {isUserAnswer && (
                                    <span className="ml-2 text-xs">
                                      ({t('yourAnswer')})
                                    </span>
                                  )}
                                  {isCorrectAnswer && (
                                    <span className="ml-2 text-xs text-green-600">
                                      ({t('correct')})
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          
                          {question.explanation && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                              <h5 className="font-medium text-sm mb-1">{t('explanation')}</h5>
                              <p className="text-sm text-muted-foreground">{question.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}