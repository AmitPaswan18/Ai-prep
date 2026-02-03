const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface CreateInterviewData {
    title: string;
    description?: string;
    category?: 'technical' | 'behavioral' | 'system-design' | 'case-study';
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    duration?: number;
    topics?: string[];
    role?: string;
    level?: string;
    icon?: string;
    color?: string;
}

export interface Interview {
    id: string;
    title: string;
    description?: string;
    category: string;
    difficulty: string;
    duration: number;
    rating: number;
    completions: number;
    topics: string[];
    icon?: string;
    color?: string;
    role?: string;
    level?: string;
    createdAt: string;
    updatedAt: string;
}

export const interviewApi = {
    // Create a new interview
    async createInterview(data: CreateInterviewData): Promise<Interview> {
        const response = await fetch(`${API_BASE_URL}/interview`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create interview');
        }

        return response.json();
    },

    // Get all interviews
    async getInterviews(filters?: {
        category?: string;
        difficulty?: string;
        search?: string;
        template?: boolean;
    }): Promise<Interview[]> {
        const params = new URLSearchParams();

        if (filters?.category && filters.category !== 'all') {
            params.append('category', filters.category);
        }
        if (filters?.difficulty) {
            params.append('difficulty', filters.difficulty);
        }
        if (filters?.search) {
            params.append('search', filters.search);
        }
        if (filters?.template !== undefined) {
            params.append('template', filters.template.toString());
        }

        const url = `${API_BASE_URL}/interview${params.toString() ? `?${params.toString()}` : ''}`;

        const response = await fetch(url, {
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch interviews');
        }

        return response.json();
    },

    // Get a single interview by ID
    async getInterviewById(id: string): Promise<Interview> {
        const response = await fetch(`${API_BASE_URL}/interview/${id}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch interview');
        }

        return response.json();
    },

    // Get completed interviews (for history page)
    async getCompletedInterviews(): Promise<Array<Interview & {
        results?: {
            overallScore: number;
            summary: string;
            strengths: string;
            weaknesses: string;
        }
    }>> {
        const response = await fetch(`${API_BASE_URL}/interview?status=COMPLETED`, {
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch completed interviews');
        }

        return response.json();
    },
};

export interface InterviewQuestion {
    id: string;
    question: string;
}

export interface InterviewSession {
    interview: Interview;
    questions: InterviewQuestion[];
}

export interface InterviewResponse {
    questionId: string;
    question: string;
    answer: string;
    timeSpent: number; // in seconds
}

export interface InterviewAnalysis {
    overallScore: number;
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

export const interviewSessionApi = {
    // Start an interview session (generates questions)
    async startSession(interviewId: string, userId: string): Promise<InterviewSession> {
        const response = await fetch(`${API_BASE_URL}/interview-session/start/${interviewId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to start interview session');
        }

        const result = await response.json();
        return result.data;
    },

    // Get interview session details
    async getSession(interviewId: string): Promise<InterviewSession> {
        const response = await fetch(`${API_BASE_URL}/interview-session/${interviewId}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch interview session');
        }

        const result = await response.json();
        return result.data;
    },

    // Submit interview responses
    async submitSession(
        interviewId: string,
        responses: InterviewResponse[]
    ): Promise<{ result: any; analysis: InterviewAnalysis }> {
        const response = await fetch(`${API_BASE_URL}/interview-session/submit/${interviewId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ responses }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to submit interview');
        }

        const result = await response.json();
        return result.data;
    },

    // Get interview results
    async getResults(interviewId: string): Promise<{
        interview: Interview;
        results: {
            overallScore: number;
            summary: string;
            strengths: string[];
            weaknesses: string[];
        };
        questions: Array<{
            id: string;
            question: string;
            answer: string | null;
            score: number | null;
            feedback: string | null;
        }>;
        skillScores: Array<{
            skillName: string;
            score: number;
        }>;
    }> {
        const response = await fetch(`${API_BASE_URL}/interview-session/results/${interviewId}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch interview results');
        }

        const result = await response.json();
        return result.data;
    },
};

