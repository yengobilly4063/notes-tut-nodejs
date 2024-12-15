import { default as express } from "express";
import { NotesStore } from "../models/store.js";
import { generateKey } from "../utils/uuid-keygenerator.js";

const router = express.Router();

// Add Note
router.get("/add", (req, res, next) => {
  res.render("noteedit", {
    title: "Add a note",
    docreate: true,
    notekey: "",
    note: undefined,
  });
});

// Save note (update)
router.post("/save", async (req, res, next) => {
  try {
    let notekey = req.body.notekey;
    const { docreate, title, body } = req.body;

    if (docreate === "create") {
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
router.get("/view", async (req, res, next) => {
  try {
    const { key } = req.query;

    let note = await NotesStore.read(key);

    res.render("noteview", {
      title: note ? note.title : "",
      notekey: key,
      note,
    });
  } catch (err) {
    next(err);
  }
});

// Edit note (update)
router.get("/edit", async (req, res, next) => {
  try {
    const { key } = req.query;
    const note = await NotesStore.read(key);

    res.render("noteedit", {
      title: note ? `Edit ${note.title}` : "Add a Note",
      docreate: false,
      notekey: key,
      note,
    });
  } catch (error) {
    next(error);
  }
});

// Ask to Delete note (destroy)
router.get("/destroy", async (req, res, next) => {
  try {
    const { key } = req.query;
    const note = await NotesStore.read(key);

    res.render("notedestroy", {
      title: note ? `Delete ${note.title}` : "",
      notekey: key,
      note,
    });
  } catch (error) {
    next(error);
  }
});

// Really destroy note (destroy)
router.post("/destroy/confirm", async (req, res, next) => {
  try {
    const { key } = req.body;

    await NotesStore.destroy(key);
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

export default router;
