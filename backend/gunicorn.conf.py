"""
Gunicorn configuration for CC — Career Craft on Render / production.
Guarantees binding to 0.0.0.0:$PORT and sets resource-safe worker & timeout limits.
"""
import os

# Render automatically provides $PORT. Fallback to 5000 for local runs.
port = os.environ.get("PORT", "5000")
bind = f"0.0.0.0:{port}"

# On Render Free Tier (512MB RAM), 1 worker with 2 threads is optimal
# to prevent Out-Of-Memory (OOM) crashes while handling concurrent requests.
workers = int(os.environ.get("WEB_CONCURRENCY", "1"))
threads = int(os.environ.get("PYTHON_GET_THREADS", "2"))
worker_class = "gthread"

# Set a 120-second timeout to prevent WORKER TIMEOUT during cold starts or ML tasks
timeout = int(os.environ.get("GUNICORN_TIMEOUT", "120"))
keepalive = 5

# Stream logs directly to stdout/stderr so they show in Render's dashboard
accesslog = "-"
errorlog = "-"
loglevel = "info"
capture_output = True
enable_stdio_inheritance = True
