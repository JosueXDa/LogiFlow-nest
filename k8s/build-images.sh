#!/bin/bash

# Script para construir todas las imágenes Docker
# Uso: ./build-images.sh

set -e

echo "🏗️  Construyendo imágenes Docker de LogiFlow..."

# Go to project root
cd ..

# Build images
echo "📦 Building API Gateway..."
docker build -t logiflow/api-gateway:latest -f apps/api-gateway/Dockerfile .

echo "📦 Building Auth Service..."
docker build -t logiflow/auth-service:latest -f apps/auth-services/Dockerfile .

echo "📦 Building Pedidos Service..."
docker build -t logiflow/pedidos-service:latest -f apps/pedidos-service/Dockerfile .

echo "📦 Building Fleet Service..."
docker build -t logiflow/fleet-service:latest -f apps/fleet-service/Dockerfile .

echo "📦 Building Inventory Service..."
docker build -t logiflow/inventory-service:latest -f apps/inventory-service/Dockerfile .

echo "📦 Building Notification Service..."
docker build -t logiflow/notification-service:latest -f apps/notification-service/Dockerfile .

echo "📦 Building Billing Service..."
docker build -t logiflow/billing-service:latest -f apps/billing-service/Dockerfile .

echo "📦 Building Tracking Service..."
docker build -t logiflow/tracking-service:latest -f apps/tracking-service/Dockerfile .

echo "✅ Todas las imágenes construidas exitosamente!"

# Check if using minikube
if command -v minikube &> /dev/null; then
    echo ""
    read -p "¿Deseas cargar las imágenes a minikube? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📤 Cargando imágenes a minikube..."
        minikube image load logiflow/api-gateway:latest
        minikube image load logiflow/auth-service:latest
        minikube image load logiflow/pedidos-service:latest
        minikube image load logiflow/fleet-service:latest
        minikube image load logiflow/inventory-service:latest
        minikube image load logiflow/notification-service:latest
        minikube image load logiflow/billing-service:latest
        minikube image load logiflow/tracking-service:latest
        echo "✅ Imágenes cargadas a minikube!"
    fi
fi
