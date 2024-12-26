import { Note, AbstractNotesStore } from './Notes.js';
import { Sequelize, Model } from 'sequelize';
import { connectDB as connectSequlz, close as closeSequlz } from './sequelize.js';
import { default as DBG } from 'debug';
const debug = DBG('notes:notes-sequelize');
const error = DBG('notes:error-sequelize');

let sequelize;

export class SQNOte extends Model {}

async function connectDB() {
    if (sequelize) return;

    sequelize = await connectSequlz();

    SQNOte.init(
        {
            notekey: {
                type: Sequelize.DataTypes.STRING,
                primaryKey: true,
                unique: true,
            },
            title: Sequelize.DataTypes.STRING,
            body: Sequelize.DataTypes.TEXT,
        },
        {
            sequelize,
            modelName: 'notes',
        }
    );
    await SQNOte.sync();
}

export default class SequelizeNotesStore extends AbstractNotesStore {
    async close() {
        closeSequlz();
        sequelize = undefined;
    }

    async update(key, title, body) {
        await connectDB();
        const note = await SQNOte.findOne({ where: { notekey: key } });

        if (!note) {
            throw new Error(`No note found for ${key}`);
        } else {
            await SQNOte.update({ title, body }, { where: { notekey: key } });
            const note = await this.read(key);
            this.emitUpdated(note);
            return note;
        }
    }

    async create(key, title, body) {
        await connectDB();
        const sqnote = await SQNOte.create({ notekey: key, title, body });

        const note = new Note(sqnote.notekey, sqnote.title, sqnote.body);
        this.emitCreated(note);
        return note;
    }

    async read(key) {
        await connectDB();
        const note = await SQNOte.findOne({ where: { notekey: key } });

        if (!note) {
            throw new Error(`No note found for ${key}`);
        } else {
            const { notekey, title, body } = note;
            return new Note(notekey, title, body);
        }
    }

    async destroy(key) {
        await connectDB();
        await SQNOte.destroy({ where: { notekey: key } });
        this.emitDestroyed(key);
    }

    async keylist() {
        await connectDB();

        const notes = await SQNOte.findAll({ attributes: ['notekey'] });
        const notekeys = notes.map((note) => note.notekey);

        return notekeys;
    }

    async count() {
        await connectDB();
        const count = await SQNOte.count();

        return count;
    }
}
