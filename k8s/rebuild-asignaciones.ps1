# Script para reconstruir API Gateway v8 y Fleet Service v3
# Esto incluye los cambios para el endpoint GET /flota/asignaciones

Write-Host "Reconstruyendo servicios con endpoint de asignaciones..." -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

# Reconstruir API Gateway v8
Write-Host "Building API Gateway v8..." -ForegroundColor Yellow
docker build -t logiflow/api-gateway:v8 -f apps/api-gateway/Dockerfile .

# Reconstruir Fleet Service v3
Write-Host "Building Fleet Service v3..." -ForegroundColor Yellow
docker build -t logiflow/fleet-service:v3 -f apps/fleet-service/Dockerfile .

Write-Host ""
Write-Host "Cargando imagenes a minikube..." -ForegroundColor Yellow
minikube image load logiflow/api-gateway:v8
minikube image load logiflow/fleet-service:v3

Write-Host ""
Write-Host "Actualizando deployments..." -ForegroundColor Yellow
kubectl set image deployment/api-gateway api-gateway=logiflow/api-gateway:v8 -n logiflow
kubectl set image deployment/fleet-service fleet-service=logiflow/fleet-service:v3 -n logiflow

Write-Host ""
Write-Host "Esperando que los pods esten listos..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=api-gateway -n logiflow --timeout=120s
kubectl wait --for=condition=ready pod -l app=fleet-service -n logiflow --timeout=120s

Write-Host ""
Write-Host "Listo! Servicios actualizados:" -ForegroundColor Green
Write-Host "  - API Gateway: v8" -ForegroundColor Green
Write-Host "  - Fleet Service: v3" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora puedes usar: GET http://localhost:3009/flota/asignaciones" -ForegroundColor Cyan
Write-Host ""

Set-Location k8s
