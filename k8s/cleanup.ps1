# PowerShell script para limpiar/eliminar todo el despliegue de Kubernetes
# Uso: .\cleanup.ps1

Write-Host "Limpiando despliegue de LogiFlow..." -ForegroundColor Red

$confirmation = Read-Host "Estas seguro de que deseas eliminar todo el namespace 'logiflow'? (y/n)"
if ($confirmation -ne 'y') {
    Write-Host "Operacion cancelada." -ForegroundColor Yellow
    exit
}

Write-Host "Eliminando namespace logiflow (esto eliminara todos los recursos)..." -ForegroundColor Yellow
kubectl delete namespace logiflow

Write-Host "Limpieza completada!" -ForegroundColor Green
