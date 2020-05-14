export const isClient = (() => typeof window !== 'undefined')();
export const isServer = (() => typeof window === 'undefined')();
// @ts-ignore
export const env = (() => ENV)();