"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userService_1 = require("../services/userService");
const router = (0, express_1.Router)();
const userService = new userService_1.UserService();
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        if (!user) {
            const response = {
                success: false,
                error: 'User not found'
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            data: user
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        const response = {
            success: false,
            error: 'Failed to fetch user'
        };
        res.status(500).json(response);
    }
});
router.post('/', async (req, res) => {
    try {
        const { email, name, settings } = req.body;
        if (!email || !name) {
            const response = {
                success: false,
                error: 'Email and name are required'
            };
            return res.status(400).json(response);
        }
        const user = await userService.createUser(email, name, settings);
        const response = {
            success: true,
            data: user,
            message: 'User created successfully'
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating user:', error);
        const response = {
            success: false,
            error: 'Failed to create user'
        };
        res.status(500).json(response);
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedUser = await userService.updateUser(id, updates);
        if (!updatedUser) {
            const response = {
                success: false,
                error: 'User not found'
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            data: updatedUser,
            message: 'User updated successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error updating user:', error);
        const response = {
            success: false,
            error: 'Failed to update user'
        };
        res.status(500).json(response);
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const success = await userService.deleteUser(id);
        if (!success) {
            const response = {
                success: false,
                error: 'User not found'
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            message: 'User deleted successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error deleting user:', error);
        const response = {
            success: false,
            error: 'Failed to delete user'
        };
        res.status(500).json(response);
    }
});
router.get('/:id/settings', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        if (!user) {
            const response = {
                success: false,
                error: 'User not found'
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            data: user.settings
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching user settings:', error);
        const response = {
            success: false,
            error: 'Failed to fetch user settings'
        };
        res.status(500).json(response);
    }
});
router.put('/:id/settings', async (req, res) => {
    try {
        const { id } = req.params;
        const settings = req.body;
        const updatedUser = await userService.updateUserSettings(id, settings);
        if (!updatedUser) {
            const response = {
                success: false,
                error: 'User not found'
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            data: updatedUser.settings,
            message: 'User settings updated successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error updating user settings:', error);
        const response = {
            success: false,
            error: 'Failed to update user settings'
        };
        res.status(500).json(response);
    }
});
router.get('/', async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        const response = {
            success: true,
            data: users
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        const response = {
            success: false,
            error: 'Failed to fetch users'
        };
        res.status(500).json(response);
    }
});
exports.default = router;
//# sourceMappingURL=userRoutes.js.map