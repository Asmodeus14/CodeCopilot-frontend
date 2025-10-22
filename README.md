# CodeCopilot 🚀

**AI-Powered Code Analysis & Optimization Platform**

[![Frontend Deployment](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://codecopilot0.vercel.app)
[![Backend Deployment](https://img.shields.io/badge/Backend-Render-46B3A0?style=for-the-badge&logo=render&logoColor=white)](https://codecopilot-backend.onrender.com)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-2.3-000000?style=for-the-badge&logo=flask&logoColor=white)
![Backend](https://github.com/Asmodeus14/codecopilot-backend)

## 🌟 Live Demo

**Frontend Application:** [CodeCopilot](https://codecopilot0.vercel.app)

> **Note:** The backend service needs to be running locally or deployed separately for full functionality.

## 📖 Overview

CodeCopilot is an intelligent code analysis platform that helps developers identify issues, security vulnerabilities, and optimization opportunities in their web projects. With AI-powered insights and comprehensive security scanning, it's your co-pilot for better code quality.

![CodeCopilot Dashboard](https://via.placeholder.com/800x400/1e293b/3b82f6?text=CodeCopilot+Dashboard)

## ✨ Features

### 🔍 Smart Code Analysis
- **Dependency Analysis**: Detect version mismatches and missing dependencies
- **Security Scanning**: Comprehensive security vulnerability detection
- **Project Structure**: Analyze project organization and best practices
- **Configuration Validation**: Validate project configuration files

### 🤖 AI-Powered Insights
- **LLM Integration**: Get intelligent solutions and explanations
- **Root Cause Analysis**: Understand why issues occur
- **Step-by-Step Solutions**: Detailed fix instructions
- **Prevention Tips**: Learn how to avoid similar issues

### 🛡️ Enterprise-Grade Security
- **Zip Bomb Protection**: Advanced compression ratio detection
- **File Type Filtering**: Automatic blocking of dangerous file types
- **Path Traversal Prevention**: Secure file extraction
- **Size Limits**: Configurable file and extraction size limits

### 📊 Comprehensive Reporting
- **Health Score**: Overall project health assessment
- **Priority Issues**: Critical, major, and minor issue categorization
- **Security Warnings**: Detailed security notifications
- **Project Statistics**: File counts, configuration analysis

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   AI Service    │
│   (React)       │◄──►│    (Flask)       │◄──►│                 │
│                 │    │                  │    │                 │
│ • Project Upload│    │ • Security Scan  │    │ • Code Analysis │
│ • Results Display│   │ • File Analysis  │    │ • Solutions     │
│ • Status Monitor │   │ • LLM Integration│    │ • Explanations  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/your-username/codecopilot.git
cd codecopilot/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

**Frontend Environment Variables:**
```env
VITE_BACKEND_URL=http://localhost:5000
```

### Backend Setup

```bash
# Navigate to backend directory
cd ../backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env

# Start Flask server
python app.py
```

**Backend Environment Variables:**
```env
SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-here
FLASK_DEBUG=false
PORT=5000
```

## 📁 Project Structure

### Frontend (`/frontend`)
```
src/
├── components/          # React components
│   ├── ProjectUpload.jsx
│   ├── ResultsDashboard.jsx
│   ├── BackendStatus.jsx
│   └── Logo.jsx
├── hooks/              # Custom React hooks
├── styles/             # Tailwind CSS styles
└── main.jsx           # Application entry point
```

### Backend (`/backend`)
```
backend/
├── app.py              # Flask application
├── security_scanner.py # Security & zip bomb protection
├── project_analyzer.py # Code analysis logic
├── llm_analyzer.py     # Gemini AI integration
├── requirements.txt    # Python dependencies
└── .env.example       # Environment template
```

## 🔧 Configuration

### File Size Limits
- **Max Upload Size**: 400MB
- **Max Extracted Size**: 800MB
- **Max File Count**: 50,000 files
- **Max Compression Ratio**: 50:1

### Security Settings
- **Blocked Extensions**: `.bat`, `.cmd`, `.ps1`, `.sh`, `.jar`, etc.
- **Max Directory Depth**: 20 levels
- **Path Traversal Protection**: Enabled

## 🎯 Usage

### 1. Upload Your Project
- Zip your entire project folder (including `node_modules` if desired)
- Drag and drop or click to upload
- Supports projects up to 400MB

### 2. Automatic Analysis
- Security scanning and validation
- Dependency and configuration analysis
- AI-powered issue detection

### 3. Review Results
- Health score and project statistics
- Categorized issues with severity levels
- Detailed solutions and prevention tips

### 4. Implement Fixes
- Copy-paste commands for quick fixes
- Step-by-step solution guides
- AI-enhanced explanations

## 🔌 API Documentation

### Health Check
```http
GET /api/health
```
Response:
```json
{
  "status": "healthy",
  "llm_available": true,
  "security": {
    "max_file_size_mb": 400,
    "max_extracted_size_mb": 800
  }
}
```

### Project Analysis
```http
POST /api/analyze
Content-Type: multipart/form-data
```
Body: `file` (ZIP archive)

## 🛠️ Development

### Frontend Development
```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development
```bash
# Run with auto-reload
flask run --debug

# Run with custom port
python app.py --port 5000
```

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on git push

### Backend (Render)
1. Connect GitHub repository to Render
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `python app.py`
4. Configure environment variables

### Environment Variables for Production
```env
# Frontend
VITE_BACKEND_URL=https://your-backend-url.render.com

# Backend
SECRET_KEY=your-production-secret-key
GEMINI_API_KEY=your-gemini-api-key
FLASK_DEBUG=false
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📊 Performance

- **Frontend**: Optimized React with Vite build system
- **Backend**: Flask with async processing for large files
- **Security**: Multi-layered protection against malicious uploads
- **AI**: Efficient Gemini API integration with fallback handling

## 🐛 Troubleshooting

### Common Issues

**Backend Connection Failed**
- Check if backend server is running on port 5000
- Verify `VITE_BACKEND_URL` environment variable
- Check CORS configuration

**File Upload Fails**
- Ensure file is a valid ZIP archive
- Check file size (max 400MB)
- Verify network connectivity

**AI Features Not Working**
- Check Gemini API key configuration
- Verify API quota and limits
- Check backend logs for errors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for AI-powered code analysis
- **React & Vite** for frontend framework
- **Flask** for backend API
- **Tailwind CSS** for styling
- **Vercel & Render** for deployment platforms



---

