import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/lib/i18n";
import { Link } from "wouter";
import { 
  Play, 
  BookOpen, 
  Clock, 
  Target,
  Dumbbell,
  Brain,
  Volume2,
  FileText,
  Loader2
} from "lucide-react";

interface QuestionBank {
  id: string;
  name: string;
  description: string;
  testType: 'aptis' | 'vstep' | 'custom';
  skillType: 'reading' | 'listening' | 'grammar' | 'vocabulary' | 'writing' | 'speaking';
  questionCount: number;
  examDuration: number;
  createdAt: string;
}

interface PaginatedResponse {
  questionBanks: QuestionBank[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export default function Practice() {
  const { t } = useTranslation();
  const { ref, inView } = useInView();
  const [selectedTestType, setSelectedTestType] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery<PaginatedResponse>({
    queryKey: ["practiceQuestionBanks", selectedTestType, selectedSkill],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(
        `/api/practice/question-banks?page=${pageParam}&limit=10&testType=${selectedTestType}&skillType=${selectedSkill}`,
        { credentials: "include" }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
    initialPageParam: 1,
  });

  // Load next page when last item is visible
  if (inView && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }

  const allBanks = data?.pages.flatMap(page => page.questionBanks) || [];

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case 'reading':
        return BookOpen;
      case 'listening':
        return Volume2;
      case 'grammar':
        return Brain;
      case 'vocabulary':
        return FileText;
      default:
        return Target;
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
    <div className="space-y-6" data-testid="practice-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Practice Mode</h1>
        <p className="text-muted-foreground">
          Practice individual skills to improve your performance
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

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-foreground mb-2">
                Skill
              </label>
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
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

            <div className="flex items-end">
              <Link href="/question-bank">
                <Button variant="outline">
                  <Target className="w-4 h-4 mr-2" />
                  Manage Question Banks
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Banks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : isError ? (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium text-foreground mb-2">
              Error loading question banks
            </h3>
            <p className="text-muted-foreground mb-4">
              Please try again later
            </p>
          </div>
        ) : allBanks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Dumbbell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No question banks found
            </h3>
            <p className="text-muted-foreground mb-4">
              Create or import question banks to start practicing
            </p>
            <Link href="/question-bank">
              <Button>
                <Target className="w-4 h-4 mr-2" />
                Create Question Bank
              </Button>
            </Link>
          </div>
        ) : (
          allBanks.map((bank) => {
            const SkillIcon = getSkillIcon(bank.skillType);
            return (
              <Card key={bank.id} className="hover:shadow-lg transition-shadow" data-testid={`question-bank-${bank.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <SkillIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{bank.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className={getTestTypeColor(bank.testType)}>
                            {bank.testType.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {t(bank.skillType)}
                          </Badge>
                        </div>
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
                      {bank.questionCount} questions
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {bank.examDuration} minutes
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/practice/${bank.id}/session`} className="flex-1">
                      <Button className="w-full" data-testid={`start-practice-${bank.id}`}>
                        <Play className="w-4 h-4 mr-2" />
                        Practice Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
        
        {/* Infinite scroll trigger */}
        {(hasNextPage || isFetchingNextPage) && (
          <div
            ref={ref}
            className="col-span-full flex justify-center py-4"
          >
            {isFetchingNextPage && (
              <Loader2 className="w-6 h-6 animate-spin" />
            )}
          </div>
        )}
      </div>

      {/* Quick Start Section */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Start</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/practice?type=aptis&skill=reading">
              <div className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <div>
                    <h4 className="font-medium text-foreground">APTIS Reading Practice</h4>
                    <p className="text-sm text-muted-foreground">Mixed difficulty levels</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/practice?type=vstep&skill=listening">
              <div className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-medium text-foreground">VSTEP Listening Practice</h4>
                    <p className="text-sm text-muted-foreground">Audio-based questions</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
