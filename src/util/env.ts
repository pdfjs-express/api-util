export const isClient = (() => typeof window !== 'undefined')();
export const isServer = (() => typeof window === 'undefined')();
// @ts-ignore
export const env = (() => typeof ENV === 'undefined' ? 'test' : ENV)();