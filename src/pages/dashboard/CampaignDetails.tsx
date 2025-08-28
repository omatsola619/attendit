import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Share2, Download, Eye, ExternalLink, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/ui/dashboard-sidebar";
import { Container } from "@/components/ui/layout";
import { campaignService, Campaign } from "@/lib/campaigns";
import { toast } from "sonner";

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const { data, error } = await campaignService.getCampaign(id!);
      
      if (error) {
        console.error("Error fetching campaign:", error);
        toast.error("Failed to load campaign");
        navigate("/dashboard/campaigns");
      } else if (data) {
        setCampaign(data);
      }
    } catch (error) {
      console.error("Error fetching campaign:", error);
      toast.error("An unexpected error occurred");
      navigate("/dashboard/campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (campaign) {
      const shareLink = `${window.location.origin}/campaign/${campaign.share_token}`;
      navigator.clipboard.writeText(shareLink);
      toast.success("Share link copied to clipboard!");
    }
  };

  const handleDeleteCampaign = async () => {
    if (!campaign) return;
    
    if (confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      try {
        const { error } = await campaignService.deleteCampaign(campaign.id);
        
        if (error) {
          toast.error("Failed to delete campaign");
          console.error("Delete error:", error);
        } else {
          toast.success("Campaign deleted successfully!");
          navigate("/dashboard/campaigns");
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleDownloadStats = () => {
    toast.success("Stats download will be implemented with backend");
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <Container>
            <div className="py-12 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading campaign details...</p>
              </div>
            </div>
          </Container>
        </div>
      </DashboardLayout>
    );
  }

  // Campaign not found
  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <Container>
            <div className="py-12 text-center">
              <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The campaign you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={() => navigate("/dashboard/campaigns")}>
                Back to Campaigns
              </Button>
            </div>
          </Container>
        </div>
      </DashboardLayout>
    );
  }

  const shareLink = `${window.location.origin}/campaign/${campaign.share_token}`;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <Container>
          <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/campaigns")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">{campaign.title}</h1>
                  <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                    {campaign.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Created on {new Date(campaign.created_at).toLocaleDateString()}
                </p>
                {campaign.description && (
                  <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    {campaign.description}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto" asChild>
                  <a href={shareLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Public Page
                  </a>
                </Button>
                <Button variant="hero" className="w-full sm:w-auto">
                  Edit Campaign
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Preview */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl">Campaign Preview</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      How your poster appears to visitors
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div 
                      className="relative bg-muted rounded-lg overflow-hidden mx-auto"
                      style={{ 
                        aspectRatio: `${campaign.banner_width}/${campaign.banner_height}`,
                        maxHeight: "400px",
                        maxWidth: "100%"
                      }}
                    >
                      <img 
                        src={campaign.banner_url} 
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Placeholder overlay simulation */}
                      <div
                        className={`absolute border-2 border-dashed border-primary bg-primary/20 flex items-center justify-center ${
                          campaign.placeholder_shape === 'circle' ? 'rounded-full' : 'rounded-lg'
                        }`}
                        style={{
                          left: `${(campaign.placeholder_x / campaign.banner_width) * 100}%`,
                          top: `${(campaign.placeholder_y / campaign.banner_height) * 100}%`,
                          width: `${(campaign.placeholder_width / campaign.banner_width) * 100}%`,
                          height: `${(campaign.placeholder_height / campaign.banner_height) * 100}%`,
                        }}
                      >
                        <span className="text-xs text-primary font-medium">Photo Area</span>
                      </div>
                    </div>
                    
                    {/* Banner Info */}
                    <div className="mt-4 text-sm text-muted-foreground">
                      <p>Banner: {campaign.banner_width} × {campaign.banner_height}px</p>
                      <p>Placeholder: {campaign.placeholder_shape} ({campaign.placeholder_width} × {campaign.placeholder_height}px)</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Share Link */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl">Share Campaign</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Send this link to let others create personalized posters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-xs sm:text-sm break-all">
                        {shareLink}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCopyLink} className="flex-1 sm:flex-initial">
                          <Copy className="h-4 w-4 sm:mr-0 mr-2" />
                          <span className="sm:hidden">Copy</span>
                        </Button>
                        <Button variant="outline" className="flex-1 sm:flex-initial">
                          <Share2 className="h-4 w-4 sm:mr-0 mr-2" />
                          <span className="sm:hidden">Share</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Summary */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl">Campaign Activity</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Overview of your campaign performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{campaign.views}</div>
                        <div className="text-sm text-muted-foreground">Total Views</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{campaign.downloads}</div>
                        <div className="text-sm text-muted-foreground">Downloads</div>
                      </div>
                    </div>
                    
                    {campaign.views > 0 && (
                      <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                        <div className="text-sm text-muted-foreground">Conversion Rate</div>
                        <div className="text-lg font-semibold text-primary">
                          {((campaign.downloads / campaign.views) * 100).toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4 sm:space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Total Views</span>
                      </div>
                      <span className="font-semibold">{campaign.views}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Downloads</span>
                      </div>
                      <span className="font-semibold">{campaign.downloads}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conversion Rate</span>
                      <span className="font-semibold">
                        {campaign.views > 0 ? ((campaign.downloads / campaign.views) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4 sm:p-6">
                    <Button variant="outline" className="w-full" onClick={handleDownloadStats}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Stats
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      Edit Campaign
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleDeleteCampaign}
                    >
                      Delete Campaign
                    </Button>
                  </CardContent>
                </Card>

                {/* Campaign Info */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl">Campaign Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Updated:</span>
                      <span>{new Date(campaign.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Share Token:</span>
                      <span className="font-mono text-xs break-all">{campaign.share_token}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Campaign ID:</span>
                      <span className="font-mono text-xs break-all">{campaign.id}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </DashboardLayout>
  );
};

export default CampaignDetails;