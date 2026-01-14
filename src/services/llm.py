"""LLM Configuration module"""

import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass
class LLMConfig:
    """LLM configuration"""
    api_key: str
    base_url: str
    model: str


def get_llm_config() -> LLMConfig:
    """Get LLM configuration from environment variables"""
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv("LLM_API_KEY")
    base_url = os.getenv("GEMINI_BASE_URL") or os.getenv("OPENAI_BASE_URL") or os.getenv("LLM_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/")
    model = os.getenv("LLM_MODEL", "gemini-2.0-flash")
    
    if not api_key:
        raise ValueError(
            "LLM API key not configured. "
            "Please set GEMINI_API_KEY environment variable"
        )
    
    return LLMConfig(
        api_key=api_key,
        base_url=base_url,
        model=model,
    )
