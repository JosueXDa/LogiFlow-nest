# Script para liberar espacio en disco eliminando imágenes antiguas

Write-Host "=== LIMPIEZA DE IMÁGENES ANTIGUAS ===" -ForegroundColor Cyan

# 1. Eliminar imágenes locales de Docker (v1 a v9)
Write-Host "1. Eliminando imágenes locales de Docker (v1-v9)..." -ForegroundColor Yellow
1..9 | ForEach-Object {
    $tag = "logiflow/api-gateway:v$_"
    Write-Host "   Eliminando $tag..."
    docker rmi $tag 2>$null
    
    $tagFleet = "logiflow/fleet-service:v$_"
    docker rmi $tagFleet 2>$null
}

# 2. Limpiar cache de Minikube (esto libera espacio en C:\Users\USUARIO\.minikube\cache)
Write-Host "2. Limpiando caché de imágenes de Minikube..." -ForegroundColor Yellow
minikube cache delete --all
minikube image prune -a --force

# 3. Eliminar imágenes dangling de Docker
Write-Host "3. Eliminando imágenes 'dangling' de Docker..." -ForegroundColor Yellow
docker image prune -f

Write-Host ""
Write-Host "=== ESPACIO LIBERADO ===" -ForegroundColor Green
Write-Host "Intenta ejecutar nuevamente: minikube image load logiflow/api-gateway:v10" -ForegroundColor Cyan
