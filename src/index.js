// @ts-check

function initRuntimeListener() {
  // @ts-ignore
  browser.runtime.onMessage.addListener((request) => {
    console.log("Message from the background script:");
    console.log(request.greeting);
    return Promise.resolve({ response: "Hi from content script" });
  });
}

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
 * Extract a string only message from a chat flex node containing (optionally) emotes and text
 * @param {Node} node The chat message flex node
 * @returns {string | undefined}
 */
function extract_deep_message(node) {
  const emote_parent_node = extract_content_node(node);
  let emote_type_string = "";
  for (const childNode of emote_parent_node.childNodes) {
    // @ts-ignore
    // Is this an emote
    if (childNode.className == "chat-line__message--emote-button") {
      // @ts-ignore
      emote_type_string += childNode.childNodes[0].childNodes[0].childNodes[0].childNodes[0].alt;
      // @ts-ignore
    } else if (
      // @ts-ignore
      // Is this a normal text fragment
      (childNode.className == "text-fragment" ||
        // @ts-ignore
        // Does this node have multiple classes
        (childNode.classList &&
          // @ts-ignore
          // Is this a link
          (childNode.classList.contains("link-fragment") ||
            // @ts-ignore
            // Is this a mention (@user)
            childNode.classList.contains("mention-fragment")))) &&
      // Does it actually have text
      childNode.textContent &&
      // Is that text not just an emote spacer
      childNode.textContent != " "
    ) {
      // Looks like a good node!
      emote_type_string += childNode.textContent;
    } else {
      // Twitch creates 50 empty nodes on first load, and populates them later asychronically with messages
      // So ignore those early nodes, which apparently always contain ": " at load
      if (childNode.textContent === ": ") {
        return undefined
      }
      // Dont need to care about the emote spacer nodes
      if (childNode.textContent != " ") {
        // Looks like a bad node
        // @ts-ignore
        console.warn("Failed to identify node! \"" + childNode.textContent + "\"");
      }
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
 * Extract the flex node from a top level message node
 * @param {Node} node
 */
function extract_flex_node(node) {
  return node.childNodes[0].childNodes[1].childNodes[1].childNodes[0];
}

/**
 * Handler for chat messages, of type NEWEST
 * @param {Node} top_node
 * @param {Node} flex_node
 * @param {string} message The actual text message content
 */
function chat_message_handler_newest(top_node, flex_node, message) {
  // Check if we already had this message before (in our frame)
  const cached_message = message_map.get(message);
  // Enter this message into map, or increase its counter if its repeated
  if (cached_message) {
    const current_count = cached_message.count + 1;
    // Attach our message counter to the newest (this) message node
    attach_message_counter(flex_node, current_count);
    // Hide the older duplicate message
    hide_node(cached_message.node);
    // And sync the increased counter, new last-timestamp and the newest node into our cache
    message_map.set(message, {
      count: current_count,
      expiry: new Date(Date.now()),
      node: top_node,
    });
  } else {
    // The message is new, track it for a while in our cache
    message_map.set(message, {
      count: 1,
      expiry: new Date(Date.now()),
      node: top_node,
    });
  }
}

/**
 * Handler for chat messages, of type NEWEST
 * @param {Node} top_node
 * @param {Node} flex_node
 * @param {string} message The actual text message content
 */
function chat_message_handler_global(top_node, flex_node, message) {
  // Check if we already had this message before (in our frame)
  const cached_message = message_map.get(message);
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
    hide_node(top_node);
    // And sync the increased counter, new last-timestamp into our cache
    message_map.set(message, {
      count: current_count,
      expiry: new Date(Date.now()),
      node: cached_message.node,
    });
  } else {
    // The message is new, track it for a while in our cache
    message_map.set(message, {
      count: 1,
      expiry: new Date(Date.now()),
      node: flex_node,
    });
  }
}

/**
 * Handler for chat messages, of type STREAK
 * @param {Node} top_node
 * @param {Node} flex_node
 * @param {string} message The actual text message content
 */
function chat_message_handler_streak(top_node, flex_node, message) {
  if (latest_message) {
    // Is this a duplicate of the last message
    if (latest_message == message) {
      duplicate_counter++;
      if (duplicate_counter < 2) {
        // Attach a counter to the oldest flex node
        attach_message_counter(prev_node, duplicate_counter);
      } else {
        // Update the oldest flex nodes counter
        update_message_counter(prev_node, duplicate_counter);
      }
      // Hide this new duplicate message
      hide_node(top_node);
    } else {
      // Reset our duplicate state
      duplicate_counter = 0;
      latest_message = message;
      prev_node = flex_node;
    }
  } else {
    // Start to save our previous message
    duplicate_counter = 0;
    latest_message = message;
    prev_node = flex_node;
  }
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
      console.log(mutation.addedNodes)
      if (
        mutation.addedNodes.length > 0 &&
        mutation.addedNodes[0] &&
        // @ts-ignore
        mutation.addedNodes[0].childNodes[0].className == "chat-line__message"
      ) {
        const node = mutation.addedNodes[0].childNodes[0];
        const flex_node = extract_flex_node(node);
        // Get the messages actual text from the lowest node containing only that
        let message_text = extract_deep_message(flex_node);
        if (message_text) {
          // Cut off the message, if its longer than 100 chars, to counter small additions (that change nothing about the actual content)
          if (message_text.length > 99) message_text = message_text.substring(0, 100);
          // Send off the message to the selected handler
          message_handler(node, flex_node, message_text);
        }
      }
    }
  }
}

/**
 * @param type {"NEWEST" | "GLOBAL" | "STREAK"}
 */
function get_message_handler(type) {
  switch (type) {
    case "GLOBAL":
      return chat_message_handler_global;
    case "NEWEST":
      return chat_message_handler_newest;
    case "STREAK":
      return chat_message_handler_streak;
    default:
      return chat_message_handler_global;
  }
}

function init() {
  // Get the chat container that contains all messages (lowest), and thereby mutates on updates
  const chat_element = document.getElementsByClassName("chat-scrollable-area__message-container").item(0);

  if (chat_element) {
    // Insert our css rules
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
        right: 0px;
        position: absolute;
      }
    `,
      sheet.cssRules.length
    );

    // Update the cache every second
    if (HANDLER_TYPE === "GLOBAL" || HANDLER_TYPE === "NEWEST") setInterval(manage_map_expiries, 1000);

    const config = { attributes: false, childList: true, subtree: true };
    observer = new MutationObserver(chat_mutation_handler);
    message_handler = get_message_handler(HANDLER_TYPE);

    // And attach our mutation handler for subtree updates
    console.info("[Uniqueify-Chat]: Attaching mutation handler to twitch chat window with mode " + HANDLER_TYPE + ".");
    observer.observe(chat_element, config);
  }
}

/**
 * @type {MutationObserver}
 */
let observer;
/**
 * @type {"NEWEST" | "GLOBAL" | "STREAK"}
 * @description The way to handle deduplicating chat messages:
 * - NEWEST = Deduplicate all messages, but only show the newest one, for each indidual message type (as in: new duplicate message comes, old message disappears)
 * - GLOBAL (default) = Deduplicate all messages, only keep oldest one
 * - STREAK = Only deduplicate messages that appear in a "streak", so messages that dont get interrupted by different messages
 *
 */
const HANDLER_TYPE = "GLOBAL";
let message_handler;


// for type GLOBAL, NEWEST
/**
 * @type {Map<string, {count: number, expiry: Date, node: Node}>}
 */
const message_map = new Map();
const MAP_ENTRY_MAX_AGE = 30 * 1000;
const RESET_SIZE = 50;
// for type STREAK
let latest_message;
let prev_node;
let duplicate_counter = 0;

// For live reloads
//if (observer) observer.disconnect()
initRuntimeListener();
init();
