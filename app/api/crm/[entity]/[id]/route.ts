import type { NextRequest } from "next/server";
import { getCrm } from "@/db/crm";
import { entities, isEntityKey, schemaFor } from "@/lib/crm-config";
import { adminJson, requireAdmin, sameOrigin } from "@/lib/admin-session";

type Params = { params: Promise<{ entity: string; id: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function guard(request: NextRequest, params: Params["params"]) {
  const denied = await requireAdmin();
  if (denied) return { denied };
  if (!sameOrigin(request)) return { denied: adminJson({ error: "Invalid request." }, 403) };
  const { entity, id } = await params;
  if (!isEntityKey(entity) || !UUID.test(id)) return { denied: adminJson({ error: "Not found." }, 404) };
  const crm = await getCrm();
  if (!crm) return { denied: adminJson({ error: "The CRM database isn’t connected yet." }, 503) };
  return { entity, id, crm };
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const g = await guard(request, params);
  if ("denied" in g) return g.denied;
  const parsed = schemaFor(entities[g.entity]).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return adminJson({ error: "Please check the highlighted fields.", fields: parsed.error.flatten().fieldErrors }, 400);
  const record = await g.crm.update(g.entity, g.id, parsed.data as Record<string, string | number>);
  return record ? adminJson({ record }) : adminJson({ error: "Not found." }, 404);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const g = await guard(request, params);
  if ("denied" in g) return g.denied;
  return (await g.crm.remove(g.entity, g.id)) ? adminJson({ ok: true }) : adminJson({ error: "Not found." }, 404);
}
