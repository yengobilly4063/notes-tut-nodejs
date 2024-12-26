import { Note, AbstractNotesStore } from './Notes.js';
import { MongoClient } from 'mongodb';
import DBG from 'debug';
const debug = DBG('notes:notes-mongodb');
const error = DBG('notes:error-mongodb');
import util from 'util';

let client = new MongoClient(process.env.MONGO_URL);
let database = client.db(process.env.MONGO_DBNAME);

const connectDB = async () => {
    if (!client) {
        await client.connect();
        console.log('Connected successfully to server');
    }
};

export default class MongoDBNotesStore extends AbstractNotesStore {
    async close() {
        if (client) client.close();
        client = undefined;
    }

    async update(key, title, body) {
        await connectDB();
        const note = new Note(key, title, body);
        const collection = database.collection('notes');
        await collection.updateOne({ notekey: key }, { $set: { title: title, body: body } });
        return note;
    }

    async create(key, title, body) {
        await connectDB();
        const note = new Note(key, title, body);
        const collection = database.collection('notes');
        await collection.insertOne({ notekey: key, title, body });
        return note;
    }

    async read(key) {
        await connectDB();
        const collection = database.collection('notes');
        const doc = await collection.findOne({ notekey: key });
        const note = new Note(doc.notekey, doc.title, doc.body);
        return note;
    }

    async destroy(key) {
        await connectDB();
        const collection = database.collection('notes');
        const doc = await collection.findOne({ notekey: key });
        if (!doc) {
            throw new Error(`No note found for ${key}`);
        } else {
            await collection.findOneAndDelete({ notekey: key });
        }
    }

    async keylist() {
        await connectDB();
        const collection = database.collection('notes');

        const keyz = (await collection.find({}).toArray()).map((note) => note.notekey);

        return keyz;
    }

    async count() {
        await connectDB();
        const collection = database.collection('notes');
        const count = await collection.countDocuments({});
        return count;
    }
}
