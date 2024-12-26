import * as express from 'express';
import { NotesStore } from '../models/store.js';
import { twitterLogin } from './users.js';
import { socketio } from '../app.js';

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

async function getKeyTitleList() {
    const keylist = await NotesStore.keylist();
    const notePromises = keylist.map((key) => {
        return NotesStore.read(key);
    });
    const notelist = await Promise.all(notePromises);

    return notelist.map(({ key, title }) => ({ key, title }));
}

const emitNoteTitles = async () => {
    const notelist = await getKeyTitleList();
    socketio.of('/home').emit('notetitles', { notelist });
};

export function init() {
    socketio.of('/home').on('connect', (socket) => {
        debug('socketio connection on /home');
    });
    NotesStore.on('notecreated', emitNoteTitles);
    NotesStore.on('noteupdate', emitNoteTitles);
    NotesStore.on('notedestroy', emitNoteTitles);
}

export default router;
