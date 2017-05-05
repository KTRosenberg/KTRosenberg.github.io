<script id="vs" type="notjs">
attribute vec3 aPos, aNor;
attribute vec2 aUV;
varying   vec3 vPos, vNor;
varying   vec2 vUV;
uniform   mat4 matrix, invMatrix;
void main() {
   vec4 pos = matrix * vec4(aPos, 1.);
   vec4 nor = vec4(aNor, 0.) * invMatrix;
   gl_Position = pos;
   vPos = pos.xyz;
   vNor = nor.xyz;
   vUV  = aUV;
}
</script>

<script id="light_struct" type="notjs">
struct Light {
   vec3 direction;
   vec3 color;
};
uniform Light uLights[NLIGHTS];
</script>


var fs1 = '\
varying vec3 vPos, vNor;\n\
varying vec2 vUV;\n\
void main() {\n\
   vec3 normal = normalize(vNor);\n\
   vec3 c = vec3(.1,.1,.1);\n\
   c += vec3(.7,.7,1.) * max(0.,dot(normal, vec3( .7, .7, .7)));\n\
   c += vec3(.5,.3,.1) * max(0.,dot(normal, vec3(-.7,-.7,-.7)));\n\
   gl_FragColor = vec4(sqrt(c), 1.);\n\
}\n\
';

var fs2 = '\
varying vec3 vPos, vNor;\n\
varying vec2 vUV;\n\
uniform sampler2D uSampler;\n\
void main() {\n\
   vec3 normal = normalize(vNor);\n\
   vec3 c = vec3(.1,.1,.1);\n\
   c += vec3(.7,.7,1.) * max(0.,dot(normal, vec3( .7, .7, .7)));\n\
   c += vec3(.5,.3,.1) * max(0.,dot(normal, vec3(-.7,-.7,-.7)));\n\
   vec4 texture = texture2D(uSampler, vUV);\n\
   c *= texture.rgb;\n\
   //c = vNor;\n\
   gl_FragColor = vec4(sqrt(c), 1.);\n\
}\n\
';

var fs3 = '\
varying vec3 vPos, vNor;\n\
varying vec2 vUV;\n\
uniform sampler2D uSampler;\n\
void main() {\n\
   vec3 c = phong(\n\
      normalize(vNor), \n\
      E,\n\
      vec3(0.01, 0.2, 1.0),\n\
      vec3(226. / 255., 88. / 255., 34. / 255.),\n\
      vec4(.5,.5,.5,10.)\n\
   );\n\
   vec4 texture = texture2D(uSampler, vUV);\n\
   c *= texture.rgb;\n\
   //c = vNor;\n\
   gl_FragColor = vec4(sqrt(c), 1.);\n\
}\n\
';

var fs4 = '\
varying vec3 vPos, vNor;\n\
varying vec2 vUV;\n\
uniform sampler2D uSampler;\n\
uniform float uTime; \n\
void main() {\n\
   vec4 texture = texture2D(uSampler, vUV);\n\
   float n = noise(texture.rgb);\n\
   vec3 c = phong(\n\
      normalize(vNor), \n\
      E,\n\
      vec3(0.01, 0.2, 1.0),\n\
      vec3(226. / 255., 88. / 255., 34. / 255.),\n\
      vec4(.5,.5,.5,10.)\n\
   );\n\
   c = mix(c, texture.rgb, n);\n\
   gl_FragColor = vec4(sqrt(c), 1.);\n\
}\n\
';

var phong = '\
#define EPSILON .01;\n\
vec3 bg_col = vec3(0.1, 0.1, 0.1);\n\
vec3 E = normalize(vec3(0., 0., -1.));\n\
vec3 LDir = normalize(vec3(sin(.5),0.,-.5));\n\
\n\
vec3 phong(vec3 N, vec3 E, vec3 A, vec3 D, vec4 S)\n\
{\n\
   vec3 c = A * bg_col; // ambient color\n\
   vec3 LDir = normalize(LDir); \n\
   float d = max(0., dot(N, LDir)); // diffuse value\n\
   vec3 R = 2. * dot(N, LDir) * N - LDir; // reflection direction\n\
   float s = pow(max(0., dot(E, R)), S.a); // specular value\n\
   c += d * D + s * S.rgb * .1 * S.a;\n\
   return c;\n\
} \n\
';

   function prependDefs(shader_code, definitions) {
      return "#define " + definitions.join("#define ") + shader_code;
   }
