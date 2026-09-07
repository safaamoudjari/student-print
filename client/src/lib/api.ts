import axios from 'axios';

// Always call /api on our own domain — Vercel rewrites this to the Render
// backend (see client/vercel.json). This keeps the auth cookie first-party
// so it isn't blocked by mobile browsers' cross-site cookie restrictions.
// Do NOT point this at the Render URL directly.
const baseURL = '/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || 'Something went wrong. Please try again.';
  }

  return 'Something went wrong. Please try again.';
}