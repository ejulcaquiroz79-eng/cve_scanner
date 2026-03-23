#!/bin/bash

# Iniciar cron
cron

# Ejecutar el scanner en segundo plano
python3 /app/scanner.py &

# Iniciar Flask en primer plano (mantiene el contenedor vivo)
python3 /app/server.py
