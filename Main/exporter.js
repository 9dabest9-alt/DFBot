//exporter.js

//NOTE:  This exporter is not perfect, use with caution, have a backup file.

import { files } from "./ui.js";

function makeSearchName(entry) {
  const fields = [
    entry.name,
    entry.spell,
    entry.prefix,
    entry.suffix,
    entry.base_item,
    entry.effects,
    entry.section,
    ...(entry.tags || []),
    entry.category,
  ];

  return fields
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


function normalizeEntry(entry, category) {
  // Clone original entry so we keep ALL properties
  const normalized = { ...entry };

  // Only fill category if missing
  if (!normalized.category) {
    normalized.category = "";
  }

  //remap notes
  remapNotes(normalized);

  // Ensure notes is always an array
  if (!normalized.notes) normalized.notes = [];
  if (!Array.isArray(normalized.notes)) normalized.notes = [normalized.notes];

  // Ensure full_text exists
  normalized.full_text =
    normalized.full_text || normalized.text || normalized.description || "";

  // Generate search_name from ALL meaningful fields
  normalized.search_name = makeSearchName(normalized);

  return normalized;
}

function remapNotes(entry) {
  if (!entry.notes) return entry;

  entry.notes = entry.notes.map((n) => {
    const num = Number(n);
    if (entry.category.includes("shield")) {
      return String(num + 100);
    }
    return String(num);
  });

  return entry;
}

function flattenFileStructure(fileObj) {
  const entries = [];

  function walk(node) {
    if (Array.isArray(node)) {
      node.forEach(walk);
    } else if (typeof node === "object" && node !== null) {
      // If object contains arrays, walk them
      Object.values(node).forEach((val) => {
        if (Array.isArray(val) || typeof val === "object") walk(val);
      });
    }
  }

  walk(fileObj);
  return entries;
}

function extractEntries(node, out) {
  if (Array.isArray(node)) {
    node.forEach((n) => extractEntries(n, out));
  } else if (typeof node === "object" && node !== null) {
    // If object looks like an entry, keep it
    if (
      "name" in node ||
      "spell" in node ||
      "prefix" in node ||
      "suffix" in node ||
      "text" in node ||
      "description" in node ||
      "section" in node ||
      "cost" in node ||
      "weight" in node
    ) {
      out.push(node);
    }

    // Walk deeper
    Object.values(node).forEach((val) => {
      if (Array.isArray(val) || typeof val === "object") {
        extractEntries(val, out);
      }
    });
  }
}

//NOTE -- edit entries for files with notes
function combineNotes(fileObj) {
  const unified = {};

  // Armor notes
  if (fileObj.armor_notes) {
    for (const [id, text] of Object.entries(fileObj.armor_notes)) {
      unified[id] = text;
    }
  }

  // Shield notes (shift by +100)
  if (fileObj.shield_notes) {
    for (const [id, text] of Object.entries(fileObj.shield_notes)) {
      unified[String(Number(id) + 100)] = text;
    }
  }

  unified._comment = "No Notes";

  return unified;
}


export async function exportFile(fileName) {
  const fileObj = files[fileName];
  if (!fileObj) {
    console.error("File not loaded:", fileName);
    return;
  }

  // STEP 1: Combine notes (your idea)
  const unifiedNotes = combineNotes(fileObj);

  // STEP 2: Extract entries from ANY shape
  const rawEntries = [];
  extractEntries(fileObj, rawEntries);

  // STEP 3: Normalize entries (preserve all fields)
  const normalized = rawEntries.map((entry) => normalizeEntry(entry, fileName));

  // ⭐ STEP 4: Export wrapper object (fix)
  const output = JSON.stringify(
    {
      notes: unifiedNotes,
      items: normalized,
    },
    null,
    2,
  );

  // STEP 5: Download
  //const output = JSON.stringify(normalized, null, 2);

  const blob = new Blob([output], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

export function analyzeFile(json, sourceFile) {
 
  
  const fieldList = collectFieldsFromFile(json);

  const output = JSON.stringify(fieldList, null, 2);

  const blob = new Blob([output], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${sourceFile}_fields.json`;
  a.click();

  URL.revokeObjectURL(url);
} 


function collectFieldsFromFile(json) {
  const items = json.items || [];
  const fields = new Set();

  function walk(obj) {
    if (Array.isArray(obj)) {
      obj.forEach(walk);
      return;
    }

    if (obj && typeof obj === "object") {
      Object.keys(obj).forEach((key) => {
        fields.add(key);
        walk(obj[key]);
      });
    }
  }

  items.forEach(walk);

  return Array.from(fields).sort();
}
