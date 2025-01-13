import winston from "winston";

const customFormat = winston.format.printf(
    ({ level, message, timestamp, ...meta }) => {
        const metaString =
            Object.keys(meta).length > 0 ? JSON.stringify(meta) : "";
        return `${timestamp} [${level}]: ${message} ${metaString}`;
    },
);

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "debug",
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        customFormat,
    ),
});
