import {
    setRootLogger,
    getLog,
    getValidationLog,
    log,
    validationLog
} from "../src/log.js";

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

    it("redirects getLog() calls to the new root's loggers", () => {
        const { root, loggers } = createMockRoot();

        setRootLogger(root);

        getLog().warn("test message");

        expect(root.getLogger).toHaveBeenCalledWith("dcmjs");
        expect(loggers["dcmjs"].warn).toHaveBeenCalledWith("test message");
    });

    it("redirects getValidationLog() calls to the new root's loggers", () => {
        const { root, loggers } = createMockRoot();

        setRootLogger(root);

        getValidationLog().error("validation issue");

        expect(root.getLogger).toHaveBeenCalledWith("validation.dcmjs");
        expect(loggers["validation.dcmjs"].error).toHaveBeenCalledWith(
            "validation issue"
        );
    });

    it("switches to a second root after the first swap", () => {
        const first = createMockRoot();
        const second = createMockRoot();

        setRootLogger(first.root);
        getLog().warn("to first");
        expect(first.loggers["dcmjs"].warn).toHaveBeenCalledWith("to first");

        setRootLogger(second.root);
        getLog().warn("to second");
        expect(second.loggers["dcmjs"].warn).toHaveBeenCalledWith("to second");

        // First root should not have received the second message
        expect(first.loggers["dcmjs"].warn).toHaveBeenCalledTimes(1);
    });

    it("deprecated log export still works but warns", () => {
        const warnSpy = jest.spyOn(console, "warn").mockImplementation();
        const { root, loggers } = createMockRoot();

        setRootLogger(root);

        log.warn("via deprecated export");

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining("dcmjs.log is deprecated")
        );
        expect(loggers["dcmjs"].warn).toHaveBeenCalledWith(
            "via deprecated export"
        );

        warnSpy.mockRestore();
    });

    it("deprecated validationLog export still works but warns", () => {
        const warnSpy = jest.spyOn(console, "warn").mockImplementation();
        const { root, loggers } = createMockRoot();

        setRootLogger(root);

        validationLog.error("via deprecated export");

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining("dcmjs.validationLog is deprecated")
        );
        expect(loggers["validation.dcmjs"].error).toHaveBeenCalledWith(
            "via deprecated export"
        );

        warnSpy.mockRestore();
    });

    afterAll(() => {
        // Restore the original loglevel root so other test suites are unaffected
        const loglevel = require("loglevel");
        setRootLogger(loglevel);
    });
});
