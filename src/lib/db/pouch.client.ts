import PouchDB from "pouchdb-browser";
import { setDb, type HulkDatabase } from "./pouch";

export function initPouchDb(): void {
  setDb(new PouchDB("hulk") as unknown as HulkDatabase);
}
