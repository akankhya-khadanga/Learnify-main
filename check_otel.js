import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const packages = [
    '@opentelemetry/sdk-trace-node',
    '@opentelemetry/resources',
    '@opentelemetry/semantic-conventions',
    '@opentelemetry/exporter-trace-otlp-http',
    '@opentelemetry/sdk-trace-base',
    '@opentelemetry/instrumentation',
    '@opentelemetry/instrumentation-http',
    '@opentelemetry/instrumentation-express'
];

console.log('Checking packages...');
packages.forEach(pkg => {
    try {
        const path = require.resolve(pkg);
        console.log(`✅ ${pkg}: ${path}`);
    } catch (e) {
        console.log(`❌ ${pkg}: ${e.message}`);
    }
});
