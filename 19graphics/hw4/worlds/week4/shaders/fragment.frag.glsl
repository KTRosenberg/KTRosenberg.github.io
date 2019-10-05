#version 300 es
precision highp float;

// NOTE: Not mean for real-time on lower-end hardware,
// does multiple iterations of reflection and refraction with several objects,
// if slow, try hitting "Alt" to reduce the resolution
// Also, starts-up slowly on Windows due to translation to HLSL / DirectX

uniform float uTime;
in vec3 vPos;
out vec4 fragColor;

// mini utility library

float sin01(float v) {
    return (1.0 + sin(v)) / 2.0;
}

#define PI 3.1415926535897932384626433832795


#define ORIGIN vec4(0.0, 0.0, 0.0, 0.0)

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

const float RAYTRACE_OUTOFBOUNDS   = 1000.0;
const int   RT_MAX_RECURSION_DEPTH = 4;
const int   RT_MAX_STEPS           = 4;
const bool  enable_refraction      = true;
const bool  enable_reflection      = true;

// types

struct Material {
    vec3  ambient;
    vec3  diffuse;
    vec3  specular;
    float spec_pow;
    
    vec4  reflection; // mirror rgb, .w is whether should reflect or not 
    vec4  refraction; // transparency rgb, .w is index of refraction

    int fxproc_before_intersection;
    int fxproc_after_reflection;
    int fxproc_after_refraction;
};

#define should_reflect(mat_) mat_.reflection.w == 1.0
#define should_refract(mat_) mat_.refraction != vec4(1.0)
#define reflection_color(mat_) mat_.reflection.rgb
#define refraction_color(mat_) mat_.refraction.rgb

#define refractive_index_of(mat_) mat_.refraction.w
#define NO_REFLECT vec4(0.0)
#define NO_REFRACT vec4(1.0)
#define OPAQUE vec4(1.0)
#define TRANSPARENT vec4(0.0, 0.0, 0.0, 1.0)

const float IDX_REFRACT_WATER        = 1.33;
const float IDX_REFRACT_ICE          = 1.31;
const float IDX_REFRACT_DIAMOND      = 2.417;
const float IDX_REFRACT_SAPPHIRE     = 1.77;
const float IDX_REFRACT_FUSED_QUARTZ = 1.46;

struct Transform {
    mat4 model;
    mat4 inverse;
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
    Transform xform;
    Material mat;    
};

struct Plane {
    vec3 center;
    vec3 normal;
    Material mat;
};

#define MAX_POLY_PLANES (10)
struct Polyhedron {
    vec3  center;
    float r;
    int   plane_count;
    Material mat;
    vec4  planes[MAX_POLY_PLANES];
    Transform xform;
};
void Polyhedron_init(inout Polyhedron poly, vec3 center, float r, int plane_count, in Material mat)
{
    poly.center      = center;
    poly.r           = r;
    poly.plane_count = plane_count;
    poly.mat         = mat;
}

#define MAX_SPHERE_COUNT  (3)
#define MAX_PLANE_COUNT  (1)
#define MAX_POLYHEDRON_COUNT (6)
#define MAX_D_LIGHT_COUNT (2)
#define MAX_P_LIGHT_COUNT (1)

#define RT_EPSILON (0.001)

uniform vec4 ambient;

const int d_light_count = 2;
Dir_Light d_light[MAX_D_LIGHT_COUNT];

uniform int sphere_count;
uniform Sphere spheres[MAX_SPHERE_COUNT];

uniform int polyhedron_count;
uniform Polyhedron polyhedra[MAX_POLYHEDRON_COUNT];

uniform int plane_count;
Plane planes[MAX_PLANE_COUNT];

const int RT_TYPE_SPHERE     =  0;
const int RT_TYPE_PLANE      =  1;
const int RT_TYPE_POLYHEDRON =  2;
const int RT_TYPE_MISS       = -1;
const int RT_TYPE_COUNT      =  3;

struct Raytrace_Result {
    float    t;
    float    t2;
    vec3     normal;
    vec3     point;
    int      type;
    int      index;
    Material mat;
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

#define RT_FX_PROC_BEFORE_INTERSECTION_TEST_1
#define RT_FX_PROC_BEFORE_INTERSECTION_TEST_2
#define RT_FX_PROC_BEFORE_INTERSECTION_TEST_3
#define RT_FX_PROC_BEFORE_INTERSECTION_TEST_4
#define RT_FX_PROC_BEFORE_INTERSECTION_TEST_5
#define RT_FX_PROC_BEFORE_INTERSECTION_TEST_6
#define RT_FX_PROC_BEFORE_INTERSECTION_TEST_7

void on_reflection_default(inout Ray r, inout Raytrace_Result res)
{

}

void on_reflection_noisy_ocean(inout Ray r, inout Raytrace_Result res)
{

}

#define RT_FX_PROC_ON_REFLECTION_1 on_reflection_default
#define RT_FX_PROC_ON_REFLECTION_2 on_reflection_noisy_ocean
#define RT_FX_PROC_ON_REFLECTION_3
#define RT_FX_PROC_ON_REFLECTION_4
#define RT_FX_PROC_ON_REFLECTION_5
#define RT_FX_PROC_ON_REFLECTION_6
#define RT_FX_PROC_ON_REFLECTION_7

#define RT_FX_PROC_ON_REFRACTION_1
#define RT_FX_PROC_ON_REFRACTION_2
#define RT_FX_PROC_ON_REFRACTION_3
#define RT_FX_PROC_ON_REFRACTION_4
#define RT_FX_PROC_ON_REFRACTION_5
#define RT_FX_PROC_ON_REFRACTION_6
#define RT_FX_PROC_ON_REFRACTION_7

void Ray_init(out Ray ray, vec3 origin, vec3 direction) 
{
    ray.V = origin;
    ray.W = direction;
}

Ray Ray_make(vec3 origin, vec3 direction) 
{
    return Ray(origin, normalize(direction));
}

void init(void);
bool raytrace(in Raytrace_Config conf, out Raytrace_Pass_Output pass);

#define RT_SPHERE_PARAM_LIST \
in Ray ray, \
out Raytrace_Result res

#define RT_PLANE_PARAM_LIST \
in Ray ray, \
out Raytrace_Result res

#define RT_POLYHEDRON_PARAM_LIST \
in Ray ray, \
out Raytrace_Result res

#define RT_SHADOW_PARAM_LIST \
in Ray ray, \
out Raytrace_Result res

bool raytrace_spheres(RT_SPHERE_PARAM_LIST);
bool raytrace_planes(RT_PLANE_PARAM_LIST);
bool raytrace_polyhedra(RT_POLYHEDRON_PARAM_LIST);

vec3 calc_phong_lighting(Raytrace_Result res, inout Material mat, vec3 bg_color, vec3 eye_dir, float intensity);


const float focal_length = 3.0; // distance to image plane


vec3 reflection(vec3 I, vec3 N) 
{
    // built-in function does the reverse:
    // I - 2.0 * dot(N, I) * N
    return normalize(reflect(-I, N));
      //return normalize(2.0 * dot(N, I) * N - I);
}

void init(void)
{

// initialize world lights
    d_light[0] = Dir_Light(
        vec3(.5,.5,1.0),
        normalize(vec3(sin01(uTime),sin01(uTime),-1.0))
    );
    d_light[1] = Dir_Light(
        vec3(1.0,.1,.1),
        normalize(vec3(0.0,-1.0,0.0))
    );

// initialize spheres


    float smv = 0.5 * sin(2.0 * uTime);
    /*
    spheres[0] = Sphere(
        vec3(0.0 - sin(uTime), 1.5, 5.0 * sin(uTime)),
        0.5 ,//+ abs(noise(vec3(vPos.xy * sin(uTime), 0.0))), // NOTE: this doesn't affect the reflections -- would need to do transformation based on raytraced point
        Material(
           vec3(0.,.1,.1),
           vec3(1.0, 0.3, 0.3),
           vec3(1.0, 0.3, 0.3),
           2.0,

            vec4(1.0, 1.0, 1.0, 1.0),
            NO_REFRACT
        )
    );

    spheres[1] = Sphere(
        vec3(.5,-0.5,-4.-smv),
        0.3,
        Material(
           vec3(0.,.1,.1),
           vec3(.3,.3,1.0),
           vec3(.3,.3,1),
           6.0,

            vec4(1.0, 1.0, 1.0, 1.0),
            vec4(vec3(0.5), IDX_REFRACT_WATER)
        )
    );

    spheres[2] = Sphere(
        vec3(0.,-.5, -4.0) + vec3(cos(uTime), 0.0, sin(uTime)),
        0.5,
        Material(
            vec3(0.,.1,.1),
            vec3(0.1),
            vec3(1.0),
            100.0,

            vec4(1.0, 1.0, 1.0, 1.0),
            vec4(vec3(0.5), IDX_REFRACT_FUSED_QUARTZ)
        )
    );
    */

// instantiate planes
   // make the plane react to the position
   // of the yellow sphere
   
   planes[0] = Plane(
        vec3(0.0,-1.0 - sin(0.2 * uTime + noise(vPos)), 0.0),
        vec3(0.0, 1.0, sin01(uTime / -2.0) * .25),
        Material(
            vec3(0.,.1,0.76),
            vec3(0.,.1,0.97),
            vec3(0.,.1,.1),
            1.0,

            vec4(1.0, 1.0, 1.0, 1.0),
            vec4(vec3(0.5), IDX_REFRACT_WATER),
            0, 0, 0
       )
    );

   /*

    Polyhedron_init(polyhedra[0],
        vec3(0.0, sin01(uTime), -10),
        0.5,
        6,
        Material(
            vec3(1.0),
            vec3(1.0),
            vec3(0.02, 0.0124, 06234),
            6.0,
            vec4(1.0, 1.0, 1.0, 1.0),
            vec4(vec3(0.5), IDX_REFRACT_FUSED_QUARTZ)
        )
    );

    polyhedra[0].planes[0] = vec4(-1.0,  0.0,  0.0, -polyhedra[0].r);
    polyhedra[0].planes[1] = vec4( 1.0,  0.0,  0.0, -polyhedra[0].r);
    polyhedra[0].planes[2] = vec4( 0.0, -1.0,  0.0, -polyhedra[0].r);
    polyhedra[0].planes[3] = vec4( 0.0,  1.0,  0.0, -polyhedra[0].r);
    polyhedra[0].planes[4] = vec4( 0.0,  0.0, -1.0, -polyhedra[0].r);
    polyhedra[0].planes[5] = vec4( 0.0,  0.0,  1.0, -polyhedra[0].r - (10.0 * sin01(uTime)));

    Polyhedron_init(polyhedra[1],
        vec3(cos(uTime), sin01(uTime), 0.0),
        sin01(-uTime),
        8,
        Material(
            vec3(0.01, 0.2, 0.01),
            vec3(0.67, 0.0, 0.02),
            vec3(0.01, 0.2, 0.6),
            10.0,
            vec4(1.0, 1.0, 1.0, 1.0),
            vec4(vec3(0.5), IDX_REFRACT_DIAMOND)
        )
    );

    {
        float r = polyhedra[1].r;
        float r3 = 1.0 / sqrt(r);
        polyhedra[1].planes[0] = vec4(-r3, -r3, -r3, -r);
        polyhedra[1].planes[1] = vec4( r3, -r3, -r3, -r);
        polyhedra[1].planes[2] = vec4(-r3,  r3, -r3, -r);
        polyhedra[1].planes[3] = vec4( r3,  r3, -r3, -r);
        polyhedra[1].planes[4] = vec4(-r3, -r3,  r3, -r);
        polyhedra[1].planes[5] = vec4( r3, -r3,  r3, -r);
        polyhedra[1].planes[6] = vec4(-r3,  r3,  r3, -r);
        polyhedra[1].planes[7] = vec4( r3,  r3,  r3, -r);
    }

    */

}

#define raytrace_sphere(t, t2, ray_, S) do { \
    vec3 origin = ray_.V - S.center; \
    float dir_dot_origin = dot(ray_.W, origin); \
    \
    float discrim = (dir_dot_origin * dir_dot_origin) - \
                    dot(origin, origin) + \
                    (S.r * S.r); \
    \
    if (discrim == 0.0) { \
        t = -dir_dot_origin; \
    } else if (discrim >= RT_EPSILON) { \
        float sqroot = sqrt(discrim); \
        \
        float t1_ = -dir_dot_origin + sqroot; \
        float t2_ = -dir_dot_origin - sqroot; \
        if (t1_ < t2_) { \
            t  = t1_; \
            t2 = t2_; \
        } else { \
            t  = t2_; \
            t2 = t1_; \
        } \
    } \
} while (false)



bool raytrace_spheres(RT_SPHERE_PARAM_LIST) 
{
    float min_dist = RAYTRACE_OUTOFBOUNDS;
    vec3  normal;
    int   i_sphere = -1;
    res.type = RT_TYPE_MISS;
    vec3 center = vec3(0.0);

    for (int i = 0; i < MAX_SPHERE_COUNT; i += 1) {
        if (i == sphere_count) {
            break;
        }

        float t  = RAYTRACE_OUTOFBOUNDS;
        float t2  = RAYTRACE_OUTOFBOUNDS;
        raytrace_sphere(t, t2, ray, spheres[i]);
        if (t < min_dist && t >= 0.0) {
            min_dist = t;
            i_sphere = i;
            res.type = RT_TYPE_SPHERE;
            res.index  = i;
            res.mat = spheres[i].mat;
            res.t  = t;
            res.t2 = t2;
            center = spheres[i].center;
        }
    }

    if (res.type != RT_TYPE_MISS) {
        res.point  = (ray.V + (min_dist * ray.W));
        res.normal = normalize(res.point - center);
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

// TODO

const int RT_HS_CASE_OUTSIDE_MISSED   = 1;
const int RT_HS_CASE_OUTSIDE_ENTERING = 2;
const int RT_HS_CASE_INSIDE_EXITING   = 3;
const int RT_HS_CASE_INSIDE_CONTAINED = 4;

#define raytrace_halfspace(t, case_, ray_, hs) \
do { \
    vec4 V_hg = vec4(ray_.V, 1.0); \
    float P_dot_V = dot(hs, V_hg); \
    float den = dot(hs, vec4(ray_.W, 0.0)); \
    if (den == 0.0) { \
        den = RT_EPSILON; \
    } \
    t = (-P_dot_V) / den; \
    /* ray origin outside */ \
    if (P_dot_V > 0.0) { \
        /* missed */ \
        if (t < 0.0) { \
            case_ = RT_HS_CASE_OUTSIDE_MISSED; \
        } else { /* entering */ \
            case_ = RT_HS_CASE_OUTSIDE_ENTERING; \
        } \
    /* ray origin inside */ \
    } else if (P_dot_V < 0.0) { \
        /* ray is exiting */ \
        if (t > 0.0) { \
          case_ = RT_HS_CASE_INSIDE_EXITING; \
        } else { /* entire ray contained within */ \
          case_ = RT_HS_CASE_INSIDE_CONTAINED;  \
        } \
    } \
} while (false)


struct Raytrace_Polyhedron_Result {
    vec2 bounds;
    vec3 N_front;
    int  N_front_idx;
    vec3 N_back;
    int  N_back_idx;
};


bool raytrace_polyhedron(out float t, in Ray ray, in Polyhedron P, out Raytrace_Polyhedron_Result res)
{
    vec2 bounds = vec2(
        -RAYTRACE_OUTOFBOUNDS * 10.0, 
        RAYTRACE_OUTOFBOUNDS * 10.0
    );
    const int min_idx = 0;
    const int max_idx = 1;

    vec3 N_front_surface;
    int  N_front_surface_idx;
    vec3 N_back_surface;
    int  N_back_surface_idx;

    bool a_halfspace_was_missed = false;

    Ray_init(ray, ray.V - (P.xform.model * ORIGIN).xyz, ray.W);
    for (int i = 0; i < MAX_POLY_PLANES; i += 1) {
        if (i == P.plane_count) {
            break;
        }

        float t = RAYTRACE_OUTOFBOUNDS;
        int hs_case = -1;
        vec4 hs = P.planes[i] * P.xform.inverse;
        raytrace_halfspace(t, hs_case, ray, hs);

        switch (hs_case) {
        case RT_HS_CASE_OUTSIDE_MISSED: {
            a_halfspace_was_missed = true;
            break;
        }
        case RT_HS_CASE_OUTSIDE_ENTERING: {
            if (t > bounds[min_idx]) {
                N_front_surface = P.planes[i].xyz;
                N_front_surface_idx = i;
                
                bounds[min_idx] = t;
            }
            break;
        }
        case RT_HS_CASE_INSIDE_EXITING: {
            if (t < bounds[max_idx]) {
                N_back_surface = P.planes[i].xyz;
                N_back_surface_idx = i;

                bounds[max_idx] = t;
            }

            break;
        }
        case RT_HS_CASE_INSIDE_CONTAINED: {
            break;
        }
        default: {

            break;
        }
        }
    }

    if (!a_halfspace_was_missed && (bounds[0] <= bounds[1])) {
        res.bounds = bounds;
        res.N_front = N_front_surface;
        res.N_front_idx = N_front_surface_idx;
        res.N_back = N_back_surface;
        res.N_back_idx = N_back_surface_idx;

        t = bounds[0];

        return true;
    }
    return false;
}

bool raytrace_polyhedra(RT_POLYHEDRON_PARAM_LIST)
{
   float min_dist = RAYTRACE_OUTOFBOUNDS;
   vec3  normal;
   int   i_entity = -1;
   res.type = RT_TYPE_MISS;


   for (int i = 0; i < MAX_POLYHEDRON_COUNT; i += 1) {
        if (i == polyhedron_count) {
            break;
        }

        float t = RAYTRACE_OUTOFBOUNDS;
        Raytrace_Polyhedron_Result res_poly;
        if (!raytrace_polyhedron(t, ray, polyhedra[i], res_poly)) {
            continue;
        }

        if (t < min_dist && t >= 0.0) {
            min_dist   = t;
            i_entity   = i;
            res.type   = RT_TYPE_POLYHEDRON;
            res.index  = i;
            res.t      = t;
            res.t2     = res_poly.bounds.y;
            res.mat    = polyhedra[i].mat;
            res.normal = res_poly.N_front;
        }
   }

    if (res.type != RT_TYPE_MISS) {
        res.point  = (ray.V + (min_dist * ray.W));
        return true;
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
            min_dist   = t;
            i_entity   = i;
            res.type   = RT_TYPE_PLANE;
            res.index  = i;
            res.t      = t;
            res.t2     = t;
            res.mat    = planes[i].mat;
            res.normal = planes[i].normal;
        }
   }

    if (res.type != RT_TYPE_MISS) {
        res.point  = (ray.V + (min_dist * ray.W));
        return true;
    }
    return false;
}


bool raytrace_shadow(RT_SHADOW_PARAM_LIST)
{
    for (int i = 0; i < MAX_SPHERE_COUNT; i += 1) {
        if (i == sphere_count) {
            break;
        }

        float t = -RAYTRACE_OUTOFBOUNDS;
        float t2  = RAYTRACE_OUTOFBOUNDS;
        raytrace_sphere(t, t2, ray, spheres[i]);
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
    for (int i = 0; i < MAX_POLYHEDRON_COUNT; i += 1) {
        if (i == polyhedron_count) {
            break;
        }

        float t = RAYTRACE_OUTOFBOUNDS;
        Raytrace_Polyhedron_Result res_poly;
        if (!raytrace_polyhedron(t, ray, polyhedra[i], res_poly)) {
            continue;
        }
        if (t > 0.0) {
            return true;
        }
    }
    return false;
}

//vec3 refract(vec3 I, vec3 N, float indexof
vec3 calc_phong_lighting(Raytrace_Result res, inout Material mat, vec3 bg_color, vec3 eye_dir, float intensity)
{
    vec3 N = res.normal;

    vec3 color = mat.ambient * ambient.rgb;

    for (int i = 0; i < MAX_D_LIGHT_COUNT; i += 1) {
        if (i == d_light_count) { 
            break; 
        }

        vec3 L = -(d_light[i].dir);

        float dist = RAYTRACE_OUTOFBOUNDS;
        
        Ray ray = Ray(res.point + (eye_dir * RT_EPSILON), L);
        
        Raytrace_Result rt_res;

        // raytrace to spheres
        if (!raytrace_shadow(ray, rt_res))
        {
            float diffuse = max(0.0, dot(N, L));
            vec3 R = reflection(L, N); // reflection vector about the normal
            
            // get the bisector between the normal and the light direction
            vec3 vec_sum = eye_dir + L;
            vec3 bisector_N_L = vec_sum / length(vec_sum);

            float specular = pow(max(0.0, dot(bisector_N_L, R)), mat.spec_pow);
            
            // Lrgb * ((D_rgb) + (S_rgb))
            color += intensity * d_light[i].color * (
                (mat.diffuse * diffuse) + (mat.specular * specular)
            );
        }
    }

    return color;
}

vec3 refract_simple(vec3 W, vec3 N, float index_of_refraction) {
    // parallel to N
    vec3 W_c   = dot(W, N) * N;
    // orthogonal to N
    vec3 W_s   = W - W_c;
    // component of emergent ray orthogonal to N
    vec3 W_s_p = W_s / index_of_refraction;
    // component of emergent ray parallel to N
    vec3 W_c_p = -N * sqrt(1.0 - dot(W_s_p, W_s_p));
    // result
    return normalize(W_c_p + W_s_p);
}

const int RAY_TYPE_INIT    = 0;
const int RAY_TYPE_REFLECT = 1;
const int RAY_TYPE_REFRACT = 2;

struct Deferred_Ray_Info {
    int      type;
    int      depth;
    Ray      ray;
    Material mat;
    float    intensity;
};

#define Deferred_Ray_Info_init(info_, type_, ray_, intensity_, depth_) \
do { \
    info_.type      = type_; \
    info_.depth     = depth_; \
    info_.ray       = ray_; \
    info_.intensity = intensity_; \
} while (false)


// Ray_Stack rays;

// non-wrapping queue with bound on number of steps
struct Rays {
    int tail;
    int head;
    Deferred_Ray_Info dat[RT_MAX_RECURSION_DEPTH];
};

void Rays_init(inout Rays rays) 
{
    rays.head = 0;
    rays.tail = 0;
}
Rays Rays_make(void) {
    Rays rays;
    Rays_init(rays);
    return rays;
}

#define Rays_is_empty(rays) (rays.head == rays.tail)

#define Rays_count(st) rays.tail - rays.head

void Rays_add(inout Rays rays, int type, Ray ray, float intensity, int depth) 
{   
    int tail = rays.tail;
    for (int i = 0; i < RT_MAX_RECURSION_DEPTH; i += 1) {
        if (i == tail) {
            Deferred_Ray_Info_init(rays.dat[i], type, ray, intensity, depth);
            break;
        }
    }
    rays.tail = tail + 1;
}

void Rays_top(inout Rays rays, out Deferred_Ray_Info info) 
{
    info = rays.dat[rays.head];
}

#define Rays_remove(rays) \
do \
{ \
    rays.head += 1; \
} while(false)

#define Rays_exhausted(rays) \
    (rays.tail == RT_MAX_RECURSION_DEPTH)

Rays rays;

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
    bool hit;
    float intensity = 1.0;

    rays = Rays_make();


    Deferred_Ray_Info ray_info;

    int depth = 0;

    
    for (int step = 0; step < RT_MAX_STEPS; step += 1) {
        hit = false;

        Ray_init(ray, origin, direction);

        float dist     = RAYTRACE_OUTOFBOUNDS;
        float out_dist = RAYTRACE_OUTOFBOUNDS;

        Material hit_material;

        int which = 0;

        if (raytrace_spheres(ray, rt_res[RT_TYPE_SPHERE])) {
            hit = true;

            if (rt_res[RT_TYPE_SPHERE].t < dist) {
                result_idx   = RT_TYPE_SPHERE;
                rt_hit       = rt_res[RT_TYPE_SPHERE];

                dist         = rt_hit.t;
                out_dist     = rt_hit.t2;
                hit_material = rt_hit.mat;
                which        = rt_hit.index;
            }
        }

        if (raytrace_planes(ray, rt_res[RT_TYPE_PLANE])) {
            hit = true;

            if (rt_res[RT_TYPE_PLANE].t < dist) {
                result_idx   = RT_TYPE_PLANE;
                rt_hit       = rt_res[RT_TYPE_PLANE];

                dist         = rt_hit.t;
                out_dist     = rt_hit.t2;
                hit_material = rt_hit.mat;
                which        = rt_hit.index;
            }
        }

        if (raytrace_polyhedra(ray, rt_res[RT_TYPE_POLYHEDRON])) {
            hit = true;


            if (rt_res[RT_TYPE_PLANE].t < dist) {
                result_idx   = RT_TYPE_POLYHEDRON;
                rt_hit       = rt_res[RT_TYPE_POLYHEDRON];

                dist         = rt_hit.t;
                out_dist     = rt_hit.t2;
                hit_material = rt_hit.mat;
                which        = rt_hit.index;
            } 
        } else {
            //discard;
        }

        if (!hit) {
            color += ambient.rgb * 0.25;
            if (Rays_is_empty(rays)) {
                break;
            }

            Rays_top(rays, ray_info);
            Rays_remove(rays);

            origin    = ray_info.ray.V;
            direction = ray_info.ray.W;
            intensity = ray_info.intensity;
            depth     = ray_info.depth;

            continue;
        }

        eye_dir = -ray.W;

        color += calc_phong_lighting(
            rt_hit, 
            hit_material,  
            ambient.rgb, 
            eye_dir,
            intensity
        );

        if (!Rays_exhausted(rays)) {
            bool refraction_happened = false;

            if (enable_refraction && should_refract(hit_material)) {
                vec3  P  = rt_hit.point;
                vec3  N  = rt_hit.normal;
                vec3  W  = ray.W;
                float t  = dist;
                float t2 = out_dist;

                // compute the refracted ray
                float refract_idx_before = 1.0;
                float refract_idx_after  = refractive_index_of(hit_material);

                float index_of_refraction = refract_idx_after;
                float index_of_refraction_inv = refract_idx_before / index_of_refraction;

                Ray ray_refract;
                vec3 transmission_origin = vec3(0.0);
                vec3 transmission_direction = vec3(0.0); 
                {
                    // create the first bent ray
                    transmission_direction = refract_simple(W, N, index_of_refraction);
                    transmission_origin    = P - (RT_EPSILON * transmission_direction);

                    Ray_init(ray_refract, transmission_origin, transmission_direction);

                    switch (result_idx) {
                    case RT_TYPE_SPHERE: {
                        refraction_happened = true;

                        float t  = RAYTRACE_OUTOFBOUNDS;
                        float t2 = RAYTRACE_OUTOFBOUNDS;
                        raytrace_sphere(t, t2, ray_refract, spheres[which]);

                        // create the second bent ray
                        vec3 hit_point  = (ray_refract.V + (t2 * ray_refract.W));
                        vec3 hit_normal = normalize(hit_point - spheres[which].center);

                        transmission_direction = refract_simple(ray_refract.W, hit_normal, index_of_refraction_inv);
                        transmission_origin    = hit_point + (RT_EPSILON * transmission_direction);


                        Rays_add(rays, 
                            RAY_TYPE_REFRACT, 
                            Ray_make(transmission_origin, transmission_direction),
                            intensity * 0.8, 
                            depth + 1
                        );

                        break;
                    }
                    case RT_TYPE_PLANE: {
                        refraction_happened = false;

                        break;
                    }
                    case RT_TYPE_POLYHEDRON: {
                        refraction_happened = true;

                        float t  = RAYTRACE_OUTOFBOUNDS;
                        float t2 = RAYTRACE_OUTOFBOUNDS;

                        Raytrace_Polyhedron_Result poly_res;
                        raytrace_polyhedron(t, ray_refract, polyhedra[which], poly_res);

                        // create the second bent ray
                        vec3 hit_point  = (ray_refract.V + (t2 * ray_refract.W));
                        vec3 hit_normal = normalize(hit_point - spheres[which].center);

                        transmission_direction = refract_simple(ray_refract.W, hit_normal, index_of_refraction_inv);
                        transmission_origin    = (-vec3(noise(rt_hit.point - uTime)) * ((result_idx == RT_TYPE_PLANE) ? 1.0 : 0.0)) + hit_point + (RT_EPSILON * transmission_direction);


                        Rays_add(rays, 
                            RAY_TYPE_REFRACT, 
                            Ray_make(transmission_origin, transmission_direction),
                            intensity * 0.8, 
                            depth + 1
                        );

                        break;
                    }
                    }
                }
            }
        }

        if (!Rays_exhausted(rays)) {
            vec3 reflect_origin;
            vec3 reflect_direction;
            bool reflected = false;
            if (enable_reflection && should_reflect(hit_material)) {
                reflected = true;
                reflect_origin    = (-vec3(noise(rt_hit.point - uTime)) * ((result_idx == RT_TYPE_PLANE) ? 1.0 : 0.0)) + rt_hit.point + RT_EPSILON * ray.W;
                reflect_direction = reflection(-ray.W, rt_hit.normal);
                Rays_add(rays, 
                    RAY_TYPE_REFLECT, 
                    Ray_make(reflect_origin, reflect_direction), 
                    intensity * 0.8, 
                    depth + 1
                );
            }
        }

        if (Rays_is_empty(rays)) {
            break;
        }

        Rays_top(rays, ray_info);
        Rays_remove(rays);

        origin    = ray_info.ray.V;
        direction = ray_info.ray.W;
        intensity = ray_info.intensity;
        depth     = ray_info.depth;
    }

    res.hit = hit;
    res.color = color;
    return res.hit;
}

#define VERIFY (0)
#if VERIFY
bool verify()
{
    bool v = true;
    #define cl(stmnt) v = v && stmnt

    Polyhedron S = polyhedra[0];

    cl(S.xform.model == mat4(
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.5, 0.5, 0.0, 1.0
    ));

    cl(S.xform.model * S.xform.inverse == mat4(1.0));

    return v;

    #undef cl
}
#endif
void main(void)
{
    #if VERIFY
      if (verify()) {
           fragColor = vec4(0.0, 1.0, 0.0, 1.0);
      } else {
           fragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }
      return;
    #endif

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