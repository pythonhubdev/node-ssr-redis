import morgan, { type StreamOptions } from "morgan";
import logger from "../core/utils/logger";

class MorganMiddleware {
	private readonly format: string;
	private readonly stream: StreamOptions;

	constructor() {
		this.format =
			":method :url :status :res[content-length] - :response-time ms";
		this.stream = {
			write: (message: string) => logger.http(message.trim()),
		};
	}

	public getMiddleware() {
		return morgan(this.format, { stream: this.stream });
	}
}

const loggingMiddleware = new MorganMiddleware().getMiddleware();

export default loggingMiddleware;
