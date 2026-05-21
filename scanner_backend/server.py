from flask import Flask, request, jsonify
from flask_cors import CORS
from nuclei_scanner import run_nuclei_scan, save_nuclei_history
import datetime
import os
import json
import subprocess
from drivers_scanner import get_system_summary
import requests   # ← IMPORTANTE para detección automática del host

app = Flask(__name__)
CORS(app)

# -----------------------------
#  GET /reporte
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
#  GET /api/reporte
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
#  GET /api/drivers
# -----------------------------
@app.get("/api/drivers")
def api_drivers():
    info = get_system_summary()
    return jsonify(info)

# -----------------------------
#  GET /api/historial
# -----------------------------
@app.get("/api/historial")
def api_historial():
    ruta = "output/historial.json"
    if not os.path.exists(ruta):
        return jsonify([])

    with open(ruta, "r") as f:
        data = json.load(f)

    return jsonify(data)

# -----------------------------
#  POST /api/reset
# -----------------------------
@app.post("/api/reset")
def api_reset():
    try:
        if os.path.exists("output/reporte.json"):
            os.remove("output/reporte.json")
        if os.path.exists("output/historial.json"):
            os.remove("output/historial.json")

        return jsonify({"status": "ok", "message": "Archivos eliminados"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# -----------------------------
#  POST /api/scan
# -----------------------------
@app.post("/api/scan")
def api_scan():
    try:
        script_path = os.path.join(os.getcwd(), "scanner.py")

        if not os.path.exists(script_path):
            return jsonify({"status": "error", "message": "scanner.py no encontrado"}), 500

        subprocess.run(["python3", script_path], check=True)

        return jsonify({"status": "ok", "message": "Escaneo completado"})
    except subprocess.CalledProcessError as e:
        return jsonify({"status": "error", "message": f"Error ejecutando scanner.py: {e}"}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# -----------------------------
#  POST /api/nuclei/run
#  (CORREGIDO: detección automática del host)
# -----------------------------
@app.route("/api/nuclei/run", methods=["POST"])
def api_nuclei_run():

    # 1. Posibles IPs del host según el sistema operativo
    posibles_hosts = [
        "http://host.docker.internal",  # Windows / Mac / algunas distros Linux
        "http://172.17.0.1"            # Linux (Ubuntu, Debian, Kali, Mint, servidores)
    ]

    target = None

    # 2. Detectar automáticamente cuál responde
    for h in posibles_hosts:
        try:
            requests.get(h, timeout=1)
            target = h
            break
        except:
            continue

    # 3. Si ninguna responde, devolver error
    if not target:
        return jsonify({
            "error": True,
            "message": "No se pudo detectar el host automáticamente"
        }), 500

    # 4. Ejecutar Nuclei contra el host detectado
    entry, output_file = run_nuclei_scan(target)

    # 5. Guardar historial
    save_nuclei_history(entry)

    return jsonify({
        "error": entry["error"],
        "results": entry.get("results", []),
        "file": output_file,
        "timestamp": entry["timestamp"],
        "target": entry["target"],
        "count": len(entry.get("results", [])) if entry.get("results") else 0
    })

# -----------------------------
#  GET /api/nuclei/history
# -----------------------------
@app.route("/api/nuclei/history", methods=["GET"])
def nuclei_history():
    history_file = "/app/nuclei_history.json"

    if not os.path.exists(history_file):
        return jsonify([])

    try:
        with open(history_file, "r") as f:
            history = json.load(f)
    except:
        history = []

    # Ordenar por fecha (más reciente primero)
    history = sorted(history, key=lambda x: x.get("timestamp", ""), reverse=True)

    return jsonify(history)

# -----------------------------
#  GET /api/nuclei/report/<timestamp>
# -----------------------------
@app.route("/api/nuclei/report/<timestamp>", methods=["GET"])
def nuclei_report(timestamp):
    history_file = "/app/nuclei_history.json"

    if not os.path.exists(history_file):
        return jsonify({"error": "No history found"}), 404

    with open(history_file, "r") as f:
        history = json.load(f)

    for entry in history:
        if entry.get("timestamp") == timestamp:
            return jsonify(entry)

    return jsonify({"error": "Report not found"}), 404

# -----------------------------
#  POST /api/nuclei/clear-history
# -----------------------------
@app.route("/api/nuclei/clear-history", methods=["POST"])
def clear_nuclei_history():
    history_file = "/app/nuclei_history.json"

    try:
        with open(history_file, "w") as f:
            f.write("[]")
        return jsonify({"status": "ok", "message": "Historial eliminado"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# -----------------------------
#  MAIN
# -----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000)

