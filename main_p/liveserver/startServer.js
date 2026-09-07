//jai sri ram
import path from "node:path";
import liveServer from "live-server";
import { startWithInjection } from "./live-server-inject-script.js";

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
				console.log(JSON.stringify(data))
               

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
    function serialize(value, seen = new WeakSet()) {
        if (value instanceof Error) {
            return {
                name: value.name,
                message: value.message,
                stack: value.stack
            };
        }

        if (typeof value === "bigint") {
            return value.toString() + "n";
        }

        if (typeof value === "function") {
            return "[Function " + (value.name || "anonymous") + "]";
        }

        if (typeof value === "symbol") {
            return value.toString();
        }

        if (value && typeof value === "object") {
            if (seen.has(value)) {
                return "[Circular]";
            }

            seen.add(value);

            if (Array.isArray(value)) {
                return value.map(item => serialize(item, seen));
            }

            const result = {};

            for (const key of Object.keys(value)) {
                try {
                    result[key] = serialize(value[key], seen);
                } catch {
                    result[key] = "[Unserializable]";
                }
            }

            return result;
        }

        return value;
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