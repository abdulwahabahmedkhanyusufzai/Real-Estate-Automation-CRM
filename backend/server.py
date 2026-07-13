import logging
import uvicorn
from app.main import app


class HealthCheckFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        # Exclude health check requests from access logs
        return "/health" not in record.getMessage()


if __name__ == "__main__":
    # Add filter to uvicorn access logger
    logging.getLogger("uvicorn.access").addFilter(HealthCheckFilter())
    uvicorn.run(app, host="0.0.0.0", port=8080, log_level="info")
