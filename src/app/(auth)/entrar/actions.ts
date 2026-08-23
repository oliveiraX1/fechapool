"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "O e-mail é muito longo.")
    .email("Digite um e-mail válido."),
  password: z
    .string()
    .min(1, "Digite sua senha.")
    .max(128, "A senha é muito longa."),
});

type LoginState = {
  status: "idle" | "error";
  message: string;
  errors?: {
    email?: string[];
    password?: string[];
  };
};

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const honeypot = String(formData.get("website") ?? "").trim();

  if (honeypot) {
    return {
      status: "error",
      message: "E-mail ou senha inválidos.",
    };
  }

  const validation = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Revise os campos destacados.",
      errors: {
        email: errors.email,
        password: errors.password,
      },
    };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (error) {
      console.error("[auth/login] Login recusado pelo Supabase.", {
        name: error.name,
        status: error.status,
      });

      if (error.status === 429) {
        return {
          status: "error",
          message:
            "Muitas tentativas foram feitas. Aguarde alguns minutos.",
        };
      }

      return {
        status: "error",
        message: "E-mail ou senha inválidos.",
      };
    }
  } catch {
    console.error("[auth/login] Falha inesperada durante o login.");

    return {
      status: "error",
      message:
        "O serviço está temporariamente indisponível. Tente novamente.",
    };
  }

  redirect("/dashboard");
}