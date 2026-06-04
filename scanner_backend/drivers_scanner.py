import platform
import subprocess
import json
import os
import datetime

# ============================================================
#  UTILIDAD PARA EJECUTAR COMANDOS
# ============================================================
def run_cmd(cmd):
    try:
        result = subprocess.check_output(cmd, shell=True, text=True)
        return result.strip()
    except:
        return "N/A"


# ============================================================
#  KERNEL REAL
# ============================================================
def get_kernel():
    return platform.release()


# ============================================================
#  CPU REAL
# ============================================================
def get_cpu_info():
    cpu = run_cmd("lscpu | grep 'Model name' | awk -F ':' '{print $2}'")
    if cpu == "N/A":
        cpu = run_cmd("cat /proc/cpuinfo | grep 'model name' | head -1 | awk -F ':' '{print $2}'")
    return cpu.strip() if cpu != "N/A" else "N/A"


# ============================================================
#  BIOS / UEFI
# ============================================================
def get_bios_info():
    bios = run_cmd("dmidecode -s bios-version")
    vendor = run_cmd("dmidecode -s bios-vendor")

    if bios == "N/A" or vendor == "N/A":
        return "N/A"

    return f"{vendor} {bios}".strip()


def get_uefi_info():
    return run_cmd("ls /sys/firmware/efi 2>/dev/null && echo 'UEFI' || echo 'Legacy BIOS'")


# ============================================================
#  MÓDULOS DEL KERNEL REAL
# ============================================================
def get_loaded_modules():
    try:
        return os.listdir("/sys/module")
    except:
        return []


# ============================================================
#  OS DEL CONTENEDOR
# ============================================================
def get_os_info():
    try:
        with open("/etc/os-release") as f:
            return f.read()
    except:
        return "N/A"


# ============================================================
#  INTERFACES DE RED REALES
# ============================================================
def get_network_interfaces():
    try:
        return os.listdir("/sys/class/net")
    except:
        return []


# ============================================================
#  DISCOS REALES
# ============================================================
def get_disks():
    try:
        return os.listdir("/sys/block")
    except:
        return []


# ============================================================
#  FUNCIÓN PRINCIPAL QUE USA EL FRONTEND
# ============================================================
def scan_drivers_summary():
    return {
        "arquitectura": platform.machine(),
        "kernel_version": get_kernel(),
        "os_contenedor": get_os_info(),

        # Nuevos campos que tu frontend espera
        "escaneado": "localhost",
        "fecha_detectado": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),

        # Listas reales
        "interfaces_red": get_network_interfaces(),
        "discos_detectados": get_disks(),
        "modulos_kernel": get_loaded_modules(),

        # Información adicional útil
        "cpu": get_cpu_info(),
        "bios": get_bios_info(),
        "uefi": get_uefi_info(),
    }


# Alias para compatibilidad con server.py
def get_system_summary():
    return scan_drivers_summary()


if __name__ == "__main__":
    info = scan_drivers_summary()
    print(json.dumps(info, indent=4))

