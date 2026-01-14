# Paper Mimic - Features & Architecture

## 📋 Feature Overview

### Core Features

#### 1. PDF Upload & Parsing
- **Drag-and-drop interface** for easy PDF upload
- **Automatic parsing** using MinerU OCR technology
- **Supports various PDF formats** (scanned, digital, mixed)
- **Image extraction** from documents
- **Progress tracking** during parsing

#### 2. Question Extraction
- **Intelligent question detection** using LLM
- **Support for multiple question types**:
  - Multiple choice
  - Fill-in-the-blank
  - Short answer
  - Long form
  - Calculation
- **Automatic numbering** and organization
- **Image association** with questions

#### 3. Smart Question Generation
- **Reference-based generation** - generates new questions based on existing ones
- **Maintains difficulty level** - similar complexity to reference questions
- **Preserves concepts** - keeps core knowledge concepts intact
- **Varies scenarios** - uses different contexts and examples
- **Parallel processing** - generate multiple questions simultaneously
- **Validation analysis** - checks quality of generated questions

#### 4. Real-time Monitoring
- **Live progress updates** via WebSocket
- **Per-question status** tracking
- **Visual feedback** on generation progress
- **Error reporting** for failed generations
- **Performance metrics** display

#### 5. Results Management
- **JSON export** of all results
- **Organized storage** with timestamps
- **Metadata included** - reference questions, validations, rounds taken
- **Easy retrieval** for future reference
- **Batch operations** support

---

## 🏗️ Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Paper Mimic System                           │
└─────────────────────────────────────────────────────────────────┘

                         Frontend (Next.js)
┌──────────────────────────────────────────────────────────────────┐
│  • PDF Upload Component                                          │
│  • Real-time Progress Display                                   │
│  • Results Viewer                                               │
│  • Question Gallery                                             │
└────────────────────┬─────────────────────────────────────────────┘
                     │ WebSocket / HTTP
                     ↓
┌──────────────────────────────────────────────────────────────────┐
│                  Backend (FastAPI)                               │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ API Routers                                              │   │
│  │ • Question Router (/api/question/mimic)                 │   │
│  │ • WebSocket Handler                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                     ↓                                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Core Processing Pipeline                                │   │
│  │                                                           │   │
│  │  1. PDF Parsing (MinerU)                               │   │
│  │     └→ Parse PDF → Extract text & images              │   │
│  │                                                           │   │
│  │  2. Question Extraction (LLM)                          │   │
│  │     └→ Analyze content → Extract questions            │   │
│  │                                                           │   │
│  │  3. Question Generation (LLM Agent)                    │   │
│  │     └→ For each question → Generate similar           │   │
│  │     └→ Validate output → Store result                 │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                     ↓                                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ External Services                                        │   │
│  │ • OpenAI API (LLM)                                       │   │
│  │ • MinerU (PDF Parsing)                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                     ↓                                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Storage                                                  │   │
│  │ • data/user/question/mimic_papers/                      │   │
│  │ • Parsed PDFs, extracted questions, results            │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### Backend Components

```
src/
├── agents/question/
│   ├── coordinator.py          # Agent orchestration
│   └── tools/
│       ├── exam_mimic.py       # Main orchestration (450+ lines)
│       ├── pdf_parser.py       # MinerU integration
│       └── question_extractor.py # LLM-based extraction
├── api/
│   ├── main.py                 # FastAPI app setup
│   └── routers/
│       └── question.py         # WebSocket endpoint
├── services/
│   ├── config.py               # YAML config loading
│   └── llm.py                  # LLM service
└── logging/
    └── logger.py               # Logging setup
```

#### Frontend Components

```
web/
├── app/
│   └── question/page.tsx       # Mimic mode UI
├── components/
│   ├── PDFUpload.tsx           # File upload
│   ├── ProgressDisplay.tsx     # Real-time progress
│   └── ResultsViewer.tsx       # Results display
├── context/
│   └── GlobalContext.tsx       # State management
└── lib/
    └── api.ts                  # API client
```

---

## 🔄 Workflow Execution

### Complete Question Generation Workflow

```
User Upload
    ↓
┌─────────────────────────────────────┐
│ Stage 1: PDF Parsing               │
│ • Receive base64 PDF               │
│ • Save to temporary directory       │
│ • Execute MinerU parsing           │
│ • Generate markdown + images       │
└──────────┬──────────────────────────┘
           ↓
    [Progress: 25%]
           ↓
┌─────────────────────────────────────┐
│ Stage 2: Question Extraction       │
│ • Load markdown content            │
│ • Identify images                  │
│ • Call LLM to extract questions   │
│ • Parse and validate results       │
└──────────┬──────────────────────────┘
           ↓
    [Progress: 50%]
           ↓
┌─────────────────────────────────────┐
│ Stage 3: Question Generation       │
│ • For each reference question:     │
│   • Parallel generation (max 3)   │
│   • LLM creates similar question  │
│   • Validate relevance & quality  │
│   • Store result                  │
└──────────┬──────────────────────────┘
           ↓
    [Progress: 100%]
           ↓
┌─────────────────────────────────────┐
│ Stage 4: Results Storage           │
│ • Save all results to JSON         │
│ • Include metadata                 │
│ • Generate summary stats           │
│ • Return to user                   │
└──────────┬──────────────────────────┘
           ↓
User Results Ready
```

### Question Generation Logic

```
Reference Question
    ↓
┌─────────────────────────────────────┐
│ Question Generation Request        │
│ • Core concepts identified         │
│ • Difficulty level analyzed        │
│ • Constraints specified            │
└──────────┬──────────────────────────┘
           ↓
    Call LLM with specific prompt
    (See system prompt in exam_mimic.py)
           ↓
┌─────────────────────────────────────┐
│ LLM Processing                     │
│ • Understand reference question    │
│ • Generate new scenario            │
│ • Keep same concepts               │
│ • Similar difficulty               │
└──────────┬──────────────────────────┘
           ↓
    Generated Question JSON
           ↓
┌─────────────────────────────────────┐
│ Validation                          │
│ • Check relevance score            │
│ • Verify completeness              │
│ • Assess quality metrics           │
└──────────┬──────────────────────────┘
           ↓
    Result stored with metadata
```

---

## 📊 Data Flow

### Input Data Flow

```
PDF Upload (Frontend)
    ↓
WebSocket Message
    {
      "mode": "upload",
      "pdf_data": "base64...",
      "pdf_name": "exam.pdf",
      "kb_name": "default",
      "max_questions": 5
    }
    ↓
Backend Receives
    ↓
Save PDF + Parse + Extract + Generate
```

### Output Data Flow

```
Generated Questions (Backend)
    ↓
JSON Result
    {
      "reference_paper": "exam_name",
      "kb_name": "default",
      "total_reference_questions": 5,
      "successful_generations": 5,
      "generated_questions": [...],
      "failed_questions": [...]
    }
    ↓
WebSocket Events (Real-time)
    • progress
    • question_update
    • result
    • summary
    ↓
Frontend Displays
    ↓
User Downloads JSON
```

---

## 🔌 API Endpoints

### WebSocket Endpoint

**Path**: `/api/question/mimic`  
**Protocol**: WebSocket  
**Port**: 8000

#### Request Format

```json
{
  "mode": "upload|parsed",
  "pdf_data": "base64_encoded_pdf",  // for upload mode
  "pdf_name": "exam.pdf",            // for upload mode
  "paper_path": "exam_name",         // for parsed mode
  "kb_name": "knowledge_base_name",
  "max_questions": 5
}
```

#### Response Messages

```json
// Progress Update
{
  "type": "progress",
  "stage": "parsing|extracting|generating",
  "status": "running|complete",
  "message": "...",
  "current": 2,
  "total": 5
}

// Question Update
{
  "type": "question_update",
  "question_id": "mimic_1",
  "status": "generating|completed|failed",
  "reference_number": "1"
}

// Result
{
  "type": "result",
  "question_id": "mimic_1",
  "success": true,
  "question": {...},
  "validation": {...}
}

// Summary
{
  "type": "summary",
  "total_reference": 5,
  "successful": 5,
  "failed": 0,
  "output_file": "path/to/results.json"
}

// Log
{
  "type": "log",
  "content": "Generation message..."
}

// Error
{
  "type": "error",
  "content": "Error message"
}

// Completion
{
  "type": "complete"
}
```

---

## ⚙️ Configuration

### Application Settings

**config/main.yaml:**
```yaml
question:
  max_parallel_questions: 3      # Parallel generation limit
  max_rounds: 10                 # Max generation attempts

logging:
  level: "INFO"
  log_dir: "data/logs"

paths:
  user_log_dir: "data/logs"
```

**config/question_config.yaml:**
```yaml
agents:
  question:
    temperature: 0.7              # LLM creativity (0-1)
    max_tokens: 4000              # Max response length
    max_rounds: 10                # Generation rounds
```

### Environment Variables

```
API_HOST=0.0.0.0
API_PORT=8000
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4-turbo
ENVIRONMENT=development
DEBUG=true
```

---

## 🔒 Security Features

### Input Validation
- PDF file size limits
- Base64 data validation
- Path traversal prevention
- JSON schema validation

### API Security
- CORS configuration
- Request rate limiting (recommended)
- WebSocket connection validation
- Error message sanitization

### Data Privacy
- No data logging to external services
- Local storage only
- Configurable data retention
- Secure file handling

---

## 📈 Performance Characteristics

### Processing Time
- **Small PDF** (< 5 MB, 1-3 questions): 1-2 minutes
- **Medium PDF** (5-20 MB, 4-10 questions): 2-5 minutes
- **Large PDF** (20-50 MB, 10+ questions): 5-15 minutes

### Resource Usage
- **Memory**: 500 MB - 2 GB (depending on parallelization)
- **CPU**: Multi-core optimized (parallel processing)
- **Disk**: ~100 MB per 10-question exam

### Bottlenecks
1. LLM API response time (external dependency)
2. PDF parsing (depends on file size/complexity)
3. Parallel processing limit (configurable)

### Optimization Tips
- Increase `max_parallel_questions` (uses more memory)
- Reduce `max_rounds` for faster generation
- Use smaller PDFs for testing
- Cache results locally

---

## 🔧 Technology Stack

### Backend
- **Runtime**: Python 3.10+
- **Web Framework**: FastAPI
- **Server**: Uvicorn
- **Async**: asyncio, aiohttp
- **LLM**: OpenAI API
- **PDF Parsing**: MinerU (magic-pdf)
- **Config**: PyYAML
- **Logging**: Python logging

### Frontend
- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **Communication**: WebSocket, Fetch API
- **UI Components**: React + Tailwind

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Storage**: Local filesystem (production: configurable)
- **Logging**: File-based + Console

---

## 🔄 Extension Points

### Adding New Question Types
- Modify extraction prompt in `question_extractor.py`
- Update validation logic in `coordinator.py`
- Add type-specific generation rules

### Custom LLM Providers
- Update `src/services/llm.py`
- Configure API key and base URL
- Ensure OpenAI-compatible API

### Advanced Validation
- Extend validation in `exam_mimic.py`
- Add custom scoring metrics
- Integrate external validation services

### Alternative PDF Parsers
- Replace `parse_pdf_with_mineru()` in `pdf_parser.py`
- Implement new parser interface
- Update output format handling

---

## 🚀 Future Enhancements

- Multi-language question generation
- Advanced question type detection
- Question difficulty scoring
- Integration with Learning Management Systems
- Batch processing API
- Admin dashboard
- User authentication
- Analytics and reporting
- Template-based generation

---

## 📚 References

- [MinerU GitHub](https://github.com/opendatalab/MinerU)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Next.js Documentation](https://nextjs.org)
- [OpenAI API](https://platform.openai.com/docs)
- [WebSocket Protocol](https://tools.ietf.org/html/rfc6455)

---

**Paper Mimic: Making exam preparation intelligent and efficient** 📚✨
