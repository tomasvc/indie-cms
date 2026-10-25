export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          company: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          industry: string | null
          last_contact: string | null
          name: string
          phone: string | null
          status: string | null
          total_billed: number | null
          updated_at: string | null
          user_id: string
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          last_contact?: string | null
          name: string
          phone?: string | null
          status?: string | null
          total_billed?: number | null
          updated_at?: string | null
          user_id: string
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          last_contact?: string | null
          name?: string
          phone?: string | null
          status?: string | null
          total_billed?: number | null
          updated_at?: string | null
          user_id?: string
          vat_number?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string | null
          code: string
          created_at: string | null
          currency: string
          discount_amount: number | null
          discount_type: string
          discount_value: number
          due_date: string
          id: string
          issue_date: string | null
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          pdf_url: string | null
          project_id: string | null
          reminder_count: number | null
          status: string
          subtotal: number
          total: number
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          code: string
          created_at?: string | null
          currency: string
          discount_amount?: number | null
          discount_type?: string
          discount_value?: number
          due_date: string
          id?: string
          issue_date?: string | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          project_id?: string | null
          reminder_count?: number | null
          status: string
          subtotal: number
          total: number
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          code?: string
          created_at?: string | null
          currency?: string
          discount_amount?: number | null
          discount_type?: string
          discount_value?: number
          due_date?: string
          id?: string
          issue_date?: string | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          project_id?: string | null
          reminder_count?: number | null
          status?: string
          subtotal?: number
          total?: number
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      line_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          invoice_id: string
          position: number
          quantity: number
          tax_rate: number | null
          total: number
          unit: string | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          invoice_id: string
          position?: number
          quantity?: number
          tax_rate?: number | null
          total: number
          unit?: string | null
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          invoice_id?: string
          position?: number
          quantity?: number
          tax_rate?: number | null
          total?: number
          unit?: string | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean
          live_url: string | null
          slug: string | null
          thumbnail_url: string | null
          title: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          live_url?: string | null
          slug?: string | null
          thumbnail_url?: string | null
          title: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          live_url?: string | null
          slug?: string | null
          thumbnail_url?: string | null
          title?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          created_at: string | null
          currency: string | null
          full_name: string
          hourly_rate: number | null
          id: string
          language: string | null
          notification_preferences: Json | null
          onboarding_completed_at: string | null
          tax_id: string | null
          timezone: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          currency?: string | null
          full_name: string
          hourly_rate?: number | null
          id: string
          language?: string | null
          notification_preferences?: Json | null
          onboarding_completed_at?: string | null
          tax_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          currency?: string | null
          full_name?: string
          hourly_rate?: number | null
          id?: string
          language?: string | null
          notification_preferences?: Json | null
          onboarding_completed_at?: string | null
          tax_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          actual_hours: number | null
          budget: number | null
          category: string | null
          client_id: string | null
          color: string | null
          completed_date: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          featured: boolean | null
          id: string
          live_url: string | null
          priority: string | null
          profit_margin: number | null
          progress: number | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          start_date: string | null
          status: string
          tags: Json | null
          technologies: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
          value: number | null
          view_count: number | null
        }
        Insert: {
          actual_hours?: number | null
          budget?: number | null
          category?: string | null
          client_id?: string | null
          color?: string | null
          completed_date?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          featured?: boolean | null
          id?: string
          live_url?: string | null
          priority?: string | null
          profit_margin?: number | null
          progress?: number | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          start_date?: string | null
          status: string
          tags?: Json | null
          technologies?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          value?: number | null
          view_count?: number | null
        }
        Update: {
          actual_hours?: number | null
          budget?: number | null
          category?: string | null
          client_id?: string | null
          color?: string | null
          completed_date?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          featured?: boolean | null
          id?: string
          live_url?: string | null
          priority?: string | null
          profit_margin?: number | null
          progress?: number | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          start_date?: string | null
          status?: string
          tags?: Json | null
          technologies?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          value?: number | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assignee_id: string | null
          completed_date: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          is_overdue: boolean | null
          parent_task_id: string | null
          priority: string | null
          project_id: string
          status: string | null
          title: string
        }
        Insert: {
          actual_hours?: number | null
          assignee_id?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          is_overdue?: boolean | null
          parent_task_id?: string | null
          priority?: string | null
          project_id: string
          status?: string | null
          title: string
        }
        Update: {
          actual_hours?: number | null
          assignee_id?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          is_overdue?: boolean | null
          parent_task_id?: string | null
          priority?: string | null
          project_id?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          approved: boolean | null
          billable: boolean | null
          created_at: string | null
          description: string | null
          entry_date: string | null
          hours: number
          id: string
          invoice_id: string | null
          project_id: string | null
          rate: number | null
          task_id: string | null
          user_id: string
        }
        Insert: {
          approved?: boolean | null
          billable?: boolean | null
          created_at?: string | null
          description?: string | null
          entry_date?: string | null
          hours: number
          id?: string
          invoice_id?: string | null
          project_id?: string | null
          rate?: number | null
          task_id?: string | null
          user_id: string
        }
        Update: {
          approved?: boolean | null
          billable?: boolean | null
          created_at?: string | null
          description?: string | null
          entry_date?: string | null
          hours?: number
          id?: string
          invoice_id?: string | null
          project_id?: string | null
          rate?: number | null
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_invoice: {
        Args: { p_invoice: Json; p_line_items: Json }
        Returns: string
      }
      invoice_totals: {
        Args: {
          p_discount_type: string
          p_discount_value: number
          p_line_items: Json
        }
        Returns: {
          discount_amount: number
          subtotal: number
          total: number
        }[]
      }
      replace_invoice_line_items: {
        Args: { p_invoice_id: string; p_line_items: Json }
        Returns: undefined
      }
      update_invoice: {
        Args: { p_id: string; p_invoice: Json; p_line_items: Json }
        Returns: undefined
      }
    }
    Enums: {
      client_status: "lead" | "active" | "archived"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "void"
      portfolio_project_status: "draft" | "published" | "archived"
      project_status:
        | "proposal"
        | "active"
        | "on_hold"
        | "review"
        | "completed"
        | "archived"
        | "draft"
      task_status: "todo" | "in_progress" | "done"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      client_status: ["lead", "active", "archived"],
      invoice_status: ["draft", "sent", "paid", "overdue", "void"],
      portfolio_project_status: ["draft", "published", "archived"],
      project_status: [
        "proposal",
        "active",
        "on_hold",
        "review",
        "completed",
        "archived",
        "draft",
      ],
      task_status: ["todo", "in_progress", "done"],
    },
  },
} as const
