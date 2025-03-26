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
      kak: {
        Row: {
          akun_belanja: string
          created_at: string
          created_by_name: string
          created_by_role: string
          id: string
          jenis_kak: string
          kegiatan: string
          komponen_output: string
          pagu_anggaran: number
          pagu_digunakan: number
          program_pembebanan: string
          rincian_output: string
          sub_komponen: string
          tanggal_akhir: string
          tanggal_mulai: string
          tanggal_pengajuan: string
          updated_at: string
        }
        Insert: {
          akun_belanja: string
          created_at?: string
          created_by_name: string
          created_by_role: string
          id?: string
          jenis_kak: string
          kegiatan: string
          komponen_output: string
          pagu_anggaran: number
          pagu_digunakan: number
          program_pembebanan: string
          rincian_output: string
          sub_komponen: string
          tanggal_akhir: string
          tanggal_mulai: string
          tanggal_pengajuan: string
          updated_at?: string
        }
        Update: {
          akun_belanja?: string
          created_at?: string
          created_by_name?: string
          created_by_role?: string
          id?: string
          jenis_kak?: string
          kegiatan?: string
          komponen_output?: string
          pagu_anggaran?: number
          pagu_digunakan?: number
          program_pembebanan?: string
          rincian_output?: string
          sub_komponen?: string
          tanggal_akhir?: string
          tanggal_mulai?: string
          tanggal_pengajuan?: string
          updated_at?: string
        }
        Relationships: []
      }
      kak_items: {
        Row: {
          created_at: string
          harga_satuan: number
          id: string
          kak_id: string
          nama: string
          satuan: string
          subtotal: number
          volume: number
        }
        Insert: {
          created_at?: string
          harga_satuan: number
          id?: string
          kak_id: string
          nama: string
          satuan: string
          subtotal: number
          volume: number
        }
        Update: {
          created_at?: string
          harga_satuan?: number
          id?: string
          kak_id?: string
          nama?: string
          satuan?: string
          subtotal?: number
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "kak_items_kak_id_fkey"
            columns: ["kak_id"]
            isOneToOne: false
            referencedRelation: "kak"
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
