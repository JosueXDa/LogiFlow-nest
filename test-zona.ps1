$headers = @{
    "Content-Type" = "application/json"
    "Origin" = "http://localhost:3009"
}

# 1. Login
Write-Host "1. Login..." -ForegroundColor Cyan
$loginBody = @{
    email = "admin@logiflow.com"
    password = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3009/api/auth/sign-in/email" `
        -Method POST `
        -Headers $headers `
        -Body $loginBody `
        -UseBasicParsing

    $authData = $loginResponse.Content | ConvertFrom-Json
    $token = $authData.token
    
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
    Write-Host "   User: $($authData.user.email)" -ForegroundColor Gray
    Write-Host "   Role: $($authData.user.role)" -ForegroundColor Gray
    
    # 2. Crear zona
    Write-Host "`n2. Creando zona..." -ForegroundColor Cyan
    $zonaBody = @{
        nombre = "Zona PowerShell Test"
        descripcion = "Test desde PowerShell"
    } | ConvertTo-Json
    
    $zonaHeaders = @{
        "Content-Type" = "application/json"
        "Cookie" = "better_auth.session_token=$token"
        "Origin" = "http://localhost:3009"
    }
    
    Write-Host "   Headers: $($zonaHeaders | ConvertTo-Json -Compress)" -ForegroundColor Gray
    Write-Host "   Body: $zonaBody" -ForegroundColor Gray
    
    $zonaResponse = Invoke-WebRequest -Uri "http://localhost:3009/flota/zonas" `
        -Method POST `
        -Headers $zonaHeaders `
        -Body $zonaBody `
        -UseBasicParsing
    
    Write-Host "✅ Zona creada exitosamente!" -ForegroundColor Green
    Write-Host "   Response:" -ForegroundColor Gray
    Write-Host $zonaResponse.Content
    
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Red
    }
    Write-Host "   Message: $($_.Exception.Message)" -ForegroundColor Red
}
