from __future__ import annotations

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from src.core.config import settings
from src.infrastructure.persistence.schema import metadata

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

postgres_dsn = (settings.postgres_dsn or "").strip() or config.get_main_option("sqlalchemy.url")
if not postgres_dsn:
    raise RuntimeError("POSTGRES_DSN is required for Alembic migrations.")
config.set_main_option("sqlalchemy.url", postgres_dsn)

target_metadata = metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

