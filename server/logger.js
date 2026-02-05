import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import LogstashTransport from 'winston-logstash/lib/winston-logstash-latest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'learnify-backend' },
    transports: [
        // Write all logs to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
                    let msg = `${timestamp} [${service}] ${level}: ${message}`;
                    if (Object.keys(meta).length > 0) {
                        msg += ` ${JSON.stringify(meta)}`;
                    }
                    return msg;
                })
            ),
        }),
        // Write all logs to combined.log
        new winston.transports.File({
            filename: path.join(__dirname, 'logs', 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write error logs to error.log
        new winston.transports.File({
            filename: path.join(__dirname, 'logs', 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});

// Add Logstash transport if enabled
if (process.env.ENABLE_LOGSTASH === 'true') {
    logger.add(new LogstashTransport({
        port: 5000,
        host: process.env.LOGSTASH_HOST || 'localhost',
        max_connect_retries: -1,
        timeout_connect_retries: 5000,
    }));
    logger.info('Logstash transport enabled');
}

// Create a stream object for Morgan HTTP logger
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};

export default logger;
