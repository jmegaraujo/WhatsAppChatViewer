const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let globalName = "";
let chatGroupName = "";
let users = [];

// Export functions to get and set globalName
export function getGlobalName() {
    return globalName;
}

export function setGlobalName(name) {
    globalName = name;
}

// Utility Functions
const stripHiddenUnicode = str => str.replace(/[\u200B-\u200F\u00A0\u00AD]/g, '');
const escapeHtml = text => text.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const formatDate = (day, month, year, time) => `${parseInt(day)} ${MONTHS[parseInt(month) - 1]} ${year}, ${time.slice(0, 5)}`;
const regexMessage = message => message.match(/^\[?(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2})\] (.*?): (.*)$/);

// Main Parsing Function
export function parseConversation(dict) {
    users = [];
    let htmlContent = `
        <div style="display: flex; flex-direction: column; align-items: flex-start;">
            <div class="message" style="padding: 10px; border-radius: 10px; width: fit-content; font-family: sans-serif; margin: 20px auto 10px auto; display: table;">
                <div style="color: #eac473; font-family: sans-serif; padding: 10px 16px; font-size: 14px; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">🔒</span>
                    <span>Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.</span>
                </div>
            </div>`;

    dict.forEach(item => {
        if (item.filename.toLowerCase().endsWith('.txt')) {
            htmlContent += parseTextFile(item.fileData, dict);
        }
    });
    htmlContent += '</div>';
    users = users.filter(user => user !== chatGroupName && user !== "You");
    return { users, htmlContent };
}

function parseTextFile(fileData, dict) {
    const lines = fileData.split('\n').filter(line => line.trim());
    if (!lines.length) return '';

    let html = '', lastSender = null, pollActive = false, pollLines = [];
    setChatMetadata(lines);

    for (const line of lines) {
        const trimmedLine = stripHiddenUnicode(line.trim());
        const match = regexMessage(trimmedLine);

        if (match) {
            const [, day, month, year, time, name, text] = match;
            if (!users.includes(name)) users.push(name);

            if (pollActive) {
                html += parsePoll(pollLines, lastSender);
                pollActive = false;
                pollLines = [];
            }

            if (text.trim().startsWith('POLL:')) {
                pollActive = true;
                pollLines.push(trimmedLine);
            } else {
                const parsed = parseMessage(trimmedLine, lastSender, dict);
                if (parsed) {
                    html += parsed;
                    lastSender = name;
                }
            }
        } else if (pollActive) {
            pollLines.push(trimmedLine);
        }
    }

    if (pollActive) html += parsePoll(pollLines, lastSender);
    return html;
}

function setChatMetadata(lines) {
    const firstMatch = regexMessage(stripHiddenUnicode(lines[0].trim()));
    const name = firstMatch?.[5];
    const text = firstMatch?.[6];

    if (text?.includes('You')) {
        chatGroupName = name;
    } else if (text?.includes('Messages and calls are end-to-end encrypted.') && 
               regexMessage(stripHiddenUnicode(lines[1]?.trim()))?.[6].includes('created this group')) {
        chatGroupName = name;
    } else {
        chatGroupName = '';
    }

    if (name && name !== chatGroupName && !globalName) globalName = name;
}

function parseMessage(message, lastSender, dict) {
    const [, day, month, year, time, name, text] = regexMessage(message) || [];
    if (!day || !text?.trim() || text.startsWith('Messages')) return '';

    const isNewSender = name !== lastSender;
    const marginTop = isNewSender ? '15px' : '2px';
    const showName = isNewSender || name === chatGroupName || name === 'You';
    const formattedDate = formatDate(day, month, year, time);
    const alignSelf = name === globalName ? 'align-self: flex-end;' : name === chatGroupName || name === 'You' ? 'align-self: center;' : '';

    if (/<attached:\s*.+?>/.test(text)) {
        return parseAttachment(text, { marginTop, showName, name, formattedDate, dict });
    }

    if (/(https?:\/\/[^\s]+)/.test(text)) {
        const linkedText = text.replace(/(https?:\/\/[^\s]+)/g, url => 
            `<a href="${url}" target="_blank" style="color: #53bdeb; text-decoration: none;">${url}</a>`);
        return `
            <div class="message" style="margin-top: ${marginTop}; ${alignSelf}">
                ${showName ? `<div class="sender-name">${escapeHtml(name)}</div>` : ''}
                <div>${linkedText}</div>
                <div style="font-size: 0.8em; color: #bbb; margin-top: 5px;">${formattedDate}</div>
            </div>`;
    }

    return `
        <div class="${name === chatGroupName || name === 'You' ? 'infoMessage' : 'message'}" style="margin-top: ${marginTop}; ${alignSelf}">
            ${showName ? `<div class="sender-name">${escapeHtml(name)}</div>` : ''}
            <div>${escapeHtml(text)}</div>
            <div style="font-size: 0.8em; color: #bbb; margin-top: 5px;">${formattedDate}</div>
        </div>`;
}

function parseAttachment(text, { marginTop, showName, name, formattedDate, dict }) {
    const filename = text.match(/<attached: (.+?)>/)?.[1];
    const result = dict.find(item => decodeURIComponent(item.filename).includes(filename));
    if (!result) {
        return `<div class="message">Missing attachment: ${escapeHtml(filename)}</div>`;
      }
      
    const ext = result.filename.split('.').pop().toLowerCase();
    const cleanFilename = result.filename.split('-').slice(1).join('-');

    const mediaTypes = {
        image: ['webp', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'],
        video: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm'],
        audio: ['mp3', 'opus', 'wav', 'ogg', 'flac', 'aac'],
    };

    if (mediaTypes.image.includes(ext)) {
        return `
            <div class="message" style="margin-top: ${marginTop}; ${name === globalName ? 'align-self: flex-end;' : ''}">
                ${showName ? `<div class="sender-name">${escapeHtml(name)}</div>` : ''}
                <img src="${result.url}" alt="${escapeHtml(result.filename)}" style="max-width: 300px; border-radius: 5px; margin-top: 5px;">
                <div style="font-size: 0.8em; color: #bbb; margin-top: 5px;">${formattedDate}</div>
            </div>`;
    } else if (mediaTypes.video.includes(ext)) {
        return `
            <div class="message" style="margin-top: ${marginTop}; ${name === globalName ? 'align-self: flex-end;' : ''}">
                ${showName ? `<div class="sender-name">${escapeHtml(name)}</div>` : ''}
                <video src="${result.url}" controls style="max-width: 300px; border-radius: 5px; margin-top: 5px;"></video>
                <div style="font-size: 0.8em; color: #bbb; margin-top: 5px;">${formattedDate}</div>
            </div>`;
    } else if (mediaTypes.audio.includes(ext)) {
        return `
            <div class="message" style="margin-top: ${marginTop}; ${name === globalName ? 'align-self: flex-end;' : ''}">
                ${showName ? `<div class="sender-name">${escapeHtml(name)}</div>` : ''}
                <audio class="custom-audio" src="${result.url}" controls></audio>
                <div style="font-size: 0.8em; color: #bbb; margin-top: 5px;">${formattedDate}</div>
            </div>`;
    } else if (ext === 'vcf') {
        const vcfCard = parseVcfContent(result.fileData);
        return `
            <div class="message" style="margin-top: ${marginTop}; ${name === globalName ? 'align-self: flex-end;' : ''}">
                ${showName ? `<div class="sender-name">${escapeHtml(name)}</div>` : ''}
                <div class="vcf-preview" style="border: 1px solid #ccc; border-radius: 8px; padding: 10px; max-width: 300px; background-color: #1e1e1e;">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <span style="font-size: 24px; margin-right: 10px;">👤</span>
                        <div style="font-weight: bold; font-size: 16px; color: #eac473;">${escapeHtml(vcfCard.name) || 'Unnamed Contact'}</div>
                    </div>
                    ${vcfCard.title ? `<div style="color: #ccc;">${escapeHtml(vcfCard.title)}</div>` : ''}
                    ${vcfCard.org ? `<div style="color: #ccc;">${escapeHtml(vcfCard.org)}</div>` : ''}
                    ${vcfCard.phone ? `<div>📞 <a href="tel:${vcfCard.phone}" style="color: #53bdeb; text-decoration: none;">${vcfCard.phone}</a></div>` : ''}
                    ${vcfCard.email ? `<div>✉️ <a href="mailto:${vcfCard.email}" style="color: #53bdeb; text-decoration: none;">${vcfCard.email}</a></div>` : ''}
                    <div style="font-size: 0.8em; color: #bbb; margin-top: 10px;">${formattedDate}</div>
                </div>
            </div>`;
    }

    return `
        <div class="message" style="margin-top: ${marginTop}; ${name === globalName ? 'align-self: flex-end;' : ''}">
            ${showName ? `<div class="sender-name">${escapeHtml(name)}</div>` : ''}
            <a href="${result.url}" download="${escapeHtml(cleanFilename)}" style="color: #53bdeb; text-decoration: none;">
                ${escapeHtml(cleanFilename)}
            </a>
            <button onclick="downloadFile('${result.url}', '${escapeHtml(cleanFilename)}')" style="background: none; border: none; cursor: pointer;">
                <img src="./images/download.svg" alt="File Icon" style="width: 20px; height: 20px; margin-right: 5px;">
            </button>
            <div style="font-size: 0.8em; color: #bbb; margin-top: 5px;">${formattedDate}</div>
        </div>`;
}

function parsePoll(pollLines, lastSender) {
    if (!pollLines.length) return '';
    const [, day, month, year, time, name] = regexMessage(pollLines[0].trim()) || [];
    if (!name) return '';

    const isNewSender = name !== lastSender;
    const marginTop = isNewSender ? '15px' : '2px';
    const showName = isNewSender;
    const formattedDate = formatDate(day, month, year, time);

    const pollTitle = pollLines[1]?.trim().startsWith('OPTION:') ? 'Poll' : pollLines[1]?.trim() || 'Poll';
    const options = pollLines.filter(line => line.trim().startsWith('OPTION:'))
        .map(line => {
            const text = line.replace(/.*OPTION:\s*/i, '').trim();
            const votes = parseInt(text.match(/\((\d+)\s*vote[s]?\)/i)?.[1] || 0);
            return { text: text.replace(/\(\d+\s*vote[s]?\)/i, '').trim(), votes };
        })
        .filter(opt => opt.text);

    const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

    let html = `
        <div class="message" style="margin-top: ${marginTop}; width: 20%; ${name === globalName ? 'align-self: flex-end;' : ''}">
            ${showName ? `<div class="sender-name" style="font-weight: bold; color: #53bdeb; margin-bottom: 5px;">${escapeHtml(name)}</div>` : ''}
            <div class="poll-box" style="border-radius: 10px; font-family: sans-serif; background-color: #1e1e1e; padding: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);">
                <div style="font-weight: bold; margin-bottom: 12px; font-size: 16px; color: #eac473;">📊 ${escapeHtml(pollTitle)}</div>`;

    options.forEach(opt => {
        const percentage = totalVotes ? Math.round((opt.votes / totalVotes) * 100) : 0;
        html += `
            <div style="margin-bottom: 10px;">
                <div style="font-size: 14px; margin-bottom: 4px; color: #ffffff;">${escapeHtml(opt.text)}</div>
                <div style="display: flex; align-items: center;">
                    <div style="flex-grow: 1; background-color: #333; height: 10px; border-radius: 5px; overflow: hidden; position: relative;">
                        <div style="width: ${percentage}%; background-color: #53bdeb; height: 100%; border-radius: 5px; transition: width 0.3s ease;"></div>
                    </div>
                    <span style="margin-left: 10px; font-size: 12px; color: #bbb;">${opt.votes} vote${opt.votes !== 1 ? 's' : ''}</span>
                </div>
            </div>`;
    });

    html += `
                <div style="text-align: right; font-size: 12px; color: #bbb; margin-top: 12px;">Total votes: ${totalVotes}</div>
            </div>
            <div style="font-size: 0.8em; color: #bbb; margin-top: 5px;">${formattedDate}</div>
        </div>`;
    return html;
}

function parseVcfContent(vcf) {
    const lines = vcf.split('\n');
    return lines.reduce((card, line) => {
        if (line.startsWith('FN:')) card.name = line.slice(3);
        else if (line.startsWith('TEL')) card.phone = line.split(':')[1];
        else if (line.startsWith('EMAIL')) card.email = line.split(':')[1];
        else if (line.startsWith('ORG:')) card.org = line.slice(4);
        else if (line.startsWith('TITLE:')) card.title = line.slice(6);
        return card;
    }, {});
}

export function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

window.downloadFile = downloadFile;