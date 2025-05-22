import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AICareerRequest {
  type: "resume_analysis" | "cover_letter" | "skill_gap" | "interview_feedback" | "interview_questions" | "interview_evaluation";
  content: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ error: "OpenAI API key not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { type, content } = await req.json() as AICareerRequest;
    
    let systemPrompt = "";
    let userPrompt = "";
    
    // Configure prompt based on request type
    switch (type) {
      case "resume_analysis":
        systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer. 
        Analyze the provided resume content against the job description. 
        Provide a detailed analysis including: 
        1. Overall match percentage (numeric value between 0-100)
        2. ATS compatibility score (numeric value between 0-100)
        3. Keyword match score (numeric value between 0-100)
        4. Formatting score (numeric value between 0-100)
        5. Content quality score (numeric value between 0-100)
        6. A list of key industry keywords found in the resume
        7. A list of missing important keywords from the job description
        8. Specific suggestions for improvements
        Format the response as valid JSON with these keys: overallScore, atsCompatibility, keywordMatch, formattingScore, contentScore, keywords, missingKeywords, suggestions`;
        userPrompt = `Resume: ${content.resume}\n\nJob Description: ${content.jobDescription || "General industry position"}`;
        break;
        
      case "cover_letter":
        systemPrompt = `You are a professional cover letter writer with expertise in career services.
        Create a compelling, personalized cover letter based on the provided information.
        The tone should match the requested style, and the content should highlight relevant skills and experiences.
        Keep the cover letter concise, professional, and tailored to the specific job.
        Format the response as plain text with appropriate paragraph breaks.`;
        userPrompt = `Full Name: ${content.fullName}
        Email: ${content.email}
        Phone: ${content.phone}
        Address: ${content.address || ""}
        Company: ${content.company}
        Position: ${content.position}
        Hiring Manager: ${content.hiringManager || "Hiring Manager"}
        Job Description: ${content.jobDescription}
        Relevant Experience: ${content.experience || ""}
        Tone: ${content.tone || "professional"}
        Desired Length: ${content.length || "medium"}`;
        break;
        
      case "skill_gap":
        systemPrompt = `You are a career development specialist and industry expert.
        Analyze the provided resume and job description to identify skill gaps.
        Provide a comprehensive analysis including:
        1. Overall match percentage (numeric value between 0-100)
        2. List of strong skills already present in the resume
        3. List of skills present but needing improvement (with current level 0-100 and gap size)
        4. List of completely missing skills (with required level 0-100)
        5. Recommended courses or resources to develop the missing skills
        Format the response as valid JSON with these keys: matchPercentage, strongSkills, partialSkills, missingSkills, recommendations`;
        userPrompt = `Resume: ${content.resume}\n\nJob Title: ${content.jobTitle}\n\nJob Description: ${content.jobDescription}`;
        break;
        
      case "interview_feedback":
        systemPrompt = `You are an expert interview coach with experience in technical and behavioral interviews.
        Analyze the provided interview response and question to provide constructive feedback.
        Consider clarity, relevance, structure, technical accuracy, and delivery in your assessment.
        Provide:
        1. Overall score (0-100)
        2. Strengths in the response
        3. Areas for improvement
        4. Alternative approaches or points that could have been included
        Format the response as valid JSON with these keys: overallScore, strengths, improvements, alternatives`;
        userPrompt = `Interview Question: ${content.question}\n\nCandidate Response: ${content.response}\n\nPosition Type: ${content.positionType || "General"}`;
        break;
        
      case "interview_questions":
        systemPrompt = `You are an expert technical interviewer with extensive experience in conducting interviews.
        Generate a set of 5 interview questions tailored for the specified role and experience level.
        Each question should:
        1. Be appropriate for the role and level
        2. Include a mix of behavioral and technical questions
        3. Have an estimated time allocation for the answer
        Format the response as a JSON array of objects with these keys: id, text, category (Behavioral/Technical), timeAllocation (in seconds)`;
        userPrompt = `Role: ${content.role}\nExperience Level: ${content.level}`;
        break;
        
      case "interview_evaluation":
        systemPrompt = `You are an expert interview evaluator with experience in technical hiring.
        Analyze the candidate's interview performance for the specified role and level.
        Provide a comprehensive evaluation including:
        1. Delivery assessment (score, feedback, strengths, areas for improvement)
        2. Content assessment (score, feedback, strengths, areas for improvement)
        3. Confidence assessment (score, feedback, strengths, areas for improvement)
        Format the response as valid JSON with nested objects for delivery, content, and confidence, each containing: score (0-100), feedback (string), strengths (string[]), improvements (string[])`;
        userPrompt = `Role: ${content.role}\nLevel: ${content.level}\nQuestions and Context: ${JSON.stringify(content.questions)}`;
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: "Invalid request type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    console.log(`Processing ${type} request...`);
    
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    // For resume_analysis, skill_gap, and interview_feedback, parse JSON
    let parsedResult;
    if (type !== "cover_letter") {
      try {
        // Extract JSON if it's wrapped in markdown code blocks
        const jsonMatch = result.match(/```json\n([\s\S]*)\n```/) || 
                          result.match(/```\n([\s\S]*)\n```/) ||
                          [null, result];
        parsedResult = JSON.parse(jsonMatch[1] || result);
      } catch (e) {
        console.error("Failed to parse JSON from OpenAI response:", e);
        console.log("Raw response:", result);
        parsedResult = { error: "Failed to parse AI response", raw: result };
      }
    } else {
      parsedResult = { content: result };
    }

    return new Response(
      JSON.stringify(parsedResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in AI Career Assistant:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
