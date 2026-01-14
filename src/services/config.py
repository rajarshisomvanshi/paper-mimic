"""Configuration module for Paper Mimic"""

from pathlib import Path
import yaml


def load_config_with_main(config_name: str, project_root: Path = None):
    """Load configuration from YAML files"""
    if project_root is None:
        project_root = Path(__file__).parent.parent.parent

    config_dir = project_root / "config"
    
    # Try to load main config
    main_config_path = config_dir / "main.yaml"
    if not main_config_path.exists():
        # Return default config if not found
        return _get_default_config()
    
    with open(main_config_path, encoding="utf-8") as f:
        config = yaml.safe_load(f) or {}
    
    # Try to load specific config
    specific_config_path = config_dir / config_name
    if specific_config_path.exists():
        with open(specific_config_path, encoding="utf-8") as f:
            specific_config = yaml.safe_load(f) or {}
            config.update(specific_config)
    
    return config


def get_agent_params(agent_name: str):
    """Get agent parameters"""
    config = load_config_with_main("agents.yaml")
    agents = config.get("agents", {})
    agent = agents.get(agent_name, {})
    
    return {
        "temperature": agent.get("temperature", 0.7),
        "max_tokens": agent.get("max_tokens", 4000),
    }


def _get_default_config():
    """Return default configuration"""
    return {
        "question": {
            "max_parallel_questions": 3,
        },
        "agents": {
            "question": {
                "temperature": 0.7,
                "max_tokens": 4000,
            }
        }
    }
