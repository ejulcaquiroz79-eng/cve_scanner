# 📌 CVE Scanner – Sistema de Monitoreo de Puertos y Vulnerabilidades

**CVE Scanner** es una herramienta completa para:

- Escanear puertos abiertos en un host  
- Detectar servicios expuestos  
- Analizar vulnerabilidades (CVE) asociadas  
- Obtener información del sistema (drivers, kernel, BIOS/UEFI, módulos, interfaces, discos)  
- Generar reportes en JSON, HTML y CSV  
- Visualizar resultados en un dashboard web moderno  

El proyecto está diseñado para ejecutarse mediante **Docker Compose**, integrando:

- Backend (Python + Flask)  
- Scanner (Nmap + API NVD)  
- Frontend (React + Vite + TypeScript)  
- Cron para escaneos automáticos  

---

# 🏗️ Arquitectura del Proyecto

```
cve_scanner/
│
├── scanner_backend/     → Backend + escáner CVE + API Flask
├── scanner_frontend/    → Dashboard web (React + Vite)
├── scanner_server/      → Scripts y cron para ejecución automática
├── docker-compose.yml   → Orquestación de contenedores
└── Dockerfile           → Imagen base del backend
```

---

# 🚀 Tecnologías Utilizadas

### 🔹 Backend
- Python 3.10  
- Flask  
- Nmap  
- API NVD (National Vulnerability Database)  
- dmidecode, pciutils, cron  

### 🔹 Frontend
- React  
- TypeScript  
- Vite  
- Chart.js  

### 🔹 Infraestructura
- Docker  
- Docker Compose  
- Cron jobs  

---

# ⚙️ Instalación

Clona el repositorio:

```
git clone https://github.com/ejulcaquiroz79-eng/cve_scanner
cd cve_scanner
```

Asegúrate de tener instalado:

- Docker  
- Docker Compose  

---

# ▶️ Ejecución

Inicia todo el sistema:

```
docker compose up --build
```

Esto levantará:

- Backend en `http://localhost:9000`
- Frontend en `http://localhost:5173`

---

# 📡 Endpoints del Backend

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | **/api/scan** | Ejecuta un escaneo completo |
| GET | **/api/reporte** | Devuelve el reporte actual |
| GET | **/api/drivers** | Información del sistema (kernel, BIOS, módulos, etc.) |
| GET | **/api/historial** | Historial de escaneos |
| POST | **/api/reset** | Limpia reportes e historial |

Puedes pedirme una tabla extendida con endpoints_detallados.

---

# 📊 Dashboard Web

El frontend muestra:

- Gráfico por severidad  
- Score ponderado  
- Evolución de vulnerabilidades  
- Tabla de vulnerabilidades  
- Información del sistema  

Acceso:

```
http://localhost:5173
```

---

# 📁 Estructura del Proyecto

```
scanner_backend/
│── scanner.py              → Escaneo de puertos + CVEs
│── drivers_scanner.py      → Información del sistema
│── server.py               → API Flask
│── output/                 → Reportes generados (ignorado por Git)
│── requirements.txt
│── run.sh / start.sh
│
scanner_frontend/
│── src/                    → Código React
│── public/
│── vite.config.ts
│── package.json
│
scanner_server/
│── crontab.txt             → Tareas automáticas
│── run.sh
```

---

# 🧪 Ejemplo de Flujo de Uso

1. El usuario abre el dashboard  
2. Presiona “Escanear”  
3. El backend ejecuta:  
   - Nmap  
   - Análisis de servicios  
   - Consulta de CVEs  
   - Análisis de drivers  
4. Se genera:  
   - `reporte.json`  
   - `reporte.html`  
   - `reporte.csv`  
5. El frontend muestra los resultados en tiempo real  

---

# 🛡️ Seguridad

- No se suben reportes al repositorio (gracias al `.gitignore`)  
- No se exponen datos sensibles  
- El escaneo se ejecuta dentro de contenedores aislados  

---

# 👤 Autor

**Edinson Jair Julca Quiroz**  
Estudiante de ASIR – Proyecto Intermodular  
GitHub: `https://github.com/ejulcaquiroz79-eng` [(github.com in Bing)](https://www.bing.com/search?q="https%3A%2F%2Fgithub.com%2Fejulcaquiroz79-eng")  

