#version 300 es
precision mediump float;

/**
 * \file
 * \author Rudy Castan
 * \date 2025 Spring
 * \par CS250 Computer Graphics II
 * \copyright DigiPen Institute of Technology
 */

out vec4 FragColor;

#define PI 3.14159265359

uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_time;

vec3 colorA = vec3(0.149, 0.141, 0.912);
vec3 colorB = vec3(1.000, 0.833, 0.224);

float plot(vec2 st, float pct)
{
    return smoothstep(pct - 0.01, pct, st.y) - smoothstep(pct, pct + 0.01, st.y);
}

float bounceOut(float t)
{
    const float a = 4.0 / 11.0;
    const float b = 8.0 / 11.0;
    const float c = 9.0 / 10.0;

    const float ca = 4356.0 / 361.0;
    const float cb = 35442.0 / 1805.0;
    const float cc = 16061.0 / 1805.0;

    float t2 = t * t;

    return t < a ? 7.5625 * t2 : t < b ? 9.075 * t2 - 9.9 * t + 3.4 : t < c ? ca * t2 - cb * t + cc : 10.8 * t * t - 20.52 * t + 10.72;
}

float bounceIn(float t)
{
    return 1.0 - bounceOut(1.0 - t);
}

float exponentialOut(float t)
{
    return t == 1.0 ? t : 1.0 - pow(2.0, -10.0 * t);
}

void main()
{
    vec2 st    = gl_FragCoord.xy / u_resolution.xy;
    vec3 color = vec3(0.0);

    vec3 pct = vec3(st.x);

    // pct.r = smoothstep(0.0,1.0, st.x);
    // pct.g = sin(st.x*PI);
    // pct.b = pow(st.x,0.5);
    pct.r = exponentialOut(st.x);
    pct.g = sin(st.x*PI);
    pct.b = bounceIn(st.x / 2. + (sin(u_time) + 1.) / 4.);

    color = mix(colorA, colorB, pct);

    // Plot transition lines for each channel
    color = mix(color, vec3(1.0, 0.0, 0.0), plot(st, pct.r));
    color = mix(color, vec3(0.0, 1.0, 0.0), plot(st, pct.g));
    color = mix(color, vec3(0.0, 0.0, 1.0), plot(st, pct.b));

    FragColor = vec4(color, 1.0);
}
