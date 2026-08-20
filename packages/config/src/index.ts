export interface AppConfig {
  apiBaseUrl: string;
}

export function getApiBaseUrl(env: Record<string, string | undefined>): string {
  return (
    env.VITE_API_BASE_URL ??
    env.EXPO_PUBLIC_API_BASE_URL ??
    env.API_BASE_URL ??
    "http://localhost:8000"
  );
}

export function createConfig(env: Record<string, string | undefined>): AppConfig {
  return {
    apiBaseUrl: getApiBaseUrl(env),
  };
}

export const API_PREFIX = "/api/v1";
