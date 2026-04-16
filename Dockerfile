FROM python:3.10-slim

RUN apt update && apt install -y nmap cron

WORKDIR /app

# Copiar requirements
COPY scanner_backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copiar backend
COPY scanner_backend/scanner.py /app/scanner.py
COPY scanner_backend/drivers_scanner.py /app/drivers_scanner.py
COPY scanner_backend/server.py /app/server.py
COPY scanner_backend/run.sh /app/run.sh
COPY scanner_backend/start.sh /app/start.sh

# Copiar cron
COPY scanner_server/crontab.txt /etc/cron.d/cve-cron
COPY scanner_server/run.sh /app/cron-run.sh

# Permisos
RUN chmod +x /app/run.sh && chmod +x /app/start.sh && chmod +x /app/cron-run.sh
RUN chmod 0644 /etc/cron.d/cve-cron

RUN crontab /etc/cron.d/cve-cron

CMD ["bash", "/app/run.sh"]

