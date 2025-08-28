import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Upload, Download, RotateCcw, ZoomIn, ZoomOut, Move, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Page, Container } from "@/components/ui/layout";
import { campaignService, Campaign } from "@/lib/campaigns";
import { toast } from "sonner";

interface PhotoState {
  url: string | null;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

const AttendeePage = () => {
  const { id } = useParams(); // This is the share_token
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  const [photo, setPhoto] = useState<PhotoState>({
    url: null,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch campaign data using share token
  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const { data, error } = await campaignService.getCampaignByShareToken(id!);
      
      if (error) {
        console.error("Error fetching campaign:", error);
        toast.error("Campaign not found");
      } else if (data) {
        setCampaign(data);
        // Initialize photo position at the center of the placeholder
        setPhoto(prev => ({
          ...prev,
          x: 0,
          y: 0
        }));
      }
    } catch (error) {
      console.error("Error fetching campaign:", error);
      toast.error("Failed to load campaign");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhoto(prev => ({ ...prev, url }));
      toast.success("Photo uploaded! Drag and resize to position it.");
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!photo.url) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - photo.x,
      y: e.clientY - photo.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !photo.url) return;
    
    setPhoto(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleScaleChange = (value: number[]) => {
    setPhoto(prev => ({ ...prev, scale: value[0] }));
  };

  const handleRotationChange = (value: number[]) => {
    setPhoto(prev => ({ ...prev, rotation: value[0] }));
  };

  const handleReset = () => {
    setPhoto({
      url: photo.url,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0
    });
  };

  const handleDownload = async () => {
    if (!photo.url || !campaign) {
      toast.error("Please upload a photo first");
      return;
    }

    setIsDownloading(true);
    
    try {
      await generateCompositeImage();
      
      // Increment download count
      await campaignService.incrementDownloads(campaign.id);
      
      toast.success("Poster downloaded successfully!");
    } catch (error) {
      console.error("Error generating poster:", error);
      toast.error("Failed to generate poster");
    } finally {
      setIsDownloading(false);
    }
  };

  const generateCompositeImage = async (): Promise<void> => {
    if (!campaign || !photo.url) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match banner dimensions
    canvas.width = campaign.banner_width;
    canvas.height = campaign.banner_height;

    return new Promise((resolve, reject) => {
      const bannerImg = new Image();
      bannerImg.crossOrigin = 'anonymous';
      
      bannerImg.onload = () => {
        // Draw banner background
        ctx.drawImage(bannerImg, 0, 0, campaign.banner_width, campaign.banner_height);

        const userImg = new Image();
        userImg.onload = () => {
          // Save canvas state
          ctx.save();

          // Calculate actual placeholder position and size
          const placeholderX = campaign.placeholder_x;
          const placeholderY = campaign.placeholder_y;
          const placeholderWidth = campaign.placeholder_width;
          const placeholderHeight = campaign.placeholder_height;

          // Move to placeholder center for transformations
          const centerX = placeholderX + placeholderWidth / 2;
          const centerY = placeholderY + placeholderHeight / 2;
          
          ctx.translate(centerX, centerY);
          ctx.rotate((photo.rotation * Math.PI) / 180);
          ctx.scale(photo.scale, photo.scale);
          ctx.translate(photo.x, photo.y);

          // Create clipping path based on shape
          if (campaign.placeholder_shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, Math.min(placeholderWidth, placeholderHeight) / 2, 0, 2 * Math.PI);
            ctx.clip();
          } else {
            ctx.beginPath();
            ctx.rect(-placeholderWidth / 2, -placeholderHeight / 2, placeholderWidth, placeholderHeight);
            ctx.clip();
          }

          // Draw user image
          ctx.drawImage(
            userImg,
            -placeholderWidth / 2,
            -placeholderHeight / 2,
            placeholderWidth,
            placeholderHeight
          );

          // Restore canvas state
          ctx.restore();

          // Create download link
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${campaign.title.replace(/\s+/g, '_')}_poster.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              resolve();
            } else {
              reject(new Error('Failed to create blob'));
            }
          });
        };

        userImg.onerror = () => reject(new Error('Failed to load user image'));
        userImg.src = photo.url!;
      };

      bannerImg.onerror = () => reject(new Error('Failed to load banner image'));
      bannerImg.src = campaign.banner_url;
    });
  };

  // Loading state
  if (loading) {
    return (
      <Page>
        <Container>
          <div className="py-12 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading campaign...</p>
            </div>
          </div>
        </Container>
      </Page>
    );
  }

  // Campaign not found
  if (!campaign) {
    return (
      <Page>
        <Container>
          <div className="py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
            <p className="text-muted-foreground">
              The campaign you're looking for doesn't exist or has been deactivated.
            </p>
          </div>
        </Container>
      </Page>
    );
  }

  return (
    <Page>
      <Container>
        <div className="py-6 sm:py-8 lg:py-12 space-y-6 sm:space-y-8">
          {/* Hidden canvas for image generation */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {/* Header */}
          <div className="text-center space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold px-4">{campaign.title}</h1>
            {campaign.description && (
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                {campaign.description}
              </p>
            )}
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Upload your photo and position it to create your personalized poster
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Canvas Area */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">Poster Canvas</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    {photo.url ? "Drag your photo to position it on the banner" : "Upload a photo to get started"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div 
                    className="relative bg-muted rounded-lg overflow-hidden cursor-move touch-manipulation"
                    style={{ 
                      aspectRatio: `${campaign.banner_width}/${campaign.banner_height}`, 
                      minHeight: "280px",
                      maxHeight: "70vh"
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {/* Banner Background */}
                    <img 
                      src={campaign.banner_url} 
                      alt="Banner background"
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                    
                    {/* Placeholder Area */}
                    <div
                      className={`absolute border-2 border-dashed border-primary/50 bg-primary/10 ${
                        campaign.placeholder_shape === 'circle' ? 'rounded-full' : 'rounded-lg'
                      }`}
                      style={{
                        left: `${(campaign.placeholder_x / campaign.banner_width) * 100}%`,
                        top: `${(campaign.placeholder_y / campaign.banner_height) * 100}%`,
                        width: `${(campaign.placeholder_width / campaign.banner_width) * 100}%`,
                        height: `${(campaign.placeholder_height / campaign.banner_height) * 100}%`,
                      }}
                    >
                      {!photo.url && (
                        <div className="w-full h-full flex items-center justify-center text-xs text-primary font-medium">
                          Your photo will appear here
                        </div>
                      )}
                    </div>
                    
                    {/* User Photo */}
                    {photo.url && (
                      <div
                        className={`absolute cursor-move overflow-hidden ${
                          campaign.placeholder_shape === 'circle' ? 'rounded-full' : 'rounded-lg'
                        }`}
                        style={{
                          left: `${(campaign.placeholder_x / campaign.banner_width) * 100}%`,
                          top: `${(campaign.placeholder_y / campaign.banner_height) * 100}%`,
                          width: `${(campaign.placeholder_width / campaign.banner_width) * 100}%`,
                          height: `${(campaign.placeholder_height / campaign.banner_height) * 100}%`,
                        }}
                        onMouseDown={handleMouseDown}
                      >
                        <img
                          src={photo.url}
                          alt="Your photo"
                          className="w-full h-full object-cover border-2 border-primary shadow-lg"
                          style={{
                            transform: `translate(${photo.x}px, ${photo.y}px) scale(${photo.scale}) rotate(${photo.rotation}deg)`,
                            transformOrigin: "center"
                          }}
                          draggable={false}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
              {/* Upload */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">Upload Photo</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Choose your photo to add to the poster
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <input
                    type="file"
                    accept="image/*" 
                    onChange={handlePhotoUpload}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    className="w-full h-12 sm:h-10 text-base sm:text-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-5 w-5 sm:h-4 sm:w-4" />
                    {photo.url ? "Change Photo" : "Upload Photo"}
                  </Button>
                  {photo.url && (
                    <div className="mt-4">
                      <img 
                        src={photo.url} 
                        alt="Uploaded photo"
                        className="w-full h-24 sm:h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Controls */}
              {photo.url && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl">Adjust Photo</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Position and resize your photo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                    <div className="space-y-3">
                      <Label>Scale</Label>
                      <div className="flex items-center gap-3">
                        <ZoomOut className="h-4 w-4" />
                        <Slider
                          value={[photo.scale]}
                          onValueChange={handleScaleChange}
                          min={0.5}
                          max={2}
                          step={0.1}
                          className="flex-1"
                        />
                        <ZoomIn className="h-4 w-4" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Scale: {photo.scale.toFixed(1)}x
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label>Rotation</Label>
                      <div className="flex items-center gap-3">
                        <RotateCcw className="h-4 w-4" />
                        <Slider
                          value={[photo.rotation]}
                          onValueChange={handleRotationChange}
                          min={-180}
                          max={180}
                          step={5}
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Rotation: {photo.rotation}°
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Move className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">
                        Drag photo to reposition
                      </span>
                    </div>

                    <Button variant="outline" onClick={handleReset} className="w-full h-12 sm:h-10 text-base sm:text-sm">
                      Reset Position
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Download */}
              <Card className="sticky top-20 lg:relative lg:top-auto">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">Download</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Get your personalized poster
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <Button 
                    variant="hero" 
                    className="w-full h-12 sm:h-10 text-base sm:text-sm" 
                    onClick={handleDownload}
                    disabled={!photo.url || isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
                        Generating Poster...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-5 w-5 sm:h-4 sm:w-4" />
                        Download Poster
                      </>
                    )}
                  </Button>
                  {!photo.url && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center">
                      Upload a photo to enable download
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </Page>
  );
};

export default AttendeePage;