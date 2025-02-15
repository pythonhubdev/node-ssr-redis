// @ts-ignore
import { apiReference } from "@scalar/express-api-reference";

const openApiSpecification = apiReference({
	theme: "default",
	layout: "modern",
	isEditable: true,
	// biome-ignore lint/style/useNamingConvention: <explanation>
	baseServerURL: "http://localhost:8000",
	pathRouting: {
		basePath: "http://localhost:8000",
	},
	spec: {
		url: "/openapi.json",
	},
	servers: [
		{
			url: "http://localhost:8000",
			description: "Local Server",
		},
		{
			url: "https://api.chronologix.com",
			description: "Production Server",
		},
	],
});

export default openApiSpecification;
