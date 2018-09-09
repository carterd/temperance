"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
class TestConfig {
}
TestConfig.logger = new winston.Logger({
    transports: [new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })],
    exitOnError: false,
});
exports.default = TestConfig;
//# sourceMappingURL=TestConfig.js.map