// ATENÇÃO: arquivo MÍNIMO escrito à mão porque `pnpm db:types` ainda não pôde rodar
// (faltam SUPABASE_ACCESS_TOKEN / SUPABASE_PROJECT_REF). Substitua rodando `pnpm db:types`.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Tabela = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      gestoes: Tabela;
      membros_gestao: Tabela;
      lotes: Tabela;
      produtos: Tabela;
      variacoes: Tabela;
      clientes: Tabela;
      pedidos: Tabela;
      itens_pedido: Tabela;
      webhook_eventos: Tabela;
      eventos: Tabela;
      palestrantes: Tabela;
      links_hub: Tabela;
      perfis_admin: Tabela;
      log_acoes: Tabela;
      rate_limits: Tabela;
    };
    Views: Record<string, never>;
    Functions: {
      ativar_gestao: { Args: { p_id: string }; Returns: undefined };
      checar_rate_limit: {
        Args: { p_chave: string; p_limite: number; p_janela_segundos: number };
        Returns: boolean;
      };
      papel_atual: { Args: Record<string, never>; Returns: PapelAdmin | null };
      tem_papel: { Args: { papeis: PapelAdmin[] }; Returns: boolean };
    };
    Enums: {
      status_lote: StatusLote;
      status_pedido: StatusPedido;
      forma_pagamento: "pix" | "cartao" | "indefinido";
      status_evento: "rascunho" | "publicado" | "cancelado";
      tipo_evento:
        | "palestra"
        | "workshop"
        | "hackathon"
        | "social"
        | "semana_academica"
        | "outro";
      papel_admin: PapelAdmin;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type PapelAdmin = "superadmin" | "admin" | "editor";
export type StatusLote = "aberto" | "fechado" | "em_producao" | "entregue";
export type StatusPedido =
  | "aguardando_pagamento"
  | "pago"
  | "em_producao"
  | "disponivel"
  | "retirado"
  | "expirado"
  | "cancelado"
  | "estornado";
