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
uniform sampler2D uTex2;
uniform sampler2D uTex3;
uniform sampler2D uTex4;
uniform int uMode;
uniform int uMatIdx;
uniform float uTime;

uniform mat4 uView;
uniform vec2 u_world_dimensions;

uniform vec4 u_color;

out vec4 fragColor;

uniform vec4 fog_color;
const float fog_density = 0.051;
#define LOG2 (1.442695)

struct Light {
    vec4 direction;
    vec4 color;
};

#define MAX_LIGHT_COUNT (2)
uniform int u_light_count;
uniform Light u_lights[2];


struct Material {
    vec3  ambient;
    vec3  diffuse;
    vec3  specular;
    float spec_pow;
    int mode;
};

uniform vec4 u_ambient;

vec3 calc_shading(vec3 eye_dir, inout Material mat, vec3 bg_color)
{
    vec3 N = normalize(vNor);

    vec3 color = mat.ambient * bg_color;

    for (int i = 0; i < MAX_LIGHT_COUNT; i += 1) {
        if (i == u_light_count) { 
            break; 
        }

        vec3 L = -normalize((uView * vec4(u_lights[i].direction.xyz, 0.0)).xyz);
                
            float diffuse = max(0.0, dot(N, L));
            vec3 R = reflect(-L, N); // reflection vector about the normal
            
            // get the bisector between the normal and the light direction
            //vec3 vec_sum = -eye_dir + L;
            //vec3 bisector_N_L = normalize(vec_sum / length(vec_sum));
            

            float specular = pow(max(0.0, dot(-eye_dir, R)), mat.spec_pow);
            
            // Lrgb * ((D_rgb) + (S_rgb))
            color += u_lights[i].color.rgb * (
                (mat.diffuse * diffuse) + (mat.specular * specular)
            );
    }

    return color;
}


float sin01(float val) 
{
    return (sin(val) + 1.0) / 2.0;
}

vec3 ldir = vec3(0.0, 0.5, -1);


uniform Material u_mats[10];

const int MODE_FLOOR   = 0;
const int MODE_TEXTURE = 1;
const int MODE_COLOR   = 2;
const int MODE_USER = 3;
const int MODE_DEFAULT = -1;
const int MODE_LAB = 4;
uniform int whichTexture;
void main() {
    vec4 amb = fog_color;
    fragColor = vec4(vec3(0.0), 1.0);
    switch (uMode) {
    case MODE_USER: {
        fragColor = texture(uTex3, vUV);
        break;
    }
    case MODE_TEXTURE: {
        vec4 color0;
        vec4 color1;  
        if (whichTexture == 0) {
            color0 = texture(uTex1, vUV /*+ sin(uTime)*/);
            color1 = texture(uTex2, vUV/*2*/);
color0 = vec4(vec3(0.0), 0.0);
        } else {
           // color0 = texture(uTex0, vUV /*+ sin(uTime)*/);

color0 = vec4(vec3(0.0), 0.0);
            color1 = texture(uTex3, vUV/*2*/);
        }
        
        fragColor = color1;
        break;
    }
    case MODE_FLOOR: {
        //if(fract(vUV.x / 0.001f) > 0.1f && fract(vUV.y / 0.001f) > 0.1f) {
            vec3 wXYZ = abs(vWorld.xyz);            
           fragColor = vec4(sqrt(
                max(vec3(1.0), 0.5 * 
                vec3(71.0 / 255.0, 182.0 / 255.0, 37.0 / 255.0) / vec3(wXYZ.x, 1.0, wXYZ.z))), 
           1.0);
           vec2 uv_coord = (0.2 * noise(vView + uTime) + vUV * u_world_dimensions);
              fragColor = vec4(mix(
                  texture(uTex0, uv_coord), 
                  texture(uTex1, uv_coord), 
                  sin01(uTime)
               ));
        //} else {
        //    fragColor = vec4(vec3(0.0), 1.0);
        //}
        break;
    }
    case MODE_LAB: {
        fragColor = texture(uTex2, vUV); 

        //fragColor.rgb = mix(fragColor.rgb, fog_color.rgb, fog_amount);
        //return;
        break;
    }
    default: {
        amb = u_ambient;
    }
    }
    


    Material mat = Material(
      amb.rgb,
      vec3(226. / 255., 88. / 255., 34. / 255.),
      vec3(.5,.5,.5),
      20.0,
        0
    );

    // taken from https://webgl2fundamentals.org/webgl/lessons/webgl-fog.html
    float fog_dist = length(vView) + 2.5 * abs(sin(uTime));
    float fog_amount = clamp(
        1.0 - exp2(-fog_density * fog_density * fog_dist * fog_dist * LOG2),
        0.0, 1.0
    );

    fragColor.rgb += calc_shading(normalize(vView), mat, fog_color.rgb);
    fragColor.rgb = mix(fragColor.rgb, fog_color.rgb, fog_amount);

    
}
