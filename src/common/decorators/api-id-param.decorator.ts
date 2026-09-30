import { applyDecorators } from "@nestjs/common";
import { ApiParam } from "@nestjs/swagger";

export function ApiIdParam(description: string): MethodDecorator {
  return applyDecorators(
    ApiParam({ name: 'id', type: Number, example: 1, description }),
  );
}