import { atom } from 'jotai';

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

export const tokenAtom = atom<string | null>(localStorage.getItem('token'));

export const userAtom = atom<AuthUser | null>(null);

export const isAuthenticatedAtom = atom(get => get(tokenAtom) !== null);
