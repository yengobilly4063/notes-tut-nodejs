import { default as DBG } from 'debug';

const debug = DBG('notes:debug');
const dbgerror = DBG('notes:error');

function configureServerDebug(req, res) {
    debug(`${new Date().toISOString()} request ${req.method}${req.url}`);
}

export { configureServerDebug as default, debug, dbgerror };
