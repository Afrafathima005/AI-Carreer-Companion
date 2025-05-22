
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  CheckCircle,
  FileEdit,
  Search,
  BarChart2,
  Video,
  ExternalLink,
  Award,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      navigate("/app");
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (authMode === "signin") {
        await signIn(email, password);
        navigate("/app");
      } else {
        await signUp(email, password, name);
        navigate("/app");
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("demo@skillboost.com", "password");
      navigate("/app");
    } catch (error) {
      console.error("Demo login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      {/* Navigation */}
      {/* <nav className="border-b border-border/40 backdrop-blur-lg bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white text-lg font-bold">SB</span>
            </div>
            <span className="font-bold text-xl">SkillBoost</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setAuthMode("signin")}
              className="hidden md:inline-flex"
            >
              Log in
            </Button>
            <Button 
              onClick={() => setAuthMode("signup")}
              className="hidden md:inline-flex"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDemoLogin}
              className="md:hidden"
            >
              Try Demo
            </Button>
          </div>
        </div>
      </nav> */}

      {/* Hero section */}
      <section className="py-16 md:py-24 container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
  <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
    AI-Powered Career Companion 
  </div>

  <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight animate-fade-in-up">
    <span className="text-primary">
      Boost Your Career With AI
    </span>
  </h1>

  <p className="text-xl text-muted-foreground max-w-2xl">
    The intelligent career platform that helps you build stunning resumes, ace interviews, and land your dream job with AI assistance.
  </p>

  <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
    <Button size="lg" className="gap-2" onClick={handleDemoLogin}>
      Get Started <Zap size={18} />
    </Button>
    {/* <Button size="lg" variant="outline" onClick={handleDemoLogin}>
      Try Demo
    </Button> */}
  </div>
</div>

{/*           
          <div className="flex-1">
            <div className="relative">
              <div className="w-full h-full absolute -top-4 -left-4 rounded-xl bg-primary/20 blur-xl"></div>
              <Card className="w-full overflow-hidden border-primary/20 glass-card">
                {authMode === "signin" ? (
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Sign in</CardTitle>
                    <CardDescription>
                      Enter your email below to sign in to your account
                    </CardDescription>
                  </CardHeader>
                ) : (
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Create an account</CardTitle>
                    <CardDescription>
                      Enter your information below to create your account
                    </CardDescription>
                  </CardHeader>
                )}

                <CardContent>
                  <form className="space-y-4" onSubmit={handleAuth}>
                    <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as "signin" | "signup")}>
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="signin">Sign In</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                      </TabsList>
                      <TabsContent value="signin" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="m@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input 
                            id="password" 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="signup" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input 
                            id="name" 
                            placeholder="John Doe" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="m@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input 
                            id="password" 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Processing..." : authMode === "signin" ? "Sign In" : "Sign Up"}
                    </Button>
                    
                    <div className="text-center text-sm">
                      <span className="text-muted-foreground">
                        {authMode === "signin" ? "Don't have an account? " : "Already have an account? "}
                      </span>
                      <Button 
                        variant="link" 
                        className="p-0" 
                        onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
                      >
                        {authMode === "signin" ? "Sign up" : "Sign in"}
                      </Button>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleDemoLogin}
                      type="button"
                    >
                      Try Demo Account
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div> */}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4  text-muted-foreground max-w-2xl mx-auto">Everything You Need For Your Career</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered tools help you prepare, apply, and succeed in your career journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FileText />} 
              title="AI Resume Builder"
              description="Create ATS-friendly resumes with AI-generated content optimized for your target roles."
            />
            <FeatureCard 
              icon={<Search />} 
              title="Resume Scanner"
              description="Check your resume against ATS systems and get actionable improvement tips."
            />
            <FeatureCard 
              icon={<FileEdit />} 
              title="Cover Letter Generator"
              description="Generate tailored cover letters for specific job descriptions in seconds."
            />
            <FeatureCard 
              icon={<BarChart2 />} 
              title="Skill Gap Analysis"
              description="Identify missing skills and get personalized recommendations to improve."
            />
            <FeatureCard 
              icon={<Video />} 
              title="AI Mock Interviews"
              description="Practice interviews with AI feedback on your delivery, content and confidence."
            />
            <FeatureCard 
              icon={<Award />} 
              title="Personalized Guidance"
              description="Get customized career advice and job recommendations based on your profile."
            />
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Accelerate Your Career?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 opacity-90">
            Join thousands of professionals who use SkillBoost to land their dream jobs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="gap-2"
              onClick={() => setAuthMode("signup")}
            >
              Get Started <ExternalLink size={18} />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleDemoLogin}
              className="bg-transparent border-white hover:bg-white/10"
            >
              Try Demo Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white text-lg font-bold">SB</span>
              </div>
              <span className="font-bold text-xl">SkillBoost</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 SkillBoost. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => {
  return (
    <Card className="glass-card hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default LandingPage;
