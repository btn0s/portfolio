/*
A representation of focused thought and purpose.
A central form with radiating connections suggests
the convergence of ideas into clear intention.
*/

#define SIZE .003

// Color palette - using muted, focused colors
const vec3 deepBlue = vec3(0.0, 0.05, 0.1);
const vec3 glowBlue = vec3(0.0, 0.4, 0.8);
const vec3 white = vec3(0.7);
const vec3 accentBlue = vec3(0.0, 0.2, 0.5);

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

// Draw a focus point
vec3 drawFocusPoint(vec2 uv, vec2 pos, vec3 color, float size) {
    float dist = length(uv - pos);
    float brightness = size / pow(0.05 + dist, 2.0);
    return color * brightness * 0.3;
}

// Draw intention shape (simplified pentagon for focus)
vec3 drawIntentionShape(vec2 uv, vec2 center, float scale, float rotation) {
    vec3 result = vec3(0.0);
    
    // Transform UV
    uv = uv - center;
    uv = rot(rotation) * uv;
    uv = uv / scale;
    
    // Define pentagon points
    vec2 points[5];
    float angle = 6.28318 / 5.0;
    
    for (int i = 0; i < 5; i++) {
        float a = float(i) * angle;
        points[i] = vec2(cos(a), sin(a)) * 0.5;
    }
    
    // Draw pentagon edges - unrolled loop to avoid modulo
    result += glowLine(uv, points[0], points[1], glowBlue);
    result += glowLine(uv, points[1], points[2], glowBlue);
    result += glowLine(uv, points[2], points[3], glowBlue);
    result += glowLine(uv, points[3], points[4], glowBlue);
    result += glowLine(uv, points[4], points[0], glowBlue);
    
    // Draw lines to center - unrolled
    result += glowLine(uv, points[0], vec2(0.0), accentBlue) * 0.5;
    result += glowLine(uv, points[1], vec2(0.0), accentBlue) * 0.5;
    result += glowLine(uv, points[2], vec2(0.0), accentBlue) * 0.5;
    result += glowLine(uv, points[3], vec2(0.0), accentBlue) * 0.5;
    result += glowLine(uv, points[4], vec2(0.0), accentBlue) * 0.5;
    
    // Add focus points at vertices - unrolled
    result += drawFocusPoint(uv, points[0], white, SIZE * 2.0);
    result += drawFocusPoint(uv, points[1], white, SIZE * 2.0);
    result += drawFocusPoint(uv, points[2], white, SIZE * 2.0);
    result += drawFocusPoint(uv, points[3], white, SIZE * 2.0);
    result += drawFocusPoint(uv, points[4], white, SIZE * 2.0);
    
    // Center focus point
    result += drawFocusPoint(uv, vec2(0.0), glowBlue, SIZE * 3.0);
    
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
    float t = iTime * 0.3;
    
    // Draw main intention shape
    color += drawIntentionShape(uv, vec2(0.0), 0.4, t * 0.2);
    
    // Add focus rings
    float dist = length(uv);
    float ring1 = smoothstep(0.002, 0.001, abs(dist - 0.6 + 0.1 * sin(t)));
    float ring2 = smoothstep(0.002, 0.001, abs(dist - 0.4 + 0.05 * sin(t * 1.2)));
    
    color += glowBlue * ring1 * 0.3;
    color += accentBlue * ring2 * 0.2;
    
    // Add subtle direction lines - simplified to avoid modulo
    float angle = atan(uv.y, uv.x);
    float lines = smoothstep(0.02, 0.0, abs(sin(angle * 3.0 + t)));
    color += deepBlue * lines * (1.0 - smoothstep(0.4, 0.8, dist)) * 0.2;
    
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
