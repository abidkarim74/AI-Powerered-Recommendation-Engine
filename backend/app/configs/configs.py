from pydantic_settings import BaseSettings, SettingsConfigDict


class Setting(BaseSettings):
    ACCESS_SECRET: str
    REFRESH_SECRET: str
    ALGORYTHM: str
    ACCESS_EXPIRATION: int
    DATABASE_URL: str
    REFRESH_EXPIRATION: int
    GEMINAI: str
    LLM_MODEL: str
    LLM_BASE_URL: str

    model_config = SettingsConfigDict(
        env_file='.env',
        extra='ignore'
    )

settings = Setting()