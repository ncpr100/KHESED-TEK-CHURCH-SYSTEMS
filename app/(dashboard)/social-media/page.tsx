
import { Metadata } from 'next';
import SocialMediaClient from './_components/social-media-client';

export const metadata: Metadata = {
  title: 'Social Media | Kḥesed-tek Church Management Systems',
  description: 'Manage your church social media accounts and schedule posts',
};

export default function SocialMediaPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Social Media</h2>
      </div>
      <SocialMediaClient />
    </div>
  );
}
