# Online Exam Website

> **Hệ thống thi trực tuyến với tính năng anti-cheat và quản lý câu hỏi thông minh**

Một ứng dụng web full-stack được xây dựng với React + TypeScript + Express + PostgreSQL, cung cấp nền tảng thi trực tuyến chuyên nghiệp với các tính năng bảo mật cao.

## 🎯 Tính năng chính

- **🔐 Hệ thống xác thực**: Đăng ký/đăng nhập người dùng
- **📚 Quản lý ngân hàng câu hỏi**: Import/Export từ Word, Excel
- **🏃‍♂️ Chế độ luyện tập**: Luyện tập theo kỹ năng riêng lẻ
- **🎓 Thi thử Mock Test**: Mô phỏng điều kiện thi thật
- **🛡️ Anti-cheat system**: Fullscreen bắt buộc, theo dõi hành vi
- **📊 Phân tích kết quả**: Báo cáo chi tiết theo từng kỹ năng
- **🌐 Đa ngôn ngữ**: Hỗ trợ tiếng Việt và tiếng Anh
- **📱 Responsive**: Tương thích mọi thiết bị

## 🛠️ Tech Stack

### Frontend
- **React 18** với TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **TanStack Query** - Data fetching
- **Wouter** - Routing
- **Framer Motion** - Animations

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **Express Session** - Authentication
- **Multer** - File upload

## 📋 Yêu cầu hệ thống

### Phần mềm cần thiết:
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14.0
- **Git** (để clone repository)

### Hệ điều hành hỗ trợ:
- Windows 10/11
- macOS 10.15+
- Ubuntu 20.04+

## 🚀 Hướng dẫn cài đặt

### Bước 1: Cài đặt Node.js

#### Windows:
1. Truy cập [nodejs.org](https://nodejs.org/)
2. Tải phiên bản LTS (Long Term Support)
3. Chạy file `.msi` và làm theo hướng dẫn
4. Mở Command Prompt và kiểm tra:
```bash
node --version
npm --version
```

#### macOS:
```bash
# Sử dụng Homebrew (khuyến nghị)
brew install node

# Hoặc tải từ nodejs.org
```

#### Ubuntu/Linux:
```bash
# Cài đặt qua NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kiểm tra phiên bản
node --version
npm --version
```

### Bước 2: Cài đặt PostgreSQL

#### Windows:
1. Tải PostgreSQL từ [postgresql.org](https://www.postgresql.org/download/windows/)
2. Chạy installer và làm theo hướng dẫn
3. Ghi nhớ username/password cho database
4. Mở pgAdmin hoặc psql để kiểm tra

#### macOS:
```bash
# Sử dụng Homebrew
brew install postgresql@14
brew services start postgresql@14

# Tạo database user
createuser -s postgres
```

#### Ubuntu/Linux:
```bash
# Cài đặt PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Khởi động service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Tạo user và database
sudo -u postgres createuser --interactive
```

### Bước 3: Cài đặt Git

#### Windows:
1. Tải Git từ [git-scm.com](https://git-scm.com/)
2. Chạy installer với cài đặt mặc định

#### macOS:
```bash
# Git thường đã có sẵn, hoặc cài qua Homebrew
brew install git
```

#### Ubuntu/Linux:
```bash
sudo apt install git
```

## 💻 Thiết lập Project

### Bước 1: Clone Repository
```bash
# Clone project từ GitHub
git clone https://github.com/Asatakaku/online_exam_website.git

# Di chuyển vào thư mục project
cd online_exam_website
```

### Bước 2: Cài đặt Dependencies
```bash
# Cài đặt tất cả packages
npm install

# Đợi quá trình hoàn tất (có thể mất 2-5 phút)
```

### Bước 3: Cấu hình Database

#### Tạo Database:
```sql
-- Kết nối vào PostgreSQL
psql -U postgres

-- Tạo database mới
CREATE DATABASE online_exam_db;

-- Tạo user cho ứng dụng (tùy chọn)
CREATE USER exam_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE online_exam_db TO exam_user;

-- Thoát psql
\q
```

#### Cấu hình Environment Variables:
```bash
# Tạo file .env từ template
cp .env.example .env

# Hoặc tạo file .env mới
touch .env
```

Chỉnh sửa file `.env`:
```env
# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/online_exam_db"

# Session Secret (tạo random string)
SESSION_SECRET="your_super_secret_session_key_here"

# Server Configuration
PORT=5000
NODE_ENV=development

# Upload Configuration
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=10485760
```

### Bước 4: Chạy Database Migrations
```bash
# Push schema lên database
npm run db:push

# Kiểm tra kết nối database
npm run check
```

### Bước 5: Khởi chạy Development Server
```bash
# Chạy ở chế độ development
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:5000**

## 📁 Cấu trúc Project

```
online_exam_website/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities & configs
│   │   ├── pages/         # Page components
│   │   └── ...
│   └── index.html
├── server/                # Backend Express app
│   ├── api/              # API routes
│   ├── services/         # Business logic
│   ├── implements/       # Interfaces
│   └── index.ts          # Server entry point
├── shared/               # Shared code
│   └── schema.ts         # Database schema
├── uploads/              # File uploads
├── package.json          # Dependencies
├── drizzle.config.ts     # Database config
└── vite.config.ts        # Build config
```

## 🎮 Hướng dẫn sử dụng

### Tạo tài khoản đầu tiên:
1. Mở http://localhost:5000
2. Click "Đăng ký" 
3. Điền thông tin và tạo tài khoản
4. Đăng nhập với tài khoản vừa tạo

### Import câu hỏi:
1. Vào "Question Bank" → "Import Questions"
2. Tải file Word/Excel mẫu
3. Chỉnh sửa theo format và upload
4. Kiểm tra câu hỏi đã import

### Tạo bài thi:
1. Vào "Test Management"
2. Click "Create New Test"
3. Chọn question bank và cấu hình
4. Lưu bài thi

### Làm bài thi thử:
1. Vào "Mock Tests"
2. Chọn bài thi và click "Start"
3. **Lưu ý**: Hệ thống sẽ yêu cầu fullscreen
4. Hoàn thành bài thi và xem kết quả

## 🔧 Scripts có sẵn

```bash
# Development
npm run dev          # Chạy dev server với hot reload

# Production
npm run build        # Build project cho production
npm start           # Chạy production server

# Database
npm run db:push     # Đẩy schema lên database

# Testing
npm run check       # Kiểm tra TypeScript errors
```

## 🛡️ Tính năng Anti-cheat

### Các quy tắc được enforced:
- **Fullscreen bắt buộc**: Không thể thoát fullscreen
- **Chặn tab switching**: Phát hiện chuyển tab/cửa sổ
- **Vô hiệu hóa shortcuts**: F12, Ctrl+U, Ctrl+Shift+I...
- **Chặn right-click**: Không thể mở context menu
- **Theo dõi window focus**: Phát hiện mất focus

### Xử lý vi phạm:
- Tự động kết thúc bài thi
- Điểm số = 0
- Ghi lại lý do vi phạm
- Thông báo cảnh báo

## 🌐 API Endpoints

### Authentication:
- `POST /api/register` - Đăng ký
- `POST /api/login` - Đăng nhập
- `POST /api/logout` - Đăng xuất

### Tests:
- `GET /api/tests` - Lấy danh sách test
- `POST /api/tests` - Tạo test mới
- `DELETE /api/tests/:id` - Xóa test

### Test Sessions:
- `POST /api/test-sessions` - Bắt đầu session
- `PATCH /api/test-sessions/:id` - Cập nhật session
- `POST /api/test-sessions/:id/complete` - Hoàn thành
- `POST /api/test-sessions/terminate` - Kết thúc do vi phạm

## 🐛 Troubleshooting

### Lỗi thường gặp:

#### 1. Lỗi kết nối database:
```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Giải pháp:**
- Kiểm tra PostgreSQL đã chạy
- Xác minh DATABASE_URL trong .env
- Test kết nối: `psql -U postgres -d online_exam_db`

#### 2. Port đã được sử dụng:
```bash
Error: listen EADDRINUSE :::5000
```
**Giải pháp:**
- Thay đổi PORT trong .env
- Hoặc kill process: `killall -9 node`

#### 3. Dependencies conflicts:
```bash
npm ERR! peer dep missing
```
**Giải pháp:**
```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. TypeScript errors:
```bash
# Kiểm tra errors
npm run check

# Fix auto-fixable issues
npx tsc --noEmit
```

### Performance tuning:
- Sử dụng `npm ci` thay vì `npm install` trong production
- Enable gzip compression
- Optimize database indexes
- Use Redis for session store

## 📝 Contributing

### Quy trình phát triển:
1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

### Code style:
- Sử dụng TypeScript strict mode
- Follow ESLint rules
- Format với Prettier
- Viết tests cho features mới

## 📄 License

Project này được phân phối dưới **MIT License**. Xem file `LICENSE` để biết thêm chi tiết.

## 👥 Team

- **Developer**: [Asatakaku](https://github.com/Asatakaku)
- **Project Type**: Educational/Portfolio

## 🆘 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra phần Troubleshooting
2. Tạo Issue trên GitHub
3. Liên hệ developer

---

**Happy Coding! 🎉**