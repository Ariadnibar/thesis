import { EnvVarKey } from './enums';
import type { StorageItems } from './types';

export const getSessionItem = <K extends keyof StorageItems, V extends StorageItems[K]['value']>(key: K): V | null => {
  const valueInSessionStorage = window.sessionStorage.getItem(key);

  if (valueInSessionStorage) {
    if (typeof valueInSessionStorage === 'string') {
      return valueInSessionStorage as V;
    }

    return JSON.parse(valueInSessionStorage) as V;
  }

  return null;
};

export const setSessionItem = <K extends keyof StorageItems>(key: K, value: StorageItems[K]['value']) => {
  if (typeof value === 'string') {
    window.sessionStorage.setItem(key, value);
    return;
  }

  window.sessionStorage.setItem(key, JSON.stringify(value));
};

export const removeSessionItem = <K extends keyof StorageItems>(key: K) => {
  window.sessionStorage.removeItem(key);
};

export const getAccessToken = () => {
  return getSessionItem('token');
};

export const getEnvVar = (key: EnvVarKey, fallback?: string) => {
  return import.meta.env[key] || fallback;
};

export const getApiUrl = () => {
  return getEnvVar(EnvVarKey.API_URL);
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};
