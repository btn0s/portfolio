/*
A visualization of iteration as a continuous cycle. 
Connected arrows rotate in a circular pattern, 
representing the flow and repetition of iterative processes.
*/

#define G vec3(iResolution.xy,iTime)
#define SIZE .003

// Color palette - using similar muted tones as toolcraft.glsl
const vec3 cyan = vec3(0.0, 0.7, 0.7);
const vec3 blue = vec3(0.0, 0.2, 0.7);
const vec3 white = vec3(0.7);
const vec3 darkBlue = vec3(0.0, 0.05, 0.1);

// Random hash function
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

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
    vec3 color = m * vec3(0.3);
    color += rgbGlow * brightness * 0.4;
    return color;
}

// Rotation matrix
mat2 rot(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

// Draw a single iteration step
vec3 drawIterationStep(vec2 uv, vec2 center, float size, float rotation) {
    vec3 result = vec3(0.0);
    uv = uv - center;
    uv = rot(rotation) * uv;
    uv = uv / size;
    
    // Draw arrow shape to represent iteration
    result += glowLine(uv, vec2(-0.5, 0.0), vec2(0.5, 0.0), blue);
    result += glowLine(uv, vec2(0.3, -0.2), vec2(0.5, 0.0), cyan);
    result += glowLine(uv, vec2(0.3, 0.2), vec2(0.5, 0.0), cyan);
    
    return result;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalize coordinates
    vec2 uv = (fragCoord/iResolution.xy) * 2.0 - 1.0;
    uv.x *= iResolution.x/iResolution.y;
    
    // Add subtle CRT distortion
    uv *= 1.0 + 0.2 * length(uv);
    uv.x += 0.002 * cos(40.0 * uv.y + 2.0 * iTime);
    
    // Initialize color
    vec3 color = vec3(0.0);
    
    // Time variables
    float t = iTime * 0.4;
    
    // Draw iteration steps in a circular pattern
    const int NUM_STEPS = 4;
    for (int i = 0; i < NUM_STEPS; i++) {
        float angle = float(i) * 6.28318 / float(NUM_STEPS) + t;
        vec2 pos = vec2(cos(angle), sin(angle)) * 0.3;
        float stepSize = 0.15 + 0.05 * sin(t * 0.7 + float(i));
        color += drawIterationStep(uv, pos, stepSize, angle + t);
        
        // Connect to next step
        if (i < NUM_STEPS - 1) {
            float nextAngle = float(i + 1) * 6.28318 / float(NUM_STEPS) + t;
            vec2 nextPos = vec2(cos(nextAngle), sin(nextAngle)) * 0.3;
            color += glowLine(uv, pos, nextPos, darkBlue) * 0.5;
        }
    }
    
    // Connect last to first to complete the cycle
    float firstAngle = t;
    float lastAngle = float(NUM_STEPS - 1) * 6.28318 / float(NUM_STEPS) + t;
    vec2 firstPos = vec2(cos(firstAngle), sin(firstAngle)) * 0.3;
    vec2 lastPos = vec2(cos(lastAngle), sin(lastAngle)) * 0.3;
    color += glowLine(uv, lastPos, firstPos, darkBlue) * 0.5;
    
    // Add subtle scanlines
    color *= 0.9 + 0.1 * sin(fragCoord.y * 0.5);
    
    // Add vignette
    float vignette = 1.0 - 0.3 * length(uv);
    color *= vignette;
    
    // Tone mapping and gamma correction
    color = color / (1.0 + color);
    color = sqrt(color);
    
    fragColor = vec4(color, 1.0);
}
