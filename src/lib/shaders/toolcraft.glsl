/*
A study of tools in motion. Simple wireframe forms
trace the essential shapes of familiar tools,
celebrating their utility through movement.

This shader creates a retro-styled visualization of crafting tools in motion.
It represents the dynamic nature of toolcraft through wireframe renderings
of tools (wrench, hammer) that rotate and interact in space. The design
emphasizes the technical, precise nature of tools while maintaining a
nostalgic CRT aesthetic.

Key elements:
- Wireframe tools: Clean, technical representations
- Rotating motion: Tools in active use
- Glow effects: Energy and activity
- CRT styling: Technical, retro aesthetic
- Minimal color palette: Clarity and focus on form
*/

#define SIZE .003

// Color palette
const vec3 cyan = vec3(0.0, 1.0, 1.0);
const vec3 blue = vec3(0.0, 0.3, 1.0);
const vec3 white = vec3(1.0);
const vec3 orange = vec3(1.0, 0.4, 0.125);
const vec3 terminal_green = vec3(0.0, 0.8, 0.2) * 0.4; // Subtle terminal green

// UI Constants
const float CORNER_SIZE = 0.1;
const float EDGE_MARKER_SIZE = 0.01; // Smaller markers
const float UI_LINE_THICKNESS = 0.002;
const float CHAR_SIZE = 0.04;
const float CHAR_THICKNESS = 0.003;
const float UI_MARGIN = 0.08;  // Margin from edges

// Utility functions for line drawing
float distLine(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float t = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * t);
}

float lineMask(vec2 uv, vec2 a, vec2 b) {
    float d = distLine(uv, a, b);
    float thickness = SIZE;
    return smoothstep(thickness, 0.125 * thickness, d);
}

vec3 glowLine(vec2 uv, vec2 a, vec2 b, vec3 rgbGlow) {
    float m = lineMask(uv, a, b);
    float dist = distLine(uv, a, b);
    float brightness = SIZE / pow(0.085 + 2.0 * dist, 2.0);
    vec3 color = m * vec3(0.7);
    color += rgbGlow * brightness;
    return color;
}

// Rotation matrix
mat2 rot(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

// Draw a wrench wireframe
vec3 drawWrench(vec2 uv, vec2 center, float size, float rotation) {
    vec3 result = vec3(0.0);
    uv = uv - center;
    uv = rot(rotation) * uv;
    uv = uv / size;
    
    // Handle
    result += glowLine(uv, vec2(0.0, 0.0), vec2(0.0, -1.0), cyan);
    
    // Head
    result += glowLine(uv, vec2(-0.3, 0.0), vec2(0.3, 0.0), blue);
    result += glowLine(uv, vec2(-0.3, 0.0), vec2(-0.3, -0.2), orange);
    result += glowLine(uv, vec2(0.3, 0.0), vec2(0.3, -0.2), orange);
    
    return result;
}

// Draw a hammer wireframe
vec3 drawHammer(vec2 uv, vec2 center, float size, float rotation) {
    vec3 result = vec3(0.0);
    uv = uv - center;
    uv = rot(rotation) * uv;
    uv = uv / size;
    
    // Handle
    result += glowLine(uv, vec2(0.0, 0.0), vec2(0.0, -1.0), blue);
    
    // Head
    result += glowLine(uv, vec2(-0.4, 0.0), vec2(0.2, 0.0), cyan);
    result += glowLine(uv, vec2(-0.4, 0.0), vec2(-0.4, -0.2), orange);
    result += glowLine(uv, vec2(0.2, 0.0), vec2(0.2, -0.2), orange);
    
    return result;
}

// Draw corner bracket UI element
vec3 drawCornerBracket(vec2 uv, vec2 pos, float size, vec3 color) {
    vec3 result = vec3(0.0);
    vec2 absUV = abs(uv - pos);
    
    if (absUV.x < size && absUV.y < UI_LINE_THICKNESS ||
        absUV.x < UI_LINE_THICKNESS && absUV.y < size) {
        float glow = 1.0 / (1.0 + length(absUV) * 30.0);
        result = color * (1.0 + glow * 2.0);
    }
    return result;
}

// Draw edge measurement markers
vec3 drawEdgeMarkers(vec2 uv, float time) {
    vec3 result = vec3(0.0);
    const int NUM_MARKERS = 19; // (-0.9 to 0.9 with 0.1 spacing = 19 markers)
    
    // Vertical markers on left and right edges
    for (int i = 0; i < NUM_MARKERS; i++) {
        float y = -0.9 + (float(i) * 0.1);
        float markerAnim = sin(y * 10.0 + time * 2.0) * 0.3 + 0.7; // Subtler animation
        vec2 markerSize = vec2(EDGE_MARKER_SIZE * markerAnim, UI_LINE_THICKNESS);
        
        // Left edge
        if (abs(uv.x + 0.95) < markerSize.x && abs(uv.y - y) < markerSize.y) {
            result += terminal_green * (1.0 - length(uv + vec2(0.95, -y)) * 0.5);
        }
        
        // Right edge
        if (abs(uv.x - 0.95) < markerSize.x && abs(uv.y - y) < markerSize.y) {
            result += terminal_green * (1.0 - length(uv - vec2(0.95, y)) * 0.5);
        }
    }
    
    // Horizontal markers on top and bottom edges
    for (int i = 0; i < NUM_MARKERS; i++) {
        float x = -0.9 + (float(i) * 0.1);
        float markerAnim = sin(x * 10.0 + time * 2.0) * 0.3 + 0.7; // Subtler animation
        vec2 markerSize = vec2(UI_LINE_THICKNESS, EDGE_MARKER_SIZE * markerAnim);
        
        // Top edge
        if (abs(uv.y - 0.95) < markerSize.y && abs(uv.x - x) < markerSize.x) {
            result += terminal_green * (1.0 - length(uv - vec2(x, 0.95)) * 0.5);
        }
        
        // Bottom edge
        if (abs(uv.y + 0.95) < markerSize.y && abs(uv.x - x) < markerSize.x) {
            result += terminal_green * (1.0 - length(uv - vec2(x, -0.95)) * 0.5);
        }
    }
    
    return result;
}

// Draw scanning line effect
vec3 drawScanLine(vec2 uv, float time) {
    float scanPos = mod(time * 0.2, 2.0) - 1.0;  // Even slower movement
    float scanWidth = 0.03;  // Much wider scan line
    float scanGlow = exp(-pow(abs(uv.y - scanPos) / scanWidth, 2.0));
    return terminal_green * scanGlow * 0.08;  // Very subtle intensity with terminal green
}

// Monospace font drawing functions
vec3 drawChar(vec2 uv, vec2 pos, float char, vec3 color) {
    vec3 result = vec3(0.0);
    uv = uv - pos;
    uv /= CHAR_SIZE;
    
    // Define character segments
    if (char == 48.0) { // 0
        result += glowLine(uv, vec2(-0.3, 0.5), vec2(0.3, 0.5), color);
        result += glowLine(uv, vec2(-0.3, -0.5), vec2(0.3, -0.5), color);
        result += glowLine(uv, vec2(-0.3, 0.5), vec2(-0.3, -0.5), color);
        result += glowLine(uv, vec2(0.3, 0.5), vec2(0.3, -0.5), color);
    } else if (char == 49.0) { // 1
        result += glowLine(uv, vec2(0.0, 0.5), vec2(0.0, -0.5), color);
        result += glowLine(uv, vec2(-0.2, 0.3), vec2(0.0, 0.5), color);
    } else if (char == 50.0) { // 2
        result += glowLine(uv, vec2(-0.3, 0.5), vec2(0.3, 0.5), color);
        result += glowLine(uv, vec2(0.3, 0.5), vec2(0.3, 0.0), color);
        result += glowLine(uv, vec2(0.3, 0.0), vec2(-0.3, 0.0), color);
        result += glowLine(uv, vec2(-0.3, 0.0), vec2(-0.3, -0.5), color);
        result += glowLine(uv, vec2(-0.3, -0.5), vec2(0.3, -0.5), color);
    } else if (char == 58.0) { // :
        result += glowLine(uv, vec2(0.0, 0.2), vec2(0.0, 0.21), color);
        result += glowLine(uv, vec2(0.0, -0.2), vec2(0.0, -0.21), color);
    }
    return result;
}

vec3 drawText(vec2 uv, vec2 pos, vec3 color) {
    vec3 result = vec3(0.0);
    float spacing = CHAR_SIZE * 1.5;
    
    // Draw frame counter
    float frameNum = mod(floor(iTime * 10.0), 100.0);
    float tens = floor(frameNum / 10.0);
    float ones = mod(frameNum, 10.0);
    
    result += drawChar(uv, pos + vec2(0.0, 0.0), 48.0 + tens, color);
    result += drawChar(uv, pos + vec2(spacing, 0.0), 48.0 + ones, color);
    
    return result;
}

// Draw technical readout
vec3 drawReadout(vec2 uv, vec2 pos, float value, vec3 color) {
    vec3 result = vec3(0.0);
    float spacing = CHAR_SIZE * 1.5;
    
    // Format: XX:YY
    float whole = floor(value);
    float fract = fract(value) * 100.0;
    
    result += drawChar(uv, pos, 48.0 + floor(whole / 10.0), color);
    result += drawChar(uv, pos + vec2(spacing, 0.0), 48.0 + mod(whole, 10.0), color);
    result += drawChar(uv, pos + vec2(spacing * 2.0, 0.0), 58.0, color); // :
    result += drawChar(uv, pos + vec2(spacing * 3.0, 0.0), 48.0 + floor(fract / 10.0), color);
    result += drawChar(uv, pos + vec2(spacing * 4.0, 0.0), 48.0 + mod(fract, 10.0), color);
    
    return result;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalize and adjust coordinates
    vec2 uv = (fragCoord/iResolution.xy) * 2.0 - 1.0;
    float aspectRatio = iResolution.x/iResolution.y;
    
    // Store original coordinates for UI, with proper aspect ratio
    vec2 originalUV = uv;
    originalUV.x *= aspectRatio;
    
    // Apply aspect ratio to main view
    uv.x *= aspectRatio;
    
    // Calculate UI boundaries with proper aspect ratio
    vec2 uiBounds = vec2(aspectRatio - UI_MARGIN, 1.0 - UI_MARGIN);
    
    // Add CRT distortion
    uv *= 1.0 + 0.4 * length(uv);
    uv.x += 0.0035 * cos(40.0 * uv.y + 2.0 * iTime);
    
    // Initialize color
    vec3 color = vec3(0.0);
    
    // Time variables
    float t = iTime * 0.5;
    
    // Draw tools
    const int NUM_TOOLS = 3;
    for (int i = 0; i < NUM_TOOLS; i++) {
        float angle = float(i) * 6.28318 / float(NUM_TOOLS) + t;
        vec2 pos = vec2(cos(angle), sin(angle)) * 0.3;
        
        if (i == 0) {
            color += drawWrench(uv, pos, 0.15, angle + t);
        } else if (i == 1) {
            color += drawHammer(uv, pos, 0.15, -angle + t * 0.7);
        } else {
            color += drawWrench(uv, pos, 0.15, angle - t);
        }
    }
    
    // Add UI elements using original (undistorted) coordinates
    // Corner brackets - now using proper aspect ratio
    color += drawCornerBracket(originalUV, vec2(-uiBounds.x, -uiBounds.y), CORNER_SIZE, orange);
    color += drawCornerBracket(originalUV, vec2(uiBounds.x, -uiBounds.y), CORNER_SIZE, orange);
    color += drawCornerBracket(originalUV, vec2(-uiBounds.x, uiBounds.y), CORNER_SIZE, orange);
    color += drawCornerBracket(originalUV, vec2(uiBounds.x, uiBounds.y), CORNER_SIZE, orange);
    
    // Modify edge markers function call to use proper aspect ratio
    vec2 edgeUV = originalUV;
    edgeUV.x /= aspectRatio; // Normalize for edge markers
    color += drawEdgeMarkers(edgeUV, iTime);
    color += drawScanLine(edgeUV, iTime);
    
    // Add text displays - positioned relative to UI bounds with proper aspect ratio
    color += drawText(originalUV, vec2(-uiBounds.x + UI_MARGIN, uiBounds.y - UI_MARGIN * 0.5), cyan);
    color += drawReadout(originalUV, vec2(uiBounds.x - UI_MARGIN * 2.5, uiBounds.y - UI_MARGIN * 0.5), iTime, orange);
    color += drawReadout(originalUV, vec2(-uiBounds.x + UI_MARGIN, -uiBounds.y + UI_MARGIN * 0.5), length(uv) * 10.0, blue);
    
    // Add scanlines
    color *= 0.8 + 0.2 * sin(fragCoord.y * 0.5);
    
    // Add subtle vignette
    float vignette = 1.0 - 0.3 * length(originalUV / vec2(aspectRatio, 1.0));
    color *= vignette;
    
    // Tone mapping and gamma correction
    color = color / (1.0 + color);
    color = sqrt(color);
    
    fragColor = vec4(color, 1.0);
}
