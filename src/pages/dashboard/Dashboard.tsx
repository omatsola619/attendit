import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, BarChart3, Users, Image, LogOut, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/ui/dashboard-sidebar";
import { Container } from "@/components/ui/layout";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { campaignService, Campaign } from "@/lib/campaigns";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch campaigns to get real stats
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await campaignService.getUserCampaigns();
      
      if (error) {
        console.error("Error fetching campaigns:", error);
      } else {
        setCampaigns(data || []);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast.error("Error signing out: " + error.message);
        console.error("Logout error:", error);
      } else {
        toast.success("Signed out successfully");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  // Calculate stats from real campaigns
  const totalViews = campaigns.reduce((sum, campaign) => sum + campaign.views, 0);
  const totalDownloads = campaigns.reduce((sum, campaign) => sum + campaign.downloads, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;



  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-notion-title text-2xl sm:text-3xl">
                  Welcome back, {user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'}
                </h1>
                <p className="text-muted-foreground mt-2 text-notion-body">
                  Ready to create some amazing collaborative posters?
                </p>
              </div>
              <Button size="sm" className="w-full sm:w-auto" asChild>
                <Link to="/dashboard/create">
                  <Plus className="mr-2 h-4 w-4" />
                  New Campaign
                </Link>
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded bg-accent">
                      <Image className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-notion-caption text-muted-foreground">Total Campaigns</p>
                      <p className="text-2xl font-semibold text-notion-heading">{loading ? "..." : campaigns.length}</p>
                      <p className="text-xs text-muted-foreground">
                        {activeCampaigns} active
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded bg-accent">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-notion-caption text-muted-foreground">Total Views</p>
                      <p className="text-2xl font-semibold text-notion-heading">{loading ? "..." : totalViews.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        All campaigns
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded bg-accent">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-notion-caption text-muted-foreground">Downloads</p>
                      <p className="text-2xl font-semibold text-notion-heading">{loading ? "..." : totalDownloads.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        Total downloads
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-smooth">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-notion-heading font-semibold">Create Your First Campaign</h3>
                      <p className="text-muted-foreground text-notion-body mt-1">
                        Start by uploading a banner and setting up photo placeholders
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link to="/dashboard/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Get Started
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-smooth">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-notion-heading font-semibold">Manage Campaigns</h3>
                      <p className="text-muted-foreground text-notion-body mt-1">
                        View, edit, and share your existing campaigns
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link to="/dashboard/campaigns">
                        <Image className="mr-2 h-4 w-4" />
                        View Campaigns
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-notion-heading font-semibold">Recent Campaigns</h3>
                    <p className="text-muted-foreground text-notion-body mt-1">
                      Your latest created campaigns
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground text-notion-body">Loading campaigns...</p>
                      </div>
                    ) : campaigns.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground text-notion-body">No campaigns created yet</p>
                      </div>
                    ) : (
                      campaigns.slice(0, 3).map((campaign) => (
                        <div key={campaign.id} className="flex items-center justify-between p-3 rounded hover:bg-accent transition-smooth">
                          <div className="flex items-center gap-3">
                            <img 
                              src={campaign.banner_url} 
                              alt={campaign.title}
                              className="w-10 h-10 rounded object-cover border border-border"
                            />
                            <div>
                              <p className="text-notion-body font-medium">{campaign.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {campaign.views} views • {campaign.downloads} downloads
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-muted-foreground">
                              {new Date(campaign.created_at).toLocaleDateString()}
                            </span>
                            <div className="mt-1">
                              <Badge variant={campaign.status === "active" ? "default" : "secondary"} className="text-xs">
                                {campaign.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {campaigns.length > 3 && (
                      <div className="pt-2 border-t border-border">
                        <Button variant="ghost" size="sm" asChild className="w-full mt-2">
                          <Link to="/dashboard/campaigns">
                            View All Campaigns
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;