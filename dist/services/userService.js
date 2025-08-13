"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const uuid_1 = require("uuid");
class UserService {
    constructor() {
        this.users = new Map();
        this.emailIndex = new Map();
        this.deletedEmails = new Set();
    }
    async createUser(email, name, settings) {
        this.validateEmail(email, true);
        this.validateName(name, true);
        const normalizedEmail = email.toLowerCase().trim();
        if (this.emailIndex.has(normalizedEmail)) {
            throw new Error('User with this email already exists');
        }
        if (this.deletedEmails.has(normalizedEmail)) {
            throw new Error('Email address was previously used');
        }
        const user = {
            id: (0, uuid_1.v4)(),
            email: normalizedEmail,
            name: name.trim(),
            createdAt: new Date(),
            settings: {
                defaultNavApp: settings?.defaultNavApp || 'google_maps',
                quietHours: settings?.quietHours
            }
        };
        if (settings) {
            this.validateSettings(settings);
        }
        this.users.set(user.id, user);
        this.emailIndex.set(normalizedEmail, user.id);
        return user;
    }
    async getUserById(id) {
        return this.users.get(id) || null;
    }
    async getUserByEmail(email) {
        const normalizedEmail = email.toLowerCase().trim();
        const userId = this.emailIndex.get(normalizedEmail);
        return userId ? this.users.get(userId) || null : null;
    }
    async updateUserSettings(userId, settings) {
        const user = this.users.get(userId);
        if (!user)
            return null;
        this.validateSettings(settings);
        user.settings = {
            ...user.settings,
            ...settings
        };
        return user;
    }
    async updateUserProfile(userId, updates) {
        const user = this.users.get(userId);
        if (!user)
            return null;
        if (updates.name !== undefined) {
            this.validateName(updates.name, true);
        }
        if (updates.email !== undefined) {
            const normalizedEmail = updates.email.toLowerCase().trim();
            this.validateEmail(normalizedEmail, true);
            const existingUserId = this.emailIndex.get(normalizedEmail);
            if (existingUserId && existingUserId !== userId) {
                throw new Error('Email already in use');
            }
        }
        if (updates.name !== undefined) {
            user.name = updates.name.trim();
        }
        if (updates.email !== undefined) {
            const normalizedEmail = updates.email.toLowerCase().trim();
            this.emailIndex.delete(user.email);
            this.emailIndex.set(normalizedEmail, userId);
            user.email = normalizedEmail;
        }
        return user;
    }
    async updateUser(userId, updates) {
        const user = this.users.get(userId);
        if (!user)
            return null;
        if (updates.name !== undefined) {
            this.validateName(updates.name, true);
            user.name = updates.name;
        }
        if (updates.email !== undefined) {
            const normalizedEmail = updates.email.toLowerCase().trim();
            this.validateEmail(normalizedEmail, true);
            if (this.emailIndex.has(normalizedEmail) && this.emailIndex.get(normalizedEmail) !== userId) {
                throw new Error('User with this email already exists');
            }
            this.emailIndex.delete(user.email);
            this.emailIndex.set(normalizedEmail, userId);
            user.email = normalizedEmail;
        }
        if (updates.settings !== undefined) {
            this.validateSettings(updates.settings);
            user.settings = {
                ...user.settings,
                ...updates.settings
            };
        }
        return user;
    }
    async deleteUser(userId) {
        const user = this.users.get(userId);
        if (!user)
            return false;
        this.deletedEmails.add(user.email);
        this.users.delete(userId);
        this.emailIndex.delete(user.email);
        return true;
    }
    async createDemoUsers() {
        const demoUserData = [
            {
                email: 'alex.kent@sevenoaks-demo.co.uk',
                name: 'Alex Kent',
                settings: {
                    defaultNavApp: 'waze',
                    quietHours: {
                        enabled: true,
                        start: '22:00',
                        end: '07:00'
                    }
                }
            },
            {
                email: 'chloe.wells@tunbridge-demo.co.uk',
                name: 'Chloe Wells',
                settings: {
                    defaultNavApp: 'apple_maps',
                    quietHours: {
                        enabled: false,
                        start: '23:00',
                        end: '06:00'
                    }
                }
            },
            {
                email: 'james.maidstone@kent-demo.co.uk',
                name: 'James Maidstone',
                settings: {
                    defaultNavApp: 'google_maps',
                    quietHours: {
                        enabled: true,
                        start: '21:30',
                        end: '07:30'
                    }
                }
            }
        ];
        const demoUsers = [];
        for (const userData of demoUserData) {
            const existingUser = await this.getUserByEmail(userData.email);
            if (existingUser) {
                demoUsers.push(existingUser);
            }
            else {
                try {
                    const user = await this.createUser(userData.email, userData.name, userData.settings);
                    demoUsers.push(user);
                }
                catch (error) {
                    const user = await this.getUserByEmail(userData.email);
                    if (user) {
                        demoUsers.push(user);
                    }
                }
            }
        }
        return demoUsers;
    }
    async getTotalUserCount() {
        return this.users.size;
    }
    async getAllUsers() {
        return Array.from(this.users.values());
    }
    async getUsers(offset = 0, limit = 10) {
        const allUsers = Array.from(this.users.values());
        return allUsers.slice(offset, offset + limit);
    }
    validateEmail(email, throwError = false) {
        if (!email || typeof email !== 'string') {
            if (throwError)
                throw new Error('Email is required');
            return false;
        }
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        const trimmedEmail = email.trim();
        if (trimmedEmail.includes('..') || trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
            if (throwError)
                throw new Error('Invalid email format');
            return false;
        }
        const isValid = emailRegex.test(trimmedEmail);
        if (!isValid && throwError) {
            throw new Error('Invalid email format');
        }
        return isValid;
    }
    validateTimeFormat(time) {
        if (!time || typeof time !== 'string')
            return false;
        const timeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }
    validateNavApp(app) {
        const validApps = ['google_maps', 'apple_maps', 'waze'];
        return validApps.includes(app);
    }
    validateName(name, throwError = false) {
        if (!name || typeof name !== 'string' || name.trim() === '') {
            if (throwError)
                throw new Error('Name is required');
            return false;
        }
        return true;
    }
    validateSettings(settings) {
        if (settings.defaultNavApp && !this.validateNavApp(settings.defaultNavApp)) {
            throw new Error('Invalid navigation app');
        }
        if (settings.quietHours) {
            const { start, end } = settings.quietHours;
            if (start && !this.validateTimeFormat(start)) {
                throw new Error('Invalid time format for quiet hours start');
            }
            if (end && !this.validateTimeFormat(end)) {
                throw new Error('Invalid time format for quiet hours end');
            }
            if (start && end && !this.validateTimeFormat(start)) {
                throw new Error('Invalid time format');
            }
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=userService.js.map