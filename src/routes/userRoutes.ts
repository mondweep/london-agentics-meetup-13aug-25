// API routes for user management
import { Router, Request, Response } from 'express';
import { UserService } from '../services/userService';
import { ApiResponse, User } from '../types';

const router = Router();
const userService = new UserService();

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<User> = {
      success: true,
      data: user
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching user:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch user'
    };
    res.status(500).json(response);
  }
});

// POST /api/users - Create new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, name, settings } = req.body;
    
    if (!email || !name) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Email and name are required'
      };
      return res.status(400).json(response);
    }

    const user = await userService.createUser(email, name, settings);

    const response: ApiResponse<User> = {
      success: true,
      data: user,
      message: 'User created successfully'
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating user:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to create user'
    };
    res.status(500).json(response);
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedUser = await userService.updateUser(id, updates);
    
    if (!updatedUser) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<User> = {
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating user:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to update user'
    };
    res.status(500).json(response);
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await userService.deleteUser(id);
    
    if (!success) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<null> = {
      success: true,
      message: 'User deleted successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error deleting user:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to delete user'
    };
    res.status(500).json(response);
  }
});

// GET /api/users/:id/settings - Get user settings
router.get('/:id/settings', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: user.settings
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch user settings'
    };
    res.status(500).json(response);
  }
});

// PUT /api/users/:id/settings - Update user settings
router.put('/:id/settings', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const settings = req.body;

    const updatedUser = await userService.updateUserSettings(id, settings);
    
    if (!updatedUser) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: updatedUser.settings,
      message: 'User settings updated successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating user settings:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to update user settings'
    };
    res.status(500).json(response);
  }
});

// GET /api/users - Get all users (admin endpoint)
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();

    const response: ApiResponse<User[]> = {
      success: true,
      data: users
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch users'
    };
    res.status(500).json(response);
  }
});

export default router;