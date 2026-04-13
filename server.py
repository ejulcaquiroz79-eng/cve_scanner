from flask import Flask, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # Permite peticiones desde el frontend

# -----------------------------
# Endpoint original
# -----------------------------
@app.get("/reporte")
def get_reporte():
    ruta = "output/reporte.json"
    if not os.path.exists(ruta):
        return jsonify({"error": "reporte.json no encontrado"}), 404

    with open(ruta, "r") as f:
        data = json.load(f)

    return jsonify(data)

# -----------------------------
# Endpoint para React
# -----------------------------
@app.get("/api/reporte")
def api_reporte():
    ruta = "output/reporte.json"
    if not os.path.exists(ruta):
        return jsonify({"error": "reporte.json no encontrado"}), 404

    with open(ruta, "r") as f:
        data = json.load(f)

    return jsonify(data)

# -----------------------------
# Endpoint solo drivers
# -----------------------------
@app.get("/api/drivers")
def api_drivers():
    ruta = "output/reporte.json"
    if not os.path.exists(ruta):
        return jsonify({"error": "reporte.json no encontrado"}), 404

    with open(ruta, "r") as f:
        data = json.load(f)

    return jsonify(data.get("drivers", {}))

# -----------------------------
# NUEVO: Endpoint historial
# -----------------------------
@app.get("/api/historial")
def api_historial():
    ruta = "output/historial.json"

    # Si no existe, devolver lista vacía
    if not os.path.exists(ruta):
        return jsonify([])

    with open(ruta, "r") as f:
        data = json.load(f)

    return jsonify(data)

# -----------------------------
# Inicio del servidor
# -----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000)

