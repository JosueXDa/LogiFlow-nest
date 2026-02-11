# Reconstruir API Gateway v7 con ValidationPipe fix

Write-Host "Reconstruyendo API Gateway v7..." -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "Building API Gateway v7..." -ForegroundColor Yellow
docker build --no-cache -t logiflow/api-gateway:v7 -f apps/api-gateway/Dockerfile .

Write-Host ""
Write-Host "Cargando imagen a minikube..." -ForegroundColor Yellow
minikube image load logiflow/api-gateway:v7

Write-Host ""
Write-Host "Actualizando deployment..." -ForegroundColor Yellow
kubectl set image deployment/api-gateway api-gateway=logiflow/api-gateway:v7 -n logiflow

Write-Host ""
Write-Host "Esperando que el pod este listo..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=api-gateway -n logiflow --timeout=120s

Write-Host ""
Write-Host "Listo! API Gateway actualizado a v7." -ForegroundColor Green
Write-Host ""

Set-Location k8s
