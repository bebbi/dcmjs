import { setRootLogger, log, validationLog } from "../src/log.js";

// Creates a mock loglevel root with its own logger registry
function createMockRoot() {
    const loggers = {};
    const root = {
        getLogger: jest.fn(name => {
            if (!loggers[name]) {
                loggers[name] = {
                    name,
                    trace: jest.fn(),
                    debug: jest.fn(),
                    info: jest.fn(),
                    warn: jest.fn(),
                    error: jest.fn(),
                    setLevel: jest.fn()
                };
            }
            return loggers[name];
        })
    };
    return { root, loggers };
}

describe("setRootLogger", () => {
    it("rejects a non-loglevel argument", () => {
        expect(() => setRootLogger(null)).toThrow(TypeError);
        expect(() => setRootLogger({})).toThrow(TypeError);
        expect(() => setRootLogger({ getLogger: "not a function" })).toThrow(
            TypeError
        );
    });

    it("redirects log calls to the new root's loggers", () => {
        const { root, loggers } = createMockRoot();

        setRootLogger(root);

        // Trigger a log call — this should resolve through the proxy
        // to the new root's "dcmjs" logger
        log.warn("test message");

        expect(root.getLogger).toHaveBeenCalledWith("dcmjs");
        expect(loggers["dcmjs"].warn).toHaveBeenCalledWith("test message");
    });

    it("redirects validationLog calls to the new root's loggers", () => {
        const { root, loggers } = createMockRoot();

        setRootLogger(root);

        validationLog.error("validation issue");

        expect(root.getLogger).toHaveBeenCalledWith("validation.dcmjs");
        expect(loggers["validation.dcmjs"].error).toHaveBeenCalledWith(
            "validation issue"
        );
    });

    it("switches to a second root after the first swap", () => {
        const first = createMockRoot();
        const second = createMockRoot();

        setRootLogger(first.root);
        log.warn("to first");
        expect(first.loggers["dcmjs"].warn).toHaveBeenCalledWith("to first");

        setRootLogger(second.root);
        log.warn("to second");
        expect(second.loggers["dcmjs"].warn).toHaveBeenCalledWith("to second");

        // First root should not have received the second message
        expect(first.loggers["dcmjs"].warn).toHaveBeenCalledTimes(1);
    });

    afterAll(() => {
        // Restore the original loglevel root so other test suites are unaffected
        const loglevel = require("loglevel");
        setRootLogger(loglevel);
    });
});
