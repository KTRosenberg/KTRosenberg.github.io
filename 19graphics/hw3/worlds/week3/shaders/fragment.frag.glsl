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
const int   RT_MAX_RECURSION_DEPTH = 4;

// types

struct Material {
    vec3  ambient;
    vec3  diffuse;
    vec3  specular;
    float spec_pow;
    
    vec4  reflection; // mirror rgb, .w is whether should reflect or not 
    vec4  refraction; // transparency rgb, .w is index of refraction
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

#define MAX_SPHERE_COUNT  (3)
#define MAX_PLANE_COUNT  (1)
#define MAX_D_LIGHT_COUNT (2)
#define MAX_P_LIGHT_COUNT (1)

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
const int RT_TYPE_COUNT  =  2;

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
Ray ray, \
out Raytrace_Result res

#define RT_PLANE_PARAM_LIST \
in Ray ray, \
out Raytrace_Result res


bool raytrace_spheres(RT_SPHERE_PARAM_LIST);
bool raytrace_planes(RT_PLANE_PARAM_LIST);

vec3 calc_phong_lighting(Raytrace_Result res, Material mat, vec3 bg_color, vec3 eye_dir, float intensity);


const float focal_length = 3.0; // distance to image plane

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
      //return normalize(2.0 * dot(N, I) * N - I);
}

#define PLANE_DISTORTION

void init(void)
{

// initialize world lights
    d_light_count = 2;
    d_light[0] = Dir_Light(
        vec3(.5,.5,1.0),
        normalize(-vec3(0.,sin01(-uTime),1.))
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
            1.0,

            vec4(1.0, 1.0, 1.0, 1.0),
            vec4(1.0, 1.0, 1.0, 1.0)
       )
   );

   for (int i = 0; i < MAX_SPHERE_COUNT; i += 1) {
        if (sphere_count == MAX_SPHERE_COUNT) { 
            break;
        }
        spheres[i].mat.reflection.w = 1.0;
   }
    for (int i = 0; i < MAX_PLANE_COUNT; i += 1) {
        if (sphere_count == MAX_PLANE_COUNT) { 
            break;
        }
        planes[i].mat.reflection.w = 1.0;
   }
}

#define raytrace_sphere(t, t2, ray_, S) do { \
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
        float t1_ = -dir_dot_origin + sqroot; \
        float t2_ = -dir_dot_origin - sqroot; \
        if (t1_ < t2_) { \
            t = t1_; \
            t2 = t2_; \
        } else { \
            t = t2_; \
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

bool raytrace_spheres_shadow(RT_SPHERE_PARAM_LIST)
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



bool raytrace_planes_shadow(RT_PLANE_PARAM_LIST)
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

        vec3 L = -(d_light[i].dir);

        float dist = RAYTRACE_OUTOFBOUNDS;
        
        Ray ray = Ray(res.point + (eye_dir * RT_EPSILON), L);
        
        Raytrace_Result rt_res;

        // raytrace to spheres
        if (!raytrace_spheres_shadow(ray, rt_res) && 
            !raytrace_planes_shadow(ray, rt_res)) 
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

void Deferred_Ray_Info_init(
    inout Deferred_Ray_Info info, 
    int type, in Ray ray, Material mat, float intensity, int depth)
{
    info.type      = type;
    info.depth     = depth;
    info.ray       = ray;
    info.mat       = mat;
    info.intensity = intensity;
}

struct Ray_Stack {
    int top_idx;
    Deferred_Ray_Info dat[RT_MAX_RECURSION_DEPTH + 1];
};
Ray_Stack Rays_make(void) {
    Ray_Stack stack;
    stack.top_idx = 0;
    return stack;
}
void Rays_init(inout Ray_Stack st) 
{
    st.top_idx = 0;
}
bool Rays_is_empty(inout Ray_Stack st) 
{   
    return (st.top_idx == 0);
}
void Rays_push(inout Ray_Stack st, int type, Ray ray, inout Material mat, float intensity, int depth) 
{   
    st.top_idx += 1;
    for (int i = 0; i < RT_MAX_RECURSION_DEPTH + 1; i += 1) {
        if (i == st.top_idx - 1) {
            Deferred_Ray_Info_init(st.dat[i], type, ray, mat, intensity, depth);
        }
    }
}

Deferred_Ray_Info Rays_top(inout Ray_Stack st) 
{
    for (int i = 0; i < RT_MAX_RECURSION_DEPTH + 1; i += 1) {
        if (i == st.top_idx - 1) {
            return st.dat[i];
        }
    }
}

#define Rays_pop(st) \
do \
{ \
    st.top_idx = st.top_idx - 1; \
} while(false) \

Ray_Stack ray_stack;

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

    ray_stack = Rays_make();


    Deferred_Ray_Info ray_info;

    int depth = 0;

    const int RT_MAX_STEPS = 4;
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

        if (!hit) {
            color += ambient.rgb * 0.25;
            if (Rays_is_empty(ray_stack)) {
                break;
            }

            // ray_info  = Rays_top(ray_stack);
            // Rays_pop(ray_stack);

            // origin    = ray_info.ray.V;
            // direction = ray_info.ray.W;
            // intensity = ray_info.intensity;
        }

        eye_dir = -ray.W;

        color += calc_phong_lighting(
            rt_hit, 
            hit_material,  
            ambient.rgb, 
            eye_dir,
            intensity
        );

        bool refraction_happened = false;
        const bool enable_refraction = true;
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

                    // defer to next depth level
                    //origin    = transmission_origin;
                    //direction = transmission_direction;
                    Rays_push(ray_stack, 
                        RAY_TYPE_REFRACT, 
                        Ray_make(transmission_origin, transmission_direction), 
                        hit_material, 
                        1.0, 
                        depth + 1
                    );

                    break;
                }
                case RT_TYPE_PLANE: {
                    refraction_happened = false;

                    break;
                }
                }
            }

        }

        // TEMP Control Flow, will revise
        const bool enable_reflection = true;
        vec3 reflect_origin;
        vec3 reflect_direction;
        bool reflected = false;
        if (enable_reflection && should_reflect(hit_material)) {
            reflected = true;
            reflect_origin    = rt_hit.point + RT_EPSILON * ray.W;
            reflect_direction = reflection(-ray.W, rt_hit.normal);
            Rays_push(ray_stack, 
                RAY_TYPE_REFLECT, 
                Ray_make(reflect_origin, reflect_direction), 
                hit_material, 
                intensity * 0.8, 
                depth + 1
            );
        }

        if (Rays_is_empty(ray_stack)) {
            break;
        }
        do {
            ray_info  = Rays_top(ray_stack);
            Rays_pop(ray_stack);

            origin    = ray_info.ray.V;
            direction = ray_info.ray.W;
            intensity = ray_info.intensity;
            depth     = ray_info.depth;
        } while ((depth > RT_MAX_RECURSION_DEPTH + 1) && !Rays_is_empty(ray_stack));
        if (depth > RT_MAX_RECURSION_DEPTH) {
            break;
        }
    }

    res.hit = hit;
    res.color = color;
    return res.hit;
}

