#define G vec3(iResolution.xy,iTime)
#define SIZE 0.003

// Color palette for tech interface style
const vec3 deepBlue = vec3(0.0, 0.05, 0.1);
const vec3 brightBlue = vec3(0.3, 0.7, 1.0);
const vec3 accentBlue = vec3(0.1, 0.4, 0.8);
const vec3 glowBlue = vec3(0.0, 0.5, 1.0);
const vec3 white = vec3(1.0);

// Utility functions for drawing glowing lines
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

// Rotation function
mat2 rot(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

// Dot glow effect
vec3 glowDot(vec2 uv, vec2 pos, vec3 color, float size) {
    float dist = length(uv - pos);
    float brightness = size / pow(0.05 + dist, 2.0);
    return color * brightness;
}

// Draw a simple icosahedron projection
vec3 drawIcosahedron(vec2 uv, vec2 center, float scale, float rotation, vec3 color, float intensity) {
    vec3 result = vec3(0.0);
    
    // Rotate UV coordinates
    uv = uv - center;
    uv = rot(rotation) * uv;
    
    // Scale
    uv = uv / scale;
    
    // Define the 5 vertices of the top pentagon
    vec2 topPentagon[5];
    float pentAngle = 3.14159 * 2.0 / 5.0;
    for (int i = 0; i < 5; i++) {
        float angle = float(i) * pentAngle + rotation * 0.5;
        topPentagon[i] = vec2(cos(angle), sin(angle)) * 0.5;
    }
    
    // Define the 5 vertices of the bottom pentagon
    vec2 bottomPentagon[5];
    for (int i = 0; i < 5; i++) {
        float angle = float(i) * pentAngle + rotation * 0.5 + pentAngle / 2.0;
        bottomPentagon[i] = vec2(cos(angle), sin(angle)) * 0.5 * 0.8;
    }
    
    // Draw the top pentagon
    result += glowLine(uv, topPentagon[0], topPentagon[1], color) * intensity;
    result += glowLine(uv, topPentagon[1], topPentagon[2], color) * intensity;
    result += glowLine(uv, topPentagon[2], topPentagon[3], color) * intensity;
    result += glowLine(uv, topPentagon[3], topPentagon[4], color) * intensity;
    result += glowLine(uv, topPentagon[4], topPentagon[0], color) * intensity;
    
    // Draw the bottom pentagon
    result += glowLine(uv, bottomPentagon[0], bottomPentagon[1], color) * intensity;
    result += glowLine(uv, bottomPentagon[1], bottomPentagon[2], color) * intensity;
    result += glowLine(uv, bottomPentagon[2], bottomPentagon[3], color) * intensity;
    result += glowLine(uv, bottomPentagon[3], bottomPentagon[4], color) * intensity;
    result += glowLine(uv, bottomPentagon[4], bottomPentagon[0], color) * intensity;
    
    // Connect the pentagons
    result += glowLine(uv, topPentagon[0], bottomPentagon[0], color) * intensity;
    result += glowLine(uv, topPentagon[1], bottomPentagon[1], color) * intensity;
    result += glowLine(uv, topPentagon[2], bottomPentagon[2], color) * intensity;
    result += glowLine(uv, topPentagon[3], bottomPentagon[3], color) * intensity;
    result += glowLine(uv, topPentagon[4], bottomPentagon[4], color) * intensity;
    
    // Add diagonal connections for the icosahedron
    result += glowLine(uv, topPentagon[0], bottomPentagon[2], color) * intensity;
    result += glowLine(uv, topPentagon[1], bottomPentagon[3], color) * intensity;
    result += glowLine(uv, topPentagon[2], bottomPentagon[4], color) * intensity;
    result += glowLine(uv, topPentagon[3], bottomPentagon[0], color) * intensity;
    result += glowLine(uv, topPentagon[4], bottomPentagon[1], color) * intensity;
    
    // Add dots at vertices
    for (int i = 0; i < 5; i++) {
        result += glowDot(uv, topPentagon[i], white, SIZE * 2.0) * intensity * 0.5;
        result += glowDot(uv, bottomPentagon[i], white, SIZE * 2.0) * intensity * 0.5;
    }
    
    return result;
}

// Draw a focus ring around the center of intention
vec3 drawFocusRing(vec2 uv, vec2 center, float radius, float thickness, float t, vec3 color, float intensity) {
    vec3 result = vec3(0.0);
    
    // Distance from center
    float dist = length(uv - center);
    
    // Pulse effect
    float pulse = 0.1 * sin(t * 2.0);
    float glowRadius = radius + pulse;
    
    // Create a glowing ring
    float ringMask = smoothstep(thickness * 2.0, thickness * 0.5, abs(dist - glowRadius));
    result += color * ringMask * intensity;
    
    return result;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalize coordinates to [0, 1] range, centered at (0.5, 0.5)
    vec2 uv = (fragCoord/G.xy) - 0.5;
    float ratio = G.x/G.y;
    uv.x *= ratio; // Correct aspect ratio
    
    // Original uv for effects
    vec2 originalUv = uv;
    
    // Time variables
    float t = G.z * 0.4;
    float slowT = t * 0.2;
    
    // Start with black background
    vec3 color = vec3(0.0);
    
    // Create circular scan effect - more deliberate and focused for "intention"
    float circleRadius = 0.7;
    float circle = length(uv);
    float scan = smoothstep(circleRadius, circleRadius - 0.05, circle);
    float pulse = 0.5 + 0.5 * sin(slowT * 0.5 + circle * 5.0); // Slower, more intentional pulse
    color += vec3(0.0, 0.08, 0.15) * scan * pulse * 0.5; // Subtle blue scan
    
    // Radial grid lines for focus
    float radialLines = 0.0;
    float angle = atan(uv.y, uv.x);
    float numLines = 36.0; // More lines for finer detail
    radialLines = smoothstep(0.01, 0.0, abs(mod(angle + t * 0.1, 6.28318 / numLines) - (6.28318 / numLines * 0.5)));
    color += vec3(0.0, 0.1, 0.2) * radialLines * 0.1 * (1.0 - smoothstep(0.0, 0.7, circle));
    
    // Concentric circles
    float concentricCircles = 0.0;
    float numCircles = 8.0;
    concentricCircles = smoothstep(0.01, 0.0, abs(mod(circle * 10.0 + t * 0.2, 1.0) - 0.5));
    color += vec3(0.0, 0.1, 0.2) * concentricCircles * 0.1 * (1.0 - smoothstep(0.0, 0.7, circle));
    
    // Target-like crosshair in the center - represents focus of intention
    float crosshair = 0.0;
    crosshair += smoothstep(0.01, 0.0, abs(uv.x)) * (1.0 - smoothstep(0.0, 0.2, abs(uv.y)));
    crosshair += smoothstep(0.01, 0.0, abs(uv.y)) * (1.0 - smoothstep(0.0, 0.2, abs(uv.x)));
    color += vec3(0.1, 0.3, 0.6) * crosshair * 0.2;
    
    // Create a pulsating intensity - intentional, deliberate pulsing
    float intensity = 1.0 + 0.2 * sin(t * 0.7);
    
    // Add focus rings - these represent the layers of focus in intention
    color += drawFocusRing(uv, vec2(0.0, 0.0), 0.15, SIZE * 2.0, t * 0.7, accentBlue, 0.7 * intensity);
    color += drawFocusRing(uv, vec2(0.0, 0.0), 0.25, SIZE * 1.5, t * 0.5 + 0.5, glowBlue, 0.5 * intensity);
    color += drawFocusRing(uv, vec2(0.0, 0.0), 0.4, SIZE, t * 0.3 + 1.0, brightBlue, 0.3 * intensity);
    
    // Calculate icosahedron rotation - more purposeful and intentional
    float rotation = t * 0.2; // Slow, focused rotation
    
    // Add multiple rotating icosahedrons with different scales and rotations
    color += drawIcosahedron(uv, vec2(0.0, 0.0), 0.3, rotation, glowBlue, intensity);
    color += drawIcosahedron(uv, vec2(0.0, 0.0), 0.5, -rotation * 0.7, accentBlue, intensity * 0.7);
    color += drawIcosahedron(uv, vec2(0.0, 0.0), 0.8, rotation * 0.5, brightBlue, intensity * 0.4);
    
    // Add subtle glow in the center - the core of intention
    color += glowBlue * 0.2 * (0.7 + 0.3 * sin(t * 0.5)) * (1.0 - smoothstep(0.0, 0.15, circle));
    
    // Data visualization lines at the bottom - representing intention metrics
    float dataLine = 0.0;
    for (int i = 0; i < 5; i++) {
        float x = float(i) * 0.2 - 0.4;
        float height = 0.1 + 0.05 * sin(t * 0.3 + float(i) * 1.5);
        float lineWidth = 0.02;
        if (uv.x > x - lineWidth && uv.x < x + lineWidth && uv.y > -0.45 && uv.y < -0.45 + height) {
            dataLine += 1.0 - smoothstep(0.0, 0.01, min(abs(uv.x - x) - lineWidth, abs(uv.y - (-0.45 + height * 0.5)) - height * 0.5));
        }
    }
    color += vec3(0.1, 0.4, 0.8) * dataLine * 0.3;
    
    // CRT scanline effect - more subtle for intention
    float scanline = 0.9 + 0.1 * sin(fragCoord.y * 0.7);
    color *= scanline;
    
    // HDR tone mapping
    color = color / (1.0 + color);
    color = sqrt(color); // Gamma correction
    
    // Vignette effect - more focused for intention
    float vignette = 1.0 - 0.4 * pow(length(originalUv), 2.0);
    color *= vignette;
    
    fragColor = vec4(color, 1.0);
}
