# Test microproduct submission
$json = @"
{
  "title": "Test Microproduct",
  "purpose": "Testing the submission system",
  "deliverable": "A test YAML file in GitHub",
  "output_type": "Framework Document",
  "scope": "Just a test",
  "target_audience": "COSMIC Members",
  "releasability": "cosmic-only",
  "duration_weeks": 4,
  "milestones": "Week 1-2: Setup\nWeek 3-4: Testing",
  "effort_estimate": "10 hours",
  "lead_name": "Test User",
  "lead_email": "test@example.com",
  "team_members": "",
  "focus_area": "Research and Technology",
  "dependencies": "None"
}
"@

Write-Host "Submitting test microproduct..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/storage" -Method Post -Body $json -ContentType "application/json"
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "Filename: $($response.filename)" -ForegroundColor Yellow
    Write-Host "Message: $($response.message)" -ForegroundColor Yellow
} catch {
    Write-Host "Error!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
