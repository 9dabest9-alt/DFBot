import { loadDictionary } from "./dictionaryLoader.js";
import { exportFile, analyzeFile } from "./exporter.js";

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
//console.log(DICTIONARY); //TO easily see dictionary and structure


// DOM elements
const searchBox = document.getElementById("searchBox");
const searchBtn = document.getElementById("searchBtn");
const autocompleteList = document.getElementById("autocompleteList");
const results = document.getElementById("results");

//Fuzzy Logic Matching
const fuse = new Fuse(DICTIONARY, {
  keys: ["search_name"],
  threshold: 0.4, // similar to fuzz.WRatio threshold
  includeScore: true,
});

// AUTOCOMPLETE (placeholder)
searchBox.addEventListener("input", () => {
  const term = searchBox.value.toLowerCase();
  autocompleteList.innerHTML = "";

  if (!term) return;  
  
  const normalMatches = findNormalMatches(term);

  let combined = [...normalMatches];
  if (combined.length === 0) {
    const fuzzy = fuse.search(term).slice(0, 10);
    combined = fuzzy.map((f) => {
      const item = f.item;
      item._fuzzy = true; // mark fuzzy entries
      return item;
    });

  } 

  //Autocomplete terms
  combined.slice(0, 20).forEach((entry) => {
    const div = document.createElement("div");
    div.className = "autocompleteItem";

    //NOTE Highlighting disabled
    //Have highlighting functionality, but disabled as care for it, fuzzy highlighing isnt always correct so becomes useless
    // Add category class -- used for class highlighting -- I dont care for it as is -- would need every entry of dictionary to have a category but could be changed to something else if distinction is wanted. Colors changed in .css under category colors
    //div.classList.add(`cat-${entry.category}`);

    // If this entry came from fuzzy search, highlight it.  Change colors in .css fuzzy highlighting
    /* if (entry._fuzzy) {
      div.classList.add("fuzzyHighlight");
    } */

    div.textContent = `${entry.name} (${entry.category})`;

    div.onclick = () => {
      searchBox.value = `id:${entry.id}`;
      runSearch();
    };

    autocompleteList.appendChild(div);
  });

});

function listCategory(term)  {
  const cat = term.replace("list-", "").trim().toLowerCase();
  const matches = DICTIONARY.filter((e) =>
    e.category.toLowerCase().includes(cat),
  );

  results.innerHTML = "";

  if (matches.length === 0) {
    results.innerHTML = `<div class="resultBlock">No items found in category "${cat}".</div>`;
    return;
  }

  // Output ONLY names
  const block = document.createElement("div");
  block.className = "resultBlock";

  block.innerHTML = `
    <div class="resultTitle">Items in category: ${cat}</div>
    <div class="resultText">
      ${matches.map((e) => e.name).join("<br>")}
    </div>
  `;

  results.appendChild(block);

  return;
}

function searchID(term) {
  const id = term.slice(3);
  const hit = DICTIONARY.find((e) => e.id === id);

  if (hit) {
    // Replace gibberish ID with readable name
    searchBox.value = hit.name;

    // Display exactly one result
    displayResults([hit]);
  } else {
    results.innerHTML = "<div class='resultBlock'>No entry found for ID.</div>";
  }

  return;
}

function listCategoryTerms(term){
  const categories = new Set(DICTIONARY.map((e) => e.category));

  results.innerHTML = "";

  const block = document.createElement("div");
  block.className = "resultBlock";

  block.innerHTML = `
    <div class="resultTitle">All Category Types</div>
    <div class="resultText">
      ${Array.from(categories).sort().join("<br>")}
    </div>
  `;

  results.appendChild(block);
}
function setWebHook(term) {
  // SPECIAL: set webhook URL
  const url = term.replace("webhook-", "").trim();

  if (!url.startsWith("https://discord.com/api/webhooks/")) {
    results.innerHTML = `
    <div class="resultBlock">
      <div class="resultTitle">Invalid Webhook</div>
      <div class="resultText">Webhook must start with https://discord.com/api/webhooks/</div>
    </div>`;
    return;
  }

  localStorage.setItem("discordWebhook", url);

  results.innerHTML = `
  <div class="resultBlock">
    <div class="resultTitle">Webhook Saved</div>
    <div class="resultText">Your Discord webhook has been stored securely on this device.</div>
  </div>`;

    return;
}


function listHelp() {
  const div = document.createElement("div");
  div.className = "resultBlock";
  div.innerHTML = `
        <div class="resultTitle">Help Page:</div>
        <div class="resultText">Type "help-"  to see this page.</div>
        <div class="resultText">Type "list-(category)"  to see all sorted by category.</div>
        <div class="resultText">Type "list?" to see a list of of all possible list searches.</div>
        <div class="resultText">\n</div>
        <div class="resultText">ShortCuts:</div>
        <div class="resultText">CTRL + BACKSPACE   --   Erase page</div>
        <div class="resultText">CTRL + L                       --   Focus and highlight textbox.</div>
        <div class="resultText">ENTER                          --   Search</div>
        <div class="resultText">\n</div>
        <div class="resultText">Enter terms into textbox--If search is invoked, all matching terms are returned</div>
        <div class="resultText">in results window.</div>
        <div class="resultText">\n</div>
        <div class="resultText">Suggestions appear in left panel and are clickable.  Only that which is clicked is</div>
        <div class="resultText">returned to the results panel.</div>
        <div class="resultText">Results panel is the large right panel.</div>
        <div class="resultText">\n</div>
        <div class="resultText">Send Button publishes the results panel to the Discord chat.</div>
        <div class="resultText">webhook-YOUR_WEBHOOK_URL_HERE     -- Sets up the Webhook, must be done at least once.</div>
                
      `;
  results.appendChild(div);
}

// SEARCH (placeholder)
function runSearch() {
  const term = searchBox.value.toLowerCase();
  results.innerHTML = "";

  const normalMatches = findNormalMatches(term);

  let finalResults = [];

 
  // SPECIAL LIST COMMANDS
  if (term.startsWith("list-")) {
    listCategory(term);    
    return;
  }
  if (term.startsWith("id:")) {
    searchID(term);
    return;
  }
  if (term.startsWith("help-")) {
    listHelp();
  return;
  }
  if (term.startsWith("list?")) {
    listCategoryTerms(term);
    return;
  }
  if (term.startsWith("webhook-")) {
    setWebHook(term);
    return;
  }

  //NOTE DONT ERASE
  //Temporary for Unifying dictionary structure
  /* if (term.startsWith("export ")) {
    const fileName = term.replace("export ", "").trim();
    exportFile(fileName);
    return;
  } */
  //Temporary for getting all the fields in a json file
  /* if (term.startsWith("analyze ")) {
   const fileName = term.replace("analyze ", "").trim();

   if (files[fileName]) {
     analyzeFile(files[fileName], fileName);
   } else {
     console.log("Unknown file:", fileName);
   }
 }
 */

  if (normalMatches.length > 0) {
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

    //const noteSource = getNoteSource(entry);
    //const noteBlock = buildNoteBlock(entry.notes, noteSource);

    block.innerHTML = `
      <div class="resultTitle">${entry.name}</div>
      <div class="resultCategory">${entry.category}</div>
      <div class="resultText">${entry.full_text}</div>
      `; //${noteBlock}

    results.appendChild(block);
  });
}

function findNormalMatches(term) {
  const lower = term.toLowerCase();
  return DICTIONARY.filter((e) => e.search_name.includes(lower));
}

function findIDMatch(term) {
  const lower = term.toLowerCase();
  return DICTIONARY.filter((e) => e.id)
}





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


function getNoteSource(entry) {
  
  return entry.notes || {}; // generic gear notes
}



function handleShortcutClear(e) {
  if (e.ctrlKey && e.key === "Backspace")  {
    e.preventDefault();
    const box = document.getElementById("searchBox");
    const auto = document.getElementById("autocompleteList");
    const results = document.getElementById("results");

    if (box) box.value = "";
    if (auto) auto.innerHTML = "";
    if (results) results.innerHTML = "";

    return true;
  }
  return false;
}

function handleShortcutFocusSearch(e) {
  if (e.ctrlKey && e.key.toLowerCase() === "l") {
    e.preventDefault();
    const box = document.getElementById("searchBox");
    if (box) {
      box.focus();
      box.select();
    }

    return true;
  }
  return false;
}

function getResultsText() {
  const blocks = document.querySelectorAll(".resultBlock");
  if (!blocks.length) return "No results to send.";

  let output = "";

  blocks.forEach((block) => {
    const title = block.querySelector(".resultTitle")?.textContent || "";
    const category = block.querySelector(".resultCategory")?.textContent || "";
    const text = block.querySelector(".resultText")?.textContent || "";

    output += `**${title}**\n`;
    if (category) output += `*${category}*\n`;
    if (text) output += `${text}\n`;
    output += `\n`; // spacing between entries
  });

  return output.trim();
}

async function sendToDiscord(webhookUrl, content) {
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}


function handleShortcutSearch(e) {
  if (e.key === "Enter") {
  runSearch();
  }
}

//Start up on the help page
searchBox.value = "help-";
runSearch();

searchBtn.onclick = runSearch;

sendBtn.onclick = async () => {
  const webhookUrl = localStorage.getItem("discordWebhook");

  if (!webhookUrl) {
    results.innerHTML = `
      <div class="resultBlock">
        <div class="resultTitle">No Webhook Set</div>
        <div class="resultText">Use: webhook-<your URL> to set your Discord webhook.</div>
      </div>`;
    return;
  }

  const text = getResultsText();
  await sendToDiscord(webhookUrl, text);
};



//Shortcut buttons
window.addEventListener("keydown", (e) => {
  if (handleShortcutClear(e)) return;
  if (handleShortcutFocusSearch(e)) return;
  if (handleShortcutSearch(e)) return;
  // ... your other shortcuts
});

