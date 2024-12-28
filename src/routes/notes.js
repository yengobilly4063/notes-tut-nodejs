import { default as express } from 'express';
import { NotesStore } from '../models/store.js';
import { generateKey } from '../utils/uuid-keygenerator.js';
import { ensureAuthenticated, twitterLogin } from './users.js';
import { emitNoteTitles } from '../emitters/notes.emitters.js';
import { socketio } from '../app.js';
import { MessagesEmitEvents, NotesEmitEvents } from '../models/event.list.js';
import {
    postMessage,
    destroyMessage,
    recentMessages,
    emitter as msgEmitter,
} from '../models/messages.sequelize.js';

import DBG from 'debug';
const debug = DBG('notes:home');
const error = DBG('notes:error-home');

const router = express.Router();

// Add Note
router.get('/add', ensureAuthenticated, (req, res, next) => {
    res.render('noteedit', {
        title: 'Add a note',
        docreate: true,
        notekey: '',
        note: undefined,
        user: req.user,
        twitterLogin,
    });
});

// Save note (update)
router.post('/save', ensureAuthenticated, async (req, res, next) => {
    try {
        let notekey = req.body.notekey;
        const { docreate, title, body } = req.body;

        if (docreate === 'create') {
            notekey = generateKey();

            await NotesStore.create(notekey, title, body);
        } else {
            await NotesStore.update(notekey, title, body);
        }

        res.redirect(`/notes/view?key=${notekey}`);
    } catch (err) {
        next(err);
    }
});

// Read Note (read)
router.get('/view', async (req, res, next) => {
    try {
        const { key } = req.query;

        const note = await NotesStore.read(key);
        const messages = await recentMessages('/notes', key);

        res.render('noteview', {
            title: note ? note.title : '',
            notekey: key,
            note,
            user: req.user ? req.user : undefined,
            messages,
            twitterLogin,
        });
    } catch (err) {
        next(err);
    }
});

// Edit note (update)
router.get('/edit', ensureAuthenticated, async (req, res, next) => {
    try {
        const { key } = req.query;
        const note = await NotesStore.read(key);

        res.render('noteedit', {
            title: note ? `Edit ${note.title}` : 'Add a Note',
            docreate: false,
            notekey: key,
            note,
            user: req.user,
            twitterLogin,
        });
    } catch (error) {
        next(error);
    }
});

// Ask to Delete note (destroy)
router.get('/destroy', ensureAuthenticated, async (req, res, next) => {
    try {
        const { key } = req.query;
        const note = await NotesStore.read(key);

        res.render('notedestroy', {
            title: note ? `Delete ${note.title}` : '',
            notekey: key,
            note,
            user: req.user,
            twitterLogin,
        });
    } catch (error) {
        next(error);
    }
});

// Really destroy note (destroy)
router.post('/destroy/confirm', ensureAuthenticated, async (req, res, next) => {
    try {
        const { key } = req.body;

        await NotesStore.destroy(key);
        res.redirect('/');
    } catch (error) {
        next(error);
    }
});

export function init() {
    socketio.of('/notes').on('connect', (socket) => {
        const notekey = socket.handshake.query.key;

        if (notekey) {
            socket.join(notekey);

            socket.on(MessagesEmitEvents.createmsg, async (newMsg, fn) => {
                try {
                    const { from, namespace, room, message } = newMsg;
                    await postMessage({ from, namespace, room, message });
                    fn('ok');
                } catch (err) {
                    error(`FAIL to create message ${err.stack}`);
                }
            });

            socket.on(MessagesEmitEvents.destroymessage, async (data) => {
                try {
                    await destroyMessage(data.id);
                } catch (err) {
                    error(`FAIL to delete message ${err.stack}`);
                }
            });
        }
    });

    NotesStore.on(NotesEmitEvents.updated, (note) => {
        const { key, title, body } = note;
        const toEmit = {
            key,
            title,
            body,
        };
        socketio.of('/notes').to(key).emit(NotesEmitEvents.updated, toEmit);
        emitNoteTitles();
    });
    NotesStore.on(NotesEmitEvents.destroyed, (key) => {
        socketio.of('/notes').to(key).emit(NotesEmitEvents.destroyed, key);
        emitNoteTitles();
    });

    msgEmitter.on(MessagesEmitEvents.created, (newMsg) => {
        const { namespace, room } = newMsg;
        socketio.of(namespace).to(room).emit(MessagesEmitEvents.newmessage, newMsg);
    });

    msgEmitter.on(MessagesEmitEvents.destroyed, (data) => {
        const { namespace, room } = data;
        socketio.of(namespace).to(room).emit(MessagesEmitEvents.destroyed, data);
    });
}

export default router;
