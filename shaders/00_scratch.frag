#version 300 es
precision mediump float;

/**
 * \file
 * \author Rudy Castan
 * \author TODO Your Name
 * \date 2025 Spring
 * \par CS250 Computer Graphics II
 * \copyright DigiPen Institute of Technology
 */

 uniform vec2 u_resolution;


out vec4 FragColor;

void main()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    FragColor = vec4(st, 0, 1.0);
}
