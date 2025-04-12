import { parseConversation, setGlobalName, getGlobalName } from './parser.js';

export function createOverlay(users) {
    const userItems = users.map(user =>
      `<li><a class="dropdown-item" href="#" onclick="window.handleUserClick('${user}')" title="${user}">${user}</a></li>`
    ).join('');
  
    return `
      <div id="myNav" class="overlay">
        <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
        <div class="overlay-content">
          <button class="print-button" onclick="window.printChat();">
            <img src="./images/print.svg" alt="Print" width="24" height="24" loading="lazy" decoding="async">
            Print Chat
          </button>
          <div class="dropdown w-100">
            <button class="dropdown-toggle custom-dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
              Choose Author
            </button>
            <ul class="dropdown-menu w-100" aria-labelledby="dropdownMenuButton">
              ${userItems}
            </ul>
          </div>
        </div>
      </div>
    `;
}

// Add this function to handle user clicks and make it globally available
window.handleUserClick = function(userName) {
  if (userName !== getGlobalName()) {
    setGlobalName(userName);
    closeNav();

    const chatContainer = document.getElementById('output');
    if (chatContainer) {
        const { htmlContent } = parseConversation(window.chatData);
        chatContainer.innerHTML = htmlContent;
    }
  }
  closeNav();
}

window.printChat = function() {
  closeNav();
  window.print();
}
  