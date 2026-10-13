import { preparePartnerUpload, confirmPartnerUpload } from "./partner-submission.functions";

export async function uploadPartnerFile(options: {
  id: string; docType: string; file: File; version: string;
  signal: AbortSignal; progress: (percent: number) => void;
}) {
  const { id, docType, file, version, signal, progress } = options;
  const mime = file.type;
  if (mime !== "image/jpeg" && mime !== "image/png" && mime !== "application/pdf") throw new Error("Use a JPG, PNG or PDF.");
  const prepared = await preparePartnerUpload({ data: { id, docType: docType as "rc", version, mime, size: file.size } });
  const confirm = () => confirmPartnerUpload({ data: { id, docType: docType as "rc", path: prepared.path, name: file.name, mime, size: file.size } });
  // Reconcile first: a previous upload may have finished despite a lost response.
  try { await confirm(); progress(100); return; } catch { /* Not stored yet. */ }
  if (signal.aborted) throw new Error("Upload cancelled. Retry when ready.");
  const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/upload/sign/partner-documents/${prepared.path}?token=${encodeURIComponent(prepared.token)}`;
  try {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const abort = () => xhr.abort();
      const finish = (error?: Error) => { signal.removeEventListener("abort", abort); error ? reject(error) : resolve(); };
      xhr.open("PUT", url);
      xhr.timeout = 60000;
      xhr.setRequestHeader("Content-Type", mime);
      xhr.setRequestHeader("x-upsert", "false");
      xhr.upload.onprogress = e => { if (e.lengthComputable) progress(Math.round(e.loaded / e.total * 95)); };
      xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? finish() : finish(new Error("Upload failed. Retry this file."));
      xhr.onerror = () => finish(new Error("Connection lost. Retry this file."));
      xhr.ontimeout = () => finish(new Error("Upload timed out. Retry this file."));
      xhr.onabort = () => finish(new Error("Upload cancelled. Retry this file."));
      signal.addEventListener("abort", abort, { once: true });
      xhr.send(file);
    });
  } catch (error) {
    try { await confirm(); progress(100); return; } catch { throw error; }
  }
  await confirm();
  progress(100);
}