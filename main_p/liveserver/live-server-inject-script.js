//jai sri ram
import liveServer from "live-server";

/**
 * Starts live-server and injects a custom script snippet into every HTML page.
 * @param {Object} options - The standard live-server configuration options object.
 * @param {string} scriptContent - The raw HTML script tag string you want to inject.
 */
export function startWithInjection(options = {}, scriptContent = "") {
    // Ensure a middleware array exists in options
    options.middleware = options.middleware || [];

    // Add our injection logic to the live-server middleware pipeline
    options.middleware.push(function (req, res, next) {
        const oldWrite = res.write;
        const oldEnd = res.end;
        let chunks = [];

        // Intercept outgoing data chunks
        res.write = function (chunk) {
            chunks.push(Buffer.from(chunk));
        };

        // Process data when the response finishes
        res.end = function (chunk) {
            if (chunk) chunks.push(Buffer.from(chunk));
            let body = Buffer.concat(chunks).toString("utf8");

            // Look specifically for text/html pages containing a closing body tag
            const isHtml = res.getHeader("Content-Type")?.includes("text/html");
            if (isHtml && body.includes("</body>")) {
                // Slip the custom script right before the closing body tag
                body = body.replace("</body>", `${scriptContent}\n</body>`);
                res.setHeader("Content-Length", Buffer.byteLength(body));
            }

            oldEnd.call(this, body);
        };

        next();
    });

    // Fire up the live-server with the modified options
    liveServer.start(options);
}
