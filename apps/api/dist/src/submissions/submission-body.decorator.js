"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionBody = void 0;
const common_1 = require("@nestjs/common");
exports.SubmissionBody = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const body = request.body;
    if (body.answers) {
        try {
            return { ...body, answers: JSON.parse(body.answers) };
        }
        catch (e) {
            return body;
        }
    }
    return body;
});
//# sourceMappingURL=submission-body.decorator.js.map