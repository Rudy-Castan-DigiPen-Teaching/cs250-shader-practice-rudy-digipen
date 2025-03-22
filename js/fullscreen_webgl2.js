/**
 * \file
 * \author Rudy Castan
 * \date 2025 Spring
 * \par CS250 Computer Graphics II
 * \copyright DigiPen Institute of Technology
 */

const gVertexShaderSource = `#version 300 es
precision lowp float;
layout(location = 0) in vec3 aVertexPosition;
void main() {
    gl_Position = vec4(aVertexPosition, 1.0);
}`;

const gDefaultFragmentShaderSource = `#version 300 es
precision mediump float;
out vec4 FragColor;
void main() {
    FragColor = vec4(0.3451, 0.1725, 0.6706, 1.0);
}`;

async function fetch_shader(shader_path)
{
    try
    {
        const response = await fetch(shader_path);
        if (!response.ok)
            throw new Error("Failed to load shader");
        return await response.text();
    }
    catch (e)
    {
        console.log(`First attempt failed: ${shader_path}, trying modified path.`);
        const base_path   = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
        const likely_path = `${base_path}shaders/${shader_path}`;
        console.log(`Attempting: ${likely_path}`);
        try
        {
            const response = await fetch(likely_path);
            if (!response.ok)
                throw new Error("Backup fetch failed");
            return await response.text();
        }
        catch (e)
        {
            console.error("Both attempts failed, using default shader.");
            return gDefaultFragmentShaderSource;
        }
    }
}

function create_shader(gl, type, source)
{
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        console.error("Shader compile error: ", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function create_program(gl, vertex_glsl, fragment_glsl)
{
    const vertex_shader_handle   = create_shader(gl, gl.VERTEX_SHADER, vertex_glsl);
    const fragment_shader_handle = create_shader(gl, gl.FRAGMENT_SHADER, fragment_glsl);
    if (!vertex_shader_handle || !fragment_shader_handle)
        return null;

    const program = gl.createProgram();
    gl.attachShader(program, vertex_shader_handle);
    gl.attachShader(program, fragment_shader_handle);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        console.error("Program link error: ", gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

async function start_fullscreen_webgl2()
{
    const url_params           = new URLSearchParams(window.location.search);
    const shader_file          = url_params.get('shader');
    const fragment_shader_glsl = shader_file ? await fetch_shader(shader_file) : gDefaultFragmentShaderSource;

    const canvas = document.getElementById("glCanvas");
    const gl     = canvas.getContext("webgl2", { powerPreference: "low-power" });
    if (!gl)
    {
        console.error("WebGL2 not supported");
        return;
    }

    const program = create_program(gl, gVertexShaderSource, fragment_shader_glsl);
    if (!program)
        return;
    gl.useProgram(program);

    const positions = new Float32Array([
        // bottom left
        -1.0, -1.0, 0.0,
        // bottom right
        3.0, -1.0, 0.0,
        // top left
        -1.0, 3.0, 0.0
    ]);

    const vao = gl.createVertexArray();
    const vbo = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    const uTime       = gl.getUniformLocation(program, "u_time");
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uMouse      = gl.getUniformLocation(program, "u_mouse");

    let startTime = performance.now();
    let mouseX = 0, mouseY = 0;

    canvas.addEventListener("mousemove", (event) => {
        mouseX = event.clientX;
        mouseY = canvas.height - event.clientY;
    });

    function render()
    {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        let elapsedTime = (performance.now() - startTime) / 1000;
        gl.useProgram(program);
        gl.uniform1f(uTime, elapsedTime);
        gl.uniform2f(uResolution, canvas.width, canvas.height);
        gl.uniform2f(uMouse, mouseX, mouseY);

        gl.bindVertexArray(vao);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindVertexArray(null);

        requestAnimationFrame(render);
    }

    function resize_canvas()
    {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", resize_canvas);
    resize_canvas();
    render();
}

start_fullscreen_webgl2();
