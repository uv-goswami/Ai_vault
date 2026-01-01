# backend/Dockerfile

# 1. Use a lightweight Python image
FROM python:3.10-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Install system dependencies (needed for Postgres)
RUN apt-get update && apt-get install -y libpq-dev gcc

# 4. Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of the application code
COPY . .

# 6. Expose the port (Render handles SSL, we just listen on HTTP)
EXPOSE 8000

# 7. Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]