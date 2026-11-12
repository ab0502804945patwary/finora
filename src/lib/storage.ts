import fs from "node:fs/promises";
import path from "node:path";
import { AwsClient } from "aws4fetch";

/*
 * Where issued PDFs are stored, picked by environment variables (first match wins):
 *   1. Supabase Storage (private bucket)  SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + SUPABASE_BUCKET
 *   2. Cloudflare R2 (private bucket)     R2_ACCOUNT_ID + R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY + R2_BUCKET
 *   3. Local disk ./data/files            (development)
 * file_ref in the database is "supabase:<key>", "r2:<key>" or "local:<file>", so old records keep working
 * after switching provider.
 */

const localDir = () => path.join(process.cwd(), "data", "files");

function supabase() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_BUCKET;
  if (!url || !key || !bucket) return null;
  const encode = (k: string) => k.split("/").map(encodeURIComponent).join("/");
  return {
    objectUrl: (k: string) => `${url}/storage/v1/object/${encodeURIComponent(bucket)}/${encode(k)}`,
    headers: { Authorization: `Bearer ${key}`, apikey: key },
  };
}

function r2() {
  const { R2_ACCOUNT_ID: account, R2_ACCESS_KEY_ID: accessKeyId, R2_SECRET_ACCESS_KEY: secretAccessKey, R2_BUCKET: bucket } = process.env;
  if (!account || !accessKeyId || !secretAccessKey || !bucket) return null;
  return {
    client: new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto" }),
    url: (key: string) => `https://${account}.r2.cloudflarestorage.com/${bucket}/${key}`,
  };
}

export async function savePdf(id: string, bytes: Uint8Array): Promise<string> {
  const key = `documents/${id}.pdf`;

  const sb = supabase();
  if (sb) {
    const res = await fetch(sb.objectUrl(key), {
      method: "POST",
      headers: { ...sb.headers, "Content-Type": "application/pdf", "x-upsert": "true" },
      body: Buffer.from(bytes),
    });
    if (!res.ok) throw new Error(`Supabase upload failed: ${res.status} ${await res.text().catch(() => "")}`);
    return `supabase:${key}`;
  }

  const store = r2();
  if (store) {
    const res = await store.client.fetch(store.url(key), {
      method: "PUT",
      headers: { "Content-Type": "application/pdf" },
      body: Buffer.from(bytes),
    });
    if (!res.ok) throw new Error(`R2 upload failed: ${res.status}`);
    return `r2:${key}`;
  }

  await fs.mkdir(localDir(), { recursive: true });
  await fs.writeFile(path.join(localDir(), `${id}.pdf`), bytes);
  return `local:${id}.pdf`;
}

export async function readPdf(ref: string): Promise<Uint8Array> {
  if (ref.startsWith("local:")) {
    const name = path.basename(ref.slice(6));
    return new Uint8Array(await fs.readFile(path.join(localDir(), name)));
  }
  if (ref.startsWith("supabase:")) {
    const sb = supabase();
    if (!sb) throw new Error("Supabase Storage is not configured");
    const res = await fetch(sb.objectUrl(ref.slice(9)), { headers: sb.headers, cache: "no-store" });
    if (!res.ok) throw new Error(`Supabase download failed: ${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
  }
  if (ref.startsWith("r2:")) {
    const store = r2();
    if (!store) throw new Error("R2 is not configured");
    const res = await store.client.fetch(store.url(ref.slice(3)), { method: "GET", cache: "no-store" });
    if (!res.ok) throw new Error(`R2 download failed: ${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
  }
  throw new Error("Unknown file reference");
}
