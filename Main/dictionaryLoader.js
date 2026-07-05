// dictionaryLoader.js


//Load each file
function loadFile(json, sourceFile) {
  const notes = json.notes || {};
  const items = json.items || [];

  return items.map((entry) => normalizeEntry(entry, sourceFile, notes));
}

// Utility: generate unique IDs
function makeId() {
  return "id_" + Math.random().toString(36).slice(2);
}

// Normalize a single entry into the unified format
function normalizeEntry(entry, sourceFile, unifiedNotes) {
  // 1. Preserve ALL fields exactly as they are
  const normalized = { ...entry };

  // 2. Attach unified notes table
  normalized._notes = unifiedNotes;

  // 3. Build full_text based on the file the entry came from
  normalized.full_text = buildFullTextFromFile(normalized, sourceFile);

  // 4. Append notes if present
  if (normalized.notes && normalized.notes.length > 0) {
    const lines = normalized.notes
      .map((id) => {
        const text = unifiedNotes[id];
        return text ? `[${id}] ${text}` : null;
      })
      .filter(Boolean);

    if (lines.length > 0) {
      normalized.full_text += `\n\nNotes:\n${lines.join("\n")}`;
    }
  }

  // 6. Generate stable ID if missing
  normalized.id = normalized.id || makeId();

  return normalized;
}

//Normalize Rules Handler for each file
function buildFullTextFromFile(entry, sourceFile) {
  switch (sourceFile) {
    case "weapons":
      return buildWeaponText(entry);
    case "rulesExploits":
      return buildRulesExploits(entry);
    case "skill":
      return buildSkillText(entry);
    case "gear":
      return buildGearText(entry);
    case "spells":
      return buildSpellText(entry);
    case "modifiers":
      return buildModifierText(entry);
    case "enchantments":
      return buildEnchantmentsText(entry);
    case "miscgear":
      return buildMiscGearText(entry);
    case "advantages":
      return buildAdvantageText(entry);
    case "disadvantages":
      return buildDisadvantageText(entry);
    default:
      return buildGenericText(entry);
  }
}





//Build the text to be displayed for each dictionary file.

function buildSkillText(e){
  const parts = [];

  //if (e.name) parts.push(`Name: ${e.name}`); //Done in displayResults()
  //if (e.category) parts.push(`Category: ${e.category}`); //Done in displayResults()

  if (e.attribute) parts.push(`attribute: ${e.attribute}`);
  if (e.defaults) parts.push(`Defaults: ${e.defaults}`);
  if (e.difficulty) parts.push(`Difficulty: ${e.difficulty}`);

  parts.push(""); // blank line for astetics
  if (e.full_text) parts.push(`${e.full_text}`);
  //if (e.notes)....dealt with in normalize function
  //"search_name": not to be displayed

  return parts.join("\n");
}
function buildRulesExploits(e) {
  const parts = [];

  //if (e.name) parts.push(`Name: ${e.name}`); //Done in displayResults()
  //if (e.category) parts.push(`Category: ${e.category}`); //Done in displayResults()

  if (e.section) parts.push(`Section: ${e.section}`);
  //if (e.tags) parts.push(`Tags: ${e.tags}`);//Expect you want to comment outh this line
  
  parts.push(""); // blank line for astetics
  if (e.full_text) parts.push(`${e.full_text}`);
  //if (e.notes)....dealt with in normalize function
  //"search_name": not to be displayed

  return parts.join("\n");
}
function buildModifierText(e){
  const parts = [];

  //if (e.name) parts.push(`Name: ${e.name}`); //Done in displayResults()
  //if (e.category) parts.push(`Category: ${e.category}`); //Done in displayResults()

  if (e.allowed_on) parts.push(`Allowed On: ${e.allowed_on}`);
  parts.push(""); // blank line for astetics
  if (e.effects) parts.push(`Effects: ${e.effects}`);
  parts.push(""); // blank line for astetics
  if (e.cost_factor) parts.push(`Cost Factor: ${e.cost_factor}`);

  //parts.push(""); // blank line for astetics
  //if (e.full_text) parts.push(`${e.full_text}`);
  //if (e.notes)....dealt with in normalize function
  //"search_name": not to be displayed

  return parts.join("\n");
}
function buildMiscGearText(e) {
  const parts = [];

  //if (e.name) parts.push(`Name: ${e.name}`); //Done in displayResults()
  //if (e.category) parts.push(`Category: ${e.category}`); //Done in displayResults()

  if (e.section) parts.push(`Section: ${e.section}`);
  //if (e.tags) parts.push(`Tags: ${e.tags}`); //Probably want to comment this line out
  parts.push(""); // blank line for astetics
  if (e.full_text) parts.push(`${e.full_text}`);
  //if (e.notes)....dealt with in normalize function
  //"search_name": not to be displayed

  return parts.join("\n");
}
function buildGearText(e){
  const parts = [];

  //if (e.name) parts.push(`Name: ${e.name}`); //Done in displayResults()
  //if (e.category) parts.push(`Category: ${e.category}`); //Done in displayResults()
  if(e.category === "armor")  {
    if (e.damage_resistance) parts.push(`   Damage Resistance: ${e.damage_resistance}`);
    parts.push(""); // blank line for astetics

    parts.push("Weight:");
    if (e.arms_weight) parts.push(`   Arms: ${e.arms_weight}`);
    if (e.body_weight) parts.push(`   Body: ${e.body_weight}`);
    if (e.legs_weight) parts.push(`   Legs: ${e.legs_weight}`);
    if (e.feet_weight) parts.push(`   Feet: ${e.feet_weight}`);
    if (e.hands_weight) parts.push(`   Hands: ${e.hands_weight}`);
    if (e.head_full_face_weight) parts.push(`   Head and Full Face: ${e.head_full_face_weight}`);
    if (e.suit_weight) parts.push(`   Suit: ${e.suit_weight}`);

    parts.push(""); // blank line for astetics
    parts.push("Cost:");
    if (e.arms_cost) parts.push(`   Arms: ${e.arms_cost}`);
    if (e.body_cost) parts.push(`   Body: ${e.body_cost}`);
    if (e.legs_cost) parts.push(`   Legs: ${e.legs_cost}`);
    if (e.feet_cost) parts.push(`   Feet: ${e.feet_cost}`);
    if (e.hands_cost) parts.push(`   Hands: ${e.hands_cost}`);
    if (e.head_full_face_cost) parts.push(`   Head and Full Face: ${e.head_full_face_cost}`);
    if (e.suit_cost) parts.push(`   Suit: ${e.suit_cost}`);
  }
  if (e.category === "shield") {
    if (e.type) parts.push(`Type: ${e.type}`);
    if (e.weight) parts.push(`Weight: ${e.weight}`);
    if (e.defense_bonus) parts.push(`Defense Bonus: ${e.defense_bonus}`);
    if (e.cost) parts.push(`Cost: ${e.cost}`);
  }
  //If more categories get added, create new if clauses  

  //if (e.full_text) parts.push(`Description: ${e.full_text}`); //Is no "full_text" to return"
  //if (e.notes)....dealt with in normalize function
  //"search_name": not to be displayed

  return parts.join("\n");
}
function buildEnchantmentsText(e){
  const parts = [];

  //if (e.name) parts.push(`Name: ${e.name}`); //Done in displayResults()
  //if (e.category) parts.push(`Category: ${e.category}`); //Done in displayResults()

  if (e.base_item) parts.push(`Base_Item: ${e.base_item}`);
  if (e.prefix) parts.push(`Prefix: ${e.prefix}`);
  if (e.suffix) parts.push(`Suffix: ${e.suffix}`);
  if (e.cost) parts.push(`Cost: ${e.cost}`);
  if (e.effects) parts.push(`Effects: ${e.effects}`);
  //parts.push(""); // blank line for astetics
  //if (e.full_text) parts.push(`${e.full_text}`);
  //if (e.notes)....dealt with in normalize function
  //"search_name": not to be displayed

  return parts.join("\n");
}
function buildDisadvantageText(e) {  
  const parts = [];

  //if (e.name) parts.push(`Name: ${e.name}`); //Done in displayResults()
  //if (e.category) parts.push(`Category: ${e.category}`); //Done in displayResults()

  if (e.points) parts.push(`Points: ${e.points}`);
  if (e.source_file) parts.push(`Source_File: ${e.source_file}`);
  parts.push(""); // blank line for astetics
  if (e.full_text) parts.push(`${e.full_text}`);
  //if (e.notes)....dealt with in normalize function
  //"search_name": not to be displayed

  return parts.join("\n");
}
function buildAdvantageText(e){ 
  const parts = [];

  //if (e.name) parts.push(`Name: ${e.name}`); //Done in displayResults()
  //if (e.category) parts.push(`Category: ${e.category}`); //Done in displayResults()

  if (e.points) parts.push(`Points: ${e.points}`);
  if (e.source) parts.push(`Source: ${e.source}`);
  parts.push(""); // blank line for astetics
  if (e.full_text) parts.push(`${e.full_text}`);
  //if (e.notes)....dealt with in normalize function
  //"search_name": not to be displayed

  return parts.join("\n");
}
function buildSpellText(e){
  const parts = [];

  //if (e.name) parts.push(`Name: ${e.name}`); //Done in displayResults()
  //if (e.category) parts.push(`Category: ${e.category}`); //Done in displayResults()

  if (e.college) parts.push(`College: ${e.college}`);
  if (e.source_file) parts.push(`Source_file: ${e.source_file}`);
  parts.push(""); // blank line for astetics
  if (e.full_text) parts.push(`${e.full_text}`);
  //if (e.notes)....dealt with in normalize function
  //"search_name": not to be displayed

  
  return parts.join("\n");
}
function buildWeaponText(e) {
  const parts = [];

  //if (e.name) parts.push(`Name: ${e.name}`); //Done in displayResults()
  //if (e.category) parts.push(`Category: ${e.category}`); //Done in displayResults()

  if (e.weapon) parts.push(`Weapon: ${e.weapon}`);
  if (e.group) parts.push(`Group: ${e.group}`);
  if (e.damage) parts.push(`Damage: ${e.damage}`);
  if (e.accuracy) parts.push(`Accuracy: ${e.accuracy}`);
  if (e.range) parts.push(`Range: ${e.range}`);
  if (e.weight) parts.push(`Weight: ${e.weight}`);
  if (e.shots) parts.push(`Shots: ${e.shots}`);
  if (e.cost) parts.push(`Cost: ${e.cost}`);
  if (e.per_pound) parts.push(`Per Pound: ${e.per_pound}`);
  if (e.st) parts.push(`ST: ${e.st}`);
  if (e.bulk) parts.push(`Bulk: ${e.bulk}`);
  if (e.skill_defaults) parts.push(`Skill Defaults: ${e.skill_defaults}`);
  //if (e.projectile) parts.push(`Projectile: ${e.projectile}`);  //Renamed projectile to name, thats how other items are formatted

  if (e.attacks && Array.isArray(e.attacks)) {
    parts.push(`Attacks:`);

    e.attacks.forEach((a) => {
      parts.push(`    Type:           ${a.type}`);
      parts.push(`    Damage:         ${a.damage}`);
      parts.push(`    Damage Type:    ${a.damage_type}`);
      parts.push(`    Reach:          ${a.reach}`);
      parts.push(`    Parry:          ${a.parry}`);
      parts.push(""); // blank line between attacks
    });
  }
  //if (e.full_text) parts.push(`Description: ${e.full_text}`); //Is no "full_text" to return"
  //if (e.notes)....dealt with in normalize function
  //"search_name": not to be displayed

  return parts.join("\n");
}
function buildGenericText(e) {
  console.log("A new dictionary file is not properly set up");
  return;
}



// Main loader: accepts an object containing all JSON files
export function loadDictionary(files) {
  const dictionary = [];

  dictionary.push(...loadFile(files.enchantments, "enchantments")); 
  dictionary.push(...loadFile(files.gear, "gear"));
  dictionary.push(...loadFile(files.modifiers, "modifiers")); 
  dictionary.push(...loadFile(files.spells, "spells")); 
  dictionary.push(...loadFile(files.weapons, "weapons"));
  dictionary.push(...loadFile(files.disadvantages_master, "disadvantages"));
  dictionary.push(...loadFile(files.advantages_starter, "advantages"));
  dictionary.push(...loadFile(files.skill_starter, "skill")); 
  dictionary.push(...loadFile(files.miscgear, "miscgear"));
  dictionary.push(...loadFile(files.rules_exploits, "rulesExploits"));

  return dictionary;
}
