import { GoogleGenerativeAI } from "@google/generative-ai";
const keyPart1 = "AIzaSyA2L1DljqxU"; // The start of the key
const keyPart2 = "Ol4XwkjTrx43nyxD1jSUYxY"; // PASTE THE REST OF YOUR NEW KEY HERE (exclude the AIzaSy part)

const API_KEY = keyPart1 + keyPart2;
// --- CONFIGURATION ---


// --- Element variables ---
let overlay, modal, modalTitle, messageEl, messageContainer, frameEl, closeBtn, loadingEl, findBtn;

// --- Modal & UI Functions ---

function showMessage(title, message) {
  if (modalTitle) modalTitle.textContent = title;
  if (messageEl) messageEl.innerHTML = message; 
  
  if (messageContainer) messageContainer.style.display = 'block';
  if (frameEl) frameEl.style.display = 'none';
  if (loadingEl) loadingEl.style.display = 'none';
  
  if (overlay) {
    overlay.style.display = 'flex';
  }
}

function showPortal(title, url) {
  if (modalTitle) modalTitle.textContent = title;
  if (frameEl) frameEl.src = url;

  if (frameEl) frameEl.style.display = 'block';
  if (messageContainer) messageContainer.style.display = 'none';
  if (loadingEl) loadingEl.style.display = 'none';
  
  if (overlay) overlay.style.display = 'flex'; 
}

function showLoading() {
  if (modalTitle) modalTitle.textContent = "ClassLink AI";
  if (messageContainer) messageContainer.style.display = 'none';
  if (frameEl) frameEl.style.display = 'none';
  if (loadingEl) loadingEl.style.display = 'flex'; 
  if (overlay) overlay.style.display = 'flex';
}

function closeModal() {
  if (overlay) overlay.style.display = 'none';
  if (frameEl) frameEl.src = 'about:blank'; 
  if (messageEl) messageEl.innerHTML = '';
  if (modalTitle) modalTitle.textContent = '';
}
const classrooms = {
  "pizza": {
    type: "portal",
    title: "Pizza Hub",
    content: "https://the-pizza-editiongames.github.io/#google_vignette"
  },
  "help": {
    type: "message",
    title: "Help",
    content: "<b>NEW LLM Intigration You Can Now Just Discribe The Site You Want And Our AI Will Pull It Up For You!</b><br><br>You can do the following things:<br><br>1. Type <b>poki</b> to open Poki."
  },
  "poki": {
    type: "message",
    title: "Open Poki",
    content: "Poki's website cannot be loaded inside a portal.<br><br>" +
             "<a href='https://poki.com/' target='_blank' rel='noopener noreferrer' class='portal-link'>Open Poki in New Tab</a>"
  },
  "test": {
    type: "message",
    title: "Test",
    content: "It works!"
  },
  "minecraft": {
    type: "portal",
    title: "Minecraft",
    content: "https://minecraft.kelvinzhang.ca/"
  },
  "sz": {
    type: "portal",
    title:"SZ Games",
    content:"https://sz-games.github.io/#google_vignette"
  },
  "cloudmoon": {
    type: "portal",
    title: "CloudMoon",
    content: "https://web.cloudmoonapp.com/"
  },
  "a-z": {
    type: "portal",
    title: "A-Z Games",
    content: "https://azgames.io/"
  },
  "poker": {
    type: "portal",
    title: "Fake Poker",
    content: "https://www.247freepoker.com/"
  },
  "stick man": {
    type: "portal",
    title: "Stick Man Hook",
    content: "https://play.famobi.com/wrapper/neon-swing/A1000-10"
  },
  "html5": {
    type:"portal",
    title:"HTML 5 Games",
    content:"https://html5games.com/"
  },
  "salvy clicker": {
    type:"portal",
    title: "Salvy Clicker",
    content:"https://galvincode.github.io/Salvy-clicker/"
  },
  "chat": {
    type:"portal",
    title:"chat",
    content: "https://galvincode.github.io/chat-room-for-classlink/"
  }
};

/**
 * AI Logic
 */
async function findSiteWithAI(query) {
  if (API_KEY === "PASTE_YOUR_GEMINI_KEY_HERE") {
    showMessage("Config Error", "Please add your Google Gemini API Key in the code.");
    return;
  }

  try {
    showLoading();
    findBtn.textContent = "Searching Google...";
    findBtn.disabled = true;

    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Initialize with Google Search Tools
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      tools: [{ googleSearch: {} }] 
    });

    const prompt = `
      You are a URL finder helper for a web proxy site.
      The user wants to find a specific game or tool website.
      
      USER REQUEST: "${query}"

      INSTRUCTIONS:
      1. USE GOOGLE SEARCH to find a REAL, WORKING URL for this request.
      2. CRITICAL: The URL MUST be hosted on 'github.io'.
         - Github.io sites are required because they work in iframes.
         - Search specifically for "github.io ${query} game" or "github.io ${query} unblocked".
      3. RETURN ONLY THE SINGLE BEST RAW URL. 
         - Do not list multiple options. 
         - Do not explain. 
         - Start with https://.
      4. If you cannot find a live github.io site via search, return "ERROR".
      5. If you are givven a URL then just use that URL and dont search for anything
      6. similer to number 5 if they are giving somthing simmiler to the URL try to complrete the URL the best you can 
      7. dont use strictly github but you can favor it just get a higffh acuracery rate 
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Smart Parsing Logic
    const githubRegex = /((https?:\/\/)?[\w-]+\.github\.io(\/[\w-./?%&=]*)?)/i;
    const match = text.match(githubRegex);

    if (text.includes("ERROR") && !match) {
       showMessage("AI Search", "Sorry, I couldn't find a working GitHub site for that on Google.");
    } else if (match) {
       let finalUrl = match[0];
       if (!finalUrl.startsWith("http")) {
         finalUrl = "https://" + finalUrl;
       }
       showPortal("AI Discovery", finalUrl);
    } else if (text.startsWith("http")) {
       showMessage("AI Search", "I found a link (" + text + "), but I blocked it because it wasn't a GitHub site (security restriction).");
    } else {
      showMessage("AI Search", "I couldn't extract a valid URL from the result:<br>" + text);
    }

  } catch (error) {
    console.error(error);
    showMessage("Error", "AI Connection Failed: " + error.message);
  } finally {
    findBtn.textContent = "Find Class";
    findBtn.disabled = false;
  }
}

/**
 * Main Logic
 */
function checkValue() {
  let value = document.getElementById("text").value;
  const cleanedValue = value.toLowerCase().trim();
  
  const entry = classrooms[cleanedValue]; 

  if (entry) {
    if (entry.type === "portal") {
      showPortal(entry.title, entry.content);
    } else if (entry.type === "message") {
      showMessage(entry.title, entry.content);
    }
  } else {
    if (value.split(' ').length > 1 || value.length > 3) {
        findSiteWithAI(value);
    } else {
        showMessage("Error", "Invalid class code. (Try 'help' or type a full sentence like 'find me a chess game')");
    }
  }
}

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", function() {
  overlay = document.getElementById('portal-overlay');
  modal = document.getElementById('portal-modal');
  modalTitle = document.getElementById('portal-title');
  messageEl = document.getElementById('portal-message');
  messageContainer = document.getElementById('message-container');
  frameEl = document.getElementById('portal-frame');
  loadingEl = document.getElementById('portal-loading');
  closeBtn = document.getElementById('portal-close-btn');
  findBtn = document.getElementById('find-class-btn');
  
  if (closeBtn) closeBtn.onclick = closeModal;
  if (overlay) {
    overlay.onclick = function(event) {
      if (event.target == overlay) closeModal();
    }
  }

  const textInput = document.getElementById("text");
  if (textInput) {
    textInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault(); 
        checkValue();
      }
    });
  }
  
  if (findBtn) findBtn.onclick = checkValue;
});











