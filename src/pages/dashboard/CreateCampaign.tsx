import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Image as ImageIcon, Save, ArrowLeft, Circle, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/ui/dashboard-sidebar";
import { Container } from "@/components/ui/layout";
import { toast } from "sonner";
import { campaignService, storageService, CreateCampaignData } from "@/lib/campaigns";
import { useAuth } from "@/contexts/AuthContext";

interface ImageDimensions {
  width: number;
  height: number;
}

interface PlaceholderBox {
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'rectangle' | 'circle';
}

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    bannerFile: null as File | null
  });
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const [placeholderBox, setPlaceholderBox] = useState<PlaceholderBox>({
    x: 100,
    y: 100,
    width: 200,
    height: 200,
    shape: 'rectangle'
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Get image dimensions when image loads
  const handleImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setImageDimensions({ width: naturalWidth, height: naturalHeight });
      
      // Reset placeholder to center with reasonable size
      const centerX = Math.max(50, naturalWidth / 2 - 100);
      const centerY = Math.max(50, naturalHeight / 2 - 100);
      setPlaceholderBox(prev => ({
        ...prev,
        x: centerX,
        y: centerY,
        width: Math.min(200, naturalWidth * 0.3),
        height: Math.min(200, naturalHeight * 0.3)
      }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!previewRef.current || !imageDimensions) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const scaleX = imageDimensions.width / rect.width;
    const scaleY = imageDimensions.height / rect.height;
    
    const offsetX = e.clientX - rect.left - (placeholderBox.x / scaleX);
    const offsetY = e.clientY - rect.top - (placeholderBox.y / scaleY);
    
    setIsDragging(true);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !previewRef.current || !imageDimensions) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const scaleX = imageDimensions.width / rect.width;
    const scaleY = imageDimensions.height / rect.height;
    
    const newX = (e.clientX - rect.left - dragOffset.x) * scaleX;
    const newY = (e.clientY - rect.top - dragOffset.y) * scaleY;
    
    // Constrain to bounds
    const constrainedX = Math.max(0, Math.min(imageDimensions.width - placeholderBox.width, newX));
    const constrainedY = Math.max(0, Math.min(imageDimensions.height - placeholderBox.height, newY));
    
    setPlaceholderBox(prev => ({
      ...prev,
      x: Math.round(constrainedX),
      y: Math.round(constrainedY)
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      
      setFormData(prev => ({ ...prev, bannerFile: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Reset dimensions and placeholder
      setImageDimensions(null);
      setPlaceholderBox({
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        shape: 'rectangle'
      });
    }
  };

  const handleShapeChange = (shape: 'rectangle' | 'circle') => {
    setPlaceholderBox(prev => ({ ...prev, shape }));
  };

  const resetPlaceholder = () => {
    if (imageDimensions) {
      const centerX = Math.max(50, imageDimensions.width / 2 - 100);
      const centerY = Math.max(50, imageDimensions.height / 2 - 100);
      setPlaceholderBox(prev => ({
        ...prev,
        x: centerX,
        y: centerY,
        width: Math.min(200, imageDimensions.width * 0.3),
        height: Math.min(200, imageDimensions.height * 0.3)
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.bannerFile || !imageDimensions) {
      toast.error("Please fill in all required fields and upload a banner");
      return;
    }



    setLoading(true);

    try {
      // First, create a temporary campaign ID for file naming
      const tempId = crypto.randomUUID();
      
      // Upload banner to storage
      const { data: bannerUrl, error: uploadError } = await storageService.uploadBanner(formData.bannerFile, tempId);
      
      if (uploadError || !bannerUrl) {
        toast.error("Failed to upload banner image");
        return;
      }

      // Create campaign data
      const campaignData: CreateCampaignData = {
        title: formData.title,
        description: formData.description,
        banner_url: bannerUrl,
        banner_width: imageDimensions.width,
        banner_height: imageDimensions.height,
        placeholder_x: placeholderBox.x,
        placeholder_y: placeholderBox.y,
        placeholder_width: placeholderBox.width,
        placeholder_height: placeholderBox.height,
        placeholder_shape: placeholderBox.shape,
        status: 'active' // Set campaign as active immediately
      };

      // Create campaign in database
      const { data: campaign, error: createError } = await campaignService.createCampaign(campaignData);
      
      if (createError || !campaign) {
        // If campaign creation fails, delete the uploaded file
        await storageService.deleteBanner(bannerUrl);
        toast.error("Failed to create campaign");
        return;
      }

      toast.success("Campaign created successfully!");
      navigate("/dashboard/campaigns");
      
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Calculate preview dimensions
  const getPreviewStyle = () => {
    if (!imageDimensions) return { aspectRatio: "16/9" };
    
    const maxWidth = 600;
    const maxHeight = 400;
    const ratio = imageDimensions.width / imageDimensions.height;
    
    let width = maxWidth;
    let height = width / ratio;
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * ratio;
    }
    
    return {
      width: `${width}px`,
      height: `${height}px`,
      maxWidth: '100%'
    };
  };

  // Calculate placeholder position in preview
  const getPlaceholderStyle = () => {
    if (!imageDimensions || !previewRef.current) return {};
    
    const rect = previewRef.current.getBoundingClientRect();
    const scaleX = rect.width / imageDimensions.width;
    const scaleY = rect.height / imageDimensions.height;
    
    return {
      left: `${placeholderBox.x * scaleX}px`,
      top: `${placeholderBox.y * scaleY}px`,
      width: `${placeholderBox.width * scaleX}px`,
      height: `${placeholderBox.height * scaleY}px`,
      borderRadius: placeholderBox.shape === 'circle' ? '50%' : '0'
    };
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <Container>
          <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Create New Campaign</h1>
                <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
                  Upload your banner and set up photo placeholders
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Form */}
              <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Details</CardTitle>
                    <CardDescription>
                      Basic information about your campaign
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Campaign Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter campaign title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          title: e.target.value 
                        }))}
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your campaign"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          description: e.target.value 
                        }))}
                        disabled={loading}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upload Banner</CardTitle>
                    <CardDescription>
                      Choose the background image for your campaign
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="banner-upload"
                        disabled={loading}
                      />
                      <label htmlFor="banner-upload" className="cursor-pointer">
                        <div className="space-y-4">
                          <div className="w-16 h-16 mx-auto rounded-lg bg-muted flex items-center justify-center">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">Click to upload banner</p>
                            <p className="text-sm text-muted-foreground">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                    {formData.bannerFile && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">Selected: {formData.bannerFile.name}</p>
                        {imageDimensions && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Dimensions: {imageDimensions.width} × {imageDimensions.height}px
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Photo Placeholder Settings</CardTitle>
                    <CardDescription>
                      Configure where user photos will appear
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Shape Selection */}
                    <div className="space-y-2">
                      <Label>Photo Shape</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={placeholderBox.shape === 'rectangle' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleShapeChange('rectangle')}
                          disabled={loading}
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Rectangle
                        </Button>
                        <Button
                          type="button"
                          variant={placeholderBox.shape === 'circle' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleShapeChange('circle')}
                          disabled={loading}
                        >
                          <Circle className="h-4 w-4 mr-2" />
                          Circle
                        </Button>
                      </div>
                    </div>

                    {/* Position Controls */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>X Position</Label>
                        <Input
                          type="number"
                          value={placeholderBox.x}
                          onChange={(e) => setPlaceholderBox(prev => ({
                            ...prev,
                            x: parseInt(e.target.value) || 0
                          }))}
                          disabled={loading}
                          min={0}
                          max={imageDimensions ? imageDimensions.width - placeholderBox.width : 0}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Y Position</Label>
                        <Input
                          type="number"
                          value={placeholderBox.y}
                          onChange={(e) => setPlaceholderBox(prev => ({
                            ...prev,
                            y: parseInt(e.target.value) || 0
                          }))}
                          disabled={loading}
                          min={0}
                          max={imageDimensions ? imageDimensions.height - placeholderBox.height : 0}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Width</Label>
                        <Input
                          type="number"
                          value={placeholderBox.width}
                          onChange={(e) => setPlaceholderBox(prev => ({
                            ...prev,
                            width: parseInt(e.target.value) || 0
                          }))}
                          disabled={loading}
                          min={50}
                          max={imageDimensions ? imageDimensions.width : 1000}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Height</Label>
                        <Input
                          type="number"
                          value={placeholderBox.height}
                          onChange={(e) => setPlaceholderBox(prev => ({
                            ...prev,
                            height: parseInt(e.target.value) || 0
                          }))}
                          disabled={loading}
                          min={50}
                          max={imageDimensions ? imageDimensions.height : 1000}
                        />
                      </div>
                    </div>

                    {/* Scaling Controls */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Scale Placeholder</Label>
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const scale = 0.8;
                              setPlaceholderBox(prev => ({
                                ...prev,
                                width: Math.max(50, Math.round(prev.width * scale)),
                                height: Math.max(50, Math.round(prev.height * scale))
                              }));
                            }}
                            disabled={loading || !imageDimensions}
                          >
                            Scale Down (0.8x)
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const scale = 1.2;
                              setPlaceholderBox(prev => ({
                                ...prev,
                                width: Math.min(imageDimensions?.width || 1000, Math.round(prev.width * scale)),
                                height: Math.min(imageDimensions?.height || 1000, Math.round(prev.height * scale))
                              }));
                            }}
                            disabled={loading || !imageDimensions}
                          >
                            Scale Up (1.2x)
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Quick Sizes</Label>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (imageDimensions) {
                                const size = Math.min(imageDimensions.width, imageDimensions.height) * 0.2;
                                setPlaceholderBox(prev => ({
                                  ...prev,
                                  width: Math.round(size),
                                  height: Math.round(size)
                                }));
                              }
                            }}
                            disabled={loading || !imageDimensions}
                          >
                            Small (20%)
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (imageDimensions) {
                                const size = Math.min(imageDimensions.width, imageDimensions.height) * 0.4;
                                setPlaceholderBox(prev => ({
                                  ...prev,
                                  width: Math.round(size),
                                  height: Math.round(size)
                                }));
                              }
                            }}
                            disabled={loading || !imageDimensions}
                          >
                            Medium (40%)
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (imageDimensions) {
                                const size = Math.min(imageDimensions.width, imageDimensions.height) * 0.6;
                                setPlaceholderBox(prev => ({
                                  ...prev,
                                  width: Math.round(size),
                                  height: Math.round(size)
                                }));
                              }
                            }}
                            disabled={loading || !imageDimensions}
                          >
                            Large (60%)
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetPlaceholder}
                      disabled={loading || !imageDimensions}
                      className="w-full"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset to Center
                    </Button>
                  </CardContent>
                </Card>

                <Button 
                  onClick={handleSave} 
                  size="lg" 
                  variant="hero" 
                  className="w-full"
                  disabled={loading || !formData.title || !formData.bannerFile || !imageDimensions}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Creating Campaign..." : "Save Campaign"}
                </Button>
              </div>

              {/* Preview */}
              <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl">Preview</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      See how your banner will look with placeholders
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div 
                      ref={previewRef}
                      className="relative bg-muted rounded-lg overflow-hidden mx-auto" 
                      style={getPreviewStyle()}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      {previewUrl ? (
                        <img 
                          ref={imageRef}
                          src={previewUrl} 
                          alt="Banner preview" 
                          className="w-full h-full object-contain"
                          onLoad={handleImageLoad}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Upload a banner to see preview</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Placeholder Box Overlay */}
                      {previewUrl && imageDimensions && (
                        <div
                          className={`absolute border-2 border-dashed border-primary bg-primary/20 cursor-move ${
                            isDragging ? 'cursor-grabbing' : 'cursor-grab'
                          }`}
                          style={getPlaceholderStyle()}
                          onMouseDown={handleMouseDown}
                        >
                          <div className="w-full h-full flex items-center justify-center text-xs text-primary font-medium">
                            Photo Placeholder
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Image Info */}
                    {imageDimensions && (
                      <div className="mt-4 p-3 bg-muted rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">
                          Original: {imageDimensions.width} × {imageDimensions.height}px
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Drag the placeholder box to position it, or use the controls above
                        </p>
                      </div>
                    )}
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

export default CreateCampaign;