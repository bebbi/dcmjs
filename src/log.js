import loglevel from "loglevel";

let root = loglevel;
let _log = null;
let _validationLog = null;

function getLog() {
    if (!_log) {
        _log = root.getLogger("dcmjs");
        _log.setLevel(process.env.LOG_LEVEL || "warn");
    }
    return _log;
}

function getValidationLog() {
    if (!_validationLog) {
        _validationLog = root.getLogger("validation.dcmjs");
    }
    return _validationLog;
}

// Proxies that delegate to the current logger, so callers can do
// log.warn(...) without caring whether the root has been swapped.
const log = new Proxy(
    {},
    {
        get(_, prop) {
            return getLog()[prop];
        }
    }
);

const validationLog = new Proxy(
    {},
    {
        get(_, prop) {
            return getValidationLog()[prop];
        }
    }
);

/**
 * Replace the root loglevel instance used by dcmjs.
 * Call this before any dcmjs parsing to share a single loglevel
 * instance across libraries.
 *
 * @param {import("loglevel").RootLogger} rootLogger - a loglevel root instance
 */
function setRootLogger(rootLogger) {
    if (typeof rootLogger?.getLogger !== "function") {
        throw new TypeError("setRootLogger expects a loglevel root instance");
    }
    root = rootLogger;
    _log = null;
    _validationLog = null;
}

export { log, validationLog, loglevel, setRootLogger };
export default log;
