// @ts-check

// This function will check if a given message contains less than 4 unique words, is fully in uppercase, or contains repeated substrings of length 4 or more characters, or repeated sequences of 3 or more words
function shouldHideMessage(message) {
  // Count the number of uppercase letters in the message
  const uppercaseLetters = message.match(/[A-Z]/g) || [];
  const numUppercaseLetters = uppercaseLetters.length;

  if (numUppercaseLetters > 5) {
    return true;
  }

  // Check if the message has fewer than 5 unique words
  const words = message.split(/\s+/);
  const uniqueWords = new Set(words);

  if (uniqueWords.size < 5) {
    return true;
  }

  // Check if the message contains repeated substrings of length 4 or more characters
  for (let i = 0; i < message.length - 7; i++) {
    const substring = message.substring(i, i + 4);
    const remaining = message.substring(i + 4);

    if (remaining.includes(substring)) {
      const nextIndex = remaining.indexOf(substring) + 4;
      const nextSubstring = remaining.substring(nextIndex, nextIndex + 4);

      if (nextSubstring === substring) {
        return true;
      }
    }
  }

  // Check if the message contains repeated sequences of 3 or more words
  const wordsArr = message.toLowerCase().split(/\W+/);
  for (let i = 0; i < wordsArr.length - 2; i++) {
    const wordSequence = wordsArr.slice(i, i + 3);
    const remainingWords = wordsArr.slice(i + 3);

    if (remainingWords.join(" ").includes(wordSequence.join(" "))) {
      return true;
    }
  }

  // If none of the conditions are true, return false
  return false;
}

function manage_map_expiries() {
  let to_delete_map = [];
  for (const [message, value] of message_map) {
    // Is entry older than
    if (Date.now() - value.expiry.valueOf() > MAP_ENTRY_MAX_AGE || !value.node) {
      to_delete_map.push(message);
      console.log('Message "' + message + '" last updated at ', value.expiry, " is getting deleted");
    }
  }
  for (const key of to_delete_map) {
    message_map.delete(key);
  }
}

/**
 * @type {Map<string, {count: number, expiry: Date, node: Node}>}
 */
const message_map = new Map();
const MAP_ENTRY_MAX_AGE = 30 * 1000;
setTimeout(manage_map_expiries, 1000);

/**
 * Update the message counter indicator on a node to the new amount of messages
 * @param {Node} node
 * @param {number} msg_count
 */
function update_message_counter(node, msg_count) {
    if (node.lastChild) {
        node.lastChild.textContent = msg_count.toString()
    }
}


/**
 * Attach a message counter indicator for repeated messages to chat messages
 * @param {Node} node
 */
function attach_message_counter(node, msg_count) {
    const counter = document.createElement("div");
    counter.innerHTML = msg_count.toString()
    node.appendChild(counter)
    //console.log("Appended child to ", node, " with counter " + msg_count)
}

/**
 * Hide a node element
 * @param {Node} node 
 */
function hide_node(node) {
    // @ts-ignore
    node.style.display = "none";
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
        //console.log(node);

        const message_text =
          node.childNodes[0].childNodes[1].childNodes[1].childNodes[0].childNodes[0].childNodes[2].textContent;
        if (message_text) {
          // Enter this message into map, or increase its count if its repeated
          const cached_message = message_map.get(message_text);
          if (cached_message) {
            const current_count = cached_message.count + 1;
            message_map.set(message_text, {
              count: current_count,
              expiry: new Date(Date.now()),
              node: cached_message.node,
            });
            // Is this the first duplicate?
            if (current_count < 3) {
                console.log("Message \"", message_text, "\" is duplicate, attaching counter with start " + current_count)
                attach_message_counter(node, current_count)
            } else {
                console.log("Message \"", message_text, "\" is duplicate again, updating counter to " + current_count)
                // Update first message, delete the duplicate one
                update_message_counter(cached_message.node, current_count)
                hide_node(node)
            }
          } else {
            message_map.set(message_text, {
              count: 1,
              expiry: new Date(Date.now()),
              node: node,
            });
          }
          //console.log("cleared message with text: ", message_text);
        }
      }
    }
  }
}

const chat_element = document.getElementsByClassName("chat-scrollable-area__message-container").item(0);

if (chat_element) {
  const config = { attributes: false, childList: true, subtree: true };
  const observer = new MutationObserver(chat_mutation_handler);
  observer.observe(chat_element, config);
}
