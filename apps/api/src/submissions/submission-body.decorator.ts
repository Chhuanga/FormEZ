import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SubmissionBody = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();
    const body: { answers: string } = request.body;
    if (body.answers) {
      try {
        return { ...body, answers: JSON.parse(body.answers) };
      } catch (e) {
        return body;
      }
    }
    return body;
  },
);
