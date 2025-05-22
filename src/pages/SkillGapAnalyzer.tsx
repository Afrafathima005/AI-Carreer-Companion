
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  BarChart2,
  Upload,
  RefreshCw,
  School,
  Award,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Search
} from "lucide-react";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAIAssistant } from "@/hooks/useAIAssistant";

interface Skill {
  name: string;
  level: number;
  gap: number;
  required: boolean;
}

interface Course {
  title: string;
  provider: string;
  url: string;
  duration: string;
  level: string;
  skills: string[];
}

interface Analysis {
  matchPercentage: number;
  strongSkills: Skill[];
  missingSkills: Skill[];
  partialSkills: Skill[];
  recommendations: Course[];
}

const SkillGapAnalyzer = () => {
  const { isLoading, analyzeSkillGap } = useAIAssistant();
  
  const [resume, setResume] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // In a real app, this would parse the resume content
      // Here we'll try to read text content if possible
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setResume(content || "Resume content extracted from file.");
        toast.success("Resume uploaded and parsed successfully!");
      };
      
      if (selectedFile.type === "text/plain") {
        reader.readAsText(selectedFile);
      } else {
        // For other formats, we'd need more sophisticated parsing
        // Just showing a placeholder for demonstration
        setTimeout(() => {
          setResume("Resume content extracted from file.");
          toast.success("Resume uploaded and parsed successfully!");
        }, 500);
      }
    }
  };
  
  const analyzeSkills = async () => {
    if (!jobTitle || !jobDescription || (!resume && !file)) {
      toast.error("Please enter a job title, job description, and your resume content.");
      return;
    }
    
    try {
      const result = await analyzeSkillGap({
        resume,
        jobTitle,
        jobDescription
      });
      
      if (result) {
        // Format the response into our Analysis structure
        const formattedAnalysis: Analysis = {
          matchPercentage: result.matchPercentage || 0,
          strongSkills: Array.isArray(result.strongSkills) 
            ? result.strongSkills.map((skill: any) => ({
                name: typeof skill === 'string' ? skill : skill.name || '',
                level: (skill && typeof skill === 'object' && skill.level) || 100,
                gap: 0,
                required: (skill && typeof skill === 'object' && skill.required) || false
              }))
            : [],
          missingSkills: Array.isArray(result.missingSkills)
            ? result.missingSkills.map((skill: any) => ({
                name: typeof skill === 'string' ? skill : skill.skill || skill.name || '',
                level: 0,
                gap: (skill && typeof skill === 'object' && (skill.requiredLevel || skill.gap || 50)) || 50,
                required: (skill && typeof skill === 'object' && skill.required) || false
              }))
            : [],
          partialSkills: Array.isArray(result.partialSkills)
            ? result.partialSkills.map((skill: any) => ({
                name: typeof skill === 'string' ? skill : skill.skill || skill.name || '',
                level: (skill && typeof skill === 'object' && skill.currentLevel) || 0,
                gap: (skill && typeof skill === 'object' && skill.gapSize) || 0,
                required: (skill && typeof skill === 'object' && skill.required) || false
              }))
            : [],
          recommendations: Array.isArray(result.recommendations)
            ? result.recommendations.map((course: any) => ({
                title: course.title || course.course || "",
                provider: course.provider || course.platform || "",
                url: course.url || "#",
                duration: course.duration || "Self-paced",
                level: course.level || "Intermediate",
                skills: Array.isArray(course.skills) ? course.skills : []
              }))
            : []
        };
        
        setAnalysis(formattedAnalysis);
        toast.success("Skill gap analysis completed!");
      } else {
        toast.error("Failed to analyze skills. Please try again.");
      }
    } catch (error) {
      console.error("Error analyzing skills:", error);
      toast.error("An error occurred during skill analysis.");
    }
  };
  
  const resetAnalysis = () => {
    setResume("");
    setJobTitle("");
    setJobDescription("");
    setFile(null);
    setAnalysis(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Skill Gap Analyzer</h1>
        <p className="text-muted-foreground">
          Compare your skills with job requirements to identify areas for growth
        </p>
      </div>
      
      {!analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="text-primary" size={18} />
                Your Resume
              </CardTitle>
              <CardDescription>Upload your resume or paste the content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {file ? (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                      <Upload className="text-primary" size={20} />
                    </div>
                    <div className="truncate">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setResume("");
                    }}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 h-32">
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <Label
                      htmlFor="resume-upload"
                      className="block cursor-pointer text-primary font-medium"
                    >
                      Upload Resume
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF or Word (.doc, .docx)
                    </p>
                    <Input
                      id="resume-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
              )}
              
              <div className="text-center my-2">
                <span className="text-sm text-muted-foreground">Or paste your resume content</span>
              </div>
              
              <Textarea 
                placeholder="Paste your resume content here..." 
                className="min-h-[200px]"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="text-primary" size={18} />
                Job Details
              </CardTitle>
              <CardDescription>Enter information about your target role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jobTitle">
                  Job Title <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="jobTitle" 
                  placeholder="e.g., Frontend Developer" 
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="jobDescription">
                  Job Description <span className="text-destructive">*</span>
                </Label>
                <Textarea 
                  id="jobDescription" 
                  placeholder="Paste the job description here..." 
                  className="min-h-[250px]"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Include the full job description for the best analysis.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={analyzeSkills}
                disabled={isLoading || (!resume && !file) || !jobTitle || !jobDescription}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Analyze Skill Gap
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="text-primary" />
                  Skill Gap Analysis Results
                </CardTitle>
                <Button variant="outline" onClick={resetAnalysis}>
                  Start New Analysis
                </Button>
              </div>
              <CardDescription>
                Overall skill match for {jobTitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-40 h-40 relative">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle 
                      className="text-muted stroke-current" 
                      strokeWidth="10" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="40" 
                      cx="50" 
                      cy="50" 
                    />
                    <circle 
                      className="text-primary stroke-current" 
                      strokeWidth="10" 
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="40" 
                      cx="50" 
                      cy="50" 
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - analysis.matchPercentage / 100)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">{analysis.matchPercentage}%</span>
                    <span className="text-sm text-muted-foreground">match</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="rounded-full bg-green-500/20 p-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <h3 className="font-medium text-lg">Strong Skills</h3>
                  </div>
                  <ul className="space-y-3">
                    {analysis.strongSkills && analysis.strongSkills.length > 0 ? (
                      analysis.strongSkills.map((skill, index) => (
                        <li key={index} className="flex flex-col gap-1">
                          <div className="flex justify-between">
                            <span className="font-medium">{skill.name}</span>
                            <span>{skill.level}%</span>
                          </div>
                          <Progress value={skill.level} className="h-2" />
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground">No strong skills identified</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="rounded-full bg-amber-500/20 p-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </div>
                    <h3 className="font-medium text-lg">Skills to Improve</h3>
                  </div>
                  <ul className="space-y-3">
                    {analysis.partialSkills && analysis.partialSkills.length > 0 ? (
                      analysis.partialSkills.map((skill, index) => (
                        <li key={index} className="flex flex-col gap-1">
                          <div className="flex justify-between">
                            <span className="font-medium">{skill.name}</span>
                            <div className="flex gap-1 items-center">
                              <span className="text-muted-foreground">{skill.level}%</span>
                              <span className="text-xs text-amber-500">+{skill.gap}%</span>
                            </div>
                          </div>
                          <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="absolute top-0 left-0 h-full bg-amber-500/70 rounded-full" 
                              style={{ width: `${skill.level}%` }}
                            ></div>
                            <div 
                              className="absolute top-0 h-full bg-amber-500/30 rounded-full" 
                              style={{ left: `${skill.level}%`, width: `${skill.gap}%` }}
                            ></div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground">No skills to improve identified</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="rounded-full bg-destructive/20 p-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <h3 className="font-medium text-lg">Missing Skills</h3>
                  </div>
                  <ul className="space-y-3">
                    {analysis.missingSkills && analysis.missingSkills.length > 0 ? (
                      analysis.missingSkills.map((skill, index) => (
                        <li key={index} className="flex flex-col gap-1">
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {skill.name}
                              {skill.required && (
                                <span className="text-xs ml-2 text-destructive">Required</span>
                              )}
                            </span>
                            <span className="text-xs text-destructive">+{skill.gap}%</span>
                          </div>
                          <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="absolute top-0 h-full bg-destructive/30 rounded-full" 
                              style={{ width: `${skill.gap}%` }}
                            ></div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground">No missing skills identified</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="text-primary" />
                Recommended Courses
              </CardTitle>
              <CardDescription>
                Courses to help you close the skill gap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {analysis.recommendations && analysis.recommendations.length > 0 ? (
                  analysis.recommendations.map((course, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">{course.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {course.provider} • {course.duration}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 pb-2">
                        <div className="flex flex-wrap gap-2">
                          {course.skills && course.skills.length > 0 ? (
                            course.skills.map((skill, idx) => (
                              <div 
                                key={idx} 
                                className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                              >
                                {skill}
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-muted-foreground">No specific skills listed</div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-2 flex justify-between items-center">
                        <div className="text-xs bg-secondary px-2 py-1 rounded">
                          {course.level}
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">
                          View Course <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    No course recommendations available
                  </div>
                )}
              </div>
            </CardContent>
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <CardFooter className="flex justify-center">
                <Button variant="outline">
                  View More Recommendations <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default SkillGapAnalyzer;
