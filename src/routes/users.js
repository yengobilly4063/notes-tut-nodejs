import { default as express } from 'express';
import { default as passport } from 'passport';
import { default as passportLocal } from 'passport-local';
import * as usersModel from '../models/users-superagent.js';
import DBG from 'debug';
import session from 'express-session';
import sessionFileStore from 'session-file-store';

// Session const info
const FileStore = sessionFileStore(session);
export const sessionCookieName = 'notescookie.sid';

const debug = DBG('notes:router-users');
const error = DBG('notes:error-users');

const LocalStrategy = passportLocal.Strategy;

const router = express.Router();

export function initPassport(app) {
    app.use(
        session({
            store: new FileStore({ path: 'sessions' }),
            secret: 'keyboard mouse',
            resave: true,
            saveUninitialized: true,
            name: sessionCookieName,
            cookie: { secure: true },
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());
}

export function ensureAuthenticated(req, res, next) {
    try {
        // req.user is set by Passport in the deserialize function
        if (req.user) next();
        else res.redirect('/users/login');
    } catch (error) {
        next(error);
    }
}

// Routes
router.get('/login', async (req, res, next) => {
    try {
        res.render('login', { title: 'Login to Notes', user: req.user });
    } catch (error) {
        next(error);
    }
});

router.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/', // SUCCESS: Go to home page
        failureRedirect: '/login', // FAIL: Go to /user/login
        session: false,
    })
);

router.get('/logout', async (req, res, next) => {
    try {
        req.session.destroy((err) => err && next(err));
        req.logout((err) => err && next(err));
        res.clearCookie(sessionCookieName);
    } catch (error) {
        next(error);
    }
});

// Setup Passport
// This route gets the content username and password from the post login route/template body
passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            var result = await usersModel.userPasswordCheck(username, password);
            if (result.check) {
                done(null, { id: result.username, username: result.username });
            } else {
                done(null, false, result.message);
            }
        } catch (error) {
            done(error);
        }
    })
);

passport.serializeUser(function (user, done) {
    try {
        done(null, user.username);
    } catch (error) {
        done(error);
    }
});

passport.deserializeUser(async function (username, done) {
    try {
        var user = await usersModel.findUser(username);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default router;
