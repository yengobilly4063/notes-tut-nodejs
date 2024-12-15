import { Note, AbstractNotesStore } from "./Notes.js";
import { Level } from "level";
import { default as DBG } from "debug";

const debug = DBG("notes:notes-level");
const error = DBG("notes:error-level");

let db;

async function connectDB() {
  // If database connection already exists, just return existing instance
  if (typeof db !== "undefined" || db) return db;

  db = await new Level(process.env.LEVELDB_LOCATION || "notes.level", {
    createIfMissing: true,
    valueEncoding: "json",
  });

  return db;
}

export default class LevelNotesStore extends AbstractNotesStore {
  async close() {
    const _db = db;
    db = undefined;
    return _db ? _db.close() : undefined;
  }

  async update(key, title, body) {
    return crupdate(key, title, body);
  }

  async create(key, title, body) {
    return crupdate(key, title, body);
  }

  async read(key) {
    const db = await connectDB();
    const note = Note.fromJSON(await db.get(key));
    return note;
  }

  async destroy(key) {
    const db = await connectDB();
    await db.del(key);
  }

  async keylist() {
    const db = await connectDB();

    const keyz = await db.keys().all();

    return keyz;
  }

  async count() {
    const db = connectDB();
    var total = await db.keys().all().length;
    return total;
  }
}

async function crupdate(key, title, body) {
  const db = await connectDB();
  const note = new Note(key, title, body);
  await db.put(key, note.JSON);

  return note;
}
