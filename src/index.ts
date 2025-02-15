import path                 from "node:path";
import cors                 from "cors";
import type {Application}   from "express";
import express              from "express";
import rateLimit            from "express-rate-limit";
import helmet               from "helmet";
import swaggerJsdoc         from "swagger-jsdoc";
import settings             from "./core/config/base";
import errorHandler         from "./core/utils/errorHandler";
import logger               from "./core/utils/logger";
import loggingMiddleware    from "./middlewares/logging.middleware";
import openApiSpecification from "./core/config/openapi";
import {redis}              from "./redis/redis.database";
import redisRouter          from "./routes/redis.route";
import SsrController        from "./controller/ssr.controller";

const app: Application = express();
app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || settings.app.allowedCorsOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	}),
);

// Use Helmet for Security Headers
app.use(
	helmet({
		crossOriginEmbedderPolicy: false,
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
			},
		},
	}),
);

// Rate Limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 100,
});
app.use(limiter);

app.use(express.json());

app.use(loggingMiddleware);

app.use(errorHandler);

const ApiDefinition = swaggerJsdoc({
	failOnErrors: true,
	definition: {
		openapi: "3.1.0",
		info: {
			title: settings.app.name,
			description: "Chronologix API Documentation",
			version: "1.0.0",
		},
	},
	apis: [
		path.join(__dirname, "index.ts"),
		path.join(__dirname, "routes/*.ts"),
	],
});

app.get("/openapi.json", (_, res) => {
	res.json(ApiDefinition);
});

app.use("/schema", openApiSpecification);

app.use("/api/data", redisRouter);


app.get("/", (req, res, next) => {
	SsrController.getValue(req, res, next).catch(next);
});

app.get("/stream", async (req, res) => {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");

	const subscriber = redis.getClient().duplicate();
	await subscriber.connect();

	const initialValue =
		(await redis.get<string>("ssr:value")) || "Default Value";
	res.write(`data: ${initialValue}\n\n`);

	await subscriber.subscribe("ssr:updates", (message) => {
		res.write(`data: ${message}\n\n`);
	});

	req.on("close", () => {
		subscriber.quit();
	});
});

app.post('/api/update', async (req, res) => {
	const {value} = req.body;

	await redis.set('ssr:value', JSON.stringify(value));

	await redis.publish('ssr:updates', JSON.stringify(value));

	res.json({success: true});
});

app.listen(settings.server.port, settings.server.host, async () => {
	await redis.connect();

	if (process.env.ENVIROMENT !== "production") {
		logger.warn(
			`Server is running on port http://${settings.server.host}:${settings.server.port}`,
		);
	} else {
		logger.info(
			`Server is running on port https://${settings.server.host}:${settings.server.port}`,
		);
	}
});

export {logger};
