#version 300 es
precision highp float;

// NOTE: Please click for audio.
//
// INSTRUCTIONS TO VIEWER:
//
// Keyboard Input: up,down = forward/backaward, left,right = rotate
// control to "pick up and put down" the object
//
// Hold shift + up/down to move vertically
// to spawn a ring of objects
// Press "Hide" while playing to hide the code
//

layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNor;
layout (location = 2) in vec2 aUV;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProj;
uniform float uTime;

uniform vec2 uResolution;

uniform vec3 uViewPosition;

uniform mediump int uMode;

out vec2 vUV;
out vec2 vUV2;
out vec3 vPos;
out vec3 vWorld;
out vec3 vView;
//

out vec3 vNor;

float sin01(float v) {
    return (1.0 + sin(v)) / 2.0;
}

#define PI 3.1415926535897932384626433832795

// Note, in practice it would make more sense to send a constant/uniform
// to the GPU with the pre-computed cos/sin values to avoid calculating the
// same value for every vertex
vec2 rotate_2D_point_around(const vec2 pt, const vec2 origin, const float angle) {
  // subtract the origin
  float x = pt.x - origin.x;
  float y = pt.y - origin.y;

  float cs = cos(angle);
  float sn = sin(angle);

  // rotate and re-add the origin
  return vec2(
    (x*cs) - (y*sn),
    (y*cs) + (x*sn)
  ) + origin;
}

const int MODE_FLOOR   = 0;
const int MODE_TEXTURE = 1;
const int MODE_COLOR   = 2;
const int MODE_USER = 3;

const float fog_density = 0.0051;
#define LOG2 (1.442695)

vec3 circle(vec2 radius, vec2 delta, vec2 pos)
{
    return vec3(smoothstep(
        radius.x + (radius.x * delta.x), 
        radius.y - (radius.y * delta.y), dot(pos, pos)
    )); 
}


void main() {
  // Multiply the position by the matrix.

  vec3 modified_pos = aPos;

  switch (uMode) {
  case MODE_FLOOR: {
      vec2 pos = uViewPosition.xz;

      vec2 vapos = (uModel * vec4(aPos, 1.0)).xz;
      //float A = .0001;
      //float B = 0.0;
      //float C = 0.0;
      //float dx = vapos.x - pos.x;
      //float dz = vapos.y - pos.y;
      //float qx = A * (dx * dx) + (B * dx) + C;
      //float qz = A * (dz * dz) + (B * dz) + C;

      float dx = vapos.x - pos.x;
      float dz = vapos.y - pos.y;
      //if ((dx*dx) + (dz*dz) > 10.0) {
          modified_pos.y += min(4.0, 4.0 * distance(pos, vapos));
          modified_pos.y -= 4.0 - 0.2 * (noise(vapos.xxy - sin(uTime)) * cos(vapos.y + uTime) + cos(vapos.x + uTime) + sin(vapos.y + uTime));
      //}

      break;
  }
  default: {
      break;
  }
  }
  gl_Position = uProj * uView * uModel * vec4(modified_pos, 1.0);
  
  vNor = (transpose(inverse(uView * uModel)) * vec4(aNor, 0.)).xyz;
  // Pass the texcoord to the fragment shader.
  vUV = aUV;

  // re-add the origin
  //vUV2 = rotate_2D_point_around(aUV, vec2(0.5), uTime);

  vPos = gl_Position.xyz;
  vWorld = (uModel * vec4(modified_pos, 1.0)).xyz;
  vView = (uView * uModel * vec4(modified_pos, 1.0)).xyz;
  
}
                                 