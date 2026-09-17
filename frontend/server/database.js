import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";

const jsonColumns = new Set(["address", "tel", "email", "ch_hash", "request_json", "response_json", "text_layout"]);

// Preserve the API's JSON objects while SQLite stores their serialized text.
export function openDatabase(filename) {
  if (!existsSync(filename)) throw new Error(`SQLite file not found: ${filename}`);
  const connection = new DatabaseSync(filename);
  connection.exec("PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;");
  return {
    query(sql, parameters = []) {
      const statement = connection.prepare(sql);
      const values = parameters.map((value) => typeof value === "boolean" ? Number(value) : value ?? null);
      if (statement.columns().length) {
        const rows = statement.all(...values).map((row) => {
          for (const key of jsonColumns) {
            if (typeof row[key] === "string") row[key] = JSON.parse(row[key]);
          }
          return row;
        });
        return [rows];
      }
      const result = statement.run(...values);
      return [{ insertId: Number(result.lastInsertRowid), affectedRows: Number(result.changes) }];
    },
    close() { connection.close(); }
  };
}
