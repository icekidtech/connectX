import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

export interface HasOwnerId {
  ownerId?: string;
  userId?: string;
  creatorId?: string;
  senderId?: string;
  id?: string;
}

@Injectable()
export class IsOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get the resource from params
    const { id } = request.params;
    const resource: HasOwnerId = request.resourceData; // Should be set by controller

    if (!resource) {
      throw new ForbiddenException(
        'Resource not found or not set in request',
      );
    }

    const ownerId =
      resource.ownerId ||
      resource.userId ||
      resource.creatorId ||
      resource.senderId ||
      resource.id;

    if (ownerId !== user.id && ownerId !== user.sub) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}
