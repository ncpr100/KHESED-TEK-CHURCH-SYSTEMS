
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Image, Hash, AtSign, Send, Clock, X, Upload } from 'lucide-react';
import { SocialMediaAccount, SocialMediaPost } from '@/types/social-media';

interface PostComposerProps {
  post?: SocialMediaPost | null;
  accounts: SocialMediaAccount[];
  onClose: () => void;
  onPostCreated: (post: SocialMediaPost) => void;
  onPostUpdated: (post: SocialMediaPost) => void;
}

export default function PostComposer({
  post,
  accounts,
  onClose,
  onPostCreated,
  onPostUpdated
}: PostComposerProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    scheduledAt: '',
    hashtags: '',
    mentions: ''
  });
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : '',
        hashtags: post.hashtags ? JSON.parse(post.hashtags).join(' ') : '',
        mentions: post.mentions ? JSON.parse(post.mentions).join(' ') : ''
      });
      
      setSelectedAccounts(post.accountIds ? JSON.parse(post.accountIds) : []);
      setMediaUrls(post.mediaUrls ? JSON.parse(post.mediaUrls) : []);
    }
  }, [post]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAccountToggle = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeMediaUrl = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadMedia = async () => {
    if (mediaFiles.length === 0) return [];

    setIsUploading(true);
    const formData = new FormData();
    mediaFiles.forEach(file => formData.append('files', file));

    try {
      const response = await fetch('/api/upload/social-media', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.files.map((file: any) => file.url);
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Failed to upload media files');
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      toast.error('Post content is required');
      return;
    }

    if (selectedAccounts.length === 0) {
      toast.error('Please select at least one social media account');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload media files if any
      const uploadedMediaUrls = await uploadMedia();
      const allMediaUrls = [...mediaUrls, ...uploadedMediaUrls];

      // Parse hashtags and mentions
      const hashtags = formData.hashtags
        .split(' ')
        .filter(tag => tag.startsWith('#'))
        .map(tag => tag.slice(1));
      
      const mentions = formData.mentions
        .split(' ')
        .filter(mention => mention.startsWith('@'))
        .map(mention => mention.slice(1));

      const platforms = selectedAccounts.map(accountId => {
        const account = accounts.find(acc => acc.id === accountId);
        return account?.platform;
      }).filter(Boolean);

      const postData = {
        title: formData.title,
        content: formData.content,
        mediaUrls: allMediaUrls,
        platforms,
        accountIds: selectedAccounts,
        scheduledAt: formData.scheduledAt || null,
        hashtags: hashtags.length > 0 ? hashtags : null,
        mentions: mentions.length > 0 ? mentions : null
      };

      const url = post ? `/api/social-media-posts/${post.id}` : '/api/social-media-posts';
      const method = post ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error('Failed to save post');
      }

      const savedPost = await response.json();

      if (post) {
        onPostUpdated(savedPost);
      } else {
        onPostCreated(savedPost);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const publishNow = async () => {
    if (!post) return;

    try {
      const response = await fetch(`/api/social-media-posts/${post.id}/publish`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to publish post');
      }

      const result = await response.json();
      toast.success('Post published successfully!');
      onPostUpdated(result.post);
    } catch (error) {
      console.error('Error publishing post:', error);
      toast.error('Failed to publish post');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {post ? 'Edit Post' : 'Create New Post'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter post title..."
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.content.length}/280 characters
            </div>
          </div>

          {/* Media Upload */}
          <div>
            <Label>Media Files</Label>
            <div className="mt-2">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload">
                <Button type="button" variant="outline" className="cursor-pointer" asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Media
                  </span>
                </Button>
              </label>
            </div>

            {/* Show existing media URLs */}
            {mediaUrls.length > 0 && (
              <div className="mt-2 space-y-2">
                <Label className="text-sm">Existing Media:</Label>
                {mediaUrls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm truncate">{url}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMediaUrl(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Show selected files */}
            {mediaFiles.length > 0 && (
              <div className="mt-2 space-y-2">
                <Label className="text-sm">Selected Files:</Label>
                {mediaFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMediaFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accounts Selection */}
          <div>
            <Label>Select Social Media Accounts *</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {accounts.map(account => (
                <Card key={account.id} className="cursor-pointer">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedAccounts.includes(account.id)}
                        onCheckedChange={() => handleAccountToggle(account.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{account.platform}</div>
                        <div className="text-xs text-gray-500">
                          {account.displayName || account.username}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Scheduling */}
          <div>
            <Label htmlFor="scheduledAt">Schedule For (Optional)</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Hashtags */}
          <div>
            <Label htmlFor="hashtags">Hashtags</Label>
            <Input
              id="hashtags"
              value={formData.hashtags}
              onChange={(e) => handleInputChange('hashtags', e.target.value)}
              placeholder="#church #faith #community"
            />
          </div>

          {/* Mentions */}
          <div>
            <Label htmlFor="mentions">Mentions</Label>
            <Input
              id="mentions"
              value={formData.mentions}
              onChange={(e) => handleInputChange('mentions', e.target.value)}
              placeholder="@churchleader @pastor"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            <div className="space-x-2">
              {post && post.status === 'DRAFT' && (
                <Button
                  type="button"
                  onClick={publishNow}
                  disabled={isSubmitting}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Publish Now
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? 'Saving...' : isUploading ? 'Uploading...' : 
                 formData.scheduledAt ? (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Schedule Post
                  </>
                ) : 'Save Draft'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
