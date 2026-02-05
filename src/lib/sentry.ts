import * as Sentry from '@sentry/react';

// Initialize Sentry for React
export function initSentry() {
    // Only initialize if DSN is provided
    const dsn = import.meta.env.VITE_SENTRY_DSN;

    if (!dsn) {
        console.log('Sentry DSN not configured - error tracking disabled');
        return;
    }

    Sentry.init({
        dsn,
        environment: import.meta.env.MODE || 'development',

        // Performance Monitoring
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                maskAllText: false,
                blockAllMedia: false,
            }),
        ],

        // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,

        // Capture Replay for 10% of all sessions,
        // plus for 100% of sessions with an error
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,

        // Filter out certain errors
        beforeSend(event, hint) {
            // Don't send errors in development
            if (import.meta.env.MODE === 'development') {
                console.log('Sentry event (dev mode):', event);
                return null;
            }
            return event;
        },
    });

    console.log('Sentry initialized for frontend');
}

// Set user context
export function setSentryUser(user: { id: string; email?: string; username?: string }) {
    Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
    });
}

// Clear user context on logout
export function clearSentryUser() {
    Sentry.setUser(null);
}

// Manually capture an exception
export function captureException(error: Error, context?: Record<string, any>) {
    Sentry.captureException(error, {
        extra: context,
    });
}

// Manually capture a message
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    Sentry.captureMessage(message, level);
}

// Add breadcrumb for debugging
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
    Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
    });
}

export default Sentry;
