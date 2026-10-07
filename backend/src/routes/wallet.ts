import { Router } from 'express';
import { prisma } from '../db';
import { ok, fail } from '../utils/responses';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, requireRole('CREATOR'), async (req: AuthedRequest, res) => {
  const wallet = await prisma.wallet.upsert({ where: { userId: req.userId! }, create: { userId: req.userId! }, update: {} });
  const transactions = await prisma.walletTransaction.findMany({ where: { walletId: wallet.id }, orderBy: { createdAt: 'desc' }, take: 50 });
  const withdrawals = await prisma.withdrawal.findMany({ where: { walletId: wallet.id }, orderBy: { createdAt: 'desc' } });

  return ok(res, {
    wallet: {
      availableBalance: wallet.availableBalance,
      pendingBalance: wallet.pendingBalance,
      totalEarnings: wallet.totalEarnings,
    },
    transactions: transactions.map((t) => ({ _id: t.id, type: t.type.toLowerCase(), amount: t.amount, note: t.note, createdAt: t.createdAt.toISOString() })),
    withdrawals: withdrawals.map((w) => ({ _id: w.id, amount: w.amount, method: w.method, status: w.status.toLowerCase(), createdAt: w.createdAt.toISOString() })),
  });
});

router.post('/withdraw', requireAuth, requireRole('CREATOR'), async (req: AuthedRequest, res) => {
  const { amount, method, details } = req.body || {};
  if (!amount || Number(amount) <= 0) return fail(res, 'Withdrawal amount must be greater than zero', 422);
  if (!method || !['upi', 'bank'].includes(method)) return fail(res, 'Invalid withdrawal method', 422);

  const wallet = await prisma.wallet.findUnique({ where: { userId: req.userId! } });
  if (!wallet || wallet.availableBalance < Number(amount)) return fail(res, 'Insufficient available balance', 400);

  const [, withdrawal] = await prisma.$transaction([
    prisma.wallet.update({ where: { id: wallet.id }, data: { availableBalance: { decrement: Number(amount) } } }),
    prisma.withdrawal.create({ data: { walletId: wallet.id, amount: Number(amount), method, details: JSON.stringify(details || {}), status: 'PROCESSING' } }),
  ]);
  await prisma.walletTransaction.create({ data: { walletId: wallet.id, type: 'WITHDRAWAL', amount: Number(amount), note: `Withdrawal via ${method}` } });

  return ok(res, { withdrawal: { _id: withdrawal.id, amount: withdrawal.amount, method: withdrawal.method, status: withdrawal.status.toLowerCase() } }, 201);
});

export default router;
