const vertexShaderSource = `#version 300 es
precision lowp float;
layout(location = 0) in vec3 aVertexPosition;
void main() {
    gl_Position = vec4(aVertexPosition, 1.0);
}`;

const defaultFragmentShaderSource = `#version 300 es
precision mediump float;
out vec4 FragColor;
void main() {
    FragColor = vec4(0.3451, 0.1725, 0.6706, 1.0);
}`;

/**
 * Fetches the shader from a given path, with a fallback in case of failure.
 */
async function fetchShader(shaderPath) {
    try {
        const response = await fetch(shaderPath);
        if (!response.ok) throw new Error("Failed to load shader");
        return await response.text();
    } catch (e) {
        console.log(`First attempt failed: ${shaderPath}, trying modified path.`);
        const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
        const likelyPath = `${basePath}shaders/${shaderPath}`;
        console.log(`Attempting: ${likelyPath}`);
        try {
            const response = await fetch(likelyPath);
            if (!response.ok) throw new Error("Backup fetch failed");
            return await response.text();
        } catch (e) {
            console.error("Both attempts failed, using default shader.");
            return defaultFragmentShaderSource;
        }
    }
}

/**
 * Creates and compiles a shader.
 */
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error: ", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

/**
 * Creates a WebGL program by linking vertex and fragment shaders.
 */
function createProgram(gl, vertexSrc, fragmentSrc) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSrc);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);
    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link error: ", gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

/**
 * Initializes WebGL and starts the rendering loop.
 */
async function initWebGL() {
    const urlParams = new URLSearchParams(window.location.search);
    const shaderFile = urlParams.get('shader');
    const fragmentShaderSource = shaderFile ? await fetchShader(shaderFile) : defaultFragmentShaderSource;

    const canvas = document.getElementById("glCanvas");
    const gl = canvas.getContext("webgl2", { powerPreference: "low-power" });
    if (!gl) {
        console.error("WebGL2 not supported");
        return;
    }

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!program) return;
    gl.useProgram(program);

    const positions = new Float32Array([
        -1.0, -1.0, 0.0,
        3.0, -1.0, 0.0,
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

    const uTime = gl.getUniformLocation(program, "u_time");
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");

    let startTime = performance.now();
    let mouseX = 0, mouseY = 0;

    canvas.addEventListener("mousemove", (event) => {
        mouseX = event.clientX;
        mouseY = canvas.height - event.clientY;
    });

    function render() {
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

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    render();
}

initWebGL();
