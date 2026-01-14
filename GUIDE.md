# Paper Mimic - Complete Setup Guide

**Last Updated**: January 2026  
**Version**: 1.0.0

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Full Stack with Docker](#full-stack-with-docker)
5. [Configuration](#configuration)
6. [Running the Application](#running-the-application)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start (5 minutes)

### For Backend Only (CLI Usage)

```bash
# 1. Clone repository
cd paper-mimic

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux
# or: venv\Scripts\activate  # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure API keys
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 5. Start server
python run_server.py

# Server running at: http://localhost:8000
```

### For Full Stack (Web UI + Backend)

```bash
# 1. Start backend (in terminal 1)
python run_server.py

# 2. Start frontend (in terminal 2)
cd web
npm install
npm run dev

# Access application at: http://localhost:3000
```

---

## ⚙️ Backend Setup

### Prerequisites

- Python 3.10+
- pip/conda
- Git
- OpenAI API key

### Installation Steps

#### 1. Clone Repository

```bash
git clone <your-repo-url> paper-mimic
cd paper-mimic
```

#### 2. Create Virtual Environment

```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

#### 3. Install Python Dependencies

```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

#### 4. Install MinerU (PDF Parsing)

```bash
# Method 1: magic-pdf (Recommended)
pip install magic-pdf[full]

# Method 2: mineru
pip install mineru

# Verify installation
magic-pdf --version
```

#### 5. Configure Environment

```bash
# Create .env from template
cp .env.example .env

# Edit .env file with:
# - OPENAI_API_KEY
# - OPENAI_BASE_URL (if using custom provider)
# - LLM_MODEL
# - API_PORT (optional, default: 8000)
```

#### 6. Create Data Directories

```bash
mkdir -p data/user/question/mimic_papers
mkdir -p data/logs
mkdir -p config
```

#### 7. Verify Installation

```bash
# Test Python environment
python -c "import fastapi; import openai; print('✓ Dependencies OK')"

# Test MinerU
magic-pdf --version

# Test API startup
python run_server.py

# In another terminal:
curl http://localhost:8000/health
```

---

## 🎨 Frontend Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation Steps

#### 1. Navigate to Web Directory

```bash
cd paper-mimic/web
```

#### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

#### 3. Configure Environment

```bash
# Copy example env
cp .env.example .env.local

# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
```

#### 5. Access Application

- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

#### 6. Build for Production

```bash
npm run build
npm start
```

---

## 🐳 Full Stack with Docker

### Prerequisites

- Docker
- Docker Compose

### One-Command Setup

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 2. Start all services
docker-compose up -d

# 3. Check services
docker-compose ps

# 4. View logs
docker-compose logs -f

# 5. Access services
# Frontend: http://localhost:3000
# API: http://localhost:8000
# API Docs: http://localhost:8000/docs

# 6. Stop services
docker-compose down
```

### Individual Container Usage

```bash
# Build image
docker build -t paper-mimic:latest .

# Run backend only
docker run -d -p 8000:8000 \
  -e OPENAI_API_KEY=sk-... \
  -v $(pwd)/data:/app/data \
  paper-mimic:latest

# Run with custom port
docker run -d -p 8001:8000 \
  -e API_PORT=8000 \
  -e OPENAI_API_KEY=sk-... \
  paper-mimic:latest
```

---

## ⚙️ Configuration

### Environment Variables

```env
# API Server
API_HOST=0.0.0.0
API_PORT=8000

# LLM - OpenAI
OPENAI_API_KEY=sk-your-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4-turbo

# Alternative LLM Provider
# LLM_API_KEY=your-key
# LLM_BASE_URL=https://api.provider.com/v1
# LLM_MODEL=model-name

# Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:8000

# Application
ENVIRONMENT=development
DEBUG=true
```

### YAML Configuration Files

**config/main.yaml:**
```yaml
question:
  max_parallel_questions: 3
  max_rounds: 10

logging:
  level: "INFO"
  log_dir: "data/logs"
```

**config/question_config.yaml:**
```yaml
agents:
  question:
    temperature: 0.7
    max_tokens: 4000
```

---

## ▶️ Running the Application

### Scenario 1: Backend Only (CLI)

```bash
# Terminal 1
source venv/bin/activate
python run_server.py

# Terminal 2 (use CLI tools)
python src/agents/question/tools/exam_mimic.py --pdf exam.pdf --kb default
```

### Scenario 2: Web UI Only

```bash
# Terminal 1 - Backend
source venv/bin/activate
python run_server.py

# Terminal 2 - Frontend
cd web
npm run dev

# Access: http://localhost:3000
```

### Scenario 3: Full Docker Stack

```bash
docker-compose up -d

# Services running:
# - Backend: http://localhost:8000
# - Frontend: http://localhost:3000
# - Logs: docker-compose logs -f
```

---

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:8000/health

# API documentation
curl http://localhost:8000/

# Swagger UI
# Visit: http://localhost:8000/docs
```

### Test PDF Processing

```bash
# Download or create a test PDF, then:
python src/agents/question/tools/pdf_parser.py test_exam.pdf

# Extract questions
python src/agents/question/tools/question_extractor.py data/user/question/mimic_papers/test_exam

# Generate questions
python src/agents/question/tools/exam_mimic.py --pdf test_exam.pdf --kb default --max-questions 2
```

### Test WebSocket Connection

```python
# test_websocket.py
import asyncio
import websockets
import json

async def test():
    async with websockets.connect("ws://localhost:8000/api/question/mimic") as ws:
        # Send configuration
        await ws.send(json.dumps({
            "mode": "upload",
            "pdf_data": "...",  # Base64 encoded PDF
            "pdf_name": "exam.pdf",
            "kb_name": "default",
            "max_questions": 2
        }))
        
        # Receive messages
        while True:
            msg = await ws.recv()
            print(json.loads(msg))

asyncio.run(test())
```

---

## 🐛 Troubleshooting

### Installation Issues

**Problem: "Python version not supported"**
```bash
# Check Python version
python --version

# Require Python 3.10+
# Install from: https://www.python.org/downloads/
```

**Problem: "pip command not found"**
```bash
# macOS/Linux
python3 -m pip --version

# Windows
python -m pip --version
```

### MinerU Issues

**Problem: "magic-pdf: command not found"**
```bash
# Verify installation
pip show magic-pdf

# Reinstall
pip install --force-reinstall magic-pdf[full]

# Test
magic-pdf --version
```

**Problem: "PDF parsing fails"**
```bash
# Check PDF is not encrypted
# Try different PDF: PDF/A or regular PDF
# Check file size < 1GB
# Ensure disk space > 500MB
```

### API Issues

**Problem: "OPENAI_API_KEY not configured"**
```bash
# Check .env file
cat .env | grep OPENAI_API_KEY

# If not set:
echo "OPENAI_API_KEY=sk-..." >> .env

# Verify it loads
python -c "import os; os.getenv('OPENAI_API_KEY')"
```

**Problem: "Port 8000 already in use"**
```bash
# macOS/Linux - Find and kill process
lsof -i :8000
kill -9 <PID>

# Windows - Find and kill process
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or use different port
API_PORT=8001 python run_server.py
```

**Problem: "Connection refused at localhost:8000"**
```bash
# Check server is running
curl http://localhost:8000/health

# Check firewall allows port 8000
# Check API_HOST is 0.0.0.0 (not 127.0.0.1 for Docker)
```

### Frontend Issues

**Problem: "Cannot find module"**
```bash
cd web
rm -rf node_modules package-lock.json
npm install
```

**Problem: "API calls fail from frontend"**
```bash
# Check NEXT_PUBLIC_API_URL in .env.local
# Ensure backend is running
curl http://localhost:8000/health

# Check CORS configuration in src/api/main.py
```

### Docker Issues

**Problem: "docker-compose: command not found"**
```bash
# Install Docker Desktop or Docker Engine
# https://docs.docker.com/get-docker/
```

**Problem: "Permission denied while running Docker"**
```bash
# macOS/Linux
sudo usermod -aG docker $USER
newgrp docker
```

### Performance Issues

**Problem: "Generation takes too long"**
```bash
# Increase parallel processing
# Edit config/main.yaml:
question:
  max_parallel_questions: 5  # Increase from 3
  max_rounds: 8              # Reduce from 10

# Or use better hardware
```

**Problem: "Out of memory errors"**
```bash
# Reduce parallel processing
# config/main.yaml:
question:
  max_parallel_questions: 1

# Or allocate more RAM to Docker
```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Python 3.10+ installed (`python --version`)
- [ ] MinerU installed (`magic-pdf --version`)
- [ ] Virtual environment activated (`which python` or `where python`)
- [ ] Dependencies installed (`pip list | grep fastapi`)
- [ ] API key configured (check `.env`)
- [ ] Backend starts without errors (`python run_server.py`)
- [ ] API responds (`curl http://localhost:8000/health`)
- [ ] Frontend builds (`cd web && npm run build`)
- [ ] Frontend starts (`npm run dev`)
- [ ] WebSocket connects (check browser console)
- [ ] Can upload PDF and generate questions

---

## 📞 Support

If you encounter issues:

1. Check [Troubleshooting](#-troubleshooting) section
2. Review logs in `data/logs/`
3. Check API documentation: http://localhost:8000/docs
4. Read error messages carefully
5. Verify all prerequisites are installed
6. Check network connectivity
7. Try restarting services
8. File an issue with:
   - Error messages (full output)
   - Steps to reproduce
   - System information (OS, Python version)
   - Configuration settings

---

## 🎉 Next Steps

1. **Upload your first PDF** - Use the web UI to upload an exam
2. **Generate questions** - Watch the real-time progress
3. **Download results** - Get generated questions as JSON
4. **Integrate** - Use the API or results in your application
5. **Customize** - Modify configuration for your needs

---

**Enjoy using Paper Mimic!** 📚✨
