"""
VERSSAI Configuration Management
Centralized configuration for all environment variables and settings
"""
import os
from typing import List, Optional
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

class Config:
    """Centralized configuration management for VERSSAI"""
    
    # Database Configuration
    POSTGRES_URL: str = os.environ.get('POSTGRES_URL', 'postgresql://verssai_user:verssai_secure_password_2024@localhost:5432/verssai_vc')
    MONGO_URL: str = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/verssai')
    DB_NAME: str = os.environ.get('DB_NAME', 'verssai')
    
    # AI Service Configuration
    GEMINI_API_KEY: Optional[str] = os.environ.get('GEMINI_API_KEY')
    OPENAI_API_KEY: Optional[str] = os.environ.get('OPENAI_API_KEY')
    
    # External API Configuration
    GOOGLE_API_KEY: Optional[str] = os.environ.get('GOOGLE_API_KEY')
    GOOGLE_SEARCH_ENGINE_ID: Optional[str] = os.environ.get('GOOGLE_SEARCH_ENGINE_ID')
    
    # Twitter API Configuration
    TWITTER_API_KEY: Optional[str] = os.environ.get('TWITTER_API_KEY')
    TWITTER_API_SECRET: Optional[str] = os.environ.get('TWITTER_API_SECRET')
    TWITTER_BEARER_TOKEN: Optional[str] = os.environ.get('TWITTER_BEARER_TOKEN')
    TWITTER_ACCESS_TOKEN: Optional[str] = os.environ.get('TWITTER_ACCESS_TOKEN')
    TWITTER_ACCESS_TOKEN_SECRET: Optional[str] = os.environ.get('TWITTER_ACCESS_TOKEN_SECRET')
    
    # LangChain Configuration
    LANGCHAIN_TRACING_V2: bool = os.environ.get('LANGCHAIN_TRACING_V2', 'false').lower() == 'true'
    LANGCHAIN_PROJECT: str = os.environ.get('LANGCHAIN_PROJECT', 'VERSSAI-VC-Intelligence')
    LANGCHAIN_API_KEY: Optional[str] = os.environ.get('LANGCHAIN_API_KEY')
    
    # ChromaDB Configuration
    CHROMA_HOST: str = os.environ.get('CHROMA_HOST', 'localhost')
    CHROMA_PORT: int = int(os.environ.get('CHROMA_PORT', '8000'))
    
    # File Upload Configuration
    UPLOAD_PATH: Path = Path(os.environ.get('UPLOAD_PATH', './uploads'))
    MAX_FILE_SIZE: int = int(os.environ.get('MAX_FILE_SIZE', '52428800'))  # 50MB
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = os.environ.get('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001').split(',')
    
    # Security Configuration
    SECRET_KEY: str = os.environ.get('SECRET_KEY', 'your_secure_secret_key_here_change_in_production')
    JWT_SECRET_KEY: str = os.environ.get('JWT_SECRET_KEY', 'your_jwt_secret_key_here_change_in_production')
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.environ.get('RATE_LIMIT_PER_MINUTE', '100'))
    RATE_LIMIT_PER_HOUR: int = int(os.environ.get('RATE_LIMIT_PER_HOUR', '1000'))
    
    # Logging Configuration
    LOG_LEVEL: str = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE: Optional[Path] = Path(os.environ.get('LOG_FILE', './logs/verssai.log')) if os.environ.get('LOG_FILE') else None
    
    # Feature Flags
    ENABLE_AI_ANALYSIS: bool = os.environ.get('ENABLE_AI_ANALYSIS', 'true').lower() == 'true'
    ENABLE_ENHANCED_RESEARCH: bool = os.environ.get('ENABLE_ENHANCED_RESEARCH', 'true').lower() == 'true'
    ENABLE_PORTFOLIO_MANAGEMENT: bool = os.environ.get('ENABLE_PORTFOLIO_MANAGEMENT', 'true').lower() == 'true'
    
    @classmethod
    def validate(cls) -> List[str]:
        """Validate configuration and return list of warnings/errors"""
        warnings = []
        
        # Check required API keys
        if not cls.GEMINI_API_KEY and not cls.OPENAI_API_KEY:
            warnings.append("No AI API key configured (GEMINI_API_KEY or OPENAI_API_KEY)")
        
        if not cls.GOOGLE_API_KEY:
            warnings.append("Google Search API not configured - enhanced research will be limited")
        
        if not cls.TWITTER_BEARER_TOKEN:
            warnings.append("Twitter API not configured - social research will be limited")
        
        # Check security settings
        if cls.SECRET_KEY == 'your_secure_secret_key_here_change_in_production':
            warnings.append("Using default SECRET_KEY - change in production")
        
        if cls.JWT_SECRET_KEY == 'your_jwt_secret_key_here_change_in_production':
            warnings.append("Using default JWT_SECRET_KEY - change in production")
        
        # Check database configuration
        if 'localhost' in cls.POSTGRES_URL and 'verssai_secure_password_2024' in cls.POSTGRES_URL:
            warnings.append("Using default database credentials - change in production")
        
        return warnings
    
    @classmethod
    def is_production(cls) -> bool:
        """Check if running in production environment"""
        return os.environ.get('ENVIRONMENT', 'development').lower() == 'production'
    
    @classmethod
    def get_database_config(cls) -> dict:
        """Get database configuration for connection"""
        return {
            'postgres_url': cls.POSTGRES_URL,
            'mongo_url': cls.MONGO_URL,
            'db_name': cls.DB_NAME
        }
    
    @classmethod
    def get_ai_config(cls) -> dict:
        """Get AI service configuration"""
        return {
            'gemini_available': bool(cls.GEMINI_API_KEY),
            'openai_available': bool(cls.OPENAI_API_KEY),
            'ai_provider': 'gemini' if cls.GEMINI_API_KEY else 'openai' if cls.OPENAI_API_KEY else 'none'
        }

# Global config instance
config = Config()
