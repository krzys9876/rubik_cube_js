#!/usr/bin/env python3
"""
MCP Server for running Rubik's Cube solver application.
Generates URLs with parameterized initial moves, optionally starts solving with given animation speed
"""

import logging
import urllib.parse
import webbrowser

from mcp.server.fastmcp import FastMCP
from typing import Optional

# ============================================================================
# CONFIGURATION SECTION - Modify these to customize your parameters
# ============================================================================

# Base URL of your application
BASE_URL = "http://localhost:8000/rubik.html"

# Parameter configurations
PARAMETERS = {
    "speed": {
        "description": "Animation speed factor. Controls how fast the cube animation runs. 1 is slow, 2 is moderate, "
                       "3 is fast, 4 is very fast and 5 turns off the animation",
        "type": "int",
        "min": 1,
        "max": 5,
        "default": None,
    },
    "moves": {
        "description": "A list of initial moves to be applied to the cube - maily for scrambling it with predefined sequence. "
                       "The standard notation accepts cube sides: F(ront), B(ack), R(ight), L(left), U(p), D(own). "
                       "Default is clockwise turn, adding apostrophe makes it counterclockwise, adding 2 doubles the move. "
                       "The example sequence is: D F R' 2U. The special code S is for random move, so S S S S means 4 random moves.",
        "type": "string",
        "max_length": 200,
        "default": "",
    },
    "solve": {
        "description": "Tells application if solving should start automatically",
        "type": "int",
        "min": 0,
        "max": 1,
        "default": None,
    },
}

# ============================================================================
# LOGGER SETUP
# ============================================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# MCP SERVER INITIALIZATION
# ============================================================================

mcp = FastMCP("Rubik Cube URL Generator")

# ============================================================================
# TOOL FUNCTIONS
# ============================================================================


@mcp.tool()
def generate_solver_url(
    speed: Optional[int] = None,
    moves: Optional[str] = "",
    solve: Optional[int] = None
) -> str:
    """
    Generate a URL for Rubik's Cube solver application with specified parameters.

    This tool creates a complete URL for launching web application
    with custom speed and initial moves. If parameters are not provided, defaults
    from the configuration are used.

    Args:
        solve: Should solving start immediately after application launch (0/1)
        moves: A sequence of initial moves to be applied to the cube
        speed: Animation speed factor (optional). See configuration for valid range.

    Returns:
        A complete URL string ready to use in a browser, including query parameters.

    Example:
        - generate_solver_url(speed=3, moves=D F R, solve=1)
        - generate_solver_url(speed=5)
        - generate_solver_url()  # Uses all defaults
    """

    params = {}

    # Handle speed parameter
    if speed is not None:
        speed_config = PARAMETERS["speed"]
        if not (speed_config["min"] <= speed <= speed_config["max"]):
            logger.warning(
                f"Speed {speed} is outside recommended range "
                f"[{speed_config['min']}, {speed_config['max']}]. "
                f"Proceeding anyway but may not work as expected."
            )
        params["speed"] = speed
    else:
        params["speed"] = PARAMETERS["speed"]["default"]

    # Handle zoom parameter
    if moves is not None:
        moves = urllib.parse.quote_plus(moves)
        params["moves"] = moves

    # Handle solve parameter
    if solve is not None:
        moves = urllib.parse.quote_plus(moves)
        params["moves"] = moves

    # Build query string
    query_parts = [f"{key}={value}" for key, value in params.items() if value is not None]
    query_string = "&".join(query_parts)

    # Construct full URL
    url = f"{BASE_URL}?{query_string}"

    logger.info(f"Generated URL: {url}")
    return url


@mcp.tool()
def get_parameter_info() -> str:
    """
    Get information about available Rubik's Cube solver application parameters.

    Returns:
        A formatted string describing all available parameters, their ranges,
        defaults, and descriptions. Useful for understanding what parameters
        can be configured.
    """

    info_lines = [
        "=== Rubik's Cube Solver Parameter Configuration ===\n",
        f"Base URL: {BASE_URL}\n",
    ]

    for param_name, param_config in PARAMETERS.items():
        info_lines.append(f"\n{param_name.upper()}:")
        info_lines.append(f"  Description: {param_config['description']}")
        if "type" in param_config:
            info_lines.append(f"  Data type: {param_config['type']}")

        # Display range for numeric parameters
        if "min" in param_config and "max" in param_config:
            info_lines.append(f"  Valid Range: {param_config['min']} to {param_config['max']}")

            if param_config["type"] == "string" and "max_length" in param_config:
                info_lines.append(f"  Max Length: {param_config['max_length']} characters")

        info_lines.append(f"  Default Value: {param_config['default']}")

    info_lines.append("\n" + "=" * 40)

    return "".join(info_lines)


@mcp.tool()
def validate_parameters(speed: Optional[int] = None,
                        moves: Optional[str] = "",
                        solve: Optional[int] = None) -> str:
    """
    Validate if the given parameters are within acceptable ranges.

    Args:
        solve: Values 0 or 1 to validate
        moves: Initial moves sequence to validate
        speed: Speed parameter to validate

    Returns:
        A validation report indicating if parameters are valid, with warnings
        for out-of-range values.
    """

    report = []
    all_valid = True

    if speed is not None:
        speed_config = PARAMETERS["speed"]
        if speed_config["min"] <= speed <= speed_config["max"]:
            report.append(f"✓ Speed {speed} is valid (range: {speed_config['min']}-{speed_config['max']})")
        else:
            report.append(
                f"✗ Speed {speed} is OUT OF RANGE (valid: {speed_config['min']}-{speed_config['max']})"
            )
            all_valid = False

    if moves is not None:
        moves_config = PARAMETERS["moves"]
        if len(moves) <= moves_config["max_length"]:
            report.append(f"✓ Moves {moves} is valid (max length: {moves_config['max_length']})")
        else:
            report.append(
                f"✗ Moves {moves} is TOO LONG (max length: {moves_config['max_length']}, actual: {len(moves)})"
            )
            all_valid = False

    if solve is not None:
        solve_config = PARAMETERS["solve"]
        if solve_config["min"] <= solve <= solve_config["max"]:
            report.append(f"✓ Solve {solve} is valid")
        else:
            report.append(
                f"✗ Solve {solve} is NOT VALID (only {solve_config['min']} and {solve_config['max']} are valid)"
            )
            all_valid = False

    if not speed:
        report.append("ℹ Speed not provided, will use default")
    if moves:
        report.append("ℹ Moves not provided, will use default")
    if solve:
        report.append("ℹ Solve not provided, will use default")

    report.append("\n" + ("All parameters valid!" if all_valid else "Some parameters invalid!"))

    return "\n".join(report)


@mcp.tool()
def open_browser(url: str) -> str:
    """
    Open a specified URL in the default browser.

    This is a utility tool to launch a URL for the Rubik's cCube solver application in your default browser. Use this
    when you have a URL and just want to open it without generating a new one.

    Args:
        url: The complete URL to open in the browser. Must start with application base URL

    Returns:
        A confirmation message indicating success or failure.

    Example:
        - open_browser(url="http://localhost:8081?speed=2.0&moves=S%20S&solve=True")
        - open_browser(url="http://localhost:8081")
    """

    # Validate URL format
    if not url.startswith(BASE_URL):
        return f"✗ Invalid URL. Must start with {BASE_URL}\n\nProvided: {url}"

    try:
        webbrowser.open(url)
        logger.info(f"Opened browser with URL: {url}")
        return f"✓ Browser opened with URL:\n{url}"
    except Exception as e:
        logger.error(f"Failed to open browser: {str(e)}")
        return f"✗ Failed to open browser. Error: {str(e)}\n\nURL: {url}"

# ============================================================================
# SERVER INITIALIZATION AND RUN
# ============================================================================


def main():
    """Initialize and run the MCP server."""
    logger.info("Starting Rubik's Cube URL Generator and launcher MCP Server...")
    logger.info(f"Base URL configured as: {BASE_URL}")
    logger.info(f"Available parameters: {', '.join(PARAMETERS.keys())}")

    try:
        mcp.run(transport="stdio")
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        raise


if __name__ == "__main__":
    main()
