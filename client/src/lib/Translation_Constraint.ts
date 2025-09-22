/**
 * Translation Constraint File
 * 
 * Tệp này chứa tất cả các bản dịch từ tiếng Anh sang tiếng Việt
 * được sử dụng trong hệ thống đa ngôn ngữ của ứng dụng.
 * 
 * Cách sử dụng:
 * - Thêm key mới: thêm vào object translations với format { en: 'English text', vi: 'Văn bản tiếng Việt' }
 * - Sử dụng trong component: {t('keyName')}
 * - Tham số động: {t('keyName', { param: 'value' })}
 */

export interface Translations {
  [key: string]: {
    en: string;
    vi: string;
  };
}

export const translations: Translations = {
  // Navigation - Điều hướng
  dashboard: { en: 'Dashboard', vi: 'Bảng điều khiển' },
  practice: { en: 'Practice', vi: 'Luyện tập' },
  mockTests: { en: 'Mock Tests', vi: 'Thi thử' },
  results: { en: 'Results', vi: 'Kết quả' },
  testHistory: { en: 'Test History', vi: 'Lịch sử làm bài' },
  questionBank: { en: 'Question Bank', vi: 'Ngân hàng câu hỏi' },
  testManagement: { en: 'Test Management', vi: 'Quản lý đề thi' },
  
  // Page Subtitles - Phụ đề trang
  practiceMode: { en: 'Practice Mode', vi: 'Chế độ luyện tập' },
  practiceSubtitle: { en: 'Practice individual skills to improve your performance', vi: 'Luyện tập các kỹ năng riêng lẻ để cải thiện hiệu suất của bạn' },
  mockTestSubtitle: { en: 'Take full mock tests to simulate real exam conditions', vi: 'Làm bài thi thử đầy đủ để mô phỏng điều kiện thi thật' },
  resultsSubtitle: { en: 'Track your progress and analyze your performance', vi: 'Theo dõi tiến độ và phân tích hiệu suất của bạn' },
  testHistorySubtitle: { en: 'View your complete test and practice history', vi: 'Xem lịch sử thi và luyện tập đầy đủ của bạn' },
  questionBankSubtitle: { en: 'Manage your question collections and import new content', vi: 'Quản lý bộ sưu tập câu hỏi và nhập nội dung mới' },
  testManagementSubtitle: { en: 'Create and manage your test configurations', vi: 'Tạo và quản lý cấu hình bài thi của bạn' },
  
  // Dashboard - Bảng điều khiển
  welcomeBack: { en: 'Welcome back! Ready to practice?', vi: 'Chào mừng trở lại! Sẵn sàng luyện tập?' },
  totalPractice: { en: 'Total Practice', vi: 'Tổng luyện tập' },
  averageScore: { en: 'Average Score', vi: 'Điểm trung bình' },
  studyStreak: { en: 'Study Streak', vi: 'Chuỗi học tập' },
  quickActions: { en: 'Quick Actions', vi: 'Hành động nhanh' },
  recentTests: { en: 'Recent Tests', vi: 'Bài thi gần đây' },
  skillsProgress: { en: 'Skills Progress', vi: 'Tiến độ kỹ năng' },
  
  // Test Interface - Giao diện thi
  timeRemaining: { en: 'Time remaining', vi: 'Thời gian còn lại' },
  questionOf: { en: 'Question {current} of {total}', vi: 'Câu {current} trong {total}' },
  previous: { en: 'Previous', vi: 'Trước' },
  next: { en: 'Next', vi: 'Tiếp theo' },
  markForReview: { en: 'Mark for Review', vi: 'Đánh dấu' },
  questionNavigator: { en: 'Question Navigator', vi: 'Điều hướng câu hỏi' },
  startTest: { en: 'Start Test', vi: 'Bắt đầu làm bài' },
  startMockTest: { en: 'Start Mock Test', vi: 'Bắt đầu thi thử' },
  testAlreadyCompleted: { en: 'Test Already Completed', vi: 'Bài thi đã hoàn thành' },
  testCompletedMessage: { en: 'You have already completed this test. You cannot retake it.', vi: 'Bạn đã hoàn thành bài thi này. Bạn không thể làm lại.' },
  
  // Skills - Kỹ năng
  reading: { en: 'Reading', vi: 'Đọc hiểu' },
  listening: { en: 'Listening', vi: 'Nghe hiểu' },
  grammar: { en: 'Grammar', vi: 'Ngữ pháp' },
  vocabulary: { en: 'Vocabulary', vi: 'Từ vựng' },
  writing: { en: 'Writing', vi: 'Viết' },
  speaking: { en: 'Speaking', vi: 'Nói' },
  
  // Question Management - Quản lý câu hỏi
  question: { en: 'Question', vi: 'Câu' },
  questionContent: { en: 'Question Content', vi: 'Nội dung câu hỏi' },
  optionA: { en: 'Option A', vi: 'Đáp án A' },
  optionB: { en: 'Option B', vi: 'Đáp án B' },
  optionC: { en: 'Option C', vi: 'Đáp án C' },
  optionD: { en: 'Option D', vi: 'Đáp án D' },
  correctAnswer: { en: 'Correct Answer', vi: 'Đáp án đúng' },
  explanation: { en: 'Explanation', vi: 'Giải thích' },
  explanationOptional: { en: 'Explanation (optional)', vi: 'Giải thích (tuỳ chọn)' },
  addQuestion: { en: 'Add Question', vi: 'Thêm câu hỏi' },
  existingQuestions: { en: 'Existing Questions', vi: 'Danh sách câu hỏi có sẵn' },
  loadingQuestions: { en: 'Loading questions...', vi: 'Đang tải danh sách câu hỏi...' },
  noQuestionsYet: { en: 'No questions in the question bank yet', vi: 'Chưa có câu hỏi nào trong ngân hàng' },
  
  // Question Bank Management - Quản lý ngân hàng câu hỏi
  startAptis: { en: 'Start APTIS Practice', vi: 'Bắt đầu luyện tập APTIS' },
  startPracticingNow: { en: 'Start practicing', vi: 'Bắt đầu luyện tập' },
  createQuestionBank: { en: 'Create Question Bank', vi: 'Tạo ngân hàng câu hỏi' },
  createNewQuestionBank: { en: 'Create New Question Bank', vi: 'Tạo ngân hàng câu hỏi mới' },
  questionBankName: { en: 'Name', vi: 'Tên' },
  questionBankDescription: { en: 'Description', vi: 'Mô tả' },
  examDuration: { en: 'Exam Duration (minutes)', vi: 'Thời gian làm bài (phút)' },
  examDurationRequired: { en: 'Exam duration is required', vi: 'Thời gian làm bài là bắt buộc' },
  nameRequired: { en: 'Name is required', vi: 'Tên là bắt buộc' },
  selectTestType: { en: 'Select test type', vi: 'Chọn loại bài thi' },
  selectSkill: { en: 'Select skill', vi: 'Chọn kỹ năng' },
  manageCollections: { en: 'Manage your question collections and import new content', vi: 'Quản lý bộ sưu tập câu hỏi và nhập nội dung mới' },
  searchQuestionBanks: { en: 'Search question banks...', vi: 'Tìm kiếm ngân hàng câu hỏi...' },
  allTypes: { en: 'All Types', vi: 'Tất cả loại' },
  allSkills: { en: 'All Skills', vi: 'Tất cả kỹ năng' },
  questions: { en: 'questions', vi: 'câu hỏi' },
  noQuestionBanksYet: { en: 'No question banks yet', vi: 'Chưa có ngân hàng câu hỏi' },
  noQuestionBanksMatch: { en: 'No question banks match your filters', vi: 'Không có ngân hàng câu hỏi nào phù hợp với bộ lọc' },
  createFirstQuestionBank: { en: 'Create your first question bank to get started', vi: 'Tạo ngân hàng câu hỏi đầu tiên để bắt đầu' },
  adjustFilters: { en: 'Try adjusting your search terms or filters', vi: 'Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc' },
  deleteConfirmation: { en: 'Delete Confirmation', vi: 'Xác nhận xóa' },
  deleteQuestionBankMessage: { en: 'Are you sure you want to delete question bank "{name}"?\\nAll questions in this bank will also be deleted.\\nThis action cannot be undone.', vi: 'Bạn có chắc chắn muốn xóa ngân hàng câu hỏi "{name}"?\\nTất cả câu hỏi trong ngân hàng này cũng sẽ bị xóa.\\nHành động này không thể hoàn tác.' },
  deleting: { en: 'Deleting...', vi: 'Đang xóa...' },
  
  // Test History - Lịch sử làm bài
  noHistoryYet: { en: 'No test history yet', vi: 'Chưa có lịch sử thi' },
  startPracticing: { en: 'Start practicing to see your progress here', vi: 'Bắt đầu luyện tập để xem tiến độ của bạn tại đây' },
  noMockTestsYet: { en: 'No mock tests completed yet', vi: 'Chưa hoàn thành bài thi thử nào' },
  takeMockTest: { en: 'Take your first mock test to track your performance', vi: 'Làm bài thi thử đầu tiên để theo dõi hiệu suất của bạn' },
  totalTests: { en: 'Total Tests', vi: 'Tổng số bài thi' },
  bestScore: { en: 'Best Score', vi: 'Điểm cao nhất' },
  completedOn: { en: 'Completed on', vi: 'Hoàn thành vào' },
  score: { en: 'Score', vi: 'Điểm' },
  viewDetails: { en: 'View Details', vi: 'Xem chi tiết' },
  
  // Import - Nhập dữ liệu
  importQuestions: { en: 'Import Questions', vi: 'Nhập câu hỏi' },
  selectFile: { en: 'Select File', vi: 'Chọn tệp' },
  fileFormat: { en: 'File Format', vi: 'Định dạng tệp' },
  testType: { en: 'Test Type', vi: 'Loại bài thi' },
  skillCategory: { en: 'Skill Category', vi: 'Kỹ năng' },
  importSuccess: { en: 'Import successful', vi: 'Nhập thành công' },
  
  // Common Actions - Hành động chung
  save: { en: 'Save', vi: 'Lưu' },
  saving: { en: 'Saving...', vi: 'Đang lưu...' },
  delete: { en: 'Delete', vi: 'Xóa' },
  edit: { en: 'Edit', vi: 'Chỉnh sửa' },
  create: { en: 'Create', vi: 'Tạo' },
  submit: { en: 'Submit', vi: 'Nộp bài' },
  cancel: { en: 'Cancel', vi: 'Hủy' },
  loading: { en: 'Loading...', vi: 'Đang tải...' },
  error: { en: 'Error', vi: 'Lỗi' },
  success: { en: 'Success', vi: 'Thành công' },
  createdSuccessfully: { en: 'Created successfully', vi: 'Tạo thành công' },
  errorOccurred: { en: 'An error occurred', vi: 'Đã xảy ra lỗi' },
  deletedSuccessfully: { en: 'Deleted successfully', vi: 'Xóa thành công' },
  
  // Authentication - Xác thực
  signIn: { en: 'Sign in', vi: 'Đăng nhập' },
  signInSubtitle: { en: 'Sign in to continue your learning journey', vi: 'Đăng nhập để tiếp tục hành trình học tập của bạn' },
  signingIn: { en: 'Signing in...', vi: 'Đang đăng nhập...' },
  username: { en: 'Username', vi: 'Tên đăng nhập' },
  password: { en: 'Password', vi: 'Mật khẩu' },
  enterUsername: { en: 'Enter your username', vi: 'Nhập tên đăng nhập' },
  enterPassword: { en: 'Enter your password', vi: 'Nhập mật khẩu' },
  enterBothCredentials: { en: 'Please enter both username and password', vi: 'Vui lòng nhập cả tên đăng nhập và mật khẩu' },
  registering: { en: 'Registering...', vi: 'Đang đăng ký...' },
  email: { en: 'Email', vi: 'Email' },
  fullName: { en: 'Full Name', vi: 'Họ và tên' },
  registrationSuccessful: { en: 'Registration successful', vi: 'Đăng ký thành công' },
  registrationFailed: { en: 'Registration failed', vi: 'Đăng ký thất bại' },
  loginSuccessful: { en: 'Login successful', vi: 'Đăng nhập thành công' },
  loginFailed: { en: 'Login failed', vi: 'Đăng nhập thất bại' },
  missingInformation: { en: 'Missing information', vi: 'Thiếu thông tin' },
  welcomeBackTitle: { en: 'Welcome back', vi: 'Chào mừng trở lại' },
  welcome: { en: 'Welcome', vi: 'Chào mừng' },
  signUp: { en: 'Sign up', vi: 'Đăng ký' },
  register: { en: 'Register', vi: 'Đăng ký' },
  noAccount: { en: "Don't have an account?", vi: 'Chưa có tài khoản?' },
  haveAccount: { en: 'Already have an account?', vi: 'Đã có tài khoản?' },
  
  // Test Management - Quản lý bài thi
  createTest: { en: 'Create Test', vi: 'Tạo bài thi' },
  failedToCreateTest: { en: 'Failed to create test', vi: 'Tạo bài thi thất bại' },
  testName: { en: 'Test Name', vi: 'Tên bài thi' },
  testDescription: { en: 'Test Description', vi: 'Mô tả bài thi' },
  isActive: { en: 'Active', vi: 'Kích hoạt' },
  inactive: { en: 'Inactive', vi: 'Không kích hoạt' },
  testCreatedSuccessfully: { en: 'Test created successfully', vi: 'Tạo bài thi thành công' },
  testUpdatedSuccessfully: { en: 'Test updated successfully', vi: 'Cập nhật bài thi thành công' },
  failedToUpdateTest: { en: 'Failed to update test', vi: 'Cập nhật bài thi thất bại' },
  testDeletedSuccessfully: { en: 'Test deleted successfully', vi: 'Xóa bài thi thành công' },
  failedToDeleteTest: { en: 'Failed to delete test', vi: 'Xóa bài thi thất bại' },
  testDuplicatedSuccessfully: { en: 'Test duplicated successfully', vi: 'Sao chép bài thi thành công' },
  failedToDuplicateTest: { en: 'Failed to duplicate test', vi: 'Sao chép bài thi thất bại' },
  fillAllRequiredFields: { en: 'Please fill in all required fields', vi: 'Vui lòng điền tất cả các trường bắt buộc' },
  invalidNumbers: { en: 'Time limit and total questions must be valid positive numbers', vi: 'Giới hạn thời gian và tổng số câu hỏi phải là số dương hợp lệ' },
  deleteTestMessage: { en: 'Are you sure you want to delete test "{name}"? This action cannot be undone.', vi: 'Bạn có chắc chắn muốn xóa bài thi "{name}"? Hành động này không thể hoàn tác.' },
  
  // Form Fields & Placeholders - Trường biểu mẫu & Placeholder
  selectQuestionBank: { en: 'Select question bank', vi: 'Chọn ngân hàng câu hỏi' },
  timeLimitMinutes: { en: 'Time Limit (minutes)', vi: 'Giới hạn thời gian (phút)' },
  timeLimitRequired: { en: 'Time limit is required', vi: 'Giới hạn thời gian là bắt buộc' },
  totalQuestions: { en: 'Total Questions', vi: 'Tổng số câu hỏi' },
  totalQuestionsRequired: { en: 'Total questions is required', vi: 'Tổng số câu hỏi là bắt buộc' },
  makeTestActiveImmediately: { en: 'Make test active immediately', vi: 'Kích hoạt bài thi ngay lập tức' },
  
  // Test Types & Status - Loại bài thi & Trạng thái
  aptisEsol: { en: 'APTIS ESOL', vi: 'APTIS ESOL' },
  vstep: { en: 'VSTEP', vi: 'VSTEP' },
  custom: { en: 'Custom', vi: 'Tùy chỉnh' },
  allStatus: { en: 'All Status', vi: 'Tất cả trạng thái' },
  active: { en: 'Active', vi: 'Đang hoạt động' },
  
  // Empty States - Trạng thái trống
  noTests: { en: 'No tests yet', vi: 'Chưa có bài thi nào' },
  noTestsMatch: { en: 'No tests match your filters', vi: 'Không có bài thi nào phù hợp với bộ lọc' },
  createFirstTest: { en: 'Create your first test to get started', vi: 'Tạo bài thi đầu tiên để bắt đầu' },
  
  // Dashboard Actions - Hành động trên bảng điều khiển
  vstepMockTest: { en: 'VSTEP Mock Test', vi: 'Thi thử VSTEP' },
  fullSkillsAssessment: { en: 'Full 4 skills assessment', vi: 'Đánh giá đầy đủ 4 kỹ năng' },
  grammarVocabSkills: { en: 'Grammar, vocabulary & skills', vi: 'Ngữ pháp, từ vựng & kỹ năng' },
  wordExcelFormats: { en: 'Word/Excel formats', vi: 'Định dạng Word/Excel' },
  viewProgress: { en: 'View Progress', vi: 'Xem tiến độ' },
  detailedAnalytics: { en: 'Detailed analytics', vi: 'Phân tích chi tiết' },
  languageTestingPlatform: { en: 'Language Testing Platform', vi: 'Nền tảng kiểm tra ngôn ngữ' },
  alreadycompletedTest: { en: 'You have already completed this test', vi: 'Bạn đã làm bài thi này rồi' },
  
  // Additional Messages & Notifications - Thông báo & tin nhắn bổ sung
  questionBankDeleted: { en: 'Question bank and all related questions have been deleted', vi: 'Ngân hàng câu hỏi và tất cả câu hỏi liên quan đã được xóa' },
  noResponseFromServer: { en: 'No response received from server', vi: 'Không nhận được phản hồi từ máy chủ' },
  deleteErrorMessage: { en: 'Could not delete question bank. Please try again later.', vi: 'Không thể xóa ngân hàng câu hỏi. Vui lòng thử lại sau.' },
  
  // Dashboard Statistics - Thống kê bảng điều khiển
  vsLastWeek: { en: 'vs last week', vi: 'so với tuần trước' },
  completed: { en: 'completed', vi: 'đã hoàn thành' },
  improvement: { en: 'improvement', vi: 'cải thiện' },
  keepItUp: { en: 'Keep it up!', vi: 'Tiếp tục phát huy!' },
  days: { en: 'days', vi: 'ngày' },
  viewAll: { en: 'View All', vi: 'Xem tất cả' },
  viewAllArrow: { en: 'View All →', vi: 'Xem tất cả →' },
  recommendation: { en: 'Recommendation', vi: 'Khuyến nghị' },
  viewResults: { en: 'View Results', vi: 'Xem kết quả' },
  practiceMore: {en: 'Practice More', vi: 'Luyện tập thêm' },
  focusVocabularyPractice: { en: 'Focus on vocabulary practice to improve overall performance.', vi: 'Tập trung luyện tập từ vựng để cải thiện hiệu suất tổng thể.' },
  
  // Common UI Elements - Các thành phần giao diện chung
  minutes: { en: 'minutes', vi: 'phút' },
  min: { en: 'min', vi: 'phút' },
  questionsCount: { en: 'questions', vi: 'câu hỏi' },
  practiceNow: { en: 'Practice Now', vi: 'Luyện tập ngay' },
  manageQuestionBanks: { en: 'Manage Question Banks', vi: 'Quản lý ngân hàng câu hỏi' },
  manageTests: { en: 'Manage Tests', vi: 'Quản lý bài thi' },
  timeLimit: { en: 'Time Limit', vi: 'Giới hạn thời gian' },
  
  // Results & Analytics - Kết quả & phân tích
  overview: { en: 'Overview', vi: 'Tổng quan' },
  detailedResults: { en: 'Detailed Results', vi: 'Kết quả chi tiết' },
  analytics: { en: 'Analytics', vi: 'Phân tích' },
  vsLastMonth: { en: 'vs last month', vi: 'so với tháng trước' },
  timeSpent: { en: 'Time Spent', vi: 'Thời gian dành' },
  
  // Test History - Lịch sử thi
  totalTestsCompleted: { en: 'Total Tests Completed', vi: 'Tổng số bài thi đã hoàn thành' },
  practiceSessions: { en: 'Practice Sessions', vi: 'Phiên luyện tập' },
  all: { en: 'All', vi: 'Tất cả' },
  mockTestsOnly: { en: 'Mock Tests', vi: 'Thi thử' },
  
  // Search & Filter - Tìm kiếm & lọc
  searchTests: { en: 'Search tests...', vi: 'Tìm kiếm bài thi...' },
  view: { en: 'View', vi: 'Xem' },
  
  // Results specific - Dành riêng cho kết quả
  viewAllResults: { en: 'View All Results', vi: 'Xem tất cả kết quả' },
  allTestResults: { en: 'All Test Results', vi: 'Tất cả kết quả bài thi' },
  noResultsYet: { en: 'No results yet', vi: 'Chưa có kết quả nào' },
  startMockTestNow: { en: 'Start your first mock test to see results here', vi: 'Bắt đầu bài thi thử đầu tiên của bạn để xem kết quả tại đây' },
  
  // Anti-cheat - Chống gian lận
  monitoringActive: { en: 'Monitoring Active', vi: 'Đang giám sát' },
  tabSwitches: { en: 'Tab switches:', vi: 'Chuyển tab:' },
  warnings: { en: 'Warnings:', vi: 'Cảnh báo:' },
  
  // Difficulty Levels & Learning Stages - Cấp độ khó và giai đoạn học tập
  easy: { en: 'Easy', vi: 'Dễ' },
  medium: { en: 'Medium', vi: 'Trung bình' },
  hard: { en: 'Hard', vi: 'Khó' },
  mixedDifficulty: { en: 'Mixed difficulty levels', vi: 'Các cấp độ khó khác nhau' },
  mixedDifficultyLevels: { en: 'Mixed difficulty levels', vi: 'Cấp độ khó hỗn hợp' },
  advanced: { en: 'Advanced', vi: 'Nâng cao' },
  intermediate: { en: 'Intermediate', vi: 'Trung cấp' },
  beginner: { en: 'Beginner', vi: 'Người mới bắt đầu' },
  elementary: { en: 'Elementary', vi: 'Cơ bản' },
  fundamental: { en: 'Fundamental', vi: 'Nền tảng' },
  essential: { en: 'Essential', vi: 'Thiết yếu' },
  critical: { en: 'Critical', vi: 'Quan trọng' },
  
  // Performance & Assessment - Hiệu suất và đánh giá
  overallPerformance: { en: 'Overall Performance', vi: 'Hiệu suất tổng thể' },
  performanceTrend: { en: 'Performance Trend', vi: 'Xu hướng hiệu suất' },
  performanceChart: { en: 'Performance chart would be displayed here', vi: 'Biểu đồ hiệu suất sẽ được hiển thị ở đây' },
  comprehensiveAssessment: { en: 'Comprehensive Assessment', vi: 'Đánh giá toàn diện' },
  evaluation: { en: 'Evaluation', vi: 'Đánh giá' },
  analysisReport: { en: 'Analysis', vi: 'Phân tích' },
  skillDistribution: { en: 'Skill Distribution', vi: 'Phân bố kỹ năng' },
  
  // Professional & Academic Terms - Thuật ngữ chuyên môn và học thuật
  proficiency: { en: 'Proficiency', vi: 'Thành thạo' },
  expertise: { en: 'Expertise', vi: 'Chuyên môn' },
  mastery: { en: 'Mastery', vi: 'Làm chủ' },
  excellence: { en: 'Excellence', vi: 'Xuất sắc' },
  sophisticated: { en: 'Sophisticated', vi: 'Tinh vi' },
  rigorous: { en: 'Rigorous', vi: 'Nghiêm ngặt' },
  intensive: { en: 'Intensive', vi: 'Tích cực' },
  thorough: { en: 'Thorough', vi: 'Kỹ lưỡng' },
  precision: { en: 'Precision', vi: 'Chính xác' },
  accuracy: { en: 'Accuracy', vi: 'Độ chính xác' },
  
  // Achievement & Success - Thành tựu và thành công
  achievement: { en: 'Achievement', vi: 'Thành tựu' },
  accomplishment: { en: 'Accomplishment', vi: 'Thành tích' },
  outstanding: { en: 'Outstanding', vi: 'Xuất sắc' },
  exceptional: { en: 'Exceptional', vi: 'Đặc biệt' },
  remarkable: { en: 'Remarkable', vi: 'Đáng chú ý' },
  magnificent: { en: 'Magnificent', vi: 'Tuyệt vời' },
  brilliant: { en: 'Brilliant', vi: 'Xuất sắc' },
  incredible: { en: 'Incredible', vi: 'Không thể tin được' },
  phenomenal: { en: 'Phenomenal', vi: 'Phi thường' },
  spectacular: { en: 'Spectacular', vi: 'Ngoạn mục' },
  impressive: { en: 'Impressive', vi: 'Ấn tượng' },
  
  // Development & Innovation - Phát triển và đổi mới
  optimization: { en: 'Optimization', vi: 'Tối ưu hóa' },
  enhancement: { en: 'Enhancement', vi: 'Nâng cao' },
  advancement: { en: 'Advancement', vi: 'Tiến bộ' },
  progression: { en: 'Progression', vi: 'Tiến triển' },
  innovation: { en: 'Innovation', vi: 'Đổi mới' },
  creativity: { en: 'Creativity', vi: 'Sáng tạo' },
  originality: { en: 'Originality', vi: 'Tính độc đáo' },
  demonstration: { en: 'Demonstration', vi: 'Trình diễn' },
  implementation: { en: 'Implementation', vi: 'Triển khai' },
  transformation: { en: 'Transformation', vi: 'Chuyển đổi' },
  
  // Skills & Abilities - Kỹ năng và khả năng
  resilience: { en: 'Resilience', vi: 'Khả năng phục hồi' },
  adaptability: { en: 'Adaptability', vi: 'Khả năng thích ứng' },
  flexibility: { en: 'Flexibility', vi: 'Tính linh hoạt' },
  versatility: { en: 'Versatility', vi: 'Tính đa năng' },
  capability: { en: 'Capability', vi: 'Khả năng' },
  competence: { en: 'Competence', vi: 'Năng lực' },
  professionalism: { en: 'Professionalism', vi: 'Tính chuyên nghiệp' },
  systematic: { en: 'Systematic', vi: 'Có hệ thống' },
  methodical: { en: 'Methodical', vi: 'Có phương pháp' },
  strategic: { en: 'Strategic', vi: 'Chiến lược' },
  tactical: { en: 'Tactical', vi: 'Chiến thuật' },
  
  // Technical & Academic Terms - Thuật ngữ kỹ thuật và học thuật
  simulation: { en: 'Simulation', vi: 'Mô phỏng' },
  realExamConditions: { en: 'real exam conditions', vi: 'điều kiện thi thật' },
  simulateRealExamConditions: { en: 'simulate real exam conditions', vi: 'mô phỏng điều kiện thi thật' },
  efficient: { en: 'Efficient', vi: 'Hiệu quả' },
  effective: { en: 'Effective', vi: 'Có hiệu lực' },
  productive: { en: 'Productive', vi: 'Năng suất' },
  successful: { en: 'Successful', vi: 'Thành công' },
  optimal: { en: 'Optimal', vi: 'Tối ưu' },
  superior: { en: 'Superior', vi: 'Vượt trội' },
  significant: { en: 'Significant', vi: 'Có ý nghĩa' },
  valuable: { en: 'Valuable', vi: 'Có giá trị' },
  beneficial: { en: 'Beneficial', vi: 'Có lợi' },
  useful: { en: 'Useful', vi: 'Hữu ích' },
  practical: { en: 'Practical', vi: 'Thực tế' },
  applicable: { en: 'Applicable', vi: 'Có thể áp dụng' },
  
  // Test Instructions & Actions - Hướng dẫn và hành động thi
  closeUnnecessaryTabs: { en: 'Close unnecessary browser tabs and applications', vi: 'Đóng các tab trình duyệt và ứng dụng không cần thiết' },
  markForReviewDifficult: { en: 'Use the mark for review feature for difficult questions', vi: 'Sử dụng tính năng đánh dấu để xem lại cho các câu hỏi khó' },
  difficultQuestions: { en: 'difficult questions', vi: 'các câu hỏi khó' },
  browserTabs: { en: 'browser tabs', vi: 'tab trình duyệt' },
  applications: { en: 'applications', vi: 'ứng dụng' },
  unnecessary: { en: 'unnecessary', vi: 'không cần thiết' },
  feature: { en: 'feature', vi: 'tính năng' },
  
  // Success Messages - Thông báo thành công
  testStartedSuccessfully: { en: 'Test started successfully', vi: 'Bài thi đã bắt đầu thành công' },
  testCompletedSuccessfully: { en: 'Test completed successfully', vi: 'Bài thi đã hoàn thành thành công' },
  questionsRecreatedSuccessfully: { en: 'Questions recreated successfully. Please refresh.', vi: 'Câu hỏi đã được tạo lại thành công. Vui lòng làm mới trang.' },
  questionsSavedSuccessfully: { en: 'Questions saved successfully', vi: 'Câu hỏi đã được lưu thành công' },
  
  // Practice Result - Kết quả luyện tập
  practiceAgain: { en: 'Practice Again', vi: 'Luyện tập lại' },
  performanceSummary: { en: 'Performance Summary', vi: 'Tóm tắt hiệu suất' },
  excellentWork: { en: "Excellent work! You've demonstrated strong mastery of this skill area.", vi: 'Làm rất tốt! Bạn đã thể hiện sự thành thạo mạnh mẽ trong lĩnh vực kỹ năng này.' },
  goodEffort: { en: "Good effort! You're on the right track, but there's room for improvement.", vi: 'Nỗ lực tốt! Bạn đang đi đúng hướng, nhưng vẫn còn chỗ để cải thiện.' },
  keepPracticing: { en: 'Keep practicing! Focus on understanding the fundamental concepts in this area.', vi: 'Hãy tiếp tục luyện tập! Tập trung vào việc hiểu các khái niệm cơ bản trong lĩnh vực này.' },
  focusOnFundamentals: { en: 'Focus on {skill} fundamentals and practice regularly to improve your accuracy.', vi: 'Tập trung vào kiến thức cơ bản về {skill} và luyện tập thường xuyên để cải thiện độ chính xác.' },
  continuePracticing: { en: 'Continue practicing {skill} to maintain and further improve your performance.', vi: 'Tiếp tục luyện tập {skill} để duy trì và cải thiện hơn nữa hiệu suất của bạn.' },
  viewQuestionAnalysis: { en: 'View Question-by-Question Analysis', vi: 'Xem phân tích từng câu hỏi' },
  loadingDetailedResults: { en: 'Loading detailed results...', vi: 'Đang tải kết quả chi tiết...' },
  yourAnswer: { en: 'Your answer', vi: 'Câu trả lời của bạn' },
  correct: { en: 'Correct', vi: 'Đúng' },
  practiceResultNotFound: { en: 'Practice result not found', vi: 'Không tìm thấy kết quả luyện tập' },
  
  // Anti-Cheat System - Hệ thống chống gian lận
  fullscreenRequired: { en: 'Fullscreen Mode Required', vi: 'Yêu cầu chế độ toàn màn hình' },
  fullscreenMessage: { en: 'This test requires fullscreen mode. Please click Enter Fullscreen to continue.', vi: 'Bài thi này yêu cầu chế độ toàn màn hình. Vui lòng nhấp vào Vào chế độ toàn màn hình để tiếp tục.' },
  enterFullscreen: { en: 'Enter Fullscreen', vi: 'Vào chế độ toàn màn hình' },
  exitFullscreen: { en: 'Exit Fullscreen', vi: 'Thoát chế độ toàn màn hình' },
  fullscreenNotSupported: { en: 'Fullscreen mode is not supported in your browser', vi: 'Chế độ toàn màn hình không được hỗ trợ trong trình duyệt của bạn' },
  
  // Violation Messages - Thông báo vi phạm
  testTerminated: { en: 'Test Terminated', vi: 'Bài thi đã kết thúc' },
  violationDetected: { en: 'Violation Detected', vi: 'Phát hiện vi phạm' },
  testTerminatedDueToViolation: { en: 'Your test has been terminated due to a violation of exam rules.', vi: 'Bài thi của bạn đã bị kết thúc do vi phạm quy chế thi.' },
  finalScore: { en: 'Final Score: 0/10', vi: 'Điểm cuối cùng: 0/10' },
  violationReason: { en: 'Violation Reason', vi: 'Lý do vi phạm' },
  
  // Specific Violation Types - Các loại vi phạm cụ thể
  fullscreenViolation: { en: 'You exited fullscreen mode during the test', vi: 'Bạn đã thoát khỏi chế độ toàn màn hình trong khi làm bài' },
  tabSwitchViolation: { en: 'You switched to another tab or window during the test', vi: 'Bạn đã chuyển sang tab hoặc cửa sổ khác trong khi làm bài' },
  developerToolsViolation: { en: 'You attempted to open developer tools during the test', vi: 'Bạn đã cố gắng mở công cụ phát triển trong khi làm bài' },
  contextMenuViolation: { en: 'You attempted to access the context menu during the test', vi: 'Bạn đã cố gắng truy cập menu ngữ cảnh trong khi làm bài' },
  keyboardShortcutViolation: { en: 'You used prohibited keyboard shortcuts during the test', vi: 'Bạn đã sử dụng phím tắt bị cấm trong khi làm bài' },
  windowBlurViolation: { en: 'You switched focus away from the test window', vi: 'Bạn đã chuyển tiêu điểm khỏi cửa sổ làm bài' },
  
  // Anti-Cheat Instructions - Hướng dẫn chống gian lận
  examRules: { en: 'Exam Rules', vi: 'Quy chế thi' },
  examRulesDescription: { en: 'Please read and follow these rules during your test:', vi: 'Vui lòng đọc và tuân thủ những quy tắc này trong khi làm bài:' },
  mustStayFullscreen: { en: 'You must remain in fullscreen mode throughout the entire test', vi: 'Bạn phải ở trong chế độ toàn màn hình trong suốt quá trình làm bài' },
  noTabSwitching: { en: 'Do not switch to other tabs or applications', vi: 'Không chuyển sang tab hoặc ứng dụng khác' },
  noDeveloperTools: { en: 'Do not attempt to open developer tools or inspect elements', vi: 'Không cố gắng mở công cụ phát triển hoặc kiểm tra phần tử' },
  noRightClick: { en: 'Right-clicking is disabled during the test', vi: 'Nhấp chuột phải bị vô hiệu hóa trong khi làm bài' },
  violationWarning: { en: 'Any violation of these rules will result in immediate test termination with a score of 0', vi: 'Bất kỳ vi phạm nào đối với những quy tắc này sẽ dẫn đến việc kết thúc bài thi ngay lập tức với điểm số 0' },
  iUnderstand: { en: 'I understand and agree to follow these rules', vi: 'Tôi hiểu và đồng ý tuân thủ những quy tắc này' },
  
  // Anti-Cheat Monitoring - Giám sát chống gian lận
  antiCheatActive: { en: 'Anti-cheat monitoring is active', vi: 'Giám sát chống gian lận đang hoạt động' },
  suspiciousActivity: { en: 'Suspicious activity detected', vi: 'Phát hiện hoạt động đáng ngờ' },
  activityMonitored: { en: 'Your activity is being monitored for security purposes', vi: 'Hoạt động của bạn đang được giám sát vì mục đích bảo mật' },
};