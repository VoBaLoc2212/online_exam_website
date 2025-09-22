import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Link } from "wouter";
import { 
  Plus, 
  Settings,
  Clock,
  FileText,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  Search,
  Copy
} from "lucide-react";

interface Test {
  id: string;
  name: string;
  description: string;
  testType: 'aptis' | 'vstep' | 'custom';
  questionBankId: string;
  timeLimit: number;
  totalQuestions: number;
  isActive: boolean;
  createdAt: string;
  questionBank?: {
    id: string;
    name: string;
    skillType: string;
  };
}

interface QuestionBank {
  id: string;
  name: string;
  testType: string;
  skillType: string;
  questions?: Array<{ id: string }>;
}

interface TestForm {
  name: string;
  description: string;
  testType: 'aptis' | 'vstep' | 'custom';
  questionBankId: string;
  timeLimit: number;
  totalQuestions: number;
  isActive: boolean;
}

export default function TestManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteTestId, setDeleteTestId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTestType, setFilterTestType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors }, control } = useForm<TestForm>({
    defaultValues: {
      isActive: true,
      timeLimit: 60,
      totalQuestions: 20
    }
  });

  const selectedQuestionBankId = watch('questionBankId');

  const { data: tests, isLoading } = useQuery<Test[]>({
    queryKey: ['/api/tests']
  });

  const { data: questionBanks } = useQuery<QuestionBank[]>({
    queryKey: ['/api/question-banks']
  });

  const createTestMutation = useMutation({
    mutationFn: async (data: TestForm) => {
      const response = await apiRequest('POST', '/api/tests', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tests'] });
      toast({ title: t('testCreatedSuccessfully') });
      setIsCreateModalOpen(false);
      reset();
    },
    onError: () => {
      toast({ 
        title: t('failedToCreateTest'), 
        variant: "destructive" 
      });
    }
  });

  const updateTestMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TestForm> }) => {
      const response = await apiRequest('PATCH', `/api/tests/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tests'] });
      toast({ title: t('testUpdatedSuccessfully') });
    },
    onError: () => {
      toast({ 
        title: t('failedToUpdateTest'), 
        variant: "destructive" 
      });
    }
  });

  const deleteTestMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/tests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tests'] });
      toast({ title: t('testDeletedSuccessfully') });
      setDeleteTestId(null);
    },
    onError: () => {
      toast({ 
        title: t('failedToDeleteTest'), 
        variant: "destructive" 
      });
      setDeleteTestId(null);
    }
  });

  const duplicateTestMutation = useMutation({
    mutationFn: async (test: Test) => {
      const duplicateData = {
        name: `${test.name} (Copy)`,
        description: test.description,
        testType: test.testType,
        questionBankId: test.questionBank?.id || test.questionBankId,
        timeLimit: test.timeLimit,
        totalQuestions: test.totalQuestions,
        isActive: false
      };
      const response = await apiRequest('POST', '/api/tests', duplicateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tests'] });
      toast({ title: t('testDuplicatedSuccessfully') });
    },
    onError: () => {
      toast({ 
        title: t('failedToDuplicateTest'), 
        variant: "destructive" 
      });
    }
  });

  const filteredTests = tests?.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTestType = filterTestType === 'all' || test.testType === filterTestType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && test.isActive) ||
                         (filterStatus === 'inactive' && !test.isActive);
    
    return matchesSearch && matchesTestType && matchesStatus;
  }) || [];

  const selectedQuestionBank = questionBanks?.find(bank => bank.id === selectedQuestionBankId);

  const onSubmit = (data: TestForm) => {
    console.log('Form data being submitted:', data);
    
    // Validate required fields
    if (!data.name || !data.testType || !data.questionBankId) {
      toast({ 
        title: t('error'), 
        description: t('fillAllRequiredFields'),
        variant: "destructive" 
      });
      return;
    }
    
    // Validate numeric fields (should be numbers now due to valueAsNumber: true)
    if (typeof data.timeLimit !== 'number' || typeof data.totalQuestions !== 'number' || 
        data.timeLimit <= 0 || data.totalQuestions <= 0 || 
        isNaN(data.timeLimit) || isNaN(data.totalQuestions)) {
      toast({ 
        title: t('error'), 
        description: t('invalidNumbers'),
        variant: "destructive" 
      });
      return;
    }
    
    createTestMutation.mutate(data);
  };

  const toggleTestStatus = (test: Test) => {
    updateTestMutation.mutate({
      id: test.id,
      updates: { isActive: !test.isActive }
    });
  };

  const handleDeleteTest = (testId: string) => {
    if (deleteTestId === testId) {
      deleteTestMutation.mutate(testId);
    }
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

  return (
    <div className="space-y-6" data-testid="test-management-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-test">
              <Plus className="w-4 h-4 mr-2" />
              {t('createTest')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Test</DialogTitle>
              <DialogDescription>
                Configure a new test with questions from your question banks.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">{t('testName')}</Label>
                  <Input
                    id="name"
                    {...register('name', { required: t('nameRequired') })}
                    data-testid="input-test-name"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="description">{t('testDescription')}</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    data-testid="textarea-test-description"
                  />
                </div>
                
                <div>
                  <Label htmlFor="testType">{t('testType')}</Label>
                  <Select 
                    onValueChange={(value) => setValue('testType', value as 'aptis' | 'vstep' | 'custom')}
                  >
                    <SelectTrigger data-testid="select-test-type">
                      <SelectValue placeholder={t('selectTestType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aptis">{t('aptisEsol')}</SelectItem>
                      <SelectItem value="vstep">{t('vstep')}</SelectItem>
                      <SelectItem value="custom">{t('custom')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.testType && (
                    <p className="text-sm text-destructive mt-1">{errors.testType.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="questionBankId">{t('questionBank')}</Label>
                  <Select 
                    onValueChange={(value) => {
                      setValue('questionBankId', value);
                    }}
                  >
                    <SelectTrigger data-testid="select-question-bank">
                      <SelectValue placeholder={t('selectQuestionBank')} />
                    </SelectTrigger>
                    <SelectContent>
                      {questionBanks?.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id}>
                          {bank.name} ({bank.questions?.length || 0} questions)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.questionBankId && (
                    <p className="text-sm text-destructive mt-1">{errors.questionBankId.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="timeLimit">{t('timeLimitMinutes')}</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    {...register('timeLimit', { 
                      required: t('timeLimitRequired'),
                      min: { value: 1, message: 'Time limit must be at least 1 minute' },
                      valueAsNumber: true
                    })}
                    data-testid="input-time-limit"
                  />
                  {errors.timeLimit && (
                    <p className="text-sm text-destructive mt-1">{errors.timeLimit.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="totalQuestions">{t('totalQuestions')}</Label>
                  <Input
                    id="totalQuestions"
                    type="number"
                    min="1"
                    max={selectedQuestionBank?.questions?.length || 100}
                    {...register('totalQuestions', { 
                      required: t('totalQuestionsRequired'),
                      min: { value: 1, message: 'Must have at least 1 question' },
                      valueAsNumber: true
                    })}
                    data-testid="input-total-questions"
                  />
                  {selectedQuestionBank && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Max: {selectedQuestionBank.questions?.length || 0} questions available
                    </p>
                  )}
                  {errors.totalQuestions && (
                    <p className="text-sm text-destructive mt-1">{errors.totalQuestions.message}</p>
                  )}
                </div>
                
                <div className="col-span-2 flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    {...register('isActive')}
                    onCheckedChange={(checked) => setValue('isActive', checked)}
                    data-testid="switch-test-active"
                  />
                  <Label htmlFor="isActive">{t('makeTestActiveImmediately')}</Label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  {t('cancel')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTestMutation.isPending}
                  data-testid="button-save-test"
                >
                  {createTestMutation.isPending ? t('loading') : t('create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t('searchTests')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-tests"
                />
              </div>
            </div>
            <div className="min-w-[150px]">
              <Select value={filterTestType} onValueChange={setFilterTestType}>
                <SelectTrigger data-testid="filter-test-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTypes')}</SelectItem>
                  <SelectItem value="aptis">{t('aptis')}</SelectItem>
                  <SelectItem value="vstep">{t('vstep')}</SelectItem>
                  <SelectItem value="custom">{t('custom')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[150px]">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger data-testid="filter-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatus')}</SelectItem>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="inactive">{t('inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tests Grid */}
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
            <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {tests?.length === 0 ? t('noTests') : t('noTestsMatch')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {tests?.length === 0 
                ? t('createFirstTest')
                : t('adjustFilters')
              }
            </p>
            {tests?.length === 0 && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('createTest')}
              </Button>
            )}
          </div>
        ) : (
          filteredTests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow" data-testid={`test-${test.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary" className={getTestTypeColor(test.testType)}>
                        {test.testType.toUpperCase()}
                      </Badge>
                      <Badge variant={test.isActive ? "default" : "secondary"}>
                        {test.isActive ? t('active') : t('inactive')}
                      </Badge>
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
                      {t('totalQuestions')}
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
                  <div className="flex items-center justify-between">
                    <span>{t('questionBank')}</span>
                    <span className="font-medium">{test.questionBank?.name || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/mock-test/${test.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full" data-testid={`view-test-${test.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      {t('view')}
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleTestStatus(test)}
                    data-testid={`toggle-test-${test.id}`}
                  >
                    {test.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => duplicateTestMutation.mutate(test)}
                    data-testid={`duplicate-test-${test.id}`}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`edit-test-${test.id}`}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        data-testid={`delete-test-${test.id}`}
                        onClick={() => setDeleteTestId(test.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteConfirmation')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('deleteTestMessage', { name: test.name })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteTestId(null)}>
                          {t('cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteTest(test.id)}
                          disabled={deleteTestMutation.isPending}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleteTestMutation.isPending ? t('deleting') : t('delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
