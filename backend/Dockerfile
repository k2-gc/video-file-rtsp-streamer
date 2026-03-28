FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

WORKDIR /app

RUN apt update && \
    apt install -y ffmpeg && \
    apt clean && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml uv.lock ./

RUN uv sync --frozen --no-dev

COPY . .

RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app && \
    mkdir -p /app/uploads /app/data && \
    chown appuser:appuser /app/uploads /app/data
USER appuser

CMD ["uv", "run", "app.py"]

