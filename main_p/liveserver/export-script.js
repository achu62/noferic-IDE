//jai sri ram
export const myCustomScript = `
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
        "Noferic error logging system is  initiated \n Happy Debugging!"
    );
})();
</script>
`;