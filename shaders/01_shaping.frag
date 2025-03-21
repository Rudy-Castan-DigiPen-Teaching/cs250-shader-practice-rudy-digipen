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

uniform vec2 u_resolution;
uniform float u_time;

float plot(vec2 st,float pct)
{
    return smoothstep(pct-.02,pct, st.y) - smoothstep(pct,pct+.02, st.y);
}

void main()
{
    vec2 st=gl_FragCoord.xy/u_resolution;
    
    // float y=pow(st.x,0.5);
    float y= step(0.9, st.x);
    y = smoothstep(0.1,0.9, st.x);
    y = sin(u_time/10.+st.x);
    
    vec3 color=vec3(y);
    
    float pct = plot(st,y);
    color=(1.-pct)*color+pct*vec3(0.,1.,0.);
    
    FragColor=vec4(color,1.);
}