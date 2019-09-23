#version 300 es
precision highp float;

uniform float uTime;
in vec3 vPos;
out vec4 fragColor;

// mini utility library

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

const float RAYTRACE_OUTOFBOUNDS = 1000.0;
const int   RT_MAX_RECURSION_DEPTH = 5;

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

struct Plane {
    vec3 center;
    vec3 normal;
    Material mat;
};

#define MAX_SPHERE_COUNT  (4)
#define MAX_PLANE_COUNT  (2)
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

    int plane_count;
    Plane planes[MAX_PLANE_COUNT];


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
Ray ray, \
out Raytrace_Result res

#define RT_PLANE_PARAM_LIST \
in Ray ray, \
out Raytrace_Result res


bool raytrace_spheres(RT_SPHERE_PARAM_LIST);
bool raytrace_planes(RT_PLANE_PARAM_LIST);

vec3 calc_phong_lighting(Raytrace_Result res, Material mat, vec3 bg_color, vec3 eye_dir, float intensity);


const float focal_length = 10.0; // distance to image plane

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

vec3 reflection(vec3 I, vec3 N) 
{
    // built-in function does the reverse:
    // I - 2.0 * dot(N, I) * N
      return normalize(reflect(-I, N));
    //return 2.0 * dot(N, I) * N - I;
}

#define PLANE_DISTORTION

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

    ambient = vec4(0.045, 0.02, 0.01, 1.0);

// initialize spheres


    float smv = 0.5 * sin(2.0 * uTime);

    sphere_count = 3;
    spheres[0] = Sphere(
        vec3(-1.0, 0.4, -4.0 + smv),
        0.5 + abs(noise(vec3(vPos.xy * sin(uTime), 0.0))),
        Material(
           vec3(0.,.1,.1),
           vec3(1.0, 0.3, 0.3),
           vec3(1.0, 0.3, 0.3),
           2.0
        )
    );

    spheres[1] = Sphere(
        vec3(.5,smv,-4.-smv),
        0.5,
        Material(
           vec3(0.,.1,.1),
           vec3(.3,.3,1),
           vec3(.3,.3,1),
           6.0
        )
    );

    spheres[2] = Sphere(
        vec3(0.,-.5, -4.0) + vec3(cos(uTime), 0.0, sin(uTime)),
        0.5,
        Material(
            vec3(0.,.1,.1),
            vec3(1,.7,0.),
            vec3(1,.7,0.),
            10.0
        )
    );

// instantiate planes
   // make the plane react to the position
   // of the yellow sphere
   

   plane_count = 1;
   planes[0] = Plane(
       vec3(0.0,-1.0, 0.0),
       vec3(0.0, 1.0, 0.0),
       Material(
          vec3(0.,.1,.1),
          vec3(0.,.1,.1),
          vec3(0.,.1,.1),
          1.0
       )
   );
}
bool raytrace(in Raytrace_Config conf, out Raytrace_Pass_Output res)
{    
    vec3 color = ambient.rgb;
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
    float intensity = 1.0;
    for (int recursion_depth = 0; 
        recursion_depth < RT_MAX_RECURSION_DEPTH; 
        recursion_depth += 1) 
    {
        Ray_init(ray, origin, direction);

        float dist = RAYTRACE_OUTOFBOUNDS;

        Material hit_material;

        if (raytrace_spheres(ray, rt_res[RT_TYPE_SPHERE])) {

            hit = true;

            if (rt_res[RT_TYPE_SPHERE].t < dist) {
                dist         = rt_res[RT_TYPE_SPHERE].t;
                result_idx   = RT_TYPE_SPHERE;
                hit_material = spheres[rt_res[RT_TYPE_SPHERE].index].mat;
            }
        }

        if (raytrace_planes(ray, rt_res[RT_TYPE_PLANE])) {
            hit = true;

            if (rt_res[RT_TYPE_PLANE].t < dist) {
                dist         = rt_res[RT_TYPE_PLANE].t;
                result_idx   = RT_TYPE_PLANE;
                hit_material = planes[rt_res[RT_TYPE_PLANE].index].mat;
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
            hit_material,  
            ambient.rgb, 
            eye_dir,
            intensity
        );

        intensity *= 0.8;

        origin    = rt_hit.point + RT_EPSILON * ray.W;
        direction = reflection(-ray.W, rt_hit.normal);
    }

    res.hit = hit;
    res.color = color;
    return res.hit;
}


#define OLD_RT_SPHERE (0)

#if (OLD_RT_SPHERE)
    #define raytrace_sphere(t, ray_, S) do { \
        vec3 V = ray_.V - S.center; \
        float B = 2. * dot(V, ray_.W); \
        float C = dot(V, V) - S.r * S.r; \
        float discrim = B*B - 4.*C; \
        if (discrim == 0.0) { \
             t = -B / 2.0;                      \
        } else if (discrim > 0.0) {\
             t = min(-B + discrim, -B - discrim) / 2.0; \
        }\
    } while (false)
#else
    #define raytrace_sphere(t, ray_, S) do { \
        vec3 origin = ray_.V - S.center; \
        float dir_dot_origin = dot(ray_.W, origin); \
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
        raytrace_sphere(t, ray, spheres[i]);
        if (t < min_dist && t >= 0.0) {
            min_dist = t;
            i_sphere = i;
            res.type = RT_TYPE_SPHERE;
            res.index  = i;
            res.t = t;
        }
   }

    if (res.type != RT_TYPE_MISS) {
        res.point  = (ray.V + (min_dist * ray.W));
        res.normal = normalize(res.point - spheres[i_sphere].center);
        return true;
    }
    return false;
}


#define raytrace_plane(t, ray, P) do { \
    vec3 C = P.center; \
    vec3 N = -P.normal; \
    float hit_test = dot(N, ray.W); \
    float local_t; \
    if (hit_test > RT_EPSILON) { \
        local_t = dot(C - ray.V, N) / hit_test; \
        if (local_t >= 0.0) { \
            t = local_t; \
        } \
    } \
} while (false)

bool raytrace_spheres_shadow(RT_SPHERE_PARAM_LIST)
{
    for (int i = 0; i < MAX_SPHERE_COUNT; i += 1) {
        if (i == sphere_count) {
            break;
        }

        float t = -RAYTRACE_OUTOFBOUNDS;
        raytrace_sphere(t, ray, spheres[i]);
        if (t > 0.0) {
            return true;
        }
    }
    for (int i = 0; i < MAX_PLANE_COUNT; i += 1) {
        if (i == plane_count) {
            break;
        }

        float t = -RAYTRACE_OUTOFBOUNDS;
        raytrace_plane(t, ray, planes[i]);
        if (t > 0.0) {
            return true;
        }
    }
    return false;
}


bool raytrace_planes(RT_PLANE_PARAM_LIST) 
{
   float min_dist = RAYTRACE_OUTOFBOUNDS;
   vec3  normal;
   int   i_entity = -1;
   res.type = RT_TYPE_MISS;


   for (int i = 0; i < MAX_PLANE_COUNT; i += 1) {
        if (i == plane_count) {
            break;
        }

        float t = RAYTRACE_OUTOFBOUNDS;
        raytrace_plane(t, ray, planes[i]);
        if (t < min_dist && t >= 0.0) {
            min_dist = t;
            i_entity = i;
            res.type = RT_TYPE_PLANE;
            res.index  = i;
            res.t = t;
        }
   }

    if (res.type != RT_TYPE_MISS) {
        res.point  = (ray.V + (min_dist * ray.W));
        res.normal = planes[i_entity].normal;

        return true;
    }
    return false;
}



bool raytrace_planes_shadow(RT_PLANE_PARAM_LIST)
{
    for (int i = 0; i < MAX_SPHERE_COUNT; i += 1) {
        if (i == sphere_count) {
            break;
        }

        float t = -RAYTRACE_OUTOFBOUNDS;
        raytrace_sphere(t, ray, spheres[i]);
        if (t > 0.0) {
            return true;
        }
    }
    for (int i = 0; i < MAX_PLANE_COUNT; i += 1) {
        if (i == plane_count) {
            break;
        }

        float t = -RAYTRACE_OUTOFBOUNDS;
        raytrace_plane(t, ray, planes[i]);
        if (t > 0.0) {
            return true;
        }
    }
    return false;
}

//vec3 refract(vec3 I, vec3 N, float indexof
vec3 calc_phong_lighting(Raytrace_Result res, Material mat, vec3 bg_color, vec3 eye_dir, float intensity)
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
        if (!raytrace_spheres_shadow(ray, rt_res) && 
            !raytrace_planes_shadow(ray, rt_res)) 
        {
            float diffuse = max(0.0, dot(N, L));
            vec3 R = reflection(N, L); // reflection vector about the normal
            float specular = pow(max(0.0, dot(eye_dir, R)), mat.spec_pow);
            color += intensity * d_light[i].color * ((mat.diffuse * diffuse) + (mat.specular * specular));
        }
    }

    return color;

}

