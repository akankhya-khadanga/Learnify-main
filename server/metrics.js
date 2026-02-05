import promClient from 'prom-client';

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5],
});

const httpRequestTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
});

const activeConnections = new promClient.Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
});

const errorTotal = new promClient.Counter({
    name: 'errors_total',
    help: 'Total number of errors',
    labelNames: ['type', 'service'],
});

// Business metrics
const courseRequestsTotal = new promClient.Counter({
    name: 'course_requests_total',
    help: 'Total number of course requests',
    labelNames: ['endpoint'],
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);
register.registerMetric(errorTotal);
register.registerMetric(courseRequestsTotal);

// Middleware to track HTTP metrics
export function metricsMiddleware(req, res, next) {
    const start = Date.now();

    // Increment active connections
    activeConnections.inc();

    // Track response
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route ? req.route.path : req.path;

        httpRequestDuration.observe(
            { method: req.method, route, status_code: res.statusCode },
            duration
        );

        httpRequestTotal.inc({
            method: req.method,
            route,
            status_code: res.statusCode,
        });

        // Decrement active connections
        activeConnections.dec();
    });

    next();
}

// Export metrics and register
export { register, errorTotal, courseRequestsTotal };
