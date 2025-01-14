# Use an official Python runtime as a parent image
FROM python:3.12

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container
COPY . .

# Create and activate a virtual environment
RUN python -m venv venv
RUN . venv/bin/activate

# Install dependencies
RUN venv/bin/pip install --no-cache-dir -r requirements.txt

# Expose the port Flask uses
EXPOSE 5000

# Run the application
CMD ["venv/bin/python", "run.py"]
