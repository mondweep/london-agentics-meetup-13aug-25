import { User } from '../types';
export declare class UserService {
    private users;
    private emailIndex;
    private deletedEmails;
    constructor();
    createUser(email: string, name: string, settings?: Partial<User['settings']>): Promise<User>;
    getUserById(id: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
    updateUserSettings(userId: string, settings: Partial<User['settings']>): Promise<User | null>;
    updateUserProfile(userId: string, updates: {
        name?: string;
        email?: string;
    }): Promise<User | null>;
    updateUser(userId: string, updates: Partial<User>): Promise<User | null>;
    deleteUser(userId: string): Promise<boolean>;
    createDemoUsers(): Promise<User[]>;
    getTotalUserCount(): Promise<number>;
    getAllUsers(): Promise<User[]>;
    getUsers(offset?: number, limit?: number): Promise<User[]>;
    validateEmail(email: string, throwError?: boolean): boolean;
    validateTimeFormat(time: string): boolean;
    validateNavApp(app: string): boolean;
    private validateName;
    private validateSettings;
}
//# sourceMappingURL=userService.d.ts.map