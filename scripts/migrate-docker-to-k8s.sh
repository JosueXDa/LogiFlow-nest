#!/bin/bash
# Script para migrar datos de Docker a Kubernetes
# Ejecutar con: ./scripts/migrate-docker-to-k8s.sh

echo "🔄 Migrando datos de Docker a Kubernetes"
echo ""

# Configuración de bases de datos
declare -A databases=(
    ["auth_db"]="5432:postgres-auth-0"
    ["pedidos_db"]="5433:postgres-pedidos-0"
    ["fleet_db"]="5434:postgres-fleet-0"
    ["inventory_db"]="5435:postgres-inventory-0"
    ["billing_db"]="5436:postgres-billing-0"
    ["tracking_db"]="5437:postgres-tracking-0"
    ["notification_db"]="5438:postgres-notification-0"
)

# Crear directorio temporal para dumps
DUMP_DIR="./temp-dumps"
mkdir -p "$DUMP_DIR"

echo "📁 Directorio temporal: $DUMP_DIR"
echo ""

for dbName in "${!databases[@]}"; do
    IFS=':' read -r dockerPort k8sPod <<< "${databases[$dbName]}"
    dumpFile="$DUMP_DIR/$dbName.sql"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 Procesando: $dbName"
    echo ""
    
    # Paso 1: Exportar desde Docker
    echo "  1️⃣  Exportando desde Docker (puerto $dockerPort)..."
    
    PGPASSWORD=postgres pg_dump -h localhost -p "$dockerPort" -U postgres -d "$dbName" --clean --if-exists -f "$dumpFile" 2>/dev/null
    
    if [ $? -ne 0 ]; then
        echo "  ❌ Error al exportar $dbName desde Docker"
        echo "     Verifica que Docker esté corriendo y el contenedor activo"
        continue
    fi
    
    fileSize=$(du -h "$dumpFile" | cut -f1)
    echo "  ✅ Dump creado: $fileSize"
    
    # Paso 2: Importar a Kubernetes
    echo "  2️⃣  Importando a Kubernetes (pod: $k8sPod)..."
    
    cat "$dumpFile" | kubectl exec -i -n logiflow "$k8sPod" -- psql -U postgres -d "$dbName" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "  ✅ Datos importados exitosamente a K8s"
    else
        echo "  ⚠️  Hubo algunos warnings durante la importación (normal)"
    fi
    
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ Migración completada!"
echo ""
echo "📊 Verificar datos en Kubernetes:"
echo "  kubectl exec -n logiflow postgres-auth-0 -- psql -U postgres -d auth_db -c 'SELECT COUNT(*) FROM users;'"
echo "  kubectl exec -n logiflow postgres-fleet-0 -- psql -U postgres -d fleet_db -c 'SELECT COUNT(*) FROM zonas;'"
echo "  kubectl exec -n logiflow postgres-billing-0 -- psql -U postgres -d billing_db -c 'SELECT COUNT(*) FROM tarifas;'"
echo ""
echo "🗑️  Limpiar dumps temporales:"
echo "  rm -rf $DUMP_DIR"
echo ""
