# MCP Browser Setup for Cursor IDE

## Chrome DevTools MCP (installed)

The **Chrome DevTools MCP** server is added to your Cursor MCP config so you can control a real Chrome browser from the IDE (navigate, click, take screenshots, run Google login flow, etc.).

### Config location

- **User MCP config:** `%USERPROFILE%\.cursor\mcp.json`
- Entry added: `"chrome-devtools"` with `npx -y chrome-devtools-mcp@latest --no-usage-statistics`

### Load the server in Cursor

1. **Reload MCP servers** so Cursor picks up the new `chrome-devtools` server:
   - Open **Cursor Settings** (Ctrl+, or File → Preferences).
   - Go to **MCP** (or search for "MCP").
   - Click **Reload** or **Restart MCP** if available.
   - Or **restart Cursor IDE** to load all MCP servers from `mcp.json`.

2. After reload, you should see **chrome-devtools** in the list of MCP servers. You can then ask the AI to:
   - "Open http://localhost:3000/login in the browser"
   - "Take a snapshot of the login page"
   - "Click the Google sign-in button"

### Requirements

- **Node.js** v20.19+
- **Chrome** (current stable) installed
- **npm** (for `npx`)

First use may run `npx -y chrome-devtools-mcp@latest`, which can take a moment to download.

### Google OAuth note

The MCP can open the login page and click "Continue with Google". The actual Google sign-in (account choice, password, consent) must be completed by you in the browser window that Chrome DevTools MCP opens. That window is a real Chrome instance you can interact with.

### If Chrome DevTools MCP fails

- Ensure **Chrome** is installed and no other tool is using remote debugging on the same port.
- On Windows, if the server does not start, try increasing the startup timeout in Cursor MCP settings or run Chrome manually with remote debugging and use `--browser-url=http://127.0.0.1:9222` in the MCP args (see [Chrome DevTools MCP docs](https://github.com/ChromeDevTools/chrome-devtools-mcp)).
