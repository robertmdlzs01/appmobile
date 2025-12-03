export interface ApiConfig {
  baseUrl: string;
  version: string;
  timeout: number;
}

export const getApiConfig = (): ApiConfig => {
  return {
    baseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
    version: process.env.API_VERSION || 'v1',
    timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
  };
};

export const getApiUrl = (endpoint: string = ''): string => {
  const config = getApiConfig();
  const basePath = `/api${config.version !== 'v1' ? `/${config.version}` : ''}`;
  return `${config.baseUrl}${basePath}${endpoint}`;
};

