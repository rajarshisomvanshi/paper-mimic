# 🚀 Paper Mimic - Quick Start (5 Minutes)

## What is Paper Mimic?

Paper Mimic is an AI-powered tool that:
1. 📄 Takes your exam PDF
2. 🔍 Intelligently parses the questions
3. 🧠 Generates similar practice questions
4. 📊 Gives you results as JSON

**Time needed**: 5 mins to run, 1-10 mins to generate questions

---

## Prerequisites

- Python 3.10+ (`python --version`)
- OpenAI API key (get from https://platform.openai.com/api-keys)
- Optional: Node.js 18+ (for web UI)

---

## Start Backend (2 minutes)

### 1. Setup

```bash
# Navigate to project
cd paper-mimic

# Create environment
python -m venv venv

# Activate it
source venv/bin/activate          # macOS/Linux
# or
venv\Scripts\activate            # Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure API

```bash
# Copy template
cp .env.example .env

# Edit .env - add your OpenAI key:
# OPENAI_API_KEY=sk-your-key-here
```

**Don't have an API key?**
- Go to https://platform.openai.com/api-keys
- Create new secret key
- Paste it in `.env`

### 3. Start Server

```bash
python run_server.py
```

**Expected output:**
```
🚀 Starting Paper Mimic API server on 0.0.0.0:8000
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ **Backend is running!** Keep this terminal open.

---

## Test It (Command Line)

### In a new terminal:

```bash
# Get a test PDF or use your own (let's call it exam.pdf)

# Parse it
python src/agents/question/tools/pdf_parser.py exam.pdf

# Extract questions
python src/agents/question/tools/question_extractor.py data/user/question/mimic_papers/exam

# Generate similar questions
python src/agents/question/tools/exam_mimic.py --pdf exam.pdf --kb default --max-questions 2
```

✅ **Done!** Check `data/user/question/mimic_papers/` for results.

---

## Start Web UI (Optional - 3 minutes)

### In a new terminal:

```bash
cd paper-mimic/web

npm install
npm run dev
```

Then open: **http://localhost:3000**

✅ Upload PDF and see live progress!

---

## What Happens?

### Behind the scenes:

```
Your PDF
   ↓
[Parser] Reads PDF content
   ↓
[Extractor] Finds all questions
   ↓
[Generator] For each question:
   - Creates similar question (same topic, different scenario)
   - Validates quality
   ↓
Results JSON
   ↓
You download and use!
```

---

## How to Use

### Method 1: Web Interface (Easiest)

1. Go to http://localhost:3000
2. Click "Mimic Exam"
3. Upload PDF
4. Watch progress
5. Download results

### Method 2: Command Line

```bash
python src/agents/question/tools/exam_mimic.py \
  --pdf /path/to/exam.pdf \
  --kb knowledge_base_name \
  --max-questions 5
```

### Method 3: API

```bash
# Send WebSocket message to: ws://localhost:8000/api/question/mimic

# Example:
{
  "mode": "upload",
  "pdf_data": "base64_encoded_pdf",
  "pdf_name": "exam.pdf",
  "kb_name": "default",
  "max_questions": 5
}
```

---

## Results

Generated questions are saved as JSON:

```json
{
  "reference_paper": "exam",
  "total_reference_questions": 3,
  "successful_generations": 3,
  "generated_questions": [
    {
      "reference_question_text": "Original question...",
      "generated_question": {
        "question": "New similar question...",
        "type": "multiple_choice"
      }
    }
  ]
}
```

---

## Troubleshooting

### "MinerU not found"
```bash
pip install magic-pdf[full]
```

### "API key not working"
- Copy correct key from https://platform.openai.com/api-keys
- Paste in `.env` file
- Restart server

### "Port 8000 already in use"
```bash
# Kill the process or use different port
API_PORT=8001 python run_server.py
```

### "PDF parsing fails"
- Try different PDF file
- Ensure it's not encrypted
- Check file size (< 50MB works best)

---

## Next Steps

1. **Read** [README.md](README.md) for full features
2. **Configure** by following [SETUP.md](SETUP.md)
3. **Understand** system from [ARCHITECTURE.md](ARCHITECTURE.md)
4. **Learn** more from [GUIDE.md](GUIDE.md)

---

## Production Deployment

### Using Docker (1 command):

```bash
docker-compose up -d
```

Done! Services running at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

---

## Performance Tips

- **Faster**: Increase parallel questions in config
- **Better**: Use higher model (gpt-4-turbo)
- **Cheaper**: Reduce max_questions or use smaller PDFs

---

## API Documentation

When backend is running, visit:
**http://localhost:8000/docs**

Interactive documentation for all endpoints!

---

## Common Questions

**Q: Can I use my own LLM?**  
A: Yes! Update `.env` with your API endpoint and key.

**Q: How long does it take?**  
A: Typically 1-10 minutes depending on PDF size and question count.

**Q: Can I generate more questions?**  
A: Yes, set `max_questions` to higher number (default: 5).

**Q: Where are results saved?**  
A: `data/user/question/mimic_papers/` folder in JSON format.

**Q: Can I run without web UI?**  
A: Yes! Use command line tools or API directly.

---

## Files to Edit

Most common customizations:

1. **`.env`** - API keys and settings
2. **`config/main.yaml`** - Application settings
3. **`config/question_config.yaml`** - LLM parameters

---

## Get Help

1. Check error message in console
2. See logs in `data/logs/` folder
3. Read relevant documentation file
4. Check http://localhost:8000/docs for API info

---

## You're Ready! 🎉

```bash
# Quick recap:
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API key
python run_server.py

# In browser: http://localhost:8000/docs
```

**That's it!** Start generating exam questions.

---

**Paper Mimic - Making exam preparation intelligent** 📚✨

Need more help? See [GUIDE.md](GUIDE.md) for detailed setup.
