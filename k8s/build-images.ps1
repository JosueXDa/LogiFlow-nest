# PowerShell script para construir imagenes Docker en Windows
# Uso: .\build-images.ps1

Write-Host "Construyendo imagenes Docker de LogiFlow..." -ForegroundColor Cyan

# Ir a la raiz del proyecto
Set-Location ..

# Construir imagenes
Write-Host "Building API Gateway..." -ForegroundColor Yellow
docker build --no-cache -t logiflow/api-gateway:v2 -f apps/api-gateway/Dockerfile .

Write-Host "Building Auth Service..." -ForegroundColor Yellow
docker build --no-cache -t logiflow/auth-service:v2 -f apps/auth-services/Dockerfile .

Write-Host "Building Pedidos Service..." -ForegroundColor Yellow
docker build --no-cache -t logiflow/pedidos-service:v2 -f apps/pedidos-service/Dockerfile .

Write-Host "Building Fleet Service..." -ForegroundColor Yellow
docker build --no-cache -t logiflow/fleet-service:v2 -f apps/fleet-service/Dockerfile .

Write-Host "Building Inventory Service..." -ForegroundColor Yellow
docker build --no-cache -t logiflow/inventory-service:v2 -f apps/inventory-service/Dockerfile .

Write-Host "Building Notification Service..." -ForegroundColor Yellow
docker build --no-cache -t logiflow/notification-service:v2 -f apps/notification-service/Dockerfile .

Write-Host "Building Billing Service..." -ForegroundColor Yellow
docker build --no-cache -t logiflow/billing-service:v2 -f apps/billing-service/Dockerfile .

Write-Host "Building Tracking Service..." -ForegroundColor Yellow
docker build --no-cache -t logiflow/tracking-service:v2 -f apps/tracking-service/Dockerfile .

Write-Host "Todas las imagenes construidas exitosamente!" -ForegroundColor Green

# Verificar si minikube esta disponible
if (Get-Command minikube -ErrorAction SilentlyContinue) {
    Write-Host ""
    $response = Read-Host "Deseas cargar las imagenes a minikube? (y/n)"
    if ($response -eq "y") {
        Write-Host "Cargando imagenes a minikube..." -ForegroundColor Yellow
        minikube image load logiflow/api-gateway:v2
        minikube image load logiflow/auth-service:v2
        minikube image load logiflow/pedidos-service:v2
        minikube image load logiflow/fleet-service:v2
        minikube image load logiflow/inventory-service:v2
        minikube image load logiflow/notification-service:v2
        minikube image load logiflow/billing-service:v2
        minikube image load logiflow/tracking-service:v2
        Write-Host "Imagenes cargadas a minikube!" -ForegroundColor Green
    }
}

Set-Location k8s
