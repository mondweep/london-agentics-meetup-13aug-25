// Consolidated API routes for Pre-Route application
import { Router } from 'express';
import tripRoutes from './tripRoutes';
import demoRoutes from './demoRoutes';

const router = Router();

// Debug route to check if router is working
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Router is working',
    availableRoutes: [
      '/trips',
      '/demo'
    ]
  });
});

// API route mappings - start with existing working routes
router.use('/trips', tripRoutes);
router.use('/demo', demoRoutes);

export default router;