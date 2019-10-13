#version 300 es
precision highp float;

///////////////////////////////////
// Note: Implemented cylinders
///////////////////////////////////

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
out vec3 vViewPos;
out vec2 vUV;

// matrices
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProj;

// time in seconds
uniform float uTime;

uniform float uDistort;

float distortion(const vec3 epsilon) 
{
    return sin(uTime) * noise(epsilon + vec3(uTime) * sin(uTime) * float(gl_VertexID));
}

#define DISTORT_EPSILON (0.001)

void main(void) {
    float distort_val = uDistort * distortion(vec3(0.0));
    vec3 distort_delta  = uDistort * (vec3(
        distortion(vec3(DISTORT_EPSILON, 0.0, 0.0)),
        distortion(vec3(0.0, DISTORT_EPSILON, 0.0)),
        distortion(vec3(0.0, 0.0, DISTORT_EPSILON))
    ) - vec3(distort_val));
    
    vec4 mvpos = uView * uModel * vec4(aPos + distort_val, 1.);
    vec4 pos = uProj * mvpos;
    gl_Position = pos;
    
    vXY = pos.xy / pos.z;

    vPos = aPos;

    vNor = (transpose(inverse(uView * uModel)) * vec4(aNor + distort_delta, 0.)).xyz;

    vViewPos = mvpos.xyz;

    vUV = aUV;
}
