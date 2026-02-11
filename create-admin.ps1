$headers = @{
    "Content-Type" = "application/json"
    "Origin" = "http://localhost:3009"
}

$body = @{
    name = "Admin Sistema"
    email = "admin@logiflow.com"
    password = "Admin123!"
    role = "ADMIN"
} | ConvertTo-Json

Write-Host "Creando usuario admin..."

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3009/api/auth/sign-up/email" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -UseBasicParsing

    Write-Host "✅ Usuario admin creado exitosamente"
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response:"
    Write-Host $response.Content
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "⚠️  Usuario admin ya existe (409 Conflict)"
    } else {
        Write-Host "Error: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody"
        }
    }
}
