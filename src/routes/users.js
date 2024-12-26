import { default as express } from 'express';
import { default as PassportLocal } from 'passport-local';
import { default as PassportTwitter } from 'passport-twitter';
import * as usersModel from '../models/users-superagent.js';
import DBG from 'debug';
import { default as passport } from 'passport';
import { sessionCookieName } from '../utils/session-info.js';

const debug = DBG('notes:router-users');
const error = DBG('notes:error-users');

const LocalStrategy = PassportLocal.Strategy;
const TwitterStrategy = PassportTwitter.Strategy;

const router = express.Router();

const twitterCallback = process.env.TWITTER_CALLBACK_HOST
    ? process.env.TWITTER_CALLBACK_HOST
    : 'http://localhost:3000';

export let twitterLogin;

if (
    typeof process.env.TWITTER_CONSUMER_KEY !== 'undefined' &&
    process.env.TWITTER_CONSUMER_KEY !== '' &&
    typeof process.env.TWITTER_CONSUMER_SECRET !== 'undefined' &&
    process.env.TWITTER_CONSUMER_SECRET !== ''
) {
    passport.use(
        'twitter',
        new TwitterStrategy(
            {
                consumerKey: process.env.TWITTER_CONSUMER_KEY,
                consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
                callbackURL: `${twitterCallback}/users/auth/twitter/callback`,
            },
            async function (token, tokenSecret, profile, done) {
                try {
                    const user = await usersModel.findOrCreate(profile);
                    if (user) done(null, user);
                } catch (err) {
                    done(err);
                }
            }
        )
    );
    twitterLogin = true;
} else {
    twitterLogin = false;
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
        res.render('login', { title: 'Login to Notes', user: req.user, twitterLogin });
    } catch (error) {
        next(error);
    }
});

// Local Login
router.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/', // SUCCESS: Go to home page
        failureRedirect: '/login', // FAIL: Go to /user/login
    })
);

// Twitter Login
router.get('/auth/twitter', passport.authenticate('twitter'));
router.get(
    '/auth/twitter/callback',
    passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/users/login' })
);

router.get('/logout', async (req, res, next) => {
    try {
        req.session.destroy();
        req.logout();
        res.clearCookie(sessionCookieName);
        res.redirect('/');
    } catch (error) {
        next(error);
    }
});

// Setup Passport
// This route gets the content username and password from the post login route/template body
passport.use(
    'local',
    new LocalStrategy(async (username, password, done) => {
        try {
            var result = await usersModel.userPasswordCheck(username, password);
            if (result.check) {
                const user = { id: result.username, username: result.username };
                done(null, user);
            } else {
                done(null, false, result.message);
            }
        } catch (error) {
            done(error);
        }
    })
);

passport.serializeUser(function (user, done) {
    done(null, user.username);
});

passport.deserializeUser(async function (username, done) {
    try {
        var user = await usersModel.findUser(username);
        if (user) done(null, user);
    } catch (error) {
        done(error);
    }
});

export default router;
