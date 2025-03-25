#define G vec3(iResolution.xy,iTime)
#define SIZE 0.003

// Color palette for tech interface
const vec3 deepBlue = vec3(0.0, 0.05, 0.1);
const vec3 brightBlue = vec3(0.3, 0.7, 1.0);
const vec3 accentBlue = vec3(0.1, 0.4, 0.8);
const vec3 glowBlue = vec3(0.0, 0.5, 1.0);
const vec3 white = vec3(1.0);

// Utility functions
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

// Draw a basic gear
vec3 drawGear(vec2 uv, vec2 center, float radius, float teethHeight, 
             int numTeeth, float rotation, vec3 color, float intensity) {
    vec3 result = vec3(0.0);
    
    // Rotate and translate
    uv = uv - center;
    uv = rot(rotation) * uv;
    
    // Distance from center
    float dist = length(uv);
    
    // Angle from center
    float angle = atan(uv.y, uv.x);
    
    // Create teeth pattern
    float teethPattern = 0.5 + 0.5 * sin(angle * float(numTeeth));
    float gearRadius = radius + teethHeight * teethPattern;
    
    // Draw gear outline
    float gearEdge = smoothstep(SIZE * 4.0, SIZE, abs(dist - gearRadius));
    result += color * gearEdge * intensity;
    
    // Draw inner circle
    float innerCircle = smoothstep(SIZE * 3.0, SIZE, abs(dist - radius * 0.6));
    result += color * innerCircle * intensity * 0.7;
    
    // Draw spokes
    const int MAX_SPOKES = 12; // Maximum number of spokes
    for (int i = 0; i < MAX_SPOKES; i++) {
        if (i >= numTeeth / 2) break;
        float spokeAngle = float(i) * 6.28318 / float(numTeeth / 2);
        float spokeMask = smoothstep(0.03, 0.01, abs(mod(angle - spokeAngle + 3.14159, 6.28318) - 3.14159));
        spokeMask *= smoothstep(radius * 0.6, radius, dist);
        result += color * spokeMask * intensity * 0.5;
    }
    
    // Add center dot
    float centerDot = smoothstep(radius * 0.2, radius * 0.1, dist);
    result += color * centerDot * intensity;
    
    return result;
}

// Draw a wrench
vec3 drawWrench(vec2 uv, vec2 center, float size, float rotation, vec3 color, float intensity) {
    vec3 result = vec3(0.0);
    
    // Rotate and translate
    uv = uv - center;
    uv = rot(rotation) * uv;
    
    // Scale
    uv = uv / size;
    
    // Draw handle
    vec2 handleStart = vec2(0.0, 0.0);
    vec2 handleEnd = vec2(0.0, -1.0);
    result += glowLine(uv, handleStart, handleEnd, color) * intensity;
    
    // Draw top opening (crescent)
    float angle = 0.0;
    vec2 lastPoint = vec2(0.0, 0.0);
    vec2 newPoint;
    
    // Draw left arc
    for (int i = 0; i <= 8; i++) {
        angle = 3.14159 * 0.5 + float(i) * 3.14159 * 0.25 / 8.0;
        newPoint = vec2(cos(angle), sin(angle)) * 0.4;
        if (i > 0) result += glowLine(uv, lastPoint, newPoint, color) * intensity;
        lastPoint = newPoint;
    }
    
    // Draw right arc
    for (int i = 0; i <= 8; i++) {
        angle = 3.14159 * 0.75 - float(i) * 3.14159 * 0.25 / 8.0;
        newPoint = vec2(cos(angle), sin(angle)) * 0.4;
        if (i > 0) result += glowLine(uv, lastPoint, newPoint, color) * intensity;
        lastPoint = newPoint;
    }
    
    // Add glow
    float dist = min(distLine(uv, vec2(0.0, 0.0), vec2(0.0, -1.0)), 
                    min(length(uv - vec2(0.0, 0.0)) - 0.4, 999.0));
    float glow = 0.01 / (0.01 + dist * dist);
    result += color * glow * intensity * 0.2;
    
    return result;
}

// Draw a hammer
vec3 drawHammer(vec2 uv, vec2 center, float size, float rotation, vec3 color, float intensity) {
    vec3 result = vec3(0.0);
    
    // Rotate and translate
    uv = uv - center;
    uv = rot(rotation) * uv;
    
    // Scale
    uv = uv / size;
    
    // Draw handle
    vec2 handleStart = vec2(0.0, 0.0);
    vec2 handleEnd = vec2(0.0, -1.0);
    result += glowLine(uv, handleStart, handleEnd, color) * intensity;
    
    // Draw hammer head
    vec2 headLeft = vec2(-0.4, 0.0);
    vec2 headRight = vec2(0.2, 0.0);
    result += glowLine(uv, headLeft, headRight, color) * intensity;
    
    // Draw hammer head details
    result += glowLine(uv, headLeft, headLeft + vec2(0.0, -0.2), color) * intensity;
    result += glowLine(uv, headRight, headRight + vec2(0.0, -0.2), color) * intensity;
    result += glowLine(uv, headLeft + vec2(0.0, -0.2), headRight + vec2(0.0, -0.2), color) * intensity;
    
    // Add glow
    float dist = min(distLine(uv, vec2(0.0, 0.0), vec2(0.0, -1.0)), 
                    min(distLine(uv, headLeft, headRight), 999.0));
    float glow = 0.01 / (0.01 + dist * dist);
    result += color * glow * intensity * 0.2;
    
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
    float t = G.z * 0.3;
    
    // Start with black background
    vec3 color = vec3(0.0);
    
    // Create technical grid pattern
    float gridSize = 0.05;
    vec2 gridPos = mod(uv, gridSize) - gridSize * 0.5;
    float grid = (1.0 - smoothstep(0.001, 0.002, abs(gridPos.x))) * 0.03;
    grid += (1.0 - smoothstep(0.001, 0.002, abs(gridPos.y))) * 0.03;
    color += vec3(0.0, 0.1, 0.2) * grid;
    
    // Create border with technical marks
    float border = 0.0;
    border += smoothstep(0.001, 0.0, abs(abs(uv.x) - 0.45));
    border += smoothstep(0.001, 0.0, abs(abs(uv.y) - 0.45));
    // Add ticks
    for (int i = 0; i < 10; i++) {
        float pos = float(i) * 0.1 - 0.45;
        border += smoothstep(0.003, 0.0, abs(abs(uv.x - pos) - 0.005)) * (1.0 - smoothstep(0.0, 0.01, abs(uv.y - 0.45)));
        border += smoothstep(0.003, 0.0, abs(abs(uv.y - pos) - 0.005)) * (1.0 - smoothstep(0.0, 0.01, abs(uv.x - 0.45)));
    }
    color += vec3(0.0, 0.2, 0.4) * border * 0.5;
    
    // Create circular scan effect
    float circleRadius = 0.4;
    float circle = length(uv);
    float scan = smoothstep(circleRadius, circleRadius - 0.05, circle);
    float pulse = 0.5 + 0.5 * sin(t + circle * 5.0);
    color += vec3(0.0, 0.05, 0.1) * scan * pulse * 0.5;
    
    // Create horizontal waveform - represents engineering precision
    float waveform = 0.0;
    float waveHeight = 0.1 * sin(uv.x * 30.0 + t * 2.0) * sin(t + uv.x * 5.0);
    waveform = smoothstep(0.002, 0.0, abs(uv.y + 0.35 - waveHeight));
    color += vec3(0.1, 0.3, 0.7) * waveform * 0.5;
    
    // Create center target - precision point
    float target = smoothstep(0.001, 0.0, abs(length(uv) - 0.02)) + 
                   smoothstep(0.001, 0.0, abs(length(uv) - 0.04));
    target += smoothstep(0.001, 0.0, abs(uv.x)) * 0.2 + 
              smoothstep(0.001, 0.0, abs(uv.y)) * 0.2;
    color += vec3(0.0, 0.4, 0.8) * target * 0.4;
    
    // Create a pulsating intensity
    float intensity = 1.0 + 0.3 * sin(t * 0.7);
    
    // Central gear
    float centralGearRotation = t * 0.5;
    color += drawGear(uv, vec2(0.0, 0.0), 0.15, 0.03, 12, centralGearRotation, brightBlue, intensity);
    
    // Orbital parameters
    float orbitRadius = 0.25;
    int numTools = 6; // Number of tools in orbit
    
    // Draw tools in orbit
    const int MAX_TOOLS = 6; // Maximum number of tools
    for (int i = 0; i < MAX_TOOLS; i++) {
        if (i >= numTools) break;
        float orbitAngle = float(i) * 6.28318 / float(numTools) + t;
        vec2 orbitPos = vec2(cos(orbitAngle), sin(orbitAngle)) * orbitRadius;
        
        float toolType = floor(float(i) / 3.0); // Replace modulo with division and floor
        float toolTypeNorm = toolType - 3.0 * floor(toolType / 3.0); // Equivalent to i % 3
        
        if (toolTypeNorm < 0.5) { // Equivalent to i % 3 == 0
            // Draw a wrench
            float toolRotation = orbitAngle + 3.14159 * 0.5 + t;
            color += drawWrench(uv, orbitPos, 0.08, toolRotation, glowBlue, intensity * 0.8);
        } else if (toolTypeNorm < 1.5) { // Equivalent to i % 3 == 1
            // Draw a hammer
            float toolRotation = orbitAngle + 3.14159 * 1.5 + t * 0.7;
            color += drawHammer(uv, orbitPos, 0.07, toolRotation, accentBlue, intensity * 0.9);
        } else { // Equivalent to i % 3 == 2
            // Draw a small gear
            float gearRotation = t * 0.7 - orbitAngle * 2.0;
            color += drawGear(uv, orbitPos, 0.05, 0.01, 8, gearRotation, brightBlue, intensity * 0.7);
        }
    }
    
    // Draw the blueprint data at the top of the screen
    float dataText = 0.0;
    for (int i = 0; i < 4; i++) {
        float x = float(i) * 0.2 - 0.3;
        float height = 0.02 + 0.01 * sin(t * 0.5 + float(i) * 0.7);
        if (uv.x > x && uv.x < x + 0.15 && uv.y > 0.35 && uv.y < 0.35 + height) {
            dataText = 1.0;
        }
    }
    color += vec3(0.0, 0.3, 0.6) * dataText * 0.5;
    
    // CRT scanline effect
    float scanline = 0.9 + 0.1 * sin(fragCoord.y * 0.7);
    color *= scanline;
    
    // HDR tone mapping
    color = color / (1.0 + color);
    color = sqrt(color); // Gamma correction
    
    // Vignette effect
    float vignette = 1.0 - 0.4 * pow(length(originalUv), 2.0);
    color *= vignette;
    
    fragColor = vec4(color, 1.0);
}
