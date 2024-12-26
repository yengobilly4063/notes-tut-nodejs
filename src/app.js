import { default as express } from 'express';
import * as path from 'path';
import { default as hbs } from 'hbs';
import { default as cookieParser } from 'cookie-parser';
import * as http from 'http';
import { approotdir } from './approotdir.js';
const __dirname = approotdir;
import { normalizePort, onError, onListening, handle404, basicErrorHandler } from './appsupport.js';
import configureLogs from './utils/logger.js';
import { default as configureServerDebug } from './utils/debug.js';
import { default as indexRouter } from './routes/index.js';
import { default as notesRouter } from './routes/notes.js';
import { default as usersRouter } from './routes/users.js';
import { configureDotenv } from './utils/dotenv.js';
import { configureSocketIoServer } from './socket.io.server.js';
import { initPassport } from './passport.init.js';
import { initAppSession } from './session.init.js';

configureDotenv();

const app = express();

// GET and SET app PORT
export const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Set up server
export const httpServer = http.createServer(app);
httpServer.listen(port);

httpServer.on('request', configureServerDebug);
httpServer.on('error', onError);
httpServer.on('listening', onListening);

// Setup socket.io server
configureSocketIoServer(httpServer);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

configureLogs(app);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Initialize Session
initAppSession(app);

// Intialize passport, initialization & session injection
initPassport(app);

app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

// Static resources
app.use(express.static(path.join(__dirname, '../', 'public')));

app.use(
    '/assets/vendor/jquery',
    express.static(path.join(__dirname, '../', 'node_modules', 'jquery', 'dist'))
);
app.use(
    '/assets/vendor/popper.js',
    express.static(path.join(__dirname, '../', 'node_modules', 'popper.js', 'dist', 'umd'))
);

app.use(
    '/assets/vendor/feather-icons',
    express.static(path.join(__dirname, '../', 'node_modules', 'feather-icons', 'dist'))
);
// app.use('/assets/vendor/bootstrap', express.static(path.join(__dirname, 'theme', 'dist')));
app.use(
    '/assets/vendor/bootstrap/js',
    express.static(path.join(__dirname, '../', 'node_modules', 'bootstrap', 'dist', 'js'))
);
app.use('/assets/vendor/bootstrap/css', express.static(path.join(__dirname, 'minty')));

// ROUTES
app.use('/', indexRouter);
app.use('/notes', notesRouter);
app.use('/users', usersRouter);

// Error handlers
// catch 404 and forward to error handler
app.use(handle404);
app.use(basicErrorHandler);

export default app;
