
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Target, BarChart3, TrendingUp, DollarSign, Users } from 'lucide-react';
import CampaignForm from './campaign-form';
import CampaignList from './campaign-list';
import CampaignDetails from './campaign-details';
import CampaignAnalytics from './campaign-analytics';
import { MarketingCampaign } from '@/types/social-media';

export default function MarketingCampaignsClient() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);

  useEffect(() => {
    if (session) {
      fetchCampaigns();
    }
  }, [session]);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/marketing-campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to fetch marketing campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCampaignCreated = (newCampaign: MarketingCampaign) => {
    setCampaigns(prev => [newCampaign, ...prev]);
    setShowForm(false);
    toast.success('Campaign created successfully');
  };

  const handleCampaignUpdated = (updatedCampaign: MarketingCampaign) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === updatedCampaign.id ? updatedCampaign : campaign
    ));
    setEditingCampaign(null);
    setShowForm(false);
    if (selectedCampaign?.id === updatedCampaign.id) {
      setSelectedCampaign(updatedCampaign);
    }
    toast.success('Campaign updated successfully');
  };

  const handleCampaignDeleted = (campaignId: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
    if (selectedCampaign?.id === campaignId) {
      setSelectedCampaign(null);
    }
    toast.success('Campaign deleted successfully');
  };

  // Calculate stats
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE');
  const completedCampaigns = campaigns.filter(c => c.status === 'COMPLETED');
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalPosts = campaigns.reduce((sum, c) => sum + (c._count?.posts || 0), 0);

  if (!session) {
    return <div>Please log in to access marketing campaigns.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeCampaigns.length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedCampaigns.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              Campaign content
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {selectedCampaign ? (
        <CampaignDetails
          campaign={selectedCampaign}
          onBack={() => setSelectedCampaign(null)}
          onEdit={(campaign) => {
            setEditingCampaign(campaign);
            setShowForm(true);
          }}
          onDelete={handleCampaignDeleted}
          onUpdate={handleCampaignUpdated}
        />
      ) : (
        <Tabs defaultValue="campaigns" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <Button onClick={() => {
              setEditingCampaign(null);
              setShowForm(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </div>

          <TabsContent value="campaigns">
            <CampaignList
              campaigns={campaigns}
              isLoading={isLoading}
              onCampaignSelect={setSelectedCampaign}
              onCampaignEdit={(campaign) => {
                setEditingCampaign(campaign);
                setShowForm(true);
              }}
              onCampaignDelete={handleCampaignDeleted}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <CampaignAnalytics campaigns={campaigns} />
          </TabsContent>
        </Tabs>
      )}

      {/* Campaign Form Modal */}
      {showForm && (
        <CampaignForm
          campaign={editingCampaign}
          onClose={() => {
            setShowForm(false);
            setEditingCampaign(null);
          }}
          onCampaignCreated={handleCampaignCreated}
          onCampaignUpdated={handleCampaignUpdated}
        />
      )}
    </div>
  );
}
