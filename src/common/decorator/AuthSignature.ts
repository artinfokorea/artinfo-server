import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthSignature = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
