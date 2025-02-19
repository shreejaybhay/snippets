# CodeSnippets - Your Personal Code Library

A modern web application for storing, managing, and sharing code snippets. Built with Next.js, TypeScript, and MongoDB.

## 🚀 Features

- **Snippet Management**
  - Create, edit, and delete code snippets
  - Support for multiple programming languages with syntax highlighting
  - Add tags and descriptions for better organization
  - Public/Private snippet visibility options

- **User Experience**
  - Responsive design for desktop and mobile
  - Dark/Light mode support
  - Real-time code editor with syntax highlighting
  - Quick copy-to-clipboard functionality
  - Favorite snippets for quick access

- **Search & Organization**
  - Search through your snippets
  - Filter by programming language
  - Tag-based organization
  - Sort by creation date

## 🛠️ Tech Stack

- **Frontend**
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - Framer Motion
  - CodeMirror
  - Highlight.js

- **Backend**
  - MongoDB
  - Mongoose
  - Next.js API Routes

## 🚦 Getting Started

1. **Prerequisites**
   ```bash
   Node.js 18+ 
   MongoDB database
   ```

2. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URL=your_mongodb_connection_string
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   JWT_KEY=your_jwt_secret
   ```

3. **Installation**
   ```bash
   # Clone the repository
   git clone https://github.com/shreejaybhay/snippets.git

   # Install dependencies
   npm install

   # Run the development server
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) with your browser**

## 📁 Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/         # Reusable UI components
├── models/            # MongoDB models
├── lib/               # Utility functions and configurations
└── utils/             # Helper functions
```

## 🔑 Key Features Implementation

### Authentication
- JWT-based authentication
- Secure password hashing
- Protected API routes
- Middleware for route protection

### Code Editor
- Syntax highlighting for multiple languages
- Real-time preview
- Auto-save functionality
- Custom themes support

### Data Management
- MongoDB integration with Mongoose
- Efficient data querying
- Proper error handling
- Data validation

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [CodeMirror](https://codemirror.net/)
