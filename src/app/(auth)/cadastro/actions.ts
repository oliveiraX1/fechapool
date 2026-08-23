"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const DEVELOPMENT_SITE_URL = "http://127.0.0.1:3000";

const safeNameSchema = z
  .string()
  .trim()
  .min(2, "Digite pelo menos 2 caracteres.")
  .max(120, "Use no máximo 120 caracteres.")
  .refine(
    (value) => !/[\u0000-\u001f\u007f]/.test(value),
    "O texto contém caracteres inválidos.",
  );

const signUpSchema = z
  .object({
    fullName: safeNameSchema,
    companyName: safeNameSchema,
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254, "O e-mail é muito longo.")
      .email("Digite um e-mail válido."),
    password: z
      .string()
      .min(10, "A senha deve possuir pelo menos 10 caracteres.")
      .max(128, "A senha deve possuir no máximo 128 caracteres.")
      .regex(/[a-z]/, "Inclua pelo menos uma letra minúscula.")
      .regex(/[A-Z]/, "Inclua pelo menos uma letra maiúscula.")
      .regex(/[0-9]/, "Inclua pelo menos um número.")
      .regex(
        /[^A-Za-z0-9]/,
        "Inclua pelo menos um símbolo, como !, @ ou #.",
      ),
    confirmPassword: z.string(),
  })
  .superRefine((values, context) => {
    if (values.password !== values.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "As senhas não são iguais.",
      });
    }
  });

type SignUpState = {
  status: "idle" | "error" | "success";
  message: string;
  errors?: {
    fullName?: string[];
    companyName?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
};

function getEmailConfirmationUrl() {
  const configuredSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEVELOPMENT_SITE_URL;

  try {
    const siteUrl = new URL(configuredSiteUrl);

    if (siteUrl.protocol !== "http:" && siteUrl.protocol !== "https:") {
      return `${DEVELOPMENT_SITE_URL}/auth/confirm`;
    }

    return new URL("/auth/confirm", siteUrl).toString();
  } catch {
    return `${DEVELOPMENT_SITE_URL}/auth/confirm`;
  }
}

export async function signUp(
  _previousState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const honeypot = String(formData.get("website") ?? "").trim();

  if (honeypot) {
    return {
      status: "success",
      message:
        "Se os dados puderem ser cadastrados, enviaremos uma confirmação por e-mail.",
    };
  }

  const validation = signUpSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    companyName: String(formData.get("companyName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Revise os campos destacados antes de continuar.",
      errors: {
        fullName: errors.fullName,
        companyName: errors.companyName,
        email: errors.email,
        password: errors.password,
        confirmPassword: errors.confirmPassword,
      },
    };
  }

  const { fullName, companyName, email, password } = validation.data;

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getEmailConfirmationUrl(),
        data: {
          full_name: fullName,
          company_name: companyName,
        },
      },
    });

    if (error) {
      console.error("[auth/signup] Cadastro recusado pelo Supabase.", {
        name: error.name,
        status: error.status,
      });

      if (error.status === 429) {
        return {
          status: "error",
          message:
            "Muitas tentativas foram feitas. Aguarde alguns minutos e tente novamente.",
        };
      }

      return {
        status: "error",
        message:
          "Não foi possível concluir o cadastro agora. Confira os dados e tente novamente.",
      };
    }

    return {
      status: "success",
      message:
        "Cadastro recebido. Abra seu e-mail para confirmar sua conta no FechaPool.",
    };
  } catch {
    console.error("[auth/signup] Falha inesperada ao criar a conta.");

    return {
      status: "error",
      message:
        "O serviço está temporariamente indisponível. Tente novamente em alguns instantes.",
    };
  }
}