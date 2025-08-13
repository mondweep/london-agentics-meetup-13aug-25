// API routes for notification management
import { Router, Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';
import { UserService } from '../services/userService';
import { ApiResponse } from '../types';

const router = Router();
const notificationService = new NotificationService();
const userService = new UserService();

// POST /api/notifications/send - Send notification to user
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { userId, type, title, message, data } = req.body;
    
    if (!userId || !type || !title || !message) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'UserId, type, title, and message are required'
      };
      return res.status(400).json(response);
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }

    const success = await notificationService.sendNotificationDirect(userId, {
      type,
      title,
      message,
      data: data || {}
    });

    const response: ApiResponse<any> = {
      success,
      data: {
        userId,
        type,
        title,
        timestamp: new Date()
      },
      message: success ? 'Notification sent successfully' : 'Failed to send notification'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error sending notification:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to send notification'
    };
    res.status(500).json(response);
  }
});

// POST /api/notifications/alert - Send traffic alert notification
router.post('/alert', async (req: Request, res: Response) => {
  try {
    const { userId, tripId, routeName, delayMinutes, reason, alternativeRoutes } = req.body;
    
    if (!userId || !tripId || !routeName || delayMinutes === undefined) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'UserId, tripId, routeName, and delayMinutes are required'
      };
      return res.status(400).json(response);
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }

    const success = await notificationService.sendTrafficAlert(
      userId,
      tripId,
      routeName,
      delayMinutes,
      reason || 'Traffic congestion',
      alternativeRoutes || []
    );

    const response: ApiResponse<any> = {
      success,
      data: {
        userId,
        tripId,
        routeName,
        delayMinutes,
        reason,
        timestamp: new Date()
      },
      message: success ? 'Traffic alert sent successfully' : 'Failed to send traffic alert'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error sending traffic alert:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to send traffic alert'
    };
    res.status(500).json(response);
  }
});

// GET /api/notifications/:userId - Get notification history for user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit, type } = req.query;
    
    const user = await userService.getUserById(userId);
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }

    const notifications = await notificationService.getNotificationHistory(
      userId, 
      limit ? parseInt(limit as string, 10) : undefined,
      type as string
    );

    const response: ApiResponse<any> = {
      success: true,
      data: notifications
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching notification history:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch notification history'
    };
    res.status(500).json(response);
  }
});

// POST /api/notifications/:userId/mark-read - Mark notifications as read
router.post('/:userId/mark-read', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { notificationIds } = req.body;
    
    if (!notificationIds || !Array.isArray(notificationIds)) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'NotificationIds array is required'
      };
      return res.status(400).json(response);
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }

    const success = await notificationService.markNotificationsAsRead(userId, notificationIds);

    const response: ApiResponse<any> = {
      success,
      data: {
        userId,
        markedCount: notificationIds.length
      },
      message: success ? 'Notifications marked as read' : 'Failed to mark notifications as read'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to mark notifications as read'
    };
    res.status(500).json(response);
  }
});

// GET /api/notifications/:userId/unread - Get unread notification count
router.get('/:userId/unread', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const user = await userService.getUserById(userId);
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }

    const count = await notificationService.getUnreadCount(userId);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        userId,
        unreadCount: count
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch unread notification count'
    };
    res.status(500).json(response);
  }
});

// DELETE /api/notifications/:userId - Clear notification history
router.delete('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { olderThanDays } = req.query;
    
    const user = await userService.getUserById(userId);
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }

    const success = await notificationService.clearNotificationHistory(
      userId,
      olderThanDays ? parseInt(olderThanDays as string, 10) : undefined
    );

    const response: ApiResponse<any> = {
      success,
      data: {
        userId,
        clearedBefore: olderThanDays ? new Date(Date.now() - (parseInt(olderThanDays as string, 10) * 24 * 60 * 60 * 1000)) : new Date()
      },
      message: success ? 'Notification history cleared' : 'Failed to clear notification history'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error clearing notification history:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to clear notification history'
    };
    res.status(500).json(response);
  }
});

// POST /api/notifications/test - Test notification system
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { userId, channel } = req.body;
    
    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'UserId is required'
      };
      return res.status(400).json(response);
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }

    const success = await notificationService.testNotification(userId, channel);

    const response: ApiResponse<any> = {
      success,
      data: {
        userId,
        channel: channel || 'all',
        timestamp: new Date()
      },
      message: success ? 'Test notification sent successfully' : 'Failed to send test notification'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error sending test notification:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to send test notification'
    };
    res.status(500).json(response);
  }
});

export default router;