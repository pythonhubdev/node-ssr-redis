import { createClient, type RedisClientType } from "redis";
import logger from "../core/utils/logger";

type RedisValue = string | number | boolean | object;

export class RedisBase {
	private client: RedisClientType;
	private static instance: RedisBase;
	private isConnected = false;

	private constructor() {
		this.client = createClient({
			url: `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || 6379}`,
		});

		this.client.on("error", (err) =>
			console.error("Redis Client Error:", err),
		);
		this.client.on("connect", () => {
			logger.info("Redis connected");
			this.isConnected = true;
		});
		this.client.on("end", () => {
			logger.info("Redis disconnected");
			this.isConnected = false;
		});
	}

	static getInstance(): RedisBase {
		if (!RedisBase.instance) {
			RedisBase.instance = new RedisBase();
		}
		return RedisBase.instance;
	}

	async connect(): Promise<void> {
		if (!this.isConnected) {
			await this.client.connect();
			this.isConnected = true;
		}
	}

	async get<T>(key: string): Promise<T | string | null> {
		if (!this.isConnected) throw new Error("Redis client not connected");
		const value = await this.client.get(key);

		if (!value) return null;

		try {
			return JSON.parse(value) as T;
		} catch (error) {
			return value;
		}
	}

	async set(key: string, value: RedisValue, ttl?: number): Promise<boolean> {
		const stringValue =
			typeof value === "string" ? value : JSON.stringify(value);

		if (ttl) {
			await this.client.setEx(key, ttl, stringValue);
		} else {
			await this.client.set(key, stringValue);
		}

		return true;
	}

	async delete(key: string): Promise<boolean> {
		const result = await this.client.del(key);
		return result > 0;
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	async getAll(pattern = "*"): Promise<Array<{ key: string; value: any }>> {
		const keys = await this.client.keys(pattern);
		return Promise.all(
			keys.map(async (key) => ({
				key,
				value: await this.get(key),
			})),
		);
	}

	async publish(channel: string, message: RedisValue): Promise<number> {
		return this.client.publish(channel, JSON.stringify(message));
	}

	getClient(): RedisClientType {
		return this.client;
	}
}

export const redis = RedisBase.getInstance();
