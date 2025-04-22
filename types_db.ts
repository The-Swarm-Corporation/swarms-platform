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
      access_logs: {
        Row: {
          access_time: string
          action: string
          id: string
          table_name: string
          user_name: string
        }
        Insert: {
          access_time?: string
          action: string
          id?: string
          table_name: string
          user_name: string
        }
        Update: {
          access_time?: string
          action?: string
          id?: string
          table_name?: string
          user_name?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          action: string
          category: string
          created_at: string
          details: Json
          error_message: string | null
          id: string
          ip_address: string | null
          level: string
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          action: string
          category: string
          created_at?: string
          details?: Json
          error_message?: string | null
          id?: string
          ip_address?: string | null
          level: string
          user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          action?: string
          category?: string
          created_at?: string
          details?: Json
          error_message?: string | null
          id?: string
          ip_address?: string | null
          level?: string
          user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "web3users"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_comments: {
        Row: {
          agent_id: string
          content: string
          created_at: string
          id: string
          is_edited: boolean
          metadata: Json | null
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          content: string
          created_at?: string
          id?: string
          is_edited?: boolean
          metadata?: Json | null
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          content?: string
          created_at?: string
          id?: string
          is_edited?: boolean
          metadata?: Json | null
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_comments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_statistics"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_comments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "web3agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "agent_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "web3users"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_prices: {
        Row: {
          agent_id: string | null
          id: string
          market_cap: number
          price: number
          timestamp: string
          volume_24h: number
        }
        Insert: {
          agent_id?: string | null
          id?: string
          market_cap?: number
          price: number
          timestamp?: string
          volume_24h?: number
        }
        Update: {
          agent_id?: string | null
          id?: string
          market_cap?: number
          price?: number
          timestamp?: string
          volume_24h?: number
        }
        Relationships: [
          {
            foreignKeyName: "agent_prices_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_statistics"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_prices_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "web3agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_trades: {
        Row: {
          agent_id: string | null
          amount: number
          created_at: string
          id: string
          price: number
          total_value: number
          trade_type: string
          trader_id: string | null
          transaction_signature: string
        }
        Insert: {
          agent_id?: string | null
          amount: number
          created_at?: string
          id?: string
          price: number
          total_value: number
          trade_type: string
          trader_id?: string | null
          transaction_signature: string
        }
        Update: {
          agent_id?: string | null
          amount?: number
          created_at?: string
          id?: string
          price?: number
          total_value?: number
          trade_type?: string
          trader_id?: string | null
          transaction_signature?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_trades_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_statistics"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_trades_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "web3agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_trades_trader_id_fkey"
            columns: ["trader_id"]
            isOneToOne: false
            referencedRelation: "web3users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_transactions: {
        Row: {
          agent_id: string
          amount: number
          created_at: string
          id: number
          recipient: string
          status: string
          transaction_hash: string
        }
        Insert: {
          agent_id: string
          amount: number
          created_at?: string
          id?: number
          recipient: string
          status: string
          transaction_hash: string
        }
        Update: {
          agent_id?: string
          amount?: number
          created_at?: string
          id?: number
          recipient?: string
          status?: string
          transaction_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_transactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_wallets: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          iv: string
          private_key: string
          public_key: string
          status: string
          wallet_type: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          iv?: string
          private_key: string
          public_key: string
          status: string
          wallet_type: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          iv?: string
          private_key?: string
          public_key?: string
          status?: string
          wallet_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_wallets_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          api_key: string
          created_at: string
          id: string
          name: string | null
          status: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          name?: string | null
          status?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          name?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_api_key_fkey"
            columns: ["api_key"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_api_keys"
            referencedColumns: ["key"]
          },
        ]
      }
      ai_tokens: {
        Row: {
          bonding_curve_address: string
          created_at: string
          created_by: string
          graduated: boolean
          id: number
          mint_address: string
          pool_address: string | null
          swarms_reserve: string
          ticker_symbol: string
          token_name: string
        }
        Insert: {
          bonding_curve_address: string
          created_at?: string
          created_by: string
          graduated?: boolean
          id?: number
          mint_address: string
          pool_address?: string | null
          swarms_reserve: string
          ticker_symbol: string
          token_name: string
        }
        Update: {
          bonding_curve_address?: string
          created_at?: string
          created_by?: string
          graduated?: boolean
          id?: number
          mint_address?: string
          pool_address?: string | null
          swarms_reserve?: string
          ticker_symbol?: string
          token_name?: string
        }
        Relationships: []
      }
      auth_nonces: {
        Row: {
          attempts: number
          created_at: string
          nonce: string
          timestamp: number
        }
        Insert: {
          attempts?: number
          created_at?: string
          nonce: string
          timestamp: number
        }
        Update: {
          attempts?: number
          created_at?: string
          nonce?: string
          timestamp?: number
        }
        Relationships: []
      }
      bonding_curve_keys: {
        Row: {
          agent_id: string | null
          created_at: string
          encrypted_private_key: string
          id: string
          metadata: Json | null
          pool_keys: string | null
          pool_signature: string | null
          public_key: string
          token_signature: string | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          encrypted_private_key: string
          id?: string
          metadata?: Json | null
          pool_keys?: string | null
          pool_signature?: string | null
          public_key: string
          token_signature?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          encrypted_private_key?: string
          id?: string
          metadata?: Json | null
          pool_keys?: string | null
          pool_signature?: string | null
          public_key?: string
          token_signature?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bonding_curve_keys_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_statistics"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "bonding_curve_keys_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "web3agents"
            referencedColumns: ["id"]
          },
        ]
      }
      create_now_accounts: {
        Row: {
          created_at: string
          customer_id: string | null
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      create_now_gallery: {
        Row: {
          created_at: string
          gallery_id: number
          gen_id: number | null
          likes: number | null
          link: string | null
          runid: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          gallery_id?: number
          gen_id?: number | null
          likes?: number | null
          link?: string | null
          runid?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          gallery_id?: number
          gen_id?: number | null
          likes?: number | null
          link?: string | null
          runid?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_gen_id_fkey"
            columns: ["gen_id"]
            isOneToOne: false
            referencedRelation: "create_now_gen_history"
            referencedColumns: ["id"]
          },
        ]
      }
      create_now_gen_history: {
        Row: {
          created_at: string
          gen_type: string
          id: number
          link: string | null
          metadata: Json
          model: string
          prompt: string | null
          public_state: boolean
          run_id: string | null
        }
        Insert: {
          created_at?: string
          gen_type: string
          id?: number
          link?: string | null
          metadata: Json
          model: string
          prompt?: string | null
          public_state?: boolean
          run_id?: string | null
        }
        Update: {
          created_at?: string
          gen_type?: string
          id?: number
          link?: string | null
          metadata?: Json
          model?: string
          prompt?: string | null
          public_state?: boolean
          run_id?: string | null
        }
        Relationships: []
      }
      create_now_gen_history_nsfw_creators: {
        Row: {
          created_at: string
          gen_type: string
          id: number
          link: string | null
          metadata: Json
          model: string
          prompt: string | null
          public_state: boolean
          run_id: string | null
        }
        Insert: {
          created_at?: string
          gen_type: string
          id: number
          link?: string | null
          metadata: Json
          model: string
          prompt?: string | null
          public_state?: boolean
          run_id?: string | null
        }
        Update: {
          created_at?: string
          gen_type?: string
          id?: number
          link?: string | null
          metadata?: Json
          model?: string
          prompt?: string | null
          public_state?: boolean
          run_id?: string | null
        }
        Relationships: []
      }
      create_now_gen_types: {
        Row: {
          gentype: string
          id: number
        }
        Insert: {
          gentype: string
          id?: number
        }
        Update: {
          gentype?: string
          id?: number
        }
        Relationships: []
      }
      create_now_models: {
        Row: {
          created_at: string
          id: number
          modelname: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          modelname?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          modelname?: string | null
        }
        Relationships: []
      }
      create_now_referrals: {
        Row: {
          created_at: string
          id: string
          referrals: number | null
        }
        Insert: {
          created_at?: string
          id: string
          referrals?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          referrals?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "create_now_referrals_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount_usd: number
          created_at: string
          credits_added: number
          id: string
          status: string
          transaction_hash: string | null
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_usd: number
          created_at?: string
          credits_added: number
          id?: string
          status?: string
          transaction_hash?: string | null
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_usd?: number
          created_at?: string
          credits_added?: number
          id?: string
          status?: string
          transaction_hash?: string | null
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_users"
            referencedColumns: ["id"]
          },
        ]
      }
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
            referencedRelation: "safe_users"
            referencedColumns: ["id"]
          },
        ]
      }
      drag_and_drop_flows: {
        Row: {
          created_at: string
          current: boolean | null
          flow_data: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current?: boolean | null
          flow_data: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current?: boolean | null
          flow_data?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drag_and_drop_flows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_users"
            referencedColumns: ["id"]
          },
        ]
      }
      failed_pool_creations: {
        Row: {
          bonding_curve_address: string | null
          created_at: string
          error: string | null
          id: number
          mint_address: string | null
          reason: string | null
        }
        Insert: {
          bonding_curve_address?: string | null
          created_at?: string
          error?: string | null
          id?: number
          mint_address?: string | null
          reason?: string | null
        }
        Update: {
          bonding_curve_address?: string | null
          created_at?: string
          error?: string | null
          id?: number
          mint_address?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "failed_pool_creations_bonding_curve_address_fkey"
            columns: ["bonding_curve_address"]
            isOneToOne: false
            referencedRelation: "bonding_curve_keys"
            referencedColumns: ["public_key"]
          },
        ]
      }
      invoices: {
        Row: {
          created: string | null
          created_at: string
          id: string
          is_paid: boolean | null
          metadata: Json | null
          period_at: string | null
          period_end: string | null
          reason: string | null
          status: string | null
          status_transitions: Json | null
          stripe_customer_id: string | null
          total: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created?: string | null
          created_at?: string
          id: string
          is_paid?: boolean | null
          metadata?: Json | null
          period_at?: string | null
          period_end?: string | null
          reason?: string | null
          status?: string | null
          status_transitions?: Json | null
          stripe_customer_id?: string | null
          total?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created?: string | null
          created_at?: string
          id?: string
          is_paid?: boolean | null
          metadata?: Json | null
          period_at?: string | null
          period_end?: string | null
          reason?: string | null
          status?: string | null
          status_transitions?: Json | null
          stripe_customer_id?: string | null
          total?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      meteora_individual_transactions: {
        Row: {
          created_at: string
          id: string
          is_swap: boolean
          mint_address: string
          price: number | null
          side: string | null
          signature: string
          size: number | null
          timestamp: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_swap?: boolean
          mint_address: string
          price?: number | null
          side?: string | null
          signature: string
          size?: number | null
          timestamp: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_swap?: boolean
          mint_address?: string
          price?: number | null
          side?: string | null
          signature?: string
          size?: number | null
          timestamp?: number
          updated_at?: string
        }
        Relationships: []
      }
      meteora_pool_stats: {
        Row: {
          created_at: string
          data: Json
          id: number
          mint_address: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: number
          mint_address: string
          updated_at: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: number
          mint_address?: string
          updated_at?: string
        }
        Relationships: []
      }
      meteora_transactions: {
        Row: {
          created_at: string
          data: Json
          id: string
          mint_address: string
          transaction_signature: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          mint_address: string
          transaction_signature?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          mint_address?: string
          transaction_signature?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      referrals: {
        Row: {
          created_at: string | null
          id: number
          referred_id: string | null
          referrer_id: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          referred_id?: string | null
          referrer_id?: string | null
          status: string
        }
        Update: {
          created_at?: string | null
          id?: never
          referred_id?: string | null
          referrer_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "safe_users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarm_cloud_billing_transcations: {
        Row: {
          created_at: string
          id: string
          invoice_id: string | null
          payment_successful: boolean
          stripe_customer_id: string | null
          total_montly_cost: number | null
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id?: string | null
          payment_successful?: boolean
          stripe_customer_id?: string | null
          total_montly_cost?: number | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string | null
          payment_successful?: boolean
          stripe_customer_id?: string | null
          total_montly_cost?: number | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Swarm Cloud Billing Transcations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_api_logs: {
        Row: {
          api_key: string | null
          created_at: string
          data: Json | null
          id: number
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          data?: Json | null
          id?: number
        }
        Update: {
          api_key?: string | null
          created_at?: string
          data?: Json | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "swarms_api_logs_api_key_fkey"
            columns: ["api_key"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_api_keys"
            referencedColumns: ["key"]
          },
        ]
      }
      swarms_cloud_agents: {
        Row: {
          agent: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          language: string | null
          name: string | null
          requirements: Json | null
          search_type: string
          status: Database["public"]["Enums"]["user_agents_status"] | null
          tags: string | null
          use_cases: Json | null
          user_id: string | null
        }
        Insert: {
          agent?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          language?: string | null
          name?: string | null
          requirements?: Json | null
          search_type?: string
          status?: Database["public"]["Enums"]["user_agents_status"] | null
          tags?: string | null
          use_cases?: Json | null
          user_id?: string | null
        }
        Update: {
          agent?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          language?: string | null
          name?: string | null
          requirements?: Json | null
          search_type?: string
          status?: Database["public"]["Enums"]["user_agents_status"] | null
          tags?: string | null
          use_cases?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      swarms_cloud_api_activities: {
        Row: {
          api_key_id: string | null
          created_at: string
          echo: boolean | null
          id: string
          input_cost: number | null
          input_tokens: number | null
          invoice_total_cost: number
          max_tokens: number | null
          messages: Json | null
          model_id: string | null
          organization_id: string | null
          output_cost: number | null
          output_tokens: number | null
          repetition_penalty: number | null
          request_count: number
          stream: boolean | null
          temperature: number | null
          top_p: number | null
          total_cost: number | null
          user_id: string
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          echo?: boolean | null
          id?: string
          input_cost?: number | null
          input_tokens?: number | null
          invoice_total_cost?: number
          max_tokens?: number | null
          messages?: Json | null
          model_id?: string | null
          organization_id?: string | null
          output_cost?: number | null
          output_tokens?: number | null
          repetition_penalty?: number | null
          request_count?: number
          stream?: boolean | null
          temperature?: number | null
          top_p?: number | null
          total_cost?: number | null
          user_id: string
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          echo?: boolean | null
          id?: string
          input_cost?: number | null
          input_tokens?: number | null
          invoice_total_cost?: number
          max_tokens?: number | null
          messages?: Json | null
          model_id?: string | null
          organization_id?: string | null
          output_cost?: number | null
          output_tokens?: number | null
          repetition_penalty?: number | null
          request_count?: number
          stream?: boolean | null
          temperature?: number | null
          top_p?: number | null
          total_cost?: number | null
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
            foreignKeyName: "public_swarms_cloud_api_activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_organizations"
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
      swarms_cloud_blacklists: {
        Row: {
          created_at: string
          id: string
          list: Json | null
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          list?: Json | null
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          list?: Json | null
          type?: string | null
        }
        Relationships: []
      }
      swarms_cloud_chat: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_archived: boolean | null
          max_loops: number
          name: string
          share_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          max_loops?: number
          name: string
          share_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          max_loops?: number
          name?: string
          share_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swarms_cloud_chat_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_chat_agent_templates: {
        Row: {
          auto_generate_prompt: boolean
          created_at: string | null
          description: string | null
          id: string
          max_loops: number
          max_tokens: number | null
          metadata: Json | null
          model: string
          name: string
          role: string
          system_prompt: string | null
          temperature: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_generate_prompt?: boolean
          created_at?: string | null
          description?: string | null
          id?: string
          max_loops?: number
          max_tokens?: number | null
          metadata?: Json | null
          model: string
          name: string
          role?: string
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_generate_prompt?: boolean
          created_at?: string | null
          description?: string | null
          id?: string
          max_loops?: number
          max_tokens?: number | null
          metadata?: Json | null
          model?: string
          name?: string
          role?: string
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swarms_cloud_chat_agent_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_chat_agents: {
        Row: {
          auto_generate_prompt: boolean
          chat_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_loops: number
          max_tokens: number | null
          model: string
          name: string
          role: string
          system_prompt: string | null
          temperature: number | null
          template_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_generate_prompt?: boolean
          chat_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_loops?: number
          max_tokens?: number | null
          model: string
          name: string
          role?: string
          system_prompt?: string | null
          temperature?: number | null
          template_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_generate_prompt?: boolean
          chat_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_loops?: number
          max_tokens?: number | null
          model?: string
          name?: string
          role?: string
          system_prompt?: string | null
          temperature?: number | null
          template_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swarms_cloud_chat_agents_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_chat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swarms_cloud_chat_agents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_chat_agent_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swarms_cloud_chat_agents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_chat_messages: {
        Row: {
          agent_id: string | null
          chat_id: string | null
          content: Json | null
          created_at: string | null
          id: string
          img: string | null
          is_deleted: boolean
          is_edited: boolean | null
          metadata: Json | null
          role: string
          structured_content: Json | null
          timestamp: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          chat_id?: string | null
          content?: Json | null
          created_at?: string | null
          id?: string
          img?: string | null
          is_deleted?: boolean
          is_edited?: boolean | null
          metadata?: Json | null
          role: string
          structured_content?: Json | null
          timestamp?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          chat_id?: string | null
          content?: Json | null
          created_at?: string | null
          id?: string
          img?: string | null
          is_deleted?: boolean
          is_edited?: boolean | null
          metadata?: Json | null
          role?: string
          structured_content?: Json | null
          timestamp?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swarms_cloud_chat_messages_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_chat_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swarms_cloud_chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_chat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swarms_cloud_chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_chat_swarm_agents: {
        Row: {
          agent_id: string
          position: number
          swarm_config_id: string
          user_id: string | null
        }
        Insert: {
          agent_id: string
          position: number
          swarm_config_id: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          position?: number
          swarm_config_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swarms_cloud_chat_swarm_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_chat_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swarms_cloud_chat_swarm_agents_swarm_config_id_fkey"
            columns: ["swarm_config_id"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_chat_swarm_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swarms_cloud_chat_swarm_agents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_chat_swarm_configs: {
        Row: {
          architecture: string
          chat_id: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          architecture: string
          chat_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          architecture?: string
          chat_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swarms_cloud_chat_swarm_configs_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_chat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swarms_cloud_chat_swarm_configs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_comments: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_edited: boolean
          like_count: number
          model_id: string | null
          model_type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_edited?: boolean
          like_count?: number
          model_id?: string | null
          model_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_edited?: boolean
          like_count?: number
          model_id?: string | null
          model_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swarms_cloud_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_comments_replies: {
        Row: {
          comment_id: string
          content: string | null
          created_at: string
          id: string
          is_edited: boolean
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string
          content?: string | null
          created_at?: string
          id?: string
          is_edited?: boolean
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string
          content?: string | null
          created_at?: string
          id?: string
          is_edited?: boolean
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swarms_cloud_comments_replies_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swarms_cloud_comments_replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_hosted_agents: {
        Row: {
          api_key: string | null
          autoscaling: boolean | null
          code: string | null
          created_at: string
          description: string | null
          envs: string | null
          id: number
          is_active: boolean | null
          name: string | null
          requirements: string | null
          updated_now: string | null
          user_id: string | null
        }
        Insert: {
          api_key?: string | null
          autoscaling?: boolean | null
          code?: string | null
          created_at?: string
          description?: string | null
          envs?: string | null
          id?: number
          is_active?: boolean | null
          name?: string | null
          requirements?: string | null
          updated_now?: string | null
          user_id?: string | null
        }
        Update: {
          api_key?: string | null
          autoscaling?: boolean | null
          code?: string | null
          created_at?: string
          description?: string | null
          envs?: string | null
          id?: number
          is_active?: boolean | null
          name?: string | null
          requirements?: string | null
          updated_now?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swarms_cloud_hosted_agents_api_key_fkey"
            columns: ["api_key"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_api_keys"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "swarms_cloud_hosted_agents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_likes: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swarms_cloud_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_models: {
        Row: {
          api_endpoint: string | null
          context_length: number | null
          created_at: string
          creator: string | null
          default_config: Json | null
          description: string | null
          docs: Json | null
          enabled: boolean | null
          id: string
          image_url: string | null
          model_card_md: string | null
          model_parameter: string | null
          model_type: Database["public"]["Enums"]["model_type"] | null
          name: string | null
          per_1k_input_price: number | null
          per_1k_output_price: number | null
          price_million_input: number | null
          price_million_output: number | null
          provider: string | null
          slug: string | null
          support_functions: boolean | null
          tags: string | null
          unique_name: string
          updated_at: string | null
          use_cases: Json | null
        }
        Insert: {
          api_endpoint?: string | null
          context_length?: number | null
          created_at?: string
          creator?: string | null
          default_config?: Json | null
          description?: string | null
          docs?: Json | null
          enabled?: boolean | null
          id?: string
          image_url?: string | null
          model_card_md?: string | null
          model_parameter?: string | null
          model_type?: Database["public"]["Enums"]["model_type"] | null
          name?: string | null
          per_1k_input_price?: number | null
          per_1k_output_price?: number | null
          price_million_input?: number | null
          price_million_output?: number | null
          provider?: string | null
          slug?: string | null
          support_functions?: boolean | null
          tags?: string | null
          unique_name: string
          updated_at?: string | null
          use_cases?: Json | null
        }
        Update: {
          api_endpoint?: string | null
          context_length?: number | null
          created_at?: string
          creator?: string | null
          default_config?: Json | null
          description?: string | null
          docs?: Json | null
          enabled?: boolean | null
          id?: string
          image_url?: string | null
          model_card_md?: string | null
          model_parameter?: string | null
          model_type?: Database["public"]["Enums"]["model_type"] | null
          name?: string | null
          per_1k_input_price?: number | null
          per_1k_output_price?: number | null
          price_million_input?: number | null
          price_million_output?: number | null
          provider?: string | null
          slug?: string | null
          support_functions?: boolean | null
          tags?: string | null
          unique_name?: string
          updated_at?: string | null
          use_cases?: Json | null
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
      swarms_cloud_organization_member_invites: {
        Row: {
          created_at: string
          email: string | null
          id: string
          invite_by_user_id: string | null
          organization_id: string | null
          role: Database["public"]["Enums"]["organization_member_role"] | null
          secret_code: string | null
          status:
            | Database["public"]["Enums"]["organization_member_invite_status"]
            | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          invite_by_user_id?: string | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["organization_member_role"] | null
          secret_code?: string | null
          status?:
            | Database["public"]["Enums"]["organization_member_invite_status"]
            | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          invite_by_user_id?: string | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["organization_member_role"] | null
          secret_code?: string | null
          status?:
            | Database["public"]["Enums"]["organization_member_invite_status"]
            | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_swarms_cloud_organization_member_invites_invite_by_user_"
            columns: ["invite_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_swarms_cloud_organization_member_invites_organization_id"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_swarms_cloud_organization_member_invites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_organization_members: {
        Row: {
          created_at: string
          deleted_by_user_id: string | null
          id: string
          invite_by_user_id: string | null
          is_deleted: boolean | null
          organization_id: string | null
          role: Database["public"]["Enums"]["organization_member_role"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_by_user_id?: string | null
          id?: string
          invite_by_user_id?: string | null
          is_deleted?: boolean | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["organization_member_role"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_by_user_id?: string | null
          id?: string
          invite_by_user_id?: string | null
          is_deleted?: boolean | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["organization_member_role"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_swarms_cloud_organization_members_deleted_by_user_id_fke"
            columns: ["deleted_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_swarms_cloud_organization_members_invited_by_user_id_fke"
            columns: ["invite_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_swarms_cloud_organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_swarms_cloud_organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_organizations: {
        Row: {
          created_at: string
          id: string
          name: string | null
          owner_user_id: string | null
          public_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          owner_user_id?: string | null
          public_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          owner_user_id?: string | null
          public_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_swarms_cloud_organizations_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_prompts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string | null
          prompt: string | null
          search_type: string
          status: Database["public"]["Enums"]["user_prompts_status"] | null
          tags: string | null
          use_cases: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          prompt?: string | null
          search_type?: string
          status?: Database["public"]["Enums"]["user_prompts_status"] | null
          tags?: string | null
          use_cases?: Json | null
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          prompt?: string | null
          search_type?: string
          status?: Database["public"]["Enums"]["user_prompts_status"] | null
          tags?: string | null
          use_cases?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swarms_cloud_prompts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_prompts_chat: {
        Row: {
          created_at: string
          id: string
          prompt_id: string
          response_id: string | null
          sender: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt_id: string
          response_id?: string | null
          sender: string
          text: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt_id?: string
          response_id?: string | null
          sender?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swarms_cloud_prompts_chat_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swarms_cloud_prompts_chat_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_prompts_chat_test: {
        Row: {
          created_at: string
          id: string
          prompt_id: string
          response_id: string | null
          sender: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt_id: string
          response_id?: string | null
          sender: string
          text: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt_id?: string
          response_id?: string | null
          sender?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swarms_cloud_prompts_chat_test_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swarms_cloud_prompts_chat_test_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_rate_limits: {
        Row: {
          created_at: string
          id: string
          last_request_at: string | null
          request_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_request_at?: string | null
          request_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_request_at?: string | null
          request_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swarms_cloud_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          model_id: string | null
          model_type: string | null
          rating: number | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          model_id?: string | null
          model_type?: string | null
          rating?: number | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          model_id?: string | null
          model_type?: string | null
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swarms_cloud_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_services: {
        Row: {
          api_key: string | null
          charge_credit: number | null
          created_at: string
          id: number
          product_name: string | null
          user_id: string | null
        }
        Insert: {
          api_key?: string | null
          charge_credit?: number | null
          created_at?: string
          id?: number
          product_name?: string | null
          user_id?: string | null
        }
        Update: {
          api_key?: string | null
          charge_credit?: number | null
          created_at?: string
          id?: number
          product_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swarms_cloud_services_api_key_fkey"
            columns: ["api_key"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_api_keys"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "swarms_cloud_services_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_users_credits"
            referencedColumns: ["user_id"]
          },
        ]
      }
      swarms_cloud_tools: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          language: string | null
          name: string | null
          requirements: Json | null
          status: Database["public"]["Enums"]["user_agents_status"] | null
          tags: string | null
          tool: string
          use_cases: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          language?: string | null
          name?: string | null
          requirements?: Json | null
          status?: Database["public"]["Enums"]["user_agents_status"] | null
          tags?: string | null
          tool: string
          use_cases?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          language?: string | null
          name?: string | null
          requirements?: Json | null
          status?: Database["public"]["Enums"]["user_agents_status"] | null
          tags?: string | null
          tool?: string
          use_cases?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      swarms_cloud_user_swarms: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string | null
          pr_id: string | null
          pr_link: string | null
          status: Database["public"]["Enums"]["user_swarms_status"] | null
          tags: string | null
          use_cases: Json | null
          user_id: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          pr_id?: string | null
          pr_link?: string | null
          status?: Database["public"]["Enums"]["user_swarms_status"] | null
          tags?: string | null
          use_cases?: Json | null
          user_id?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          pr_id?: string | null
          pr_link?: string | null
          status?: Database["public"]["Enums"]["user_swarms_status"] | null
          tags?: string | null
          use_cases?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_swarms_cloud_user_swarms_user_id_fkey"
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
          credit: number
          credit_count: number
          credit_grant: number | null
          credit_limit: number
          free_credit: number
          free_credit_expire_date: string | null
          id: string
          referral_credits: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          credit?: number
          credit_count?: number
          credit_grant?: number | null
          credit_limit?: number
          free_credit?: number
          free_credit_expire_date?: string | null
          id?: string
          referral_credits?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          credit?: number
          credit_count?: number
          credit_grant?: number | null
          credit_limit?: number
          free_credit?: number
          free_credit_expire_date?: string | null
          id?: string
          referral_credits?: number
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
      swarms_cloud_users_referral: {
        Row: {
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "swarms_cloud_users_referral_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swarms_cloud_users_referral_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
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
      swarms_cloud_users_wallets: {
        Row: {
          balance: number | null
          created_at: string
          expire_date: string | null
          id: string
          is_deleted: boolean | null
          is_expired: boolean | null
          name: string | null
          order: number | null
          user_id: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string
          expire_date?: string | null
          id?: string
          is_deleted?: boolean | null
          is_expired?: boolean | null
          name?: string | null
          order?: number | null
          user_id?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string
          expire_date?: string | null
          id?: string
          is_deleted?: boolean | null
          is_expired?: boolean | null
          name?: string | null
          order?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swarms_cloud_users_wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_cloud_users_wallets_transactions: {
        Row: {
          amount: number | null
          created_at: string
          description: string | null
          id: string
          new_balance: number | null
          old_balance: number | null
          type:
            | Database["public"]["Enums"]["users_wallets_transaction_type"]
            | null
          user_id: string | null
          wallet_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          new_balance?: number | null
          old_balance?: number | null
          type?:
            | Database["public"]["Enums"]["users_wallets_transaction_type"]
            | null
          user_id?: string | null
          wallet_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          new_balance?: number | null
          old_balance?: number | null
          type?:
            | Database["public"]["Enums"]["users_wallets_transaction_type"]
            | null
          user_id?: string | null
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swarms_cloud_users_wallets_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swarms_cloud_users_wallets_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "swarms_cloud_users_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_framework_schema: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          source_ip: unknown | null
          status: string | null
          swarms_api_key: string | null
          time_created: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          source_ip?: unknown | null
          status?: string | null
          swarms_api_key?: string | null
          time_created?: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          source_ip?: unknown | null
          status?: string | null
          swarms_api_key?: string | null
          time_created?: string
        }
        Relationships: []
      }
      swarms_spreadsheet_session_agents: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          llm: string | null
          name: string
          original_agent_id: string | null
          output: string | null
          session_id: string | null
          status: string | null
          system_prompt: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          llm?: string | null
          name: string
          original_agent_id?: string | null
          output?: string | null
          session_id?: string | null
          status?: string | null
          system_prompt?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          llm?: string | null
          name?: string
          original_agent_id?: string | null
          output?: string | null
          session_id?: string | null
          status?: string | null
          system_prompt?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swarms_spreadsheet_session_agents_original_agent_id_fkey"
            columns: ["original_agent_id"]
            isOneToOne: false
            referencedRelation: "swarms_spreadsheet_session_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swarms_spreadsheet_session_agents_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "swarms_spreadsheet_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swarms_spreadsheet_session_agents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms_spreadsheet_sessions: {
        Row: {
          created_at: string | null
          current: boolean | null
          id: string
          output: Json | null
          task: string | null
          tasks_executed: number | null
          time_saved: number | null
          timestamp: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current?: boolean | null
          id?: string
          output?: Json | null
          task?: string | null
          tasks_executed?: number | null
          time_saved?: number | null
          timestamp?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current?: boolean | null
          id?: string
          output?: Json | null
          task?: string | null
          tasks_executed?: number | null
          time_saved?: number | null
          timestamp?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swarms_spreadsheet_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_users"
            referencedColumns: ["id"]
          },
        ]
      }
      token_holders: {
        Row: {
          balance: string
          created_at: string
          id: number
          last_updated: string
          mint_address: string
          owner: string | null
          percentage: number | null
          updated_at: string
          wallet_address: string
        }
        Insert: {
          balance: string
          created_at?: string
          id?: number
          last_updated?: string
          mint_address: string
          owner?: string | null
          percentage?: number | null
          updated_at?: string
          wallet_address: string
        }
        Update: {
          balance?: string
          created_at?: string
          id?: number
          last_updated?: string
          mint_address?: string
          owner?: string | null
          percentage?: number | null
          updated_at?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_holders_mint_address_fkey"
            columns: ["mint_address"]
            isOneToOne: false
            referencedRelation: "web3agents"
            referencedColumns: ["mint_address"]
          },
        ]
      }
      token_market_stats: {
        Row: {
          active_traders_24h: number
          apy: number
          buy_volume_24h: number
          circulating_supply: number
          created_at: string
          current_price: number
          fees_24h: number
          first_trade_timestamp: string | null
          fully_diluted_market_cap: number
          high_price_24h: number
          id: number
          last_price_update: string
          last_trade_timestamp: string | null
          liquidity_in_swarms: number
          liquidity_in_token: number
          low_price_24h: number
          market_cap: number
          metadata: Json | null
          mint_address: string
          number_of_buys_24h: number
          number_of_holders: number
          number_of_sells_24h: number
          number_of_trades_24h: number
          price_change_24h: number
          price_in_swarms: number
          sell_volume_24h: number
          total_fees_collected: number
          total_supply: number
          total_value_locked: number
          total_volume: number
          updated_at: string
          volume_24h: number
        }
        Insert: {
          active_traders_24h?: number
          apy?: number
          buy_volume_24h?: number
          circulating_supply?: number
          created_at?: string
          current_price?: number
          fees_24h?: number
          first_trade_timestamp?: string | null
          fully_diluted_market_cap?: number
          high_price_24h?: number
          id?: number
          last_price_update?: string
          last_trade_timestamp?: string | null
          liquidity_in_swarms?: number
          liquidity_in_token?: number
          low_price_24h?: number
          market_cap?: number
          metadata?: Json | null
          mint_address: string
          number_of_buys_24h?: number
          number_of_holders?: number
          number_of_sells_24h?: number
          number_of_trades_24h?: number
          price_change_24h?: number
          price_in_swarms?: number
          sell_volume_24h?: number
          total_fees_collected?: number
          total_supply?: number
          total_value_locked?: number
          total_volume?: number
          updated_at?: string
          volume_24h?: number
        }
        Update: {
          active_traders_24h?: number
          apy?: number
          buy_volume_24h?: number
          circulating_supply?: number
          created_at?: string
          current_price?: number
          fees_24h?: number
          first_trade_timestamp?: string | null
          fully_diluted_market_cap?: number
          high_price_24h?: number
          id?: number
          last_price_update?: string
          last_trade_timestamp?: string | null
          liquidity_in_swarms?: number
          liquidity_in_token?: number
          low_price_24h?: number
          market_cap?: number
          metadata?: Json | null
          mint_address?: string
          number_of_buys_24h?: number
          number_of_holders?: number
          number_of_sells_24h?: number
          number_of_trades_24h?: number
          price_change_24h?: number
          price_in_swarms?: number
          sell_volume_24h?: number
          total_fees_collected?: number
          total_supply?: number
          total_value_locked?: number
          total_volume?: number
          updated_at?: string
          volume_24h?: number
        }
        Relationships: [
          {
            foreignKeyName: "token_market_stats_mint_address_fkey"
            columns: ["mint_address"]
            isOneToOne: false
            referencedRelation: "web3agents"
            referencedColumns: ["mint_address"]
          },
        ]
      }
      token_pools: {
        Row: {
          created_at: string
          fees: Json
          id: number
          is_active: boolean
          last_balance_update: string
          metadata: Json | null
          mint_address: string
          pool_address: string
          swarms_account_data: string
          swarms_balance: number
          swarms_vault_address: string
          token_account_data: string
          token_balance: number
          token_vault_address: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fees?: Json
          id?: number
          is_active?: boolean
          last_balance_update?: string
          metadata?: Json | null
          mint_address: string
          pool_address: string
          swarms_account_data: string
          swarms_balance: number
          swarms_vault_address: string
          token_account_data: string
          token_balance: number
          token_vault_address: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fees?: Json
          id?: number
          is_active?: boolean
          last_balance_update?: string
          metadata?: Json | null
          mint_address?: string
          pool_address?: string
          swarms_account_data?: string
          swarms_balance?: number
          swarms_vault_address?: string
          token_account_data?: string
          token_balance?: number
          token_vault_address?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_pools_mint_address_fkey"
            columns: ["mint_address"]
            isOneToOne: false
            referencedRelation: "web3agents"
            referencedColumns: ["mint_address"]
          },
        ]
      }
      token_transactions: {
        Row: {
          block_number: number | null
          created_at: string
          id: string
          is_swap: boolean | null
          metadata: Json | null
          mint_address: string
          price: number | null
          side: string | null
          signature: string
          size: number | null
          timestamp: number
          total_value: number | null
          updated_at: string
          user_address: string | null
        }
        Insert: {
          block_number?: number | null
          created_at?: string
          id?: string
          is_swap?: boolean | null
          metadata?: Json | null
          mint_address: string
          price?: number | null
          side?: string | null
          signature: string
          size?: number | null
          timestamp: number
          total_value?: number | null
          updated_at?: string
          user_address?: string | null
        }
        Update: {
          block_number?: number | null
          created_at?: string
          id?: string
          is_swap?: boolean | null
          metadata?: Json | null
          mint_address?: string
          price?: number | null
          side?: string | null
          signature?: string
          size?: number | null
          timestamp?: number
          total_value?: number | null
          updated_at?: string
          user_address?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          about_company: string | null
          avatar_url: string | null
          basic_onboarding_completed: boolean | null
          billing_address: Json | null
          company_name: string | null
          country_code: string | null
          credit_fraction: number | null
          credit_limit: number
          credit_plan: Database["public"]["Enums"]["credit_plan"]
          email: string | null
          full_name: string | null
          had_free_credits: boolean
          id: string
          job_title: string | null
          payment_method: Json | null
          referral: string | null
          referral_code: string | null
          referred_by: string | null
          signup_reason: string | null
          twenty_crm_id: string | null
          username: string | null
        }
        Insert: {
          about_company?: string | null
          avatar_url?: string | null
          basic_onboarding_completed?: boolean | null
          billing_address?: Json | null
          company_name?: string | null
          country_code?: string | null
          credit_fraction?: number | null
          credit_limit?: number
          credit_plan?: Database["public"]["Enums"]["credit_plan"]
          email?: string | null
          full_name?: string | null
          had_free_credits?: boolean
          id: string
          job_title?: string | null
          payment_method?: Json | null
          referral?: string | null
          referral_code?: string | null
          referred_by?: string | null
          signup_reason?: string | null
          twenty_crm_id?: string | null
          username?: string | null
        }
        Update: {
          about_company?: string | null
          avatar_url?: string | null
          basic_onboarding_completed?: boolean | null
          billing_address?: Json | null
          company_name?: string | null
          country_code?: string | null
          credit_fraction?: number | null
          credit_limit?: number
          credit_plan?: Database["public"]["Enums"]["credit_plan"]
          email?: string | null
          full_name?: string | null
          had_free_credits?: boolean
          id?: string
          job_title?: string | null
          payment_method?: Json | null
          referral?: string | null
          referral_code?: string | null
          referred_by?: string | null
          signup_reason?: string | null
          twenty_crm_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "safe_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["referral_code"]
          },
        ]
      }
      virtual_prices: {
        Row: {
          created_at: string | null
          id: number
          pool_id: string
          timestamp: number
          virtual_price: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          pool_id: string
          timestamp: number
          virtual_price: number
        }
        Update: {
          created_at?: string | null
          id?: number
          pool_id?: string
          timestamp?: number
          virtual_price?: number
        }
        Relationships: []
      }
      web3agents: {
        Row: {
          bonding_curve_address: string | null
          can_update: boolean | null
          created_at: string
          creator_id: string | null
          creator_wallet: string | null
          current_price: number | null
          current_supply: number | null
          description: string
          discord_server: string | null
          graduated: boolean
          id: string
          image_url: string | null
          initial_supply: number | null
          is_verified: boolean
          liquidity_pool_size: number | null
          market_cap: string | null
          metadata: Json | null
          mint_address: string
          name: string
          pool_address: string | null
          swarms_reserve: string | null
          telegram_group: string | null
          token_symbol: string
          twitter_handle: string | null
          updated_at: string
          volume_24h: number | null
        }
        Insert: {
          bonding_curve_address?: string | null
          can_update?: boolean | null
          created_at?: string
          creator_id?: string | null
          creator_wallet?: string | null
          current_price?: number | null
          current_supply?: number | null
          description: string
          discord_server?: string | null
          graduated?: boolean
          id?: string
          image_url?: string | null
          initial_supply?: number | null
          is_verified?: boolean
          liquidity_pool_size?: number | null
          market_cap?: string | null
          metadata?: Json | null
          mint_address: string
          name: string
          pool_address?: string | null
          swarms_reserve?: string | null
          telegram_group?: string | null
          token_symbol: string
          twitter_handle?: string | null
          updated_at?: string
          volume_24h?: number | null
        }
        Update: {
          bonding_curve_address?: string | null
          can_update?: boolean | null
          created_at?: string
          creator_id?: string | null
          creator_wallet?: string | null
          current_price?: number | null
          current_supply?: number | null
          description?: string
          discord_server?: string | null
          graduated?: boolean
          id?: string
          image_url?: string | null
          initial_supply?: number | null
          is_verified?: boolean
          liquidity_pool_size?: number | null
          market_cap?: string | null
          metadata?: Json | null
          mint_address?: string
          name?: string
          pool_address?: string | null
          swarms_reserve?: string | null
          telegram_group?: string | null
          token_symbol?: string
          twitter_handle?: string | null
          updated_at?: string
          volume_24h?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "web3agents_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "web3users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "web3agents_creator_wallet_fkey"
            columns: ["creator_wallet"]
            isOneToOne: false
            referencedRelation: "web3users"
            referencedColumns: ["wallet_address"]
          },
        ]
      }
      web3agents_archived: {
        Row: {
          bonding_curve_address: string | null
          created_at: string
          creator_id: string | null
          creator_wallet: string | null
          description: string
          discord_server: string | null
          graduated: boolean
          id: string
          image_url: string | null
          initial_supply: number | null
          is_verified: boolean
          liquidity_pool_size: number | null
          metadata: Json | null
          mint_address: string
          name: string
          pool_address: string | null
          swarms_reserve: string | null
          telegram_group: string | null
          token_symbol: string
          twitter_handle: string | null
          updated_at: string
        }
        Insert: {
          bonding_curve_address?: string | null
          created_at?: string
          creator_id?: string | null
          creator_wallet?: string | null
          description: string
          discord_server?: string | null
          graduated?: boolean
          id?: string
          image_url?: string | null
          initial_supply?: number | null
          is_verified?: boolean
          liquidity_pool_size?: number | null
          metadata?: Json | null
          mint_address: string
          name: string
          pool_address?: string | null
          swarms_reserve?: string | null
          telegram_group?: string | null
          token_symbol: string
          twitter_handle?: string | null
          updated_at?: string
        }
        Update: {
          bonding_curve_address?: string | null
          created_at?: string
          creator_id?: string | null
          creator_wallet?: string | null
          description?: string
          discord_server?: string | null
          graduated?: boolean
          id?: string
          image_url?: string | null
          initial_supply?: number | null
          is_verified?: boolean
          liquidity_pool_size?: number | null
          metadata?: Json | null
          mint_address?: string
          name?: string
          pool_address?: string | null
          swarms_reserve?: string | null
          telegram_group?: string | null
          token_symbol?: string
          twitter_handle?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "web3agents_archived_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "web3users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "web3agents_archived_creator_wallet_fkey"
            columns: ["creator_wallet"]
            isOneToOne: false
            referencedRelation: "web3users"
            referencedColumns: ["wallet_address"]
          },
        ]
      }
      web3users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          last_login_at: string | null
          metadata: Json | null
          total_trades: number | null
          total_volume: number | null
          updated_at: string
          username: string | null
          wallet_address: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_login_at?: string | null
          metadata?: Json | null
          total_trades?: number | null
          total_volume?: number | null
          updated_at?: string
          username?: string | null
          wallet_address: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_login_at?: string | null
          metadata?: Json | null
          total_trades?: number | null
          total_volume?: number | null
          updated_at?: string
          username?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      agent_statistics: {
        Row: {
          agent_id: string | null
          current_price: number | null
          name: string | null
          token_symbol: string | null
          total_buy_volume: number | null
          total_sell_volume: number | null
          total_trades: number | null
          unique_traders: number | null
        }
        Relationships: []
      }
      safe_cloud_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string | null
          model_id: string | null
          model_type: string | null
          rating: number | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string | null
          model_id?: string | null
          model_type?: string | null
          rating?: number | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string | null
          model_id?: string | null
          model_type?: string | null
          rating?: number | null
        }
        Relationships: []
      }
      safe_users: {
        Row: {
          avatar: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar?: never
          created_at?: string | null
          full_name?: never
          id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar?: never
          created_at?: string | null
          full_name?: never
          id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_referral_credits: {
        Args: {
          p_user_id: string
          p_amount: number
        }
        Returns: undefined
      }
      cleanup_expired_nonces: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      deduct_credit: {
        Args: {
          user_id: string
          amount: number
        }
        Returns: undefined
      }
      get_user_id_by_email: {
        Args: {
          email: string
        }
        Returns: {
          id: string
        }[]
      }
    }
    Enums: {
      credit_plan: "default" | "invoice"
      model_type: "text" | "vision"
      organization_member_invite_status:
        | "waiting"
        | "joined"
        | "expired"
        | "canceled"
      organization_member_role: "manager" | "reader"
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
      user_agents_status: "approved" | "pending" | "rejected"
      user_prompts_status: "approved" | "pending" | "rejected"
      user_swarms_status: "approved" | "pending" | "rejected"
      user_tier: "tier1" | "tier2" | "tier3" | "tier4"
      users_wallets_transaction_type: "reduct" | "add"
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
