import * as express from 'express';
import { NotesStore } from '../models/store.js';
import { twitterLogin } from './users.js';
import { socketio } from '../app.js';
import { debug } from '../utils/debug.js';
import { NotesEmitEvents } from '../models/event.list.js';
import { emitNoteTitles, getKeyTitleList } from '../emitters/notes.emitters.js';

const router = express.Router();

/* GET home page. */
router.get('/', async (req, res, next) => {
    try {
        const notelist = await getKeyTitleList();

        res.render('index', {
            title: 'Notes',
            notelist,
            user: req.user ? req.user : undefined,
            twitterLogin,
        });
    } catch (err) {
        next(err);
    }
});

export function init() {
    socketio.of('/home').on('connect', (socket) => {
        debug('socketio connection on /home');
    });
    NotesStore.on(NotesEmitEvents.created, emitNoteTitles);
    NotesStore.on(NotesEmitEvents.updated, emitNoteTitles);
    NotesStore.on(NotesEmitEvents.destroyed, emitNoteTitles);
}

export default router;
