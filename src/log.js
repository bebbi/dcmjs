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

// Deprecated proxies — kept for backwards compatibility.
// Use getLog(), getValidationLog(), or setRootLogger() instead.
let _logDeprecationWarned = false;
const log = new Proxy(
    {},
    {
        get(_, prop) {
            if (!_logDeprecationWarned) {
                console.warn(
                    "dcmjs.log is deprecated. Use dcmjs.loglevel.getLogger('dcmjs') or dcmjs.setRootLogger() instead."
                );
                _logDeprecationWarned = true;
            }
            return getLog()[prop];
        }
    }
);

let _validationLogDeprecationWarned = false;
const validationLog = new Proxy(
    {},
    {
        get(_, prop) {
            if (!_validationLogDeprecationWarned) {
                console.warn(
                    "dcmjs.validationLog is deprecated. Use dcmjs.loglevel.getLogger('validation.dcmjs') or dcmjs.setRootLogger() instead."
                );
                _validationLogDeprecationWarned = true;
            }
            return getValidationLog()[prop];
        }
    }
);

export { getLog, getValidationLog, loglevel, setRootLogger };

// Deprecated exports — will be removed in a future version.
export { log, validationLog };
export default log;
