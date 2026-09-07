//jai sri ram
import path from "node:path";
import liveServer from "live-server";
import { startWithInjection } from "./live-server-inject-script.js";
import { recievemaindebug } from "../main.js";
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

	const myCustomScript = `
<script>
(() => {
    /*
     * Safely convert anything into something JSON can handle.
     */
	
   function serialize(value) {
    try {
        return String(value);
    } catch {
        return "[Unserializable]";
    }
}

    /*
     * Send an event to the development server.
     */
    function send(type, args, extra = {}) {
        const payload = {
            type,
            timestamp: new Date().toISOString(),
            message: args.map(serialize),
            ...extra
        };

        fetch("/__incoming_logs__", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }).catch(() => {
            // Don't use console.error here.
            // It would trigger our interceptor again.
        });
    }

    /*
     * Keep references to the ORIGINAL console methods.
     */
    const originalConsole = {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
        debug: console.debug
    };
	window.addEventListener("error", event => {
    originalConsole.error.call(
        console,
        event.error || event.message
    );

    send("exception", [event.message], {
        filename: event.filename || null,
        lineno: event.lineno || null,
        colno: event.colno || null,
        stack: event.error?.stack || null
    });
});

    /*
     * Replace console methods while preserving their
     * normal DevTools behavior.
     */
    for (const type of Object.keys(originalConsole)) {
        const original = originalConsole[type];

        console[type] = function (...args) {
            // Normal browser console behavior
            original.apply(console, args);

            // Send it to the development server
            send(type, args);
        };
    }

    /*
     * Catch uncaught JavaScript errors.
     */
    window.addEventListener("error", event => {
        originalConsole.error.call(
            console,
            event.error || event.message
        );

        send("exception", [event.message], {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack ?? null
        });
    });

    /*
     * Catch rejected Promises that nobody handled.
     */
    window.addEventListener("unhandledrejection", event => {
        const reason = serialize(event.reason);

        originalConsole.error.call(
            console,
            "Unhandled Promise Rejection:",
            event.reason
        );

        send("unhandledrejection", [reason], {
            stack: event.reason?.stack ?? null
        });
    });

    originalConsole.log.call(
        console,
        "🚀 Noferic browser log collector injected!"
    );
})();
</script>
`;

	startWithInjection(opts, myCustomScript);
};