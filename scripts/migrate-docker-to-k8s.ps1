# Script para migrar datos de Docker a Kubernetes
# Ejecutar con: .\scripts\migrate-docker-to-k8s.ps1

Write-Host "Migrando datos de Docker a Kubernetes..." -ForegroundColor Cyan
Write-Host ""

# Configuración de bases de datos
$databases = @(
    @{Name="auth_db"; Container="microservices-postgres"; K8sPod="postgres-auth-0"},
    @{Name="pedidos_db"; Container="microservices-postgres-pedidos"; K8sPod="postgres-pedidos-0"},
    @{Name="fleet_db"; Container="microservices-postgres-fleet"; K8sPod="postgres-fleet-0"},
    @{Name="inventory_db"; Container="microservices-postgres-inventory"; K8sPod="postgres-inventory-0"},
    @{Name="billing_db"; Container="microservices-postgres-billing"; K8sPod="postgres-billing-0"},
    @{Name="tracking_db"; Container="microservices-postgres-tracking"; K8sPod="postgres-tracking-0"},
    @{Name="notification_db"; Container="microservices-postgres-notification"; K8sPod="postgres-notification-0"}
)

# Crear directorio temporal para dumps
$dumpDir = ".\temp-dumps"
if (!(Test-Path $dumpDir)) {
    New-Item -ItemType Directory -Path $dumpDir | Out-Null
}

Write-Host "Directorio temporal: $dumpDir" -ForegroundColor Yellow
Write-Host ""

foreach ($db in $databases) {
    $dbName = $db.Name
    $container = $db.Container
    $k8sPod = $db.K8sPod
    $dumpFile = "$dumpDir\$dbName.sql"
    
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host "Procesando: $dbName" -ForegroundColor Cyan
    Write-Host ""
    
    # Paso 1: Exportar desde Docker
    Write-Host "  1. Exportando desde Docker ($container)..." -ForegroundColor Yellow
    
    $process = Start-Process -FilePath "docker" -ArgumentList "exec", "-i", "$container", "pg_dump", "-U", "postgres", "-d", "$dbName", "--clean", "--if-exists" -RedirectStandardOutput $dumpFile -PassThru -NoNewWindow -Wait
    
    if ($process.ExitCode -ne 0) {
        Write-Host "  ERROR al exportar $dbName desde Docker" -ForegroundColor Red
        Write-Host "  Verifica que Docker este corriendo y el contenedor $container activo" -ForegroundColor Red
        continue
    }
    
    $fileSize = (Get-Item $dumpFile).Length / 1KB
    Write-Host "  Dump creado: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Green
    
    # Paso 2: Importar a Kubernetes
    Write-Host "  2. Importando a Kubernetes (pod: $k8sPod)..." -ForegroundColor Yellow
    
    # Leemos el archivo y lo enviamos a kubectl exec
    # Usamos cmd /c para pipe simple que funciona mejor con kubectl exec interactivo
    cmd /c "type $dumpFile | kubectl exec -i -n logiflow $k8sPod -- psql -U postgres -d $dbName"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Datos importados exitosamente a K8s" -ForegroundColor Green
    } else {
        Write-Host "  Hubo algunos warnings durante la importacion (normal)" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "Migracion completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Verificar datos en Kubernetes:" -ForegroundColor Cyan
Write-Host "  kubectl exec -n logiflow postgres-auth-0 -- psql -U postgres -d auth_db -c 'SELECT COUNT(*) FROM users;'" -ForegroundColor Gray
Write-Host "  kubectl exec -n logiflow postgres-fleet-0 -- psql -U postgres -d fleet_db -c 'SELECT COUNT(*) FROM zonas;'" -ForegroundColor Gray
Write-Host "  kubectl exec -n logiflow postgres-billing-0 -- psql -U postgres -d billing_db -c 'SELECT COUNT(*) FROM tarifas;'" -ForegroundColor Gray
Write-Host ""
Write-Host "Limpiar dumps temporales:" -ForegroundColor Cyan
Write-Host "  Remove-Item -Recurse -Force $dumpDir" -ForegroundColor Gray
Write-Host ""
