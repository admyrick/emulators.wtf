import { createClient } from "@supabase/supabase-js"

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      cfw_apps: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          developer: string | null
          download_url: string | null
          features: string[] | null
          id: string
          license: string | null
          name: string
          requirements: string[] | null
          slug: string
          source_code_url: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          developer?: string | null
          download_url?: string | null
          features?: string[] | null
          id?: string
          license?: string | null
          name: string
          requirements?: string[] | null
          slug: string
          source_code_url?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          developer?: string | null
          download_url?: string | null
          features?: string[] | null
          id?: string
          license?: string | null
          name?: string
          requirements?: string[] | null
          slug?: string
          source_code_url?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cfw_apps_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cfw_compatible_handhelds: {
        Row: {
          compatibility_notes: string | null
          created_at: string
          custom_firmware_id: string
          handheld_id: string
          id: string
        }
        Insert: {
          compatibility_notes?: string | null
          created_at?: string
          custom_firmware_id: string
          handheld_id: string
          id?: string
        }
        Update: {
          compatibility_notes?: string | null
          created_at?: string
          custom_firmware_id?: string
          handheld_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cfw_compatible_handhelds_custom_firmware_id_fkey"
            columns: ["custom_firmware_id"]
            isOneToOne: false
            referencedRelation: "custom_firmware"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cfw_compatible_handhelds_handheld_id_fkey"
            columns: ["handheld_id"]
            isOneToOne: false
            referencedRelation: "handhelds"
            referencedColumns: ["id"]
          },
        ]
      }
      consoles: {
        Row: {
          id: string
          name: string
          slug: string
          manufacturer: string
          release_date: string | null
          description: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          manufacturer: string
          release_date?: string | null
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          manufacturer?: string
          release_date?: string | null
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      custom_firmware: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          version: string | null
          release_date: string | null
          download_url: string | null
          documentation_url: string | null
          source_code_url: string | null
          license: string | null
          installation_difficulty: string | null
          features: string[] | null
          requirements: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          version?: string | null
          release_date?: string | null
          download_url?: string | null
          documentation_url?: string | null
          source_code_url?: string | null
          license?: string | null
          installation_difficulty?: string | null
          features?: string[] | null
          requirements?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          version?: string | null
          release_date?: string | null
          download_url?: string | null
          documentation_url?: string | null
          source_code_url?: string | null
          license?: string | null
          installation_difficulty?: string | null
          features?: string[] | null
          requirements?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      emulation_performance: {
        Row: {
          created_at: string
          emulator_id: string
          handheld_id: string
          id: string
          notes: string | null
          performance_rating: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          emulator_id: string
          handheld_id: string
          id?: string
          notes?: string | null
          performance_rating: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          emulator_id?: string
          handheld_id?: string
          id?: string
          notes?: string | null
          performance_rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emulation_performance_emulator_id_fkey"
            columns: ["emulator_id"]
            isOneToOne: false
            referencedRelation: "emulators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emulation_performance_handheld_id_fkey"
            columns: ["handheld_id"]
            isOneToOne: false
            referencedRelation: "handhelds"
            referencedColumns: ["id"]
          },
        ]
      }
      emulators: {
        Row: {
          console_id: string
          created_at: string
          description: string | null
          developer: string | null
          download_url: string | null
          id: string
          license: string | null
          name: string
          slug: string
          updated_at: string
          version: string | null
        }
        Insert: {
          console_id: string
          created_at?: string
          description?: string | null
          developer?: string | null
          download_url?: string | null
          id?: string
          license?: string | null
          name: string
          slug: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          console_id?: string
          created_at?: string
          description?: string | null
          developer?: string | null
          download_url?: string | null
          id?: string
          license?: string | null
          name?: string
          slug?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emulators_console_id_fkey"
            columns: ["console_id"]
            isOneToOne: false
            referencedRelation: "consoles"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          context: Json | null
          created_at: string
          error_message: string
          id: string
          stack_trace: string | null
          user_agent: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          error_message: string
          id?: string
          stack_trace?: string | null
          user_agent?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          error_message?: string
          id?: string
          stack_trace?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      games: {
        Row: {
          console_id: string
          created_at: string
          description: string | null
          developer: string | null
          genre: string | null
          id: string
          name: string
          publisher: string | null
          release_date: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          console_id: string
          created_at?: string
          description?: string | null
          developer?: string | null
          genre?: string | null
          id?: string
          name: string
          publisher?: string | null
          release_date?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          console_id?: string
          created_at?: string
          description?: string | null
          developer?: string | null
          genre?: string | null
          id?: string
          name?: string
          publisher?: string | null
          release_date?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_console_id_fkey"
            columns: ["console_id"]
            isOneToOne: false
            referencedRelation: "consoles"
            referencedColumns: ["id"]
          },
        ]
      }
      handhelds: {
        Row: {
          battery_life: string | null
          cpu: string | null
          created_at: string
          description: string | null
          display: string | null
          id: string
          manufacturer: string
          name: string
          price: number | null
          ram: string | null
          release_date: string | null
          slug: string
          storage: string | null
          updated_at: string
          weight: string | null
        }
        Insert: {
          battery_life?: string | null
          cpu?: string | null
          created_at?: string
          description?: string | null
          display?: string | null
          id?: string
          manufacturer: string
          name: string
          price?: number | null
          ram?: string | null
          release_date?: string | null
          slug: string
          storage?: string | null
          updated_at?: string
          weight?: string | null
        }
        Update: {
          battery_life?: string | null
          cpu?: string | null
          created_at?: string
          description?: string | null
          display?: string | null
          id?: string
          manufacturer?: string
          name?: string
          price?: number | null
          ram?: string | null
          release_date?: string | null
          slug?: string
          storage?: string | null
          updated_at?: string
          weight?: string | null
        }
        Relationships: []
      }
      links: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      retailers: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      tools: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          developer: string | null
          download_url: string | null
          id: string
          license: string | null
          name: string
          slug: string
          updated_at: string
          version: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          developer?: string | null
          download_url?: string | null
          id?: string
          license?: string | null
          name: string
          slug: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          developer?: string | null
          download_url?: string | null
          id?: string
          license?: string | null
          name?: string
          slug?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tools_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"]) | { schema: keyof Database },
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
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
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
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
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
  PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export createClient as a named export for compatibility
export { createClient }
