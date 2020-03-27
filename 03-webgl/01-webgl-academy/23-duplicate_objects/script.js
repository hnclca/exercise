function main() {
    const CANVAS = document.querySelector('#glcanvas');
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    /*========================= CAPTURE MOUSE EVENTS ========================= */
    // 运动衰减系数。
    var AMORTIZATION=0.95;

    var drag = false;

    var x_old, y_old;
    var dX = dY = 0;

    var mouseDown = function(e) {
        drag = true;
        x_old = e.pageX;
        y_old = e.pageY;
        e.preventDefault();
		return false;
    };

    var mouseUp = function(e) {
        drag = false;
    };

    var mouseMove = function(e) {
        if (!drag) return false;
        dX = (e.pageX - x_old)*2*Math.PI / CANVAS.width;
        dY = (e.pageY - y_old)*2*Math.PI / CANVAS.height;
        THETA += dX;
        PHI += dY;
        x_old = e.pageX;
        y_old = e.pageY;
        e.preventDefault();
    };

    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);
    CANVAS.addEventListener("mousemove", mouseMove, false);

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
        uniform float greyscality; // 灰度系数 \n\
        \n\
        varying vec3 vColor;\n\
        void main(void) {\n\
            float greyscaleValue = (vColor.r + vColor.g + vColor.b)/3.; \n\
            vec3 greyscaleColor = vec3(greyscaleValue, greyscaleValue, greyscaleValue); \n\
            vec3 color = mix(greyscaleColor, vColor, greyscality); \n\
            gl_FragColor = vec4(color, 1.);\n\
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

    // 绑定灰度系数变量。
    var _greyscality = GL.getUniformLocation(SHADER_PROGRAM, "greyscality");

    // 使用程序。
    GL.useProgram(SHADER_PROGRAM);

    /*========================= CUBE ========================= */
    // 顶点(XYZ)和颜色(三位)数据。
    // 0,0,0为正中心。
    var cube_vertex = [
        -1, -1, -1,  1, 0, 0,  // 背面红色
        -1,  1, -1,  1, 0, 0,
         1,  1, -1,  1, 0, 0,
         1, -1, -1,  1, 0, 0, 

        -1, -1, 1,  0, 1, 0,  // 正面绿色
        -1,  1, 1,  0, 1, 0,
         1,  1, 1,  0, 1, 0,
         1, -1, 1,  0, 1, 0, 

        -1, -1, -1,  0, 0, 1,  // 左面蓝色
        -1, -1,  1,  0, 0, 1,
        -1,  1, 1,  0, 0, 1,
        -1,  1, -1,  0, 0, 1, 
        
        1, -1, -1,  0, 1, 1,  // 右面紫色
        1, -1,  1,  0, 1, 1,
        1,  1, 1,  0, 1, 1,
        1,  1,  -1,  0, 1, 1, 
             
        -1, 1, -1,  1, 1, 0,  // 上面黄色
        -1, 1, 1,  1, 1, 0,
        1, 1, 1,  1, 1, 0,
        1, 1, -1,  1, 1, 0, 
                     
        -1, -1, -1,  1, 0, 1,  // 下面青色
        -1, -1,  1,  1, 0, 1,
        1, -1, 1,  1, 0, 1,
        1, -1,  -1,  1, 0, 1, 
    ];

    // 创建顶点缓冲区并缓存数据。
    const CUBE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
    GL.bufferData(
        GL.ARRAY_BUFFER,
        new Float32Array(cube_vertex),
        GL.STATIC_DRAW
    );

    // 正方体面。
    var cube_faces = [
        0, 1, 2, // 背面
        0, 2, 3,

        4, 5, 6, // 前面
        4, 6, 7,

        8, 9, 10, // 左面
        8, 10, 11,

        12, 13, 14, // 右面
        12, 14, 15,

        16, 17, 18, // 上面
        16, 18, 19,

        20, 21, 22, // 下面
        20, 22, 23
    ];
    
    // 创建切面缓冲区。
    const CUBE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
    GL.bufferData(
        GL.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(cube_faces),
        GL.STATIC_DRAW
    );

    /*========================= THE TETRAHEDRON ========================= */
    var tetrahedron_vertex = [
        -1, -1, -1,  1, 0, 0,
        1, -1, -1,   0, 1, 0,
        0, -1, 1,   0, 0, 1,
        0, 1, 0,     1, 1, 1
    ];

    const TETRAHEDRON_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, TETRAHEDRON_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(tetrahedron_vertex), GL.STATIC_DRAW);

    var tetrahedron_faces = [
        0, 1, 2,
        0, 1, 3,
        1, 2, 3,
        0, 2, 3
    ];

    const TETRAHEDRON_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TETRAHEDRON_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(tetrahedron_faces), GL.STATIC_DRAW);

    /*========================= MATRIX ========================= */
    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width/CANVAS.height, 1, 100);
    var VIEWMATRIX = LIBS.get_I4();
    var MOVEMATRIX = LIBS.get_I4();

    // Z轴平移。
    LIBS.translateZ(VIEWMATRIX, -6);

    // 复制立方体。
    var MOVEMATRIX2 = LIBS.get_I4();

    // 四面体。
    var MOVEMATRIX_TETRA = LIBS.get_I4();

    // 球面坐标系统(r, θ, φ);
    var THETA = 0;
    var PHI = 0;
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
        var dt = time - time_old;
        // 鼠标放开后，运动衰减。
        if (!drag) {
            dX *= AMORTIZATION, dY *= AMORTIZATION;
            THETA += dX, PHI += dY;
        }

        LIBS.set_I4(MOVEMATRIX);
        LIBS.set_I4(MOVEMATRIX2);

        // 立方体原点对称旋转。
        var radius = 2;
        var position_x = radius * Math.cos(PHI) * Math.cos(THETA);
        var position_y = radius * Math.sin(PHI);
        var position_z = radius * Math.cos(PHI) * Math.sin(THETA);

        LIBS.set_position(MOVEMATRIX, position_x, position_y, position_z);
        LIBS.set_position(MOVEMATRIX2, -position_x, -position_y, -position_z);

        // 旋转时保持面平行。
        LIBS.rotateZ(MOVEMATRIX, PHI);
        LIBS.rotateZ(MOVEMATRIX2, PHI);

        LIBS.rotateY(MOVEMATRIX, THETA);
        LIBS.rotateY(MOVEMATRIX2, THETA);

        // 四面体自动旋转。
        LIBS.rotateX(MOVEMATRIX_TETRA, dt*0.0031);
        LIBS.rotateY(MOVEMATRIX_TETRA, Math.cos(time)*dt*0.0032);
        LIBS.rotateZ(MOVEMATRIX_TETRA, -dt*0.0033);

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

        GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4*(3+3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(3+3), 3*4);

        GL.uniform1f(_greyscality, 1);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
        GL.drawElements(GL.TRIANGLES, 6*2*3, GL.UNSIGNED_SHORT, 0);

        // 绘制复制立方体。
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX2);
        GL.uniform1f(_greyscality, 0);
        GL.drawElements(GL.TRIANGLES, 3*2*3, GL.UNSIGNED_SHORT, 0);
        GL.uniform1f(_greyscality, 0.5);
        GL.drawElements(GL.TRIANGLES, 3*2*3, GL.UNSIGNED_SHORT, 3*2*3*2);

        // 绘制四面体。
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_TETRA);
        GL.bindBuffer(GL.ARRAY_BUFFER, TETRAHEDRON_VERTEX);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4*(3+3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(3+3), 3*4);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TETRAHEDRON_FACES);

        GL.uniform1f(_greyscality, 0);        
        GL.drawElements(GL.TRIANGLES, 2*3, GL.UNSIGNED_SHORT, 0);

        GL.uniform1f(_greyscality, 1);        
        GL.drawElements(GL.TRIANGLES, 2*3, GL.UNSIGNED_SHORT, 2*3*2);

        // 写入缓冲区数据。
        GL.flush();

        // 请求窗口刷新。
        window.requestAnimationFrame(animate);
    };

    animate(0);
}