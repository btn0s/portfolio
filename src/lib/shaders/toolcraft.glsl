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

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalize and adjust coordinates
    vec2 uv = (fragCoord/iResolution.xy) * 2.0 - 1.0;
    uv.x *= iResolution.x/iResolution.y;
    
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
    
    // Add scanlines
    color *= 0.8 + 0.2 * sin(fragCoord.y * 0.5);
    
    // Add subtle vignette
    float vignette = 1.0 - 0.3 * length(uv);
    color *= vignette;
    
    // Tone mapping and gamma correction
    color = color / (1.0 + color);
    color = sqrt(color);
    
    fragColor = vec4(color, 1.0);
}
