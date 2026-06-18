"""MCP Server stub - fastmcp is disabled for now.

To re-enable, add 'fastmcp' to requirements.txt and implement tool functions here.
"""

import logging
from fastapi import FastAPI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nexus-mcp")

# Minimal stub FastMCP class that provides required methods
class FastMCP:
    def __init__(self, *args, **kwargs):
        self._tools = {}

    def tool(self):
        """Decorator stub for MCP tools."""
        def decorator(fn):
            self._tools[fn.__name__] = fn
            return fn
        return decorator

    def sse_app(self):
        """Return a minimal ASGI app placeholder."""
        app = FastAPI(title="MCP Stub")
        @app.get("/health")
        async def _health():
            return {"status": "mcp_disabled"}
        return app

# Initialize MCP stub
mcp = FastMCP("Nexus Enterprise")

if __name__ == "__main__":
    logger.info("MCP stub mode - use app.main:app to run the FastAPI server")
