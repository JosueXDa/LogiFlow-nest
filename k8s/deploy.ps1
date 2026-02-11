# PowerShell script para despliegue completo en Kubernetes
# Uso: .\deploy.ps1

Write-Host "Iniciando despliegue de LogiFlow en Kubernetes..." -ForegroundColor Cyan

# 1. Crear namespace
Write-Host "Creando namespace..." -ForegroundColor Yellow
kubectl apply -f namespace.yaml

# 2. Crear secrets y configmaps
Write-Host "Creando secrets y configmaps..." -ForegroundColor Yellow
kubectl apply -f secrets.yaml
kubectl apply -f configmaps.yaml

# 3. Desplegar bases de datos
Write-Host "Desplegando bases de datos PostgreSQL..." -ForegroundColor Yellow
kubectl apply -f databases/

# 4. Esperar a que las bases de datos esten listas
Write-Host "Esperando a que las bases de datos esten listas (puede tomar 5 minutos)..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=postgres-auth -n logiflow --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres-pedidos -n logiflow --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres-fleet -n logiflow --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres-inventory -n logiflow --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres-billing -n logiflow --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres-tracking -n logiflow --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres-notification -n logiflow --timeout=300s

# 5. Desplegar RabbitMQ
Write-Host "Desplegando RabbitMQ..." -ForegroundColor Yellow
kubectl apply -f infrastructure/rabbitmq.yaml

# 6. Esperar a que RabbitMQ este listo
Write-Host "Esperando a que RabbitMQ este listo..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=rabbitmq -n logiflow --timeout=300s

# 7. Desplegar microservicios
Write-Host "Desplegando microservicios..." -ForegroundColor Yellow
kubectl apply -f services/

# 8. Mostrar estado
Write-Host "Despliegue completado!" -ForegroundColor Green
Write-Host ""
Write-Host "Estado de los pods:" -ForegroundColor Yellow
kubectl get pods -n logiflow

Write-Host ""
Write-Host "Servicios:" -ForegroundColor Yellow
kubectl get svc -n logiflow

Write-Host ""
Write-Host "Para ver logs del API Gateway:" -ForegroundColor Yellow
Write-Host "kubectl logs -f deployment/api-gateway -n logiflow" -ForegroundColor White

Write-Host ""
Write-Host "Para acceder al API Gateway (minikube):" -ForegroundColor Yellow
Write-Host "minikube service api-gateway -n logiflow" -ForegroundColor White

Write-Host ""
Write-Host "Para acceder a RabbitMQ Management (minikube):" -ForegroundColor Yellow
Write-Host "minikube service rabbitmq-management -n logiflow" -ForegroundColor White
