// @ts-check

function manage_map_expiries() {
  let to_delete_map = [];
  for (const [message, value] of message_map) {
    // Is entry older than
    if (Date.now() - value.expiry.valueOf() > MAP_ENTRY_MAX_AGE || !value.node || value.count > RESET_SIZE) {
      to_delete_map.push(message);
      //console.log('Message "' + message + '" last updated at ', value.expiry, " is getting deleted");
    }
  }
  for (const key of to_delete_map) {
    message_map.delete(key);
  }
  console.log("Map: ", message_map)
}

/**
 * Update the message counter indicator on a node to the new amount of messages
 * @param {Node} node
 * @param {number} msg_count
 */
function update_message_counter(node, msg_count) {
  //console.log("Cached node lastChild text: " + node.lastChild?.nodeValue)
  //console.log("trying to update node: ", node.lastChild);
  if (node.lastChild && node.lastChild.childNodes[0]) {
    // @ts-ignore
    node.lastChild.childNodes[0].innerText = msg_count.toString();
  }
}

/**
 * Attach a message counter indicator for repeated messages to chat messages
 * @param {Node} node
 */
function attach_message_counter(node, msg_count) {
  const counter_element = document.createElement("div");
  const counter_paragraph = document.createElement("p");
  
  counter_paragraph.innerText = msg_count.toString();
  counter_paragraph.className += "message-counter";
  counter_element.className += "counter-container";
  
  counter_element.appendChild(counter_paragraph);
  node.appendChild(counter_element);
  //console.log("Appended child to ", node, " with counter " + msg_count)
}

/**
 * Hide a node element
 * @param {Node} node
 */
function hide_node(node) {
  // @ts-ignore
  node.style.display = "none";
  //console.log("hiding node; ", node)
}

/**
 * Extract a string only message from a chat flex node containing only emotes
 * @param {Node} node The chat message flex node
 */
function extract_emotestring_from_node(node) {
  const emote_parent_node = extract_content_node(node);
  let emote_type_string = "";
  for (const childNode of emote_parent_node.childNodes) {
    // @ts-ignore
    if (childNode.className == "chat-line__message--emote-button") {
      // @ts-ignore
      emote_type_string += childNode.childNodes[0].childNodes[0].childNodes[0].childNodes[0].alt;
    }
    emote_type_string += ":";
  }
  return emote_type_string;
}

/**
 * Extract the actual chat message content node
 * @param {Node} node The chat message flex node
 */
function extract_content_node(node) {
  return node.childNodes[0].childNodes[2];
}

/**
 * Callback handler for the MutationObserver
 * @param {Array<MutationRecord>} mutationList
 * @param {*} observer
 */
function chat_mutation_handler(mutationList, observer) {
  for (const mutation of mutationList) {
    if (mutation.type === "childList") {
      // Is this an added element?
      if (
        mutation.addedNodes.length > 0 &&
        // @ts-ignore
        mutation.addedNodes[0].className == "chat-line__message"
      ) {
        const node = mutation.addedNodes[0];
        const flex_node = node.childNodes[0].childNodes[1].childNodes[1].childNodes[0];

        // Get the messages actual text from the lowest node containing only that
        let message_text = extract_content_node(flex_node).textContent?.toLocaleLowerCase();
        if (message_text) {
          // Check if this message only contains emotes, if yes convert it to text
          if (message_text.match(/^\s+$/gm)) {
            message_text = extract_emotestring_from_node(flex_node);
          }
          // Cut off the message, if its longer than 100 chars, to counter small additions (that change nothing about the actual content)
          if (message_text.length > 99) message_text = message_text.substring(0, 100);
          // Check if we already had this message before (in our frame)
          const cached_message = message_map.get(message_text);
          // Enter this message into map, or increase its counter if its repeated
          if (cached_message) {
            const current_count = cached_message.count + 1;
            // Is this the first duplicate?
            if (current_count < 3) {
              //console.log('Message "' + message_text + '" is duplicate, attaching counter with start ' + current_count);
              // Attach our message counter to the original message node
              attach_message_counter(cached_message.node, current_count);
            } else {
              //console.log('Message "' + message_text + '" is duplicate again, updating counter to ' + current_count);
              // Update the counter on the original message node
              update_message_counter(cached_message.node, current_count);
            }
            // Hide the duplicate message
            hide_node(node);
            // And sync the increased counter, new last-timestamp into our cache
            message_map.set(message_text, {
              count: current_count,
              expiry: new Date(Date.now()),
              node: cached_message.node,
            });
          } else {
            // The message is new, track it for a while in our cache
            message_map.set(message_text, {
              count: 1,
              expiry: new Date(Date.now()),
              node: flex_node,
            });
            // console.log("new message: " + message_text);
            // DEBUG: Filter out unique messages to better see stacking up of duplicate counters
            //hide_node(node);
          }
        }
      }
    }
  }
}

function init() {
  var sheet = document.styleSheets[0];
  sheet.insertRule(
    `
      .message-counter { 
        display: inline; 
        background: var(--color-blue-9); 
        padding: 0.5px 2px 0.5px 2px; 
        border-radius: 3px; 
        font-weight: 700; 
      }
    `,
    sheet.cssRules.length
  );
  sheet.insertRule(
    `
      .counter-container {
        right: 1px;
        position: absolute;
      }
    `,
    sheet.cssRules.length
  );

  // Get the chat container that contains all messages (lowest), and thereby mutates on updates
  const chat_element = document.getElementsByClassName("chat-scrollable-area__message-container").item(0);

  if (chat_element) {
    console.info("[Uniqueify-Chat]: Attaching mutation handler to twitch chat window.")
    const config = { attributes: false, childList: true, subtree: true };
    const observer = new MutationObserver(chat_mutation_handler);
    // And attach our mutation handler for subtree updates
    observer.observe(chat_element, config);
  }
}

/**
 * @type {Map<string, {count: number, expiry: Date, node: Node}>}
 */
const message_map = new Map();
const MAP_ENTRY_MAX_AGE = 30 * 1000;
const RESET_SIZE = 50;
setInterval(manage_map_expiries, 1000);

init();
