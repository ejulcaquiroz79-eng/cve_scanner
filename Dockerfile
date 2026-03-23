FROM python:3.10-slim

# Instalar dependencias del sistema
RUN apt update && apt install -y nmap cron

WORKDIR /app

# Instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el scanner
COPY scanner.py /app/scanner.py

# Copiar el servidor Flask
COPY server.py /app/server.py

# Copiar el script que ejecuta cron
COPY server/run.sh /app/run.sh
RUN chmod +x /app/run.sh

# Copiar crontab
COPY server/crontab.txt /etc/cron.d/cve-cron
RUN chmod 0644 /etc/cron.d/cve-cron

# Crear archivo de log
RUN touch /var/log/cron.log

# Copiar start.sh (ESTE ERA EL PASO QUE FALTABA)
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# ENTRYPOINT para ejecutar el scanner + cron + flask
ENTRYPOINT ["/app/start.sh"]

# CMD para iniciar cron (solo si no se pasan parámetros)
CMD ["bash", "/app/run.sh"]
