# Script para testear el endpoint de cálculo de tarifa
# Este script usa Invoke-WebRequest de PowerShell para hacer requests HTTP explícitos

Write-Host "Testeando endpoint de billing..." -ForegroundColor Cyan
Write-Host ""

# Crear el body del request
$body = @{
    tipoEntrega = "URBANA"
    tipoVehiculo = "MOTORIZADO"
    distanciaKm = 5.2
    pesoKg = 2.5
    esUrgente = $false
    zonaId = "ZONA-001"
} | ConvertTo-Json

Write-Host "Request Body:" -ForegroundColor Yellow
Write-Host $body
Write-Host ""

# Hacer el request
try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:3009/billing/calculate-tariff" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -Headers @{
            "Accept" = "application/json"
        }
    
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    Write-Host "Error Status Code: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
    Write-Host "Error Response:" -ForegroundColor Red
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $errorBody = $reader.ReadToEnd()
    Write-Host $errorBody
}
