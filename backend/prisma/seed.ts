import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// All names/brands below are DEMO DATA for local development only — not real
// people or real brand partnerships (see project constraints, section 31/32).
const CATEGORIES = ['Fashion', 'Beauty', 'Lifestyle', 'Tech', 'Fitness', 'Food', 'Travel', 'Gaming', 'Parenting', 'Finance', 'Education', 'Entertainment'];

const CREATORS = [
  { name: 'Ananya Kapoor', email: 'ananya@demo.bloocube.local', niches: ['Beauty', 'Fashion'], location: 'Delhi', platforms: ['instagram'], followers: 128000, engagementRate: 4.8, avgReach: 1200000, startingPrice: 18000 },
  { name: 'Rohan Sharma', email: 'rohan@demo.bloocube.local', niches: ['Tech'], location: 'Mumbai', platforms: ['youtube'], followers: 82000, engagementRate: 6.2, avgReach: 430000, startingPrice: 12000 },
  { name: 'Mehak Patel', email: 'mehak@demo.bloocube.local', niches: ['Lifestyle'], location: 'Bengaluru', platforms: ['tiktok', 'instagram'], followers: 210000, engagementRate: 5.1, avgReach: 740000, startingPrice: 25000 },
  { name: 'Karan Verma', email: 'karan@demo.bloocube.local', niches: ['Fitness'], location: 'Pune', platforms: ['instagram'], followers: 95000, engagementRate: 4.3, avgReach: 420000, startingPrice: 15000 },
  { name: 'Isha Malhotra', email: 'isha@demo.bloocube.local', niches: ['Travel'], location: 'Goa', platforms: ['instagram', 'youtube'], followers: 160000, engagementRate: 5.8, avgReach: 1100000, startingPrice: 20000 },
  { name: 'Arjun Nair', email: 'arjun@demo.bloocube.local', niches: ['Food'], location: 'Chennai', platforms: ['instagram'], followers: 110000, engagementRate: 4.9, avgReach: 920000, startingPrice: 16000 },
];

const BRANDS = [
  { companyName: 'Garnier', email: 'garnier@demo.bloocube.local', industry: 'Beauty' },
  { companyName: 'Philips', email: 'philips@demo.bloocube.local', industry: 'Tech' },
  { companyName: 'Zomato', email: 'zomato@demo.bloocube.local', industry: 'Food' },
  { companyName: 'CeraVe', email: 'cerave@demo.bloocube.local', industry: 'Beauty' },
  { companyName: 'AJIO', email: 'ajio@demo.bloocube.local', industry: 'Fashion' },
];

const DEMO_PASSWORD = 'Demo@12345';

async function main() {
  console.log('Seeding demo data...');

  for (const slug of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: slug.toLowerCase() }, create: { name: slug, slug: slug.toLowerCase() }, update: {} });
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const creatorUsers = [];
  for (const c of CREATORS) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      create: {
        email: c.email,
        name: c.name,
        passwordHash,
        role: 'CREATOR',
        isVerified: true,
        creatorProfile: {
          create: {
            niches: c.niches.join(','),
            platforms: c.platforms.join(','),
            location: c.location,
            followers: c.followers,
            engagementRate: c.engagementRate,
            avgReach: c.avgReach,
            startingPrice: c.startingPrice,
            verified: true,
            bio: `${c.niches[0]} creator based in ${c.location}.`,
          },
        },
        wallet: { create: { availableBalance: 0, totalEarnings: 0 } },
      },
      update: {},
      include: { creatorProfile: true },
    });
    creatorUsers.push(user);
  }

  const brandUsers = [];
  for (const b of BRANDS) {
    const user = await prisma.user.upsert({
      where: { email: b.email },
      create: {
        email: b.email,
        name: `${b.companyName} Brand Team`,
        passwordHash,
        role: 'BRAND',
        isVerified: true,
        brandProfile: { create: { companyName: b.companyName, industry: b.industry, location: 'India', verified: true, description: `${b.companyName} is a demo brand account for local development.` } },
      },
      update: {},
      include: { brandProfile: true },
    });
    brandUsers.push(user);
  }

  // Admin account
  await prisma.user.upsert({
    where: { email: 'admin@bloocube.local' },
    create: { email: 'admin@bloocube.local', name: 'Platform Admin', passwordHash, role: 'ADMIN', isVerified: true },
    update: {},
  });

  const garnier = brandUsers[0]!;
  const philips = brandUsers[1]!;
  const zomato = brandUsers[2]!;

  const campaignsData = [
    {
      brand: garnier,
      title: 'Summer Beauty Campaign',
      objective: 'Drive awareness for the new Summer skincare line.',
      description: 'We are launching a new summer skincare range and want creators to showcase real routines using our products in natural daylight settings.',
      platforms: ['instagram'],
      categories: ['Beauty'],
      budgetMin: 10000,
      budgetMax: 20000,
      creatorsRequired: 3,
      deliverables: { instagramReel: 1, instagramStory: 3 },
    },
    {
      brand: philips,
      title: 'Tech Product Launch',
      objective: 'Generate buzz for our newest grooming device launch.',
      description: 'Launch campaign for a new grooming device. Looking for tech and lifestyle creators to produce an honest first-look video.',
      platforms: ['youtube'],
      categories: ['Tech'],
      budgetMin: 20000,
      budgetMax: 40000,
      creatorsRequired: 5,
      deliverables: { youtubeVideo: 1, youtubeShort: 1 },
    },
    {
      brand: zomato,
      title: 'Food & Lifestyle Campaign',
      objective: 'Showcase local restaurant discovery through the app.',
      description: 'We want food creators to share their favorite discovery moments using the app in a fun, relatable way.',
      platforms: ['instagram'],
      categories: ['Food', 'Lifestyle'],
      budgetMin: 8000,
      budgetMax: 15000,
      creatorsRequired: 2,
      deliverables: { instagramReel: 1 },
    },
  ];

  for (const c of campaignsData) {
    const brandProfile = await prisma.brandProfile.findUniqueOrThrow({ where: { userId: c.brand.id } });
    await prisma.campaign.create({
      data: {
        brandId: brandProfile.id,
        type: 'INFLUENCER_COLLAB',
        title: c.title,
        objective: c.objective,
        description: c.description,
        status: 'ACTIVE',
        deliverables: JSON.stringify(c.deliverables),
        platforms: c.platforms.join(','),
        categories: c.categories.map((x) => x.toLowerCase()).join(','),
        creatorSize: 'MICRO',
        minEngagementRate: 3,
        biddingType: 'OPEN',
        budgetMin: c.budgetMin,
        budgetMax: c.budgetMax,
        creatorsRequired: c.creatorsRequired,
        applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('Seed complete.');
  console.log(`Demo login password for all seeded accounts: ${DEMO_PASSWORD}`);
  console.log('Creator logins:', CREATORS.map((c) => c.email).join(', '));
  console.log('Brand logins:', BRANDS.map((b) => b.email).join(', '));
  console.log('Admin login: admin@bloocube.local');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
