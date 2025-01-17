import { default as session } from 'express-session';
import sessionFileStore from 'session-file-store';
export const sessionCookieName = process.env.SESSION_COOKIE_NAME || 'notescookie.sid';
export const sessionSecret = 'keyboard mouse';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import redisIO from 'socket.io-redis';
import { socketio } from './app';

let _sessionStore;

if (typeof process.env.REDIS_ENDPOINT !== 'undefined' && process.env.REDIS_ENDPOINT !== '') {
    socketio.adapter(
        redisIO({
            host: process.env.REDIS_ENDPOINT,
            port: 6379,
        })
    );
    const redisClient = createClient();
    let _sessionStore = new RedisStore({
        client: redisClient,
        prefix: 'notes',
    });
    _sessionStore = new RedisStore({ client: redisClient });
} else {
    const FileStore = sessionFileStore(session);
    _sessionStore = new FileStore({ path: 'sessions' });
}

export const sessionStore = _sessionStore;

export function initAppSession(app) {
    app.use(
        session({
            store: sessionStore,
            secret: sessionSecret,
            resave: true,
            saveUninitialized: true,
            name: sessionCookieName,
        })
    );
}
