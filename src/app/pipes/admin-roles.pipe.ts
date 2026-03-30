import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../models/user';

@Pipe({ name: 'adminRolesPipe', standalone: true })

export class AdminRolesPipe implements PipeTransform {
        transform(users: User[] | null): User[] {
            if (!users) return [];
            return users.filter(user => user.role === 'SUPERADMIN_ROLE' || user.role === 'ADMIN_ROLE');
        }
}
