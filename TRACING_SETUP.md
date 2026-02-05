# OpenTelemetry Tracing Setup for Learnify

## Installation

1. Install the OpenTelemetry dependencies:
   ```bash
   npm install @opentelemetry/sdk-trace-node@^1.17.0 \
               @opentelemetry/resources@^1.17.0 \
               @opentelemetry/semantic-conventions@^1.17.0 \
               @opentelemetry/exporter-trace-otlp-http@^0.43.0 \
               @opentelemetry/sdk-trace-base@^1.17.0 \
               @opentelemetry/instrumentation@^0.43.0 \
               @opentelemetry/instrumentation-http@^0.43.0 \
               @opentelemetry/instrumentation-express@^0.33.0
   ```

2. Import the tracing module at the VERY TOP of your main app file (before any other imports):
   ```javascript
   // Must be first!
   require('./tracing');
   
   // Now your other imports
   const express = require('express');
   // ... rest of your code
   ```

## Verification

1. Start your Learnify app:
   ```bash
   npm run dev
   ```

2. Make some requests to your app:
   ```bash
   curl http://localhost:3001/api/courses
   ```

3. Check Hypertrace dashboard:
   Open http://localhost:2020 and you should see traces appearing!

## What Gets Traced

- All HTTP requests (incoming and outgoing)
- Express route handlers
- Database calls (if instrumented)
- External API calls

## Troubleshooting

If traces don't appear:
1. Check that Hypertrace collector is running: `docker ps | grep hypertrace-collector`
2. Verify the collector endpoint: `curl http://localhost:4318/v1/traces`
3. Check your app logs for "OpenTelemetry tracing initialized" message
