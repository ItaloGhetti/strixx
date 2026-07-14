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
          google_access_token: string | null;
          google_refresh_token: string | null;
          google_token_expiry: string | null;
          google_connected: boolean;
        };
        Insert: {
          id: string;
          nome_negocio?: string | null;
          bio?: string | null;
          meta_financeira_mes?: number | null;
          google_access_token?: string | null;
          google_refresh_token?: string | null;
          google_token_expiry?: string | null;
          google_connected?: boolean;
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
      treinos_biblioteca: {
        Row: {
          id: string;
          personal_id: string;
          nome: string;
          objetivo: string | null;
          categoria: string;
          observacoes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          personal_id: string;
          nome: string;
          objetivo?: string | null;
          categoria: string;
          observacoes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["treinos_biblioteca"]["Insert"]>;
      };
      exercicios: {
        Row: {
          id: string;
          treino_id: string;
          nome: string;
          series: number | null;
          repeticoes: string | null;
          carga: string | null;
          tempo: string | null;
          descanso: string | null;
          midia_url: string | null;
          ordem: number;
        };
        Insert: {
          id?: string;
          treino_id: string;
          nome: string;
          series?: number | null;
          repeticoes?: string | null;
          carga?: string | null;
          tempo?: string | null;
          descanso?: string | null;
          midia_url?: string | null;
          ordem?: number;
        };
        Update: Partial<Database["public"]["Tables"]["exercicios"]["Insert"]>;
      };
      treinos_atribuidos: {
        Row: {
          id: string;
          treino_id: string;
          aluno_id: string;
          data_envio: string;
          status: string;
          data_conclusao: string | null;
        };
        Insert: {
          id?: string;
          treino_id: string;
          aluno_id: string;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["treinos_atribuidos"]["Insert"]>;
      };
      agenda_aulas: {
        Row: {
          id: string;
          personal_id: string;
          aluno_id: string;
          data_hora: string;
          local: string | null;
          status: string;
          observacoes: string | null;
          cor: string | null;
          google_event_id: string | null;
        };
        Insert: {
          id?: string;
          personal_id: string;
          aluno_id: string;
          data_hora: string;
          local?: string | null;
          status?: string;
          observacoes?: string | null;
          cor?: string | null;
          google_event_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["agenda_aulas"]["Insert"]>;
      };
    };
  };
}
