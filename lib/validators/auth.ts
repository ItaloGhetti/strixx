import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const cadastroSchema = z.object({
  nome: z.string().min(2, "Informe seu nome"),
  email: z.string().email("Informe um e-mail válido"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
  role: z.enum(["personal", "aluno"]),
});
export type CadastroInput = z.infer<typeof cadastroSchema>;
