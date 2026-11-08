import { normalizeApiBaseUrl, siteOriginFromApiBase } from '@/utils/site-origin';

export { normalizeApiBaseUrl, siteOriginFromApiBase } from '@/utils/site-origin';

export function getApiBaseUrl(): string {
  return normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
}

export function getSiteOrigin(): string {
  return siteOriginFromApiBase(import.meta.env.VITE_API_BASE_URL);
}
