import { Router } from 'express';
import { prisma } from '../db';
import { ok, fail } from '../utils/responses';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) return fail(res, 'Name, email and message are required', 422);
  const saved = await prisma.contactMessage.create({ data: { name, email, subject, message } });
  return ok(res, { id: saved.id }, 201);
});

router.get('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  return ok(res, { messages });
});

export default router;
