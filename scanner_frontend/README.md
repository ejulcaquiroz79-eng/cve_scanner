
# ⭐ **CONTENIDO FINAL PARA TU README.md**  
(Copia y pega tal cual)

---

# 🔍 CVE Scanner – Escáner Automático de Vulnerabilidades con Nuclei

Proyecto académico y profesional que integra **Nuclei**, **Docker**, **Python**, **React + Vite** y un **dashboard interactivo** para realizar escaneos automáticos de vulnerabilidades sobre el equipo donde se ejecuta el sistema.

---

## 🚀 Características principales

- Escaneo automático del host al iniciar Docker  
- Botón **“Escanear este equipo”** para ejecutar un análisis manual  
- Integración completa con el motor oficial de **Nuclei**  
- Dashboard moderno con:
  - Tabla de vulnerabilidades
  - Historial de escaneos
  - Gráficos por severidad
  - Información del sistema
- Historial persistente en `nuclei_history.json`  
- Arquitectura completamente dockerizada (backend + frontend + Nuclei)

---

## 🧱 Arquitectura del proyecto

```
cve_scanner/
│
├── scanner_backend/
│   ├── server.py              # API Flask + ejecución de Nuclei
│   ├── start.sh               # Auto-scan al iniciar Docker
│   ├── nuclei_scanner.py      # Lógica de ejecución
│   ├── nuclei_history.json    # Historial (ignorado en Git)
│   └── Dockerfile
│
├── scanner_frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── NucleiScanner.tsx
│   │   ├── Sistema.tsx
│   │   ├── InfoSistema.tsx
│   │   ├── VulnerabilidadesTable.tsx
│   │   └── GraficoFechas.tsx
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## 🐳 Cómo ejecutar el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/ejulcaquiroz79-eng/cve_scanner
cd cve_scanner
```

### 2. Construir y ejecutar

```bash
docker compose build --no-cache
docker compose up
```

### 3. Acceder al dashboard

```
http://localhost:5173
```

---

## ⚙️ Funcionamiento del auto-scan

1. `start.sh` inicia Flask y cron  
2. El backend detecta el host real  
3. Ejecuta automáticamente:

```
POST /api/nuclei/run
```

4. Nuclei analiza el sistema usando plantillas oficiales  
5. Los resultados se guardan en `nuclei_history.json`  
6. El frontend muestra:
   - Vulnerabilidades
   - Severidades
   - Historial
   - Gráficos

---

## 🛠 Tecnologías utilizadas

- Python 3.10  
- Flask  
- Nuclei (ProjectDiscovery)  
- Docker & Docker Compose  
- React + Vite  
- Nginx  
- Nmap  
- Cron  

---

## 📁 Archivos ignorados

- `scanner_backend/nuclei_history.json`  
- Logs  
- Builds del frontend  
- Archivos temporales  
- Salidas de Nuclei  
- node_modules  
- __pycache__  

---

## 👨‍💻 Autor

**Jair Julca Quiroz**  
Proyecto académico y profesional de ciberseguridad y automatización.

