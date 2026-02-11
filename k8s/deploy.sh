#!/bin/bash

# Script de despliegue completo de LogiFlow en Kubernetes
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando despliegue de LogiFlow en Kubernetes..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Crear namespace
echo -e "${YELLOW}📦 Creando namespace...${NC}"
kubectl apply -f namespace.yaml

# 2. Crear secrets y configmaps
echo -e "${YELLOW}🔐 Creando secrets y configmaps...${NC}"
kubectl apply -f secrets.yaml
kubectl apply -f configmaps.yaml

# 3. Desplegar bases de datos
echo -e "${YELLOW}🗄️  Desplegando bases de datos PostgreSQL...${NC}"
kubectl apply -f databases/

# 4. Esperar a que las bases de datos estén listas
echo -e "${YELLOW}⏳ Esperando a que las bases de datos estén listas (puede tomar 5 minutos)...${NC}"
kubectl wait --for=condition=ready pod -l app=postgres-auth -n logiflow --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=postgres-pedidos -n logiflow --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=postgres-fleet -n logiflow --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=postgres-inventory -n logiflow --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=postgres-billing -n logiflow --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=postgres-tracking -n logiflow --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=postgres-notification -n logiflow --timeout=300s || true

# 5. Desplegar RabbitMQ
echo -e "${YELLOW}🐰 Desplegando RabbitMQ...${NC}"
kubectl apply -f infrastructure/rabbitmq.yaml

# 6. Esperar a que RabbitMQ esté listo
echo -e "${YELLOW}⏳ Esperando a que RabbitMQ esté listo...${NC}"
kubectl wait --for=condition=ready pod -l app=rabbitmq -n logiflow --timeout=300s || true

# 7. Desplegar microservicios
echo -e "${YELLOW}🔧 Desplegando microservicios...${NC}"
kubectl apply -f services/

# 8. Mostrar estado
echo -e "${GREEN}✅ Despliegue completado!${NC}"
echo ""
echo -e "${YELLOW}📊 Estado de los pods:${NC}"
kubectl get pods -n logiflow

echo ""
echo -e "${YELLOW}🌐 Servicios:${NC}"
kubectl get svc -n logiflow

echo ""
echo -e "${YELLOW}📝 Para ver logs del API Gateway:${NC}"
echo "kubectl logs -f deployment/api-gateway -n logiflow"

echo ""
echo -e "${YELLOW}🌐 Para acceder al API Gateway (minikube):${NC}"
echo "minikube service api-gateway -n logiflow"

echo ""
echo -e "${YELLOW}🐰 Para acceder a RabbitMQ Management (minikube):${NC}"
echo "minikube service rabbitmq-management -n logiflow"
