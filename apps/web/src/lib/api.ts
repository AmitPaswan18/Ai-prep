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
};
