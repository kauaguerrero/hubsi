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
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          asaas_customer_id: string | null
          cpf: string
          created_at: string
          email: string
          id: string
          nome: string
          turma: string | null
          updated_at: string
          whatsapp: string
        }
        Insert: {
          asaas_customer_id?: string | null
          cpf: string
          created_at?: string
          email: string
          id?: string
          nome: string
          turma?: string | null
          updated_at?: string
          whatsapp: string
        }
        Update: {
          asaas_customer_id?: string | null
          cpf?: string
          created_at?: string
          email?: string
          id?: string
          nome?: string
          turma?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      eventos: {
        Row: {
          capa_url: string | null
          created_at: string
          descricao: string | null
          fim: string | null
          id: string
          inicio: string
          link_inscricao: string | null
          local: string | null
          slug: string
          status: Database["public"]["Enums"]["status_evento"]
          tipo: Database["public"]["Enums"]["tipo_evento"]
          titulo: string
          updated_at: string
        }
        Insert: {
          capa_url?: string | null
          created_at?: string
          descricao?: string | null
          fim?: string | null
          id?: string
          inicio: string
          link_inscricao?: string | null
          local?: string | null
          slug: string
          status?: Database["public"]["Enums"]["status_evento"]
          tipo?: Database["public"]["Enums"]["tipo_evento"]
          titulo: string
          updated_at?: string
        }
        Update: {
          capa_url?: string | null
          created_at?: string
          descricao?: string | null
          fim?: string | null
          id?: string
          inicio?: string
          link_inscricao?: string | null
          local?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["status_evento"]
          tipo?: Database["public"]["Enums"]["tipo_evento"]
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      gestoes: {
        Row: {
          ano: number
          ativa: boolean
          created_at: string
          descricao: string | null
          id: string
          logo_url: string | null
          nome: string
          slug: string
          updated_at: string
        }
        Insert: {
          ano: number
          ativa?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          slug: string
          updated_at?: string
        }
        Update: {
          ano?: number
          ativa?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      itens_pedido: {
        Row: {
          created_at: string
          id: string
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          updated_at: string
          variacao_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          updated_at?: string
          variacao_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          pedido_id?: string
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
          updated_at?: string
          variacao_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_variacao_id_fkey"
            columns: ["variacao_id"]
            isOneToOne: false
            referencedRelation: "variacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      links_hub: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string
          descricao: string | null
          id: string
          ordem: number
          titulo: string
          updated_at: string
          url: string
        }
        Insert: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          titulo: string
          updated_at?: string
          url: string
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          titulo?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      log_acoes: {
        Row: {
          acao: string
          created_at: string
          detalhes: Json | null
          entidade: string
          entidade_id: string | null
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          detalhes?: Json | null
          entidade: string
          entidade_id?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          detalhes?: Json | null
          entidade?: string
          entidade_id?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      lotes: {
        Row: {
          abre_em: string
          created_at: string
          data_retirada: string | null
          fecha_em: string
          gestao_id: string | null
          id: string
          limite_unidades: number | null
          local_retirada: string | null
          nome: string
          status: Database["public"]["Enums"]["status_lote"]
          updated_at: string
        }
        Insert: {
          abre_em?: string
          created_at?: string
          data_retirada?: string | null
          fecha_em: string
          gestao_id?: string | null
          id?: string
          limite_unidades?: number | null
          local_retirada?: string | null
          nome: string
          status?: Database["public"]["Enums"]["status_lote"]
          updated_at?: string
        }
        Update: {
          abre_em?: string
          created_at?: string
          data_retirada?: string | null
          fecha_em?: string
          gestao_id?: string | null
          id?: string
          limite_unidades?: number | null
          local_retirada?: string | null
          nome?: string
          status?: Database["public"]["Enums"]["status_lote"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lotes_gestao_id_fkey"
            columns: ["gestao_id"]
            isOneToOne: false
            referencedRelation: "gestoes"
            referencedColumns: ["id"]
          },
        ]
      }
      membros_gestao: {
        Row: {
          cargo: string
          created_at: string
          foto_url: string | null
          gestao_id: string
          id: string
          nome: string
          ordem: number
          superior_id: string | null
          updated_at: string
        }
        Insert: {
          cargo: string
          created_at?: string
          foto_url?: string | null
          gestao_id: string
          id?: string
          nome: string
          ordem?: number
          superior_id?: string | null
          updated_at?: string
        }
        Update: {
          cargo?: string
          created_at?: string
          foto_url?: string | null
          gestao_id?: string
          id?: string
          nome?: string
          ordem?: number
          superior_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membros_gestao_gestao_id_fkey"
            columns: ["gestao_id"]
            isOneToOne: false
            referencedRelation: "gestoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membros_gestao_superior_id_fkey"
            columns: ["superior_id"]
            isOneToOne: false
            referencedRelation: "membros_gestao"
            referencedColumns: ["id"]
          },
        ]
      }
      palestrantes: {
        Row: {
          bio: string | null
          created_at: string
          evento_id: string
          foto_url: string | null
          id: string
          nome: string
          ordem: number
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          evento_id: string
          foto_url?: string | null
          id?: string
          nome: string
          ordem?: number
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          evento_id?: string
          foto_url?: string | null
          id?: string
          nome?: string
          ordem?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "palestrantes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          aceite_privacidade_em: string
          asaas_payment_id: string | null
          cliente_id: string
          codigo: string
          created_at: string
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"]
          id: string
          invoice_url: string | null
          lote_id: string
          pago_em: string | null
          status: Database["public"]["Enums"]["status_pedido"]
          total_centavos: number
          updated_at: string
        }
        Insert: {
          aceite_privacidade_em?: string
          asaas_payment_id?: string | null
          cliente_id: string
          codigo?: string
          created_at?: string
          forma_pagamento?: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          invoice_url?: string | null
          lote_id: string
          pago_em?: string | null
          status?: Database["public"]["Enums"]["status_pedido"]
          total_centavos: number
          updated_at?: string
        }
        Update: {
          aceite_privacidade_em?: string
          asaas_payment_id?: string | null
          cliente_id?: string
          codigo?: string
          created_at?: string
          forma_pagamento?: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          invoice_url?: string | null
          lote_id?: string
          pago_em?: string | null
          status?: Database["public"]["Enums"]["status_pedido"]
          total_centavos?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_admin: {
        Row: {
          created_at: string
          email: string
          nome: string
          papel: Database["public"]["Enums"]["papel_admin"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          nome: string
          papel?: Database["public"]["Enums"]["papel_admin"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          nome?: string
          papel?: Database["public"]["Enums"]["papel_admin"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      produtos: {
        Row: {
          aceita_cartao: boolean
          ativo: boolean
          categoria: string
          created_at: string
          descricao: string | null
          fotos: string[]
          id: string
          lote_id: string
          nome: string
          ordem: number
          preco_centavos: number
          slug: string
          updated_at: string
        }
        Insert: {
          aceita_cartao?: boolean
          ativo?: boolean
          categoria?: string
          created_at?: string
          descricao?: string | null
          fotos?: string[]
          id?: string
          lote_id: string
          nome: string
          ordem?: number
          preco_centavos: number
          slug: string
          updated_at?: string
        }
        Update: {
          aceita_cartao?: boolean
          ativo?: boolean
          categoria?: string
          created_at?: string
          descricao?: string | null
          fotos?: string[]
          id?: string
          lote_id?: string
          nome?: string
          ordem?: number
          preco_centavos?: number
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          chave: string
          contagem: number
          created_at: string
          janela_inicio: string
          updated_at: string
        }
        Insert: {
          chave: string
          contagem?: number
          created_at?: string
          janela_inicio?: string
          updated_at?: string
        }
        Update: {
          chave?: string
          contagem?: number
          created_at?: string
          janela_inicio?: string
          updated_at?: string
        }
        Relationships: []
      }
      variacoes: {
        Row: {
          ativo: boolean
          cor: string | null
          created_at: string
          id: string
          ordem: number
          produto_id: string
          tamanho: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cor?: string | null
          created_at?: string
          id?: string
          ordem?: number
          produto_id: string
          tamanho?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cor?: string | null
          created_at?: string
          id?: string
          ordem?: number
          produto_id?: string
          tamanho?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "variacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_eventos: {
        Row: {
          created_at: string
          id: string
          id_evento_asaas: string
          payload: Json
          resultado: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          id_evento_asaas: string
          payload: Json
          resultado?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          id_evento_asaas?: string
          payload?: Json
          resultado?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ativar_gestao: { Args: { p_id: string }; Returns: undefined }
      checar_rate_limit: {
        Args: { p_chave: string; p_janela_segundos: number; p_limite: number }
        Returns: boolean
      }
      gerar_codigo_pedido: { Args: never; Returns: string }
      papel_atual: {
        Args: never
        Returns: Database["public"]["Enums"]["papel_admin"]
      }
      tem_papel: {
        Args: { papeis: Database["public"]["Enums"]["papel_admin"][] }
        Returns: boolean
      }
    }
    Enums: {
      forma_pagamento: "pix" | "cartao" | "indefinido"
      papel_admin: "superadmin" | "admin" | "editor"
      status_evento: "rascunho" | "publicado" | "cancelado"
      status_lote: "aberto" | "fechado" | "em_producao" | "entregue"
      status_pedido:
        | "aguardando_pagamento"
        | "pago"
        | "em_producao"
        | "disponivel"
        | "retirado"
        | "expirado"
        | "cancelado"
        | "estornado"
      tipo_evento:
        | "palestra"
        | "workshop"
        | "hackathon"
        | "social"
        | "semana_academica"
        | "outro"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      forma_pagamento: ["pix", "cartao", "indefinido"],
      papel_admin: ["superadmin", "admin", "editor"],
      status_evento: ["rascunho", "publicado", "cancelado"],
      status_lote: ["aberto", "fechado", "em_producao", "entregue"],
      status_pedido: [
        "aguardando_pagamento",
        "pago",
        "em_producao",
        "disponivel",
        "retirado",
        "expirado",
        "cancelado",
        "estornado",
      ],
      tipo_evento: [
        "palestra",
        "workshop",
        "hackathon",
        "social",
        "semana_academica",
        "outro",
      ],
    },
  },
} as const
