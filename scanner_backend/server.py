from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from nuclei_scanner import run_nuclei_scan, save_nuclei_history
import time
import datetime
import os
import json
import subprocess
from drivers_scanner import get_system_summary
import requests
import re

app = Flask(__name__)
CORS(app)

# ============================================================
#  GET /reporte  →  REPORTE CVE (scanner.py)
# ============================================================
@app.get("/reporte")
def get_reporte():
    ruta = "output/reporte.json"

    if not os.path.exists(ruta):
        return jsonify({"count": 0, "results": []})

    with open(ruta, "r") as f:
        data = json.load(f)

    vulnerabilidades = data.get("vulnerabilidades", [])

    return jsonify({
        "count": len(vulnerabilidades),
        "results": vulnerabilidades
    })

# ============================================================
#  GET /api/reporte  →  REPORTE CVE (scanner.py)
# ============================================================
@app.get("/api/reporte")
def api_reporte():
    ruta = "output/reporte.json"

    if not os.path.exists(ruta):
        return jsonify({"count": 0, "results": []})

    with open(ruta, "r") as f:
        data = json.load(f)

    vulnerabilidades = data.get("vulnerabilidades", [])

    return jsonify({
        "count": len(vulnerabilidades),
        "results": vulnerabilidades
    })

# ============================================================
#  GET /api/drivers
# ============================================================
@app.get("/api/drivers")
def api_drivers():
    try:
        info = get_system_summary()

        if not isinstance(info, dict):
            return jsonify({
                "arquitectura": None,
                "kernel_version": None,
                "os_contenedor": None,
                "escaneado": None,
                "fecha_detectado": None,
                "interfaces_red": [],
                "discos_detectados": [],
                "modulos_kernel": []
            })

        return jsonify(info)

    except Exception as e:
        return jsonify({
            "error": True,
            "message": str(e),
            "arquitectura": None,
            "kernel_version": None,
            "os_contenedor": None,
            "escaneado": None,
            "fecha_detectado": None,
            "interfaces_red": [],
            "discos_detectados": [],
            "modulos_kernel": []
        })

# ============================================================
#  GET /api/historial
# ============================================================
@app.get("/api/historial")
def api_historial():
    ruta = "output/historial.json"
    if not os.path.exists(ruta):
        return jsonify([])

    with open(ruta, "r") as f:
        data = json.load(f)

    return jsonify(data)

# ============================================================
#  POST /api/reset
# ============================================================
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

# ============================================================
#  POST /api/scan  → ejecuta scanner.py (CVE)
# ============================================================
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

# ============================================================
#  POST /api/nuclei/run  → ESCANEO SÍNCRONO + GENERAR RESUMEN AUTOMÁTICO
# ============================================================
@app.route("/api/nuclei/run", methods=["POST"])
def api_nuclei_run():

    target = "http://host.docker.internal"

    entry, output_file = run_nuclei_scan(target)

    save_nuclei_history(entry)

    # ⭐ GENERAR RESUMEN AUTOMÁTICO
    generar_resumen_nuclei(auto=True)

    return jsonify({
        "error": entry["error"],
        "results": entry.get("results", []),
        "file": output_file,
        "timestamp": entry["timestamp"],
        "target": entry["target"],
        "count": len(entry.get("results", [])) if entry.get("results") else 0
    })

# ============================================================
#  GET /api/nuclei/history
# ============================================================
@app.route("/api/nuclei/history", methods=["GET"])
def nuclei_history():
    history_file = "/app/nuclei_history.json"

    # ⭐ Protección contra directorio corrupto
    if os.path.isdir(history_file):
        os.rmdir(history_file)
        with open(history_file, "w") as f:
            json.dump([], f)

    if not os.path.exists(history_file):
        return jsonify([])

    try:
        with open(history_file, "r") as f:
            history = json.load(f)
    except:
        history = []

    history = sorted(history, key=lambda x: x.get("timestamp", ""), reverse=True)

    return jsonify(history)

# ============================================================
#  GET /api/nuclei/report/<timestamp>
# ============================================================
@app.route("/api/nuclei/report/<timestamp>", methods=["GET"])
def nuclei_report(timestamp):
    history_file = "/app/nuclei_history.json"

    if os.path.isdir(history_file):
        os.rmdir(history_file)
        with open(history_file, "w") as f:
            json.dump([], f)

    if not os.path.exists(history_file):
        return jsonify({"error": "No history found"}), 404

    with open(history_file, "r") as f:
        history = json.load(f)

    for entry in history:
        if entry.get("timestamp") == timestamp:
            return jsonify(entry)

    return jsonify({"error": "Report not found"}), 404

# ============================================================
#  POST /api/nuclei/clear-history
# ============================================================
@app.route("/api/nuclei/clear-history", methods=["POST"])
def clear_nuclei_history():
    history_file = "/app/nuclei_history.json"

    if os.path.isdir(history_file):
        os.rmdir(history_file)

    try:
        with open(history_file, "w") as f:
            f.write("[]")
        return jsonify({"status": "ok", "message": "Historial eliminado"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ============================================================
#  NUEVO ENDPOINT → GENERAR RESUMEN LIMPIO (MEJORADO)
# ============================================================
@app.get("/api/nuclei/generar-resumen")
def generar_resumen_nuclei(auto=False):
    history_file = "/app/nuclei_history.json"
    output_file = "/app/nuclei_output/nuclei_resultados.json"

    if os.path.isdir(history_file):
        os.rmdir(history_file)
        with open(history_file, "w") as f:
            json.dump([], f)

    if not os.path.exists(history_file):
        return jsonify({"error": "No history found"}), 404 if not auto else None

    with open(history_file, "r") as f:
        history = json.load(f)

    if not history:
        return jsonify({"error": "History is empty"}), 404 if not auto else None

    ultimo = history[-1]
    resultados = ultimo.get("results", [])

    resumen = []

    for r in resultados:
        info = r.get("info", {})

        nombre = info.get("name") or r.get("template-id") or "N/A"
        descripcion = info.get("description") or "Sin descripción disponible"
        severidad = info.get("severity") or "info"

        resumen.append({
            "nombre": nombre,
            "descripcion": descripcion,
            "severidad": severidad,
            "plantilla": r.get("template-id"),
            "id": r.get("template-id"),
            "detectado_en": r.get("matched-at"),
            "ip": r.get("ip"),
            "puerto": r.get("port"),
            "fecha": ultimo.get("timestamp")
        })

    with open(output_file, "w") as f:
        json.dump(resumen, f, indent=4)

    if auto:
        return None

    return jsonify({
        "status": "ok",
        "message": "Resumen generado",
        "archivo": output_file,
        "count": len(resumen)
    })

# ============================================================
#  NUEVO ENDPOINT → DEVOLVER RESUMEN AL FRONTEND
# ============================================================
@app.get("/api/nuclei/resumen")
def obtener_resumen_nuclei():
    output_file = "/app/nuclei_output/nuclei_resultados.json"

    if not os.path.exists(output_file):
        return jsonify({"error": "Resumen no generado aún"}), 404

    with open(output_file, "r") as f:
        data = json.load(f)

    return jsonify(data)

# ============================================================
#  SSE PROGRESO NUCLEI
# ============================================================
@app.get("/api/nuclei/progress")
def nuclei_progress():

    def stream():
        process = subprocess.Popen(
            ["nuclei", "-u", "http://host.docker.internal"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )

        total = 0
        current = 0

        for line in process.stdout:

            m_total = re.search(r"Templates loaded: (\d+)", line)
            if m_total:
                total = int(m_total.group(1))
                yield f"data: {total}|0|Cargando plantillas...\n\n"

            m_run = re.search(r"Running template (\d+)/(\d+): (.+)", line)
            if m_run:
                current = int(m_run.group(1))
                total = int(m_run.group(2))
                template_name = m_run.group(3).strip()
                yield f"data: {total}|{current}|{template_name}\n\n"

            time.sleep(0.05)

        yield "data: done\n\n"

    return Response(stream(), mimetype="text/event-stream")

# ============================================================
#  MAIN
# ============================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9100)

