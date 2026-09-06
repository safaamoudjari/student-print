import fs from 'fs';
import { PageCountStatus } from '../models/OrderFile';

export interface PageCountResult {
  pageCount: number;
  status: PageCountStatus;
}

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const WORD_MIME_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Detects the page count for an uploaded file.
// - PDFs: parsed with pdf-parse for an exact page count.
// - Images: always exactly 1 page.
// - Word documents: we cannot reliably count pages server-side without a
//   heavy conversion pipeline, so we return an honest "estimated" 1-page
//   fallback rather than pretending to know the real count. The admin can
//   correct this after opening the file.
export async function detectPageCount(
  filePath: string,
  mimeType: string
): Promise<PageCountResult> {
  if (mimeType === 'application/pdf') {
    try {
      // Lazy require: pdf-parse has a debug code path in its index that
      // touches a sample file when imported eagerly under some bundlers.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse');
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      const count = data?.numpages;
      if (typeof count === 'number' && count > 0) {
        return { pageCount: count, status: 'exact' };
      }
      return { pageCount: 1, status: 'unknown' };
    } catch {
      return { pageCount: 1, status: 'unknown' };
    }
  }

  if (IMAGE_MIME_TYPES.includes(mimeType)) {
    return { pageCount: 1, status: 'exact' };
  }

  if (WORD_MIME_TYPES.includes(mimeType)) {
    return { pageCount: 1, status: 'estimated' };
  }

  return { pageCount: 1, status: 'unknown' };
}
