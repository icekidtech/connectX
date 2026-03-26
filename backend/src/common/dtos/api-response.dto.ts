import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    description: 'Success message',
  })
  message: string;

  @ApiProperty({
    description: 'Response data',
  })
  data?: T;

  constructor(statusCode: number, message: string, data?: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

export class ApiErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
  })
  message: string;

  @ApiProperty({
    description: 'Detailed error information',
    isArray: true,
    required: false,
  })
  errors?: any[];

  constructor(statusCode: number, message: string, errors?: any[]) {
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
  }
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items',
    isArray: true,
  })
  items: T[];

  @ApiProperty({
    description: 'Total number of items',
  })
  total: number;

  @ApiProperty({
    description: 'Current page limit',
  })
  limit: number;

  @ApiProperty({
    description: 'Current offset',
  })
  offset: number;

  @ApiProperty({
    description: 'Total number of pages',
  })
  totalPages: number;

  constructor(items: T[], total: number, limit: number, offset: number) {
    this.items = items;
    this.total = total;
    this.limit = limit;
    this.offset = offset;
    this.totalPages = Math.ceil(total / limit);
  }
}
