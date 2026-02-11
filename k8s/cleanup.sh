#!/bin/bash

# Script para limpiar/eliminar todo el despliegue de Kubernetes
# Uso: ./cleanup.sh

echo "🗑️  Limpiando despliegue de LogiFlow..."

read -p "¿Estás seguro de que deseas eliminar todo el namespace 'logiflow'? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operación cancelada."
    exit 1
fi

echo "Eliminando namespace logiflow (esto eliminará todos los recursos)..."
kubectl delete namespace logiflow

echo "✅ Limpieza completada!"
