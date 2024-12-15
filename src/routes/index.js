import * as express from "express";
import { NotesStore } from "../models/store.js";

const router = express.Router();

/* GET home page. */
router.get("/", async (req, res, next) => {
  try {
    const keylist = await NotesStore.keylist();

    const notePromises = keylist.map((key) => {
      return NotesStore.read(key);
    });
    const notelist = await Promise.all(notePromises);

    res.render("index", { title: "Notes", notelist });
  } catch (err) {
    next(err);
  }
});

export default router;
