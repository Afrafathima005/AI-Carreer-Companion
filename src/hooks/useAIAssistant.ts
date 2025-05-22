import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AIRequestType = "resume_analysis" | "cover_letter" | "skill_gap" | "interview_feedback" | "interview_questions" | "interview_evaluation";

export interface Question {
  id: number;
  text: string;
  category: string;
  timeAllocation: number;
}

export interface InterviewFeedback {
  delivery: {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
  content: {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
  confidence: {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
}

export type AIRequestContent = {
  resume_analysis: { resume: string; jobDescription?: string };
  cover_letter: { 
    fullName: string; 
    email: string; 
    phone: string; 
    address?: string;
    company: string;
    position: string;
    hiringManager?: string;
    jobDescription: string;
    experience?: string;
    tone?: "professional" | "enthusiastic" | "conversational";
    length?: "short" | "medium" | "long";
  };
  skill_gap: { 
    resume: string; 
    jobTitle: string;
    jobDescription: string;
  };
  interview_feedback: {
    question: string;
    response: string;
    positionType?: string;
  };
  interview_questions: {
    role: string;
    level: string;
  };
  interview_evaluation: {
    role: string;
    level: string;
    questions: Question[];
  };
}

export const useAIAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);

  const callAIAssistant = async <T extends AIRequestType>(type: T, content: AIRequestContent[T]) => {
    setIsLoading(true);
    try {
      console.log(`Making ${type} request to AI assistant with:`, content);
      
      const { data, error } = await supabase.functions.invoke("ai-career-assistant", {
        body: { type, content },
      });
      
      if (error) {
        console.error("AI Assistant error:", error);
        toast.error("Error processing your request. Please try again.");
        throw error;
      }
      
      console.log(`Received ${type} response:`, data);
      return data;
    } catch (error) {
      console.error("Error calling AI assistant:", error);
      toast.error("Error connecting to AI services.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    analyzeResume: (content: AIRequestContent["resume_analysis"]) => 
      callAIAssistant("resume_analysis", content),
    generateCoverLetter: (content: AIRequestContent["cover_letter"]) => 
      callAIAssistant("cover_letter", content),
    analyzeSkillGap: (content: AIRequestContent["skill_gap"]) => 
      callAIAssistant("skill_gap", content),
    getInterviewFeedback: (content: AIRequestContent["interview_feedback"]) => 
      callAIAssistant("interview_feedback", content),
    generateInterviewQuestions: (content: AIRequestContent["interview_questions"]) => 
      callAIAssistant("interview_questions", content) as Promise<Question[]>,
    generateInterviewFeedback: (content: AIRequestContent["interview_evaluation"]) => 
      callAIAssistant("interview_evaluation", content) as Promise<InterviewFeedback>
  };
};
