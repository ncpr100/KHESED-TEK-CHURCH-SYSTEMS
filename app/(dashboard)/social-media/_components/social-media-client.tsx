
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, BarChart3, Settings, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import PostComposer from './post-composer';
import PostCalendar from './post-calendar';
import AccountsManager from './accounts-manager';
import AnalyticsDashboard from './analytics-dashboard';
import { SocialMediaAccount, SocialMediaPost } from '@/types/social-media';

const platformIcons = {
  FACEBOOK: Facebook,
  TWITTER: Twitter,
  INSTAGRAM: Instagram,
  LINKEDIN: Linkedin
};

const platformColors = {
  FACEBOOK: 'bg-blue-500',
  TWITTER: 'bg-sky-500',
  INSTAGRAM: 'bg-pink-500',
  LINKEDIN: 'bg-blue-600'
};

export default function SocialMediaClient() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([]);
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialMediaPost | null>(null);

  useEffect(() => {
    if (session) {
      fetchAccounts();
      fetchPosts();
    }
  }, [session]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/social-media-accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to fetch social media accounts');
    }
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/social-media-posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to fetch social media posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostCreated = (newPost: SocialMediaPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShowComposer(false);
    toast.success('Post created successfully');
  };

  const handlePostUpdated = (updatedPost: SocialMediaPost) => {
    setPosts(prev => prev.map(post => post.id === updatedPost.id ? updatedPost : post));
    setSelectedPost(null);
    setShowComposer(false);
    toast.success('Post updated successfully');
  };

  const handlePostDeleted = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
    toast.success('Post deleted successfully');
  };

  const activeAccounts = accounts.filter(acc => acc.isActive);
  const recentPosts = posts.slice(0, 5);
  const scheduledPosts = posts.filter(post => post.status === 'SCHEDULED');
  const publishedPosts = posts.filter(post => post.status === 'PUBLISHED');

  if (!session) {
    return <div>Please log in to access social media management.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAccounts.length}</div>
            <div className="flex space-x-1 mt-2">
              {activeAccounts.map(account => {
                const Icon = platformIcons[account.platform as keyof typeof platformIcons];
                const colorClass = platformColors[account.platform as keyof typeof platformColors];
                return (
                  <div
                    key={account.id}
                    className={`w-6 h-6 rounded flex items-center justify-center ${colorClass}`}
                  >
                    {Icon && <Icon className="h-3 w-3 text-white" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
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
            <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedPosts.length}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="posts" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
          </TabsList>
          
          <Button onClick={() => setShowComposer(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>

        <TabsContent value="posts" className="space-y-4">
          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : recentPosts.length > 0 ? (
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="border-b pb-4 last:border-b-0">
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
                            {post.campaign && (
                              <Badge variant="outline">{post.campaign.name}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-900 mb-2 line-clamp-2">
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPost(post);
                            setShowComposer(true);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Plus className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium">No posts yet</h3>
                  <p className="mt-1 text-sm">Get started by creating your first social media post.</p>
                  <div className="mt-6">
                    <Button onClick={() => setShowComposer(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Post
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <PostCalendar
            posts={posts}
            onPostSelect={(post) => {
              setSelectedPost(post);
              setShowComposer(true);
            }}
            onPostDeleted={handlePostDeleted}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard accounts={accounts} />
        </TabsContent>

        <TabsContent value="accounts">
          <AccountsManager
            accounts={accounts}
            onAccountsChanged={fetchAccounts}
          />
        </TabsContent>
      </Tabs>

      {/* Post Composer Modal */}
      {showComposer && (
        <PostComposer
          post={selectedPost}
          accounts={activeAccounts}
          onClose={() => {
            setShowComposer(false);
            setSelectedPost(null);
          }}
          onPostCreated={handlePostCreated}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </div>
  );
}
