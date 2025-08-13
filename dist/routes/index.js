"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tripRoutes_1 = __importDefault(require("./tripRoutes"));
const demoRoutes_1 = __importDefault(require("./demoRoutes"));
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Router is working',
        availableRoutes: [
            '/trips',
            '/demo'
        ]
    });
});
router.use('/trips', tripRoutes_1.default);
router.use('/demo', demoRoutes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map