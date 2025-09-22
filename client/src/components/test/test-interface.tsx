import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n";
import { useAntiCheat } from "@/hooks/use-anti-cheat";
import { ArrowLeft, ArrowRight, Bookmark, Clock, AlertTriangle, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TestQuestion {
  id: string;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface TestSession {
  id: string;
  testId: string;
  timeRemaining: number;
  currentQuestionIndex: number;
  answers: { [questionId: string]: string };
  markedQuestions: string[];
}

interface TestInterfaceProps {
  session: TestSession;
  questions: TestQuestion[];
  testName: string;
  isFullMockTest?: boolean; // Thêm flag để phân biệt mock test vs practice
  onAnswerChange: (questionId: string, answer: string) => void;
  onQuestionNavigate: (index: number) => void;
  onMarkQuestion: (questionId: string) => void;
  onSubmitTest: () => void;
  onTestTerminated?: (reason: string) => void; // Callback khi test bị kết thúc do vi phạm
}

export function TestInterface({
  session,
  questions,
  testName,
  isFullMockTest = false,
  onAnswerChange,
  onQuestionNavigate,
  onMarkQuestion,
  onSubmitTest,
  onTestTerminated
}: TestInterfaceProps) {
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState(session.timeRemaining);
  const [isTerminated, setIsTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState<string>('');
  const [showFullscreenDialog, setShowFullscreenDialog] = useState(false);
  
  // Update timeRemaining when session changes
  useEffect(() => {
    setTimeRemaining(session.timeRemaining);
  }, [session.timeRemaining]);
  
  // Initialize anti-cheat system with fullscreen for mock tests
  const antiCheatStats = useAntiCheat(session.id, true, {
    requireFullscreen: isFullMockTest,
    onViolation: (violationType, details) => {
      console.log('Violation detected:', violationType, details);
    },
    onTestTermination: (reason) => {
      setIsTerminated(true);
      setTerminationReason(reason);
      onTestTerminated?.(reason);
    }
  });
  
  // Show fullscreen dialog for mock tests
  useEffect(() => {
    if (isFullMockTest && !antiCheatStats.fullscreen.isFullscreen && antiCheatStats.fullscreen.isSupported) {
      setShowFullscreenDialog(true);
    } else {
      setShowFullscreenDialog(false);
    }
  }, [isFullMockTest, antiCheatStats.fullscreen.isFullscreen, antiCheatStats.fullscreen.isSupported]);
  
  const currentQuestion = questions[session.currentQuestionIndex];
  const progress = ((session.currentQuestionIndex + 1) / questions.length) * 100;
  
  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          onSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [onSubmitTest]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleAnswerSelect = (answer: string) => {
    onAnswerChange(currentQuestion.id, answer);
  };
  
  const handleMarkForReview = () => {
    onMarkQuestion(currentQuestion.id);
  };
  
  const handlePrevious = () => {
    if (session.currentQuestionIndex > 0) {
      onQuestionNavigate(session.currentQuestionIndex - 1);
    }
  };
  
  const handleNext = () => {
    if (session.currentQuestionIndex < questions.length - 1) {
      onQuestionNavigate(session.currentQuestionIndex + 1);
    }
  };
  
  const getQuestionStatus = (index: number) => {
    const question = questions[index];
    const isAnswered = session.answers[question.id];
    const isMarked = session.markedQuestions.includes(question.id);
    const isCurrent = index === session.currentQuestionIndex;
    
    if (isCurrent) return 'current';
    if (isMarked) return 'marked';
    if (isAnswered) return 'answered';
    return 'unanswered';
  };

  // If test is terminated, show termination dialog
  if (isTerminated) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-destructive mb-2">{t('testTerminated')}</h2>
            <p className="text-muted-foreground mb-4">{t('testTerminatedDueToViolation')}</p>
            <p className="text-sm font-medium mb-2">{t('violationReason')}:</p>
            <p className="text-sm text-muted-foreground mb-4 bg-muted p-3 rounded">{terminationReason}</p>
            <p className="text-lg font-bold text-destructive">{t('finalScore')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Fullscreen Dialog for Mock Tests */}
      <Dialog open={showFullscreenDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              {t('fullscreenRequired')}
            </DialogTitle>
            <DialogDescription>
              {t('fullscreenMessage')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t('violationWarning')}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => {
                antiCheatStats.fullscreen.enter();
                setShowFullscreenDialog(false);
              }}
              className="w-full"
            >
              <Monitor className="w-4 h-4 mr-2" />
              {t('enterFullscreen')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-6" data-testid="test-interface">
        {/* Anti-cheat Status Bar for Mock Tests */}
        {isFullMockTest && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{t('antiCheatActive')}</span>
              <div className="flex items-center space-x-4 text-sm">
                <span>{t('tabSwitches')}: {antiCheatStats.tabSwitchCount}</span>
                <span>{t('warnings')}: {antiCheatStats.warningCount}</span>
                {antiCheatStats.fullscreen.isFullscreen && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Monitor className="w-3 h-3 mr-1" />
                    Fullscreen
                  </Badge>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      {/* Test Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground" data-testid="test-name">
                {testName}
              </h2>
              <p className="text-sm text-muted-foreground" data-testid="question-counter">
                {t('questionOf', { 
                  current: session.currentQuestionIndex + 1, 
                  total: questions.length 
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div 
                  className={cn(
                    "text-2xl font-bold",
                    timeRemaining < 300 ? "text-destructive" : "text-foreground"
                  )}
                  data-testid="test-timer"
                >
                  {formatTime(timeRemaining)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{t('timeRemaining')}</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <Progress value={progress} className="w-full" data-testid="test-progress" />
        </CardContent>
      </Card>

      {/* Test Question */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
              <div 
                className="text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: currentQuestion.content }}
                data-testid="question-content"
              />
            </div>
          </div>

          {/* Answer options */}
          <RadioGroup
            value={session.answers[currentQuestion.id] || ""}
            onValueChange={handleAnswerSelect}
            className="space-y-3"
            data-testid="answer-options"
          >
            {currentQuestion.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
              return (
                <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors">
                  <RadioGroupItem value={option} id={`option-${index}`} className="w-4 h-4 text-primary" />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer text-foreground"
                    data-testid={`option-${optionLetter.toLowerCase()}`}
                  >
                    <span className="font-medium mr-2">{optionLetter})</span>
                    {option}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={session.currentQuestionIndex === 0}
              data-testid="button-previous"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('previous')}
            </Button>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleMarkForReview}
                data-testid="button-mark-review"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                {t('markForReview')}
              </Button>
              
              {session.currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={onSubmitTest}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-submit"
                >
                  {t('submit')}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  data-testid="button-next"
                >
                  {t('next')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Navigator */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-sm font-medium text-foreground mb-4">{t('questionNavigator')}</h4>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-4">
            {questions.map((_, index) => {
              const status = getQuestionStatus(index);
              return (
                <button
                  key={index}
                  onClick={() => onQuestionNavigate(index)}
                  className={cn(
                    "w-8 h-8 text-xs font-medium rounded border transition-colors",
                    status === 'current' && "bg-primary text-primary-foreground",
                    status === 'answered' && "bg-green-600 text-white",
                    status === 'marked' && "bg-amber-500 text-white border-amber-600",
                    status === 'unanswered' && "border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                  )}
                  data-testid={`question-nav-${index + 1}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-primary rounded"></div>
              <span className="text-muted-foreground">Current</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-muted-foreground">Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <span className="text-muted-foreground">Marked</span>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
