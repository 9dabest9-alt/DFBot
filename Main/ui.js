import { loadDictionary } from "./dictionaryLoader.js";
import {exportFile} from "./exporter.js";

// Placeholder: load your JSON files however you prefer
// (fetch, local import, etc.)
export const files = {
  enchantments:         await fetch("./dictionary/enchantments.json")         .then((r) => r.json(),),
  gear:                 await fetch("./dictionary/gear.json")                 .then((r) => r.json()),
  modifiers:            await fetch("./dictionary/modifiers.json")            .then((r) => r.json()),
  spells:               await fetch("./dictionary/spell_master.json")         .then((r) => r.json()),
  weapons:              await fetch("./dictionary/weapons.json")              .then((r) => r.json()),
  disadvantages_master: await fetch("./dictionary/disadvantages_master.json",).then((r) => r.json()),
  advantages_starter:   await fetch("./dictionary/advantages_starter.json")   .then((r) => r.json(),),
  skill_starter:        await fetch("./dictionary/skill_starter.json")        .then((r) => r.json(),),
  miscgear:             await fetch("./dictionary/miscgear.json")             .then((r) => r.json()),
  rules_exploits:       await fetch("./dictionary/rules_exploits.json")       .then((r) => r.json(),),
};

const DICTIONARY = loadDictionary(files);

console.log(files.advantages_starter);
console.log(files.enchantments);

// DOM elements
const searchBox = document.getElementById("searchBox");
const searchBtn = document.getElementById("searchBtn");
const autocompleteList = document.getElementById("autocompleteList");
const results = document.getElementById("results");

//Fuzzy Logic Matching
const fuse = new Fuse(DICTIONARY, {
  keys: ["name", "search_name"],
  threshold: 0.4, // similar to fuzz.WRatio threshold
  includeScore: true,
});

// AUTOCOMPLETE (placeholder)
searchBox.addEventListener("input", () => {
  const term = searchBox.value.toLowerCase();
  autocompleteList.innerHTML = "";

  if (!term) return;

  const modifierMatches = findModifierMatches(term);
  const normalMatches = findNormalMatches(term);

  let combined = [...modifierMatches, ...normalMatches];

  if (combined.length === 0) {
    const fuzzy = fuse.search(term).slice(0, 10);
    combined = fuzzy.map((f) => f.item);
  }

  combined.slice(0, 20).forEach((entry) => {
    const div = document.createElement("div");
    div.className = "autocompleteItem";
    div.textContent = entry.name;
    div.onclick = () => {
      searchBox.value = entry.search_name || entry.name;
      runSearch();
    };
    autocompleteList.appendChild(div);
  });
});


// SEARCH (placeholder)
function runSearch() {
  const term = searchBox.value.toLowerCase();
  results.innerHTML = "";

  const modifierMatches = findModifierMatches(term);
  const normalMatches = findNormalMatches(term);

  let finalResults = [];

  //Temporary for Unifying dictionary structure
  /* if (term.startsWith("export ")) {
    const fileName = term.replace("export ", "").trim();
    exportFile(fileName);
    return;
  } */

  if (modifierMatches.length > 0) {
    finalResults = [...modifierMatches, ...normalMatches];
  } else if (normalMatches.length > 0) {
    finalResults = normalMatches;
  } else {
    // --- FUZZY MATCH FALLBACK ---
    const fuzzy = fuse.search(term).slice(0, 5);

    if (fuzzy.length > 0) {
      const suggestions = fuzzy.map((f) => f.item.name);
      const div = document.createElement("div");
      div.className = "resultBlock";
      div.innerHTML = `
        <div class="resultTitle">No exact match found</div>
        <div class="resultText">Did you mean: ${suggestions.join(", ")}?</div>
      `;
      results.appendChild(div);
      return;
    }
  }

  displayResults(finalResults);
}

function displayResults(list) {
  results.innerHTML = "";

  list.forEach((entry) => {
    const block = document.createElement("div");
    block.className = "resultBlock";

    const noteSource = getNoteSource(entry);
    const noteBlock = buildNoteBlock(entry.notes, noteSource);

    block.innerHTML = `
      <div class="resultTitle">${entry.name}</div>
      <div class="resultCategory">${entry.category}</div>
      <div class="resultText">${entry.full_text}</div>
      ${noteBlock}
    `;

    results.appendChild(block);
  });
}

function findNormalMatches(term) {
  const lower = term.toLowerCase();
  return DICTIONARY.filter((e) => e.search_name.includes(lower));
}

//Modifier Search
function findModifierMatches(term) {
  const lower = term.toLowerCase();

  return MODIFIERS.filter(
    (m) =>
      (m.name && m.name.toLowerCase().includes(lower)) ||
      (m.search_name && m.search_name.toLowerCase().includes(lower)) ||
      (m.prefix && m.prefix.toLowerCase().includes(lower)) ||
      (m.suffix && m.suffix.toLowerCase().includes(lower)),
  );
}

//Modifier Expansion
const MODIFIERS = DICTIONARY.filter(
  (e) =>
    e.category === "modifier_weapon" ||
    e.category === "modifier_shield" ||
    e.category === "modifier_armor",
);

//Notes
function buildNoteBlock(noteIds, noteSource) {
  if (!noteIds || noteIds.length === 0) return "";

  const lines = noteIds
    .map((id) => {
      const text = noteSource[String(id)];
      return text ? `[${id}] ${text}` : null;
    })
    .filter(Boolean);

  if (lines.length === 0) return "";

  return `
    <div class="resultNotes">
      <strong>Notes:</strong><br>
      ${lines.join("<br><br>")}
    </div>
  `;
}

//Shortcut buttons

function getNoteSource(entry) {
  
  return entry.notes || {}; // generic gear notes
}



searchBtn.onclick = runSearch;
