import { useState, useCallback } from 'react';

export type Language = 'en' | 'vi';

export interface Translations {
  [key: string]: {
    en: string;
    vi: string;
  };
}

export const translations: Translations = {
  // Navigation
  dashboard: { en: 'Dashboard', vi: 'Bảng điều khiển' },
  practice: { en: 'Practice', vi: 'Luyện tập' },
  mockTests: { en: 'Mock Tests', vi: 'Thi thử' },
  results: { en: 'Results', vi: 'Kết quả' },
  questionBank: { en: 'Question Bank', vi: 'Ngân hàng câu hỏi' },
  testManagement: { en: 'Test Management', vi: 'Quản lý đề thi' },
  
  // Dashboard
  welcomeBack: { en: 'Welcome back! Ready to practice?', vi: 'Chào mừng trở lại! Sẵn sàng luyện tập?' },
  totalPractice: { en: 'Total Practice', vi: 'Tổng luyện tập' },
  averageScore: { en: 'Average Score', vi: 'Điểm trung bình' },
  studyStreak: { en: 'Study Streak', vi: 'Chuỗi học tập' },
  quickActions: { en: 'Quick Actions', vi: 'Hành động nhanh' },
  recentTests: { en: 'Recent Tests', vi: 'Bài thi gần đây' },
  skillsProgress: { en: 'Skills Progress', vi: 'Tiến độ kỹ năng' },
  
  // Test Interface
  timeRemaining: { en: 'Time remaining', vi: 'Thời gian còn lại' },
  questionOf: { en: 'Question {current} of {total}', vi: 'Câu {current} trong {total}' },
  previous: { en: 'Previous', vi: 'Trước' },
  next: { en: 'Next', vi: 'Tiếp theo' },
  markForReview: { en: 'Mark for Review', vi: 'Đánh dấu' },
  questionNavigator: { en: 'Question Navigator', vi: 'Điều hướng câu hỏi' },
  
  // Skills
  reading: { en: 'Reading', vi: 'Đọc hiểu' },
  listening: { en: 'Listening', vi: 'Nghe hiểu' },
  grammar: { en: 'Grammar', vi: 'Ngữ pháp' },
  vocabulary: { en: 'Vocabulary', vi: 'Từ vựng' },
  writing: { en: 'Writing', vi: 'Viết' },
  speaking: { en: 'Speaking', vi: 'Nói' },
  
  // Import
  importQuestions: { en: 'Import Questions', vi: 'Nhập câu hỏi' },
  selectFile: { en: 'Select File', vi: 'Chọn tệp' },
  fileFormat: { en: 'File Format', vi: 'Định dạng tệp' },
  testType: { en: 'Test Type', vi: 'Loại bài thi' },
  skillCategory: { en: 'Skill Category', vi: 'Kỹ năng' },
  cancel: { en: 'Cancel', vi: 'Hủy' },
  
  // Common
  save: { en: 'Save', vi: 'Lưu' },
  delete: { en: 'Delete', vi: 'Xóa' },
  edit: { en: 'Edit', vi: 'Chỉnh sửa' },
  create: { en: 'Create', vi: 'Tạo' },
  submit: { en: 'Submit', vi: 'Nộp bài' },
  loading: { en: 'Loading...', vi: 'Đang tải...' },
  error: { en: 'Error', vi: 'Lỗi' },
  success: { en: 'Success', vi: 'Thành công' },
  
  // Anti-cheat
  monitoringActive: { en: 'Monitoring Active', vi: 'Đang giám sát' },
  tabSwitches: { en: 'Tab switches:', vi: 'Chuyển tab:' },
  warnings: { en: 'Warnings:', vi: 'Cảnh báo:' },
};

export function useTranslation() {
  const [language, setLanguage] = useState<Language>('en');
  
  const t = useCallback((key: string, params?: { [key: string]: string | number }) => {
    const translation = translations[key];
    if (!translation) return key;
    
    let text = translation[language];
    
    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, String(value));
      });
    }
    
    return text;
  }, [language]);
  
  const switchLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  }, []);
  
  // Load language from localStorage on mount
  useState(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'vi')) {
      setLanguage(savedLang);
    }
  });
  
  return { t, language, switchLanguage };
}
