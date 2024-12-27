import { socketio } from '../app.js';
import { NotesStore } from '../models/notes-store.js';
import { debug } from '../utils/debug.js';
import util from 'util';

export const emitNoteTitles = async () => {
    const notelist = await getKeyTitleList();
    socketio.of('/home').emit('notetitles', { notelist });
    // Emit for other pages of rooms
    debug('emiting new notelists', notelist);
};

export async function getKeyTitleList() {
    const keylist = await NotesStore.keylist();
    const notePromises = keylist.map((key) => {
        return NotesStore.read(key);
    });
    const notelist = await Promise.all(notePromises);

    return notelist.map(({ key, title }) => ({ key, title }));
}
