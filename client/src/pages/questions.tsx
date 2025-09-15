import { useState } from "react";
import { useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuestionForm {
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  explanation: string;
}

export default function QuestionsPage() {
  const { questionbankId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [questionForms, setQuestionForms] = useState<QuestionForm[]>([{
    content: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    answer: "",
    explanation: "",
  }]);

  // Fetch question bank info (optional)
  const { data: questionBank } = useQuery({
    queryKey: ["questionBank", questionbankId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/question-banks/${questionbankId}`);
      return await res.json();
    },
    enabled: !!questionbankId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch questions for this bank
  const { data: questions = [], isLoading, refetch } = useQuery({
    queryKey: ["questions", questionbankId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/question-banks/${questionbankId}/questions`);
      return await res.json();
    },
    enabled: !!questionbankId,
    staleTime: 0, // Luôn fetch lại khi gọi refetch
    refetchOnWindowFocus: true, // Tự động fetch khi tab được focus
  });

  // Create question mutation
  const createQuestion = async (data: any) => {
    const res = await apiRequest("POST", "/api/questions", {
      ...data,
      questionBankId: questionbankId,
    });
    return await res.json();
  };
  const createQuestionMutation = useMutation({
    mutationFn: async (questions: any[]) => {
      const questionsToSave = questions.map((q, index) => {
        if (!q.content || !Array.isArray(q.options) || !q.answer) {
          throw new Error('Missing required information in question');
        }

        // Validate data fields
        if (q.options.length !== 4) {
          throw new Error('Each question must have exactly 4 options');
        }

        if (!['A', 'B', 'C', 'D'].includes(q.answer)) {
          throw new Error('Correct answer must be A, B, C or D');
        }

        // Only send required fields according to schema
        return {
          questionBankId: questionbankId,
          content: q.content,
          options: q.options,
          correctAnswer: q.answer,
          explanation: q.explanation,
          difficulty: 'easy',
          points: 1,
          orderIndex: index,
        };
      });

      const res = await apiRequest("POST", "/api/questions/bulk", {
        questions: questionsToSave
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Lỗi khi lưu câu hỏi');
      }
      
      return await res.json();
    },
    onSuccess: async () => {
      toast({ title: "Questions saved successfully" });
      
      // Get the updated question list
      await refetch();
      
      // Reset all forms but keep the same number of forms
      setQuestionForms(prevForms => 
        prevForms.map(() => ({
          content: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          answer: "",
          explanation: "",
        }))
      );
    },
    onError: (error: Error) => {
      toast({ 
        title: "Lỗi khi lưu các câu hỏi", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleQuestionChange = (index: number, field: keyof QuestionForm, value: string) => {
    const newForms = [...questionForms];
    newForms[index] = { ...newForms[index], [field]: value };
    setQuestionForms(newForms);
  };

  const addNewQuestion = () => {
    setQuestionForms([...questionForms, {
      content: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      answer: "",
      explanation: "",
    }]);
  };

  const handleSave = () => {
    // Kiểm tra form trước khi gửi
    const hasEmptyFields = questionForms.some(form => 
      !form.content || !form.optionA || !form.optionB || 
      !form.optionC || !form.optionD || !form.answer
    );

    if (hasEmptyFields) {
      toast({ 
        title: "Error",
        description: "Please fill in all required fields for all questions (explanation is optional)",
        variant: "destructive"
      });
      return;
    }

    // Check if answer is A, B, C or D
    const hasInvalidAnswer = questionForms.some(form => 
      !['A', 'B', 'C', 'D'].includes(form.answer.toUpperCase())
    );

    if (hasInvalidAnswer) {
      toast({ 
        title: "Error",
        description: "Correct answer must be A, B, C or D",
        variant: "destructive"
      });
      return;
    }

    // Kiểm tra và chuẩn bị dữ liệu trước khi gửi
    const questions = questionForms.map(form => {
      const trimmedContent = form.content.trim();
      const trimmedOptions = [
        form.optionA.trim(),
        form.optionB.trim(),
        form.optionC.trim(),
        form.optionD.trim()
      ];
      const upperAnswer = form.answer.toUpperCase();
      const trimmedExplanation = form.explanation?.trim();

      // Validate dữ liệu trước khi trả về
      if (!trimmedContent) {
        throw new Error('Question content cannot be empty');
      }

      if (trimmedOptions.some(opt => !opt)) {
        throw new Error('All answer options must be filled in');
      }

      return {
        content: trimmedContent,
        options: trimmedOptions,
        answer: upperAnswer,
        explanation: trimmedExplanation || null,
      };
    });

    createQuestionMutation.mutate(questions);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div className="space-y-6">
        {questionForms.map((form, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>
                Câu {questions.length + index + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`content-${index}`}>Nội dung câu hỏi</Label>
                  <Textarea
                    id={`content-${index}`}
                    value={form.content}
                    onChange={(e) => handleQuestionChange(index, 'content', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`optionA-${index}`}>Đáp án A</Label>
                    <Input
                      id={`optionA-${index}`}
                      value={form.optionA}
                      onChange={(e) => handleQuestionChange(index, 'optionA', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`optionB-${index}`}>Đáp án B</Label>
                    <Input
                      id={`optionB-${index}`}
                      value={form.optionB}
                      onChange={(e) => handleQuestionChange(index, 'optionB', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`optionC-${index}`}>Đáp án C</Label>
                    <Input
                      id={`optionC-${index}`}
                      value={form.optionC}
                      onChange={(e) => handleQuestionChange(index, 'optionC', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`optionD-${index}`}>Đáp án D</Label>
                    <Input
                      id={`optionD-${index}`}
                      value={form.optionD}
                      onChange={(e) => handleQuestionChange(index, 'optionD', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Đáp án đúng</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {['A', 'B', 'C', 'D'].map((option) => (
                      <div
                        key={option}
                        className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors
                          ${form.answer === option 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'hover:bg-accent'
                          }`}
                        onClick={() => handleQuestionChange(index, 'answer', option)}
                      >
                        <span className="font-medium">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor={`explanation-${index}`}>Giải thích (tuỳ chọn)</Label>
                  <Textarea
                    id={`explanation-${index}`}
                    value={form.explanation}
                    onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={addNewQuestion}
          >
            Add Question
          </Button>
          <Button
            onClick={handleSave}
            disabled={createQuestionMutation.status === 'pending'}
          >
            {createQuestionMutation.status === 'pending' ? "Saving..." : "Save"}
          </Button>
        </div>

        {/* Hiển thị danh sách câu hỏi đã có */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Existing Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Đang tải danh sách câu hỏi...</div>
            ) : questions.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Chưa có câu hỏi nào trong ngân hàng
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((q: any, index: number) => (
                  <div key={q.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">Question {index + 1}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(q.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div className="mb-4">{q.content}</div>
                    <div className="space-y-2">
                      {q.options?.map((opt: string, i: number) => {
                        const isCorrect = String.fromCharCode(65 + i) === q.correctAnswer;
                        return (
                          <div
                            key={i}
                            className={`flex items-center border rounded-lg px-4 py-2 
                              ${isCorrect ? 'bg-green-50 border-green-200' : ''}`}
                          >
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-3 
                              ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}
                            >
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Giải thích: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
