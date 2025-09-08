import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImportModal } from "@/components/import/import-modal";
import { useTranslation } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Link } from "wouter";
import { 
  Plus, 
  Upload, 
  Database,
  FileText,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search
} from "lucide-react";

interface QuestionBank {
  id: string;
  name: string;
  description: string;
  testType: 'aptis' | 'vstep' | 'custom';
  skillType: 'reading' | 'listening' | 'grammar' | 'vocabulary' | 'writing' | 'speaking';
  createdAt: string;
  questions?: Question[];
}

interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface QuestionBankForm {
  name: string;
  description: string;
  testType: string;
  skillType: string;
}

export default function QuestionBank() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTestType, setFilterTestType] = useState<string>('all');
  const [filterSkill, setFilterSkill] = useState<string>('all');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<QuestionBankForm>();

  const { data: questionBanks, isLoading } = useQuery<QuestionBank[]>({
    queryKey: ['/api/question-banks']
  });

  const createQuestionBankMutation = useMutation({
    mutationFn: async (data: QuestionBankForm) => {
      const response = await apiRequest('POST', '/api/question-banks', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/question-banks'] });
      toast({ title: "Question bank created successfully" });
      setIsCreateModalOpen(false);
      reset();
    },
    onError: () => {
      toast({ 
        title: "Failed to create question bank", 
        variant: "destructive" 
      });
    }
  });

  const deleteQuestionBankMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/question-banks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/question-banks'] });
      toast({ title: "Question bank deleted successfully" });
    },
    onError: () => {
      toast({ 
        title: "Failed to delete question bank", 
        variant: "destructive" 
      });
    }
  });

  const importQuestionsMutation = useMutation({
    mutationFn: async ({ file, options }: { file: File; options: any }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('questionBankId', options.questionBankId);
      formData.append('testType', options.testType);
      formData.append('skillType', options.skillType);

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/question-banks'] });
      toast({ 
        title: "Questions imported successfully",
        description: data.message
      });
      setIsImportModalOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to import questions",
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const filteredQuestionBanks = questionBanks?.filter(bank => {
    const matchesSearch = bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bank.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTestType = filterTestType === 'all' || bank.testType === filterTestType;
    const matchesSkill = filterSkill === 'all' || bank.skillType === filterSkill;
    
    return matchesSearch && matchesTestType && matchesSkill;
  }) || [];

  const onSubmit = (data: QuestionBankForm) => {
    createQuestionBankMutation.mutate(data);
  };

  const handleImport = async (file: File, options: any) => {
    await importQuestionsMutation.mutateAsync({ file, options });
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

  const getSkillColor = (skill: string) => {
    switch (skill) {
      case 'reading':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'listening':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'grammar':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'vocabulary':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6" data-testid="question-bank-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('questionBank')}</h1>
          <p className="text-muted-foreground">
            Manage your question collections and import new content
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setIsImportModalOpen(true)}
            variant="outline"
            data-testid="button-import-questions"
          >
            <Upload className="w-4 h-4 mr-2" />
            {t('importQuestions')}
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-question-bank">
                <Plus className="w-4 h-4 mr-2" />
                Create Question Bank
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Question Bank</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    {...register('name', { required: 'Name is required' })}
                    data-testid="input-bank-name"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    data-testid="textarea-bank-description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="testType">{t('testType')}</Label>
                    <Select 
                      {...register('testType', { required: 'Test type is required' })}
                      onValueChange={(value) => register('testType').onChange({ target: { value } })}
                    >
                      <SelectTrigger data-testid="select-bank-test-type">
                        <SelectValue placeholder="Select test type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aptis">APTIS ESOL</SelectItem>
                        <SelectItem value="vstep">VSTEP</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.testType && (
                      <p className="text-sm text-destructive mt-1">{errors.testType.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="skillType">Skill</Label>
                    <Select 
                      {...register('skillType', { required: 'Skill is required' })}
                      onValueChange={(value) => register('skillType').onChange({ target: { value } })}
                    >
                      <SelectTrigger data-testid="select-bank-skill-type">
                        <SelectValue placeholder="Select skill" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reading">{t('reading')}</SelectItem>
                        <SelectItem value="listening">{t('listening')}</SelectItem>
                        <SelectItem value="grammar">{t('grammar')}</SelectItem>
                        <SelectItem value="vocabulary">{t('vocabulary')}</SelectItem>
                        <SelectItem value="writing">{t('writing')}</SelectItem>
                        <SelectItem value="speaking">{t('speaking')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.skillType && (
                      <p className="text-sm text-destructive mt-1">{errors.skillType.message}</p>
                    )}
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
                    disabled={createQuestionBankMutation.isPending}
                    data-testid="button-save-question-bank"
                  >
                    {createQuestionBankMutation.isPending ? t('loading') : t('create')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search question banks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-question-banks"
                />
              </div>
            </div>
            <div className="min-w-[150px]">
              <Select value={filterTestType} onValueChange={setFilterTestType}>
                <SelectTrigger data-testid="filter-test-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="aptis">APTIS</SelectItem>
                  <SelectItem value="vstep">VSTEP</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[150px]">
              <Select value={filterSkill} onValueChange={setFilterSkill}>
                <SelectTrigger data-testid="filter-skill">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  <SelectItem value="reading">{t('reading')}</SelectItem>
                  <SelectItem value="listening">{t('listening')}</SelectItem>
                  <SelectItem value="grammar">{t('grammar')}</SelectItem>
                  <SelectItem value="vocabulary">{t('vocabulary')}</SelectItem>
                  <SelectItem value="writing">{t('writing')}</SelectItem>
                  <SelectItem value="speaking">{t('speaking')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Banks Grid */}
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
        ) : filteredQuestionBanks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {questionBanks?.length === 0 ? 'No question banks yet' : 'No question banks match your filters'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {questionBanks?.length === 0 
                ? 'Create your first question bank to get started'
                : 'Try adjusting your search terms or filters'
              }
            </p>
            {questionBanks?.length === 0 && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Question Bank
              </Button>
            )}
          </div>
        ) : (
          filteredQuestionBanks.map((bank) => (
            <Card key={bank.id} className="hover:shadow-lg transition-shadow" data-testid={`question-bank-${bank.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{bank.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary" className={getTestTypeColor(bank.testType)}>
                        {bank.testType.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={getSkillColor(bank.skillType)}>
                        {t(bank.skillType)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {bank.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {bank.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    {bank.questions?.length || 0} questions
                  </span>
                  <span className="text-xs">
                    {new Date(bank.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/question-bank/${bank.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full" data-testid={`view-bank-${bank.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" data-testid={`edit-bank-${bank.id}`}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteQuestionBankMutation.mutate(bank.id)}
                    className="text-destructive hover:text-destructive"
                    data-testid={`delete-bank-${bank.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        questionBanks={questionBanks?.map(bank => ({ id: bank.id, name: bank.name })) || []}
      />
    </div>
  );
}
