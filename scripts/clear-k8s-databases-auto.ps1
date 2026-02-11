# Script para limpiar TODAS las bases de datos en Kubernetes (AUTO)
# ADVERTENCIA: Esto eliminará todos los datos de las bases de datos en K8s
# Ejecutar con: .\scripts\clear-k8s-databases-auto.ps1

Write-Host "LIMPIANDO BASES DE DATOS EN KUBERNETES (sin confirmacion)" -ForegroundColor Red
Write-Host ""

# Configuración de bases de datos
$databases = @(
    @{Name="auth_db"; Pod="postgres-auth-0"},
    @{Name="pedidos_db"; Pod="postgres-pedidos-0"},
    @{Name="fleet_db"; Pod="postgres-fleet-0"},
    @{Name="inventory_db"; Pod="postgres-inventory-0"},
    @{Name="billing_db"; Pod="postgres-billing-0"},
    @{Name="tracking_db"; Pod="postgres-tracking-0"},
    @{Name="notification_db"; Pod="postgres-notification-0"}
)

foreach ($db in $databases) {
    $dbName = $db.Name
    $pod = $db.Pod
    
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host "Limpiando: $dbName (pod: $pod)" -ForegroundColor Cyan
    
    # SQL para eliminar todas las tablas
    $sql = @"
DO `$`$ 
DECLARE 
    r RECORD;
BEGIN
    -- Eliminar todas las tablas
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    
    -- Eliminar todas las secuencias
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
    END LOOP;
    
    -- Eliminar todos los tipos
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END `$`$;
"@
    
    # Ejecutar SQL en el pod
    $sql | kubectl exec -i -n logiflow $pod -- psql -U postgres -d $dbName 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Limpieza completada" -ForegroundColor Green
    } else {
        Write-Host "  Error durante la limpieza (puede ser normal si la DB estaba vacia)" -ForegroundColor Yellow
    }
    
    # Verificar que no quedan tablas
    $checkSql = "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';"
    $result = $checkSql | kubectl exec -i -n logiflow $pod -- psql -U postgres -d $dbName -t 2>$null
    
    Write-Host "  Tablas restantes: $($result.Trim())" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "LIMPIEZA COMPLETADA!" -ForegroundColor Green
Write-Host ""
Write-Host "Todas las bases de datos en Kubernetes han sido limpiadas." -ForegroundColor Cyan
Write-Host ""
