# Script para probar el endpoint de factura por pedido CON autenticación

Write-Host "=== TEST DE BILLING BY ORDER ===" -ForegroundColor Cyan
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
    $cookies = $session.Cookies.GetCookies('http://localhost:3009')
    Write-Host "   Cookies: $($cookies.Count)" -ForegroundColor Gray
    foreach ($cookie in $cookies) {
        Write-Host "     - $($cookie.Name): $($cookie.Value.Substring(0, [Math]::Min(20, $cookie.Value.Length)))..." -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Error en login" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Paso 2: Obtener factura por pedido
$pedidoId = "1fe2ae6c-eb82-4172-9282-bf9611dd05b6"
Write-Host "2. Obteniendo factura para pedido: $pedidoId..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:3009/billing/invoices/order/$pedidoId" `
        -Method GET `
        -WebSession $session
    
    Write-Host "   ✓ Petición exitosa (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== FACTURA ===" -ForegroundColor Cyan
    $factura = $response.Content | ConvertFrom-Json
    Write-Host ($factura | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "   ✗ Error (Status: $($_.Exception.Response.StatusCode.Value__))" -ForegroundColor Red
    Write-Host ""
    Write-Host "=== ERROR ===" -ForegroundColor Red
    try {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        $errorObject = $errorBody | ConvertFrom-Json
        Write-Host ($errorObject | ConvertTo-Json -Depth 10)
    } catch {
        Write-Host $_.Exception.Message
    }
}
