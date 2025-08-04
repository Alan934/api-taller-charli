import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ApiPaginationResponse = (entity: any) => {
  return applyDecorators(
    ApiOkResponse({
      description: 'Successful request',
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Datos obtenidos exitosamente' },
          data: {
            type: 'object',
            properties: {
              users: {
                type: 'array',
                items: { $ref: getSchemaPath(entity) }
              },
              total: { type: 'number', example: 150 },
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 },
              totalPages: { type: 'number', example: 15 }
            }
          }
        }
      }
    })
  );
};
