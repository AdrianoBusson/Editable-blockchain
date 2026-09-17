import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { openDatabase } from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const defaultFile = path.join(rootDir, "default.list");
const PORT = Number(process.env.PORT || 3030);
const SETTINGS_ID = 1;
const DEFAULT_INTERNAL_ROUTES = ["/user/lastblockID", "/user/blockbyID", "/user/blockslimit"];
const databaseFile = path.join(__dirname, "front.sqlite");

const SEED_PROFILES = [
  {
    country: "Brazil",
    countryCode: "55",
    areas: ["11", "21", "31", "41", "61"],
    streets: ["Rua das Acacias", "Avenida Brasil", "Travessa do Sol", "Rua Sao Bento"],
    cities: ["Sao Paulo", "Rio de Janeiro", "Curitiba", "Brasilia"],
    states: ["SP", "RJ", "PR", "DF"],
    firstNames: ["Ana", "Bruno", "Camila", "Diego", "Mariana"],
    lastNames: ["Silva", "Souza", "Oliveira", "Costa", "Pereira"]
  },
  {
    country: "United States",
    countryCode: "01",
    areas: ["21", "31", "41", "51", "61"],
    streets: ["Maple Street", "Oak Avenue", "Lake View Road", "Cedar Lane"],
    cities: ["Austin", "Seattle", "Denver", "Boston"],
    states: ["TX", "WA", "CO", "MA"],
    firstNames: ["James", "Emily", "Michael", "Sarah", "Daniel"],
    lastNames: ["Johnson", "Miller", "Brown", "Taylor", "Wilson"]
  },
  {
    country: "France",
    countryCode: "33",
    areas: ["01", "02", "03", "04", "05"],
    streets: ["Rue Victor Hugo", "Avenue Jean Jaures", "Rue de la Paix", "Boulevard Voltaire"],
    cities: ["Paris", "Lyon", "Nantes", "Toulouse"],
    states: ["IDF", "ARA", "PDL", "OCC"],
    firstNames: ["Lucas", "Camille", "Hugo", "Lea", "Manon"],
    lastNames: ["Martin", "Bernard", "Dubois", "Moreau", "Laurent"]
  },
  {
    country: "Japan",
    countryCode: "81",
    areas: ["03", "06", "11", "22", "45"],
    streets: ["Sakura Dori", "Aoba Avenue", "Naka Street", "Minami Lane"],
    cities: ["Tokyo", "Osaka", "Sapporo", "Yokohama"],
    states: ["Tokyo", "Osaka", "Hokkaido", "Kanagawa"],
    firstNames: ["Haruto", "Yui", "Sota", "Mei", "Ren"],
    lastNames: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe"]
  },
  {
    country: "Germany",
    countryCode: "49",
    areas: ["30", "40", "69", "89", "22"],
    streets: ["Hauptstrasse", "Bahnhofstrasse", "Gartenweg", "Schillerstrasse"],
    cities: ["Berlin", "Hamburg", "Frankfurt", "Munich"],
    states: ["BE", "HH", "HE", "BY"],
    firstNames: ["Lukas", "Mia", "Leon", "Emma", "Felix"],
    lastNames: ["Muller", "Schmidt", "Schneider", "Fischer", "Weber"]
  }
];

let defaultsCache = null;
let pool = null;
let dbStatus = { ok: false, message: "SQLite ainda nao inicializado." };

// Reads default.list so future default changes do not require code edits.
async function readDefaults() {
  if (defaultsCache) return defaultsCache;
  const file = await fs.readFile(defaultFile, "utf8");
  defaultsCache = file
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .reduce((acc, line) => {
      const separator = line.indexOf("=");
      if (separator === -1) return acc;
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
  return defaultsCache;
}

// Keeps route comparisons stable regardless of spaces, missing slashes or query strings.
function normalizeRoute(route) {
  const cleanRoute = String(route || "").trim().split("?")[0].split("#")[0].replace(/\/+$/, "");
  if (!cleanRoute) return "";
  return cleanRoute.startsWith("/") ? cleanRoute : `/${cleanRoute}`;
}

// Converts multiline or comma-separated route text into a unique route list.
function parseInternalRoutes(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map(normalizeRoute).filter(Boolean))];
  }

  return [
    ...new Set(
      String(value || "")
        .split(/[\r\n,]+/)
        .map(normalizeRoute)
        .filter(Boolean)
    )
  ];
}

function defaultInternalRoutes(defaults) {
  const routes = parseInternalRoutes(defaults.internalRoutes);
  return routes.length ? routes : DEFAULT_INTERNAL_ROUTES;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomDigits(length) {
  let value = "";
  for (let index = 0; index < length; index += 1) {
    value += index === 0 ? String(1 + Math.floor(Math.random() * 9)) : String(Math.floor(Math.random() * 10));
  }
  return value;
}

function randomNumberBetween(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function profileForCountry(country) {
  return SEED_PROFILES.find((profile) => profile.country === country) || pickRandom(SEED_PROFILES);
}

function buildSeedUser(country) {
  const profile = country ? profileForCountry(country) : pickRandom(SEED_PROFILES);
  const cityIndex = randomNumberBetween(0, profile.cities.length - 1);
  const firstName = pickRandom(profile.firstNames);
  const lastName = pickRandom(profile.lastNames);
  const name = `${firstName} ${lastName}`;
  const emailBase = `${firstName}.${lastName}.${randomDigits(4)}`.toLowerCase();
  const areaCode = pickRandom(profile.areas);

  return {
    name,
    userId: randomDigits(randomNumberBetween(10, 14)),
    address: {
      country: profile.country,
      state: profile.states[cityIndex],
      city: profile.cities[cityIndex],
      street: pickRandom(profile.streets),
      number: randomNumberBetween(10, 9999),
      complement: `Apt ${randomNumberBetween(10, 180)}`,
      postal_code: randomDigits(8)
    },
    tel: {
      mobile: {
        country_code: profile.countryCode,
        area_code: areaCode,
        number: randomDigits(8)
      },
      work: {
        country_code: profile.countryCode,
        area_code: areaCode,
        number: randomDigits(8)
      }
    },
    email: {
      work: `${emailBase}@example-work.test`,
      personal: `${emailBase}@example-mail.test`
    }
  };
}

function parseJsonObject(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function generateUserField(field, currentUser = {}) {
  const address = parseJsonObject(currentUser.address);
  const seed = buildSeedUser(address.country);
  if (field === "name") return seed.name;
  if (field === "user_id") return seed.userId;
  if (field === "address") return seed.address;
  if (field === "tel") return seed.tel;
  if (field === "email") {
    const sourceName = String(currentUser.name || seed.name).trim().replace(/\s+/g, ".").toLowerCase();
    const suffix = randomDigits(4);
    return {
      work: `${sourceName}.${suffix}@example-work.test`,
      personal: `${sourceName}.${suffix}@example-mail.test`
    };
  }
  return "";
}

// Open the migrated database without seeding or replacing existing records.
async function ensureDatabase() {
  const database = openDatabase(databaseFile);
  try {
    for (const table of ["app_settings", "api_logs", "internal_routes", "blockchain_users", "certificate_settings"]) {
      database.query('SELECT * FROM "' + table + '" LIMIT 0');
    }
    const [settings] = database.query("SELECT id FROM app_settings WHERE id = ?", [SETTINGS_ID]);
    if (!settings.length) throw new Error("Migrated app_settings record is missing.");
    pool = database;
    dbStatus = { ok: true, message: "SQLite conectado.", file: databaseFile };
  } catch (error) {
    database.close();
    throw error;
  }
}

// Converts database column names to frontend-friendly camelCase settings.
function normalizeSettings(row, defaults) {
  const internalRoutes = defaultInternalRoutes(defaults);
  if (!row) {
    return {
      sqliteFile: databaseFile,
      apiHost: defaults.apiHost,
      apiPort: Number(defaults.apiPort || 3000),
      blocksRoute: defaults.blocksRoute,
      blocksLimit: Number(defaults.blocksLimit || 100),
      chBits: Number(defaults.chBits || 128),
      lastBlockRoute: defaults.lastBlockRoute,
      blockByIdRoute: defaults.blockByIdRoute,
      theme: defaults.theme === "light" ? "light" : "dark",
      language: defaults.language === "pt-BR" ? "pt-BR" : "en",
      presentationHtmlEn: defaults.presentationHtmlEn || defaults.presentationHtml,
      presentationHtmlPt: defaults.presentationHtmlPt || defaults.presentationHtml,
      presentationHtml: defaults.language === "pt-BR"
        ? defaults.presentationHtmlPt || defaults.presentationHtml
        : defaults.presentationHtmlEn || defaults.presentationHtml,
      internalRoutes
    };
  }

  const language = row.language === "pt-BR" ? "pt-BR" : "en";
  const presentationHtmlEn = row.presentation_html_en || defaults.presentationHtmlEn || defaults.presentationHtml;
  const presentationHtmlPt = row.presentation_html_pt || row.presentation_html || defaults.presentationHtmlPt || defaults.presentationHtml;

  return {
    sqliteFile: databaseFile,
    apiHost: row.api_host,
    apiPort: Number(row.api_port),
    blocksRoute: row.blocks_route,
    blocksLimit: Number(row.blocks_limit),
    chBits: Number(row.ch_bits || defaults.chBits || 128),
    lastBlockRoute: row.last_block_route,
    blockByIdRoute: row.block_by_id_route,
    theme: row.theme,
    language,
    presentationHtmlEn,
    presentationHtmlPt,
    presentationHtml: language === "pt-BR" ? presentationHtmlPt : presentationHtmlEn,
    internalRoutes
  };
}

// Returns persisted settings when SQLite is online, otherwise falls back to default.list.
async function getSettings() {
  const defaults = await readDefaults();
  if (!pool) return normalizeSettings(null, defaults);
  const [rows] = await pool.query("SELECT * FROM app_settings WHERE id = ?", [SETTINGS_ID]);
  const settings = normalizeSettings(rows[0], defaults);
  const [internalRows] = await pool.query("SELECT route FROM internal_routes ORDER BY route ASC");
  settings.internalRoutes = internalRows.map((row) => row.route);
  return settings;
}

// Builds the configured blockchain API URL from host, port and route.
function buildBlockchainUrl(settings, route) {
  const host = String(settings.apiHost || "localhost").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const cleanRoute = route.startsWith("/") ? route : `/${route}`;
  return `http://${host}:${settings.apiPort}${cleanRoute}`;
}

function shouldLogApiAccess(settings, route) {
  const currentRoute = normalizeRoute(route);
  const internalRoutes = parseInternalRoutes(settings.internalRoutes);
  return !internalRoutes.includes(currentRoute);
}

// Persists one request/response pair for later inspection in Transacoes.
async function logApiAccess(entry) {
  if (!pool) return;
  await pool.query(
    `INSERT INTO api_logs (method, route, request_json, response_json, status_code, success, error_message)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.method,
      entry.route,
      JSON.stringify(entry.requestJson ?? null),
      JSON.stringify(entry.responseJson ?? null),
      entry.statusCode ?? null,
      Boolean(entry.success),
      entry.errorMessage ?? null
    ]
  );
}

// Calls a blockchain route and records both the outgoing body and received response.
async function callBlockchain({ method, route, body }) {
  const settings = await getSettings();
  const url = buildBlockchainUrl(settings, route);
  const shouldLog = shouldLogApiAccess(settings, route);
  const options = {
    method,
    headers: { "Content-Type": "application/json" }
  };

  if (method !== "GET") {
    options.body = JSON.stringify(body ?? {});
  }

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let responseJson = text;
    try {
      responseJson = text ? JSON.parse(text) : null;
    } catch {
      responseJson = { raw: text };
    }

    if (shouldLog) {
      await logApiAccess({
        method,
        route,
        requestJson: body ?? null,
        responseJson,
        statusCode: response.status,
        success: response.ok
      });
    }

    return { ok: response.ok, status: response.status, data: responseJson, route };
  } catch (error) {
    const responseJson = { error: error.message };
    if (shouldLog) {
      await logApiAccess({
        method,
        route,
        requestJson: body ?? null,
        responseJson,
        statusCode: null,
        success: false,
        errorMessage: error.message
      });
    }
    return { ok: false, status: 502, data: responseJson, route };
  }
}

// Keeps numeric form fields safe before saving settings.
function sanitizeSettings(payload, current) {
  return {
    sqliteFile: databaseFile,
    apiHost: String(payload.apiHost || current.apiHost || "localhost").trim(),
    apiPort: Number(payload.apiPort || current.apiPort || 3000),
    blocksRoute: String(payload.blocksRoute || current.blocksRoute || "/user/blockslimit").trim(),
    blocksLimit: Number(payload.blocksLimit || current.blocksLimit || 100),
    chBits: Number(payload.chBits || current.chBits || 128),
    lastBlockRoute: String(payload.lastBlockRoute || current.lastBlockRoute || "/user/lastblockID").trim(),
    blockByIdRoute: String(payload.blockByIdRoute || current.blockByIdRoute || "/user/blockbyID").trim(),
    theme: payload.theme === "light" ? "light" : "dark",
    language: payload.language === "pt-BR" ? "pt-BR" : "en",
    presentationHtmlEn: String(payload.presentationHtmlEn ?? current.presentationHtmlEn ?? current.presentationHtml ?? ""),
    presentationHtmlPt: String(payload.presentationHtmlPt ?? current.presentationHtmlPt ?? current.presentationHtml ?? ""),
    internalRoutes: parseInternalRoutes(payload.internalRoutes ?? current.internalRoutes)
  };
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: "20mb" }));

  const defaults = await readDefaults();
  try {
    await ensureDatabase(defaults);
  } catch (error) {
    dbStatus = { ok: false, message: `Nao foi possivel conectar ao SQLite: ${error.message}` };
  }

  app.get("/api/health", async (_req, res) => {
    res.json({ ok: true, database: dbStatus });
  });

  app.get("/api/settings", async (_req, res) => {
    const settings = await getSettings();
    res.json({ settings, database: dbStatus });
  });

  app.put("/api/settings", async (req, res) => {
    if (!pool) {
      res.status(503).json({ ok: false, message: dbStatus.message });
      return;
    }

    const current = await getSettings();
    const next = sanitizeSettings(req.body, current);
    await pool.query(
      `UPDATE app_settings SET
        api_host = ?, api_port = ?,
        blocks_route = ?, blocks_limit = ?, ch_bits = ?, last_block_route = ?, block_by_id_route = ?,
        theme = ?, language = ?, presentation_html_en = ?, presentation_html_pt = ?, presentation_html = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        next.apiHost,
        next.apiPort,
        next.blocksRoute,
        next.blocksLimit,
        next.chBits,
        next.lastBlockRoute,
        next.blockByIdRoute,
        next.theme,
        next.language,
        next.presentationHtmlEn,
        next.presentationHtmlPt,
        next.language === "pt-BR" ? next.presentationHtmlPt : next.presentationHtmlEn,
        SETTINGS_ID
      ]
    );
    await pool.query("DELETE FROM internal_routes");
    for (const route of next.internalRoutes) {
      await pool.query("INSERT INTO internal_routes (route) VALUES (?)", [route]);
    }
    res.json({ ok: true, settings: next });
  });

  app.get("/api/certificate-settings", async (_req, res) => {
    if (!pool) {
      res.status(503).json({ ok: false, message: dbStatus.message });
      return;
    }

    const [rows] = await pool.query("SELECT background_data, background_mime, text_layout FROM certificate_settings WHERE id = ?", [SETTINGS_ID]);
    const certificate = rows[0] || {};
    const backgroundDataUrl = certificate.background_data
      ? `data:${certificate.background_mime || "image/jpeg"};base64,${Buffer.from(certificate.background_data).toString("base64")}`
      : "";
    res.json({
      ok: true,
      certificate: {
        backgroundDataUrl,
        layout: parseJsonObject(certificate.text_layout)
      }
    });
  });

  app.put("/api/certificate-settings", async (req, res) => {
    if (!pool) {
      res.status(503).json({ ok: false, message: dbStatus.message });
      return;
    }

    const [rows] = await pool.query("SELECT background_data, background_mime FROM certificate_settings WHERE id = ?", [SETTINGS_ID]);
    const current = rows[0] || {};
    let backgroundData = current.background_data || null;
    let backgroundMime = current.background_mime || null;

    if (Object.hasOwn(req.body || {}, "backgroundDataUrl")) {
      const backgroundDataUrl = String(req.body.backgroundDataUrl || "");
      if (!backgroundDataUrl) {
        backgroundData = null;
        backgroundMime = null;
      } else {
        const match = backgroundDataUrl.match(/^data:(image\/jpeg);base64,([a-z0-9+/=]+)$/i);
        if (!match) {
          res.status(400).json({ ok: false, message: "The certificate background must be a valid JPG image." });
          return;
        }
        backgroundData = Buffer.from(match[2], "base64");
        if (backgroundData.length > 15 * 1024 * 1024) {
          res.status(413).json({ ok: false, message: "The certificate background exceeds the 15 MB limit." });
          return;
        }
        backgroundMime = match[1].toLowerCase();
      }
    }

    const layout = req.body?.layout && typeof req.body.layout === "object" ? req.body.layout : {};
    await pool.query(
      `INSERT INTO certificate_settings (id, background_data, background_mime, text_layout)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         background_data = excluded.background_data,
         background_mime = excluded.background_mime,
         text_layout = excluded.text_layout, updated_at = CURRENT_TIMESTAMP`,
      [SETTINGS_ID, backgroundData, backgroundMime, JSON.stringify(layout)]
    );
    res.json({ ok: true });
  });

  app.get("/api/users", async (_req, res) => {
    if (!pool) {
      res.status(503).json({ users: [], database: dbStatus });
      return;
    }
    const [rows] = await pool.query(
      "SELECT `index`, name, user_id, address, tel, email, ch_hash, sent, created_at FROM blockchain_users ORDER BY `index` ASC LIMIT 300"
    );
    res.json({ users: rows, database: dbStatus });
  });

  app.post("/api/users", async (req, res) => {
    if (!pool) {
      res.status(503).json({ ok: false, message: dbStatus.message });
      return;
    }

    const payload = req.body || {};
    const [result] = await pool.query(
      `INSERT INTO blockchain_users (name, user_id, address, tel, email, ch_hash, sent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        String(payload.name || "").trim(),
        Number(payload.user_id || payload.userId || 0),
        JSON.stringify(parseJsonObject(payload.address)),
        JSON.stringify(parseJsonObject(payload.tel)),
        JSON.stringify(parseJsonObject(payload.email)),
        JSON.stringify(parseJsonObject(payload.ch_hash || payload.chHash)),
        Boolean(payload.sent)
      ]
    );

    const [rows] = await pool.query(
      "SELECT `index`, name, user_id, address, tel, email, ch_hash, sent, created_at FROM blockchain_users WHERE `index` = ?",
      [result.insertId]
    );
    res.status(201).json({ ok: true, user: rows[0] || null });
  });

  app.put("/api/users/:index", async (req, res) => {
    if (!pool) {
      res.status(503).json({ ok: false, message: dbStatus.message });
      return;
    }

    const userIndex = Number(req.params.index);
    const payload = req.body || {};
    await pool.query(
      `UPDATE blockchain_users
       SET name = ?, user_id = ?, address = ?, tel = ?,
           email = ?, ch_hash = ?, sent = ?
       WHERE \`index\` = ?`,
      [
        String(payload.name || "").trim(),
        Number(payload.user_id || payload.userId || 0),
        JSON.stringify(parseJsonObject(payload.address)),
        JSON.stringify(parseJsonObject(payload.tel)),
        JSON.stringify(parseJsonObject(payload.email)),
        JSON.stringify(parseJsonObject(payload.ch_hash || payload.chHash)),
        Boolean(payload.sent),
        userIndex
      ]
    );

    const [rows] = await pool.query(
      "SELECT `index`, name, user_id, address, tel, email, ch_hash, sent, created_at FROM blockchain_users WHERE `index` = ?",
      [userIndex]
    );
    res.json({ ok: true, user: rows[0] || null });
  });

  app.patch("/api/users/:index/sent", async (req, res) => {
    if (!pool) {
      res.status(503).json({ ok: false, message: dbStatus.message });
      return;
    }

    const userIndex = Number(req.params.index);
    await pool.query("UPDATE blockchain_users SET sent = TRUE WHERE `index` = ?", [userIndex]);
    const [rows] = await pool.query(
      "SELECT `index`, name, user_id, address, tel, email, ch_hash, sent, created_at FROM blockchain_users WHERE `index` = ?",
      [userIndex]
    );
    res.json({ ok: true, user: rows[0] || null });
  });

  app.delete("/api/users/:index", async (req, res) => {
    if (!pool) {
      res.status(503).json({ ok: false, message: dbStatus.message });
      return;
    }

    const userIndex = Number(req.params.index);
    const [result] = await pool.query("DELETE FROM blockchain_users WHERE `index` = ?", [userIndex]);
    res.json({ ok: true, deleted: result.affectedRows > 0, index: userIndex });
  });

  app.post("/api/users/generate-field", async (req, res) => {
    const field = String(req.body?.field || "").trim();
    const value = generateUserField(field, req.body?.user || {});
    res.json({ ok: true, field, value });
  });

  app.post("/api/blockchain/blockslimit", async (req, res) => {
    const settings = await getSettings();
    const limit = Number(req.body?.blocks || settings.blocksLimit || 100);
    const result = await callBlockchain({ method: "POST", route: settings.blocksRoute, body: { blocks: limit } });
    res.status(result.ok ? 200 : result.status).json(result);
  });

  app.get("/api/blockchain/lastblock", async (_req, res) => {
    const settings = await getSettings();
    const result = await callBlockchain({ method: "GET", route: settings.lastBlockRoute, body: null });
    res.status(result.ok ? 200 : result.status).json(result);
  });

  app.post("/api/blockchain/blockbyid", async (req, res) => {
    const settings = await getSettings();
    const blockNumber = Number(req.body?.block_number);
    const result = await callBlockchain({
      method: "POST",
      route: settings.blockByIdRoute,
      body: { block_number: blockNumber }
    });
    res.status(result.ok ? 200 : result.status).json(result);
  });

  app.post("/api/blockchain/fullblockbyid", async (req, res) => {
    const blockNumber = Number(req.body?.block_number);
    const result = await callBlockchain({
      method: "POST",
      route: "/user/fullblockbyID",
      body: { block_number: blockNumber }
    });
    res.status(result.ok ? 200 : result.status).json(result);
  });

  app.post("/api/blockchain/verifyblockbyid", async (req, res) => {
    const blockNumber = Number(req.body?.block_number);
    if (!Number.isInteger(blockNumber) || blockNumber < 0) {
      res.status(400).json({ ok: false, message: "block_number must be a non-negative integer." });
      return;
    }

    const result = await callBlockchain({
      method: "POST",
      route: "/user/verifyBlockbyID",
      body: { block_number: blockNumber }
    });
    res.status(result.ok ? 200 : result.status).json(result);
  });

  app.post("/api/blockchain/chcollision", async (req, res) => {
    const result = await callBlockchain({
      method: "POST",
      route: "/user/chamchcollision",
      body: req.body
    });
    res.status(result.ok ? 200 : result.status).json(result);
  });

  app.post("/api/blockchain/chamkeygen", async (req, res) => {
    const settings = await getSettings();
    const bits = Number(req.body?.bits || settings.chBits || 128);
    const result = await callBlockchain({
      method: "POST",
      route: "/user/chamkeygen",
      body: { bits }
    });
    res.status(result.ok ? 200 : result.status).json(result);
  });

  app.post("/api/blockchain/chamhash", async (req, res) => {
    const result = await callBlockchain({
      method: "POST",
      route: "/user/chamhash",
      body: req.body
    });
    res.status(result.ok ? 200 : result.status).json(result);
  });

  app.post("/api/blockchain/sign-transaction", async (req, res) => {
    const result = await callBlockchain({
      method: "POST",
      route: "/user/sign-transaction",
      body: req.body
    });
    res.status(result.ok ? 200 : result.status).json(result);
  });

  app.post("/api/blockchain/updateuserdata", async (req, res) => {
    const result = await callBlockchain({
      method: "POST",
      route: "/updateuserdata",
      body: req.body
    });
    res.status(result.status).json(result);
  });

  app.post("/api/blockchain/addnewdatauser", async (req, res) => {
    const result = await callBlockchain({
      method: "POST",
      route: "/addNewDataUser",
      body: req.body
    });
    res.status(result.status).json(result);
  });

  app.post("/api/blockchain/cuckoo-contains", async (req, res) => {
    const result = await callBlockchain({
      method: "POST",
      route: "/cuckoo/contains",
      body: req.body
    });
    res.status(result.ok ? 200 : result.status).json(result);
  });

  app.post("/api/blockchain/checkrighttobeforgoten", async (req, res) => {
    const result = await callBlockchain({
      method: "POST",
      route: "/cuckoo/checkrighttobeforgoten",
      body: req.body
    });
    res.status(result.ok ? 200 : result.status).json(result);
  });

  app.get("/api/logs", async (req, res) => {
    if (!pool) {
      res.json({ logs: [], database: dbStatus });
      return;
    }

    const filters = [];
    const params = [];
    if (req.query.route) {
      filters.push("route LIKE ?");
      params.push(`%${req.query.route}%`);
    }
    if (req.query.from) {
      filters.push("datetime(created_at) >= datetime(?)");
      params.push(req.query.from);
    }
    if (req.query.to) {
      filters.push("datetime(created_at) <= datetime(?)");
      params.push(req.query.to);
    }

    const direction = String(req.query.order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `SELECT id, method, route, request_json, response_json, status_code, success, error_message, created_at
       FROM api_logs ${where} ORDER BY created_at ${direction} LIMIT 300`,
      params
    );
    res.json({ logs: rows, database: dbStatus });
  });

  if (process.argv.includes("--production")) {
    app.use(express.static(path.join(rootDir, "dist")));
    app.get(/.*/, (_req, res) => res.sendFile(path.join(rootDir, "dist", "index.html")));
  } else {
    const { createServer } = await import("vite");
    const vite = await createServer({
      root: rootDir,
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }

  return app;
}

createApp().then((app) => {
  app.listen(PORT, () => {
    console.log(`Frontend blockchain rodando em http://localhost:${PORT}`);
    console.log(dbStatus.message);
  });
});
