import { port, server } from './app.js';
import { dbgerror, debug } from './utils/debug.js';
import * as util from 'util';
import { NotesStore } from './models/notes-store.js';

export function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }
    if (port > 0) {
        return port;
    }
    return false;
}

export function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    debug(`[Server]: Listening at http://127.0.0.1:${port} on ${bind}`);
}

export function onError(error) {
    dbgerror(error);
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        case 'ENOTESSTORE':
            console.error(`Notes data store initialization failure because `, error.error);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

export function handle404(req, res, next) {
    const error = new Error('Not Found');
    error.status = 404;

    return next(error);
}

export function basicErrorHandler(err, req, res, next) {
    // Defer to built-in error handler if headersSent
    // See: http://expressjs.com/en/guide/error-handling.html
    if (res.headersSent) {
        return next(err);
    }

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
}

async function catchProcessDeath() {
    debug('urk...');
    await NotesStore.close();
    if (server) {
        await server.close();
    }
    process.exit(0);
}

process.on('SIGTERM', catchProcessDeath);
process.on('SIGINT', catchProcessDeath);
process.on('SIGHUP', catchProcessDeath);

process.on('exit', () => {
    debug('exiting...');
});

// Handle uncaughtException
process.on('uncaughtException', function (err) {
    console.error(`I've crashed!!! - ${err.stack || err}`);
});

// Handle unhandledRejection
process.on('unhandledRejection', (reason, processId) => {
    console.error(
        `Unhandled Regection at: ${util.inspect(processId)} reason: ${util.inspect(reason)}`
    );
});
