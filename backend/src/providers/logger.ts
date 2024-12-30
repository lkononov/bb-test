import fs from 'fs';
import path from 'path';

enum LogLevel {
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    DEBUG = 'debug',
}

const LOG_DIR = path.join(
    __dirname,
    '../../logs',
    process.env.ENV_NAME || 'dev',
);

class Logger {
    private writeToFile(level: LogLevel, message: string): void {
        const logFilePath = path.join(LOG_DIR, level + '.log');
        const timestamp = new Date().toLocaleString('pl-PL', {
            timeZone: 'Europe/Warsaw',
        });
        const logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}\n`;

        fs.appendFile(logFilePath, logMessage, (err) => {
            if (err) {
                console.error('Error writing to log file:', err);
            }
        });
    }

    info(message: string): void {
        if (process.env.LOG_LEVEL !== 'info') {
            return;
        }
        console.info(`INFO: ${message}`);
        this.writeToFile(LogLevel.INFO, message);
    }

    warn(message: string): void {
        console.warn(`WARN: ${message}`);
        this.writeToFile(LogLevel.WARN, message);
    }

    error(message: string): void {
        console.error(`ERROR: ${message}`);
        this.writeToFile(LogLevel.ERROR, message);
    }

    debug(message: string): void {
        if (process.env.LOG_LEVEL !== 'debug') {
            return;
        }
        console.debug(`DEBUG: ${message}`);
        this.writeToFile(LogLevel.DEBUG, message);
    }
}

const logger = new Logger();

export const initLoggerFilesystem = () => {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
};

export default logger;
