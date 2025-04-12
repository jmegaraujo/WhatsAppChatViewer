import { parseConversation, setGlobalName, getGlobalName } from './parser.js';

export function createOverlay(users, attachmentCount) {
    const userItems = users.map(user =>
      `<li><a class="dropdown-item" href="#" onclick="window.handleUserClick('${user}')" title="${user}">${user}</a></li>`
    ).join('');
  
    return `
      <div id="myNav" class="overlay">
        <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
        <div class="overlay-content" style="padding-top: 20px;">
          <div class="chat-stats" style="margin-top: 0;">
            <h3 style="margin-top: 0;">Chat Statistics</h3>
            <div class="stat-item">
              <span class="stat-label">Participants:</span>
              <span class="stat-value" id="userCount">${users.length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total Messages:</span>
              <span class="stat-value" id="messageCount">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Attachments:</span>
              /*
              <span class="stat-value" id="attachmentCount">${attachmentCount-1}</span>
            </div>
          </div>
          <button class="print-button" onclick="window.printChat();" style="margin-top: 10px;">
            <img src="./images/print.svg" alt="Print" width="24" height="24" loading="lazy" decoding="async">
            Print Chat
          </button>
          <div class="dropdown w-100" style="margin-top: 10px;">
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
  