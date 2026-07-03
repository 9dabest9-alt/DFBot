// dictionaryLoader.js

// Utility: generate unique IDs
function makeId() {
  return "id_" + Math.random().toString(36).slice(2);
}

// Normalize a single entry into the unified format
function normalizeEntry(entry, category, sourceFile) {
  return {
    id: makeId(),
    category,
    name: entry.name || "",
    search_name: entry.search_name || "",
    full_text: entry.full_text || "",
    points: entry.points || null,
    attribute: entry.attribute || null,
    difficulty: entry.difficulty || null,
    defaults: entry.defaults || null,
    source_file: sourceFile,
    extra: entry
  };
}


// Loader for .json files
/* function loadFile(json) {
  const out = [];

  /* json.notes.forEach(entry =>
    out.push(normalizeEntry(entry, "notes", "gear.json"))
  ); */

 /*  json.items.forEach(entry =>
    out.push(normalizeEntry(entry, "items", "gear.json"))
  ); 

  return out;
} */

function loadFile(json) {
  const notes = json.notes || {};
  const items = json.items || [];

  return items.map(entry => {
    entry._notes = notes;   
    return entry;
  });
}




// Main loader: accepts an object containing all JSON files
export function loadDictionary(files) {
  const dictionary = [];

  dictionary.push(...loadFile(files.enchantments)); 
  dictionary.push(...loadFile(files.gear));
  dictionary.push(...loadFile(files.modifiers)); 
  dictionary.push(...loadFile(files.spells)); 
  dictionary.push(...loadFile(files.weapons));
  dictionary.push(...loadFile(files.disadvantages_master));
  dictionary.push(...loadFile(files.advantages_starter));
  dictionary.push(...loadFile(files.skill_starter)); 
  dictionary.push(...loadFile(files.miscgear, "equipment", "miscgear.json"), );
  dictionary.push(...loadFile(files.rules_exploits, "rule", "rules_exploits.json"), );

  return dictionary;
}
