import { AbstractNotesStore, Note } from './Notes.js';

const notes = [];

export default class InMemoryNotesStore extends AbstractNotesStore {
    async close() {}

    async create(key, title, body) {
        notes[key] = new Note(key, title, body);
        return notes[key];
    }

    async update(key, title, body) {
        notes[key] = new Note(key, title, body);
        return notes[key];
    }

    async read(key) {
        if (notes[key]) {
            const _note = notes[key];
            return notes[key];
        } else {
            throw new Error(`Note ${key} does not exists`);
        }
    }

    async destroy(key) {
        if (notes[key]) {
            delete notes[key];
        } else {
            throw new Error(`Note ${key} does not exists`);
        }
    }

    async keylist() {
        return Object.keys(notes);
    }

    async count() {
        return notes.length;
    }
}
