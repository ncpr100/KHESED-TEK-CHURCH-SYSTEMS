
export interface SocialMediaAccount {
  id: string;
  platform: string;
  username?: string;
  displayName?: string;
  isActive: boolean;
  lastSync?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SocialMediaPost {
  id: string;
  title?: string;
  content: string;
  mediaUrls?: string;
  platforms: string;
  accountIds?: string;
  status: string;
  scheduledAt?: string;
  publishedAt?: string;
  hashtags?: string;
  mentions?: string;
  campaignId?: string;
  authorId?: string;
  churchId?: string;
  campaign?: { id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  description?: string;
  objectives?: string;
  targetAudience?: string;
  budget?: number;
  currency: string;
  startDate: string;
  endDate?: string;
  status: string;
  platforms: string;
  metrics?: string;
  tags?: string;
  managerId?: string;
  churchId?: string;
  createdAt?: string;
  updatedAt?: string;
  posts?: SocialMediaPost[];
  _count?: { posts: number };
}

export interface SocialMediaMetrics {
  id: string;
  accountId: string;
  postId?: string;
  campaignId?: string;
  platform: string;
  metricType: string;
  value: number;
  date: string;
  periodType: string;
  metadata?: string;
  churchId: string;
  collectedAt: string;
  createdAt: string;
  account: {
    platform: string;
    username?: string;
    displayName?: string;
  };
}

export interface PostComposerProps {
  post?: SocialMediaPost | null;
  accounts: SocialMediaAccount[];
  onClose: () => void;
  onPostCreated: (post: SocialMediaPost) => void;
  onPostUpdated: (post: SocialMediaPost) => void;
}

export interface CampaignFormProps {
  campaign?: MarketingCampaign | null;
  onClose: () => void;
  onCampaignCreated: (campaign: MarketingCampaign) => void;
  onCampaignUpdated: (campaign: MarketingCampaign) => void;
}
