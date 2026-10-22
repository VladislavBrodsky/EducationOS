FROM python:3.13-slim-bookworm@sha256:a1165e272e578941b84abc79e4ab38a0305cd12803a5c4247979ac7655f4d641 AS builder
RUN pip install --no-cache-dir uv==0.10.11
WORKDIR /app
COPY shared ./shared
COPY backend ./backend
WORKDIR /app/backend
RUN uv sync --frozen --no-dev --no-editable

FROM python:3.13-slim-bookworm@sha256:a1165e272e578941b84abc79e4ab38a0305cd12803a5c4247979ac7655f4d641 AS runtime
RUN groupadd --gid 10001 educationos && useradd --uid 10001 --gid educationos --create-home educationos
WORKDIR /app
COPY --from=builder --chown=educationos:educationos /app/backend /app/backend
COPY --from=builder --chown=educationos:educationos /app/shared /app/shared
ENV PATH="/app/backend/.venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    EDUCATIONOS_CURRICULUM_PATH=/app/shared/curriculum/missions.v1.json
USER educationos
WORKDIR /app/backend
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "educationos.main:app", "--host", "0.0.0.0", "--port", "8000", "--no-access-log"]
