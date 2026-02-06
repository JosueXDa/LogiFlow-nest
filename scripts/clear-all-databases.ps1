# Script para limpiar todas las bases de datos de LogiFlow
# Elimina todos los datos de todas las tablas manteniendo la estructura

Write-Host "🧹 Limpiando todas las bases de datos de LogiFlow..." -ForegroundColor Cyan
Write-Host ""

# Configuración de bases de datos
$databases = @(
    @{Name="auth_db"; Port=5432; Description="Auth Service"},
    @{Name="pedidos_db"; Port=5433; Description="Pedidos Service"},
    @{Name="fleet_db"; Port=5434; Description="Fleet Service"},
    @{Name="inventory_db"; Port=5435; Description="Inventory Service"},
    @{Name="billing_db"; Port=5436; Description="Billing Service"},
    @{Name="tracking_db"; Port=5437; Description="Tracking Service"}
)

$user = "postgres"
$password = "postgres"
$host = "localhost"
$totalCleaned = 0
$errors = @()

foreach ($db in $databases) {
    Write-Host "📦 Procesando: $($db.Description) ($($db.Name))" -ForegroundColor Yellow
    
    # Set environment variable for password
    $env:PGPASSWORD = $password
    
    try {
        # Obtener todas las tablas de la base de datos (excluyendo tablas del sistema)
        $getTables = @"
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
"@
        
        $tablesOutput = docker exec -i microservices-postgres-$($db.Name -replace '_db$','') `
            psql -U $user -d $($db.Name) -t -c $getTables 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            # Si falla con el primer nombre de contenedor, intentar con otros patrones
            $containerNames = @(
                "microservices-postgres-$($db.Name -replace '_db$','')",
                "microservices-postgres",
                "microservices-postgres-pedidos",
                "microservices-postgres-fleet",
                "microservices-postgres-inventory",
                "microservices-postgres-billing",
                "microservices-postgres-tracking"
            )
            
            $containerFound = $false
            foreach ($containerName in $containerNames) {
                $tablesOutput = docker exec -i $containerName `
                    psql -U $user -d $($db.Name) -t -c $getTables 2>&1
                
                if ($LASTEXITCODE -eq 0) {
                    $containerFound = $true
                    $usedContainer = $containerName
                    break
                }
            }
            
            if (-not $containerFound) {
                throw "No se pudo conectar a ningún contenedor para $($db.Name)"
            }
        } else {
            $usedContainer = "microservices-postgres-$($db.Name -replace '_db$','')"
        }
        
        # Parsear las tablas
        $tables = $tablesOutput | Where-Object { $_.Trim() -ne "" } | ForEach-Object { $_.Trim() }
        
        if ($tables.Count -eq 0) {
            Write-Host "  ℹ️  No hay tablas en esta base de datos" -ForegroundColor Gray
            Write-Host ""
            continue
        }
        
        Write-Host "  📋 Tablas encontradas: $($tables.Count)" -ForegroundColor White
        
        # Deshabilitar temporalmente las foreign key constraints y truncar todas las tablas
        $truncateCommand = @"
DO `$`$
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
END `$`$;
"@
        
        $result = docker exec -i $usedContainer `
            psql -U $user -d $($db.Name) -c $truncateCommand 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $($tables.Count) tabla(s) limpiada(s)" -ForegroundColor Green
            $totalCleaned += $tables.Count
        } else {
            Write-Host "  ❌ Error al limpiar tablas" -ForegroundColor Red
            Write-Host "     $result" -ForegroundColor Red
            $errors += "$($db.Description): $result"
        }
        
    } catch {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        $errors += "$($db.Description): $($_.Exception.Message)"
    }
    
    Write-Host ""
}

# Limpiar RabbitMQ queues (opcional)
Write-Host "🐰 Limpiando colas de RabbitMQ..." -ForegroundColor Yellow

try {
    # Purgar todas las colas
    $queues = @("fleet_queue", "billing_queue", "inventory_queue", "pedidos_queue", "notification_queue", "gateway_queue")
    
    foreach ($queue in $queues) {
        $purgeResult = docker exec -i microservices-rabbitmq `
            rabbitmqadmin purge queue name=$queue -u admin -p admin 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Cola '$queue' purgada" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Cola '$queue' no existe o ya está vacía" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "  ⚠️  No se pudo limpiar RabbitMQ (puede que rabbitmqadmin no esté disponible)" -ForegroundColor Gray
}

# Resumen final
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                        RESUMEN FINAL                          " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0) {
    Write-Host "✅ ÉXITO: Todas las bases de datos fueron limpiadas" -ForegroundColor Green
    Write-Host "📊 Total de tablas limpiadas: $totalCleaned" -ForegroundColor White
} else {
    Write-Host "⚠️  COMPLETADO CON ERRORES" -ForegroundColor Yellow
    Write-Host "📊 Tablas limpiadas: $totalCleaned" -ForegroundColor White
    Write-Host "❌ Errores encontrados: $($errors.Count)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Detalles de errores:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "💡 Nota: Las estructuras de las tablas se mantienen intactas." -ForegroundColor Cyan
Write-Host "   Solo se eliminaron los datos." -ForegroundColor Cyan
Write-Host ""
Write-Host "🔄 Puedes ejecutar los scripts de seed para repoblar:" -ForegroundColor Yellow
Write-Host "   node scripts/seed-fleet.mjs" -ForegroundColor White
Write-Host "   node scripts/seed-inventory.mjs" -ForegroundColor White
Write-Host ""

# Limpiar variable de entorno
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
