export interface WordPressConfig {
  url: string;
  apiUrl: string;
  username: string;
  applicationPassword: string;
  eventPostType: string;
  authHeader?: string;
}

export const getWordPressConfig = (): WordPressConfig => {
  const url = process.env.WORDPRESS_URL;
  const apiUrl = process.env.WORDPRESS_API_URL || `${url}/wp-json/wp/v2`;
  const username = process.env.WORDPRESS_USERNAME;
  const applicationPassword = process.env.WORDPRESS_APPLICATION_PASSWORD;
  const eventPostType = process.env.WORDPRESS_EVENT_POST_TYPE || 'evento';
  const authHeader = process.env.WORDPRESS_AUTH_HEADER;

  if (!url) {
    throw new Error('WORDPRESS_URL no está definida en las variables de entorno');
  }

  if (!username || !applicationPassword) {
    if (!authHeader) {
      throw new Error('WORDPRESS_USERNAME y WORDPRESS_APPLICATION_PASSWORD o WORDPRESS_AUTH_HEADER deben estar definidos');
    }
  }

  return {
    url,
    apiUrl,
    username: username || '',
    applicationPassword: applicationPassword || '',
    eventPostType,
    authHeader,
  };
};

export const getWordPressAuthHeader = (config: WordPressConfig): string => {
  if (config.authHeader) {
    return config.authHeader.startsWith('Basic ') 
      ? config.authHeader 
      : `Basic ${config.authHeader}`;
  }

  const credentials = Buffer.from(
    `${config.username}:${config.applicationPassword}`
  ).toString('base64');
  
  return `Basic ${credentials}`;
};
