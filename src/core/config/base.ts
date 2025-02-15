import { randomBytes } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import * as dotenv from "dotenv";

enum Environment {
	DEVELOPMENT = "development",
	PRODUCTION = "production",
}

class LogSettings {
	level: string;
	obfuscateCookies: Set<string>;
	obfuscateHeaders: Set<string>;

	constructor() {
		this.level = process.env.LOG_LEVEL || "http";
		this.obfuscateCookies = new Set(["session"]);
		this.obfuscateHeaders = new Set(["Authorization", "X-API-KEY"]);
	}
}

class AppSettings {
	secretKey: string;
	name: string;
	allowedCorsOrigins: string[];
	csrfCookieName: string;
	csrfCookieSecure: boolean;
	jwtEncryptionAlgorithm: string;
	smtpHost: string;
	smtpPort: number;
	smtpEmail?: string;
	smtpPassword?: string;
	webUrl?: string;

	constructor() {
		this.secretKey =
			process.env.SECRET_KEY || randomBytes(32).toString("hex");
		this.name = process.env.APP_NAME || "Chronologix";
		this.allowedCorsOrigins = JSON.parse(
			process.env.ALLOWED_CORS_ORIGINS || '["http://localhost:8000"]',
		);
		this.csrfCookieName = "csrftoken";
		this.csrfCookieSecure = false;
		this.jwtEncryptionAlgorithm = "aes-256-cbc";
		this.smtpHost = process.env.SMTP_HOST || "smtp.mailtrap.io";
		this.smtpPort = Number.parseInt(process.env.SMTP_PORT || "2525", 10);
		this.smtpEmail = process.env.SMTP_EMAIL;
		this.smtpPassword = process.env.SMTP_PASSWORD;
		this.webUrl = process.env.WEB_URL || "http://localhost:8000";
	}
}

class ServerSettings {
	appLoc: string;
	host: string;
	port: number;
	httpWorkers: number;

	constructor() {
		this.appLoc = process.env.APP_LOC || "app:app";
		this.host = process.env.HOST || "0.0.0.0";
		this.port = Number.parseInt(process.env.PORT || "8000", 10);
		this.httpWorkers = Number.parseInt(
			process.env.WEB_CONCURRENCY || "1",
			10,
		);
	}
}

class DatabaseSettings {
	host: string;
	port: number;
	user: string;
	password?: string;
	database?: string;

	constructor() {
		this.host = process.env.DB_HOST || "localhost";
		this.port = Number.parseInt(process.env.DB_PORT || "5432", 10);
		this.user = process.env.DB_USER || "superuser";
		this.password = process.env.DB_PASSWORD;
		this.database = process.env.DB_NAME;
	}
}

class Settings {
	app: AppSettings;
	server: ServerSettings;
	log: LogSettings;
	database: DatabaseSettings;

	constructor() {
		this.app = new AppSettings();
		this.server = new ServerSettings();
		this.log = new LogSettings();
		this.database = new DatabaseSettings();
	}

	static fromEnv() {
		const environment: Environment =
			(process.env.ENVIRONMENT as Environment) || Environment.DEVELOPMENT;
		const dotenvFilename = `.env.${environment}`;
		const envFilePath = path.resolve(process.cwd(), dotenvFilename);

		if (environment !== Environment.PRODUCTION) {
			if (fs.existsSync(envFilePath)) {
				dotenv.config({
					path: envFilePath,
					debug: environment === Environment.DEVELOPMENT,
					encoding: "utf8",
				});
			}
		}

		return new Settings();
	}
}

const settings = Settings.fromEnv();
export default settings;
