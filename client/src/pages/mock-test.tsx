import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestInterface } from "@/components/test/test-interface";
import { useTranslation } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation, useRoute } from "wouter";
import { 
  Play, 
  Clock, 
  Target,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  FileText,
  Users
} from "lucide-react";

interface Test {
  id: string;
  name: string;
  description: string;
  testType: 'aptis' | 'vstep' | 'custom';
  timeLimit: number;
  totalQuestions: number;
  isActive: boolean;
  createdAt: string;
}

interface TestSession {
  id: string;
  testId: string;
  timeRemaining: number;
  currentQuestionIndex: number;
  answers: { [questionId: string]: string };
  markedQuestions: string[];
  isCompleted: boolean;
}

interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface CompletionStatus {
  hasCompleted: boolean;
}

export default function MockTest() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  const [match, params] = useRoute("/mock-test/:id");
  const [selectedTestType, setSelectedTestType] = useState<string>('all');
  const [activeSession, setActiveSession] = useState<TestSession | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);

  const testId = params?.id;
  const { data: tests, isLoading } = useQuery<Test[]>({
    queryKey: ['/api/tests/all']
  });

  // Get completion status for all tests
  const { data: allCompletionStatus } = useQuery<Record<string, boolean>>({
    queryKey: ['/api/tests/completion-status'],
    enabled: !!tests && tests.length > 0,
  });

  // Check if user has completed this test (for individual test access)
  const { data: completionStatus, isLoading: isCheckingCompletion } = useQuery<CompletionStatus>({
    queryKey: [`/api/tests/${testId}/completed`],
    enabled: !!testId,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (testId: string) => {
      // Get the test to calculate timeRemaining
      const test = tests?.find(t => t.id === testId);
      if (!test) {
        throw new Error('Test not found');
      }
      
      const sessionData = {
        testId,
        timeRemaining: test.timeLimit * 60, // Convert minutes to seconds
        currentQuestionIndex: 0,
        answers: {},
        markedQuestions: []
      };
      
      const response = await apiRequest('POST', '/api/test-sessions', sessionData);
      return response.json();
    },
    onSuccess: (session) => {
      setActiveSession(session);
      toast({ title: t('testStartedSuccessfully') });
    },
    onError: () => {
      toast({ 
        title: "Failed to start test", 
        variant: "destructive" 
      });
    }
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, updates }: { sessionId: string; updates: any }) => {
      const response = await apiRequest('PATCH', `/api/test-sessions/${sessionId}`, updates);
      return response.json();
    },
    onSuccess: (session) => {
      setActiveSession(session);
    }
  });

  const completeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest('POST', `/api/test-sessions/${sessionId}/complete`);
      return response.json();
    },
    onSuccess: ({ result }) => {
      toast({ title: t('testCompletedSuccessfully') });
      navigate(`/results/${result.id}`);
    },
    onError: () => {
      toast({ 
        title: "Failed to complete test", 
        variant: "destructive" 
      });
    }
  });

  const { data: testWithQuestions } = useQuery<{ questions: Question[]; name?: string }>({
    queryKey: ['/api/tests', activeSession?.testId],
    enabled: !!activeSession?.testId
  });

  // Update session questions when test data changes
  React.useEffect(() => {
    if (testWithQuestions?.questions) {
      setSessionQuestions(testWithQuestions.questions);
    }
  }, [testWithQuestions]);

  const handleStartTest = async (testId: string) => {
    // Check if user has completed this test before starting
    try {
      const response = await fetch(`/api/tests/${testId}/completed`, {
        credentials: 'include'
      });
      const completionData = await response.json();
      
      if (completionData.hasCompleted) {
        toast({ 
          title: t('testAlreadyCompleted'), 
          description: t('testCompletedMessage'),
          variant: "destructive" 
        });
        return;
      }
      
      // If not completed, proceed to start the test
      createSessionMutation.mutate(testId);
    } catch (error) {
      toast({ 
        title: "Check Error", 
        description: "Unable to check test completion status.",
        variant: "destructive" 
      });
    }
  };

  // Auto-start test if test ID is provided in URL
  React.useEffect(() => {
    if (testId && !activeSession && tests && completionStatus !== undefined) {
      const test = tests.find(t => t.id === testId);
      
      if (completionStatus?.hasCompleted) {
        toast({ 
          title: t('testAlreadyCompleted'), 
          description: t('testCompletedMessage'),
          variant: "destructive" 
        });
        navigate('/results');
        return;
      }
      
      if (test && test.isActive) {
        handleStartTest(testId);
      } else if (test && !test.isActive) {
        toast({ 
          title: "Test not available", 
          description: "This test is currently inactive",
          variant: "destructive" 
        });
        navigate('/mock-test');
      } else if (tests.length > 0) {
        toast({ 
          title: "Test not found", 
          description: "The requested test could not be found",
          variant: "destructive" 
        });
        navigate('/mock-test');
      }
    }
  }, [testId, tests, activeSession, completionStatus]);

  const filteredTests = tests?.filter(test => {
    const typeMatch = selectedTestType === 'all' || test.testType === selectedTestType;
    return typeMatch && test.isActive;
  }) || [];

  const handleAnswerChange = (questionId: string, answer: string) => {
    if (!activeSession) return;
    
    const updates = {
      answers: { ...activeSession.answers, [questionId]: answer }
    };
    
    updateSessionMutation.mutate({
      sessionId: activeSession.id,
      updates
    });
  };

  const handleQuestionNavigate = (index: number) => {
    if (!activeSession) return;
    
    updateSessionMutation.mutate({
      sessionId: activeSession.id,
      updates: { currentQuestionIndex: index }
    });
  };

  const handleMarkQuestion = (questionId: string) => {
    if (!activeSession) return;
    
    const markedQuestions = activeSession.markedQuestions.includes(questionId)
      ? activeSession.markedQuestions.filter(id => id !== questionId)
      : [...activeSession.markedQuestions, questionId];
    
    updateSessionMutation.mutate({
      sessionId: activeSession.id,
      updates: { markedQuestions }
    });
  };

  const handleSubmitTest = () => {
    if (!activeSession) return;
    completeSessionMutation.mutate(activeSession.id);
  };

  const getTestTypeColor = (type: string) => {
    switch (type) {
      case 'aptis':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'vstep':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Handle test termination due to anti-cheat violation
  const handleTestTermination = async (reason: string) => {
    try {
      // Call API to terminate test with 0 score
      const terminationData = {
        sessionId: activeSession?.id,
        reason: reason
      };
      
      await apiRequest('POST', '/api/test-sessions/terminate', terminationData);
      
      toast({
        title: t('testTerminated'),
        description: t('testTerminatedDueToViolation'),
        variant: "destructive"
      });
      
      // Clear active session to return to test list
      setActiveSession(null);
      queryClient.invalidateQueries({ queryKey: ['activeSession'] });
    } catch (error) {
      console.error('Error terminating test:', error);
    }
  };

  // If there's an active session, show the test interface
  if (activeSession && sessionQuestions.length > 0) {
    return (
      <TestInterface
        session={activeSession}
        questions={sessionQuestions}
        testName={(testWithQuestions as any)?.name || 'Mock Test'}
        isFullMockTest={true}
        onAnswerChange={handleAnswerChange}
        onQuestionNavigate={handleQuestionNavigate}
        onMarkQuestion={handleMarkQuestion}
        onSubmitTest={handleSubmitTest}
        onTestTerminated={handleTestTermination}
      />
    );
  }

  return (
    <div className="space-y-6" data-testid="mock-test-page">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('testType')}
              </label>
              <Select value={selectedTestType} onValueChange={setSelectedTestType}>
                <SelectTrigger data-testid="filter-test-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTypes')}</SelectItem>
                  <SelectItem value="aptis">{t('aptisEsol')}</SelectItem>
                  <SelectItem value="vstep">{t('vstep')}</SelectItem>
                  <SelectItem value="custom">{t('custom')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Link href="/test-management">
                <Button variant="outline">
                  <Target className="w-4 h-4 mr-2" />
                  {t('manageTests')}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredTests.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No mock tests available
            </h3>
            <p className="text-muted-foreground mb-4">
              Create tests to start practicing in mock exam conditions
            </p>
            <Link href="/test-management">
              <Button>
                <Target className="w-4 h-4 mr-2" />
                Create Test
              </Button>
            </Link>
          </div>
        ) : (
          filteredTests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow" data-testid={`test-${test.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className={getTestTypeColor(test.testType)}>
                          {test.testType.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {test.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {test.description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                        {t('questionsCount').charAt(0).toUpperCase() + t('questionsCount').slice(1)}
                    </span>
                    <span className="font-medium">{test.totalQuestions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {t('timeLimit')}
                    </span>
                    <span className="font-medium">{test.timeLimit} min</span>
                  </div>
                </div>

                {allCompletionStatus?.[test.id] ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        {t('alreadycompletedTest')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" asChild>
                        <Link href="/results">
                          {t('viewResults')}
                        </Link>
                      </Button>
                      <Button variant="outline" className="flex-1" asChild>
                        <Link href="/practice">
                          {t('practiceMore')}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => handleStartTest(test.id)}
                    disabled={createSessionMutation.isPending}
                    data-testid={`start-test-${test.id}`}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {createSessionMutation.isPending ? t('loading') : t('startMockTest')}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Test Instructions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Test Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-amber-600" />
                Before You Start
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ensure you have a stable internet connection</li>
                <li>• Find a quiet environment with minimal distractions</li>
                <li>• {t('closeUnnecessaryTabs')}</li>
                <li>• Have your headphones ready for listening sections</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2 flex items-center">
                <Users className="w-4 h-4 mr-2 text-blue-600" />
                During the Test
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your session will be monitored for security</li>
                <li>• Avoid switching tabs or windows</li>
                <li>• {t('markForReviewDifficult')}</li>
                <li>• Keep track of your time remaining</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
