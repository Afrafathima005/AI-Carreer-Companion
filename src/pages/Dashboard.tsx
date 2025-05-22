
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Search, 
  FileEdit, 
  BarChart2, 
  Video,
  Award,
  Zap,
  Sparkles,
  TrendingUp,
  AlignLeft
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  completionPercentage?: number;
}

const FeatureCard = ({ title, description, icon, path, completionPercentage }: FeatureCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        {/* {completionPercentage !== undefined && (
          <Progress value={completionPercentage} className="h-1 mb-4" />
        )} */}
        <Link to={path}>
          <Button className="w-full">Try Now</Button>
        </Link>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const features = [
    {
      title: "Resume Builder",
      description: "Create an ATS-optimized resume with AI assistance",
      icon: <FileText size={18} />,
      path: "/app/resume-builder",
      completionPercentage: 25,
    },
    {
      title: "Resume Scanner",
      description: "Check your resume's ATS compatibility and get tips",
      icon: <Search size={18} />,
      path: "/app/resume-scanner",
      completionPercentage: 0,
    },
    {
      title: "Cover Letter Generator",
      description: "Generate tailored cover letters for job applications",
      icon: <FileEdit size={18} />,
      path: "/app/cover-letter",
      completionPercentage: 0,
    },
    {
      title: "Skill Gap Analysis",
      description: "Identify missing skills for your target roles",
      icon: <BarChart2 size={18} />,
      path: "/app/skill-gap",
      completionPercentage: 0,
    },
    {
      title: "Mock Interviews",
      description: "Practice interviews with AI feedback",
      icon: <Video size={18} />,
      path: "/app/mock-interview",
      completionPercentage: 0,
    },
  ];

  const tips = [
    {
      title: "Quantify your achievements",
      description: "Use numbers to highlight your impact, like 'Increased sales by 20%'",
      icon: <TrendingUp size={16} />,
    },
    {
      title: "Tailor your resume",
      description: "Customize your resume for each job application to match key requirements",
      icon: <Sparkles size={16} />,
    },
    {
      title: "Use action verbs",
      description: "Start bullet points with powerful verbs like 'Achieved', 'Led', or 'Implemented'",
      icon: <AlignLeft size={16} />,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{greeting}, {user?.name}</h1>
        <p className="text-muted-foreground">
          Welcome to your SkillBoost dashboard. Let's enhance your career opportunities.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* <Card className="col-span-1 lg:col-span-2 animated-gradient text-white">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <Award size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Get ahead in your job search</h2>
              <p className="opacity-90">Complete your profile to receive personalized job recommendations</p>
              <Button variant="secondary" className="mt-4 bg-white/10 hover:bg-white/20">
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>
         */}
        {/* <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resume Quality
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-2xl font-bold">35%</span>
              <Zap className="text-primary" />
            </div>
            <Progress value={35} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Improve your resume score by adding quantified achievements
            </p>
          </CardContent>
        </Card> */}
        
        {/* <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Skills Match
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-2xl font-bold">3/10</span>
              <BarChart2 className="text-primary" />
            </div>
            <Progress value={30} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Add 7 more relevant skills to match your target roles
            </p>
          </CardContent>
        </Card> */}
      </div>
      
      <h2 className="text-xl font-semibold mt-8">SkllBoost Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            path={feature.path}
            completionPercentage={feature.completionPercentage}
          />
        ))}
      </div>
      
      <h2 className="text-xl font-semibold mt-8">Career Tips</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tips.map((tip, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  {tip.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{tip.title}</h3>
                  <p className="text-muted-foreground text-sm">{tip.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
