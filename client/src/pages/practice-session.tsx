import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { Clock, ArrowLeft, ArrowRight, CheckCircle, Circle, AlertTriangle } from "lucide-react";

interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  orderIndex: number;
}

interface QuestionBank {
  id: string;
  name: string;
  description: string;
  testType: 'aptis' | 'vstep' | 'custom';
  skillType: 'reading' | 'listening' | 'grammar' | 'vocabulary' | 'writing' | 'speaking';
  examDuration: number;
  questionCount: number;
}

const PRACTICE_TIME_LIMIT = 30 * 60; // 30 minutes in seconds

export default function PracticeSession() {
  const { id: questionBankId } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();

  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(PRACTICE_TIME_LIMIT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Fetch question bank and questions
  const { data: questionBank, isLoading: bankLoading } = useQuery<QuestionBank>({
    queryKey: ["questionBank", questionBankId],
    queryFn: async () => {
      const response = await fetch(`/api/question-banks/${questionBankId}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch question bank");
      return response.json();
    },
  });

  const { data: questions, isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ["questions", questionBankId],
    queryFn: async () => {
      const response = await fetch(`/api/question-banks/${questionBankId}/questions`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch questions");
      const data = await response.json();
      console.log("Fetched questions data:", data); // Debug log
      console.log("Number of questions:", data.length); // Debug log
      return data;
    },
    enabled: !!questionBankId,
  });

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0) {
      // Auto-submit when time is up
      handleSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  // Warning for 5 minutes remaining
  useEffect(() => {
    if (timeRemaining === 5 * 60 && !showWarning) {
      setShowWarning(true);
      toast({
        title: "Time Warning",
        description: "Only 5 minutes remaining!",
        variant: "destructive",
      });
    }
  }, [timeRemaining, showWarning, toast]);

  // Debug logs
  useEffect(() => {
    if (questions && questions.length > 0) {
      console.log("=== DEBUG INFO ===");
      console.log("Total questions:", questions.length);
      console.log("Current question index:", currentQuestionIndex);
      console.log("All question IDs:", questions.map(q => q.id));
      console.log("All question content preview:", questions.map((q, i) => `${i+1}: ${q.content.substring(0, 50)}...`));
      console.log("Current question:", questions[currentQuestionIndex]);
      console.log("==================");
    }
  }, [questions, currentQuestionIndex]);

  // Submit practice result mutation
  const submitPracticeResult = useMutation({
    mutationFn: async (resultData: {
      questionBankId: string;
      answers: Record<string, string>;
      timeSpent: number;
    }) => {
      const response = await fetch("/api/practice-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(resultData),
      });
      if (!response.ok) throw new Error("Failed to submit practice result");
      return response.json();
    },
    onSuccess: (result) => {
      console.log("Practice result:", result); // Debug log
      toast({
        title: "Practice Completed!",
        description: `You scored ${result.score}/10 (${result.correctAnswers}/${result.totalQuestions} correct)`,
      });
      
      // Redirect to practice result page with the result ID
      setTimeout(() => {
        setLocation(`/practice/result/${result.id}`);
      }, 2000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit practice result",
        variant: "destructive",
      });
    },
  });

  // Submit practice session
  const handleSubmit = useCallback(() => {
    if (isSubmitting || !questions || !questionBankId) return;
    
    setIsSubmitting(true);
    const timeSpent = PRACTICE_TIME_LIMIT - timeRemaining;
    
    submitPracticeResult.mutate({
      questionBankId,
      answers,
      timeSpent,
    });
  }, [isSubmitting, questions, questionBankId, timeRemaining, answers, submitPracticeResult]);

  // Loading state
  if (bankLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading practice session...</p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Questions Available</h3>
          <p className="text-muted-foreground mb-4">This question bank doesn't have any questions yet.</p>
          <Button onClick={() => setLocation('/practice')}>
            Back to Practice
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">{questionBank?.name}</h1>
            <Badge variant="secondary">
              {questionBank?.testType?.toUpperCase()} • {questionBank?.skillType}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Clock className={`w-5 h-5 ${timeRemaining <= 5 * 60 ? 'text-red-500' : 'text-muted-foreground'}`} />
              <span className={`font-mono text-lg ${timeRemaining <= 5 * 60 ? 'text-red-500 font-bold' : ''}`}>
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant="outline"
            >
              {isSubmitting ? "Submitting..." : "Submit Practice"}
            </Button>
            
            {/* Debug button to recreate questions */}
            <Button 
              onClick={async () => {
                try {
                  const response = await fetch(`/api/debug/recreate/${questionBankId}`, {
                    method: "POST",
                    credentials: "include"
                  });
                  if (response.ok) {
                    toast({
                      title: "Success",
                      description: t('questionsRecreatedSuccessfully'),
                    });
                    // Refresh the page after 1 second
                    setTimeout(() => window.location.reload(), 1000);
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to recreate questions",
                    variant: "destructive",
                  });
                }
              }}
              variant="destructive"
              size="sm"
            >
              🔧 Fix Questions
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Question Navigation Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4">Questions</h3>
          <div className="grid grid-cols-4 gap-2">
            {questions.map((_, index) => {
              const isAnswered = answers[questions[index].id];
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`
                    w-10 h-10 rounded text-sm font-medium border-2 transition-colors
                    ${isCurrent 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : isAnswered 
                        ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                    }
                  `}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Question Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">
                Question {currentQuestionIndex + 1}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {questions[currentQuestionIndex]?.content}
                </p>
              </div>

              <div className="space-y-3">
                {questions[currentQuestionIndex]?.options.map((option, index) => {
                  const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                  const currentQuestion = questions[currentQuestionIndex];
                  
                  return (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                      <input 
                        type="radio" 
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        id={`option-${currentQuestion.id}-${index}`}
                        className="mt-1"
                        onChange={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }))}
                        checked={answers[currentQuestion.id] === option}
                      />
                      <label htmlFor={`option-${currentQuestion.id}-${index}`} className="flex-1 cursor-pointer text-base leading-relaxed">
                        <span className="font-medium text-primary mr-2">{optionLetter}.</span>
                        {option}
                      </label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-6 max-w-4xl mx-auto">
            <Button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {answers[questions[currentQuestionIndex]?.id] ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Answered</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <Circle className="w-4 h-4" />
                  <span>Not answered</span>
                </div>
              )}
            </div>

            <Button
              onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            {currentQuestionIndex === questions.length - 1 && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 ml-4"
                variant="default"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Finish Practice</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}