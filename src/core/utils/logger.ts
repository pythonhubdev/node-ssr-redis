import { createLogger, format, transports } from "winston";

class AppLogger {
	public logger;

	private customFormat = format.printf(({ level, message, _, stack }) => {
		const currentTime = new Date()
			.toISOString()
			.replace("T", " ")
			.substring(0, 19);
		let logFormat = `${currentTime} - ${level}: ${message}`;

		if (stack) {
			logFormat += `\n${stack}`;
		}

		return logFormat;
	});

	constructor() {
		this.logger = createLogger({
			level: "http", // Default level, will be updated later
			format: format.combine(
				format.colorize({
					all: true,
					colors: {
						info: "green bold",
						error: "red bold",
						warn: "cyan italic",
						http: "cyan bold",
					},
				}),
				format.timestamp(),
				format.errors({ stack: true }),
				format.prettyPrint({ colorize: true }),
				this.customFormat,
			),
			transports: [new transports.Console()],
		});
	}
}
const logger = new AppLogger().logger;
export default logger;
