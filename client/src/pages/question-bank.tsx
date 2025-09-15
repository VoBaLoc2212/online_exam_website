
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
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
import { Link, useLocation } from "wouter";
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

// ...interfaces and other code remain unchanged...

export default function QuestionBankPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTestType, setFilterTestType] = useState("all");
  const [filterSkill, setFilterSkill] = useState("all");

  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger, reset } = useForm({
    defaultValues: {
      name: "",
      description: "",
      testType: "",
      skillType: "",
      examDuration: 60,
    },
  });


  const { data: questionBanks = [], isLoading, refetch } = useQuery<Array<any>>({
    queryKey: ["questionBanks"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/question-banks");
      return await res.json();
    },
  });

  const createQuestionBank = async (data: any) => {
    const res = await apiRequest("POST", "/api/question-banks", data);
    return await res.json();
  };
  const [, setLocation] = useLocation();
  const createQuestionBankMutation = useMutation({
    mutationFn: createQuestionBank,
    onSuccess: (data: any) => {
      toast({ title: t("createdSuccessfully") });
      setIsCreateModalOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ["questionBanks"] });
      // Chuyển hướng sang trang tạo câu hỏi với questionBankId vừa tạo
      setLocation(`/question-bank/${data.id}/questions`);
    },
    onError: () => {
      toast({ title: t("errorOccurred"), variant: "destructive" });
    },
  });

  const [bankToDelete, setBankToDelete] = useState<{ id: string; name: string } | null>(null);

  const deleteQuestionBank = async (id: string) => {
    const res = await apiRequest("DELETE", `/api/question-banks/${id}`);
    const data = await res.json();
    if (!data.message) {
      throw new Error("No response received from server");
    }
    return data;
  };

  const deleteQuestionBankMutation = useMutation({
    mutationFn: deleteQuestionBank,
    onSuccess: (data) => {
      toast({ 
        title: "Deleted Successfully", 
        description: data.message || "Question bank and all related questions have been deleted"
      });
      setBankToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["questionBanks"] });
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast({ 
        title: "Error",
        description: error?.message || "Could not delete question bank. Please try again later.",
        variant: "destructive"
      });
      setBankToDelete(null);
    },
  });

  const handleDelete = (bank: { id: string; name: string }) => {
    setBankToDelete(bank);
  };

  const onSubmit = (data: any) => {
    createQuestionBankMutation.mutate(data);
  };

  const handleImport = async (imported: any) => {
    // handle import logic here
    queryClient.invalidateQueries({ queryKey: ["questionBanks"] });
    setIsImportModalOpen(false);
    toast({ title: t("importSuccess") });
  };

  const filteredQuestionBanks = questionBanks.filter((bank: any) => {
    const matchesSearch = bank.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTestType = filterTestType === "all" || bank.testType === filterTestType;
    const matchesSkill = filterSkill === "all" || bank.skillType === filterSkill;
    return matchesSearch && matchesTestType && matchesSkill;
  });

  // Helper functions for badge color (dummy, replace with your logic if needed)
  const getTestTypeColor = (type: string) => "";
  const getSkillColor = (type: string) => "";
  // Helper render function to avoid JSX parser confusion
  const renderQuestionBankCard = (bank: any) => (
  <Card key={bank.id} className="hover:shadow-lg transition-shadow" data-testid={'question-bank-' + bank.id}>
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
            {bank.questionCount || 0} questions
          </span>
          <span className="text-xs">
            {new Date(bank.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex space-x-2">
          <Link href={'/question-bank/' + bank.id + "/questions"} className="flex-1">
            <Button variant="outline" size="sm" className="w-full" data-testid={'view-bank-' + bank.id}>
              <Eye className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(bank)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            data-testid={'delete-bank-' + bank.id}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          
          {/* Delete Confirmation Dialog */}
          <AlertDialog open={bankToDelete?.id === bank.id} onOpenChange={(isOpen) => !isOpen && setBankToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Confirmation</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete question bank "{bank.name}"?
                  All questions in this bank will also be deleted.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setBankToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deleteQuestionBankMutation.mutate(bank.id)}
                  disabled={deleteQuestionBankMutation.isPending}
                >
                  {deleteQuestionBankMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Xóa'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );

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
                      value={watch('testType') || ''}
                      onValueChange={async (value) => {
                        setValue('testType', value, { shouldValidate: true });
                        await trigger('testType');
                      }}
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
                      value={watch('skillType') || ''}
                      onValueChange={async (value) => {
                        setValue('skillType', value, { shouldValidate: true });
                        await trigger('skillType');
                      }}
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
                  <div>
                    <Label htmlFor="examDuration">Thời gian làm bài (phút)</Label>
                    <Input
                      id="examDuration"
                      type="number"
                      min={1}
                      {...register('examDuration', { valueAsNumber: true, required: 'Thời gian làm bài là bắt buộc' })}
                      data-testid="input-exam-duration"
                    />
                    {errors.examDuration && (
                      <p className="text-sm text-destructive mt-1">{String(errors.examDuration.message)}</p>
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
                    data-testid="button-save-question-bank"
                  >
                    {t('create')}
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
                : 'Try adjusting your search terms or filters'}
            </p>
            {questionBanks?.length === 0 && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Question Bank
              </Button>
            )}
          </div>
        ) : (
          filteredQuestionBanks.map(renderQuestionBankCard)
        )}
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        questionBanks={questionBanks?.map((bank: any) => ({ id: bank.id, name: bank.name })) || []}
      />
    </div>
  );
}
