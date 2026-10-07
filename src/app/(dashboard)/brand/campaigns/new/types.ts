export type CampaignType = "influencer_collab" | "ugc_content" | "product_launch" | "brand_awareness" | "sales_conversion";
export type ContentStyle = "organic" | "professional" | "raw_real" | "creative" | "tutorial" | "testimonial";
export type UsageRights = "organic" | "paid_ads" | "whitelisting" | "full_rights";
export type LocationScope = "any" | "india" | "specific_cities" | "international";
export type CreatorSize = "nano" | "micro" | "mid" | "macro" | "mega";
export type BiddingType = "OPEN" | "FIXED";

export type DeliverableCounts = {
  instagramReel: number;
  instagramStory: number;
  instagramPost: number;
  youtubeVideo: number;
  youtubeShort: number;
  tiktokVideo: number;
  ugcVideo: number;
};

export type CampaignDraft = {
  brief: {
    campaignType: CampaignType;
    campaignName: string;
    objective: string;
    description: string;
    website: string;
    instagram: string;
    youtube: string;
  };
  contentDeliverables: {
    deliverables: DeliverableCounts;
    videoDuration: string;
    contentStyle: ContentStyle;
    talkingPoints: string;
    brandMentions: string;
    requireFaceVisible: boolean;
    requireOriginalContent: boolean;
    requireSubtitles: boolean;
    requireProductLink: boolean;
    contentReferences: string[];
    usageRights: UsageRights;
  };
  creatorRequirements: {
    platforms: string[];
    categories: string[];
    locationScope: LocationScope;
    specificCities: string[];
    creatorSize: CreatorSize;
    minEngagementRate: number;
    audienceAgeMin: number;
    audienceAgeMax: number;
    audienceGender: "all" | "male" | "female";
    audienceLocation: string;
    audienceInterests: string[];
    requirePortfolio: boolean;
    requireCustomProposal: boolean;
  };
  budgetBidding: {
    biddingType: BiddingType;
    budgetMin: string;
    budgetMax: string;
    creatorsRequired: number;
    applicationDeadline: string;
    startDate: string;
    allowInternational: boolean;
  };
};

export const CATEGORY_OPTIONS = ["Beauty", "Fashion", "Lifestyle", "Tech", "Fitness", "Food", "Travel", "Gaming", "Parenting", "Finance", "Education", "Entertainment"];

export const emptyDraft: CampaignDraft = {
  brief: {
    campaignType: "influencer_collab",
    campaignName: "",
    objective: "",
    description: "",
    website: "",
    instagram: "",
    youtube: "",
  },
  contentDeliverables: {
    deliverables: { instagramReel: 0, instagramStory: 0, instagramPost: 0, youtubeVideo: 0, youtubeShort: 0, tiktokVideo: 0, ugcVideo: 0 },
    videoDuration: "15-60",
    contentStyle: "organic",
    talkingPoints: "",
    brandMentions: "",
    requireFaceVisible: false,
    requireOriginalContent: true,
    requireSubtitles: false,
    requireProductLink: false,
    contentReferences: [],
    usageRights: "organic",
  },
  creatorRequirements: {
    platforms: [],
    categories: [],
    locationScope: "india",
    specificCities: [],
    creatorSize: "micro",
    minEngagementRate: 3,
    audienceAgeMin: 18,
    audienceAgeMax: 30,
    audienceGender: "all",
    audienceLocation: "India (All)",
    audienceInterests: [],
    requirePortfolio: false,
    requireCustomProposal: false,
  },
  budgetBidding: {
    biddingType: "OPEN",
    budgetMin: "",
    budgetMax: "",
    creatorsRequired: 1,
    applicationDeadline: "",
    startDate: "",
    allowInternational: false,
  },
};
