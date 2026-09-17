import { test } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { openDatabase } from "./database.js";

test("migrated SQLite supports persisted JSON, BLOBs and user lifecycle", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "front-sqlite-test-"));
  const filename = path.join(directory, "test.sqlite");
  copyFileSync(new URL("./front.sqlite", import.meta.url), filename);
  const db = openDatabase(filename);
  try {
    assert.equal(db.query("PRAGMA integrity_check")[0][0].integrity_check, "ok");
    assert.equal(db.query("SELECT id FROM app_settings WHERE id = 1")[0].length, 1);
    const [insert] = db.query('INSERT INTO blockchain_users (name,user_id,address,tel,email,ch_hash,sent) VALUES (?,?,?,?,?,?,?)', ['Test', 99999999999999, '{"country":"Brazil"}', '{}', '{}', '{"publicKey":{}}', false]);
    const user = db.query('SELECT * FROM blockchain_users WHERE "index" = ?', [insert.insertId])[0][0];
    assert.deepEqual(user.address, { country: 'Brazil' });
    assert.equal(user.sent, 0);
    db.query('UPDATE blockchain_users SET sent = ? WHERE "index" = ?', [true, insert.insertId]);
    assert.equal(db.query('SELECT sent FROM blockchain_users WHERE "index" = ?', [insert.insertId])[0][0].sent, 1);
    assert.equal(db.query('DELETE FROM blockchain_users WHERE "index" = ?', [insert.insertId])[0].affectedRows, 1);
    db.query('INSERT INTO api_logs (method,route,request_json,response_json,success) VALUES (?,?,?,?,?)', ['POST', '/test', '{"a":1}', '{"ok":true}', true]);
    assert.deepEqual(db.query("SELECT response_json FROM api_logs WHERE route = '/test' ORDER BY id DESC LIMIT 1")[0][0].response_json, { ok: true });
    // Exercise the exact certificate upsert used by the HTTP endpoint.
    const source = readFileSync(new URL('./index.js', import.meta.url), 'utf8');
    const sql = source.match(/`(INSERT INTO certificate_settings[\s\S]*?)`/)[1];
    const blob = Buffer.from([255, 216, 255, 217]);
    db.query(sql, [1, blob, 'image/jpeg', '{"test":1}']);
    db.query(sql, [1, blob, 'image/jpeg', '{"test":2}']);
    const certificate = db.query('SELECT * FROM certificate_settings WHERE id = 1')[0][0];
    assert.deepEqual(Buffer.from(certificate.background_data), blob);
    assert.deepEqual(certificate.text_layout, { test: 2 });
  } finally {
    db.close();
    rmSync(directory, { recursive: true });
  }
});
