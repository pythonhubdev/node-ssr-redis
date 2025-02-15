import type { NextFunction, Request, Response } from "express";
import logger from "./logger";

function errorHandler(
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	if (err instanceof Error) {
		logger.error(err.message);

		res.status(500).json({
			message: "Internal server error",
			error: err.message || "An unexpected error occurred",
		});
	} else {
		logger.error("An unexpected error occurred %s", err);
		res.status(500).json({
			message: "Internal server error",
			error: "An unexpected error occurred",
		});
	}
}

export default errorHandler;
