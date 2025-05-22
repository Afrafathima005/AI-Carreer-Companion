
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Search,
  CheckCircle,
  AlertCircle,
  File,
  Sparkles,
  RefreshCw,
  ClipboardCheck
} from "lucide-react";
import { toast } from "sonner";
import { useAIAssistant } from "@/hooks/useAIAssistant";

interface ScanResult {
  overallScore: number;
  atsCompatibility: number;
  keywordMatch: number;
  formattingScore: number;
  contentScore: number;
  improvedContent?: string;
  keywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  errors?: string[];
}

const ResumeScannerPage = () => {
  const { isLoading, analyzeResume } = useAIAssistant();
  
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [scanResults, setScanResults] = useState<ScanResult | null>(null);
  const [step, setStep] = useState<"upload" | "job" | "results">("upload");
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      if (selectedFile.type === "application/pdf" || 
          selectedFile.type === "application/msword" ||
          selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          selectedFile.type === "text/plain") {
        setFile(selectedFile);
        
        // Read text content from file
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const text = e.target?.result as string;
            // For simple text files
            setResumeText(text);
            toast.success("Resume uploaded successfully!");
            setStep("job");
          } catch (error) {
            console.error("Error parsing file:", error);
            toast.error("Could not extract text from the file. Please paste the content manually.");
          }
        };
        
        if (selectedFile.type === "text/plain") {
          reader.readAsText(selectedFile);
        } else {
          // For PDF/Word, we'd need server-side processing
          // Here we just show a message asking to paste content
          setFile(selectedFile);
          toast.info("For PDF and Word files, please paste the content in the text area for best results.");
          setStep("job");
        }
      } else {
        toast.error("Please upload a PDF, Word document, or text file.");
      }
    }
  };
  
  const handleScan = async () => {
    if ((!resumeText && !file) || !jobDescription) {
      toast.error("Please provide both your resume content and the job description.");
      return;
    }
    
    try {
      const result = await analyzeResume({ 
        resume: resumeText, 
        jobDescription 
      });
      
      if (result) {
        // Transform API response to our ScanResult format
        const scanResult: ScanResult = {
          overallScore: result.overallScore || 0,
          atsCompatibility: result.atsCompatibility || 0,
          keywordMatch: result.keywordMatch || 0,
          formattingScore: result.formattingScore || 0,
          contentScore: result.contentScore || 0,
          keywords: result.keywords || [],
          missingKeywords: result.missingKeywords || [],
          suggestions: result.suggestions || [],
          errors: result.errors || [],
        };
        
        setScanResults(scanResult);
        setStep("results");
        toast.success("Resume scan completed!");
      } else {
        toast.error("Failed to analyze resume. Please try again.");
      }
    } catch (error) {
      console.error("Error scanning resume:", error);
      toast.error("An error occurred while analyzing your resume.");
    }
  };
  
  const handleOptimizeResume = () => {
    toast.success("Resume optimization suggestions generated!");
    
    // Add improved content to results
    setScanResults(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        improvedContent: `# ${resumeText.split('\n')[0] || 'PROFESSIONAL RESUME'}

## PROFESSIONAL SUMMARY
Experienced professional with a proven track record in delivering results. Strong expertise in key industry tools and methodologies with a focus on creating value and driving success.

## EXPERIENCE
### SENIOR POSITION | COMPANY NAME | 2021-PRESENT
• Led cross-functional initiatives that improved organizational efficiency by 30%
• Managed complex projects delivering measurable business outcomes
• Implemented innovative solutions to address longstanding challenges
• Mentored junior team members, fostering professional development

### PREVIOUS ROLE | COMPANY NAME | 2018-2021
• Successfully executed strategic initiatives aligned with business objectives
• Collaborated with stakeholders to define requirements and deliver solutions
• Optimized processes resulting in significant time and resource savings
• Recognized for outstanding contributions to team success`
      };
    });
  };
  
  const resetScan = () => {
    setFile(null);
    setResumeText("");
    setJobDescription("");
    setScanResults(null);
    setStep("upload");
  };
  
  const copyToClipboard = () => {
    if (scanResults?.improvedContent) {
      navigator.clipboard.writeText(scanResults.improvedContent);
      toast.success("Optimized content copied to clipboard!");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resume Scanner</h1>
        <p className="text-muted-foreground">
          Check your resume's ATS compatibility and get suggestions for improvement
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel - Upload & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="text-primary" />
                Resume Upload
              </CardTitle>
              <CardDescription>
                Upload your resume to analyze its ATS compatibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              {file ? (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                      <File className="text-primary" size={20} />
                    </div>
                    <div className="truncate">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="icon" onClick={resetScan}>
                    <RefreshCw className="h-4 w-4" />
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
                      PDF, Word (.doc, .docx) or text files
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
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="text-primary" />
                Job Description
              </CardTitle>
              <CardDescription>
                Add the job description to analyze keyword matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste the job description here to get better keyword matching results..."
                className="min-h-[150px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleScan} 
                disabled={isLoading || (!resumeText && !file) || !jobDescription}
              >
                {isLoading ? 
                  <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : 
                  <><Search className="mr-2 h-4 w-4" /> Analyze Resume</>
                }
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Right panel - Results */}
        <div className="lg:col-span-2">
          {step === "upload" && (
            <Card className="h-full flex items-center justify-center p-6">
              <div className="text-center max-w-md">
                <Search className="h-12 w-12 text-primary mx-auto mb-4 opacity-70" />
                <h2 className="text-xl font-semibold mb-2">
                  Ready to scan your resume?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Upload your resume and add a job description to get personalized feedback on your resume's ATS compatibility and suggestions for improvement.
                </p>
                <Button onClick={() => document.getElementById("resume-upload")?.click()}>
                  Upload Resume
                </Button>
              </div>
            </Card>
          )}
          
          {step === "job" && (
            <Card className="h-full flex items-center justify-center p-6">
              <div className="text-center max-w-md">
                <File className="h-12 w-12 text-primary mx-auto mb-4 opacity-70" />
                <h2 className="text-xl font-semibold mb-2">
                  Resume uploaded successfully!
                </h2>
                <p className="text-muted-foreground mb-6">
                  For the best results, paste the job description you're applying for to get tailored feedback and keyword matching analysis.
                </p>
                <Button onClick={handleScan} disabled={!resumeText && !file}>
                  {jobDescription ? "Analyze with Job Description" : "Analyze Resume"}
                </Button>
              </div>
            </Card>
          )}
          
          {step === "results" && scanResults && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resume Analysis Results</CardTitle>
                  <CardDescription>
                    Overall ATS compatibility score for your resume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative w-40 h-40">
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
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - scanResults.overallScore / 100)}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold">{scanResults.overallScore}</span>
                        <span className="text-sm text-muted-foreground">out of 100</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">ATS Compatibility</span>
                          <span className="text-sm font-medium">{scanResults.atsCompatibility}%</span>
                        </div>
                        <Progress value={scanResults.atsCompatibility} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Keyword Match</span>
                          <span className="text-sm font-medium">{scanResults.keywordMatch}%</span>
                        </div>
                        <Progress value={scanResults.keywordMatch} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Formatting</span>
                          <span className="text-sm font-medium">{scanResults.formattingScore}%</span>
                        </div>
                        <Progress value={scanResults.formattingScore} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Content Quality</span>
                          <span className="text-sm font-medium">{scanResults.contentScore}%</span>
                        </div>
                        <Progress value={scanResults.contentScore} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      Areas to Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {scanResults.missingKeywords.length > 0 && (
                        <li className="text-destructive font-medium mb-2">
                          Missing Keywords: {scanResults.missingKeywords.join(", ")}
                        </li>
                      )}
                      {scanResults.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Keywords Found</h4>
                      <div className="flex flex-wrap gap-2">
                        {scanResults.keywords.map((keyword, index) => (
                          <div 
                            key={index} 
                            className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                          >
                            {keyword}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {scanResults.atsCompatibility >= 70 && (
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <span>Your resume has good ATS compatibility</span>
                      </div>
                    )}
                    {scanResults.formattingScore >= 70 && (
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <span>Clean formatting that is easy to read</span>
                      </div>
                    )}
                    {scanResults.keywordMatch >= 70 && (
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <span>Good keyword alignment with job description</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {!scanResults.improvedContent ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="text-primary" />
                      AI Resume Optimization
                    </CardTitle>
                    <CardDescription>
                      Get AI-generated suggestions to improve your resume content
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center p-8">
                    <p className="mb-4">
                      Our AI can suggest optimized content for your resume based on industry standards and the job description.
                    </p>
                    <Button onClick={handleOptimizeResume}>
                      Generate Optimized Content
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="text-primary" />
                        AI Optimized Resume
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={copyToClipboard}>
                          <ClipboardCheck className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-muted rounded-lg whitespace-pre-line">
                      {scanResults.improvedContent}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeScannerPage;
