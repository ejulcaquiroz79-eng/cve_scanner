from flask import Flask, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

@app.get("/reporte")
def get_reporte():
    ruta = "/app/output/reporte.json"
    if not os.path.exists(ruta):
        return jsonify({"error": "reporte.json no encontrado"}), 404

    with open(ruta, "r") as f:
        data = json.load(f)

    return jsonify(data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000)
