import { Endpoint } from './spec/endpoint';

export const ROOT_URL = 'https://api.pdfjs.express';
export const ENDPOINTS: Record<string, Endpoint> = {
  MERGE: {
    url: `${ROOT_URL}/merge`,
    method: 'post'
  },
  SET: {
    url: `${ROOT_URL}/set`,
    method: 'post'
  },
  EXTRACT: {
    url: `${ROOT_URL}/extract`,
    method: 'post'
  },
  DELETE: {
    url: `${ROOT_URL}/delete`,
    method: 'post'
  },
} as const;
export const MAX_FILE_SIZE = 5.5e+6; // 5.5mb