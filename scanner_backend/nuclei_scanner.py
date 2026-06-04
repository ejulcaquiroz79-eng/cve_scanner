import subprocess
import json
import datetime
import os

OUTPUT_DIR = "/app/nuclei_output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def normalize_result(r):
    """Normaliza los campos para que el frontend reciba lo que necesita."""
    return {
        "name": (
            r.get("info", {}).get("name")
            or r.get("name")
            or "N/A"
        ),

        "description": (
            r.get("info", {}).get("description")
            or r.get("description")
            or "Sin descripción"
        ),

        "severity": (
            r.get("info", {}).get("severity")
            or r.get("severity")
            or "info"
        ),

        "template": (
            r.get("template")
            or r.get("template-id")
            or r.get("template_id")
            or "N/A"
        ),

        "template-id": (
            r.get("template-id")
            or r.get("template_id")
            or "N/A"
        ),

        "matched-at": (
            r.get("matched-at")
            or r.get("matched_at")
            or "N/A"
        ),

        "ip": (
            r.get("ip")
            or r.get("host")
            or r.get("info", {}).get("ip")
            or "N/A"
        ),

        "port": (
            r.get("port")
            or r.get("meta", {}).get("port")
            or "N/A"
        ),

        "timestamp": (
            r.get("timestamp")
            or datetime.datetime.now().isoformat()
        ),

        "raw": r
    }


def run_nuclei_scan(target: str):

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f"{OUTPUT_DIR}/nuclei_{timestamp}.json"

    # ⭐ CONFIGURACIÓN OPTIMIZADA
    # - Usa las MISMAS plantillas que el escaneo automático
    # - Limita velocidad y concurrencia para evitar congelamientos
    cmd = [
        "nuclei",
        "-u", target,
        "-t", "/root/nuclei-templates",
        "-rate-limit", "50",     # evita saturación de red
        "-c", "10",              # evita saturación de CPU
        "-json-export", output_file
    ]

    process = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        cwd="/app"
    )

    if process.returncode != 0:
        return {
            "error": True,
            "message": process.stderr,
            "timestamp": datetime.datetime.now().isoformat(),
            "target": target,
            "results": []
        }, output_file

    # ⭐ PARSEAR JSON GRANDE EN FORMATO ARRAY
    results = []

    if os.path.exists(output_file):
        try:
            with open(output_file, "r") as f:
                data = json.load(f)

                if isinstance(data, list):
                    for item in data:
                        results.append(normalize_result(item))

                elif isinstance(data, dict):
                    results.append(normalize_result(data))

        except Exception as e:
            print("Error leyendo JSON:", e)
            results = []

    entry = {
        "error": False,
        "results": results,
        "timestamp": datetime.datetime.now().isoformat(),
        "target": target,
        "count": len(results)
    }

    return entry, output_file


def save_nuclei_history(entry):
    history_file = "/app/nuclei_history.json"

    if not os.path.exists(history_file):
        with open(history_file, "w") as f:
            json.dump([], f)

    with open(history_file, "r") as f:
        try:
            history = json.load(f)
        except:
            history = []

    if "timestamp" not in entry:
        entry["timestamp"] = datetime.datetime.now().isoformat()

    history.append(entry)

    with open(history_file, "w") as f:
        json.dump(history, f, indent=4)

