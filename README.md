# CodeSnippets - Your Personal Code Library

A modern web application for storing, managing, and sharing code snippets. Built with Next.js 15+, TypeScript, and MongoDB.

## 🚀 Features

### Authentication & Security
- ✅ JWT-based authentication with cookie secure handling
- ✅ Protected API routes with middleware validation
- ✅ Secure password handling with bcrypt
- ✅ Token-based session management
- ✅ HTTP-only cookies for enhanced security
- ✅ Rate limiting protection
- ✅ Edge runtime support for auth routes

### Snippet Management
- ✅ Create, edit, and delete code snippets
- ✅ Advanced code editor with CodeMirror 6
- ✅ Multiple language support with syntax highlighting
- ✅ Folder organization system
- ✅ Tag-based categorization
- ✅ Public/Private visibility controls
- ✅ Snippet forking capability
- ✅ Snippet embedding system
- ✅ Favorites and pinned snippets
- ✅ Analytics tracking
- ✅ Comment system with likes

### Social Features
- ✅ User feed with activity updates
- ✅ Follow/Unfollow system
- ✅ User profiles with customization
- ✅ Leaderboard system
- ✅ Real-time notifications
- ✅ Comment threads and discussions
- ✅ Like system for snippets and comments

### Achievement System
- ✅ Dynamic achievement tracking
- ✅ Multiple achievement categories
- ✅ Real-time progress updates
- ✅ Achievement notifications
- ✅ Daily streak tracking
- ✅ User analytics integration

### User Experience
- ✅ Responsive design with Tailwind CSS
- ✅ Dark/Light theme switching
- ✅ Toast notification system
- ✅ Loading states and animations
- ✅ Real-time updates with SSE
- ✅ Mobile-friendly interface
- ✅ Command palette for quick actions
- ✅ Breadcrumb navigation

## 🛠️ Tech Stack

- **Frontend**: 
  - Next.js 15.1.7
  - TypeScript 5
  - Tailwind CSS 3.4
  - Shadcn UI Components
  - CodeMirror 6
  - Framer Motion 12.4

- **Backend**: 
  - Next.js API Routes
  - MongoDB with Mongoose 8.10
  - JWT Authentication
  - Server-Sent Events (SSE)
  - Edge Runtime Support
  - Rate Limiting

- **Features**: 
  - Real-time notifications
  - Social interactions
  - Achievement system
  - Analytics tracking
  - File management
  - Code embedding

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/shreejaybhay/snippets.git
   cd snippets
   ```

2. **Environment Setup**
   Create a `.env.local` file:
   ```env
   MONGODB_URL=your_mongodb_connection_string
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   JWT_KEY=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Installation**
   ```bash
   npm install
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

## 🔧 Development

- **Running Development Server**
  ```bash
  npm run dev
  ```

- **Building for Production**
  ```bash
  npm run build
  ```

- **Linting**
  ```bash
  npm run lint
  ```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                 # API routes
│   │   ├── achievements/    # Achievement endpoints
│   │   ├── analytics/       # Analytics tracking
│   │   ├── auth/           # Authentication
│   │   ├── feed/           # User feed
│   │   ├── folders/        # Folder management
│   │   ├── leaderboard/    # Leaderboard system
│   │   ├── notifications/  # Real-time notifications
│   │   ├── snippet/        # Snippet operations
│   │   └── users/          # User management
│   ├── dashboard/          # Dashboard pages
│   ├── learn/             # Learning resources
│   ├── login/             # Authentication pages
│   └── signup/            # Registration pages
├── components/
│   ├── ui/                # Reusable UI components
│   └── [feature]/         # Feature-specific components
├── config/                # Configuration files
├── hooks/                # Custom React hooks
├── lib/                  # Core utilities
├── models/               # MongoDB schemas
├── services/             # Business logic
├── types/                # TypeScript definitions
└── utils/                # Helper functions
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.


