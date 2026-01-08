# MCP Server Configuration Guide

This guide explains how to set up MCP (Model Context Protocol) servers for Browser and Memory capabilities in Cursor IDE.

## Configuration Files

- `mcp-config.json` - MCP server configuration file

## Setup Instructions

### Option 1: Configure in Cursor IDE Settings (Recommended)

1. Open Cursor IDE
2. Go to Settings (Ctrl+,)
3. Search for "MCP" or "Model Context Protocol"
4. Open the MCP settings
5. Add the following configuration:

```json
{
  "mcpServers": {
    "browser": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-puppeteer"
      ],
      "env": {}
    },
    "memory": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ],
      "env": {
        "MEMORY_STORE_PATH": "./.mcp-memory"
      }
    }
  }
}
```

### Option 2: Manual Configuration File

If Cursor supports project-specific MCP configuration:

1. Copy the contents of `mcp-config.json`
2. Add it to your Cursor MCP settings file (typically located at):
   - Windows: `%APPDATA%\Cursor\User\settings.json` or MCP-specific settings
   - macOS: `~/Library/Application Support/Cursor/User/settings.json`
   - Linux: `~/.config/Cursor/User/settings.json`

### Option 3: Docker Services (Alternative)

If you prefer to run MCP servers as Docker containers, you can add the following to your `docker-compose.yml`:

```yaml
services:
  playwright-mcp:
    image: mcp/playwright:latest
    container_name: playwright_mcp
    ports:
      - "3002:3002"
    networks:
      - erp
    restart: unless-stopped

  memory-mcp:
    image: mcp/memory:latest
    container_name: memory_mcp
    ports:
      - "3003:3003"
    volumes:
      - mcp_memory_data:/data
    networks:
      - erp
    restart: unless-stopped

volumes:
  mcp_memory_data:
```

## MCP Servers Included

### 1. Browser MCP Server (`@modelcontextprotocol/server-puppeteer`)
- Provides browser automation capabilities
- Allows web scraping, navigation, and interaction
- Uses Puppeteer for headless browser control

### 2. Memory MCP Server (`@modelcontextprotocol/server-memory`)
- Provides memory management and storage capabilities
- Stores and retrieves context information
- Memory data is stored in `.mcp-memory` directory (can be customized)

## Usage

After configuration, restart Cursor IDE to activate the MCP servers. The servers will be available through Cursor's AI features and can be used to:

- **Browser MCP**: Automate web browsing, extract content, take screenshots, interact with web pages
- **Memory MCP**: Store and retrieve information, maintain context across conversations, manage knowledge base

## Troubleshooting

1. **Servers not starting**: Ensure Node.js and npm are installed
2. **Permission errors**: Check write permissions for the `.mcp-memory` directory
3. **Port conflicts**: If using Docker, ensure ports 3002 and 3003 are not in use
4. **Configuration not recognized**: Restart Cursor IDE after updating configuration

## Notes

- The `.mcp-memory` directory is automatically created when the memory server starts
- This directory is excluded from version control via `.cursorignore`
- MCP servers run as separate processes managed by Cursor IDE

