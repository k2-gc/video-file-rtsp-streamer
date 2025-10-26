FROM python:3.12.12-slim

WORKDIR /app
COPY . /app/

RUN apt update && \
    apt install -y ffmpeg && \
    apt clean && rm -rf /var/lib/apt/lists/* && \
    pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

CMD ["python", "app.py"]

