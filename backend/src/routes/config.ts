import { Router } from 'express';
import { ok } from '../utils/responses';

const router = Router();

// Centralized, swappable pricing config (section 15: keep pricing configurable
// rather than hardcoded throughout the application).
router.get('/pricing', (req, res) => {
  return ok(res, {
    brand: { model: 'free_posting', priceInr: 0 },
    creator: { model: 'membership', priceInr: 199, billingCycle: 'monthly', benefits: ['Unlimited applications to budgeted briefs', 'Priority visibility in brand searches', 'Access to verified budgeted campaigns'] },
  });
});

export default router;
