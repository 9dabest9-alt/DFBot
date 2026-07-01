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

// Loader for simple array files (skills, advantages_starter, miscgear, rules)
function loadSimpleArray(jsonArray, category, sourceFile) {
  return jsonArray.map(entry =>
    normalizeEntry(entry, category, sourceFile)
  );
}

// Loader for enchantments.json
function loadEnchantments(json) {
  return json.enchantments.map(entry =>
    normalizeEntry(entry, "enchantment", "enchantments.json")
  );
}

// Loader for gear.json (armor + shields)
function loadGear(json) {
  const out = [];

  json.armor.forEach(entry =>
    out.push(normalizeEntry(entry, "armor", "gear.json"))
  );

  json.shield.forEach(entry =>
    out.push(normalizeEntry(entry, "shield", "gear.json"))
  );

  return out;
}

// Loader for modifiers.json (weapons, shields, armor)
function loadModifiers(json) {
  const out = [];

  json.weapons.forEach(entry =>
    out.push(normalizeEntry(entry, "modifier_weapon", "modifiers.json"))
  );

  json.shields.forEach(entry =>
    out.push(normalizeEntry(entry, "modifier_shield", "modifiers.json"))
  );

  json.armor.forEach(entry =>
    out.push(normalizeEntry(entry, "modifier_armor", "modifiers.json"))
  );

  return out;
}

// Loader for spells_master.json
function loadSpells(json) {
  return json.spells.map(entry =>
    normalizeEntry(entry, "spell", "spells_master.json")
  );
}

// Loader for weapons.json (ranged + melee)
function loadWeapons(json) {
  const out = [];

  json.weapons.forEach(entry =>
    out.push(normalizeEntry(entry, entry.category || "weapon", "weapons.json"))
  );

  return out;
}

// Loader for disadvantages_master.json
function loadDisadvantagesMaster(json) {
  return json[0].disadvantages.map(entry =>
    normalizeEntry(entry, "disadvantage", "disadvantages_master.json")
  );
}

// Loader for advantages_starter.json
function loadAdvantagesStarter(jsonArray) {
  return jsonArray.map(entry =>
    normalizeEntry(entry, "advantage", "advantages_starter.json")
  );
}

// Loader for skill_starter.json
function loadSkills(jsonArray) {
  return jsonArray.map(entry =>
    normalizeEntry(entry, "skill", "skill_starter.json")
  );
}

// Main loader: accepts an object containing all JSON files
export function loadDictionary(files) {
  const dictionary = [];

  dictionary.push(...loadEnchantments(files.enchantments));
  dictionary.push(...loadGear(files.gear));
  dictionary.push(...loadModifiers(files.modifiers));
  dictionary.push(...loadSpells(files.spells));
  dictionary.push(...loadWeapons(files.weapons));
  dictionary.push(...loadDisadvantagesMaster(files.disadvantages_master));
  dictionary.push(...loadAdvantagesStarter(files.advantages_starter));
  dictionary.push(...loadSkills(files.skill_starter));
  dictionary.push(...loadSimpleArray(files.miscgear, "equipment", "miscgear.json"));
  dictionary.push(...loadSimpleArray(files.rules_exploits, "rule", "rules_exploits.json"));

  return dictionary;
}
