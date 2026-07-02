FROM python:3.12-slim
WORKDIR /app
COPY requirements-service.txt /tmp/requirements-service.txt
RUN pip install --no-cache-dir -r /tmp/requirements-service.txt
COPY . .
CMD ["python", "app.py"]
