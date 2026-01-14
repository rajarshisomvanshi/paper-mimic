"""Question Agent Coordinator - Simplified for Paper Mimic"""

from pathlib import Path
import sys
from typing import Any

# Add project root to sys.path
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from src.logging.logger import get_logger
from src.services.llm import get_llm_config


class AgentCoordinator:
    """Simplified Agent Coordinator for question generation"""
    
    def __init__(self, max_rounds: int = 10, kb_name: str = "default", output_dir: str = None):
        self.max_rounds = max_rounds
        self.kb_name = kb_name
        self.output_dir = output_dir
        self.logger = type('Logger', (), {'logger': get_logger("AgentCoordinator")})()
        self.token_stats = {}
        self.agent_status = {}
    
    async def generate_question(self, requirement: dict[str, Any]) -> dict[str, Any]:
        """Generate a question based on the requirement"""
        # This is a placeholder - in a real implementation, this would use
        # language models to generate questions
        try:
            llm_config = get_llm_config()
            from openai import AsyncOpenAI
            
            client = AsyncOpenAI(api_key=llm_config.api_key, base_url=llm_config.base_url)
            
            system_prompt = """You are an expert question generator. Your task is to generate educational questions 
based on reference questions. The generated question should:
1. Cover the same core concepts as the reference
2. Have similar difficulty level
3. Use different scenarios/contexts
4. Be well-structured and clear"""
            
            user_prompt = f"""Generate a new question based on this reference:

Reference Question: {requirement.get('reference_question', '')}

Additional Requirements: {requirement.get('additional_requirements', '')}

Return ONLY a valid JSON object with this structure:
{{"question": {{"question": "...", "type": "...", "answer": "..."}}, "validation": {{"relevance": 0.9, "difficulty": "medium"}}}}"""
            
            response = await client.chat.completions.create(
                model=llm_config.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.7,
                max_tokens=2000,
            )
            
            result_text = response.choices[0].message.content
            
            # Extract JSON from potential markdown code blocks
            clean_text = result_text.strip()
            if "```" in clean_text:
                # Find the first { and last } which matches the expected JSON structure
                start_idx = clean_text.find("{")
                end_idx = clean_text.rfind("}")
                if start_idx != -1 and end_idx != -1:
                    clean_text = clean_text[start_idx:end_idx+1]
            
            import json
            try:
                result = json.loads(clean_text)
            except json.JSONDecodeError:
                # Fallback: try to find specifically the { at start and } at end if naive strip failed
                start_idx = result_text.find("{")
                end_idx = result_text.rfind("}")
                if start_idx != -1 and end_idx != -1:
                    clean_text = result_text[start_idx:end_idx+1]
                    result = json.loads(clean_text)
                else:
                     raise
            
            return {
                "success": True,
                "question": result.get("question", {}),
                "validation": result.get("validation", {}),
                "rounds": 1,
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "reason": "Generation failed",
            }
    
    async def generate_questions_custom(self, base_requirement: dict, num_questions: int):
        """Generate multiple questions (custom mode)"""
        results = []
        for i in range(num_questions):
            result = await self.generate_question(base_requirement)
            results.append(result)
        
        return {
            "success": True,
            "requested": num_questions,
            "completed": len([r for r in results if r.get("success")]),
            "failed": len([r for r in results if not r.get("success")]),
            "results": results,
        }


# Export AgentCoordinator
__all__ = ["AgentCoordinator"]
