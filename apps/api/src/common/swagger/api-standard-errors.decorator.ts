import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorResponseSchema } from './error-response.schema';

const DESCRIPTIONS: Partial<Record<number, string>> = {
  400: 'Validation error, malformed input, or unknown property (BR-23)',
  401: 'Missing or invalid access token (BR-19)',
  403: 'Valid token without the ADMIN role (BR-19)',
  404: 'Resource not found or soft-deleted (BR-5, BR-6)',
  409: 'Duplicate unit number within the project (BR-3)',
  422: 'Referenced project does not exist (BR-2)',
  429: 'Rate limit exceeded (BR-19)',
  503: 'Process or database unhealthy',
};

/** Documents the standard API error envelope (section 7.1) for the given status codes. */
export function ApiStandardErrors(...statusCodes: number[]) {
  return applyDecorators(
    ...statusCodes.map((status) =>
      ApiResponse({
        status,
        description: DESCRIPTIONS[status] ?? 'Error',
        type: ErrorResponseSchema,
      }),
    ),
  );
}
