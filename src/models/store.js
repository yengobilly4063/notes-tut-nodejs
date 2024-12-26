import { useModel as useNotesModel } from './notes-store.js';
import { onError } from '../appsupport.js';
import { init as homeInit } from '../routes/index.js';
import { init as notesInit } from '../routes/notes.js';

let _store;
useNotesModel(process.env.NOTES_MODEL ? process.env.NOTES_MODEL : 'sequelize')
    .then((store) => {
        _store = store;
        homeInit();
        notesInit();
    })
    .catch((error) => {
        onError({ code: 'ENOTESSTORE', error });
    });

export { _store as NotesStore };
