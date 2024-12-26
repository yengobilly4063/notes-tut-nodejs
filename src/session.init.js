import {
    sessionCookieName,
    sessionSecret,
    sessionStore,
    session as expressSession,
} from './utils/session.info.js';

export function initAppSession(app) {
    app.use(
        expressSession({
            store: sessionStore,
            secret: sessionSecret,
            resave: true,
            saveUninitialized: true,
            name: sessionCookieName,
        })
    );
}
