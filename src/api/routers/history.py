from fastapi import APIRouter, HTTPException
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel
import json
import os
from datetime import datetime

router = APIRouter(prefix="/api/history", tags=["history"])

class HistoryItem(BaseModel):
    id: str  # Folder name
    timestamp: str
    paper_name: str
    total_questions: int
    success_count: int
    preview_path: str

@router.get("/", response_model=List[HistoryItem])
async def list_history():
    """List all past generation sessions"""
    # Define root path for history
    project_root = Path(__file__).parent.parent.parent.parent
    history_dir = project_root / "data" / "user" / "question" / "mimic_papers"
    
    if not history_dir.exists():
        return []
    
    items = []
    
    # Sort by modification time (newest first)
    dirs = sorted(
        [d for d in history_dir.iterdir() if d.is_dir()],
        key=lambda x: x.stat().st_mtime,
        reverse=True
    )
    
    for d in dirs:
        try:
            # Find the questions JSON file
            json_files = list(d.glob("*_generated_questions.json"))
            if not json_files:
                continue
                
            json_file = json_files[0]
            
            # Read metadata (light read)
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            # Create ID from folder name
            folder_name = d.name
            
            # Extract basic info
            generated_qs = data.get("generated_questions", [])
            total = data.get("total_reference_questions", 0)
            
            # Try to parse timestamp from folder name mimic_YYYYMMDD_HHMMSS_paper
            # Format: mimic_%Y%m%d_%H%M%S_name
            parts = folder_name.split("_")
            display_time = "Unknown"
            paper_name = "Unknown"
            
            if len(parts) >= 3:
                date_str = f"{parts[1]}_{parts[2]}"
                try:
                    dt = datetime.strptime(date_str, "%Y%m%d_%H%M%S")
                    display_time = dt.strftime("%Y-%m-%d %H:%M")
                except:
                    pass
                paper_name = "_".join(parts[3:])
            
            items.append(HistoryItem(
                id=folder_name,
                timestamp=display_time,
                paper_name=paper_name,
                total_questions=total,
                success_count=len(generated_qs),
                preview_path=str(json_file)
            ))
            
        except Exception as e:
            print(f"Error parsing history for {d}: {e}")
            continue
            
    return items

@router.get("/{session_id}")
async def get_history_session(session_id: str):
    """Get full data for a specific session"""
    project_root = Path(__file__).parent.parent.parent.parent
    history_dir = project_root / "data" / "user" / "question" / "mimic_papers"
    
    target_dir = history_dir / session_id
    
    if not target_dir.exists():
        raise HTTPException(status_code=404, detail="Session not found")
        
    json_files = list(target_dir.glob("*_generated_questions.json"))
    if not json_files:
        raise HTTPException(status_code=404, detail="Data file not found")
        
    with open(json_files[0], "r", encoding="utf-8") as f:
        return json.load(f)

@router.delete("/{session_id}")
async def delete_history_session(session_id: str):
    """Delete a specific history session"""
    import shutil
    
    project_root = Path(__file__).parent.parent.parent.parent
    history_dir = project_root / "data" / "user" / "question" / "mimic_papers"
    
    target_dir = history_dir / session_id
    
    if not target_dir.exists():
        raise HTTPException(status_code=404, detail="Session not found")
        
    try:
        shutil.rmtree(target_dir)
        return {"status": "success", "message": f"Session {session_id} deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {str(e)}")
