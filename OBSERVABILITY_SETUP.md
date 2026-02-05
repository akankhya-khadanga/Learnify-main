# Learnify Observability Stack Startup Guide

## Quick Start - Start Everything

```powershell
# Start all observability services
docker-compose -f docker-compose.observability.yml up -d

# Wait for services to be ready (about 2-3 minutes)
Start-Sleep -Seconds 120

# Start your application
npm run dev:all
```

## Access Points

Once everything is running, you can access:

| Service | URL | Purpose |
|---------|-----|---------|
| **Learnify App** | http://localhost:5173 | Your application |
| **Backend API** | http://localhost:3001 | Backend server |
| **Prometheus Metrics** | http://localhost:3001/metrics | Metrics endpoint |
| **Kibana** | http://localhost:5601 | Log visualization (ELK) |
| **Hypertrace UI** | http://localhost:2020 | Distributed tracing |
| **Neo4j Browser** | http://localhost:7474 | Code graph (CCP) |
| **Elasticsearch** | http://localhost:9200 | Log storage |

## Step-by-Step Setup

### 1. Start Observability Stack

```powershell
# Start all services
docker-compose -f docker-compose.observability.yml up -d

# Check status
docker-compose -f docker-compose.observability.yml ps

# View logs
docker-compose -f docker-compose.observability.yml logs -f
```

### 2. Configure Environment

Create `.env.local` file:

```bash
# Enable all monitoring features
ENABLE_LOGSTASH=true
ENABLE_TRACING=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
LOG_LEVEL=info
```

### 3. Start Application

```powershell
npm run dev:all
```

### 4. Verify Everything Works

**Test Tracing:**
```powershell
# Make a request
curl http://localhost:3001/api/courses/external

# Check Hypertrace UI
start http://localhost:2020
```

**Test Logging:**
```powershell
# Check Kibana
start http://localhost:5601

# In Kibana:
# 1. Go to "Discover"
# 2. Create index pattern: learnify-logs-*
# 3. View your logs
```

**Test Metrics:**
```powershell
# View Prometheus metrics
curl http://localhost:3001/metrics
```

## Stop Services

```powershell
# Stop application
# Press Ctrl+C in the terminal running npm

# Stop observability stack
docker-compose -f docker-compose.observability.yml down

# Stop and remove volumes (clean slate)
docker-compose -f docker-compose.observability.yml down -v
```

## Troubleshooting

### Services won't start
```powershell
# Check Docker is running
docker ps

# Check ports are not in use
netstat -ano | findstr "9200 5601 2020 7474"

# Restart Docker Desktop
```

### Logs not appearing in Kibana
```powershell
# Check Logstash is running
docker logs learnify-logstash

# Check environment variable
echo $env:ENABLE_LOGSTASH

# Restart application with Logstash enabled
```

### Traces not appearing in Hypertrace
```powershell
# Check Hypertrace is running
docker logs learnify-hypertrace

# Check OpenTelemetry endpoint
echo $env:OTEL_EXPORTER_OTLP_ENDPOINT

# Make some requests to generate traces
curl http://localhost:3001/api/courses/external
```

## Individual Services

### Start only ELK Stack
```powershell
docker-compose -f docker-compose.elk.yml up -d
```

### Start only Hypertrace
```powershell
docker-compose -f docker-compose.hypertrace.yml up -d
```

### Start only Neo4j (for CCP)
```powershell
docker run -d --name neo4j -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:latest
```

## Resource Usage

Approximate memory usage:
- Elasticsearch: ~1GB
- Logstash: ~500MB
- Kibana: ~500MB
- Hypertrace: ~1GB
- Neo4j: ~500MB
- **Total: ~3.5GB**

Make sure you have at least 4GB RAM available for Docker.

## For Placement Demo

### Demo Flow

1. **Start with architecture diagram**
   - Show docker-compose.observability.yml
   - Explain the three pillars

2. **Show Prometheus Metrics**
   - Open http://localhost:3001/metrics
   - Explain metrics being collected

3. **Show Hypertrace**
   - Open http://localhost:2020
   - Make a request
   - Show the trace visualization

4. **Show Kibana**
   - Open http://localhost:5601
   - Show log dashboard
   - Search for specific errors

5. **Trigger an error**
   - curl http://localhost:3001/api/test-error
   - Show it in all three systems

### Key Talking Points

- "We use industry-standard observability tools"
- "OpenTelemetry for vendor-neutral instrumentation"
- "ELK Stack for centralized log management"
- "Hypertrace for distributed tracing"
- "Same stack used by companies like Uber, Netflix, Airbnb"
