#version 300 es        // NEWER VERSION OF GLSL
precision highp float; // HIGH PRECISION FLOATS


uniform vec3  uColor;
uniform vec3  uCursor; // CURSOR: xy=pos, z=mouse up/down
uniform float uTime;   // TIME, IN SECONDS
uniform mat4 uView;

in vec2 vXY;           // POSITION ON IMAGE
in vec3 vPos;          // POSITION
in vec3 vNor;          // NORMAL
in vec2 vUV;

vec3 eye_dir;

in vec3 vViewPos;

out vec4 fragColor;    // RESULT WILL GO HERE

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
};

uniform vec4 u_ambient;

vec3 calc_shading(inout Material mat, vec3 bg_color)
{
    vec3 N = normalize(vNor);

    vec3 color = mat.ambient * bg_color;

    for (int i = 0; i < MAX_LIGHT_COUNT; i += 1) {
        if (i == u_light_count) { 
            break; 
        }

        vec3 L = -normalize((uView * vec4(u_lights[i].direction.xyz, 1.0)).xyz + eye_dir);
                
            float diffuse = max(0.0, dot(N, L));
            vec3 R = reflect(L, N); // reflection vector about the normal
            
            // get the bisector between the normal and the light direction
            vec3 vec_sum = eye_dir + L;
            vec3 bisector_N_L = vec_sum / length(vec_sum);

            float specular = pow(max(0.0, dot(bisector_N_L, R)), mat.spec_pow);
            
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

void main() {
    eye_dir = normalize(-vViewPos);
    Material mat = Material(
      vec3(sin01(uTime), 0.1, 0.1),
      vec3(226. / 255., 88. / 255., 34. / 255.),
      vec3(.5,.5,.5),
      0.7
    );
    vec3 color = calc_shading(mat, u_ambient.rgb);

    fragColor = vec4(sqrt(color), 1.0);
}


