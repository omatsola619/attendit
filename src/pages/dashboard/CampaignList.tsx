import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, Share2, Eye, Download, MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DashboardLayout } from "@/components/ui/dashboard-sidebar";
import { Container } from "@/components/ui/layout";
import { toast } from "sonner";
import { campaignService, Campaign } from "@/lib/campaigns";

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch campaigns on component mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await campaignService.getUserCampaigns();
      
      if (error) {
        console.error("Error fetching campaigns:", error);
        toast.error("Failed to load campaigns");
      } else {
        setCampaigns(data || []);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleShareLink = (shareToken: string) => {
    const shareLink = `${window.location.origin}/campaign/${shareToken}`;
    navigator.clipboard.writeText(shareLink);
    toast.success("Share link copied to clipboard!");
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      const { error } = await campaignService.deleteCampaign(id);
      
      if (error) {
        toast.error("Failed to delete campaign");
        console.error("Delete error:", error);
      } else {
        toast.success("Campaign deleted successfully!");
        // Refresh campaigns list
        fetchCampaigns();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleActivateCampaign = async (id: string) => {
    try {
      const { error } = await campaignService.updateCampaignStatus(id, 'active');
      
      if (error) {
        toast.error("Failed to activate campaign");
        console.error("Activate error:", error);
      } else {
        toast.success("Campaign activated successfully!");
        // Refresh campaigns list
        fetchCampaigns();
      }
    } catch (error) {
      console.error("Activate error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <Container>
          <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">My Campaigns</h1>
                <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
                  Manage and share your poster campaigns
                </p>
              </div>
              <Button variant="hero" size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/dashboard/create">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Campaign
                </Link>
              </Button>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading campaigns...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Campaigns Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {campaigns.map((campaign) => (
                    <Card key={campaign.id} className="group hover:shadow-lg transition-smooth">
                      <CardHeader className="p-0">
                        <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                          <img 
                            src={campaign.banner_url} 
                            alt={campaign.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3">
                            <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                              {campaign.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <CardTitle className="text-base sm:text-lg mb-2 line-clamp-2">{campaign.title}</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                              Created on {new Date(campaign.created_at).toLocaleDateString()}
                            </CardDescription>
                            {campaign.description && (
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{campaign.description}</p>
                            )}
                          </div>
                          
                          {/* Stats */}
                          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>{campaign.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>{campaign.downloads}</span>
                            </div>
                          </div>
                          
                          {/* Banner Info */}
                          <div className="text-xs text-muted-foreground hidden sm:block">
                            {campaign.banner_width} × {campaign.banner_height}px • {campaign.placeholder_shape}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 pt-2">
                            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex-1 sm:flex-initial text-xs sm:text-sm"
                                onClick={() => handleShareLink(campaign.share_token)}
                              >
                                <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-0" />
                                <span className="sm:hidden">Share</span>
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1 sm:flex-initial text-xs sm:text-sm" asChild>
                                <Link to={`/dashboard/campaigns/${campaign.id}`}>
                                  <span className="sm:hidden">Details</span>
                                  <span className="hidden sm:inline">View Details</span>
                                </Link>
                              </Button>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {campaign.status === 'draft' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleActivateCampaign(campaign.id)}
                                  >
                                    Activate Campaign
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                  <Link to={`/dashboard/campaigns/${campaign.id}`}>
                                    Edit Campaign
                                  </Link>
                                </DropdownMenuItem>
                                {campaign.status === 'active' && (
                                  <DropdownMenuItem asChild>
                                    <Link to={`/campaign/${campaign.share_token}`} target="_blank">
                                      Preview Public Page
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleDeleteCampaign(campaign.id)}
                                >
                                  Delete Campaign
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {/* Empty State */}
            {!loading && campaigns.length === 0 && (
              <Card className="text-center py-16">
                <CardContent>
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-lg bg-muted flex items-center justify-center">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">No campaigns yet</h3>
                      <p className="text-muted-foreground">
                        Create your first campaign to get started
                      </p>
                    </div>
                    <Button variant="hero" asChild>
                      <Link to="/dashboard/create">
                        Create Your First Campaign
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </Container>
      </div>
    </DashboardLayout>
  );
};

export default CampaignList;