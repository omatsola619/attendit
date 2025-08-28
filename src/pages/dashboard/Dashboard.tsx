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
      <div className="p-4 sm:p-6 lg:p-8">
        <Container>
          <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Welcome back, {user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'}!
                </h1>
                <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
                  Ready to create some amazing collaborative posters?
                </p>
              </div>
              <Button variant="hero" size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/dashboard/create">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Campaign
                </Link>
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                  <Image className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : campaigns.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeCampaigns} active campaigns
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : totalViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all campaigns
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Downloads</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : totalDownloads.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total poster downloads
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="hover:shadow-lg transition-smooth">
                <CardHeader>
                  <CardTitle>Create Your First Campaign</CardTitle>
                  <CardDescription>
                    Start by uploading a banner and setting up photo placeholders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="lg" asChild className="w-full">
                    <Link to="/dashboard/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Get Started
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-smooth">
                <CardHeader>
                  <CardTitle>Manage Campaigns</CardTitle>
                  <CardDescription>
                    View, edit, and share your existing campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="lg" asChild className="w-full">
                    <Link to="/dashboard/campaigns">
                      <Image className="mr-2 h-4 w-4" />
                      View Campaigns
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Campaigns</CardTitle>
                <CardDescription>
                  Your latest created campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">Loading campaigns...</p>
                    </div>
                  ) : campaigns.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No campaigns created yet</p>
                    </div>
                  ) : (
                    campaigns.slice(0, 3).map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <img 
                            src={campaign.banner_url} 
                            alt={campaign.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium">{campaign.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {campaign.views} views • {campaign.downloads} downloads
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-muted-foreground">
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
                    <div className="pt-2">
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link to="/dashboard/campaigns">
                          View All Campaigns
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </Container>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;