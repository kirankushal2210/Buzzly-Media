import type { NextRequest } from "next/server";
import { getCrm } from "@/db/crm";
import { entities, isEntityKey, schemaFor } from "@/lib/crm-config";
import { adminJson, requireAdmin, sameOrigin } from "@/lib/admin-session";

type Params = { params: Promise<{ entity: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { entity } = await params;
  if (!isEntityKey(entity)) return adminJson({ error: "Not found." }, 404);
  const crm = await getCrm();
  if (!crm) return adminJson({ error: "The CRM database isn’t connected yet." }, 503);
  return adminJson({ records: await crm.list(entity) });
}

export async function POST(request: NextRequest, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!sameOrigin(request)) return adminJson({ error: "Invalid request." }, 403);
  const { entity } = await params;
  if (!isEntityKey(entity)) return adminJson({ error: "Not found." }, 404);
  const parsed = schemaFor(entities[entity]).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return adminJson({ error: "Please check the highlighted fields.", fields: parsed.error.flatten().fieldErrors }, 400);
  const crm = await getCrm();
  if (!crm) return adminJson({ error: "The CRM database isn’t connected yet." }, 503);
  return adminJson({ record: await crm.create(entity, parsed.data as Record<string, string | number>) }, 201);
}
