import { redis } from "../redis/redis.database";
import type express from "express";

class SsrController {
	static async getValue(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction,
		// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
	): Promise<express.Response | void> {
		try {
			const initialValue =
				(await redis.get<string>("ssr:value")) || "Default Value";
			const displayValue =
				typeof initialValue === "string"
					? initialValue
					: JSON.stringify(initialValue);
			return res.send(`
        <html>
        	<head>
        		<title>Redis SSR Demo</title>
          		<script>
			  		const eventSource = new EventSource('/stream');

				  	eventSource.onmessage = (e) => {
						try {
					  	const data = JSON.parse(e.data);
					  		document.getElementById('value').textContent = data;
						} catch {
					  		document.getElementById('value').textContent = e.data;
						}
						document.getElementById('update-time').textContent = new Date().toLocaleTimeString();
				  	};

			  			eventSource.onerror = (err) => {
						console.error('EventSource failed:', err);
						eventSource.close();
			  		};
				</script>
          	</head>
          	<body>
            	<h1>Real-Time Value Display</h1>
            	<div>
              		Current Value: <span id="value">${displayValue}</span>
            	</div>
            	<div>
              		Last Updated: <span id="update-time">${new Date().toLocaleTimeString()}</span>
            	</div>
          	</body>
        </html>
      `);
		} catch (error) {
			next(error);
		}
	}
}

export default SsrController;
