from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # JWT Auth
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # PostgreSQL
    database_url: str

    # App
    secret_key: str = "change-me"
    cors_origins: str = "http://localhost:3000"
    environment: str = "development"

    # AWS S3
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_s3_bucket_name: str = "abha-sync-records"
    aws_s3_region: str = "us-east-1"

    # AWS Bedrock & Textract
    aws_bedrock_region: str = "us-east-1"
    aws_textract_region: str = "us-east-1"  # must match S3 bucket region
    ai_service: str = "bedrock"  # options: 'bedrock' or 'nvidia'
    nvidia_api_key: str = ""     # required when AI_SERVICE=nvidia

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
