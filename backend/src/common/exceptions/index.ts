import { HttpException, HttpStatus } from '@nestjs/common';

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, identifier: string | number) {
    super(
      `${resource} with identifier "${identifier}" not found`,
      HttpStatus.NOT_FOUND,
    );
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Forbidden') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class ValidationException extends HttpException {
  constructor(message: string, errors?: any[]) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ConflictException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}
