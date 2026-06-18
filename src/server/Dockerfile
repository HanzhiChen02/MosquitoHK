# start by pulling the python image
FROM python:3.12

# copy the requirements file into the image
# COPY ./requirements.txt /app/requirements.txt

# switch working directory
WORKDIR /app

# copy every content from the local file to the image
COPY . /app

# install the dependencies and packages in the requirements file
RUN pip install --no-cache-dir -r requirements.txt

# configure the container to run in an executed manner
# ENTRYPOINT [ "python" ]

# Expose the port Gunicorn will listen on
EXPOSE 5000

# Command to run Flask application
# CMD ["python3", "app.py"]
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]

# Run in dev mode
ENV FLASK_ENV=development

# Command to run Gunicorn and serve your Flask application
# CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
# CMD ["gunicorn", "--bind", "0.0.0.0:8000", "-w", "8", "--threads", "8", "app:app"]
