export type UserRole = "personal" | "aluno";

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          nome: string;
          telefone: string | null;
          foto_url: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nome: string;
          telefone?: string | null;
          foto_url?: string | null;
          role: UserRole;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      personal_profiles: {
        Row: {
          id: string;
          nome_negocio: string | null;
          bio: string | null;
          meta_financeira_mes: number | null;
        };
        Insert: {
          id: string;
          nome_negocio?: string | null;
          bio?: string | null;
          meta_financeira_mes?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["personal_profiles"]["Insert"]>;
      };
      aluno_profiles: {
        Row: {
          id: string;
          personal_id: string | null;
          objetivo: string | null;
          peso_atual: number | null;
          altura: number | null;
          plano: string | null;
          status: "ativo" | "inativo";
        };
        Insert: {
          id: string;
          personal_id?: string | null;
          objetivo?: string | null;
          peso_atual?: number | null;
          altura?: number | null;
          plano?: string | null;
          status?: "ativo" | "inativo";
        };
        Update: Partial<Database["public"]["Tables"]["aluno_profiles"]["Insert"]>;
      };
      registro_agua: {
        Row: {
          id: string;
          aluno_id: string;
          data: string;
          quantidade_ml: number;
          meta_ml: number;
        };
        Insert: {
          id?: string;
          aluno_id: string;
          data?: string;
          quantidade_ml?: number;
          meta_ml?: number;
        };
        Update: Partial<Database["public"]["Tables"]["registro_agua"]["Insert"]>;
      };
      pagamentos: {
        Row: {
          id: string;
          aluno_id: string;
          personal_id: string;
          valor: number;
          data_vencimento: string;
          data_pagamento: string | null;
          status: "pago" | "pendente" | "atrasado";
        };
        Insert: {
          id?: string;
          aluno_id: string;
          personal_id: string;
          valor: number;
          data_vencimento: string;
          data_pagamento?: string | null;
          status?: "pago" | "pendente" | "atrasado";
        };
        Update: Partial<Database["public"]["Tables"]["pagamentos"]["Insert"]>;
      };
    };
  };
}
