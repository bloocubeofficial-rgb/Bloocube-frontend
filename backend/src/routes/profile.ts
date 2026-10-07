import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { ok, fail } from '../utils/responses';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { csv } from '../utils/mappers';

const router = Router();

async function buildUserProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { creatorProfile: true, brandProfile: true } });
  if (!user) return null;

  const base = {
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.toLowerCase(),
    isActive: user.isActive,
    isVerified: user.isVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };

  if (user.creatorProfile) {
    const cp = user.creatorProfile;
    return {
      ...base,
      profile: {
        bio: cp.bio || '',
        avatar_url: user.avatarUrl || '',
        phone: '',
        location: cp.location || '',
        website: '',
        gender: 'prefer_not_to_say',
        language: 'en',
        timezone: 'Asia/Kolkata',
        social_links: {},
        preferences: { emailNotifications: true, pushNotifications: true, smsNotifications: false, marketingEmails: false, profileVisibility: 'public' },
      },
      creator: {
        id: cp.id,
        niches: csv(cp.niches),
        platforms: csv(cp.platforms),
        followers: cp.followers,
        engagementRate: cp.engagementRate,
        avgReach: cp.avgReach,
        startingPrice: cp.startingPrice,
        portfolio: cp.portfolio ? JSON.parse(cp.portfolio) : [],
        availability: cp.availability,
        verified: cp.verified,
      },
    };
  }

  if (user.brandProfile) {
    const bp = user.brandProfile;
    return {
      ...base,
      profile: {
        bio: bp.description || '',
        avatar_url: bp.logoUrl || '',
        phone: '',
        location: bp.location || '',
        website: bp.website || '',
        gender: 'prefer_not_to_say',
        language: 'en',
        timezone: 'Asia/Kolkata',
        social_links: { instagram: bp.instagram || undefined, youtube: bp.youtube || undefined },
        preferences: { emailNotifications: true, pushNotifications: true, smsNotifications: false, marketingEmails: false, profileVisibility: 'public' },
      },
      brand: {
        id: bp.id,
        companyName: bp.companyName,
        logoUrl: bp.logoUrl,
        website: bp.website,
        industry: bp.industry,
        location: bp.location,
        description: bp.description,
        instagram: bp.instagram,
        youtube: bp.youtube,
        verified: bp.verified,
      },
    };
  }

  return base;
}

router.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const profile = await buildUserProfile(req.userId!);
  if (!profile) return fail(res, 'User not found', 404);
  return ok(res, { user: profile });
});

router.put('/account', requireAuth, async (req: AuthedRequest, res) => {
  const { name, profile } = req.body || {};
  const data: Record<string, unknown> = {};
  if (name) data.name = name;
  if (Object.keys(data).length) await prisma.user.update({ where: { id: req.userId! }, data });

  if (profile) {
    const creator = await prisma.creatorProfile.findUnique({ where: { userId: req.userId! } });
    if (creator) {
      await prisma.creatorProfile.update({
        where: { userId: req.userId! },
        data: {
          bio: profile.bio ?? undefined,
          location: profile.location ?? undefined,
        },
      });
    }
    const brand = await prisma.brandProfile.findUnique({ where: { userId: req.userId! } });
    if (brand) {
      await prisma.brandProfile.update({
        where: { userId: req.userId! },
        data: {
          description: profile.bio ?? undefined,
          location: profile.location ?? undefined,
          website: profile.website ?? undefined,
          instagram: profile.social_links?.instagram ?? undefined,
          youtube: profile.social_links?.youtube ?? undefined,
        },
      });
    }
  }

  const updated = await buildUserProfile(req.userId!);
  return ok(res, { user: updated });
});

// Creator-specific onboarding fields (niches, platforms, followers, pricing, portfolio)
router.put('/creator', requireAuth, async (req: AuthedRequest, res) => {
  const cp = await prisma.creatorProfile.findUnique({ where: { userId: req.userId! } });
  if (!cp) return fail(res, 'Not a creator account', 403);
  const b = req.body || {};

  const updated = await prisma.creatorProfile.update({
    where: { userId: req.userId! },
    data: {
      bio: b.bio ?? undefined,
      location: b.location ?? undefined,
      niches: Array.isArray(b.niches) ? b.niches.join(',') : undefined,
      platforms: Array.isArray(b.platforms) ? b.platforms.join(',') : undefined,
      followers: b.followers !== undefined ? Number(b.followers) : undefined,
      engagementRate: b.engagementRate !== undefined ? Number(b.engagementRate) : undefined,
      avgReach: b.avgReach !== undefined ? Number(b.avgReach) : undefined,
      startingPrice: b.startingPrice !== undefined ? Number(b.startingPrice) : undefined,
      portfolio: Array.isArray(b.portfolio) ? JSON.stringify(b.portfolio) : undefined,
      availability: b.availability ?? undefined,
    },
  });
  return ok(res, { creator: updated });
});

router.put('/brand', requireAuth, async (req: AuthedRequest, res) => {
  const bp = await prisma.brandProfile.findUnique({ where: { userId: req.userId! } });
  if (!bp) return fail(res, 'Not a brand account', 403);
  const b = req.body || {};

  const updated = await prisma.brandProfile.update({
    where: { userId: req.userId! },
    data: {
      companyName: b.companyName ?? undefined,
      website: b.website ?? undefined,
      industry: b.industry ?? undefined,
      location: b.location ?? undefined,
      description: b.description ?? undefined,
      instagram: b.instagram ?? undefined,
      youtube: b.youtube ?? undefined,
    },
  });
  return ok(res, { brand: updated });
});

router.put('/change-password', requireAuth, async (req: AuthedRequest, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || String(newPassword).length < 6) return fail(res, 'Invalid password input', 422);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.userId! } });
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return fail(res, 'Current password is incorrect', 401);

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  return ok(res, { changed: true });
});

router.get('/stats', requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.userId! } });
  const ageDays = Math.floor((Date.now() - user.createdAt.getTime()) / 86400000);
  return ok(res, { connectedAccounts: 0, accountAge: ageDays, isVerified: user.isVerified, profileCompleteness: 70 });
});

// GET /api/profile/creators — public creator directory (used by "Explore creators")
router.get('/creators', async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const where: Record<string, unknown> = {};
  if (req.query.niche) where.niches = { contains: String(req.query.niche) };
  if (req.query.location) where.location = { contains: String(req.query.location) };
  if (req.query.platform) where.platforms = { contains: String(req.query.platform) };
  if (req.query.minFollowers) where.followers = { gte: Number(req.query.minFollowers) };

  const [creators, total] = await Promise.all([
    prisma.creatorProfile.findMany({ where, include: { user: true }, orderBy: { followers: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.creatorProfile.count({ where }),
  ]);

  return ok(res, {
    creators: creators.map((c) => ({
      _id: c.id,
      name: c.user.name,
      avatarUrl: c.user.avatarUrl || null,
      verified: c.verified,
      niches: csv(c.niches),
      location: c.location,
      followers: c.followers,
      engagementRate: c.engagementRate,
      startingPrice: c.startingPrice,
      platforms: csv(c.platforms),
    })),
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  });
});

export default router;
