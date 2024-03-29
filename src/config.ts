import { Endpoint } from './spec/endpoint';
import { env } from './util/env';

export const ROOT_URL = env === 'test' ?
  'https://d24tmkhit7.execute-api.us-east-1.amazonaws.com/staging' :
  'https://api.pdfjs.express';

export const ENDPOINTS: Record<string, Endpoint> = {
  MERGE: {
    url: `${ROOT_URL}/xfdf/merge`,
    method: 'post'
  },
  SET: {
    url: `${ROOT_URL}/xfdf/set`,
    method: 'post'
  },
  EXTRACT: {
    url: `${ROOT_URL}/xfdf/extract`,
    method: 'post'
  },
  DELETE: {
    url: `${ROOT_URL}/delete`,
    method: 'post'
  },
  WATERMARK: {
    url: `${ROOT_URL}/watermark`,
    method: 'post'
  },
} as const;
export const MAX_FILE_SIZE = 5.5e+6; // 5.5mb