import { loadDictionary } from "./dictionaryLoader.js";

// Placeholder: load your JSON files however you prefer
// (fetch, local import, etc.)
const files = {
  enchantments: await fetch("./dictionary/enchantments.json").then((r) => r.json(),),
  gear: await fetch("./dictionary/gear.json").then((r) => r.json()),
  modifiers: await fetch("./dictionary/modifiers.json").then((r) => r.json()),
  spells: await fetch("./dictionary/spell_master.json").then((r) => r.json()),
  weapons: await fetch("./dictionary/weapons.json").then((r) => r.json()),
  disadvantages_master: await fetch("./dictionary/disadvantages_master.json",).then((r) => r.json()),
  advantages_starter: await fetch("./dictionary/advantages_starter.json").then((r) => r.json(),),
  skill_starter: await fetch("./dictionary/skill_starter.json").then((r) => r.json(),),
  miscgear: await fetch("./dictionary/miscgear.json").then((r) => r.json()),
  rules_exploits: await fetch("./dictionary/rules_exploits.json").then((r) => r.json(),),
};

const DICTIONARY = loadDictionary(files);

// DOM elements
const searchBox = document.getElementById("searchBox");
const searchBtn = document.getElementById("searchBtn");
const autocompleteList = document.getElementById("autocompleteList");
const results = document.getElementById("results");

// AUTOCOMPLETE (placeholder)
searchBox.addEventListener("input", () => {
  const term = searchBox.value.toLowerCase();
  autocompleteList.innerHTML = "";

  if (!term) return;

  const matches = DICTIONARY.filter((e) => e.search_name.includes(term)).slice(
    0,
    20,
  );

  matches.forEach((entry) => {
    const div = document.createElement("div");
    div.className = "autocompleteItem";
    div.textContent = entry.name;
    div.onclick = () => {
      searchBox.value = entry.search_name;
      runSearch();
    };
    autocompleteList.appendChild(div);
  });
});

// SEARCH (placeholder)
function runSearch() {
  const term = searchBox.value.toLowerCase();
  results.innerHTML = "";

  const matches = DICTIONARY.filter((e) => e.search_name.includes(term));

  matches.forEach((entry) => {
    const block = document.createElement("div");
    block.className = "resultBlock";

    block.innerHTML = `
      <div class="resultTitle">${entry.name}</div>
      <div class="resultCategory">${entry.category}</div>
      <div class="resultText">${entry.full_text}</div>
    `;

    results.appendChild(block);
  });
}

searchBtn.onclick = runSearch;
