import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI lazily to ensure environment variables are loaded
let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
    if (!genAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log(`[AI-CORE] Checking GEMINI_API_KEY... ${apiKey ? 'Found (starts with: ' + apiKey.substring(0, 5) + '... length: ' + apiKey.length + ')' : 'NOT FOUND'}`);
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not defined in environment variables");
        }
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
}

export interface InterviewQuestion {
    id: string;
    question: string;
    context?: string;
    expectedTopics?: string[];
}

export interface InterviewResponse {
    questionId: string;
    question: string;
    answer: string;
    timeSpent: number; // in seconds
}

export interface InterviewAnalysis {
    overallScore: number; // 0-100
    summary: string;
    strengths: string[];
    weaknesses: string[];
    questionScores: Array<{
        questionId: string;
        score: number;
        feedback: string;
    }>;
    skillScores: Array<{
        skillName: string;
        score: number;
    }>;
}

export interface GenerateQuestionsInput {
    title: string;
    description?: string;
    category: string;
    difficulty: string;
    topics: string[];
    role?: string;
    level?: string;
    questionCount?: number;
    resumeText?: string;
}

/**
 * Generate interview questions using Gemini AI
 */
export async function generateInterviewQuestions(
    input: GenerateQuestionsInput
): Promise<InterviewQuestion[]> {
    const {
        title,
        description,
        category,
        difficulty,
        topics,
        role,
        level,
        questionCount = 10,
        resumeText,
    } = input;

    const model = getGenAI().getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `You are an expert technical interviewer. Generate ${questionCount} interview questions for the following interview.
IMPORTANT: The questions you generate must be standard, highly-asked, and realistic questions commonly encountered in actual top-tier industry interviews for this role (such as frequently tested concepts, core architectural patterns, common coding challenges, or critical behavioral/situational questions):

Title: ${title}
${description ? `Description: ${description}` : ""}
Category: ${category}
Difficulty: ${difficulty}
${role ? `Role: ${role}` : ""}
${level ? `Level: ${level}` : ""}
Topics to cover: ${topics.join(", ")}

${resumeText ? `Candidate Resume Context:
${resumeText}

IMPORTANT: Some questions SHOULD specifically probe the candidate's claims and experiences mentioned in their resume to verify depth and authenticity. Tailor the difficulty based on their stated years of experience and skill proficiency.` : ""}

Requirements:
1. Generate exactly ${questionCount} questions
2. Questions should progressively increase in difficulty
3. Cover all mentioned topics appropriately
4. Questions should be practical and relevant to real-world scenarios
5. For technical interviews, include coding, system design, or problem-solving questions that are highly typical and popular in technical screens
6. For behavioral interviews, use the STAR method framework focusing on core soft skill competencies
7. Each question should assess specific skills or knowledge areas
8. Prioritize high-yield, frequently asked interview questions that directly evaluate core competencies in the selected topics and role

Return the response in the following JSON format:
{
  "questions": [
    {
      "id": "q1",
      "question": "The actual question text",
      "context": "Brief context or scenario for the question",
      "expectedTopics": ["topic1", "topic2"]
    }
  ]
}

Only return valid JSON, no additional text.`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Invalid JSON response from AI");
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.questions || [];
    } catch (error) {
        console.error("Error generating questions:", error);
        throw new Error("Failed to generate interview questions");
    }
}

/**
 * Extract skills and tech stack from resume text using Gemini AI
 */
export async function extractResumeSkills(resumeText: string): Promise<string[]> {
    try {
        const model = getGenAI().getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `You are a professional resume parser. Extract a list of the key technical skills, tools, frameworks, and programming languages from the following resume text.
Only extract actual technical skills, tools, programming languages, and databases (e.g. "React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS", "Python"). Do not include soft skills.
Return ONLY a list of strings in JSON format. Do not write any markdown code fences, headers, or explanations. Just return the JSON object:

{
  "skills": ["Skill1", "Skill2", "Framework1", "Tool1"]
}

Resume text:
${resumeText}`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Invalid JSON response from AI");
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.skills || [];
    } catch (error) {
        console.error("Error extracting resume skills:", error);
        return [];
    }
}


/**
 * Analyze interview responses using OpenAI or Gemini AI
 */
export async function analyzeInterviewResponses(
    interviewData: {
        title: string;
        category: string;
        difficulty: string;
        topics: string[];
    },
    responses: InterviewResponse[]
): Promise<InterviewAnalysis> {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    const prompt = `You are an expert interview evaluator. Analyze the following interview performance:

Interview Details:
- Title: ${interviewData.title}
- Category: ${interviewData.category}
- Difficulty: ${interviewData.difficulty}
- Topics: ${interviewData.topics.join(", ")}

Responses:
${responses
            .map(
                (r, idx) => `
Q${idx + 1}: ${r.question}
A${idx + 1}: ${r.answer}
Time Spent: ${Math.floor(r.timeSpent / 60)}m ${r.timeSpent % 60}s
`
            )
            .join("\n")}

Please provide a comprehensive analysis including:
1. Overall score (0-100) based on:
   - Technical accuracy and depth
   - Communication clarity
   - Problem-solving approach
   - Time management
   - Completeness of answers

2. Individual question scores with specific feedback
3. Key strengths demonstrated
4. Areas for improvement
5. Skill-based scores for relevant competencies

Return the response in the following JSON format:
{
  "overallScore": 85,
  "summary": "Overall performance summary...",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "questionScores": [
    {
      "questionId": "q1",
      "score": 90,
      "feedback": "Detailed feedback for this question..."
    }
  ],
  "skillScores": [
    {
      "skillName": "Problem Solving",
      "score": 85
    },
    {
      "skillName": "Communication",
      "score": 90
    }
  ]
}

Only return valid JSON, no additional text.`;

    if (OPENAI_API_KEY) {
        console.log("[AI-CORE] Analyzing interview responses using OpenAI...");
        try {
            const openAIRes = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    response_format: { type: "json_object" },
                    messages: [
                        { role: "system", content: "You are an expert interview evaluator that outputs JSON." },
                        { role: "user", content: prompt }
                    ],
                    max_tokens: 1000,
                    temperature: 0.5
                })
            });

            if (!openAIRes.ok) {
                throw new Error(`OpenAI API Error: ${openAIRes.status} ${await openAIRes.text()}`);
            }

            const openAIData = await openAIRes.json() as any;
            const text = openAIData?.choices?.[0]?.message?.content || "";
            const parsed = JSON.parse(text);
            return {
                overallScore: parsed.overallScore || 0,
                summary: parsed.summary || "",
                strengths: parsed.strengths || [],
                weaknesses: parsed.weaknesses || [],
                questionScores: parsed.questionScores || [],
                skillScores: parsed.skillScores || [],
            };
        } catch (error) {
            console.error("[AI-CORE] OpenAI analysis failed, falling back to Gemini:", error);
        }
    }

    console.log("[AI-CORE] Analyzing interview responses using Gemini...");
    const model = getGenAI().getGenerativeModel({ model: "gemini-3-flash-preview" });

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Invalid JSON response from AI");
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return {
            overallScore: parsed.overallScore || 0,
            summary: parsed.summary || "",
            strengths: parsed.strengths || [],
            weaknesses: parsed.weaknesses || [],
            questionScores: parsed.questionScores || [],
            skillScores: parsed.skillScores || [],
        };
    } catch (error) {
        console.error("Error analyzing responses:", error);
        throw new Error("Failed to analyze interview responses");
    }
}
