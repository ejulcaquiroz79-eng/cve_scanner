#!/bin/bash

echo "Ejecutando el scanner de CVE..."
python3 /app/scanner.py

echo "Reporte generado en /app/output/reporte.csv"

echo "Iniciando servidor HTTP en el puerto 9000..."
python3 -m http.server 9000 --directory /app/output
