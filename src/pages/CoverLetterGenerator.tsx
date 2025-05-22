import { useState, useRef } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  RefreshCw,
  Settings,
  Edit,
  Globe,
  Building,
  User,
  ClipboardCopy,
  CheckIcon
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  company: string;
  position: string;
  hiringManager?: string;
  jobDescription: string;
  experience: string;
  tone: "professional" | "enthusiastic" | "conversational";
  length: "short" | "medium" | "long";
}

const CoverLetterGenerator = () => {
  const { isLoading, generateCoverLetter } = useAIAssistant();
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const coverLetterRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    position: "",
    hiringManager: "",
    jobDescription: "",
    experience: "",
    tone: "professional",
    length: "medium",
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const generateCoverLetterHandler = async () => {
    if (!formData.fullName || !formData.company || !formData.position || !formData.jobDescription) {
      toast.error("Please fill in all required fields marked with *");
      return;
    }
    
    try {
      const response = await generateCoverLetter(formData);
      
      if (response && response.content) {
        setCoverLetter(response.content);
        setActiveTab("preview");
        toast.success("Cover letter generated successfully!");
      } else {
        toast.error("Failed to generate cover letter. Please try again.");
      }
    } catch (error) {
      console.error("Error generating cover letter:", error);
      toast.error("An error occurred while generating your cover letter.");
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    toast.success("Cover letter copied to clipboard!");
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const downloadAsPDF = async () => {
    if (!coverLetterRef.current || !coverLetter) {
      toast.error("Please generate a cover letter first");
      return;
    }
    
    toast.loading("Generating PDF...");
    
    try {
      const canvas = await html2canvas(coverLetterRef.current, {
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = formData.company && formData.position 
        ? `Cover_Letter_${formData.company.replace(/\s+/g, '_')}_${formData.position.replace(/\s+/g, '_')}.pdf`
        : "Cover_Letter.pdf";
      
      pdf.save(fileName);
      toast.dismiss();
      toast.success("Cover letter downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.dismiss();
      toast.error("Error generating PDF. Please try again.");
    }
  };

  const getRandomJobRequirement = () => {
    const requirements = [
      "demonstrates strong leadership and project management skills",
      "has excellent communication skills and can work effectively in cross-functional teams",
      "possesses technical expertise and problem-solving abilities",
      "brings innovative thinking and a proactive approach to challenges"
    ];
    
    return requirements[Math.floor(Math.random() * requirements.length)];
  };
  
  const getRandomAccomplishment = () => {
    const accomplishments = [
      "increased team productivity by 30% through improved process implementation",
      "led a project that delivered $500K in annual cost savings",
      "developed innovative solutions that enhanced customer satisfaction by 25%",
      "managed a team that consistently exceeded quarterly targets"
    ];
    
    return accomplishments[Math.floor(Math.random() * accomplishments.length)];
  };
  
  const getRandomCompanyAttribute = () => {
    const attributes = [
      "innovation and forward-thinking approach",
      "commitment to excellence and quality service",
      "industry leadership and cutting-edge solutions",
      "positive company culture and collaborative work environment"
    ];
    
    return attributes[Math.floor(Math.random() * attributes.length)];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cover Letter Generator</h1>
        <p className="text-muted-foreground">
          Create personalized cover letters for job applications in minutes
        </p>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as "editor" | "preview")}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <Edit size={16} />
            Editor
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <FileText size={16} />
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="text-primary" size={18} />
                  Your Information
                </CardTitle>
                <CardDescription>Enter your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="fullName" 
                    name="fullName"
                    placeholder="John Doe" 
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="john@example.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    placeholder="(123) 456-7890" 
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Address (Optional)</Label>
                  <Textarea 
                    id="address" 
                    name="address"
                    placeholder="123 Main St, City, State, Zip" 
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    For traditional cover letters. Can be left blank for email applications.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="text-primary" size={18} />
                  Job Details
                </CardTitle>
                <CardDescription>Information about the position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="company">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="company" 
                    name="company"
                    placeholder="Acme Inc." 
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="position">
                    Position Title <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="position" 
                    name="position"
                    placeholder="Software Engineer" 
                    value={formData.position}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="hiringManager">Hiring Manager's Name (Optional)</Label>
                  <Input 
                    id="hiringManager" 
                    name="hiringManager"
                    placeholder="Jane Smith" 
                    value={formData.hiringManager}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="jobDescription">
                    Job Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea 
                    id="jobDescription" 
                    name="jobDescription"
                    placeholder="Paste the job description here..." 
                    className="min-h-[100px]"
                    value={formData.jobDescription}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Used to tailor your cover letter to the job requirements.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="text-primary" size={18} />
                  Experience & Preferences
                </CardTitle>
                <CardDescription>Customize your cover letter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="experience">Your Relevant Experience</Label>
                  <Textarea 
                    id="experience" 
                    name="experience"
                    placeholder="Briefly describe your relevant skills and experience..." 
                    className="min-h-[150px]"
                    value={formData.experience}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select 
                    value={formData.tone} 
                    onValueChange={(value) => handleSelectChange("tone", value as FormData["tone"])}
                  >
                    <SelectTrigger id="tone">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="length">Length</Label>
                  <Select 
                    value={formData.length} 
                    onValueChange={(value) => handleSelectChange("length", value as FormData["length"])}
                  >
                    <SelectTrigger id="length">
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (1-2 paragraphs)</SelectItem>
                      <SelectItem value="medium">Medium (3-4 paragraphs)</SelectItem>
                      <SelectItem value="long">Long (5+ paragraphs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={generateCoverLetterHandler}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Cover Letter
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="text-primary" />
                  Your Cover Letter
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    {copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadAsPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button size="sm" onClick={() => setActiveTab("editor")}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {coverLetter ? (
                <div className="bg-muted p-6 rounded-lg whitespace-pre-line" ref={coverLetterRef}>
                  {coverLetter}
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No cover letter generated yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Fill in your details in the editor tab and generate a cover letter.
                  </p>
                  <Button onClick={() => setActiveTab("editor")}>
                    Go to Editor
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoverLetterGenerator;
