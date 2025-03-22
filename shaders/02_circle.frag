#version 300 es
precision mediump float;

out vec4 FragColor;

uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_time;
uniform vec2 u_trails[10];

#define PI_TWO 1.570796326794897
#define PI     3.141592653589793
#define TWO_PI 6.283185307179586

/* Coordinate and unit utils */
vec2 coord(in vec2 p)
{
    p = p / u_resolution.xy;
    // correct aspect ratio
    if (u_resolution.x > u_resolution.y)
    {
       p.x *= u_resolution.x / u_resolution.y;
        p.x += (u_resolution.y - u_resolution.x) / u_resolution.y / 2.0;
    }
    else
    {
        p.y *= u_resolution.y / u_resolution.x;
        p.y += (u_resolution.x - u_resolution.y) / u_resolution.x / 2.0;
    }
    // centering
    p -= 0.5;
    // p *= vec2(-1.0, 1.0);
    return p;
}

float circleshape(vec2 position, vec2 center, float radius)
{
    return step(radius, length(position-center));
}

void main()
{
    // vec3 color = vec3(abs(cos(st.x + mx.x)), abs(sin(st.y + mx.y)), abs(sin(u_time)));
    vec2 position = coord(gl_FragCoord.xy);
    vec2 mouse = coord(u_mouse);

    vec3 color = vec3(0.0);

    float circle = circleshape(position, mouse, 0.1);

    color = vec3(circle);

    FragColor = vec4(color, 1.0);
}
