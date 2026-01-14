# Paper Mimic - Setup & Installation Guide

## System Requirements

- **OS**: Linux, macOS, or Windows
- **Python**: 3.10 or higher
- **Node.js**: 18 or higher (for frontend)
- **RAM**: Minimum 4GB, recommended 8GB
- **Disk**: Minimum 5GB free space

## Step-by-Step Installation

### 1. Environment Setup

#### On Windows
```powershell
# Create virtual environment
python -m venv venv
.\venv\Scripts\activate
```

#### On macOS/Linux
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Backend Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Install MinerU for PDF Parsing

**Option A: Using magic-pdf (Recommended)**

```bash
pip install magic-pdf[full]
```

**Option B: Using mineru**

```bash
pip install mineru
```

**Verification**

```bash
magic-pdf --version
# or
mineru --version
```

### 4. Setup Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
# - Set OPENAI_API_KEY
# - Set OPENAI_BASE_URL (if using different provider)
# - Set LLM_MODEL
```

**Example .env:**

```env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4-turbo
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=development
```

### 5. Create Data Directories

```bash
# Create necessary directories
mkdir -p data/user/question/mimic_papers
mkdir -p data/logs
```

### 6. Start Backend Server

```bash
# Activate virtual environment (if not already activated)
source venv/bin/activate  # macOS/Linux
# or
.\venv\Scripts\activate   # Windows

# Start the API server
python run_server.py
```

**Expected output:**
```
🚀 Starting Paper Mimic API server on 0.0.0.0:8000
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### 7. Setup Frontend (Optional - for Web UI)

```bash
cd web

# Install Node dependencies
npm install

# Start development server
npm run dev
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Verification

### Backend Verification

```bash
# Check API is running
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","service":"Paper Mimic"}
```

### Test Mimic Generation (Backend Only)

```bash
# Download a sample PDF or use your own
# Parse PDF
python src/agents/question/tools/pdf_parser.py /path/to/sample.pdf

# Extract questions
python src/agents/question/tools/question_extractor.py data/user/question/mimic_papers/sample

# Generate mimic questions
python src/agents/question/tools/exam_mimic.py --pdf /path/to/sample.pdf --kb default
```

## Docker Installation

### Option 1: Docker Compose (Full Stack)

```bash
# Create .env file with required settings
cp .env.example .env
# Edit .env with your API keys

# Build and start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Manual Docker Build

```bash
# Build image
docker build -t paper-mimic:latest .

# Run container
docker run -d \
  -p 8000:8000 \
  -e OPENAI_API_KEY=sk-... \
  -v $(pwd)/data:/app/data \
  paper-mimic:latest

# Check if running
curl http://localhost:8000/health
```

## Configuration

### LLM Providers

#### OpenAI (Default)
```env
OPENAI_API_KEY=sk-your-key
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4-turbo
```

#### Azure OpenAI
```env
OPENAI_API_KEY=your-azure-key
OPENAI_BASE_URL=https://your-resource.openai.azure.com/
LLM_MODEL=your-deployment-name
```

#### Other OpenAI-Compatible APIs
```env
LLM_API_KEY=your-key
LLM_BASE_URL=https://api.provider.com/v1
LLM_MODEL=model-name
```

### Application Configuration

Edit `config/main.yaml` for:
- Question generation settings
- Parallel processing limits
- Logging levels

Edit `config/question_config.yaml` for:
- LLM temperature
- Max tokens
- Generation parameters

## Troubleshooting

### Issue: "MinerU not found"

**Solution:**
```bash
# Verify installation
magic-pdf --version

# If not installed:
pip install magic-pdf[full]
```

### Issue: "OPENAI_API_KEY not configured"

**Solution:**
```bash
# Check .env file exists and has correct key
cat .env | grep OPENAI_API_KEY

# If empty, add your key
echo "OPENAI_API_KEY=sk-..." >> .env
```

### Issue: "Port 8000 already in use"

**Solution:**
```bash
# Use different port
API_PORT=8001 python run_server.py

# Or kill the process using port 8000
# On macOS/Linux:
lsof -ti:8000 | xargs kill -9

# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Issue: "PDF parsing takes too long"

**Solution:**
- Use smaller PDF files (< 50 MB)
- Increase timeout settings
- Split large documents
- Ensure sufficient system resources

### Issue: "WebSocket connection failed"

**Solution:**
```bash
# Check backend is running
curl http://localhost:8000/health

# Check frontend can reach backend
# Update NEXT_PUBLIC_API_URL if needed
```

## Development Setup

### For Contributors

```bash
# Clone repository
git clone <repository>
cd paper-mimic

# Create development virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies with dev packages
pip install -r requirements.txt
pip install pytest black ruff mypy

# Setup pre-commit hooks (optional)
pip install pre-commit
pre-commit install
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src

# Run specific test
pytest tests/test_exam_mimic.py::test_function
```

## Performance Optimization

### Backend Optimization
- Increase `max_parallel_questions` for faster generation
- Adjust LLM `max_tokens` based on your needs
- Use high-performance server for production

### Frontend Optimization
- Enable caching
- Use CDN for static assets
- Optimize images

## Security Setup for Production

```bash
# 1. Update CORS settings in src/api/main.py
allow_origins=[
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]

# 2. Use environment-specific .env files
cp .env.example .env.production

# 3. Set secure headers
# 4. Use HTTPS/SSL
# 5. Enable rate limiting
# 6. Setup firewall rules
```

## Monitoring and Logging

### View Logs

```bash
# Backend logs
tail -f data/logs/API.log

# Docker logs
docker-compose logs -f backend
```

### Configure Log Level

Update `.env`:
```env
DEBUG=true      # for verbose logging
DEBUG=false     # for production
```

## Next Steps

1. **Read** [README.md](README.md) for feature overview
2. **Try** the web UI at http://localhost:3000
3. **Upload** a test PDF and generate questions
4. **Explore** the API documentation at http://localhost:8000/docs
5. **Customize** configuration for your needs

## Getting Help

- Check [Troubleshooting](#troubleshooting) section
- Review error logs in `data/logs/`
- Check API documentation: http://localhost:8000/docs
- Read backend code comments
- File an issue with detailed error information

## Additional Resources

- [MinerU Documentation](https://github.com/opendatalab/MinerU)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

**Setup Complete!** 🎉

You're now ready to use Paper Mimic. Visit http://localhost:3000 to start generating exam papers!
