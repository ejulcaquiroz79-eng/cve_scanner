FROM python:3.10-slim

ENV DEBIAN_FRONTEND=noninteractive

# -----------------------------
# 1. Dependencias del sistema
# -----------------------------
RUN apt-get update && \
    apt-get install -y \
        nmap \
        cron \
        pciutils \
        dmidecode \
        wget \
        unzip \
        curl \
        ca-certificates && \
    update-ca-certificates

# -----------------------------
# 2. Instalar Nuclei v3.8.0
# -----------------------------
RUN wget https://github.com/projectdiscovery/nuclei/releases/download/v3.8.0/nuclei_3.8.0_linux_amd64.zip -O nuclei.zip && \
    unzip nuclei.zip && \
    mv nuclei /usr/local/bin/nuclei && \
    chmod +x /usr/local/bin/nuclei && \
    rm nuclei.zip

# -----------------------------
# 3. Directorio de trabajo
# -----------------------------
WORKDIR /app

# -----------------------------
# 4. Instalar dependencias Python
# -----------------------------
COPY scanner_backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# -----------------------------
# 5. Copiar backend completo
# -----------------------------
COPY scanner_backend/ /app/

# -----------------------------
# 6. Copiar scripts correctos
# -----------------------------
COPY scanner_backend/start.sh /app/start.sh
COPY scanner_backend/run.sh /app/run.sh

# -----------------------------
# 7. Archivos de cron
# -----------------------------
COPY scanner_server/crontab.txt /etc/cron.d/cve-cron

# -----------------------------
# 8. Permisos
# -----------------------------
RUN chmod +x /app/start.sh && \
    chmod +x /app/run.sh && \
    chmod 0644 /etc/cron.d/cve-cron

# -----------------------------
# 9. Crear carpetas necesarias
# -----------------------------
RUN mkdir -p /app/output && \
    mkdir -p /app/nuclei_output

# -----------------------------
# 10. Activar cron
# -----------------------------
RUN crontab /etc/cron.d/cve-cron

# -----------------------------
# 11. Exponer puerto correcto
# -----------------------------
EXPOSE 9100

# -----------------------------
# 12. Ejecutar backend
# -----------------------------
ENTRYPOINT ["/app/start.sh"]

