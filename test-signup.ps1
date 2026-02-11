$headers = @{
    "Content-Type" = "application/json"
    "Origin" = "http://localhost:3009"
}

$body = @{
    name = "Juan Pérez"
    email = "juan.perez@example.com"
    password = "Password123!"
    role = "cliente"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3009/api/auth/sign-up/email" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -UseBasicParsing

    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response:"
    Write-Host $response.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
