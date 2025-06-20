# Skrypt do uruchamiania Zoo Manager
# Uruchamiaj z katalogu głównego projektu!

# Przejdź do katalogu głównego projektu (gdzie jest plik requirements.txt)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "=== Zoo Manager - Uruchamianie ===" -ForegroundColor Green
Write-Host "Katalog projektu: $scriptPath" -ForegroundColor Gray

# Zapisz bieżący katalog
$projectRoot = Get-Location

Write-Host "Instalowanie zależności Python..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host "Wykonywanie migracji..." -ForegroundColor Yellow
Set-Location BAW
python manage.py makemigrations
python manage.py migrate

Write-Host "Instalowanie zależności Node.js..." -ForegroundColor Yellow
Set-Location $projectRoot\frontend
npm install

Write-Host "Uruchamianie serwerów..." -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan

# Uruchom backend (z katalogu BAW)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\BAW'; python manage.py runserver"

# Uruchom frontend (z katalogu frontend)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\frontend'; npm run dev"

Write-Host "Serwery uruchomione!" -ForegroundColor Green 