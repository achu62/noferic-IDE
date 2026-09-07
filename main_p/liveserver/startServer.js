//jai sri ram
import path from "node:path";
import liveServer from "live-server";
import { startWithInjection } from "./live-server-inject-script.js";
import { recievemaindebug } from "../main.js";
import {myCustomScript} from "./export-script.js"
const collector = (req, res, next) => {
	if (req.url === "/__incoming_logs__" && req.method === "POST") {
		let body = "";

		req.on("data", chunk => {
			body += chunk;
		});

		req.on("end", () => {
			try {
				const data = JSON.parse(body);

				const type = data?.type ?? "unknown";
				const message = data?.message ?? "";
				recievemaindebug(data)

				if (data?.stack) {
					console.log(data.stack);
				}

				res.writeHead(200, {
					"Content-Type": "text/plain"
				});

				res.end("Logged");
			} catch (error) {


				res.writeHead(400, {
					"Content-Type": "text/plain"
				});

				res.end("Invalid payload");
			}
		});

		return;
	}

	next();
};

export const start_server = async (e, obj, pathreal) => {
	const opts = {
		port: obj.port,
		host: "127.0.0.1",
		root: path.join(pathreal, obj.relativepath),
		open: obj.toOpen,
		wait: 100,
		middleware: [collector]
	};

	

	startWithInjection(opts, myCustomScript);
};