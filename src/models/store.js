import { useModel as useNotesModel } from "./notes-store.js";
import { onError } from "../appsupport.js";

let _store;
useNotesModel(process.env.NOTES_MODEL ? process.env.NOTES_MODEL : "memory")
    .then((store) => {
        _store = store;
    })
    .catch((error) => {
        onError({ code: "ENOTESSTORE", error });
    });

export { _store as NotesStore };
