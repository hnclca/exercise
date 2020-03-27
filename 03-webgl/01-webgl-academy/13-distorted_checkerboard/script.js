function main() {
    const CANVAS = document.querySelector('#glcanvas');
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    /*========================= GET WEBGL CONTEXT ========================= */
    const GL = CANVAS.getContext("webgl", {antialias: true});
    
    if (!GL) {
        alert("Unable to initialize WebGL. Your browser or machine may not suppport it.");
        return;
    }

    /*========================= SHADERS ========================= */
    // 供WebGL编译的着色器源代码。
    const shader_vertex_source = "\n\
        attribute vec2 position;\n\
        \n\
        varying vec2 v;\n\
        void main(void) {\n\
            gl_Position = vec4(position, 0., 1.);\n\
            v = position;\n\
        }";

    
    const shader_fragment_source = "\n\
        precision lowp float;// 运算精度：lowp mediump highp\n\
        \n\
        varying vec2 v;\n\
        uniform float t; // 时间参数\n\
        float f(float d) { \n\
            float distort = pow(length(v), -3.);\n\
            return(mod(floor(d + t - v.x*distort) + floor(d + t - v.y*distort), 2.)); \n\
        } \n\
        void main(void) {\n\
            gl_FragColor = vec4(f(.0), f(.3), f(.6), 1.);\n\
        }";

    // 获取着色器并编译源代码。
    var get_shader = function (source, type, typeString) {
        var shader = GL.createShader(type);
        GL.shaderSource(shader, source);
        GL.compileShader(shader);
        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
            alert("ERROR IN " + typeString + " SHADER : " + GL.getShaderInfoLog(shader));
            return false;
        }
        return shader;

    };

    var shader_vertex = get_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
    var shader_fragment = get_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");

    // 创建着色器程序，合并顶点和切片着色器。
    const SHADER_PROGRAM = GL.createProgram();
    GL.attachShader(SHADER_PROGRAM, shader_vertex);
    GL.attachShader(SHADER_PROGRAM, shader_fragment);

    // 连接着色器程序到WebGL上下文。
    GL.linkProgram(SHADER_PROGRAM);
    // 获取顶点信息。
    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    // 启用顶点属性数组。
    GL.enableVertexAttribArray(_position);
    // 绑定GLSL着色器变量t到js变量_time。
    _time = GL.getUniformLocation(SHADER_PROGRAM, "t");
    // 使用程序。
    GL.useProgram(SHADER_PROGRAM);

    /*========================= TRIANGLE ========================= */
    // 三角形顶点(两位)和颜色(三位)数据。
    // 0，0为正中心。
    var triangle_vertex = [
        1, 1, // 右上角
        1, -1, // 右下角
        -1, -1, // 左下角
        -1, 1
    ];

    // 创建顶点缓冲区并缓冲三角形顶点数据。
    const TRIANGLE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, TRIANGLE_VERTEX);
    GL.bufferData(
        GL.ARRAY_BUFFER,
        new Float32Array(triangle_vertex),
        GL.STATIC_DRAW
    );

    // 三角形面。
    var triangle_faces = [0, 1, 3, 2];
    
    // 创建三角形面缓冲区。
    const TRIANGLE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
    GL.bufferData(
        GL.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(triangle_faces),
        GL.STATIC_DRAW
    );

    /*========================= DRAWING ========================= */
    // // 重置颜色。
    // // GL.clearColor(0.0, 0.0, 0.0, 0.0);

    // // 不随时间更新。
    GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*2, 0);
    var animate = function(timestamp) {
    //     // 设置视窗，清除颜色缓存位。
    //     // GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);
    //     // GL.clear(GL.COLOR_BUFFER_BIT);

    //     // GL.bindBuffer(GL.ARRAY_BUFFER, TRIANGLE_VERTEX);
        
        // 更新时间变量。
        GL.uniform1f(_time, timestamp*0.001);
    //     // GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
        GL.drawElements(GL.TRIANGLE_STRIP, 4, GL.UNSIGNED_SHORT, 0);

    //     // 写入缓冲区数据。
    //     GL.flush();

        // 请求窗口刷新。
        window.requestAnimationFrame(animate);
    };

    animate(0);
}