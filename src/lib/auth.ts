
import type { IronSessionOptions } from 'iron-session';

export const sessionOptions: IronSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: 'udharibook-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

// This iron-session implementation is being replaced by JWT.
// This file is kept for now to prevent breaking dependencies but can be removed later.
declare module 'iron-session' {
  interface IronSessionData {
    isLoggedIn?: boolean;
    username?: string;
    uid?: string;
    isAdmin?: boolean;
    preauth?: boolean;
  }
}
