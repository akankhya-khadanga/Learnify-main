// OpenTelemetry Tracing Configuration for Learnify
// Simplified setup for Hypertrace connection

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

// Configure and start the SDK
const sdk = new NodeSDK({
  serviceName: 'learnify-backend',
  traceExporter: new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

console.log('✅ OpenTelemetry tracing initialized');
console.log('   Sending traces to: http://localhost:4318/v1/traces');
console.log('   Service name: learnify-backend');

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});

