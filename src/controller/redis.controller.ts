import type { NextFunction, Request, Response } from "express";
import { redis } from "../redis/redis.database";

interface SetKeyBody {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	value: any;
	ttl?: number;
}

export class RedisController {
	static async getKey(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response | undefined> {
		try {
			const { key } = req.params;
			const value = await redis.get(key);
			return res.json({ key, value });
		} catch (error) {
			next(error);
		}
	}

	static async setKey(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response | undefined> {
		try {
			const { key } = req.params;
			const { value, ttl } = req.body;

			if (!value) {
				return res.status(400).json({ message: "Value is required" });
			}

			await redis.set(key, value, ttl);
			return res.json({ success: true });
		} catch (error) {
			next(error);
		}
	}

	static async deleteKey(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response | undefined> {
		try {
			const { key } = req.params;
			const result = await redis.delete(key);
			return res.json({ success: result });
		} catch (error) {
			next(error);
		}
	}

	static async getAllKeys(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response | undefined> {
		try {
			const keys = await redis.getAll();
			return res.json({ keys });
		} catch (error) {
			next(error);
		}
	}
}
