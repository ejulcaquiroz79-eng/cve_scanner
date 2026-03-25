from flask import Flask, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# -----------------------------
# Endpoint original (lo mantenemos)
# -----------------------------
@app.get("/reporte")
def get_reporte():
    ruta = "/app/output/reporte.json"
    if not os.path.exists(ruta):
        return jsonify({"error": "reporte.json no encontrado"}), 404

    with open(ruta, "r") as f:
        data = json.load(f)

    return jsonify(data)

# -----------------------------
# NUEVO: Endpoint para React
# -----------------------------
@app.get("/api/reporte")
def api_reporte():
    ruta = "/app/output/reporte.json"
    if not os.path.exists(ruta):
        return jsonify({"error": "reporte.json no encontrado"}), 404

    with open(ruta, "r") as f:
        data = json.load(f)

    return jsonify(data)

# -----------------------------
# NUEVO: Endpoint solo drivers
# -----------------------------
@app.get("/api/drivers")
def api_drivers():
    ruta = "/app/output/reporte.json"
    if not os.path.exists(ruta):
        return jsonify({"error": "reporte.json no encontrado"}), 404

    with open(ruta, "r") as f:
        data = json.load(f)

    return jsonify(data.get("drivers", {}))

# -----------------------------
# Inicio del servidor
# -----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000)
