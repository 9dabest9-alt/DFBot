//exporter.js
// This file is responsible for exporting the data from the UI into a JSON file.
// It normalizes the data, combines notes, and ensures that all entries have a consistent structure.
//  For the purpose of rebuilding the dictionary files to all have the same structure and be more easily searchable.

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

// Normalize an entry to ensure it has all necessary fields and a consistent structure
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

// Remap notes for shield entries by adding 100 to their note numbers
// This is to avoid conflicts with armor notes, which are in the range of 0-99
// For example, if an armor note is 5, a shield note that was originally 5 will become 105
// This way, we can have both armor and shield notes in the same unified notes object without conflicts
// Just rename "shield to whatever field you want to remap, and change the +100 to whatever you want to shift by"
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

// Flatten the file structure to extract all entries, regardless of their nesting
// This is useful for files that have a complex structure with nested arrays and objects
// First step to unify file formats
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


// Recursively extract entries from the file object, regardless of their nesting
// Used to double check that we dont miss any entries in the file when we build the loader rules
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

// Combine armor and shield notes into a single unified object
// This is useful for exporting, as it allows us to have a single notes object that contains all notes, regardless of their original category
// Armor notes are kept as-is, while shield notes are shifted by +100 to avoid conflicts
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

// Export the file as a JSON file, with normalized entries and combined notes
// This function is called when the user enables the export block in runSearch() 
// and types export-<filename> in the search bar
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

// Analyze the file to collect all unique field names across all entries
// This function is called when the user enables the export block in runSearch()
// and types analyze-<filename> in the search bar
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

// Collect all unique field names from the JSON file
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
