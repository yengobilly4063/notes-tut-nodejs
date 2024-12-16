import { default as DBG } from "debug";
const debug = DBG("notes:notes-store");
const error = DBG("notes:error-store");

let _NotesStore;

export async function useModel(model) {
    try {
        let NotesStoreModule = await import(`./notes-${model}.js`);
        let NotesStoreClass = NotesStoreModule.default;

        _NotesStore = new NotesStoreClass();
        return _NotesStore;
    } catch (error) {
        throw new Error(`No recognized NoteStore in ${model} because of: \n${error}`);
    }
}

export { _NotesStore as NotesStore };
