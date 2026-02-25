from supabase import create_client, Client
from supabase.client import ClientOptions
from functools import lru_cache
from app.core.config import get_settings


@lru_cache()
def get_supabase_client() -> Client:

    options = ClientOptions(
    postgrest_client_timeout=30,
    storage_client_timeout=30,
)
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_anon_key, options)


@lru_cache()
def get_supabase_admin_client() -> Client:
    """Admin client using service role key — use only server-side."""
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
