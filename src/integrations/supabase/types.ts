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
      coupons: {
        Row: {
          applies_to: string
          code: string
          created_at: string
          description: string | null
          discount_percent: number
          id: string
          is_active: boolean
          product_handles: string[]
          updated_at: string
        }
        Insert: {
          applies_to?: string
          code: string
          created_at?: string
          description?: string | null
          discount_percent: number
          id?: string
          is_active?: boolean
          product_handles?: string[]
          updated_at?: string
        }
        Update: {
          applies_to?: string
          code?: string
          created_at?: string
          description?: string | null
          discount_percent?: number
          id?: string
          is_active?: boolean
          product_handles?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      guides: {
        Row: {
          body_md: string
          category: string
          created_at: string
          excerpt: string
          faq: Json
          hero_image: string | null
          id: string
          published: boolean
          published_at: string | null
          reading_minutes: number
          related_slugs: string[]
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          body_md: string
          category?: string
          created_at?: string
          excerpt: string
          faq?: Json
          hero_image?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          reading_minutes?: number
          related_slugs?: string[]
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          body_md?: string
          category?: string
          created_at?: string
          excerpt?: string
          faq?: Json
          hero_image?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          reading_minutes?: number
          related_slugs?: string[]
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          source: string | null
          subscribed_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          source?: string | null
          subscribed_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          source?: string | null
          subscribed_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      product_size_charts: {
        Row: {
          created_at: string
          id: string
          image_url: string
          product_handle: string
          product_title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          product_handle: string
          product_title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          product_handle?: string
          product_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sac_tickets: {
        Row: {
          admin_notes: string | null
          attachments: string[] | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          order_number: string | null
          status: string
          subject: string
          ticket_type: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          admin_notes?: string | null
          attachments?: string[] | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          order_number?: string | null
          status?: string
          subject: string
          ticket_type?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          admin_notes?: string | null
          attachments?: string[] | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          order_number?: string | null
          status?: string
          subject?: string
          ticket_type?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      support_ticket_notes: {
        Row: {
          action_taken: string | null
          author_email: string
          author_id: string
          content: string
          created_at: string
          id: string
          ticket_id: string
        }
        Insert: {
          action_taken?: string | null
          author_email: string
          author_id: string
          content: string
          created_at?: string
          id?: string
          ticket_id: string
        }
        Update: {
          action_taken?: string | null
          author_email?: string
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_notes_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_response: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_whatsapp: string | null
          description: string
          id: string
          issue_type: string
          product_handle: string | null
          product_title: string | null
          resolved_at: string | null
          session_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_whatsapp?: string | null
          description: string
          id?: string
          issue_type?: string
          product_handle?: string | null
          product_title?: string | null
          resolved_at?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_whatsapp?: string | null
          description?: string
          id?: string
          issue_type?: string
          product_handle?: string | null
          product_title?: string | null
          resolved_at?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          comment: string
          created_at: string
          customer_name: string
          display_order: number
          id: string
          is_active: boolean
          location: string | null
          product_name: string | null
          rating: number
          source: string | null
          updated_at: string
        }
        Insert: {
          comment: string
          created_at?: string
          customer_name: string
          display_order?: number
          id?: string
          is_active?: boolean
          location?: string | null
          product_name?: string | null
          rating?: number
          source?: string | null
          updated_at?: string
        }
        Update: {
          comment?: string
          created_at?: string
          customer_name?: string
          display_order?: number
          id?: string
          is_active?: boolean
          location?: string | null
          product_name?: string | null
          rating?: number
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wholesale_orders: {
        Row: {
          admin_notes: string | null
          cart_items: Json
          created_at: string
          currency_code: string
          customer_document: string | null
          customer_email: string
          customer_name: string
          customer_whatsapp: string
          id: string
          order_number: string | null
          payment_method: string | null
          shipping_address: Json
          shipping_cost: number
          shipping_region: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          cart_items?: Json
          created_at?: string
          currency_code?: string
          customer_document?: string | null
          customer_email: string
          customer_name: string
          customer_whatsapp: string
          id?: string
          order_number?: string | null
          payment_method?: string | null
          shipping_address?: Json
          shipping_cost?: number
          shipping_region?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          cart_items?: Json
          created_at?: string
          currency_code?: string
          customer_document?: string | null
          customer_email?: string
          customer_name?: string
          customer_whatsapp?: string
          id?: string
          order_number?: string | null
          payment_method?: string | null
          shipping_address?: Json
          shipping_cost?: number
          shipping_region?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
