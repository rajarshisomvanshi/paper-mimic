"""Paper Mimic API - Question Router"""

import asyncio
import base64
from datetime import datetime
from pathlib import Path
import re
import sys

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from src.agents.question import AgentCoordinator
from src.agents.question.tools.exam_mimic import mimic_exam_questions

# Add project root for imports
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from src.logging.logger import get_logger

# Setup module logger
logger = get_logger("QuestionAPI")

router = APIRouter()

# Output directory for mimic mode
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
MIMIC_OUTPUT_DIR = PROJECT_ROOT / "data" / "user" / "question" / "mimic_papers"


@router.websocket("/mimic")
async def websocket_mimic_generate(websocket: WebSocket):
    """
    WebSocket endpoint for mimic exam paper question generation.

    Supports two modes:
    1. Upload PDF directly via WebSocket (base64 encoded)
    2. Use a pre-parsed paper directory path

    Message format for PDF upload:
    {
        "mode": "upload",
        "pdf_data": "base64_encoded_pdf_content",
        "pdf_name": "exam.pdf",
        "kb_name": "knowledge_base_name",
        "max_questions": 5  // optional
    }

    Message format for pre-parsed:
    {
        "mode": "parsed",
        "paper_path": "directory_name",
        "kb_name": "knowledge_base_name",
        "max_questions": 5  // optional
    }
    """
    await websocket.accept()

    pusher_task = None
    original_stdout = sys.stdout

    try:
        # 1. Wait for config
        data = await websocket.receive_json()
        mode = data.get("mode", "parsed")  # "upload" or "parsed"
        kb_name = data.get("kb_name", "default")
        max_questions = data.get("max_questions")

        logger.info(f"Starting mimic generation (mode: {mode}, kb: {kb_name})")

        # 2. Setup Log Queue
        log_queue = asyncio.Queue()

        async def log_pusher():
            while True:
                entry = await log_queue.get()
                try:
                    await websocket.send_json(entry)
                except Exception:
                    break
                log_queue.task_done()

        pusher_task = asyncio.create_task(log_pusher())

        # 3. Stdout interceptor for capturing prints
        # ANSI escape sequence pattern for stripping color codes
        ANSI_ESCAPE_PATTERN = re.compile(r"\x1b\[[0-9;]*[a-zA-Z]")

        class StdoutInterceptor:
            def __init__(self, queue):
                self.queue = queue
                self.original_stdout = sys.stdout

            def write(self, message):
                # Write to terminal first (with ANSI codes for color)
                self.original_stdout.write(message)
                # Strip ANSI escape codes before sending to frontend
                clean_message = ANSI_ESCAPE_PATTERN.sub("", message).strip()
                # Then send to frontend (non-blocking)
                if clean_message:
                    try:
                        self.queue.put_nowait(
                            {
                                "type": "log",
                                "content": clean_message,
                                "timestamp": asyncio.get_event_loop().time(),
                            }
                        )
                    except (asyncio.QueueFull, RuntimeError):
                        pass

            def flush(self):
                self.original_stdout.flush()

        sys.stdout = StdoutInterceptor(log_queue)

        try:
            await websocket.send_json(
                {"type": "status", "stage": "init", "content": "Initializing..."}
            )

            pdf_path = None
            paper_dir = None

            # Handle PDF upload mode
            if mode == "upload":
                pdf_data = data.get("pdf_data")
                pdf_name = data.get("pdf_name", "exam.pdf")

                if not pdf_data:
                    await websocket.send_json(
                        {"type": "error", "content": "PDF data is required for upload mode"}
                    )
                    return

                # Create batch directory for this mimic session
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                pdf_stem = Path(pdf_name).stem
                batch_dir = MIMIC_OUTPUT_DIR / f"mimic_{timestamp}_{pdf_stem}"
                batch_dir.mkdir(parents=True, exist_ok=True)

                # Save uploaded PDF in batch directory
                pdf_path = batch_dir / pdf_name

                await websocket.send_json(
                    {"type": "status", "stage": "upload", "content": f"Saving PDF: {pdf_name}"}
                )

                # Decode and save PDF
                pdf_bytes = base64.b64decode(pdf_data)
                with open(pdf_path, "wb") as f:
                    f.write(pdf_bytes)

                await websocket.send_json(
                    {
                        "type": "progress",
                        "stage": "parsing",
                        "status": "running",
                        "message": "Parsing PDF exam paper...",
                    }
                )
                logger.info(f"Saved uploaded PDF to: {pdf_path}")

                # Pass batch_dir as output directory
                pdf_path = str(pdf_path)
                output_dir = str(batch_dir)

            elif mode == "parsed":
                paper_path = data.get("paper_path")
                if not paper_path:
                    await websocket.send_json(
                        {"type": "error", "content": "paper_path is required for parsed mode"}
                    )
                    return
                paper_dir = paper_path

                # Create batch directory for parsed mode too
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                batch_dir = MIMIC_OUTPUT_DIR / f"mimic_{timestamp}_{Path(paper_path).name}"
                batch_dir.mkdir(parents=True, exist_ok=True)
                output_dir = str(batch_dir)

            else:
                await websocket.send_json({"type": "error", "content": f"Unknown mode: {mode}"})
                return

            # Create WebSocket callback for real-time progress updates
            async def ws_callback(event_type: str, data: dict):
                """Send progress updates to the frontend via WebSocket."""
                try:
                    message = {"type": event_type, **data}
                    await websocket.send_json(message)
                except Exception as e:
                    logger.debug(f"WebSocket send failed: {e}")

            # Run the complete mimic workflow with callback
            await websocket.send_json(
                {
                    "type": "status",
                    "stage": "processing",
                    "content": "Executing question generation workflow...",
                }
            )

            result = await mimic_exam_questions(
                pdf_path=pdf_path,
                paper_dir=paper_dir,
                kb_name=kb_name,
                output_dir=output_dir,
                max_questions=max_questions,
                ws_callback=ws_callback,
                fast_mode=True,  # Enable fast mode by default for performance
            )

            if result.get("success"):
                # Results are already sent via ws_callback during generation
                # Just send the final complete signal
                total_ref = result.get("total_reference_questions", 0)
                generated = result.get("generated_questions", [])
                failed = result.get("failed_questions", [])

                logger.info(
                    f"Mimic generation complete: {len(generated)} succeeded, {len(failed)} failed"
                )

                await websocket.send_json({"type": "complete"})
            else:
                error_msg = result.get("error", "Unknown error")
                await websocket.send_json({"type": "error", "content": error_msg})
                logger.error(f"Mimic generation failed: {error_msg}")

        finally:
            sys.stdout = original_stdout

    except WebSocketDisconnect:
        logger.debug("Client disconnected during mimic generation")
    except Exception as e:
        logger.error(f"Mimic generation error: {e}")
        try:
            await websocket.send_json({"type": "error", "content": str(e)})
        except:
            pass
    finally:
        sys.stdout = original_stdout
        if pusher_task:
            try:
                pusher_task.cancel()
                await pusher_task
            except:
                pass
        try:
            await websocket.close()
        except:
            pass
