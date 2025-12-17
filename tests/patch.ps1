$json = @"
{
  "filename": "pending__2025-12-17-test-microproduct.yaml",
  "newStatus": "approved"
}
"@

Write-Host "Updating submission status..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/storage" -Method Patch -Body $json -ContentType "application/json"
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "Old filename: $($response.oldFilename)" -ForegroundColor Yellow
    Write-Host "New filename: $($response.newFilename)" -ForegroundColor Yellow
    Write-Host "Message: $($response.message)" -ForegroundColor Yellow
} catch {
    Write-Host "Error!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
