import { applyDecorators, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Reflector } from '@nestjs/core';
import { USER_TYPE } from '@/user/entity/user.entity';
import { JwtAuthGuard } from '@/common/security/jwt-auth.guard';

interface HttpMethodOption {
  path: string;
  description: string;
  auth?: USER_TYPE[];
}

export function RestApiController(prefix: string, apiTags: string): ClassDecorator {
  return applyDecorators(Controller(prefix), ApiTags(apiTags));
}

export function RestApiGet<T extends new (...args: any[]) => any>(response: T, { path, description, auth }: HttpMethodOption): MethodDecorator {
  const decorators = [
    Get(path),
    ApiOperation({ summary: description }),
    ApiOkResponse({
      type: response,
    }),
  ];

  if (auth) {
    decorators.push(UseGuards(JwtAuthGuard), ApiBearerAuth());
  }

  return applyDecorators(...decorators);
}

export function RestApiPost<T extends new (...args: any[]) => any>(response: T, { path, description, auth }: HttpMethodOption): MethodDecorator {
  const decorators = [
    Post(path),
    ApiOperation({ summary: description }),
    ApiOkResponse({
      type: response,
    }),
  ];

  if (auth) {
    decorators.push(UseGuards(JwtAuthGuard), ApiBearerAuth());
  }

  return applyDecorators(...decorators);
}

export const Auths = Reflector.createDecorator<string[]>();
