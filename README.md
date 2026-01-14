# 📚 Paper Mimic - Intelligent Question Paper Mimicker

![Paper Mimic](https://img.shields.io/badge/Version-1.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-green)

**Paper Mimic** is an intelligent system that analyzes reference exam papers (PDFs) and automatically generates similar practice questions while maintaining the same difficulty level and content structure.

## ✨ Features

- 📄 **PDF Upload**: Simply upload your exam paper in PDF format
- 🔍 **Intelligent Parsing**: Uses MinerU to parse complex PDF structures, including text and images
- 🧠 **Smart Question Extraction**: LLM-powered extraction of questions from parsed content
- 🎯 **Question Generation**: Generates similar questions based on reference questions
  - Maintains difficulty level
  - Preserves core concepts
  - Uses different scenarios/contexts
  - Parallel processing for faster generation
- 📊 **Real-time Progress**: WebSocket-based real-time updates during generation
- 💾 **Persistent Storage**: All results saved as JSON for easy integration

## 🏗️ Architecture

### Backend
- **FastAPI**: High-performance async web framework
- **WebSocket**: Real-time progress updates
- **MinerU**: PDF parsing and content extraction
- **OpenAI API**: LLM for question extraction and generation

### Frontend
- **Next.js**: React-based frontend framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern responsive UI
- **Real-time WebSocket**: Live progress tracking

### Workflow
```
PDF Upload / Parsed Directory
    ↓
Parse PDF with MinerU
    ↓
Extract Reference Questions (LLM)
    ↓
For each reference question (parallel):
    → Generate similar question (LLM)
    → Validate output
    ↓
Save Results (JSON)
    ├── Reference questions
    ├── Generated questions
    └── Validation metadata
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+ (for frontend)
- OpenAI API key or compatible LLM provider
- MinerU installation (for PDF parsing)

### 1. Clone and Setup

```bash
# Navigate to the project
cd paper-mimic

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your settings
# Set OPENAI_API_KEY and other LLM parameters
```

### 3. Install MinerU

MinerU is required for PDF parsing:

```bash
# Option 1: Using magic-pdf (recommended)
pip install magic-pdf[full]

# Option 2: Direct installation
pip install mineru
```

For more details, visit: https://github.com/opendatalab/MinerU

### 4. Run Backend

```bash
# Start the FastAPI server
python run_server.py

# Server will be available at: http://localhost:8000
# API documentation: http://localhost:8000/docs
```

### 5. Run Frontend

```bash
cd web

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

## 📋 Usage

### Web Interface

1. Visit `http://localhost:3000`
2. Select **"Mimic Exam"** mode
3. Upload your exam PDF
4. Select the knowledge base (or use default)
5. Choose maximum number of questions to generate
6. Click "Generate Questions"
7. Watch real-time progress
8. Download generated questions as JSON

### Command Line (Backend Only)

```bash
# Parse PDF directly
python src/agents/question/tools/pdf_parser.py /path/to/exam.pdf

# Extract questions from parsed paper
python src/agents/question/tools/question_extractor.py reference_papers/exam_name

# Generate mimic questions
python src/agents/question/tools/exam_mimic.py --pdf /path/to/exam.pdf --kb knowledge_base_name
```

## 📁 Project Structure

```
paper-mimic/
├── src/
│   ├── agents/
│   │   └── question/
│   │       ├── tools/
│   │       │   ├── exam_mimic.py          # Main generation logic
│   │       │   ├── pdf_parser.py          # PDF parsing with MinerU
│   │       │   └── question_extractor.py  # Question extraction
│   │       └── coordinator.py             # Agent coordinator
│   ├── api/
│   │   ├── main.py                        # FastAPI app
│   │   └── routers/
│   │       └── question.py                # Question endpoints
│   ├── services/
│   │   ├── config.py                      # Configuration management
│   │   └── llm.py                         # LLM service
│   └── logging/
│       └── logger.py                      # Logging setup
├── web/                                   # Next.js frontend
│   ├── app/
│   │   └── question/
│   │       └── page.tsx                   # Mimic mode interface
│   ├── components/                        # React components
│   ├── context/                           # Global state management
│   └── package.json
├── config/
│   ├── main.yaml                          # Main configuration
│   └── question_config.yaml               # Question settings
├── data/
│   └── user/question/mimic_papers/        # Generated papers storage
├── requirements.txt                       # Python dependencies
├── pyproject.toml                         # Project metadata
├── Dockerfile                             # Docker image
├── docker-compose.yml                     # Docker composition
├── .env.example                           # Environment template
└── README.md                              # This file
```

## 🔧 Configuration

### Environment Variables

```bash
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# LLM Configuration (OpenAI)
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4-turbo

# Alternative LLM providers
# LLM_API_KEY=...
# LLM_BASE_URL=...
# LLM_MODEL=...

# Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:8000

# Environment
ENVIRONMENT=development
```

### Configuration Files

- `config/main.yaml`: Main application settings
- `config/question_config.yaml`: Question generation parameters

## 📊 Output Format

### Generated Questions JSON

```json
{
  "reference_paper": "exam_name",
  "kb_name": "knowledge_base",
  "total_reference_questions": 5,
  "successful_generations": 5,
  "failed_generations": 0,
  "generated_questions": [
    {
      "success": true,
      "reference_question_number": "1",
      "reference_question_text": "Original question...",
      "generated_question": {
        "question": "Generated similar question...",
        "type": "multiple_choice",
        "answer": "..."
      },
      "validation": {
        "relevance": 0.95,
        "difficulty": "medium"
      },
      "rounds": 2
    }
  ],
  "failed_questions": []
}
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Custom Docker Image

```bash
# Build image
docker build -t paper-mimic:latest .

# Run container
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=your-key \
  -e ENVIRONMENT=production \
  paper-mimic:latest
```

## 🤝 API Endpoints

### WebSocket: `/api/question/mimic`

#### Upload PDF Mode
```json
{
  "mode": "upload",
  "pdf_data": "base64_encoded_pdf",
  "pdf_name": "exam.pdf",
  "kb_name": "knowledge_base",
  "max_questions": 5
}
```

#### Pre-parsed Directory Mode
```json
{
  "mode": "parsed",
  "paper_path": "exam_name",
  "kb_name": "knowledge_base",
  "max_questions": 5
}
```

### WebSocket Messages (Responses)

- `status`: Status updates
- `progress`: Progress information
- `question_update`: Individual question status
- `result`: Generated question result
- `summary`: Final summary
- `log`: System logs
- `error`: Error messages
- `complete`: Completion signal

## 📈 Performance Considerations

- **Parallel Processing**: Configurable number of parallel generations (default: 3)
- **Max Rounds**: Question generation rounds (default: 10)
- **Token Optimization**: Streaming responses for efficient token usage
- **Caching**: Parsed papers cached for reuse

## 🐛 Troubleshooting

### MinerU Installation Issues

```bash
# Ensure you have the latest version
pip install --upgrade magic-pdf[full]

# Or use the alternative
pip install mineru
```

### PDF Parsing Fails

- Ensure PDF is not encrypted
- Try a different PDF format (PDF/A vs regular PDF)
- Check file size (very large files may take longer)

### LLM API Errors

- Verify API key is correct
- Check API endpoint is accessible
- Ensure sufficient API quota
- Check rate limits

### WebSocket Connection Issues

- Ensure frontend and backend are on same network
- Check firewall/proxy settings
- Verify CORS configuration

## 📝 Logging

Logs are stored in:
- Console: Real-time output
- File: `data/logs/` directory

Log levels can be configured in `.env`

## 🔒 Security Considerations

1. **API Key Management**: Never commit `.env` file with real keys
2. **CORS Configuration**: Update `allow_origins` in production
3. **Input Validation**: All inputs are validated
4. **Path Traversal**: Protected against directory traversal attacks
5. **Rate Limiting**: Consider implementing rate limiting for production

## 📚 Dependencies

### Backend
- FastAPI >= 0.100.0
- Uvicorn >= 0.24.0
- OpenAI >= 1.30.0
- magic-pdf >= 0.1.0 (for PDF parsing)
- PyYAML >= 6.0
- Pydantic >= 2.0.0

### Frontend
- Next.js >= 14.0.0
- React >= 18.0.0
- TypeScript >= 5.0.0
- Tailwind CSS >= 3.0.0

## 🤖 LLM Support

### Tested Providers
- OpenAI (GPT-4, GPT-4 Turbo)
- Other OpenAI-compatible APIs

### Configuration

```bash
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4-turbo

# Other providers (with OpenAI-compatible API)
LLM_API_KEY=...
LLM_BASE_URL=https://your-api.com/v1
LLM_MODEL=your-model-name
```

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For issues, questions, or suggestions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review existing GitHub issues
3. Create a new issue with detailed description

## 🎯 Roadmap

- [ ] Batch processing improvements
- [ ] Custom question templates
- [ ] Multiple language support
- [ ] Question difficulty scoring
- [ ] Integration with learning platforms
- [ ] Advanced validation metrics
- [ ] Web UI for configuration management

## ⭐ Acknowledgments

- **MinerU**: Advanced PDF parsing and understanding
- **OpenAI**: Language models for text generation and understanding
- **FastAPI**: Modern async web framework
- **Next.js**: React framework for production

---

**Made with ❤️ for educators and students**
