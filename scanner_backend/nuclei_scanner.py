import subprocess
import json
import datetime
import os

OUTPUT_DIR = "/app/nuclei_output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def run_nuclei_scan(target: str):

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f"{OUTPUT_DIR}/nuclei_{timestamp}.json"

    # 🔥 COMANDO CORRECTO PARA NUCLEI v3.8.0
    cmd = [
        "nuclei",
        "-u", target,
        "-t", "/root/nuclei-templates",
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

    # Leer archivo JSON exportado
    results = []
    if os.path.exists(output_file):
        try:
            with open(output_file, "r") as f:
                results = json.load(f)
        except:
            results = []

    entry = {
        "error": False,
        "results": results,
        "timestamp": datetime.datetime.now().isoformat(),
        "target": target
    }

    return entry, output_file


def save_nuclei_history(entry):
    """
    Guarda una entrada en el historial de Nuclei.
    """
    history_file = "/app/nuclei_history.json"

    # Si no existe, crear lista vacía
    if not os.path.exists(history_file):
        with open(history_file, "w") as f:
            json.dump([], f)

    # Leer historial actual
    with open(history_file, "r") as f:
        try:
            history = json.load(f)
        except:
            history = []

    # Asegurar timestamp
    if "timestamp" not in entry:
        entry["timestamp"] = datetime.datetime.now().isoformat()

    # Agregar nueva entrada
    history.append(entry)

    # Guardar historial actualizado
    with open(history_file, "w") as f:
        json.dump(history, f, indent=4)

