type ProjectStatus = 'proposal' | 'active' | 'review' | 'completed' | 'archived';
type ClientStatus = 'lead' | 'active' | 'archived';
type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
type TaskStatus = 'todo' | 'in_progress' | 'done';

interface Project {
    id: string;
    user_id: string;
    client_id: string;
    title: string;
    description: string;
    status: ProjectStatus;
    progress: number;
    value: number;
    start_date: string;
    due_date: string;
    completed_date: string | null;
    created_at: string;
    updated_at: string;
}

interface Client {
    id: string;
    user_id: string;
    name: string;
    company: string;
    email: string;
    status: ClientStatus;
    total_billed: number;
    last_contact: string;
    created_at: string;
    updated_at: string;
}

interface Invoice {
    id: string;
    user_id: string;
    project_id: string;
    client_id: string;
    number: string;
    amount: number;
    status: InvoiceStatus;
    issue_date: string;
    due_date: string;
    paid_date: string | null;
    pdf_url: string | null;
    created_at: string;
    updated_at: string;
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
    created_at: string;
}

interface Profile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    hourly_rate: number;
    currency: string;
    bio: string | null;
    created_at: string;
    updated_at: string;
}

interface Task {
    id: string;
    project_id: string;
    title: string;
    description: string;
    status: TaskStatus;
    due_date: string;
    completed_date: string | null;
    is_overdue: boolean;
    created_at: string;
}

interface TimeEntry {
    id: string;
    project_id: string;
    user_id: string;
    description: string;
    hours: number;
    rate: number;
    entry_date: string;
    created_at: string;
}

export type {
    Project,
    Client,
    Invoice,
    PortfolioProject,
    Profile,
    Task,
    TimeEntry,
    ProjectStatus,
    ClientStatus,
    InvoiceStatus,
    TaskStatus,
};