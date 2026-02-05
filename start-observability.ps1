# Start Learnify with Full Observability Stack

Write-Host "🚀 Starting Learnify Observability Stack..." -ForegroundColor Cyan

# Check if Docker is running
$dockerRunning = docker ps 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker is running" -ForegroundColor Green

# Start observability stack
Write-Host "`n📊 Starting observability services (Neo4j, ELK, Hypertrace)..." -ForegroundColor Yellow
docker-compose -f docker-compose.observability.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start observability stack" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Observability stack started" -ForegroundColor Green

# Wait for services to be ready
Write-Host "`n⏳ Waiting for services to be ready (this may take 2-3 minutes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service health
Write-Host "`n🔍 Checking service health..." -ForegroundColor Yellow

$services = @(
    @{Name="Elasticsearch"; Url="http://localhost:9200"; Port=9200},
    @{Name="Kibana"; Url="http://localhost:5601"; Port=5601},
    @{Name="Hypertrace"; Url="http://localhost:2020"; Port=2020},
    @{Name="Neo4j"; Url="http://localhost:7474"; Port=7474}
)

foreach ($service in $services) {
    $maxRetries = 30
    $retryCount = 0
    $isReady = $false
    
    while ($retryCount -lt $maxRetries -and -not $isReady) {
        try {
            $response = Invoke-WebRequest -Uri $service.Url -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
            $isReady = $true
            Write-Host "  ✅ $($service.Name) is ready" -ForegroundColor Green
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                Write-Host "  ⚠️  $($service.Name) is not responding (this is OK, it may still be starting)" -ForegroundColor Yellow
            } else {
                Start-Sleep -Seconds 2
            }
        }
    }
}

# Display access information
Write-Host "`n📍 Access Points:" -ForegroundColor Cyan
Write-Host "  🌐 Learnify App:       http://localhost:5173" -ForegroundColor White
Write-Host "  🔧 Backend API:        http://localhost:3001" -ForegroundColor White
Write-Host "  📊 Prometheus Metrics: http://localhost:3001/metrics" -ForegroundColor White
Write-Host "  📈 Kibana (Logs):      http://localhost:5601" -ForegroundColor White
Write-Host "  🔍 Hypertrace:         http://localhost:2020" -ForegroundColor White
Write-Host "  🗄️  Neo4j Browser:      http://localhost:7474" -ForegroundColor White

Write-Host "`n🎯 Starting Learnify application..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the application`n" -ForegroundColor Gray

# Start the application
npm run dev:all
