
import { Metadata } from 'next';
import MarketingCampaignsClient from './_components/marketing-campaigns-client';

export const metadata: Metadata = {
  title: 'Marketing Campaigns | Kḥesed-tek Church Management Systems',
  description: 'Manage your church marketing campaigns and track performance',
};

export default function MarketingCampaignsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Marketing Campaigns</h2>
      </div>
      <MarketingCampaignsClient />
    </div>
  );
}
