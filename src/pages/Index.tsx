import { Link } from "react-router-dom";
import { ArrowRight, Upload, Settings, Share2, Star, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header, Footer } from "@/components/ui/navigation";
import { Container, Page, Section } from "@/components/ui/layout";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const { user } = useAuth();

  return (
    <Page>
      <Header />
      
      {/* Hero Section */}
      <Section variant="gradient" className="pt-16 sm:pt-20 pb-20 sm:pb-32">
        <Container>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
                  Create{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Personalized
                  </span>{" "}
                  Posters Together
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
                  Upload your banner design, set placeholders for photos, and let others create 
                  personalized versions with their own images. Perfect for events, teams, and communities.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                {user ? (
                  <Button variant="hero" size="lg" className="w-full sm:w-auto" asChild>
                    <Link to="/dashboard/create">
                      Create New Campaign
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="hero" size="lg" className="w-full sm:w-auto" asChild>
                      <Link to="/signup">
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                      <Link to="/login">Sign In</Link>
                    </Button>
                  </>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Unlimited collaborators</span>
                  <span className="sm:hidden">Unlimited users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span>Instant sharing</span>
                </div>
              </div>
            </div>
            
            <div className="relative order-first lg:order-last">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full"></div>
              <img 
                src={heroImage} 
                alt="PosterForge hero showcase" 
                className="relative rounded-2xl shadow-2xl border border-border w-full h-auto"
              />
            </div>
          </div>
        </Container>
      </Section>
      
      {/* How It Works */}
      <Section>
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Three Simple Steps
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create collaborative posters in minutes, not hours
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-smooth">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-primary flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Upload Your Banner</h3>
                <p className="text-muted-foreground">
                  Start by uploading your poster or banner design. Any image format works perfectly.
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden group hover:shadow-lg transition-smooth">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-primary flex items-center justify-center">
                  <Settings className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Set Photo Placeholder</h3>
                <p className="text-muted-foreground">
                  Define where and how user photos should appear on your banner with our intuitive editor.
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden group hover:shadow-lg transition-smooth">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-primary flex items-center justify-center">
                  <Share2 className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Share & Collaborate</h3>
                <p className="text-muted-foreground">
                  Share your campaign link and let others create personalized versions with their photos.
                </p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>
      
      {/* Features */}
      <Section variant="surface">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features to make poster creation effortless
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Drag & Drop Upload",
                description: "Easy file uploads with preview and validation"
              },
              {
                title: "Smart Positioning",
                description: "Intuitive tools to position and resize photo placeholders"
              },
              {
                title: "Instant Preview",
                description: "See exactly how your poster will look in real-time"
              },
              {
                title: "Mobile Responsive",
                description: "Works perfectly on desktop, tablet, and mobile devices"
              },
              {
                title: "Download Ready",
                description: "High-quality downloads ready for printing or sharing"
              },
              {
                title: "Campaign Analytics",
                description: "Track views, downloads, and engagement metrics"
              }
            ].map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-md transition-smooth">
                <CardContent className="p-0">
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
      
      {/* CTA Section */}
      <Section>
        <Container>
          <div className="text-center bg-gradient-surface rounded-2xl lg:rounded-3xl p-8 sm:p-12 lg:p-16 border border-border">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join thousands of creators making beautiful collaborative posters
            </p>
            {user ? (
              <Button variant="hero" size="xl" className="w-full sm:w-auto" asChild>
                <Link to="/dashboard/create">
                  Create Your First Campaign
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button variant="hero" size="xl" className="w-full sm:w-auto" asChild>
                <Link to="/signup">
                  Create Your First Campaign
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </Container>
      </Section>
      
      <Footer />
    </Page>
  );
};

export default Index;