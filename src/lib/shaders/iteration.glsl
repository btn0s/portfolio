#define G vec3(iResolution.xy,iTime)
#define SIZE 0.003

// Color palette for tech interface style
const vec3 deepBlue = vec3(0.0, 0.05, 0.1);
const vec3 brightBlue = vec3(0.3, 0.7, 1.0);
const vec3 accentBlue = vec3(0.1, 0.4, 0.8);
const vec3 glowBlue = vec3(0.0, 0.5, 1.0);
const vec3 white = vec3(1.0);

// Random hash function
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

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

vec3 glowDot(vec2 uv, vec2 pos, vec3 color, float size) {
    float dist = length(uv - pos);
    float brightness = size / pow(0.05 + dist, 2.0);
    return color * brightness;
}

// 2D Value Noise
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(
        mix(a, b, f.x),
        mix(c, d, f.x),
        f.y
    );
}

float fbm(vec2 p, int maxOctaves) {
    float sum = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    
    // Unroll the loop with fixed iterations
    // First octave
    sum += amp * noise(p * freq);
    amp *= 0.5;
    freq *= 2.0;
    
    // Second octave
    if (maxOctaves > 1) {
        sum += amp * noise(p * freq);
        amp *= 0.5;
        freq *= 2.0;
    }
    
    // Third octave
    if (maxOctaves > 2) {
        sum += amp * noise(p * freq);
        amp *= 0.5;
        freq *= 2.0;
    }
    
    return sum;
}

// Used for domain warping
vec2 warp(vec2 p, float t) {
    vec2 q = vec2(
        fbm(p + vec2(0.0, 0.0), 3),
        fbm(p + vec2(5.2, 1.3), 3)
    );
    
    vec2 r = vec2(
        fbm(p + 4.0 * q + vec2(1.7, 9.2) + 0.15 * t, 3),
        fbm(p + 4.0 * q + vec2(8.3, 2.8) + 0.126 * t, 3)
    );
    
    return r;
}

// Metaballs function for organic shapes
float metaballs(vec2 p, float t, int maxCount) {
    float sum = 0.0;
    
    // Unroll the loop with explicit checks
    // First ball
    float angle0 = 0.0 * 2.5 + t * (0.5 + 0.1 * 0.0);
    vec2 ballPos0 = vec2(cos(angle0), sin(angle0)) * (0.3 + 0.2 * sin(t * 0.4 + 0.0));
    float dist0 = length(p - ballPos0);
    if (maxCount > 0) sum += 0.01 / (dist0 * dist0);
    
    // Second ball
    float angle1 = 1.0 * 2.5 + t * (0.5 + 0.1 * 1.0);
    vec2 ballPos1 = vec2(cos(angle1), sin(angle1)) * (0.3 + 0.2 * sin(t * 0.4 + 1.0));
    float dist1 = length(p - ballPos1);
    if (maxCount > 1) sum += 0.01 / (dist1 * dist1);
    
    // Third ball
    float angle2 = 2.0 * 2.5 + t * (0.5 + 0.1 * 2.0);
    vec2 ballPos2 = vec2(cos(angle2), sin(angle2)) * (0.3 + 0.2 * sin(t * 0.4 + 2.0));
    float dist2 = length(p - ballPos2);
    if (maxCount > 2) sum += 0.01 / (dist2 * dist2);
    
    // Fourth ball
    float angle3 = 3.0 * 2.5 + t * (0.5 + 0.1 * 3.0);
    vec2 ballPos3 = vec2(cos(angle3), sin(angle3)) * (0.3 + 0.2 * sin(t * 0.4 + 3.0));
    float dist3 = length(p - ballPos3);
    if (maxCount > 3) sum += 0.01 / (dist3 * dist3);
    
    // Fifth ball
    float angle4 = 4.0 * 2.5 + t * (0.5 + 0.1 * 4.0);
    vec2 ballPos4 = vec2(cos(angle4), sin(angle4)) * (0.3 + 0.2 * sin(t * 0.4 + 4.0));
    float dist4 = length(p - ballPos4);
    if (maxCount > 4) sum += 0.01 / (dist4 * dist4);
    
    return sum;
}

// Define pentagon vertices explicitly to avoid variable array indexing
vec2 getTopPentagonVertex(int idx, float pentAngle, float rotation) {
    float angle;
    if (idx == 0) angle = 0.0 * pentAngle + rotation * 0.5;
    else if (idx == 1) angle = 1.0 * pentAngle + rotation * 0.5;
    else if (idx == 2) angle = 2.0 * pentAngle + rotation * 0.5;
    else if (idx == 3) angle = 3.0 * pentAngle + rotation * 0.5;
    else angle = 4.0 * pentAngle + rotation * 0.5;
    
    return vec2(cos(angle), sin(angle)) * 0.5;
}

vec2 getBottomPentagonVertex(int idx, float pentAngle, float rotation) {
    float angle;
    if (idx == 0) angle = 0.0 * pentAngle + rotation * 0.5 + pentAngle / 2.0;
    else if (idx == 1) angle = 1.0 * pentAngle + rotation * 0.5 + pentAngle / 2.0;
    else if (idx == 2) angle = 2.0 * pentAngle + rotation * 0.5 + pentAngle / 2.0;
    else if (idx == 3) angle = 3.0 * pentAngle + rotation * 0.5 + pentAngle / 2.0;
    else angle = 4.0 * pentAngle + rotation * 0.5 + pentAngle / 2.0;
    
    return vec2(cos(angle), sin(angle)) * 0.5 * 0.8;
}

vec2 getGridPosition(int idx) {
    // Define grid positions explicitly
    if (idx == 0) return vec2(-0.2, 0.2);
    if (idx == 1) return vec2(0.0, 0.2);
    if (idx == 2) return vec2(0.2, 0.2);
    if (idx == 3) return vec2(-0.2, 0.0);
    if (idx == 4) return vec2(0.0, 0.0);
    if (idx == 5) return vec2(0.2, 0.0);
    if (idx == 6) return vec2(-0.2, -0.2);
    if (idx == 7) return vec2(0.0, -0.2);
    return vec2(0.2, -0.2); // idx == 8
}

void connectPoints(int a, int b, vec2 uv, vec2 warpedUv, float t, inout vec3 color) {
    vec2 posA = getGridPosition(a);
    vec2 posB = getGridPosition(b);
    
    float dist = distLine(uv, posA, posB);
    float thickness = SIZE;
    float mask = smoothstep(thickness, 0.125 * thickness, dist);
    
    vec2 pa = uv - posA;
    vec2 ba = posB - posA;
    float tA = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    vec2 posAOnLine = posA + ba * tA;
    
    vec2 wavePos = posAOnLine + warpedUv * 0.05 * sin(t * 0.7 + posA.y * 4.0);
    wavePos.x += 0.02 * sin(t * 0.6 + posA.x * 3.0);
    
    float distFromCenter = length(wavePos);
    if (distFromCenter > 1.8) return;
    
    float pointSize = SIZE * 1.5;
    float pointAlpha = 0.8 * (1.0 - distFromCenter / 1.8);
    
    float brightness = smoothstep(2.0, 0.0, distFromCenter);
    vec3 dotColor = mix(glowBlue, brightBlue, 0.5 + 0.5 * sin(distFromCenter * 3.0 + t));
    color += glowDot(uv, wavePos, dotColor, pointSize) * pointAlpha * mask;
}

// Rotation function
mat2 rot(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

// Draw a single iteration stage as a spiral
vec3 drawIterationSpiral(vec2 uv, vec2 center, float radius, float rotation, int segments, vec3 color, float intensity) {
    vec3 result = vec3(0.0);
    
    uv = uv - center;
    uv = rot(rotation) * uv;
    
    // Create a spiral
    float angle = atan(uv.y, uv.x);
    // Make angle positive for easier calculation
    if (angle < 0.0) angle += 6.28318;
    float dist = length(uv);
    
    // The spiral function
    float spiralWidth = radius / 5.0;
    float spiral = dist - spiralWidth * angle / 6.28318;
    float spiralMod = spiral - spiralWidth * 2.0 * floor(spiral / (spiralWidth * 2.0));
    float spiralDiff = spiralMod - spiralWidth;
    float spiralMask = smoothstep(SIZE * 2.0, SIZE * 0.5, abs(spiralDiff));
    
    // Apply color
    result += color * spiralMask * intensity * (1.0 - smoothstep(0.0, radius, dist));
    
    // Add segments along the spiral - unroll the loop
    float segAngle, segDist;
    vec2 pos;
    
    // First segment
    segAngle = 0.0 * 6.28318 / float(segments);
    segDist = spiralWidth * segAngle / 6.28318;
    pos = vec2(cos(segAngle), sin(segAngle)) * segDist;
    if (segments > 0) result += glowDot(uv, pos, white, SIZE * 2.0) * intensity * 0.7;
    
    // Second segment
    segAngle = 1.0 * 6.28318 / float(segments);
    segDist = spiralWidth * segAngle / 6.28318;
    pos = vec2(cos(segAngle), sin(segAngle)) * segDist;
    if (segments > 1) result += glowDot(uv, pos, white, SIZE * 2.0) * intensity * 0.7;
    
    // Third segment
    segAngle = 2.0 * 6.28318 / float(segments);
    segDist = spiralWidth * segAngle / 6.28318;
    pos = vec2(cos(segAngle), sin(segAngle)) * segDist;
    if (segments > 2) result += glowDot(uv, pos, white, SIZE * 2.0) * intensity * 0.7;
    
    // Fourth segment
    segAngle = 3.0 * 6.28318 / float(segments);
    segDist = spiralWidth * segAngle / 6.28318;
    pos = vec2(cos(segAngle), sin(segAngle)) * segDist;
    if (segments > 3) result += glowDot(uv, pos, white, SIZE * 2.0) * intensity * 0.7;
    
    // Fifth segment
    segAngle = 4.0 * 6.28318 / float(segments);
    segDist = spiralWidth * segAngle / 6.28318;
    pos = vec2(cos(segAngle), sin(segAngle)) * segDist;
    if (segments > 4) result += glowDot(uv, pos, white, SIZE * 2.0) * intensity * 0.7;
    
    // Sixth segment
    segAngle = 5.0 * 6.28318 / float(segments);
    segDist = spiralWidth * segAngle / 6.28318;
    pos = vec2(cos(segAngle), sin(segAngle)) * segDist;
    if (segments > 5) result += glowDot(uv, pos, white, SIZE * 2.0) * intensity * 0.7;
    
    // Seventh segment
    segAngle = 6.0 * 6.28318 / float(segments);
    segDist = spiralWidth * segAngle / 6.28318;
    pos = vec2(cos(segAngle), sin(segAngle)) * segDist;
    if (segments > 6) result += glowDot(uv, pos, white, SIZE * 2.0) * intensity * 0.7;
    
    // Eighth segment
    segAngle = 7.0 * 6.28318 / float(segments);
    segDist = spiralWidth * segAngle / 6.28318;
    pos = vec2(cos(segAngle), sin(segAngle)) * segDist;
    if (segments > 7) result += glowDot(uv, pos, white, SIZE * 2.0) * intensity * 0.7;
    
    // Ninth segment
    segAngle = 8.0 * 6.28318 / float(segments);
    segDist = spiralWidth * segAngle / 6.28318;
    pos = vec2(cos(segAngle), sin(segAngle)) * segDist;
    if (segments > 8) result += glowDot(uv, pos, white, SIZE * 2.0) * intensity * 0.7;
    
    // Tenth segment
    segAngle = 9.0 * 6.28318 / float(segments);
    segDist = spiralWidth * segAngle / 6.28318;
    pos = vec2(cos(segAngle), sin(segAngle)) * segDist;
    if (segments > 9) result += glowDot(uv, pos, white, SIZE * 2.0) * intensity * 0.7;
    
    // Eleventh segment
    segAngle = 10.0 * 6.28318 / float(segments);
    segDist = spiralWidth * segAngle / 6.28318;
    pos = vec2(cos(segAngle), sin(segAngle)) * segDist;
    if (segments > 10) result += glowDot(uv, pos, white, SIZE * 2.0) * intensity * 0.7;
    
    // Twelfth segment
    segAngle = 11.0 * 6.28318 / float(segments);
    segDist = spiralWidth * segAngle / 6.28318;
    pos = vec2(cos(segAngle), sin(segAngle)) * segDist;
    if (segments > 11) result += glowDot(uv, pos, white, SIZE * 2.0) * intensity * 0.7;
    
    return result;
}

// Draw a circular pattern that represents iteration/cycles
vec3 drawIterationCycle(vec2 uv, vec2 center, float radius, float rotation, int stages, vec3 color, float intensity) {
    vec3 result = vec3(0.0);
    
    uv = uv - center;
    uv = rot(rotation) * uv;
    
    // Draw main circle
    float dist = length(uv);
    float circle = smoothstep(SIZE * 2.0, SIZE * 0.5, abs(dist - radius));
    result += color * circle * intensity * 0.5;
    
    // Draw stages around the circle
    float angleStep = 6.28318 / float(stages);
    
    // Draw first stage
    vec2 pos1 = vec2(cos(0.0), sin(0.0)) * radius;
    result += glowDot(uv, pos1, white, SIZE * 3.0) * intensity;
    
    // Draw second stage
    vec2 pos2 = vec2(cos(angleStep), sin(angleStep)) * radius;
    result += glowDot(uv, pos2, white, SIZE * 3.0) * intensity * 0.9;
    result += glowLine(uv, pos1, pos2, color) * intensity * 0.8;
    
    // Draw third stage
    vec2 pos3 = vec2(cos(angleStep * 2.0), sin(angleStep * 2.0)) * radius;
    result += glowDot(uv, pos3, white, SIZE * 3.0) * intensity * 0.8;
    result += glowLine(uv, pos2, pos3, color) * intensity * 0.7;
    
    // Draw fourth stage
    vec2 pos4 = vec2(cos(angleStep * 3.0), sin(angleStep * 3.0)) * radius;
    result += glowDot(uv, pos4, white, SIZE * 3.0) * intensity * 0.7;
    result += glowLine(uv, pos3, pos4, color) * intensity * 0.6;
    
    // Draw fifth stage
    vec2 pos5 = vec2(cos(angleStep * 4.0), sin(angleStep * 4.0)) * radius;
    result += glowDot(uv, pos5, white, SIZE * 3.0) * intensity * 0.6;
    result += glowLine(uv, pos4, pos5, color) * intensity * 0.5;
    
    // Complete the cycle
    if (stages > 5) {
        vec2 pos6 = vec2(cos(angleStep * 5.0), sin(angleStep * 5.0)) * radius;
        result += glowDot(uv, pos6, white, SIZE * 3.0) * intensity * 0.5;
        result += glowLine(uv, pos5, pos6, color) * intensity * 0.4;
        
        vec2 posEnd = vec2(cos(0.0), sin(0.0)) * radius;
        result += glowLine(uv, pos6, posEnd, color) * intensity * 0.3;
    }
    
    return result;
}

// Draw a binary counter (doubling pattern) to show exponential iteration
vec3 drawBinaryCounter(vec2 uv, vec2 center, float baseSize, float t, vec3 color, float intensity) {
    vec3 result = vec3(0.0);
    
    uv = uv - center;
    
    // Draw base square
    float baseSquare = max(abs(uv.x), abs(uv.y));
    float baseMask = smoothstep(baseSize + SIZE, baseSize, baseSquare);
    result += color * baseMask * intensity * 0.3;
    
    // Calculate iteration stage from time - replace modulo with alternative
    float tScaled = floor(t * 0.5);
    float stage = tScaled - 6.0 * floor(tScaled / 6.0); // mod(tScaled, 6.0)
    
    // Draw first square (1)
    if (stage >= 0.0) {
        float size1 = baseSize * 0.8;
        vec2 pos1 = vec2(-baseSize * 0.5, 0.0);
        vec2 uv1 = uv - pos1;
        float square1 = max(abs(uv1.x), abs(uv1.y));
        float mask1 = smoothstep(size1 + SIZE, size1, square1);
        result += brightBlue * mask1 * intensity * 0.5;
    }
    
    // Draw second square (2)
    if (stage >= 1.0) {
        float size2 = baseSize * 0.65;
        vec2 pos2 = vec2(baseSize * 0.5, 0.0);
        vec2 uv2 = uv - pos2;
        float square2 = max(abs(uv2.x), abs(uv2.y));
        float mask2 = smoothstep(size2 + SIZE, size2, square2);
        result += brightBlue * mask2 * intensity * 0.5;
    }
    
    // Draw third level (4)
    if (stage >= 2.0) {
        float size3 = baseSize * 0.5;
        vec2 pos3 = vec2(0.0, baseSize * 0.5);
        vec2 uv3 = uv - pos3;
        float square3 = max(abs(uv3.x), abs(uv3.y));
        float mask3 = smoothstep(size3 + SIZE, size3, square3);
        result += brightBlue * mask3 * intensity * 0.5;
    }
    
    // Draw fourth level (8)
    if (stage >= 3.0) {
        float size4 = baseSize * 0.35;
        vec2 pos4 = vec2(0.0, -baseSize * 0.5);
        vec2 uv4 = uv - pos4;
        float square4 = max(abs(uv4.x), abs(uv4.y));
        float mask4 = smoothstep(size4 + SIZE, size4, square4);
        result += brightBlue * mask4 * intensity * 0.5;
    }
    
    // Draw fifth level (16)
    if (stage >= 4.0) {
        float size5 = baseSize * 0.2;
        vec2 pos5 = vec2(-baseSize * 0.3, -baseSize * 0.3);
        vec2 uv5 = uv - pos5;
        float square5 = max(abs(uv5.x), abs(uv5.y));
        float mask5 = smoothstep(size5 + SIZE, size5, square5);
        result += brightBlue * mask5 * intensity * 0.5;
    }
    
    // Draw sixth level (32)
    if (stage >= 5.0) {
        float size6 = baseSize * 0.1;
        vec2 pos6 = vec2(baseSize * 0.3, baseSize * 0.3);
        vec2 uv6 = uv - pos6;
        float square6 = max(abs(uv6.x), abs(uv6.y));
        float mask6 = smoothstep(size6 + SIZE, size6, square6);
        result += brightBlue * mask6 * intensity * 0.5;
    }
    
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
    
    // Calculate warped UV for grid connections
    vec2 warpedUv = warp(uv * 2.0, t);
    
    // Start with black background
    vec3 color = vec3(0.0);
    
    // Create circular scan effect - more deliberate for "iteration"
    float circleRadius = 0.7;
    float circle = length(uv);
    float scan = smoothstep(circleRadius, circleRadius - 0.05, circle);
    float pulse = 0.5 + 0.5 * sin(slowT * 0.5 + circle * 5.0);
    color += vec3(0.0, 0.08, 0.15) * scan * pulse * 0.5;
    
    // Create technical grid pattern - replace mod with fract+floor
    float gridSize = 0.05;
    vec2 gridUv = uv + vec2(0.5, 0.5); // Make positive for easier calculation
    vec2 gridFloor = floor(gridUv / gridSize);
    vec2 gridPos = gridUv - gridFloor * gridSize;
    gridPos = gridPos - gridSize * 0.5;
    float grid = (1.0 - smoothstep(0.001, 0.002, abs(gridPos.x))) * 0.03;
    grid += (1.0 - smoothstep(0.001, 0.002, abs(gridPos.y))) * 0.03;
    color += vec3(0.0, 0.1, 0.2) * grid;
    
    // Create horizontal waveform - represents iteration progress
    float waveform = 0.0;
    float waveHeight = 0.05 * sin(uv.x * 20.0 + t * 2.0);
    waveform = smoothstep(0.002, 0.0, abs(uv.y + 0.35 - waveHeight));
    color += vec3(0.1, 0.3, 0.7) * waveform * 0.5;
    
    // Add data visualization patterns at the edges
    for (int i = 0; i < 8; i++) {
        float x = float(i) * 0.12 - 0.42;
        float height = 0.02 + 0.05 * sin(t * 0.3 + float(i) * 0.7);
        
        // Using if statements instead of modulo for compatibility
        float barIntensity = 0.0;
        if (i == 0 || i == 3 || i == 6) barIntensity = 0.7;
        else if (i == 1 || i == 4 || i == 7) barIntensity = 0.5;
        else barIntensity = 0.3;
        
        if (uv.x > x && uv.x < x + 0.08 && uv.y > -0.45 && uv.y < -0.45 + height) {
            color += vec3(0.0, 0.3, 0.6) * barIntensity;
        }
    }
    
    // Create a pulsating intensity
    float intensity = 1.0 + 0.3 * sin(t * 0.7);
    
    // Add iteration visuals
    
    // 1. Iteration spiral in the background
    color += drawIterationSpiral(uv, vec2(0.0, 0.0), 0.8, t * 0.05, 12, deepBlue, intensity * 0.3);
    
    // 2. Main iteration cycles at different positions
    
    // Central primary cycle
    color += drawIterationCycle(uv, vec2(0.0, 0.0), 0.2, t * 0.2, 6, glowBlue, intensity);
    
    // Secondary cycles
    color += drawIterationCycle(uv, vec2(0.5, 0.3), 0.15, -t * 0.3, 5, accentBlue, intensity * 0.7);
    color += drawIterationCycle(uv, vec2(-0.5, 0.3), 0.15, t * 0.25, 5, brightBlue, intensity * 0.7);
    color += drawIterationCycle(uv, vec2(0.5, -0.3), 0.15, t * 0.3, 5, accentBlue, intensity * 0.7);
    color += drawIterationCycle(uv, vec2(-0.5, -0.3), 0.15, -t * 0.25, 5, brightBlue, intensity * 0.7);
    
    // 3. Binary counter to show exponential growth
    color += drawBinaryCounter(uv, vec2(0.0, 0.0), 0.1, t, accentBlue, intensity);
    
    // Connect grid points - unrolled connections
    connectPoints(0, 1, uv, warpedUv, t, color);
    connectPoints(1, 2, uv, warpedUv, t, color);
    connectPoints(3, 4, uv, warpedUv, t, color);
    connectPoints(4, 5, uv, warpedUv, t, color);
    connectPoints(6, 7, uv, warpedUv, t, color);
    connectPoints(7, 8, uv, warpedUv, t, color);
    connectPoints(0, 3, uv, warpedUv, t, color);
    connectPoints(1, 4, uv, warpedUv, t, color);
    connectPoints(2, 5, uv, warpedUv, t, color);
    connectPoints(3, 6, uv, warpedUv, t, color);
    connectPoints(4, 7, uv, warpedUv, t, color);
    connectPoints(5, 8, uv, warpedUv, t, color);
    
    // CRT scanline effect - more subtle
    float scanline = 0.9 + 0.1 * sin(fragCoord.y * 0.7);
    color *= scanline;
    
    // HDR tone mapping
    color = color / (1.0 + color);
    color = sqrt(color); // Gamma correction
    
    // Vignette effect - more focused
    float vignette = 1.0 - 0.4 * pow(length(originalUv), 2.0);
    color *= vignette;
    
    fragColor = vec4(color, 1.0);
}
