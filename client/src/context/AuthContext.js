import { createContext } from 'react';

export const AUTH_STATUS = Object.freeze({
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  GUEST: 'guest',
});

export const AuthContext = createContext(null);
