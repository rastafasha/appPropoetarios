import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../models/user';
@Pipe({ name: 'userRolePipe', standalone: true })
export class UserRolePipe implements PipeTransform {
    transform(users: User[] | null): User[] {
        if (!users) return []; return users.filter(user => user.role === 'USER_ROLE');
    }
}
