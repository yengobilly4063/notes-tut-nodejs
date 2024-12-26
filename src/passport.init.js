import passport from 'passport';

export function initPassport(app) {
    app.use(passport.initialize());
    app.use(passport.session());
}
