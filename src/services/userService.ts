// UserService - Manages user accounts and preferences
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types';

export class UserService {
  private users: Map<string, User> = new Map(); // id -> user
  private emailIndex: Map<string, string> = new Map(); // email -> id
  private deletedEmails: Set<string> = new Set(); // Track soft-deleted emails

  constructor() {
    // Initialize with empty maps
  }

  /**
   * Creates a new user
   */
  async createUser(
    email: string,
    name: string,
    settings?: Partial<User['settings']>
  ): Promise<User> {
    // Validate inputs
    this.validateEmail(email, true);
    this.validateName(name, true);

    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing email
    if (this.emailIndex.has(normalizedEmail)) {
      throw new Error('User with this email already exists');
    }

    // Check for previously deleted email
    if (this.deletedEmails.has(normalizedEmail)) {
      throw new Error('Email address was previously used');
    }

    const user: User = {
      id: uuidv4(),
      email: normalizedEmail,
      name: name.trim(),
      createdAt: new Date(),
      settings: {
        defaultNavApp: settings?.defaultNavApp || 'google_maps',
        quietHours: settings?.quietHours
      }
    };

    // Validate settings if provided
    if (settings) {
      this.validateSettings(settings);
    }

    this.users.set(user.id, user);
    this.emailIndex.set(normalizedEmail, user.id);

    return user;
  }

  /**
   * Gets user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  /**
   * Gets user by email (case-insensitive)
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const userId = this.emailIndex.get(normalizedEmail);
    return userId ? this.users.get(userId) || null : null;
  }

  /**
   * Updates user settings
   */
  async updateUserSettings(
    userId: string,
    settings: Partial<User['settings']>
  ): Promise<User | null> {
    const user = this.users.get(userId);
    if (!user) return null;

    // Validate settings
    this.validateSettings(settings);

    // Update settings (merge with existing)
    user.settings = {
      ...user.settings,
      ...settings
    };

    return user;
  }

  /**
   * Updates user profile (name and/or email)
   */
  async updateUserProfile(
    userId: string,
    updates: { name?: string; email?: string }
  ): Promise<User | null> {
    const user = this.users.get(userId);
    if (!user) return null;

    // Validate updates
    if (updates.name !== undefined) {
      this.validateName(updates.name, true);
    }

    if (updates.email !== undefined) {
      const normalizedEmail = updates.email.toLowerCase().trim();
      this.validateEmail(normalizedEmail, true);

      // Check if email is already in use (by another user)
      const existingUserId = this.emailIndex.get(normalizedEmail);
      if (existingUserId && existingUserId !== userId) {
        throw new Error('Email already in use');
      }
    }

    // Update user
    if (updates.name !== undefined) {
      user.name = updates.name.trim();
    }

    if (updates.email !== undefined) {
      const normalizedEmail = updates.email.toLowerCase().trim();
      
      // Update email index
      this.emailIndex.delete(user.email);
      this.emailIndex.set(normalizedEmail, userId);
      
      user.email = normalizedEmail;
    }

    return user;
  }

  /**
   * Soft deletes a user
   */
  async deleteUser(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;

    // Add email to deleted list
    this.deletedEmails.add(user.email);

    // Remove from maps
    this.users.delete(userId);
    this.emailIndex.delete(user.email);

    return true;
  }

  /**
   * Creates demo users with Kent-specific data
   */
  async createDemoUsers(): Promise<User[]> {
    const demoUserData = [
      {
        email: 'alex.kent@sevenoaks-demo.co.uk',
        name: 'Alex Kent',
        settings: {
          defaultNavApp: 'waze' as const,
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
          defaultNavApp: 'apple_maps' as const,
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
          defaultNavApp: 'google_maps' as const,
          quietHours: {
            enabled: true,
            start: '21:30',
            end: '07:30'
          }
        }
      }
    ];

    const demoUsers: User[] = [];

    for (const userData of demoUserData) {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        demoUsers.push(existingUser);
      } else {
        try {
          const user = await this.createUser(
            userData.email,
            userData.name,
            userData.settings
          );
          demoUsers.push(user);
        } catch (error) {
          // If creation fails (e.g., email exists), try to get existing user
          const user = await this.getUserByEmail(userData.email);
          if (user) {
            demoUsers.push(user);
          }
        }
      }
    }

    return demoUsers;
  }

  /**
   * Gets total user count
   */
  async getTotalUserCount(): Promise<number> {
    return this.users.size;
  }

  /**
   * Gets all users
   */
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  /**
   * Gets users with pagination
   */
  async getUsers(offset: number = 0, limit: number = 10): Promise<User[]> {
    const allUsers = Array.from(this.users.values());
    return allUsers.slice(offset, offset + limit);
  }

  /**
   * Validation methods
   */
  validateEmail(email: string, throwError: boolean = false): boolean {
    if (!email || typeof email !== 'string') {
      if (throwError) throw new Error('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email.trim());

    if (!isValid && throwError) {
      throw new Error('Invalid email format');
    }

    return isValid;
  }

  validateTimeFormat(time: string): boolean {
    if (!time || typeof time !== 'string') return false;
    
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  validateNavApp(app: string): boolean {
    const validApps = ['google_maps', 'apple_maps', 'waze'];
    return validApps.includes(app);
  }

  /**
   * Private validation methods
   */
  private validateName(name: string, throwError: boolean = false): boolean {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      if (throwError) throw new Error('Name is required');
      return false;
    }
    return true;
  }

  private validateSettings(settings: Partial<User['settings']>): void {
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