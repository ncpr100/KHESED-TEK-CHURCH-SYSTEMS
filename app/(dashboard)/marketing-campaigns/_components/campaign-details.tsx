
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Calendar, DollarSign, Target, Users, BarChart3, Play, Pause, Square } from 'lucide-react';
import { MarketingCampaign } from '@/types/social-media';


interface CampaignDetailsProps {
  campaign: MarketingCampaign;
  onBack: () => void;
  onEdit: (campaign: MarketingCampaign) => void;
  onDelete: (campaignId: string) => void;
  onUpdate: (campaign: MarketingCampaign) => void;
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800'
};

export default function CampaignDetails({
  campaign,
  onBack,
  onEdit,
  onDelete,
  onUpdate
}: CampaignDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [campaignPosts, setCampaignPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchCampaignPosts();
  }, [campaign.id]);

  const fetchCampaignPosts = async () => {
    try {
      const response = await fetch(`/api/social-media-posts?campaignId=${campaign.id}`);
      if (response.ok) {
        const posts = await response.json();
        setCampaignPosts(posts);
      }
    } catch (error) {
      console.error('Error fetching campaign posts:', error);
    }
  };

  const updateCampaignStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/marketing-campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update campaign status');
      }

      const updatedCampaign = await response.json();
      onUpdate(updatedCampaign);
      toast.success(`Campaign ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast.error('Failed to update campaign status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/marketing-campaigns/${campaign.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete campaign');
      }

      onDelete(campaign.id);
      onBack();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const platforms = JSON.parse(campaign.platforms || '[]');
  const objectives = campaign.objectives ? JSON.parse(campaign.objectives) : [];
  const targetAudience = campaign.targetAudience ? JSON.parse(campaign.targetAudience) : {};
  const tags = campaign.tags ? JSON.parse(campaign.tags) : [];
  const metrics = campaign.metrics ? JSON.parse(campaign.metrics) : {};

  const publishedPosts = campaignPosts.filter(post => post.status === 'PUBLISHED');
  const scheduledPosts = campaignPosts.filter(post => post.status === 'SCHEDULED');
  const draftPosts = campaignPosts.filter(post => post.status === 'DRAFT');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={statusColors[campaign.status as keyof typeof statusColors]}>
                {campaign.status.toLowerCase()}
              </Badge>
              <span className="text-sm text-gray-500">
                Created {new Date(campaign.createdAt || campaign.startDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {campaign.status === 'DRAFT' && (
            <Button onClick={() => updateCampaignStatus('ACTIVE')} disabled={isUpdating}>
              <Play className="mr-2 h-4 w-4" />
              Start Campaign
            </Button>
          )}
          {campaign.status === 'ACTIVE' && (
            <Button onClick={() => updateCampaignStatus('PAUSED')} disabled={isUpdating}>
              <Pause className="mr-2 h-4 w-4" />
              Pause Campaign
            </Button>
          )}
          {campaign.status === 'PAUSED' && (
            <Button onClick={() => updateCampaignStatus('ACTIVE')} disabled={isUpdating}>
              <Play className="mr-2 h-4 w-4" />
              Resume Campaign
            </Button>
          )}
          {['ACTIVE', 'PAUSED'].includes(campaign.status) && (
            <Button
              variant="outline"
              onClick={() => updateCampaignStatus('COMPLETED')}
              disabled={isUpdating}
            >
              <Square className="mr-2 h-4 w-4" />
              Complete
            </Button>
          )}
          <Button variant="outline" onClick={() => onEdit(campaign)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignPosts.length}</div>
            <p className="text-xs text-muted-foreground">
              {publishedPosts.length} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledPosts.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready to publish
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaign.budget ? `$${campaign.budget.toLocaleString()}` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {campaign.currency}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaign.endDate
                ? Math.ceil((new Date(campaign.endDate).getTime() - new Date(campaign.startDate).getTime()) / (1000 * 60 * 60 * 24))
                : '∞'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Campaign Details */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaign.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{campaign.description}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Timeline</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Start: {new Date(campaign.startDate).toLocaleDateString()}</span>
                    </div>
                    {campaign.endDate && (
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>End: {new Date(campaign.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Platforms</h4>
                  <div className="flex flex-wrap gap-2">
                    {platforms.map((platform: string) => (
                      <Badge key={platform} variant="outline">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>

                {tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Target Audience & Objectives */}
            <Card>
              <CardHeader>
                <CardTitle>Target & Objectives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {objectives.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Objectives</h4>
                    <ul className="text-sm space-y-1">
                      {objectives.map((objective: string) => (
                        <li key={objective} className="flex items-center">
                          <Target className="mr-2 h-3 w-3" />
                          {objective.replace('_', ' ').toUpperCase()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {Object.keys(targetAudience).some(key => targetAudience[key]) && (
                  <div>
                    <h4 className="font-medium mb-2">Target Audience</h4>
                    <div className="text-sm space-y-2">
                      {targetAudience.demographics && (
                        <div>
                          <span className="font-medium">Demographics:</span> {targetAudience.demographics}
                        </div>
                      )}
                      {targetAudience.interests && (
                        <div>
                          <span className="font-medium">Interests:</span> {targetAudience.interests}
                        </div>
                      )}
                      {targetAudience.location && (
                        <div>
                          <span className="font-medium">Location:</span> {targetAudience.location}
                        </div>
                      )}
                      {targetAudience.ageRange && (
                        <div>
                          <span className="font-medium">Age Range:</span> {targetAudience.ageRange}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {campaignPosts.length > 0 ? (
                <div className="space-y-4">
                  {campaignPosts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={
                              post.status === 'PUBLISHED' ? 'default' :
                              post.status === 'SCHEDULED' ? 'secondary' : 
                              'outline'
                            }>
                              {post.status.toLowerCase()}
                            </Badge>
                            {post.title && <span className="font-medium">{post.title}</span>}
                          </div>
                          <p className="text-sm text-gray-900 mb-2 line-clamp-3">
                            {post.content}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 space-x-4">
                            <span>Platforms: {JSON.parse(post.platforms || '[]').join(', ')}</span>
                            {post.scheduledAt && (
                              <span>Scheduled: {new Date(post.scheduledAt).toLocaleDateString()}</span>
                            )}
                            {post.publishedAt && (
                              <span>Published: {new Date(post.publishedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium">No posts yet</h3>
                  <p className="mt-1 text-sm">Create social media posts and assign them to this campaign.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium">Analytics coming soon</h3>
                <p className="mt-1 text-sm">Campaign performance metrics will be available here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
