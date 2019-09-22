#version 300 es
precision highp float;

uniform float uTime;
in vec3 vPos;
out vec4 fragColor;

const float RAYTRACE_OUTOFBOUNDS = 1000.0;


// types

struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float spec_pow;
};

struct Dir_Light {
    vec3 color;
    vec3 dir;
};

struct Point_Light {
    vec3 color;
    vec3 pos;
};

struct Sphere {
    vec3     center;
    float    r;
    Material mat;    
};

#define MAX_SPHERE_COUNT  (4)
#define MAX_D_LIGHT_COUNT (8)
#define MAX_P_LIGHT_COUNT (8)

#define RT_EPSILON (0.001)


    int d_light_count;
    Dir_Light d_light[MAX_D_LIGHT_COUNT];

//  int p_l_count;
//  Point_Light p_light[MAX_P_LIGHT_COUNT];

    vec4 ambient;

    int sphere_count;
    Sphere spheres[MAX_SPHERE_COUNT];


const int RT_TYPE_SPHERE = 0;
const int RT_TYPE_PLANE  = 1;

struct Raytrace_Result {
    float t;
    vec3 normal;
    vec3 point;
    int type;
    int index;
};

struct Raytrace_Pass_Output {
    bool hit;
    vec3 color;
};

struct Raytrace_Config {
    vec3  pos;
    float focal_len;
};
Raytrace_Config rt_conf;

struct Ray {
   vec3 V;
   vec3 W;
};

void init();
bool raytrace(in Raytrace_Config conf, out Raytrace_Pass_Output pass);

#define RT_SPHERE_PARAM_LIST \
Ray params, \
out Raytrace_Result res, \
int len, \
const Sphere spheres[MAX_SPHERE_COUNT]

void raytrace_spheres(RT_SPHERE_PARAM_LIST);

vec3 calc_phong_lighting(Raytrace_Result res, Material mat, vec3 bg_color, vec3 eye_dir);


const float focal_length = 10.0; // distance to image plane

void main(void)
{
    init();

    spheres[0].center.x = 0.5;
    spheres[0].center.z = 0.0;
    spheres[0].center.y = 0.5;
    spheres[1].center.x = -0.5;
    spheres[1].center.z = sin(uTime);
    // d_light[0].dir.x    += sin(uTime);
    // d_light[0].dir.y    += cos(uTime);
    // d_light[0].dir       = normalize(d_light[0].dir);

    d_light[0].dir.x = 0.5;
    d_light[0].dir.y = 0.0;
    d_light[0].dir.z = 0.9;
    d_light[0].dir.z = 0.0;
    d_light[0].dir = normalize(d_light[0].dir);

    vec3 bg_color = vec3(0.0);
    
    rt_conf = Raytrace_Config(
        vPos, 
        focal_length
    );
    Raytrace_Pass_Output res;
    if (raytrace(rt_conf, res)) {
       fragColor = vec4(res.color, 1.0); 
    } else {
       fragColor = vec4(bg_color, 1.0); 
    }



}

void init()
{
// initialize world lights
    d_light_count = 1;
    d_light[0] = Dir_Light(
        vec3(1.,1.,1.),
        normalize(vec3(1., 1., .5))
    );
    d_light[1] = Dir_Light(
        vec3(.1,.07,.05),
        normalize(vec3(-1.,0.,-2.))
    );

    ambient = vec4(0.2, 0,1, 0.1);

// initialize spheres
    sphere_count = 2;
    spheres[0] = Sphere(
        vec3(0.2, 0.0, 0.0),
        0.3,
        Material(
           vec3(0.,.1,.1),
           vec3(0.,.5,.5),
           vec3(0.,.1,.1),
           10.
        )
    );

    spheres[1] = Sphere(
        vec3(-.6,0.4,-1.),
        0.5,
        Material(
           vec3(.1, .1, 0.),
           vec3(.5, .5, 0.),
           vec3(1., 1., 1.),
           20.
        )
    );
}
bool raytrace(in Raytrace_Config conf, out Raytrace_Pass_Output res)
{
    vec3 V = vec3(0.0, 0.0, conf.focal_len); // observer position
    vec3 W = normalize(vec3(conf.pos.xy, -conf.focal_len)); // direction of ray to pixel
    
    float dist = RAYTRACE_OUTOFBOUNDS;
    
    Ray ray = Ray(V, W);
    Raytrace_Result rt_res;
    // raytrace to spheres
    raytrace_spheres(ray, rt_res, sphere_count, spheres);

    dist = min(dist, rt_res.t);

    vec3 eye_dir = -normalize(rt_res.point);

    vec3 color = vec3(0.0);
    color += calc_phong_lighting(rt_res, spheres[rt_res.index].mat,  vec3(0.01, 0.257, 0.67), eye_dir);

    res.hit = dist != RAYTRACE_OUTOFBOUNDS;
    res.color = color;
    return res.hit;
}


#define OLD_RT_SPHERE (0)

#if (OLD_RT_SPHERE)
    #define raytrace_sphere(t, V_, W_, S) do { \
        vec3 V = V_ - S.center; \
        float B = 2. * dot(V, W_); \
        float C = dot(V, V) - S.r * S.r; \
        float discrim = B*B - 4.*C; \
        if (discrim == 0.0) { \
             t = -B / 2.0;                      \
        } else if (discrim > 0.0) {\
             t = min(-B + discrim, -B - discrim) / 2.0; \
        }\
    } while (false)
#else
    #define raytrace_sphere(t, V_, W_, S) do { \
        vec3 origin = V_ - S.center; \
        float dir_dot_origin = dot(W_, origin); \
        \
        float discrim = (dir_dot_origin * dir_dot_origin) - \
                        dot(origin, origin) + \
                        (S.r * S.r); \
        \
        if (discrim == 0.0) { \
            t = -dir_dot_origin; \
        } else if (discrim > 0.0) { \
            float sqroot = sqrt(discrim); \
            \
            t = -dir_dot_origin + min(sqroot, -sqroot); \
        } \
    } while (false)
#endif

void raytrace_spheres(RT_SPHERE_PARAM_LIST) 
{
   float min_dist = RAYTRACE_OUTOFBOUNDS;
   vec3 normal;
   int i_sphere;

   for (int i = 0; i < MAX_SPHERE_COUNT; i += 1) {
        if (i == sphere_count) {
            break;
        }

        float t = RAYTRACE_OUTOFBOUNDS;
        raytrace_sphere(t, params.V, params.W, spheres[i]);
        if (t < min_dist) {
            min_dist = t;
            i_sphere = i;
        }
   }

   res.t      = min_dist;
   res.point  = (params.V + (min_dist * params.W));
   res.normal = normalize(res.point - spheres[i_sphere].center);
   res.type   = RT_TYPE_SPHERE;
   res.index  = i_sphere;
}

bool raytrace_spheres_shadow(RT_SPHERE_PARAM_LIST)
{
    for (int i = 0; i < MAX_SPHERE_COUNT; i += 1) {
        if (i == sphere_count) {
            break;
        }

        float t = -RAYTRACE_OUTOFBOUNDS;
        raytrace_sphere(t, params.V, params.W, spheres[i]);
        if (t > 0.001) {
            return true;
        }
    }
    return false;
}


vec3 calc_phong_lighting(Raytrace_Result res, Material mat, vec3 bg_color, vec3 eye_dir)
{
    vec3 N = res.normal;

    vec3 color = mat.ambient;

    for (int i = 0; i < MAX_D_LIGHT_COUNT; i += 1) {
        if (i == d_light_count) { 
            break; 
        }

        vec3 L = (d_light[i].dir);
        

        float dist = RAYTRACE_OUTOFBOUNDS;
        Ray ray = Ray(res.point + (N * RT_EPSILON), L);
        Raytrace_Result rt_res;
        // raytrace to spheres
        if (!raytrace_spheres_shadow(ray, rt_res, sphere_count, spheres)) {
            float diffuse = max(0.0, dot(N, L));
            vec3 R = 2.0 * dot(N, L) * N - L; // reflection vector about the normal
            float specular = pow(max(0.0, dot(eye_dir, R)), mat.spec_pow);
            color += d_light[i].color * ((mat.diffuse * diffuse) + (mat.specular * specular));
        }
    }

    return color;

}

