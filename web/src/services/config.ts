/// <reference types="vite/client" />

export interface ApiConfig {
  baseUrl: string;
  key?: string;
  region: string;
}

export interface ObservabilityConfig {
  connectionString: string;
}

export interface AppConfig {
  api: ApiConfig;
  observability: ObservabilityConfig;
}

const config: AppConfig = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || undefined,
    key: import.meta.env.VITE_SPEECH_KEY || undefined,
    region: import.meta.env.VITE_SPEECH_REGION || 'canadacentral',
  },
  observability: {
    connectionString: import.meta.env.VITE_APPLICATIONINSIGHTS_CONNECTION_STRING || '',
  },
};

export default config;
