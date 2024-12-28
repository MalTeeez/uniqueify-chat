## ![img](https://raw.githubusercontent.com/MalTeeez/uniqueify-chat/9814f96ed475ecc77341adec34cc0acd2a76753c/static/chat-48.png) uniqueify-chat

An extension to deduplicate duplicate messages in twitch chat, to combat spam and make it more readable.

### build
To build the extension, install the provided packages and build with the svelte adapter. With pnpm that would be as simple as:
```
pnpm install
pnpm build
``` 
The built extension will be in the `./build` directory.

You can also use the provided build script (`scripts/build.sh`), which has been tested with: 
```
debian 12
node v20.18.1
npm  10.8.2
pnpm 9.15.1
```

The extension is built with svelte (so with vite), via a modified version of the static adapter, that externalizes inline scripts to comply with v3.

### permissions
The extension needs the "activeTab" (for `*://*.twitch.tv/*`) to modify the twitch page with its annotations and the "storage" permission to make user decisions persistent.