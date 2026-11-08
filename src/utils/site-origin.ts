export const DEFAULT_API_BASE_URL = 'https://blog.yahui.wang/api';

export function normalizeApiBaseUrl(apiBase?: string): string {
  const value = (apiBase ?? '').trim() || DEFAULT_API_BASE_URL;
  return value.replace(/\/+$/, '');
}

/** 从 API 基址去掉末尾的 /api，得到站点根域名。 */
export function siteOriginFromApiBase(apiBase?: string): string {
  const normalized = normalizeApiBaseUrl(apiBase);
  const origin = normalized.replace(/\/api$/, '');
  return origin || normalized;
}
