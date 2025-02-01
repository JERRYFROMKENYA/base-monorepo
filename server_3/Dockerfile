# Use an official slim Python runtime as a parent image
FROM python:3.12-slim

# Set environment variables to prevent Python from buffering output
ENV PYTHONUNBUFFERED=1

# Set the working directory
WORKDIR /app

# Install system dependencies for common Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements to leverage caching
COPY requirements.txt ./

# Install Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port Flask uses
EXPOSE 9000

# Run the application
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:9000", "app:app"]

