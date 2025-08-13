// Unit tests for UserService - TDD approach
import { UserService } from '../../src/services/userService';
import { User } from '../../src/types';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('User Creation', () => {
    const validUserData = {
      email: 'alex@sevenoaks-kent.co.uk',
      name: 'Alex Kent',
      settings: {
        defaultNavApp: 'waze',
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '07:00'
        }
      }
    };

    it('should create a new user successfully', async () => {
      const user = await userService.createUser(
        validUserData.email,
        validUserData.name,
        validUserData.settings
      );

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(validUserData.email);
      expect(user.name).toBe(validUserData.name);
      expect(user.settings).toEqual(validUserData.settings);
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should create user with default settings when not provided', async () => {
      const user = await userService.createUser('test@example.com', 'Test User');

      expect(user.settings.defaultNavApp).toBe('google_maps'); // default
      expect(user.settings.quietHours).toBeUndefined();
    });

    it('should not allow duplicate email addresses', async () => {
      await userService.createUser(validUserData.email, validUserData.name);

      await expect(
        userService.createUser(validUserData.email, 'Another User')
      ).rejects.toThrow('User with this email already exists');
    });

    it('should validate email format', async () => {
      await expect(
        userService.createUser('invalid-email', 'Test User')
      ).rejects.toThrow('Invalid email format');

      await expect(
        userService.createUser('test@', 'Test User')
      ).rejects.toThrow('Invalid email format');

      await expect(
        userService.createUser('@example.com', 'Test User')
      ).rejects.toThrow('Invalid email format');
    });

    it('should validate name requirements', async () => {
      await expect(
        userService.createUser('test@example.com', '')
      ).rejects.toThrow('Name is required');

      await expect(
        userService.createUser('test@example.com', '   ')
      ).rejects.toThrow('Name is required');
    });
  });

  describe('User Retrieval', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await userService.createUser(
        'test@example.com',
        'Test User',
        {
          defaultNavApp: 'apple_maps',
          quietHours: {
            enabled: false,
            start: '23:00',
            end: '06:00'
          }
        }
      );
    });

    it('should retrieve user by ID', async () => {
      const retrievedUser = await userService.getUserById(testUser.id);
      
      expect(retrievedUser).toEqual(testUser);
    });

    it('should return null for non-existent user ID', async () => {
      const user = await userService.getUserById('non-existent-id');
      
      expect(user).toBeNull();
    });

    it('should retrieve user by email', async () => {
      const retrievedUser = await userService.getUserByEmail(testUser.email);
      
      expect(retrievedUser).toEqual(testUser);
    });

    it('should return null for non-existent email', async () => {
      const user = await userService.getUserByEmail('nonexistent@example.com');
      
      expect(user).toBeNull();
    });

    it('should handle case-insensitive email lookup', async () => {
      const user = await userService.getUserByEmail('TEST@EXAMPLE.COM');
      
      expect(user).toEqual(testUser);
    });
  });

  describe('User Settings Management', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await userService.createUser(
        'settings@example.com',
        'Settings Test User',
        {
          defaultNavApp: 'google_maps'
        }
      );
    });

    it('should update user settings', async () => {
      const newSettings = {
        defaultNavApp: 'waze',
        quietHours: {
          enabled: true,
          start: '21:30',
          end: '07:30'
        }
      };

      const updatedUser = await userService.updateUserSettings(testUser.id, newSettings);
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser!.settings).toEqual(newSettings);
    });

    it('should partially update settings', async () => {
      const partialSettings = {
        defaultNavApp: 'apple_maps'
      };

      const updatedUser = await userService.updateUserSettings(testUser.id, partialSettings);
      
      expect(updatedUser!.settings.defaultNavApp).toBe('apple_maps');
      // Original quiet hours should be preserved
      expect(updatedUser!.settings.quietHours).toBeUndefined();
    });

    it('should return null when updating non-existent user', async () => {
      const result = await userService.updateUserSettings('non-existent', { defaultNavApp: 'waze' });
      
      expect(result).toBeNull();
    });

    it('should validate navigation app options', async () => {
      await expect(
        userService.updateUserSettings(testUser.id, { defaultNavApp: 'invalid_app' as any })
      ).rejects.toThrow('Invalid navigation app');
    });

    it('should validate quiet hours format', async () => {
      await expect(
        userService.updateUserSettings(testUser.id, {
          quietHours: {
            enabled: true,
            start: '25:00', // Invalid hour
            end: '07:00'
          }
        })
      ).rejects.toThrow('Invalid time format');

      await expect(
        userService.updateUserSettings(testUser.id, {
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '07:70' // Invalid minutes
          }
        })
      ).rejects.toThrow('Invalid time format');
    });
  });

  describe('User Profile Management', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await userService.createUser(
        'profile@example.com',
        'Profile Test User'
      );
    });

    it('should update user name', async () => {
      const newName = 'Updated Name';
      
      const updatedUser = await userService.updateUserProfile(testUser.id, { name: newName });
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser!.name).toBe(newName);
      expect(updatedUser!.email).toBe(testUser.email); // Email unchanged
    });

    it('should update user email', async () => {
      const newEmail = 'newemail@example.com';
      
      const updatedUser = await userService.updateUserProfile(testUser.id, { email: newEmail });
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser!.email).toBe(newEmail);
      expect(updatedUser!.name).toBe(testUser.name); // Name unchanged
    });

    it('should not allow updating to existing email', async () => {
      // Create another user
      await userService.createUser('existing@example.com', 'Existing User');
      
      await expect(
        userService.updateUserProfile(testUser.id, { email: 'existing@example.com' })
      ).rejects.toThrow('Email already in use');
    });

    it('should validate new email format', async () => {
      await expect(
        userService.updateUserProfile(testUser.id, { email: 'invalid-email' })
      ).rejects.toThrow('Invalid email format');
    });

    it('should validate new name', async () => {
      await expect(
        userService.updateUserProfile(testUser.id, { name: '' })
      ).rejects.toThrow('Name is required');
    });
  });

  describe('Demo User Creation', () => {
    it('should create demo users for Kent commuters', async () => {
      const demoUsers = await userService.createDemoUsers();
      
      expect(demoUsers.length).toBeGreaterThan(0);
      
      // Check Alex (Sevenoaks)
      const alex = demoUsers.find(u => u.name === 'Alex Kent');
      expect(alex).toBeDefined();
      expect(alex!.email).toContain('@');
      expect(alex!.settings.defaultNavApp).toBeDefined();
      
      // Check Chloe (Tunbridge Wells)
      const chloe = demoUsers.find(u => u.name === 'Chloe Wells');
      expect(chloe).toBeDefined();
      expect(chloe!.settings.quietHours?.enabled).toBeDefined();
    });

    it('should create demo users with unique emails', async () => {
      const demoUsers = await userService.createDemoUsers();
      
      const emails = demoUsers.map(u => u.email);
      const uniqueEmails = [...new Set(emails)];
      
      expect(emails.length).toBe(uniqueEmails.length);
    });

    it('should not create duplicate demo users on multiple calls', async () => {
      const firstCall = await userService.createDemoUsers();
      const secondCall = await userService.createDemoUsers();
      
      // Second call should return existing users, not create new ones
      expect(firstCall.length).toBe(secondCall.length);
      expect(firstCall.map(u => u.id).sort()).toEqual(secondCall.map(u => u.id).sort());
    });
  });

  describe('User Statistics', () => {
    beforeEach(async () => {
      // Create several test users
      await userService.createUser('user1@example.com', 'User One');
      await userService.createUser('user2@example.com', 'User Two');
      await userService.createUser('user3@example.com', 'User Three');
    });

    it('should get total user count', async () => {
      const totalUsers = await userService.getTotalUserCount();
      
      expect(totalUsers).toBe(3);
    });

    it('should get all users', async () => {
      const allUsers = await userService.getAllUsers();
      
      expect(allUsers.length).toBe(3);
      expect(allUsers.every(u => u.id && u.email && u.name)).toBe(true);
    });

    it('should get users with pagination', async () => {
      const page1 = await userService.getUsers(0, 2); // First 2 users
      const page2 = await userService.getUsers(2, 2); // Next 2 users
      
      expect(page1.length).toBe(2);
      expect(page2.length).toBe(1);
      
      // No overlap in users
      const page1Ids = page1.map(u => u.id);
      const page2Ids = page2.map(u => u.id);
      expect(page1Ids.some(id => page2Ids.includes(id))).toBe(false);
    });
  });

  describe('User Deletion', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await userService.createUser('delete@example.com', 'Delete Test User');
    });

    it('should soft delete user', async () => {
      const result = await userService.deleteUser(testUser.id);
      
      expect(result).toBe(true);
      
      // User should no longer be retrievable
      const deletedUser = await userService.getUserById(testUser.id);
      expect(deletedUser).toBeNull();
    });

    it('should return false for non-existent user deletion', async () => {
      const result = await userService.deleteUser('non-existent-id');
      
      expect(result).toBe(false);
    });

    it('should not allow creating user with same email as soft-deleted user', async () => {
      await userService.deleteUser(testUser.id);
      
      await expect(
        userService.createUser(testUser.email, 'New User')
      ).rejects.toThrow('Email address was previously used');
    });
  });

  describe('Validation', () => {
    describe('Email validation', () => {
      it('should validate correct email formats', () => {
        expect(userService.validateEmail('test@example.com')).toBe(true);
        expect(userService.validateEmail('user.name+tag@domain.co.uk')).toBe(true);
        expect(userService.validateEmail('alex@sevenoaks-kent.co.uk')).toBe(true);
      });

      it('should reject invalid email formats', () => {
        expect(userService.validateEmail('invalid')).toBe(false);
        expect(userService.validateEmail('test@')).toBe(false);
        expect(userService.validateEmail('@example.com')).toBe(false);
        expect(userService.validateEmail('test..test@example.com')).toBe(false);
        expect(userService.validateEmail('')).toBe(false);
      });
    });

    describe('Time validation', () => {
      it('should validate correct time formats', () => {
        expect(userService.validateTimeFormat('00:00')).toBe(true);
        expect(userService.validateTimeFormat('23:59')).toBe(true);
        expect(userService.validateTimeFormat('12:30')).toBe(true);
      });

      it('should reject invalid time formats', () => {
        expect(userService.validateTimeFormat('24:00')).toBe(false);
        expect(userService.validateTimeFormat('12:60')).toBe(false);
        expect(userService.validateTimeFormat('1:30')).toBe(false);
        expect(userService.validateTimeFormat('12:3')).toBe(false);
        expect(userService.validateTimeFormat('')).toBe(false);
        expect(userService.validateTimeFormat('invalid')).toBe(false);
      });
    });

    describe('Navigation app validation', () => {
      it('should validate supported navigation apps', () => {
        expect(userService.validateNavApp('google_maps')).toBe(true);
        expect(userService.validateNavApp('apple_maps')).toBe(true);
        expect(userService.validateNavApp('waze')).toBe(true);
      });

      it('should reject unsupported navigation apps', () => {
        expect(userService.validateNavApp('invalid_app')).toBe(false);
        expect(userService.validateNavApp('')).toBe(false);
        expect(userService.validateNavApp('GPS')).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid user data gracefully', async () => {
      await expect(
        userService.createUser(null as any, 'Test User')
      ).rejects.toThrow('Email is required');
      
      await expect(
        userService.createUser('test@example.com', null as any)
      ).rejects.toThrow('Name is required');
    });

    it('should handle concurrent user creation with same email', async () => {
      const email = 'concurrent@example.com';
      
      // Simulate concurrent requests
      const promises = [
        userService.createUser(email, 'User 1'),
        userService.createUser(email, 'User 2')
      ];
      
      const results = await Promise.allSettled(promises);
      
      // One should succeed, one should fail
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      expect(successful).toBe(1);
      expect(failed).toBe(1);
    });
  });
});