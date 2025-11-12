FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

WORKDIR /app
COPY . /app/

RUN apt update && \
    apt install -y ffmpeg && \
    apt clean && rm -rf /var/lib/apt/lists/*
RUN if [ -f uv.lock ]; then uv sync --frozen; else uv sync; fi

CMD ["uv", "run", "app.py"]

