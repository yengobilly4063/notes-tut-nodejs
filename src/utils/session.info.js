import { default as expressSession } from 'express-session';
import sessionFileStore from 'session-file-store';

export const session = expressSession;
export const FileStore = sessionFileStore(session);
export const sessionCookieName = process.env.SESSION_COOKIE_NAME || 'notescookie.sid';
export const sessionSecret = 'keyboard mouse';
export const sessionStore = new FileStore({ path: 'sessions' });
