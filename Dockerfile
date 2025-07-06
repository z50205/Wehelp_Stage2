FROM python:3.9-alpine

WORKDIR /app

COPY ./taipei-day-trip/requirements.txt /requirements.txt

RUN pip install --no-cache-dir --upgrade -r /requirements.txt

COPY ./taipei-day-trip /app

CMD ["fastapi", "run", "app.py", "--port", "8000"]