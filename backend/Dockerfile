# Dockerfile dla Django (backend)
ARG PYTHON_VERSION=3.11.8
FROM python:${PYTHON_VERSION} as base

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN python -m pip install --upgrade pip

ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

COPY requirements.txt /app/
RUN --mount=type=cache,target=/root/.cache/pip \
    python -m pip install -r requirements.txt

USER appuser
COPY . .

EXPOSE 8000
CMD ["gunicorn", "cs2market_backend.wsgi:application", "--bind", "0.0.0.0:8000"]