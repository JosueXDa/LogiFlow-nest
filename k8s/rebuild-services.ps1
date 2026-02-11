# Script rapido para reconstruir API Gateway y Billing Service
# con los ultimos cambios

Write-Host "Reconstruyendo servicios con cambios..." -ForegroundColor Cyan
Write-Host ""

# Obtener la raiz del proyecto (debe contener apps/, package.json, etc)
$projectRoot = Split-Path -Parent $PSScriptRoot
Write-Host "Directorio del proyecto: $projectRoot" -ForegroundColor Gray
Set-Location $projectRoot

# Reconstruir API Gateway con tag v5 (siguiente version)
Write-Host "Building API Gateway v5..." -ForegroundColor Yellow
docker build --no-cache -t logiflow/api-gateway:v5 -f apps/api-gateway/Dockerfile .

# Reconstruir Billing Service con tag v3 (siguiente version)  
Write-Host "Building Billing Service v3..." -ForegroundColor Yellow
docker build --no-cache -t logiflow/billing-service:v3 -f apps/billing-service/Dockerfile .

Write-Host ""
Write-Host "Imagenes construidas!" -ForegroundColor Green
Write-Host ""

# Cargar a minikube
Write-Host "Cargando imagenes a minikube..." -ForegroundColor Yellow
minikube image load logiflow/api-gateway:v5
minikube image load logiflow/billing-service:v3

Write-Host ""
Write-Host "Imagenes cargadas a minikube!" -ForegroundColor Green
Write-Host ""

# Actualizar deployments
Write-Host "Actualizando deployments..." -ForegroundColor Yellow
kubectl set image deployment/api-gateway api-gateway=logiflow/api-gateway:v5 -n logiflow
kubectl set image deployment/billing-service billing-service=logiflow/billing-service:v3 -n logiflow

Write-Host ""
Write-Host "Esperando que los pods esten listos..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=api-gateway -n logiflow --timeout=120s
kubectl wait --for=condition=ready pod -l app=billing-service -n logiflow --timeout=120s

Write-Host ""
Write-Host "Listo! Los servicios estan actualizados con los nuevos cambios." -ForegroundColor Green
Write-Host ""

Set-Location k8s
