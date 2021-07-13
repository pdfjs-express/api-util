import { isServer } from './env';

export const getFetch = () => isServer ? require('node-fetch').default : window.fetch;