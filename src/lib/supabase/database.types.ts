export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Phase 1 projection generated from the remote Supabase schema.
// Extend or regenerate this file whenever another table enters an implemented flow.
export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      accounts: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"];
          balance_bucket: Database["public"]["Enums"]["balance_bucket"];
          credit_limit_in_cents: number | null;
          created_at: string;
          id: string;
          initial_balance_in_cents: number;
          is_active: boolean;
          name: string;
          statement_due_day: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          account_type: Database["public"]["Enums"]["account_type"];
          balance_bucket?: Database["public"]["Enums"]["balance_bucket"];
          credit_limit_in_cents?: number | null;
          created_at?: string;
          id?: string;
          initial_balance_in_cents?: number;
          is_active?: boolean;
          name: string;
          statement_due_day?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"];
          balance_bucket?: Database["public"]["Enums"]["balance_bucket"];
          credit_limit_in_cents?: number | null;
          created_at?: string;
          id?: string;
          initial_balance_in_cents?: number;
          is_active?: boolean;
          name?: string;
          statement_due_day?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          color: string | null;
          created_at: string;
          expense_nature: Database["public"]["Enums"]["expense_nature"] | null;
          id: string;
          kind: Database["public"]["Enums"]["category_kind"];
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          expense_nature?: Database["public"]["Enums"]["expense_nature"] | null;
          id?: string;
          kind: Database["public"]["Enums"]["category_kind"];
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          expense_nature?: Database["public"]["Enums"]["expense_nature"] | null;
          id?: string;
          kind?: Database["public"]["Enums"]["category_kind"];
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      commitments: {
        Row: {
          account_id: string | null;
          amount_in_cents: number;
          balance_bucket: Database["public"]["Enums"]["balance_bucket"];
          category_id: string | null;
          created_at: string;
          description: string | null;
          due_on: string;
          id: string;
          installment_count: number | null;
          installment_number: number | null;
          logical_group_id: string | null;
          settled_at: string | null;
          settlement_transaction_id: string | null;
          source_transaction_id: string | null;
          type: Database["public"]["Enums"]["commitment_type"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          account_id?: string | null;
          amount_in_cents: number;
          balance_bucket?: Database["public"]["Enums"]["balance_bucket"];
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          due_on: string;
          id?: string;
          installment_count?: number | null;
          installment_number?: number | null;
          logical_group_id?: string | null;
          settled_at?: string | null;
          settlement_transaction_id?: string | null;
          source_transaction_id?: string | null;
          type: Database["public"]["Enums"]["commitment_type"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          account_id?: string | null;
          amount_in_cents?: number;
          balance_bucket?: Database["public"]["Enums"]["balance_bucket"];
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          due_on?: string;
          id?: string;
          installment_count?: number | null;
          installment_number?: number | null;
          logical_group_id?: string | null;
          settled_at?: string | null;
          settlement_transaction_id?: string | null;
          source_transaction_id?: string | null;
          type?: Database["public"]["Enums"]["commitment_type"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          account_id: string | null;
          affects_balance: boolean;
          amount_in_cents: number;
          balance_bucket: Database["public"]["Enums"]["balance_bucket"];
          category_id: string | null;
          created_at: string;
          description: string | null;
          direction: Database["public"]["Enums"]["transaction_direction"];
          expense_nature: Database["public"]["Enums"]["expense_nature"] | null;
          id: string;
          income_source: Database["public"]["Enums"]["income_source"] | null;
          occurred_on: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          account_id?: string | null;
          amount_in_cents: number;
          balance_bucket: Database["public"]["Enums"]["balance_bucket"];
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          direction: Database["public"]["Enums"]["transaction_direction"];
          expense_nature?: Database["public"]["Enums"]["expense_nature"] | null;
          id?: string;
          income_source?: Database["public"]["Enums"]["income_source"] | null;
          occurred_on: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          account_id?: string | null;
          amount_in_cents?: number;
          balance_bucket?: Database["public"]["Enums"]["balance_bucket"];
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          direction?: Database["public"]["Enums"]["transaction_direction"];
          expense_nature?: Database["public"]["Enums"]["expense_nature"] | null;
          id?: string;
          income_source?: Database["public"]["Enums"]["income_source"] | null;
          occurred_on?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      create_credit_card_purchase: {
        Args: {
          p_account_id: string;
          p_amount_in_cents: number;
          p_category_id: string;
          p_description: string | null;
          p_installment_count: number;
          p_occurred_on: string;
        };
        Returns: Json;
      };
      pay_commitments: {
        Args: {
          p_commitment_ids: string[];
          p_description: string | null;
          p_occurred_on: string;
          p_paying_account_id: string;
        };
        Returns: Json;
      };
      resolve_due_date: {
        Args: {
          base_date: string;
          due_day: number;
          month_offset?: number;
        };
        Returns: string;
      };
    };
    Enums: {
      account_type: "debit" | "credit" | "vr" | "vt";
      balance_bucket: "free" | "meal_benefit" | "transport_benefit";
      category_kind: "income" | "expense" | "investment";
      commitment_type: "credit_card_bill" | "installment" | "fixed_bill" | "reserved_amount";
      expense_nature: "fixed" | "variable" | "credit_card" | "investment";
      income_source: "salary" | "vr" | "vt" | "extra_income";
      monthly_plan_item_kind: "income" | "expense";
      transaction_direction: "income" | "expense";
    };
    CompositeTypes: Record<never, never>;
  };
};
