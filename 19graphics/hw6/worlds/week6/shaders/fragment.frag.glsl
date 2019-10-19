#version 300 es
precision highp float;

// Passed in from the vertex shader.
in vec3 vNor;
in vec2 vUV;
in vec2 vUV2;
in vec3 vPos;
in vec3 vWorld;
in vec3 vView;

// The texture(s).
uniform sampler2D uTex0;
uniform sampler2D uTex1;
uniform int uTextureActive;
uniform float uTime;

uniform mat4 uView;

out vec4 fragColor;

const vec4 fog_color = vec4(53.0 / 255.0, 81.0 / 255.0, 192.0 / 255.0, 1.0);
const float fog_density = 0.051;
#define LOG2 (1.442695)

void main() {
    if (uTextureActive == 1) {
        vec4 color0 = texture(uTex0, vUV /*+ sin(uTime)*/);
        vec4 color1 = texture(uTex0, vUV/*2*/);

        color1 = mix(color1, vec4(color0.rgb, 1.0), cos(uTime) * cos(uTime));
    
        fragColor = mix(color0, color1, sin(uTime));
    } else {
        if(fract(vUV.x / 0.001f) > 0.1f && fract(vUV.y / 0.001f) > 0.1f) {
            vec3 wXYZ = abs(vWorld.xyz);
            
           fragColor = vec4(sqrt(0.5 * vec3(71.0 / 255.0, 182.0 / 255.0, 37.0 / 255.0) / wXYZ), 1.0);
        } else {
            fragColor = vec4(vec3(0.0), 1.0);
        }
    }
    
    // taken from https://webgl2fundamentals.org/webgl/lessons/webgl-fog.html
    float fog_dist = length(vView);
    float fog_amount = clamp(
        1.0 - exp2(-fog_density * fog_density * fog_dist * fog_dist * LOG2),
        0.0, 1.0
    );

    fragColor = mix(fragColor, fog_color, fog_amount);
    
}
