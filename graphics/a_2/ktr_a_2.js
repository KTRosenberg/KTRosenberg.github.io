////////////////////////////////////////////////////////////////////////////////
varying vec3 vPos;                               /* Position in image */
uniform float uTime;                             /* Time */

/* Light directions */

/* enable specific light directions */
#define BRIGHT_1 true
#define BRIGHT_2 false
#define BRIGHT_3 true

vec3 LDir = normalize(vec3(1.,-sin(uTime),.5));  
vec3 LDir2 = normalize(vec3(-cos(uTime),0.,.5));           
vec3 LDir3 = normalize(vec3(1., sin(uTime), sin(uTime)));

#define NUM_SPHERES (3)

/* 
 * constants for calculating where to darken pixels for generating a "texture"
 * on the spheres
 */
#define TEXTURE_CONST (uTime)
#define TEXTURE_CONST_2 (-cos(uTime))

/*
 * packages values required to
 * ray-trace and render a sphere
 */
struct sphere {
    vec3 V;
    vec3 W;
    vec4 S;
    vec2 t;
};

/* holds each sphere struct */
sphere spheres[NUM_SPHERES];

/*
 * initializes a sphere struct, omitting t
 *
 * param:
 *     vec3, V
 *         ray origin
 *     vec3, W
 *         normalized ray direction
 *     vec4, S
 *         sphere coordinates and radius
 *         x, y, z, r
 * return:
 *     sphere struct
 */
sphere init_sphere(vec3 V, vec3 W, vec4 S)
{   
    sphere s;
    s.V = V;
    s.W = W;
    s.S = S;
    return s;
}

/*
 * ray-traces a sphere
 * 
 * param:
 *     sphere
 *         the sphere to ray-trace
 * return:
 *     vec2
 *         t vector
 */
vec2 raytraceSphere(sphere s)
{
    vec3 V = s.V;
    vec3 W = s.W;
    vec4 S = s.S;

    V -= S.xyz;
    float B = 2. * dot(V, W);
    float C = dot(V, V) - S.w * S.w;;
    float discrim = B * B - 4. * C;
    return ((discrim < 0.) ? vec2(-1., -1) 
                          : vec2(-B - discrim, -B + discrim) / 2.);
}

/* same as above, but individual values passed, created by Professor Perlin */
vec2 raytraceSphere(vec3 V, vec3 W, vec4 S)
{
    V -= S.xyz;
    float B = 2. * dot(V, W);
    float C = dot(V, V) - S.w * S.w;;
    float discrim = B * B - 4. * C;
    return ((discrim < 0.) ? vec2(-1., -1)
                           : vec2(-B - discrim, -B + discrim) / 2.);
}

int index_sphere_to_draw(void)
{
    int index = -1;
    const float max_t_val = 50.;
    float min_t_x = max_t_val;
    
    for (int i = 0; i < NUM_SPHERES; i++) {
        float t_x = spheres[i].t.x;
        if (t_x > 0. && t_x < min_t_x) {
            index = i;
            min_t_x = t_x;
        }
    }
    return index;
}

/*
 * calculates the brightness with hard-coded light directions
 * and a given normal
 * 
 * param:
 *     vec3 N
 *         the surface normal
 * return:
 *     float
 *         brightness value
 */
float calc_brightness(vec3 N)
{
    float brightness  = (BRIGHT_1) ? max(0., dot(N, LDir)) : 0.;
    float brightness2 = (BRIGHT_2) ? max(0., dot(N, LDir2)) : 0.;
    float brightness3 = (BRIGHT_3) ? max(0., dot(N, LDir3)) : 0.;
    return (mix(.1, brightness + brightness2 + brightness3, .5));
}

/* 
 * generates texture to mix into the sphere color
 *
 * param:
 *     vec2 p 
 *         manipulated x,y pixel coordinated value
 *         to be manipulated further
 * return
 *     float
 *         non-positive value will darken the pixel
 */
float calc_pattern(vec2 p)
{
    return (sin(TEXTURE_CONST) 
            + sin((TEXTURE_CONST_2 * p.y * p.x) 
            + cos(p.x) * .01));
}

void main(void)
{
    /* dynamic background -- moving red-tinted gradient */
    vec3 c = vec3(.1 * sin(vPos.y + uTime), .01, .04) + 0.005 * vPos.x;
    
    /* first sphere */
    
    /* ray origin */
    /* ray direction */
    /* animate sphere */
    spheres[2] = init_sphere(vec3(0., 0., 0.), 
                             normalize(vec3(vPos.xy, -3.)),  
                             vec4(cos(uTime), sin(uTime), -5., .5));
    /* ray trace sphere */
    spheres[2].t = raytraceSphere(spheres[2]); 
    
    /* second sphere */
    spheres[1] = init_sphere(vec3(0., 0., 0.), 
                             normalize(vec3(vPos.xy, sin(uTime))),  
                             vec4(cos(uTime),sin(uTime), -5., .5));           
    spheres[1].t = raytraceSphere(spheres[1]);

    /* third sphere */
    spheres[0] = init_sphere(vec3(0., 0., 9.), 
                             normalize(vec3(vPos.xy, -3)),  
                             vec4(cos(uTime), -sin(uTime), -3., .5));           
    spheres[0].t = raytraceSphere(spheres[0]);

    for (int i = 0; i < NUM_SPHERES; i++) {
        if (spheres[i].t.x > 0.) {
            /* point on sphere */
            vec3 P = spheres[i].V + spheres[i].t.x * spheres[i].W;
            /* Surface normal */
            vec3 N = normalize(P - spheres[i].S.xyz);
            /* brightness for diffuse surface */
            float brightness = calc_brightness(N);
            c = vec3(2.*vPos.y+sin(uTime),0.0,.2) * brightness;

            // alteration = vec2(0. / 200., 0. / 200.);
            float z = calc_pattern(4. * vPos.xy);
            if (z > 0.) {
                c = mix(c, vec3(1., 1., 1.), c);
            }
        }
    }

   gl_FragColor = vec4(sqrt(c), 1.);             // Final pixel color
}
