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
    // 供WebGL编译的着色器源代码。坐标vec2为2D, vec3为3D(X,Y,Z)
    // 顶点属性：坐标、颜色。
    // 顶点矩阵：投影矩阵, 运动矩阵。
    const shader_vertex_source = "\n\
        attribute vec3 position;\n\
        attribute vec3 color;\n\
        \n\
        uniform mat4 Pmatrix;\n\
        uniform mat4 Vmatrix;\n\
        uniform mat4 Mmatrix;\n\
        \n\
        varying vec3 vColor;\n\
        void main(void) {\n\
            gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);\n\
            vColor = color;\n\
        }";

    const shader_fragment_source = "\n\
        precision mediump float;\n\
        \n\
        \n\
        \n\
        varying vec3 vColor;\n\
        void main(void) {\n\
            gl_FragColor = vec4(vColor, 1.);\n\
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
    // 获取投影矩阵。
    var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    // 获取视图矩阵。
    var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
    // 获取运动矩阵。
    var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");
    // 获取颜色信息。
    var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
    // 获取顶点信息。
    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    // 启用颜色属性数组。
    GL.enableVertexAttribArray(_color);
    // 启用顶点属性数组。
    GL.enableVertexAttribArray(_position);
    // 使用程序。
    GL.useProgram(SHADER_PROGRAM);

    /*========================= TRIANGLE ========================= */
    // 三角形顶点(XYZ)和颜色(三位)数据。
    // 0,0,0为正中心。
    var triangle_vertex = [
        1, 1, 0, // 右上角
        1, 1, 0,
        1, -1, 0, // 右下角
        0, 1, 1,
        -1, -1, 0, // 左下角
        1, 0, 1
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
    var triangle_faces = [0, 1, 2];
    
    // 创建三角形面缓冲区。
    const TRIANGLE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
    GL.bufferData(
        GL.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(triangle_faces),
        GL.STATIC_DRAW
    );

    /*========================= MATRIX ========================= */
    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width/CANVAS.height, 1, 100);
    var VIEWMATRIX = LIBS.get_I4();
    var MOVEMATRIX = LIBS.get_I4();

    // Z轴平移。
    LIBS.translateZ(VIEWMATRIX, -5);

    /*========================= DRAWING ========================= */
    // 重置颜色。
    GL.clearColor(0.0, 0.0, 0.0, 0.0);
    
    // 启用深度测试并指定深度函数。
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);

    // 重置深度(像素位到相机距离，与视窗大小相关，为[-1,1]区间的正态函数)。
    GL.clearDepth(1.0);

    // 旧时间点。
    var time_old = 0;

    var animate = function(time) {
        // 根据时间计算旋转角度。
        var dAngle = 0.005 * (time - time_old);
        LIBS.rotateY(MOVEMATRIX, dAngle);
        time_old = time;

        // 设置视窗，清除颜色缓存位和深度缓存位。
        GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        // 设置投影矩阵。
        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        // 设置视图矩阵。
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        // 设置运动矩阵。
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);

        GL.bindBuffer(GL.ARRAY_BUFFER, TRIANGLE_VERTEX);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4*(3+3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(3+3), 3*4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
        GL.drawElements(GL.TRIANGLES, 3, GL.UNSIGNED_SHORT, 0);

        // 写入缓冲区数据。
        GL.flush();

        // 请求窗口刷新。
        window.requestAnimationFrame(animate);
    };

    animate(0);
}