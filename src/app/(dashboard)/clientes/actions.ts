"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAppUser } from "@/lib/auth/require-app-user";

const safeShortText = z
  .string()
  .trim()
  .min(2, "Digite pelo menos 2 caracteres.")
  .max(120, "Use no máximo 120 caracteres.")
  .refine(
    (value) => !/[\u0000-\u001f\u007f]/.test(value),
    "O texto contém caracteres inválidos.",
  );

const leadSchema = z
  .object({
    name: safeShortText,
    phone: z
      .string()
      .trim()
      .min(8, "Digite um telefone válido.")
      .max(30, "O telefone é muito longo."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254, "O e-mail é muito longo.")
      .refine(
        (value) =>
          value === "" || z.string().email().safeParse(value).success,
        "Digite um e-mail válido.",
      ),
    city: safeShortText,
    source: z.enum([
      "whatsapp",
      "instagram",
      "facebook",
      "google",
      "referral",
      "website",
      "advertisement",
      "other",
    ]),
    sourceDetail: z
      .string()
      .trim()
      .max(120, "Use no máximo 120 caracteres."),
    notes: z
      .string()
      .trim()
      .max(5000, "Use no máximo 5.000 caracteres."),
    enteredAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Digite uma data válida."),
  })
  .superRefine((values, context) => {
    if (values.source === "other" && values.sourceDetail.length < 2) {
      context.addIssue({
        code: "custom",
        path: ["sourceDetail"],
        message: "Informe qual foi a origem do lead.",
      });
    }
  });

type CreateLeadState = {
  status: "idle" | "error";
  message: string;
  errors?: {
    name?: string[];
    phone?: string[];
    email?: string[];
    city?: string[];
    source?: string[];
    sourceDetail?: string[];
    notes?: string[];
    enteredAt?: string[];
  };
};

function normalizePhone(input: string) {
  const trimmedPhone = input.trim();
  const digits = trimmedPhone.replace(/\D/g, "");

  if (trimmedPhone.startsWith("+")) {
    return `+${digits}`;
  }

  if (
    digits.startsWith("55") &&
    (digits.length === 12 || digits.length === 13)
  ) {
    return `+${digits}`;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`;
  }

  return "";
}

export async function createLead(
  _previousState: CreateLeadState,
  formData: FormData,
): Promise<CreateLeadState> {
  const honeypot = String(formData.get("website") ?? "").trim();

  if (honeypot) {
    return {
      status: "error",
      message: "Não foi possível cadastrar o lead.",
    };
  }

  const validation = leadSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    city: String(formData.get("city") ?? ""),
    source: String(formData.get("source") ?? ""),
    sourceDetail: String(formData.get("sourceDetail") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    enteredAt: String(formData.get("enteredAt") ?? ""),
  });

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Revise os campos destacados.",
      errors: {
        name: errors.name,
        phone: errors.phone,
        email: errors.email,
        city: errors.city,
        source: errors.source,
        sourceDetail: errors.sourceDetail,
        notes: errors.notes,
        enteredAt: errors.enteredAt,
      },
    };
  }

  const normalizedPhone = normalizePhone(validation.data.phone);

  if (!/^\+[1-9][0-9]{7,14}$/.test(normalizedPhone)) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      errors: {
        phone: [
          "Digite um telefone com DDD, como (11) 99999-9999.",
        ],
      },
    };
  }

  const enteredAt = new Date(
    `${validation.data.enteredAt}T12:00:00-03:00`,
  );

  if (
    Number.isNaN(enteredAt.getTime()) ||
    enteredAt.getTime() > Date.now() + 24 * 60 * 60 * 1000
  ) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      errors: {
        enteredAt: ["A data de entrada não pode estar no futuro."],
      },
    };
  }

  const { supabase, user, organization } = await requireAppUser();

  const { error } = await supabase.from("leads").insert({
    organization_id: organization.id,
    assigned_to: user.id,
    created_by: user.id,
    name: validation.data.name,
    phone: normalizedPhone,
    email: validation.data.email || null,
    city: validation.data.city,
    source: validation.data.source,
    source_detail:
      validation.data.source === "other"
        ? validation.data.sourceDetail
        : null,
    notes: validation.data.notes || null,
    entered_at: enteredAt.toISOString(),
  });

  if (error) {
    console.error("[leads/create] Inserção recusada.", {
      code: error.code,
    });

    return {
      status: "error",
      message:
        "Não foi possível cadastrar o lead. Tente novamente.",
    };
  }

  revalidatePath("/clientes");
  revalidatePath("/dashboard");
  redirect("/clientes?criado=1");
}