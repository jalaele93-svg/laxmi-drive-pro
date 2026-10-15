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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      instructor_roster: {
        Row: {
          availability: string
          created_at: string
          daily_capacity: number
          experience_years: number
          id: string
          languages: string[]
          name: string
          specialty: string
          updated_at: string
          vehicles: string[]
        }
        Insert: {
          availability?: string
          created_at?: string
          daily_capacity?: number
          experience_years?: number
          id?: string
          languages?: string[]
          name: string
          specialty: string
          updated_at?: string
          vehicles?: string[]
        }
        Update: {
          availability?: string
          created_at?: string
          daily_capacity?: number
          experience_years?: number
          id?: string
          languages?: string[]
          name?: string
          specialty?: string
          updated_at?: string
          vehicles?: string[]
        }
        Relationships: []
      }
      lesson_bookings: {
        Row: {
          amount: number | null
          created_at: string
          email: string
          experience: string
          full_name: string
          gateway_only: boolean
          id: string
          instructor: string | null
          message: string | null
          mobile: string
          payment_choice: string
          payment_status: string
          preferred_date: string
          preferred_time: string
          staff_notes: string | null
          status: string
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          email: string
          experience: string
          full_name: string
          gateway_only?: boolean
          id?: string
          instructor?: string | null
          message?: string | null
          mobile: string
          payment_choice?: string
          payment_status?: string
          preferred_date: string
          preferred_time: string
          staff_notes?: string | null
          status?: string
          updated_at?: string
          vehicle_type: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          email?: string
          experience?: string
          full_name?: string
          gateway_only?: boolean
          id?: string
          instructor?: string | null
          message?: string | null
          mobile?: string
          payment_choice?: string
          payment_status?: string
          preferred_date?: string
          preferred_time?: string
          staff_notes?: string | null
          status?: string
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      partner_applications: {
        Row: {
          address: string
          admin_notes: string | null
          alternate_mobile: string | null
          application_no: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_ifsc: string | null
          bank_name: string | null
          city: string
          created_at: string
          deposit_amount: number
          district: string
          email: string
          fuel_type: string
          full_name: string
          gateway_only: boolean
          id: string
          manufacturing_year: number
          mobile: string
          odometer_km: number | null
          ownership_status: Database["public"]["Enums"]["partner_ownership"]
          partner_id: string | null
          payment_method: string | null
          payment_paid_at: string | null
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["partner_payment_status"]
          payment_verified_at: string | null
          pincode: string
          preferred_availability: string
          preferred_location: string
          preferred_use: string
          registration_number: string
          rejection_reason: string | null
          state: string
          status: Database["public"]["Enums"]["partner_application_status"]
          submitted_at: string | null
          terms_accepted: boolean
          transmission: string
          updated_at: string
          upi_id: string | null
          user_id: string
          vehicle_color: string | null
          vehicle_make: string
          vehicle_model: string
          vehicle_type: Database["public"]["Enums"]["partner_vehicle_type"]
          vehicle_verified: boolean
          vehicle_verified_at: string | null
        }
        Insert: {
          address: string
          admin_notes?: string | null
          alternate_mobile?: string | null
          application_no?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          city: string
          created_at?: string
          deposit_amount?: number
          district: string
          email: string
          fuel_type: string
          full_name: string
          gateway_only?: boolean
          id?: string
          manufacturing_year: number
          mobile: string
          odometer_km?: number | null
          ownership_status?: Database["public"]["Enums"]["partner_ownership"]
          partner_id?: string | null
          payment_method?: string | null
          payment_paid_at?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["partner_payment_status"]
          payment_verified_at?: string | null
          pincode: string
          preferred_availability: string
          preferred_location: string
          preferred_use: string
          registration_number: string
          rejection_reason?: string | null
          state?: string
          status?: Database["public"]["Enums"]["partner_application_status"]
          submitted_at?: string | null
          terms_accepted?: boolean
          transmission: string
          updated_at?: string
          upi_id?: string | null
          user_id: string
          vehicle_color?: string | null
          vehicle_make: string
          vehicle_model: string
          vehicle_type: Database["public"]["Enums"]["partner_vehicle_type"]
          vehicle_verified?: boolean
          vehicle_verified_at?: string | null
        }
        Update: {
          address?: string
          admin_notes?: string | null
          alternate_mobile?: string | null
          application_no?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          city?: string
          created_at?: string
          deposit_amount?: number
          district?: string
          email?: string
          fuel_type?: string
          full_name?: string
          gateway_only?: boolean
          id?: string
          manufacturing_year?: number
          mobile?: string
          odometer_km?: number | null
          ownership_status?: Database["public"]["Enums"]["partner_ownership"]
          partner_id?: string | null
          payment_method?: string | null
          payment_paid_at?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["partner_payment_status"]
          payment_verified_at?: string | null
          pincode?: string
          preferred_availability?: string
          preferred_location?: string
          preferred_use?: string
          registration_number?: string
          rejection_reason?: string | null
          state?: string
          status?: Database["public"]["Enums"]["partner_application_status"]
          submitted_at?: string | null
          terms_accepted?: boolean
          transmission?: string
          updated_at?: string
          upi_id?: string | null
          user_id?: string
          vehicle_color?: string | null
          vehicle_make?: string
          vehicle_model?: string
          vehicle_type?: Database["public"]["Enums"]["partner_vehicle_type"]
          vehicle_verified?: boolean
          vehicle_verified_at?: string | null
        }
        Relationships: []
      }
      partner_documents: {
        Row: {
          application_id: string
          created_at: string
          doc_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_current: boolean
          mime_type: string | null
          user_id: string
          verified: boolean
          verified_at: string | null
        }
        Insert: {
          application_id: string
          created_at?: string
          doc_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_current?: boolean
          mime_type?: string | null
          user_id: string
          verified?: boolean
          verified_at?: string | null
        }
        Update: {
          application_id?: string
          created_at?: string
          doc_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_current?: boolean
          mime_type?: string | null
          user_id?: string
          verified?: boolean
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_requests: {
        Row: {
          amount_paise: number
          application_id: string | null
          booking_id: string | null
          created_at: string
          currency: string
          id: string
          key_id: string
          order_id: string | null
          payment_id: string | null
          state: string
          token_hash: string | null
        }
        Insert: {
          amount_paise: number
          application_id?: string | null
          booking_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          key_id: string
          order_id?: string | null
          payment_id?: string | null
          state?: string
          token_hash?: string | null
        }
        Update: {
          amount_paise?: number
          application_id?: string | null
          booking_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          key_id?: string
          order_id?: string | null
          payment_id?: string | null
          state?: string
          token_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_requests_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_requests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "lesson_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          mobile: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          mobile?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          mobile?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          auto_allocate: boolean
          created_at: string
          email: string
          first_slot: string
          id: number
          institute_name: string
          last_slot: string
          max_lessons_daily: number
          online_payments: boolean
          phone: string
          slot_minutes: number
          sms_enabled: boolean
          updated_at: string
          whatsapp_enabled: boolean
        }
        Insert: {
          auto_allocate?: boolean
          created_at?: string
          email?: string
          first_slot?: string
          id?: number
          institute_name?: string
          last_slot?: string
          max_lessons_daily?: number
          online_payments?: boolean
          phone?: string
          slot_minutes?: number
          sms_enabled?: boolean
          updated_at?: string
          whatsapp_enabled?: boolean
        }
        Update: {
          auto_allocate?: boolean
          created_at?: string
          email?: string
          first_slot?: string
          id?: number
          institute_name?: string
          last_slot?: string
          max_lessons_daily?: number
          online_payments?: boolean
          phone?: string
          slot_minutes?: number
          sms_enabled?: boolean
          updated_at?: string
          whatsapp_enabled?: boolean
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
      website_content: {
        Row: {
          content: Json
          id: string
          section: string
          sort_order: number
          updated_at: string
          visible: boolean
        }
        Insert: {
          content: Json
          id: string
          section: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Update: {
          content?: Json
          id?: string
          section?: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
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
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      replace_partner_document: {
        Args: {
          _application_id: string
          _doc_type: string
          _file_name: string
          _file_path: string
          _file_size: number
          _mime_type: string
          _user_id: string
        }
        Returns: string
      }
      settle_razorpay_payment: {
        Args: {
          _amount: number
          _order: string
          _payment: string
          _refunded?: boolean
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "partner"
      partner_application_status:
        | "Draft"
        | "Submitted"
        | "Payment Pending"
        | "Payment Received"
        | "Document Verification"
        | "Under Review"
        | "Approved"
        | "Rejected"
        | "Correction Required"
        | "Active"
        | "Suspended"
      partner_ownership:
        | "Individual Owner"
        | "Business Owner"
        | "Company/Fleet Owner"
      partner_payment_status:
        | "Pending"
        | "Paid"
        | "Under Verification"
        | "Verified"
        | "Refunded"
      partner_vehicle_type: "Car" | "Motorcycle" | "Scooter"
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
      app_role: ["admin", "staff", "partner"],
      partner_application_status: [
        "Draft",
        "Submitted",
        "Payment Pending",
        "Payment Received",
        "Document Verification",
        "Under Review",
        "Approved",
        "Rejected",
        "Correction Required",
        "Active",
        "Suspended",
      ],
      partner_ownership: [
        "Individual Owner",
        "Business Owner",
        "Company/Fleet Owner",
      ],
      partner_payment_status: [
        "Pending",
        "Paid",
        "Under Verification",
        "Verified",
        "Refunded",
      ],
      partner_vehicle_type: ["Car", "Motorcycle", "Scooter"],
    },
  },
} as const
