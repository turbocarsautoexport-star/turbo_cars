"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { getCurrentWorker } from "@/lib/queries/workers";

export async function inviteWorker(formData: FormData): Promise<{ error?: string; tempPassword?: string }> {
  const supabase = await createClient();
  const requester = await getCurrentWorker(supabase);
  if (!requester || requester.role !== "admin") {
    return { error: "Faqat admin xodim qo'sha oladi." };
  }

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  if (!name || !email) return { error: "Ism va email talab qilinadi." };

  const tempPassword = Math.random().toString(36).slice(-10) + "A1!";

  const admin = await createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name },
  });

  if (error) return { error: error.message };
  return { tempPassword };
}
