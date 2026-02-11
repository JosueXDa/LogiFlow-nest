# Script para testear el endpoint de billing CON autenticación
# Primero hace login, luego usa la cookie de sesión para calcular tarifa

Write-Host "=== TEST DE BILLING CON AUTENTICACIÓN ===" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Login
Write-Host "1. Haciendo login..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@test.com"
    password = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest `
        -Uri "http://localhost:3009/api/auth/sign-in/email" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -SessionVariable session
    
    Write-Host "   ✓ Login exitoso" -ForegroundColor Green
    Write-Host "   Cookies: $($session.Cookies.GetCookies('http://localhost:3009').Count)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Error en login" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Paso 2: Calcular tarifa
Write-Host "2. Calculando tarifa..." -ForegroundColor Yellow
$tarifaBody = @{
    tipoEntrega = "URBANA"
    tipoVehiculo = "MOTORIZADO"
    distanciaKm = 5.2
    pesoKg = 2.5
    esUrgente = $false
    zonaId = "ZONA-001"
} | ConvertTo-Json

Write-Host "   Request Body:" -ForegroundColor Gray
Write-Host "   $tarifaBody" -ForegroundColor Gray
Write-Host ""

try {
    $tarifaResponse = Invoke-WebRequest `
        -Uri "http://localhost:3009/billing/calculate-tariff" `
        -Method POST `
        -Body $tarifaBody `
        -ContentType "application/json" `
        -WebSession $session
    
    Write-Host "   ✓ Petición exitosa (Status: $($tarifaResponse.StatusCode))" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== RESPUESTA ===" -ForegroundColor Cyan
    $responseObject = $tarifaResponse.Content | ConvertFrom-Json
    Write-Host ($responseObject | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "   ✗ Error en petición (Status: $($_.Exception.Response.StatusCode.Value__))" -ForegroundColor Red
    Write-Host ""
    Write-Host "=== ERROR RESPONSE ===" -ForegroundColor Red
    try {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        if ($errorBody) {
            $errorObject = $errorBody | ConvertFrom-Json
            Write-Host ($errorObject | ConvertTo-Json -Depth 10)
        } else {
            Write-Host $errorBody
        }
    } catch {
        Write-Host $_.Exception.Message
    }
}
