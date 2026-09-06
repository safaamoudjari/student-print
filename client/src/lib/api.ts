import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Every backend error responds with { message }. This normalizes any axios
// error into a plain, user-friendly string so components never have to dig
// into the response shape themselves.
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || 'Something went wrong. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}
