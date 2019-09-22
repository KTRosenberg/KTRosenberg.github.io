#version 300 es
precision highp float;

uniform float uTime;   // TIME, IN SECONDS
in vec3 vPos;     // -1 < vPos.x < +1
// -1 < vPos.y < +1
//      vPos.z == 0

out vec4 fragColor; 


float sin01(float val) 
{
    return (sin(val) + 1.0) / 2.0;
}

const int COUNT_STEPS = 14;

// cycle through steps in shader
#define BREAK(num__) do { if (time_clamp < num__) { return; } } while (false)

float to01(float val) {
    return (val + 1.0) / 2.0;
}

vec3 gamma_correct(vec3 col) {
    return col = sqrt(col);
}

vec3 circle(vec2 radius, vec2 delta, vec2 pos)
{
    return vec3(smoothstep(
        radius.x + (radius.x * delta.x), 
        radius.y - (radius.y * delta.y), dot(pos, pos)
    )); 
}

const bool pixelated = true;

void main(void) 
{

    const vec2 res = vec2(640.0, 640.0);
    float aspect = res.x / res.y;
    vec3 vposloc = vPos;
    vposloc.x *= aspect;

    if (pixelated) {
        vec3 pxscale = vec3(vec2(32.0), 1.0); 
        vposloc *= pxscale;
        vposloc = floor(vposloc);
        vposloc /= pxscale;
    }

    vec3 vpos01 = vec3(to01(vposloc.x), to01(vposloc.y), vposloc.z);
    

    // find the current step
    int time_clamp = int(uTime / 2.0) % COUNT_STEPS;
    //time_clamp = 11;
    // create base noise texture

    float base_noise = noise(vposloc * 4.0 + vec3(sin(0.0 / 2.0) * 0.1, -2.0 * uTime, 0.7));
    fragColor = vec4(vec3(base_noise), 1.0);
BREAK(1);

    // create an animated gradient
    float y_color = min(
        1.0, 
            (to01(noise(vec3(vposloc.x + uTime + sin01(uTime / 97.0))) + 
            vposloc.y - sin(sin(uTime + vpos01.y * 
            (1. + sin01(uTime + vposloc.y) * 10.)) * vposloc.x * 4.7) * 0.1)) * ((sin01(uTime) + 1.0) / 1.01));
    
    vec4 grad_color = vec4(gamma_correct(vec3(mix(1.0, 0.0, y_color))), 1.0);
    fragColor = grad_color;
BREAK(2);
  
    // give the gradient discrete steps
    y_color *= 8.0;
    y_color = ceil(y_color);
    y_color /= 8.0;
    vec4 stepped_grad_color = vec4(gamma_correct(vec3(mix(1.0, 0.0, y_color))), vpos01.y);
    fragColor = stepped_grad_color;
BREAK(3);

    // isolate the noise from the curve
    float curve_edge = 1.0 - step(stepped_grad_color.x, 0.0);

    fragColor = vec4(vec3(curve_edge), 1.0);
BREAK(4);

    // isolate a little offset from the top

    float curve_edge_lower = 1.0 - step(stepped_grad_color.x, 0.5);

    fragColor = vec4(vec3(curve_edge_lower), 1.0);
BREAK(5);

    float diff = 1.0 - step(curve_edge - curve_edge_lower, 0.5 * sin01(uTime));

    fragColor = vec4(vec3(diff), 1.0);
BREAK(6);

    vec3 red_or_yellow = mix(vec3(1.0, 1.0, 0.2), vec3(1.0, 0.0, 0.0), diff);

    fragColor = vec4(red_or_yellow, 1.0);
BREAK(7);

    // isolate more

    float curve_edge_lower_2 = 1.0 - step(stepped_grad_color.x, 0.75);

    fragColor = vec4(vec3(curve_edge_lower_2), 1.0);
BREAK(8);
    
    float diff_2 = step(curve_edge_lower - curve_edge_lower_2, 0.5 * sin01(uTime));

    fragColor = vec4(vec3(diff_2), 1.0);
BREAK(9);

    vec3 orange_or_prev = mix(vec3(1.0, .647, 0.0), red_or_yellow, diff_2);

    fragColor = vec4(orange_or_prev, 1.0);
BREAK(10);
    vec3 base_sky = 
    mix(vec3(135.0 / 255.0, 206.0 / 255.0, 235.0 / 255.0), vec3(0.5), vec3(sin01(uTime)));
    vec3 bg = mix(
        base_sky, 
        red_or_yellow, 
        1.0 - vposloc.y * 2.0);

    fragColor = vec4(gamma_correct(bg), 1.0);
BREAK(11);

    vec3 sun = (1.0 - curve_edge) * bg * circle(vec2(0.1), vec2(0.5, 0.5), vposloc.xy + -0.5);
    fragColor = vec4(gamma_correct(sun + ((1.0 - curve_edge) * bg + curve_edge * 4.0 * orange_or_prev)), 1.0);
}
