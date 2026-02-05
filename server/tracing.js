// OpenTelemetry Tracing Configuration
// This file MUST be imported before any other application code
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

// Configure the trace exporter
const traceExporter = new OTLPTraceExporter({
    // Hypertrace collector endpoint (default)
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
});

// Configure the SDK
const sdk = new NodeSDK({
    resource: new Resource({
        [ATTR_SERVICE_NAME]: 'learnify-backend',
        [ATTR_SERVICE_VERSION]: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
    }),
    traceExporter,
    instrumentations: [
        getNodeAutoInstrumentations({
            // Disable instrumentations that might cause issues
            '@opentelemetry/instrumentation-fs': {
                enabled: false,
            },
        }),
    ],
});

// Start the SDK
sdk.start();

console.log('OpenTelemetry tracing initialized');
console.log(`Exporting traces to: ${process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces'}`);

// Gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
    sdk
        .shutdown()
        .then(() => console.log('OpenTelemetry SDK shut down successfully'))
        .catch((error) => console.error('Error shutting down OpenTelemetry SDK', error))
        .finally(() => process.exit(0));
});

export default sdk;
