const __note_key = Symbol("key");
const __note_title = Symbol("title");
const __note_body = Symbol("body");

export class Note {
  constructor(key, title, body) {
    this[__note_key] = key;
    this[__note_title] = title;
    this[__note_body] = body;
  }

  get key() {
    return this[__note_key];
  }

  get title() {
    return this[__note_title];
  }

  set title(newTitle) {
    this[__note_title] = newTitle;
  }

  get body() {
    return this[__note_body];
  }

  set body(newBody) {
    this[__note_body] = newBody;
  }

  get JSON() {
    return JSON.stringify({
      key: this.key,
      title: this.title,
      body: this.body,
    });
  }

  static fromJSON(json) {
    const data = JSON.parse(json);
    if (
      typeof data !== "object" ||
      !data.hasOwnProperty("key") ||
      typeof data.key !== "string" ||
      !data.hasOwnProperty("title") ||
      typeof data.title !== "string" ||
      !data.hasOwnProperty("body") ||
      typeof data.body !== "string"
    ) {
      throw new Error(`Not a Note: ${json}`);
    }

    const note = new Note(data.key, data.title, data.body);
    return note;
  }
}

export class AbstractNotesStore {
  async close() {}
  async update(key, title, body) {}
  async create(key, title, body) {}
  async read(key) {}
  async destroy(key) {}
  async keylist() {}
  async count() {}
}
