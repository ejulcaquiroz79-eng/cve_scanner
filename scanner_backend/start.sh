#!/bin/bash

echo "=== Iniciando cron ==="
cron

echo "=== Iniciando servidor Flask ==="
python3 /app/server.py &

# Esperar a que Flask arranque
sleep 3

echo "=== Ejecutando escaneo automático del host ==="
curl -X POST http://localhost:9000/api/nuclei/run

echo "=== Escaneo automático completado ==="

# Mantener el contenedor vivo
wait

