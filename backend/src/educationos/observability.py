import json
import logging
from datetime import UTC, datetime

from fastapi import FastAPI

from educationos.config import Settings


class JsonFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps(
            {
                "timestamp": datetime.now(UTC).isoformat(),
                "level": record.levelname,
                "event": record.getMessage(),
                **getattr(record, "safe_fields", {}),
            }
        )


def configure_observability(app: FastAPI, settings: Settings):
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    logger = logging.getLogger("educationos")
    logger.handlers = [handler]
    logger.setLevel(logging.INFO)
    logger.propagate = False
    if settings.otlp_endpoint:
        from opentelemetry import trace
        from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor

        provider = TracerProvider(resource=Resource.create({"service.name": "educationos-api"}))
        provider.add_span_processor(
            BatchSpanProcessor(
                OTLPSpanExporter(
                    endpoint=settings.otlp_endpoint,
                )
            )
        )
        trace.set_tracer_provider(provider)
        # Deliberately use explicit coarse spans. Automatic HTTP instrumentation may
        # capture learner IDs, query strings, cookies, or headers in telemetry.
        app.state.tracer = trace.get_tracer("educationos")
