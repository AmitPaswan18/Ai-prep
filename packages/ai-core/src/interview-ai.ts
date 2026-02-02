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
    } = input;

    const model = getGenAI().getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert technical interviewer. Generate ${questionCount} interview questions for the following interview:

Title: ${title}
${description ? `Description: ${description}` : ""}
Category: ${category}
Difficulty: ${difficulty}
${role ? `Role: ${role}` : ""}
${level ? `Level: ${level}` : ""}
Topics to cover: ${topics.join(", ")}

Requirements:
1. Generate exactly ${questionCount} questions
2. Questions should progressively increase in difficulty
3. Cover all mentioned topics appropriately
4. Questions should be practical and relevant to real-world scenarios
5. For technical interviews, include coding, system design, or problem-solving questions
6. For behavioral interviews, use the STAR method framework
7. Each question should assess specific skills or knowledge areas

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
 * Analyze interview responses using Gemini AI
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
    const model = getGenAI().getGenerativeModel({ model: "gemini-1.5-flash" });

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
