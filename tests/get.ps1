Write-Host "Fetching submissions..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/storage" -Method Get
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "Message: $($response.message)" -ForegroundColor Yellow
    Write-Host "`nFiles found:" -ForegroundColor Yellow
    $response.files | ForEach-Object {
        Write-Host "  - $($_.name)" -ForegroundColor White
    }
} catch {
    Write-Host "Error!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
