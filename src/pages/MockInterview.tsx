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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Video,
  Mic,
  Play,
  Pause,
  Clock,
  MessageCircle,
  Settings,
  RefreshCcw,
  ChevronRight,
  CheckCircle,
  School,
  Info,
  AlertCircle,
  Zap,
  SkipForward,
} from "lucide-react";
import { toast } from "sonner";
import { useAIAssistant } from "@/hooks/useAIAssistant";

type InterviewStatus = "setup" | "ready" | "interviewing" | "feedback";
type MediaStatus = "pending" | "granted" | "denied";

interface Question {
  id: number;
  text: string;
  category: string;
  timeAllocation: number;
}

interface Feedback {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  alternatives: string[];
}

const MockInterview = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [skills, setSkills] = useState("");
  const [interviewStatus, setInterviewStatus] = useState<InterviewStatus>("setup");
  const [videoPermission, setVideoPermission] = useState<MediaStatus>("pending");
  const [audioPermission, setAudioPermission] = useState<MediaStatus>("pending");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentResponse, setCurrentResponse] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  
  const { isLoading, getInterviewFeedback } = useAIAssistant();

  const roles = [
    "Software Engineer", 
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "UX/UI Designer",
    "Product Manager",
    "Data Scientist",
    "DevOps Engineer",
    "QA Engineer"
  ];
  
  const levels = [
    "Entry Level",
    "Junior",
    "Mid-Level",
    "Senior",
    "Lead"
  ];
  
  const generateQuestions = async () => {
    if (!selectedRole || !selectedLevel || !skills) {
      toast.error("Please fill in all the required fields");
      return;
    }

    try {
      const result = await getInterviewFeedback({
        question: "Generate 5 technical interview questions",
        response: "",
        positionType: selectedRole,
        skills: skills,
      });

      if (result) {
        // Transform the AI response into our Question format
        const generatedQuestions: Question[] = result.questions?.map((q: any, index: number) => ({
          id: index + 1,
          text: q,
          category: "Technical",
          timeAllocation: 180, // 3 minutes per technical question
        })) || [];

        if (generatedQuestions.length > 0) {
          setQuestions(generatedQuestions);
          setCurrentQuestion(generatedQuestions[0]);
          toast.success("Interview questions generated successfully!");
          return true;
        }
      }
      
      toast.error("Failed to generate questions. Please try again.");
      return false;
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Failed to generate questions. Please try again.");
      return false;
    }
  };
  
  const setupInterview = async () => {
    if (!selectedRole || !selectedLevel || !skills) {
      toast.error("Please fill in all the required fields");
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      const questionsGenerated = await generateQuestions();
      
      if (questionsGenerated) {
        setVideoPermission("granted");
        setAudioPermission("granted");
        setInterviewStatus("ready");
        toast.success("Camera and microphone access granted!");
      }
      
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Error accessing media devices:", error);
      setVideoPermission("denied");
      setAudioPermission("denied");
      toast.error("Please enable camera and microphone access to conduct the interview.");
    }
  };
  
  const startInterview = () => {
    setInterviewStatus("interviewing");
    setCurrentQuestion(questions[0]);
    setQuestionIndex(0);
    setTimeRemaining(questions[0].timeAllocation);
    startTimer(questions[0].timeAllocation);
    setIsRecording(true);
    toast.success("Interview started! Answer the first question.");
  };
  
  const nextQuestion = async () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    // Get AI feedback for the current response
    if (currentResponse) {
      try {
        const feedbackResult = await getInterviewFeedback({
          question: currentQuestion?.text || "",
          response: currentResponse,
          positionType: selectedRole
        });

        // Process feedback
        if (feedbackResult) {
          // If we're on the last question, set full feedback for final report
          if (questionIndex >= questions.length - 1) {
            setFeedback({
              overallScore: feedbackResult.overallScore || 75,
              strengths: feedbackResult.strengths || ["Good pacing", "Clear articulation"],
              improvements: feedbackResult.improvements || ["Work on eye contact"],
              alternatives: feedbackResult.alternatives || ["Provide more specific examples"]
            });
          }
          
          toast.success("AI feedback received for your response!");
        }
        
        // Clear current response for next question
        setCurrentResponse("");
      } catch (error) {
        console.error("Error getting AI feedback:", error);
        toast.error("Failed to get AI feedback. Moving to next question.");
      }
    }
    
    if (questionIndex < questions.length - 1) {
      const nextIdx = questionIndex + 1;
      setQuestionIndex(nextIdx);
      setCurrentQuestion(questions[nextIdx]);
      setTimeRemaining(questions[nextIdx].timeAllocation);
      startTimer(questions[nextIdx].timeAllocation);
      toast.success("Moving to next question!");
    } else {
      endInterview();
    }
  };
  
  const startTimer = (seconds: number) => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    setTimeRemaining(seconds);
    
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimerInterval(interval);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    } else {
      startTimer(timeRemaining);
    }
    
    setIsRecording((prev) => !prev);
    toast.success(isRecording ? "Recording paused" : "Recording resumed");
  };
  
  const endInterview = async () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    setIsRecording(false);
    setInterviewStatus("feedback");

    // Get final feedback if we don't have it already
    if (currentResponse && !feedback) {
      try {
        const feedbackResult = await getInterviewFeedback({
          question: currentQuestion?.text || "",
          response: currentResponse,
          positionType: selectedRole
        });
        
        if (feedbackResult) {
          setFeedback({
            overallScore: feedbackResult.overallScore || 75,
            strengths: feedbackResult.strengths || ["Good pacing", "Clear articulation"],
            improvements: feedbackResult.improvements || ["Work on eye contact"],
            alternatives: feedbackResult.alternatives || ["Provide more specific examples"]
          });
        }
        
        toast.success("Interview completed! Your feedback is ready.");
      } catch (error) {
        console.error("Error getting final feedback:", error);
        toast.error("Failed to get final feedback.");
      }
    }
  };
  
  const restartInterview = () => {
    setInterviewStatus("setup");
    setCurrentQuestion(null);
    setQuestions([]);
    setQuestionIndex(0);
    setTimeRemaining(0);
    setIsRecording(false);
    setCurrentResponse("");
    setFeedback(null);
    setVideoPermission("pending");
    setAudioPermission("pending");
  };
  
  const handleResponseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentResponse(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Technical Interview</h1>
        <p className="text-muted-foreground">
          Practice technical interviews with AI-generated questions based on your skills
        </p>
      </div>
      
      {interviewStatus === "setup" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="text-primary" size={18} />
              Interview Setup
            </CardTitle>
            <CardDescription>Configure your technical interview session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="role">Select Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Choose a role to practice for" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="level">Experience Level</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger id="level">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="skills">Your Technical Skills</Label>
              <Textarea
                id="skills"
                placeholder="Enter your technical skills (e.g., JavaScript, React, Node.js, Python, SQL, etc.)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Separate skills with commas for better question generation
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info size={16} />
                    Interview Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Number of questions:</span>
                    <p className="font-medium">5 questions</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Estimated duration:</span>
                    <p className="font-medium">15-20 minutes</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Question types:</span>
                    <p className="font-medium">Technical</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Video size={16} />
                    Technical Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Camera access:</span>
                    <span className={`text-sm font-medium ${
                      videoPermission === "granted" ? "text-green-500" : 
                      videoPermission === "denied" ? "text-destructive" : ""
                    }`}>
                      {videoPermission === "granted" ? "Granted" : 
                       videoPermission === "denied" ? "Denied" : "Required"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Microphone access:</span>
                    <span className={`text-sm font-medium ${
                      audioPermission === "granted" ? "text-green-500" : 
                      audioPermission === "denied" ? "text-destructive" : ""
                    }`}>
                      {audioPermission === "granted" ? "Granted" : 
                       audioPermission === "denied" ? "Denied" : "Required"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Chrome/Firefox browser:</span>
                    <span className="text-sm font-medium text-green-500">Compatible</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={setupInterview} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  Set Up Interview
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {interviewStatus === "ready" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="text-primary" size={18} />
              Ready to Begin
            </CardTitle>
            <CardDescription>
              Your technical interview for {selectedRole} ({selectedLevel}) is ready
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium mb-4">Interview Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-card">
                  <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-medium">5 Questions</p>
                  <p className="text-sm text-muted-foreground">Technical</p>
                </div>
                <div className="p-4 rounded-lg bg-card">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-medium">15-20 Minutes</p>
                  <p className="text-sm text-muted-foreground">Total Duration</p>
                </div>
                <div className="p-4 rounded-lg bg-card">
                  <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-medium">Instant Feedback</p>
                  <p className="text-sm text-muted-foreground">After Completion</p>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4 text-center">Interview Tips</h3>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Position yourself in a well-lit area with a neutral background</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Speak clearly and maintain eye contact with the camera</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Be prepared to explain your thought process and approach to solving problems</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Take a moment to gather your thoughts before answering complex questions</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Have a glass of water nearby in case you need it</span>
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={restartInterview}>
              Change Settings
            </Button>
            <Button onClick={startInterview}>
              <Play className="mr-2 h-4 w-4" />
              Start Interview
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {interviewStatus === "interviewing" && currentQuestion && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
                  <Video className="h-16 w-16 opacity-20" />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="bg-black/50 h-10 w-10 rounded-full border-white/20 hover:bg-black/70"
                        onClick={toggleRecording}
                      >
                        {isRecording ? (
                          <Pause className="h-5 w-5 text-white" />
                        ) : (
                          <Play className="h-5 w-5 text-white" />
                        )}
                      </Button>
                      
                      <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${
                        isRecording ? "bg-red-500/20 text-red-500" : "bg-white/10 text-white/70"
                      }`}>
                        {isRecording ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                            <span className="text-xs font-medium">Recording</span>
                          </>
                        ) : (
                          <span className="text-xs font-medium">Paused</span>
                        )}
                      </div>
                      
                      <div className="bg-white/10 text-white px-3 py-1 rounded-full flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{formatTime(timeRemaining)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="bg-black/50 h-10 w-10 rounded-full border-white/20 hover:bg-black/70"
                      >
                        <Video className="h-5 w-5 text-white" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="bg-black/50 h-10 w-10 rounded-full border-white/20 hover:bg-black/70"
                      >
                        <Mic className="h-5 w-5 text-white" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="bg-black/50 h-10 w-10 rounded-full border-white/20 hover:bg-black/70"
                      >
                        <Settings className="h-5 w-5 text-white" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Question {questionIndex + 1} of {questions.length}</span>
                    <h3 className="text-lg font-medium">{currentQuestion.category}</h3>
                  </div>
                  <Button variant="outline" size="sm" onClick={nextQuestion}>
                    Skip <SkipForward className="ml-1 h-4 w-4" />
                  </Button>
                </div>
                
                <Card className="bg-muted/30">
                  <CardContent className="p-6">
                    <p className="text-lg">{currentQuestion.text}</p>
                  </CardContent>
                </Card>
                
                <div className="mt-6 space-y-4">
                  <Textarea 
                    placeholder="Type your response here (optional). This will be analyzed by AI for feedback."
                    className="min-h-[120px] text-base"
                    value={currentResponse}
                    onChange={handleResponseChange}
                  />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Time Remaining</span>
                      <span className="text-sm">{formatTime(timeRemaining)}</span>
                    </div>
                    <Progress 
                      value={
                        ((currentQuestion.timeAllocation - timeRemaining) / currentQuestion.timeAllocation) * 100
                      } 
                      className="h-2" 
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t p-6">
                <Button variant="outline" onClick={restartInterview}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Restart
                </Button>
                <Button onClick={nextQuestion}>
                  {questionIndex < questions.length - 1 ? (
                    <>Next Question <ChevronRight className="ml-2 h-4 w-4" /></>
                  ) : (
                    <>Finish Interview <CheckCircle className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Interview Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{questionIndex + 1}/{questions.length} questions</span>
                  </div>
                  <Progress value={((questionIndex + 1) / questions.length) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  {questions.map((q, idx) => (
                    <div 
                      key={q.id} 
                      className={`p-3 rounded-lg flex items-center justify-between ${
                        idx === questionIndex 
                          ? "bg-primary/10 border border-primary/20" 
                          : idx < questionIndex 
                            ? "bg-muted text-muted-foreground" 
                            : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                          idx === questionIndex 
                            ? "bg-primary text-primary-foreground" 
                            : idx < questionIndex 
                              ? "bg-muted-foreground/30 text-muted-foreground" 
                              : "bg-muted-foreground/10 text-muted-foreground"
                        }`}>
                          {idx + 1}
                        </div>
                        <span className={`text-sm ${idx === questionIndex ? "font-medium" : ""}`}>
                          {q.category}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(q.timeAllocation)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {interviewStatus === "feedback" && feedback && (
        <Card>
          <CardHeader>
            <CardTitle>Interview Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Overall Score: {feedback.overallScore}</p>
            <p>Strengths: {feedback.strengths.join(", ")}</p>
            <p>Improvements: {feedback.improvements.join(", ")}</p>
            <p>Alternatives: {feedback.alternatives.join(", ")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MockInterview;
