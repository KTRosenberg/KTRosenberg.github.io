#version 300 es
precision highp float;

// input vertex
layout(location = 0) in  vec3 aPos;
layout(location = 1) in  vec3 aNor;
layout(location = 2) in  vec2 aUV;

// interpolated position
out vec3 vPos;
out vec3 vNor;
// interpolated cursor
out vec3 vCursor;
out vec2 vXY;
out vec3 vWorldPos;
out vec2 vUV;

// matrices
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProj;

// time in seconds
uniform float uTime;

uniform float uDistort;



void main(void) {
    vec4 mvpos = uView * uModel * vec4(aPos + uDistort * sin(uTime) * noise(vec3(uTime) * sin(uTime) * float(gl_VertexID)), 1.);
    vec4 pos = uProj * mvpos;
    gl_Position = pos;
    
    vXY = pos.xy / pos.z;

    vPos = aPos;

    //=vNor = (transpose(inverse(uModel)) * (vec4(aNor, 0.))).xyz;
    vNor = (transpose(inverse(uModel)) * vec4(aNor, 0.)).xyz;

    vWorldPos = mvpos.xyz / mvpos.w;

    vUV = aUV;
}
