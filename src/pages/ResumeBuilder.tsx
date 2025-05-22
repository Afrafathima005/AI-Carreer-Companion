import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  PlusCircle,
  Download,
  Trash2,
  FileText,
  User,
  GraduationCap,
  Briefcase,
  Award,
  Sparkles,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { 
  PersonalInfo, 
  Education, 
  Experience, 
  Skill,
  personalInfoSchema,
  educationSchema,
  experienceSchema,
  skillSchema
} from "@/types/resume";

const ResumeBuilder = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [educationItems, setEducationItems] = useState<Education[]>([]);
  const [experienceItems, setExperienceItems] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [currentEducation, setCurrentEducation] = useState<Education | null>(null);
  const [currentExperience, setCurrentExperience] = useState<Experience | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const personalForm = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      summary: "",
    },
  });

  const educationForm = useForm<Education>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      degree: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  });

  const experienceForm = useForm<Experience>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  });

  const skillForm = useForm<Skill>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "",
      level: "Intermediate",
    },
  });

  const onSubmitPersonalInfo = (values: PersonalInfo) => {
    setPersonalInfo(values);
    setActiveTab("education");
    toast.success("Personal information saved!");
  };

  const onSubmitEducation = (values: Education) => {
    if (currentEducation) {
      setEducationItems(educationItems.map(edu => 
        edu === currentEducation ? values : edu
      ));
      setCurrentEducation(null);
    } else {
      setEducationItems([...educationItems, values]);
    }
    educationForm.reset();
    toast.success("Education added successfully!");
  };

  const onSubmitExperience = (values: Experience) => {
    if (currentExperience) {
      setExperienceItems(experienceItems.map(exp => 
        exp === currentExperience ? values : exp
      ));
      setCurrentExperience(null);
    } else {
      setExperienceItems([...experienceItems, values]);
    }
    experienceForm.reset();
    toast.success("Experience added successfully!");
  };

  const onSubmitSkill = (values: Skill) => {
    setSkills([...skills, values]);
    skillForm.reset();
    toast.success("Skill added successfully!");
  };

  const editEducation = (edu: Education) => {
    setCurrentEducation(edu);
    educationForm.reset(edu);
  };

  const deleteEducation = (edu: Education) => {
    setEducationItems(educationItems.filter(e => e !== edu));
    toast.success("Education removed!");
  };

  const editExperience = (exp: Experience) => {
    setCurrentExperience(exp);
    experienceForm.reset(exp);
  };

  const deleteExperience = (exp: Experience) => {
    setExperienceItems(experienceItems.filter(e => e !== exp));
    toast.success("Experience removed!");
  };

  const deleteSkill = (skill: Skill) => {
    setSkills(skills.filter(s => s !== skill));
    toast.success("Skill removed!");
  };

  const generateResume = async () => {
    if (!resumeRef.current) {
      toast.error("Resume preview not available");
      return;
    }
    
    toast.loading("Generating PDF...");
    
    try {
      const canvas = await html2canvas(resumeRef.current, {
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
      
      const fileName = personalInfo.fullName 
        ? `Resume_${personalInfo.fullName.replace(/\s+/g, '_')}.pdf`
        : "Resume.pdf";
      
      pdf.save(fileName);
      toast.dismiss();
      toast.success("Resume downloaded as PDF!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.dismiss();
      toast.error("Error generating PDF. Please try again.");
    }
  };

  const getAiSuggestions = (section: string) => {
    toast.success(`AI suggestions for ${section} generated!`);
    
    if (section === "summary") {
      personalForm.setValue("summary", "Experienced software engineer with 5+ years of expertise in web development, specializing in React and Node.js. Proven track record of delivering high-quality, scalable applications on time and within budget. Strong problem-solving skills and ability to work in fast-paced environments.");
    } else if (section === "experience") {
      experienceForm.setValue("description", "• Developed and maintained complex web applications using React and TypeScript\n• Reduced page load time by 40% through code optimization and lazy loading\n• Collaborated with UX team to implement responsive designs across all devices\n• Mentored 3 junior developers, improving team productivity by 25%");
    }
  };

  const nextSection = () => {
    switch (activeTab) {
      case "personal":
        setActiveTab("education");
        break;
      case "education":
        setActiveTab("experience");
        break;
      case "experience":
        setActiveTab("skills");
        break;
      case "skills":
        setPreviewMode(true);
        break;
      default:
        break;
    }
  };

  const previousSection = () => {
    switch (activeTab) {
      case "education":
        setActiveTab("personal");
        break;
      case "experience":
        setActiveTab("education");
        break;
      case "skills":
        setActiveTab("experience");
        break;
      default:
        break;
    }
    setPreviewMode(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Resume Builder</h1>
          <p className="text-muted-foreground">
            Create a professional, ATS-friendly resume with AI assistance
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={previewMode ? "default" : "outline"} 
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? "Edit Resume" : "Preview Resume"}
          </Button>
          <Button onClick={generateResume} className="flex items-center">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {previewMode ? (
        <ResumePreview
          personalInfo={personalInfo}
          educationItems={educationItems}
          experienceItems={experienceItems}
          skills={skills}
          onEdit={() => setPreviewMode(false)}
          resumeRef={resumeRef}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full md:w-2/3 lg:w-1/2">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="text-primary" />
                  <CardTitle>Personal Information</CardTitle>
                </div>
                <CardDescription>
                  Add your contact details and professional summary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...personalForm}>
                  <form onSubmit={personalForm.handleSubmit(onSubmitPersonalInfo)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={personalForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={personalForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={personalForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={personalForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="New York, NY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={personalForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website/LinkedIn (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="linkedin.com/in/johndoe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={personalForm.control}
                      name="summary"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>Professional Summary</FormLabel>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => getAiSuggestions("summary")}
                              className="h-8 text-primary"
                            >
                              <Sparkles className="mr-1 h-4 w-4" /> 
                              AI Suggestions
                            </Button>
                          </div>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief overview of your professional background, skills, and career goals..." 
                              className="min-h-[120px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button type="submit">
                        Save & Continue
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="education">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GraduationCap className="text-primary" />
                  <CardTitle>Education</CardTitle>
                </div>
                <CardDescription>
                  Add your educational background and qualifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {educationItems.length > 0 && (
                  <div className="space-y-4 mb-6">
                    {educationItems.map((edu, index) => (
                      <Card key={index} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{edu.degree}</h4>
                              <p className="text-muted-foreground text-sm">{edu.institution}, {edu.location}</p>
                              <p className="text-muted-foreground text-sm">{edu.startDate} - {edu.endDate}</p>
                              {edu.description && <p className="text-sm mt-2">{edu.description}</p>}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => editEducation(edu)}>
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteEducation(edu)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                <Form {...educationForm}>
                  <form onSubmit={educationForm.handleSubmit(onSubmitEducation)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={educationForm.control}
                        name="degree"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Degree/Certificate</FormLabel>
                            <FormControl>
                              <Input placeholder="Bachelor of Science in Computer Science" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={educationForm.control}
                        name="institution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution</FormLabel>
                            <FormControl>
                              <Input placeholder="University of California" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={educationForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Berkeley, CA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={educationForm.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input placeholder="09/2018" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={educationForm.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input placeholder="05/2022" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <FormField
                      control={educationForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Relevant coursework, achievements, or honors..." 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={previousSection}>
                        Back
                      </Button>
                      <div className="flex gap-2">
                        <Button type="submit">
                          {currentEducation ? "Update Education" : "Add Education"}
                        </Button>
                        {educationItems.length > 0 && (
                          <Button type="button" onClick={nextSection}>
                            Next Section
                          </Button>
                        )}
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="experience">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="text-primary" />
                  <CardTitle>Work Experience</CardTitle>
                </div>
                <CardDescription>
                  Add your professional experience and achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {experienceItems.length > 0 && (
                  <div className="space-y-4 mb-6">
                    {experienceItems.map((exp, index) => (
                      <Card key={index} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{exp.title}</h4>
                              <p className="text-muted-foreground text-sm">{exp.company}, {exp.location}</p>
                              <p className="text-muted-foreground text-sm">{exp.startDate} - {exp.endDate}</p>
                              <p className="text-sm mt-2 whitespace-pre-line">{exp.description}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => editExperience(exp)}>
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteExperience(exp)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                <Form {...experienceForm}>
                  <form onSubmit={experienceForm.handleSubmit(onSubmitExperience)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={experienceForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Software Engineer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={experienceForm.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input placeholder="Tech Company Inc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={experienceForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="San Francisco, CA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={experienceForm.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input placeholder="06/2022" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={experienceForm.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input placeholder="Present" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <FormField
                      control={experienceForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>Description</FormLabel>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => getAiSuggestions("experience")}
                              className="h-8 text-primary"
                            >
                              <Sparkles className="mr-1 h-4 w-4" /> 
                              AI Suggestions
                            </Button>
                          </div>
                          <FormControl>
                            <Textarea 
                              placeholder="• Describe your responsibilities and achievements
• Use bullet points for better readability
• Include metrics and results where possible" 
                              className="min-h-[150px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={previousSection}>
                        Back
                      </Button>
                      <div className="flex gap-2">
                        <Button type="submit">
                          {currentExperience ? "Update Experience" : "Add Experience"}
                        </Button>
                        {experienceItems.length > 0 && (
                          <Button type="button" onClick={nextSection}>
                            Next Section
                          </Button>
                        )}
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="text-primary" />
                  <CardTitle>Skills</CardTitle>
                </div>
                <CardDescription>
                  Add your technical and soft skills
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {skills.map((skill, index) => (
                      <div 
                        key={index} 
                        className="bg-muted/50 px-3 py-1.5 rounded-full flex items-center gap-2"
                      >
                        <span className="text-sm">{skill.name}</span>
                        {skill.level && (
                          <div className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                            {skill.level}
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5" 
                          onClick={() => deleteSkill(skill)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <Form {...skillForm}>
                  <form onSubmit={skillForm.handleSubmit(onSubmitSkill)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={skillForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skill</FormLabel>
                            <FormControl>
                              <Input placeholder="React.js" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={skillForm.control}
                        name="level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Proficiency Level</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                                <SelectItem value="Expert">Expert</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={previousSection}>
                        Back
                      </Button>
                      <div className="flex gap-2">
                        <Button type="submit">
                          Add Skill
                        </Button>
                        {skills.length > 0 && (
                          <Button type="button" onClick={nextSection}>
                            Preview Resume
                          </Button>
                        )}
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

const ResumePreview = ({
  personalInfo,
  educationItems,
  experienceItems,
  skills,
  onEdit,
  resumeRef
}: {
  personalInfo: PersonalInfo | null;
  educationItems: Education[];
  experienceItems: Experience[];
  skills: Skill[];
  onEdit: () => void;
  resumeRef: React.RefObject<HTMLDivElement>;
}) => {
  if (!personalInfo) {
    return (
      <Card className="p-8 text-center">
        <p>Please complete the personal information section to preview your resume.</p>
        <Button onClick={onEdit} className="mt-4">
          Edit Resume
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-0 max-w-3xl mx-auto shadow-lg border">
      <div ref={resumeRef} className="bg-white p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">{personalInfo.fullName}</h1>
          <div className="mt-2 text-sm text-gray-600 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.website && <span>{personalInfo.website}</span>}
          </div>
        </div>

        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-1 text-gray-800">Professional Summary</h2>
            <p className="text-gray-700">{personalInfo.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experienceItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Work Experience</h2>
            <div className="space-y-4">
              {experienceItems.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="font-semibold">{exp.title}</span>
                      <span className="text-gray-500">, {exp.company}</span>
                    </div>
                    <span className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">{exp.location}</div>
                  <div className="text-gray-700 whitespace-pre-line">{exp.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {educationItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Education</h2>
            <div className="space-y-4">
              {educationItems.map((edu, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="font-semibold">{edu.degree}</span>
                      <span className="text-gray-500">, {edu.institution}</span>
                    </div>
                    <span className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">{edu.location}</div>
                  {edu.description && <div className="text-gray-700">{edu.description}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-2">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 border border-gray-300 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill.name}{skill.level ? ` (${skill.level})` : ""}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ResumeBuilder;
