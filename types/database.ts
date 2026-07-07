export type UserRole = "personal" | "aluno";

export interface Database {
  public: {
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
    };
  };
}
