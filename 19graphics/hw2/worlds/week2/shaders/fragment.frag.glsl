#version 300 es
precision highp float;

uniform float uTime;
in vec3 vPos;
out vec4 fragColor;

const float RAYTRACE_OUTOFBOUNDS = 1000.0;
const int   RT_MAX_RECURSION_DEPTH = 4;

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
#define MAX_D_LIGHT_COUNT (4)
#define MAX_P_LIGHT_COUNT (4)

#define RT_EPSILON (0.001)


    int d_light_count;
    Dir_Light d_light[MAX_D_LIGHT_COUNT];

//  int p_l_count;
//  Point_Light p_light[MAX_P_LIGHT_COUNT];

    vec4 ambient;

    int sphere_count;
    Sphere spheres[MAX_SPHERE_COUNT];


const int RT_TYPE_SPHERE =  0;
const int RT_TYPE_PLANE  =  1;
const int RT_TYPE_MISS   = -1;
const int RT_TYPE_COUNT  = 2;

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

void Ray_init(out Ray ray, vec3 origin, vec3 direction) 
{
    ray.V = origin;
    ray.W = direction;
}

void init(void);
bool raytrace(in Raytrace_Config conf, out Raytrace_Pass_Output pass);

#define RT_SPHERE_PARAM_LIST \
Ray params, \
out Raytrace_Result res

bool raytrace_spheres(RT_SPHERE_PARAM_LIST);

vec3 calc_phong_lighting(Raytrace_Result res, Material mat, vec3 bg_color, vec3 eye_dir);


const float focal_length = 20.0; // distance to image plane

void main(void)
{
    init();

    vec4 color = vec4(vec3(0.0), 0.5);
    
    rt_conf = Raytrace_Config(
        vPos, 
        focal_length
    );
    Raytrace_Pass_Output res;
    if (raytrace(rt_conf, res)) {
    }
    color = vec4(res.color, 1.0);


    fragColor = color;
}

vec3 reflection(vec3 L, vec3 N) 
{
     return 2.0 * dot(N, L) * N - L;
}

void init(void)
{

// initialize world lights
    d_light_count = 2;
    d_light[0] = Dir_Light(
        vec3(.5,.5,1.0),
        normalize(vec3(1.,1.,1.))
    );
    d_light[1] = Dir_Light(
        vec3(.2,.1,.1),
        normalize(vec3(-1.,-1.,-1.))
    );

    ambient = vec4(0.2, 0,1, 0.1);

// initialize spheres


    float smv = 0.5 * sin(2.0 * uTime);

    sphere_count = 3;
    spheres[0] = Sphere(
        vec3(-0.5, 0.4, -4.0 + smv),
        0.5,
        Material(
           vec3(0.,.1,.1),
           vec3(1.0, 0.3, 0.3),
           vec3(1.0, 0.3, 0.3),
           2.0
        )
    );

    spheres[1] = Sphere(
        vec3(.5,.4,-4.-smv),
        0.5,
        Material(
           vec3(0.,.1,.1),
           vec3(.3,.3,1),
           vec3(.3,.3,1),
           6.0
        )
    );

    spheres[2] = Sphere(
        vec3(0.,-.5, -4.0),
        0.5,
        Material(
            vec3(0.,.1,.1),
            vec3(1,.7,0.),
            vec3(1,.7,0.),
            10.0
        )
    );
}
bool raytrace(in Raytrace_Config conf, out Raytrace_Pass_Output res)
{    
    vec3 color = vec3(0.0);
    vec3 eye_dir;

    vec3 origin = vec3(0.0, 0.0, conf.focal_len); // V: observer position
    vec3 direction = normalize(                   // W: direction of ray to pixel
        vec3(conf.pos.xy, -conf.focal_len)
    );


    
    Raytrace_Result rt_res[RT_TYPE_COUNT];
    Raytrace_Result rt_hit;
    
    int result_idx;

    Ray ray;
    bool hit = false;
    for (int recursion_depth = 0; 
        recursion_depth < RT_MAX_RECURSION_DEPTH; 
        recursion_depth += 1) 
    {
        Ray_init(ray, origin, direction);

        float dist = RAYTRACE_OUTOFBOUNDS;

        if (raytrace_spheres(ray, rt_res[RT_TYPE_SPHERE])) {

            hit = true;

            if (rt_res[RT_TYPE_SPHERE].t < dist) {
                dist = rt_res[RT_TYPE_SPHERE].t;
                result_idx = RT_TYPE_SPHERE;
            }
        }

        if (false) {
            hit = true;

            if (rt_res[RT_TYPE_PLANE].t < dist) {
                dist = rt_res[RT_TYPE_PLANE].t;
                result_idx = RT_TYPE_PLANE;
            }
        }

        if (!hit) {
            color += ambient.rgb * 0.25;
            break;
        } else {
            rt_hit = rt_res[result_idx];
        }

        eye_dir = -normalize(rt_hit.point);

        color += calc_phong_lighting(
            rt_hit, 
            spheres[rt_hit.index].mat,  
            ambient.rgb, 
            eye_dir
        );
        for (int i = 0; i < MAX_D_LIGHT_COUNT; i += 1) {
             d_light[i].color *= 0.5;
             d_light[i].color = max(vec3(0.01), d_light[i].color);
        }
        origin    = rt_hit.point + RT_EPSILON * ray.W;
        direction = reflection(-ray.W, rt_hit.normal);
    }

    res.hit = hit;
    res.color = color;
    return res.hit;
}


#define OLD_RT_SPHERE (1)

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
        if (discrim >= 0.0 && discrim < RT_EPSILON) { \
            t = -dir_dot_origin; \
        } else if (discrim >= RT_EPSILON) { \
            float sqroot = sqrt(discrim); \
            \
            t = -dir_dot_origin + min(sqroot, -sqroot); \
        } \
    } while (false)
#endif

bool raytrace_spheres(RT_SPHERE_PARAM_LIST) 
{
   float min_dist = RAYTRACE_OUTOFBOUNDS;
   vec3  normal;
   int   i_sphere = -1;
   res.type = RT_TYPE_MISS;


   for (int i = 0; i < MAX_SPHERE_COUNT; i += 1) {
        if (i == sphere_count) {
            break;
        }

        float t = RAYTRACE_OUTOFBOUNDS;
        raytrace_sphere(t, params.V, params.W, spheres[i]);
        if (t < min_dist && t >= 0.0) {
            min_dist = t;
            i_sphere = i;
            res.type = RT_TYPE_SPHERE;
            res.index  = i;
            res.t = t;
        }
   }

    if (res.type != RT_TYPE_MISS) {
        res.point  = (params.V + (min_dist * params.W));
        res.normal = normalize(res.point - spheres[i_sphere].center);
        return true;
    }
    return false;
   
}

bool raytrace_spheres_shadow(RT_SPHERE_PARAM_LIST)
{
    for (int i = 0; i < MAX_SPHERE_COUNT; i += 1) {
        if (i == sphere_count) {
            break;
        }

        float t = -RAYTRACE_OUTOFBOUNDS;
        raytrace_sphere(t, params.V, params.W, spheres[i]);
        if (t > RT_EPSILON) {
            return true;
        }
    }
    return false;
}


vec3 calc_phong_lighting(Raytrace_Result res, Material mat, vec3 bg_color, vec3 eye_dir)
{
    vec3 N = res.normal;

    vec3 color = mat.ambient * ambient.rgb;

    for (int i = 0; i < MAX_D_LIGHT_COUNT; i += 1) {
        if (i == d_light_count) { 
            break; 
        }

        vec3 L = (d_light[i].dir);
        

        float dist = RAYTRACE_OUTOFBOUNDS;
        Ray ray = Ray(res.point + (N * RT_EPSILON), L);
        Raytrace_Result rt_res;


        // raytrace to spheres
        if (!raytrace_spheres_shadow(ray, rt_res)) {
            float diffuse = max(0.0, dot(N, L));
            vec3 R = reflection(N, L); // reflection vector about the normal
            float specular = pow(max(0.0, dot(eye_dir, R)), mat.spec_pow);
            color += d_light[i].color * ((mat.diffuse * diffuse) + (mat.specular * specular));
        }
    }

    return color;

}

