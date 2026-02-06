#!/bin/bash

# Script para limpiar todas las bases de datos de LogiFlow
# Elimina todos los datos de todas las tablas manteniendo la estructura

echo "🧹 Limpiando todas las bases de datos de LogiFlow..."
echo ""

# Configuración
USER="postgres"
PASSWORD="postgres"
HOST="localhost"
export PGPASSWORD=$PASSWORD

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

total_cleaned=0
errors=0

# Array de bases de datos
declare -A databases=(
  ["auth_db"]="5432:Auth Service"
  ["pedidos_db"]="5433:Pedidos Service"
  ["fleet_db"]="5434:Fleet Service"
  ["inventory_db"]="5435:Inventory Service"
  ["billing_db"]="5436:Billing Service"
  ["tracking_db"]="5437:Tracking Service"
)

# Función para limpiar una base de datos
clean_database() {
  local db_name=$1
  local port=$2
  local description=$3
  
  echo -e "${YELLOW}📦 Procesando: $description ($db_name)${NC}"
  
  # Script SQL para limpiar
  SQL_SCRIPT="
DO \$\$
DECLARE
    r RECORD;
BEGIN
    -- Deshabilitar triggers temporalmente
    SET session_replication_role = 'replica';
    
    -- Truncar todas las tablas
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    
    -- Rehabilitar triggers
    SET session_replication_role = 'origin';
    
    -- Resetear secuencias (auto-increment)
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'ALTER SEQUENCE public.' || quote_ident(r.sequence_name) || ' RESTART WITH 1';
    END LOOP;
END \$\$;
"
  
  # Obtener número de tablas
  local table_count=$(psql -h $HOST -p $port -U $USER -d $db_name -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'" 2>/dev/null | xargs)
  
  if [ -z "$table_count" ] || [ "$table_count" = "0" ]; then
    echo -e "  ${GRAY}ℹ️  No hay tablas en esta base de datos${NC}"
    echo ""
    return
  fi
  
  echo "  📋 Tablas encontradas: $table_count"
  
  # Ejecutar limpieza
  if psql -h $HOST -p $port -U $USER -d $db_name -c "$SQL_SCRIPT" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ $table_count tabla(s) limpiada(s)${NC}"
    total_cleaned=$((total_cleaned + table_count))
  else
    echo -e "  ${RED}❌ Error al limpiar tablas${NC}"
    errors=$((errors + 1))
  fi
  
  echo ""
}

# Limpiar todas las bases de datos
for db_name in "${!databases[@]}"; do
  IFS=':' read -r port description <<< "${databases[$db_name]}"
  clean_database "$db_name" "$port" "$description"
done

# Limpiar RabbitMQ (opcional)
echo -e "${YELLOW}🐰 Limpiando colas de RabbitMQ...${NC}"

queues=("fleet_queue" "billing_queue" "inventory_queue" "pedidos_queue" "notification_queue" "gateway_queue")

for queue in "${queues[@]}"; do
  if docker exec -i microservices-rabbitmq rabbitmqadmin purge queue name=$queue -u admin -p admin > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ Cola '$queue' purgada${NC}"
  else
    echo -e "  ${GRAY}⚠️  Cola '$queue' no existe o ya está vacía${NC}"
  fi
done

# Resumen final
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}                        RESUMEN FINAL                          ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

if [ $errors -eq 0 ]; then
  echo -e "${GREEN}✅ ÉXITO: Todas las bases de datos fueron limpiadas${NC}"
  echo "📊 Total de tablas limpiadas: $total_cleaned"
else
  echo -e "${YELLOW}⚠️  COMPLETADO CON ERRORES${NC}"
  echo "📊 Tablas limpiadas: $total_cleaned"
  echo -e "${RED}❌ Errores encontrados: $errors${NC}"
fi

echo ""
echo -e "${CYAN}💡 Nota: Las estructuras de las tablas se mantienen intactas.${NC}"
echo -e "${CYAN}   Solo se eliminaron los datos.${NC}"
echo ""
echo -e "${YELLOW}🔄 Puedes ejecutar los scripts de seed para repoblar:${NC}"
echo "   node scripts/seed-fleet.mjs"
echo "   node scripts/seed-inventory.mjs"
echo ""

# Limpiar variable de entorno
unset PGPASSWORD
