import { prisma } from '../db';
import { randomUUID } from 'crypto';

/**
 * Mock payment/escrow provider. Isolated behind this service so a real
 * provider (Razorpay/Stripe) can replace the implementation later without
 * touching callers. Never put real provider secrets in frontend code.
 */
const PLATFORM_FEE_PERCENT = 10;

export const PaymentService = {
  async createPayment(collaborationId: string, amount: number) {
    const platformFee = Math.round(amount * (PLATFORM_FEE_PERCENT / 100));
    return prisma.payment.create({
      data: {
        collaborationId,
        amount,
        platformFee,
        status: 'INITIATED',
        providerRef: `mock_${randomUUID()}`,
      },
    });
  },

  async holdInEscrow(paymentId: string) {
    const payment = await prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
    const collaboration = await prisma.collaboration.findUniqueOrThrow({
      where: { id: payment.collaborationId },
      include: { application: { include: { creator: true } } },
    });
    const creatorUserId = collaboration.application.creator.userId;
    const netAmount = payment.amount - payment.platformFee;

    const [updated] = await prisma.$transaction([
      prisma.payment.update({ where: { id: paymentId }, data: { status: 'IN_ESCROW' } }),
      prisma.wallet.upsert({
        where: { userId: creatorUserId },
        create: { userId: creatorUserId, pendingBalance: netAmount },
        update: { pendingBalance: { increment: netAmount } },
      }),
    ]);
    return updated;
  },

  async releasePayment(paymentId: string) {
    const payment = await prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
    const collaboration = await prisma.collaboration.findUniqueOrThrow({
      where: { id: payment.collaborationId },
      include: { application: { include: { creator: true } } },
    });

    const creatorUserId = collaboration.application.creator.userId;
    const netAmount = payment.amount - payment.platformFee;

    await prisma.$transaction([
      prisma.payment.update({ where: { id: paymentId }, data: { status: 'RELEASED' } }),
      prisma.wallet.upsert({
        where: { userId: creatorUserId },
        create: { userId: creatorUserId, availableBalance: netAmount, totalEarnings: netAmount },
        update: {
          availableBalance: { increment: netAmount },
          totalEarnings: { increment: netAmount },
          pendingBalance: { decrement: netAmount },
        },
      }),
    ]);

    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId: creatorUserId } });
    await prisma.walletTransaction.create({
      data: { walletId: wallet.id, type: 'CREDIT', amount: netAmount, note: 'Campaign payment released' },
    });

    return prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
  },

  async refundPayment(paymentId: string) {
    const payment = await prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
    const collaboration = await prisma.collaboration.findUniqueOrThrow({
      where: { id: payment.collaborationId },
      include: { application: { include: { creator: true } } },
    });
    const creatorUserId = collaboration.application.creator.userId;
    const netAmount = payment.amount - payment.platformFee;

    const [updated] = await prisma.$transaction([
      prisma.payment.update({ where: { id: paymentId }, data: { status: 'REFUNDED' } }),
      prisma.wallet.updateMany({ where: { userId: creatorUserId }, data: { pendingBalance: { decrement: netAmount } } }),
    ]);
    return updated;
  },
};
