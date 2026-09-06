// This is a rough, client-only estimate so the order form can show a live
// price while the student is still choosing options. It is NOT trusted for
// billing — the backend always re-parses every uploaded PDF with pdf-parse
// and stores the authoritative page count (see server/src/utils/pageCount.ts).
// Images always count as 1 page here; Word files can't be reliably counted
// without a heavy conversion step, so we estimate 1 page and let the
// backend mark it as "estimated" for the admin to double check.
export async function estimatePageCount(file: File): Promise<number> {
  if (file.type === 'application/pdf') {
    try {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder('latin1').decode(buffer);
      const matches = text.match(/\/Type\s*\/Page[^s]/g);
      if (matches && matches.length > 0) return matches.length;
      return 1;
    } catch {
      return 1;
    }
  }
  return 1; // images and Word documents
}
