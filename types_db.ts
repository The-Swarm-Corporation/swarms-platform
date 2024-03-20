export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          stripe_customer_id: string | null
        }
        Insert: {
          id: string
          stripe_customer_id?: string | null
        }
        Update: {
          id?: string
          stripe_customer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_customers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      prices: {
        Row: {
          active: boolean | null
          currency: string | null
          description: string | null
          id: string
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count: number | null
          metadata: Json | null
          product_id: string | null
          trial_period_days: number | null
          type: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          description: string | null
          id: string
          image: string | null
          metadata: Json | null
          name: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          trial_end: string | null
          trial_start: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_api_activities: {
        Row: {
          all_cost: number | null
          api_key_id: string | null
          created_at: string
          echo: boolean | null
          id: string
          input_cost: number | null
          input_tokens: number | null
          max_tokens: number | null
          messages: Json | null
          model_id: string | null
          output_cost: number | null
          output_tokens: number | null
          repetition_penalty: number | null
          status: number | null
          stream: boolean | null
          temperature: number | null
          top_p: number | null
          user_id: string
        }
        Insert: {
          all_cost?: number | null
          api_key_id?: string | null
          created_at?: string
          echo?: boolean | null
          id?: string
          input_cost?: number | null
          input_tokens?: number | null
          max_tokens?: number | null
          messages?: Json | null
          model_id?: string | null
          output_cost?: number | null
          output_tokens?: number | null
          repetition_penalty?: number | null
          status?: number | null
          stream?: boolean | null
          temperature?: number | null
          top_p?: number | null
          user_id: string
        }
        Update: {
          all_cost?: number | null
          api_key_id?: string | null
          created_at?: string
          echo?: boolean | null
          id?: string
          input_cost?: number | null
          input_tokens?: number | null
          max_tokens?: number | null
          messages?: Json | null
          model_id?: string | null
          output_cost?: number | null
          output_tokens?: number | null
          repetition_penalty?: number | null
          status?: number | null
          stream?: boolean | null
          temperature?: number | null
          top_p?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_swarms_cloud_api_activities_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_swarms_cloud_api_activities_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_swarms_cloud_api_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_api_keys: {
        Row: {
          created_at: string
          id: string
          is_deleted: boolean | null
          key: string
          limit_credit_dollar: number | null
          name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          key: string
          limit_credit_dollar?: number | null
          name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          key?: string
          limit_credit_dollar?: number | null
          name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_swarms_cloud_api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_models: {
        Row: {
          context_length: number | null
          created_at: string
          creator: string | null
          default_config: Json | null
          description: string | null
          docs: Json | null
          enabled: boolean | null
          id: string
          model_parameter: string | null
          model_type: Database["public"]["Enums"]["model_type"] | null
          name: string | null
          per_1k_input_price: number | null
          per_1k_output_price: number | null
          provider: string | null
          support_functions: boolean | null
          unique_name: string
          updated_at: string | null
        }
        Insert: {
          context_length?: number | null
          created_at?: string
          creator?: string | null
          default_config?: Json | null
          description?: string | null
          docs?: Json | null
          enabled?: boolean | null
          id?: string
          model_parameter?: string | null
          model_type?: Database["public"]["Enums"]["model_type"] | null
          name?: string | null
          per_1k_input_price?: number | null
          per_1k_output_price?: number | null
          provider?: string | null
          support_functions?: boolean | null
          unique_name: string
          updated_at?: string | null
        }
        Update: {
          context_length?: number | null
          created_at?: string
          creator?: string | null
          default_config?: Json | null
          description?: string | null
          docs?: Json | null
          enabled?: boolean | null
          id?: string
          model_parameter?: string | null
          model_type?: Database["public"]["Enums"]["model_type"] | null
          name?: string | null
          per_1k_input_price?: number | null
          per_1k_output_price?: number | null
          provider?: string | null
          support_functions?: boolean | null
          unique_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      swarms_cloud_monthly_usage: {
        Row: {
          api_requests_count: number | null
          created_at: string
          id: string
          month: string | null
          usage: number | null
          user_id: string | null
        }
        Insert: {
          api_requests_count?: number | null
          created_at?: string
          id?: string
          month?: string | null
          usage?: number | null
          user_id?: string | null
        }
        Update: {
          api_requests_count?: number | null
          created_at?: string
          id?: string
          month?: string | null
          usage?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_swarms_cloud_monthly_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_stripe_invoices: {
        Row: {
          amount: number | null
          created_at: string
          id: number
          monthly_usage_id: string | null
          status: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: number
          monthly_usage_id?: string | null
          status?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: number
          monthly_usage_id?: string | null
          status?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_swarms_cloud_stripe_invoices_monthly_usage_id_fkey"
            columns: ["monthly_usage_id"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_monthly_usage"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_swarms_cloud_stripe_invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_users_credits: {
        Row: {
          created_at: string
          credit: number | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          credit?: number | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          credit?: number | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_swarms_cloud_users_credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_users_tiers: {
        Row: {
          created_at: string
          id: string
          tier: Database["public"]["Enums"]["user_tier"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          tier?: Database["public"]["Enums"]["user_tier"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          tier?: Database["public"]["Enums"]["user_tier"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_swarms_cloud_users_tiers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          billing_address: Json | null
          full_name: string | null
          id: string
          payment_method: Json | null
        }
        Insert: {
          avatar_url?: string | null
          billing_address?: Json | null
          full_name?: string | null
          id: string
          payment_method?: Json | null
        }
        Update: {
          avatar_url?: string | null
          billing_address?: Json | null
          full_name?: string | null
          id?: string
          payment_method?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      model_type: "text" | "vision"
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
        | "paused"
      user_tier: "tier1" | "tier2" | "tier3" | "tier4"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
