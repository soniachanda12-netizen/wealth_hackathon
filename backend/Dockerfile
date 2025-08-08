# Backend Dockerfile for Advisor Copilot
FROM python:3.9-slim
WORKDIR /app
COPY . .
COPY requirements.txt .
RUN apt-get update && apt-get install -y git \
    && pip install --no-cache-dir -r requirements.txt
EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
