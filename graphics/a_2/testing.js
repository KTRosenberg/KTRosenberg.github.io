
varying vec3 vPos;                               // Position in image
uniform float uTime;                             // Time
vec3 LDir = normalize(vec3(1.,-sin(uTime),.5));  // Light direction

struct sphere {
  vec3 V;
  vec3 W;
  vec4 S;
  vec2 t;
};

sphere arr[3];

vec2 raytraceSphere(vec3 V, vec3 W, vec4 S) {
   V -= S.xyz;
   float B = 2. * dot(V, W);
   float C = dot(V, V) - S.w * S.w;;
   float discrim = B*B - 4.*C;
   return discrim < 0. ? vec2(-1., -1)
                       : vec2(-B - discrim, -B + discrim) / 2.;
}

vec2 raytraceSphere(sphere s)
{
   vec3 V = s.V;
   vec3 W = s.W;
   vec4 S = s.S;
   
   V -= S.xyz;
   float B = 2. * dot(V, W);
   float C = dot(V, V) - S.w * S.w;;
   float discrim = B*B - 4.*C;
   return discrim < 0. ? vec2(-1., -1)
                       : vec2(-B - discrim, -B + discrim) / 2.;
}

void main() {
   vec3 c = vec3(.01,.01,.04);                // Dark background

   sphere cur;
   arr[0] = cur;
   arr[0].V = vec3(0.,0.,0.);                     // Ray origin
   arr[0].W = normalize(vec3(vPos.xy, -3.));       // Ray direction
   arr[0].S = vec4(cos(uTime),sin(uTime),-5.,.5);  // Animate sphere

   arr[1] = arr[0];
   arr[1].W = normalize(vec3(vPos.xy, -2.));
   arr[0].t = raytraceSphere(arr[0]);             // Ray trace sphere
   arr[1].t = raytraceSphere(arr[1]);             // Ray trace sphere

    for (int i = 0; i < 2; i++) {
       if (arr[i].t.x > 0.) {
          vec3 P = arr[i].V + arr[i].t.x * arr[i].W;                      // Point on sphere
          vec3 N = normalize(P - arr[i].S.xyz);             // Surface normal
          float brightness = max(0., dot(N, LDir));
          brightness = mix(.1, brightness, .5);      // Diffuse surface
          c = vec3(.1,1.,.1) * brightness;
       }
    }

   gl_FragColor = vec4(sqrt(c), 1.);             // Final pixel color
}
