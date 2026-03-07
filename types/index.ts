type ProjectStatus = 'proposal' | 'active' | 'on_hold' | 'review' | 'completed' | 'archived' | 'draft';
type ClientStatus = 'lead' | 'active' | 'archived';
type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
type TaskStatus = 'todo' | 'in_progress' | 'done';
type PortfolioProjectStatus = 'draft' | 'published' | 'archived';

interface Project {
    id: string;
    user_id: string;
    client_id?: string;
    title: string;
    description?: string;
    status: ProjectStatus;
    progress: number;
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    color?: string;
    value: number;
    budget: number;
    currency: string;
    estimated_hours: number;
    actual_hours: number;
    profit_margin: number;
    tags?: Tag[];
    start_date?: string;
    due_date?: string;
    completed_date?: string | null;
    created_at: string;
    updated_at: string;
}

interface Client {
    id: string;
    user_id: string;
    name: string;
    status: ClientStatus;
    company?: string;
    industry?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    country?: string;
    vat_number?: string;
    total_billed?: number;
    last_contact?: string;
    created_at: string;
    updated_at: string;
}

interface Invoice {
    id: string;
    user_id: string;
    project_id: string;
    client_id: string;
    transaction_id?: string;
    code: string;
    line_items?: LineItem[];
    currency: string;
    discount_amount?: number;
    subtotal: number;
    total: number;
    status: InvoiceStatus;
    issue_date?: string;
    due_date?: string;
    paid_date?: string;
    pdf_url?: string;
    payment_method?: 'bank_transfer' | 'stripe' | 'paypal' | 'cash' | 'other';
    reminder_count?: number;
    created_at: string;
    updated_at: string;
}

interface LineItem {
    id: string;
    invoice_id: string;
    description?: string;
    quantity: number;
    unit_price: number;
    total: number;
    tax_rate?: number;
    created_at: string;
    updated_at: string;
}

interface PortfolioProject {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    seo_title?: string;
    seo_description?: string;
    slug?: string;
    status: PortfolioProjectStatus;
    technologies?: string[];
    featured?: boolean;
    thumbnail_url?: string;
    live_url?: string;
    view_count: number;
    published_at?: string;
    created_at: string;
}

interface Profile {
    id: string;
    tax_id?: string;
    username: string;
    full_name: string;
    company_name?: string;
    address?: string;
    timezone?: string;
    language?: string;
    avatar_url?: string | null;
    hourly_rate: number;
    currency: string;
    bio?: string | null;
    created_at: string;
    updated_at: string;
    notification_preferences?: {
        email: boolean;
        invoice_reminders: boolean;
    }
}

interface Task {
    id: string;
    project_id: string;
    assignee_id?: string;
    parent_task_id?: string;
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    status: TaskStatus;
    due_date: string;
    completed_date: string | null;
    is_overdue: boolean;
    estimated_hours: number;
    actual_hours: number;
    created_at: string;
}

interface Tag {
    id: string;
    name: string;
    color: string;
}

interface TimeEntry {
    id: string;
    project_id: string;
    user_id: string;
    invoice_id?: string;
    task_id?: string;
    description?: string;
    hours: number;
    rate: number;
    approved: boolean;
    billable: boolean;
    entry_date: string;
    created_at: string;
}

export type {
    Client,
    ClientStatus,
    Invoice,
    InvoiceStatus,
    PortfolioProject,
    Profile,
    Project,
    ProjectStatus,
    Task,
    TaskStatus,
    TimeEntry,
};