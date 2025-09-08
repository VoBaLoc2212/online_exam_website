import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestInterface } from "@/components/test/test-interface";
import { useTranslation } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
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

export default function MockTest() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  const [selectedTestType, setSelectedTestType] = useState<string>('all');
  const [activeSession, setActiveSession] = useState<TestSession | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);

  const { data: tests, isLoading } = useQuery<Test[]>({
    queryKey: ['/api/tests']
  });

  const createSessionMutation = useMutation({
    mutationFn: async (testId: string) => {
      const response = await apiRequest('POST', '/api/test-sessions', { testId });
      return response.json();
    },
    onSuccess: (session) => {
      setActiveSession(session);
      toast({ title: "Test started successfully" });
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
      toast({ title: "Test completed successfully" });
      navigate(`/results/${result.id}`);
    },
    onError: () => {
      toast({ 
        title: "Failed to complete test", 
        variant: "destructive" 
      });
    }
  });

  const { data: testWithQuestions } = useQuery({
    queryKey: ['/api/tests', activeSession?.testId],
    enabled: !!activeSession?.testId,
    onSuccess: (data) => {
      if (data?.questions) {
        setSessionQuestions(data.questions);
      }
    }
  });

  const filteredTests = tests?.filter(test => {
    const typeMatch = selectedTestType === 'all' || test.testType === selectedTestType;
    return typeMatch && test.isActive;
  }) || [];

  const handleStartTest = async (testId: string) => {
    createSessionMutation.mutate(testId);
  };

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

  // If there's an active session, show the test interface
  if (activeSession && sessionQuestions.length > 0) {
    return (
      <TestInterface
        session={activeSession}
        questions={sessionQuestions}
        testName={testWithQuestions?.name || 'Mock Test'}
        onAnswerChange={handleAnswerChange}
        onQuestionNavigate={handleQuestionNavigate}
        onMarkQuestion={handleMarkQuestion}
        onSubmitTest={handleSubmitTest}
      />
    );
  }

  return (
    <div className="space-y-6" data-testid="mock-test-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('mockTests')}</h1>
        <p className="text-muted-foreground">
          Take full mock tests to simulate real exam conditions
        </p>
      </div>

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
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="aptis">APTIS ESOL</SelectItem>
                  <SelectItem value="vstep">VSTEP</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Link href="/test-management">
                <Button variant="outline">
                  <Target className="w-4 h-4 mr-2" />
                  Manage Tests
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
                      Questions
                    </span>
                    <span className="font-medium">{test.totalQuestions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Time Limit
                    </span>
                    <span className="font-medium">{test.timeLimit} min</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => handleStartTest(test.id)}
                  disabled={createSessionMutation.isPending}
                  data-testid={`start-test-${test.id}`}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {createSessionMutation.isPending ? t('loading') : 'Start Mock Test'}
                </Button>
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
                <li>• Close unnecessary browser tabs and applications</li>
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
                <li>• Use the mark for review feature for difficult questions</li>
                <li>• Keep track of your time remaining</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
