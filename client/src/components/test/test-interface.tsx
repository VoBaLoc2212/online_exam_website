import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n";
import { useAntiCheat } from "@/hooks/use-anti-cheat";
import { ArrowLeft, ArrowRight, Bookmark, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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
  onAnswerChange: (questionId: string, answer: string) => void;
  onQuestionNavigate: (index: number) => void;
  onMarkQuestion: (questionId: string) => void;
  onSubmitTest: () => void;
}

export function TestInterface({
  session,
  questions,
  testName,
  onAnswerChange,
  onQuestionNavigate,
  onMarkQuestion,
  onSubmitTest
}: TestInterfaceProps) {
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState(session.timeRemaining);
  
  const antiCheatStats = useAntiCheat(session.id, true);
  
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

  return (
    <div className="space-y-6" data-testid="test-interface">
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
  );
}
