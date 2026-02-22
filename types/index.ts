interface Project {
    id: string;
    user_id: string;
    client_id: string;
    title: string;
    description: string;
    status: string;
    progress: number;
    value: number;
    start_date: string;
    due_date: string;
    completed_date: string;
    created_at: string;
    updated_at: string;
}

interface Client {
    id: string;
    user_id: string;
    name: string;
    company: string;
    email: string;
    status: string;
    total_billed: number;
    last_contact: Date;
    created_at: Date;
    updated_at: Date;
}

interface Invoice {
    id: string;
    user_id: string;
    project_id: string;
    client_id: string;
    number: string;
    amount: number;
    status: string;
    issue_date: Date;
    due_date: Date;
    paid_date: Date | null;
    pdf_url: string;
    created_at: Date;
    updated_at: Date;
}

interface PortfolioProject {
    id: string;
    user_id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail_url: string;
    live_url: string;
    view_count: number;
    created_at: Date;
}

interface Profile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    hourly_rate: number;
    curency: string;
    bio: string | null;
    created_at: Date;
    updated_at: Date;
}

interface Task {
    id: string;
    project_id: string;
    title: string;
    description: string;
    status: string;
    due_date: Date;
    completed_date: Date;
    is_overdue: boolean;
    created_at: Date;
}

interface TimeEntry {
    id: string;
    project_id: string;
    user_id: string;
    description: string;
    hours: number;
    rate: number;
    entry_date: Date;
    created_at: Date;
}

export type { Project, Client, Invoice, PortfolioProject, Profile, Task, TimeEntry };