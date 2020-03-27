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
        dX = (e.pageX - x_old)*Math.PI / CANVAS.width;
        dY = (e.pageY - y_old)*Math.PI / CANVAS.height;
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
    var EXT = GL.getExtension("OES_element_index_uint") ||
        GL.getExtension("MOZ_OES_element_index_uint") ||
        GL.getExtension("WEBKIT_OES_element_index_uint");
    
    if (!GL || !EXT) {
        alert("Unable to initialize WebGL. Your browser or machine may not suppport it.");
        return;
    }

    /*========================= SHADERS ========================= */
    // 供WebGL编译的着色器源代码。坐标vec2为2D, vec3为3D(X,Y,Z)
    // 顶点属性：坐标、颜色。
    // 顶点矩阵：投影矩阵, 运动矩阵。
    const shader_vertex_source = "\n\
        attribute vec3 position;\n\
        // attribute vec3 color;\n\
        attribute vec2 uv;\n\
        attribute vec3 normal; // 法线。\n\
        \n\
        uniform mat4 Pmatrix;\n\
        uniform mat4 Vmatrix;\n\
        uniform mat4 Mmatrix;\n\
        \n\
        varying vec2 vUV;\n\
        varying vec3 vNormal; \n\
        varying vec3 vView; // 视图矢量。 \n\
        void main(void) {\n\
            gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);\n\
            vNormal = vec3(Mmatrix * vec4(normal, 0.)); \n\
            vUV = uv;\n\
            vView = vec3(Vmatrix * Mmatrix * vec4(position, 1.)); \n\
        }";

    const shader_fragment_source = "\n\
        precision mediump float;\n\
        uniform sampler2D sampler;\n\
        // 照明参数。\n\
        const vec3 source_ambient_color = vec3(1., 1., 1.); // 环境光。\n\
        const vec3 source_diffuse_color = vec3(1., 2., 4.); // 漫反射光。\n\
        const vec3 source_specular_color = vec3(1., 1., 1.); // 镜面反射，与距相机距离相关，即与视图矢量有关。\n\
        const vec3 source_direction = vec3(0., 0., 1.); // 光源方向。\n\
        \n\
        // 材质系数。\n\
        const vec3 mat_ambient_color = vec3(0.3, 0.3, 0.3);\n\
        const vec3 mat_diffuse_color = vec3(0.3, 0.3, 0.3);\n\
        const vec3 mat_specular_color = vec3(1., 1., 1.);\n\
        const float mat_shininess = 5.;\n\
        \n\
        varying vec2 vUV;\n\
        varying vec3 vNormal; \n\
        varying vec3 vView; // 视图坐标。 \n\
        void main(void) {\n\
            vec3 color = vec3(texture2D(sampler, vUV)); \n\
            vec3 I_ambient = source_ambient_color * mat_ambient_color; \n\
            vec3 I_diffuse = source_diffuse_color * mat_diffuse_color * max(0., dot(vNormal, source_direction)); \n\
            vec3 V = normalize(vView); \n\
            vec3 R = reflect(source_direction, vNormal); \n\
            vec3 I_specular = source_specular_color * mat_specular_color * pow(max(0., dot(R, V)), mat_shininess); \n\
            vec3 I = I_ambient + I_diffuse + I_specular; \n\
            gl_FragColor = vec4(I*color, 1.);\n\
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
    // 获取纹理采样器。
    var _sampler = GL.getUniformLocation(SHADER_PROGRAM, "sampler");
    // 获取纹理信息。
    var _uv = GL.getAttribLocation(SHADER_PROGRAM, "uv");
    // 获取顶点信息。
    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    // 获取法线信息。
    var _normal = GL.getAttribLocation(SHADER_PROGRAM, "normal");
    // 启用颜色属性数组。
    GL.enableVertexAttribArray(_uv);
    // 启用顶点属性数组。
    GL.enableVertexAttribArray(_position);
    GL.enableVertexAttribArray(_normal);
    // 使用程序。
    GL.useProgram(SHADER_PROGRAM);
    // 指定纹理采样器编号，着色器可绑定多个纹理采样器。
    GL.uniform1i(_sampler, 0);

    /*========================= DRAGON ========================= */
    var DRAGON_VERTEX = false, DRAGON_FACES = false, DRAGON_NPOINTS = 0;

    LIBS.get_json("resources/dragon.json", function(dragon) {
        // vertex.
        DRAGON_VERTEX = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, DRAGON_VERTEX);
        GL.bufferData(GL.ARRAY_BUFFER,
            new Float32Array(dragon.vertices),
            GL.STATIC_DRAW);

        // faces.
        DRAGON_FACES = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, DRAGON_FACES);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
            new Uint32Array(dragon.indices),
            GL.STATIC_DRAW);

        DRAGON_NPOINTS = dragon.indices.length;
            
        animate(0);
    });

    /*========================= MATRIX ========================= */
    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width/CANVAS.height, 1, 100);
    var VIEWMATRIX = LIBS.get_I4();
    var MOVEMATRIX = LIBS.get_I4();

    // Z轴平移。
    LIBS.translateZ(VIEWMATRIX, -20);
    LIBS.translateY(VIEWMATRIX, -4);
    //LIBS.translateX(VIEWMATRIX, -5);

    // 球面坐标系统(r, θ, φ);
    var THETA = 0;
    var PHI = 0;

    /*========================= TEXTURES ========================= */
    var get_texture = function(image_URL) {
        var image = new Image();
        image.src = image_URL;
        image.webglTexture = false; // 清空纹理。

        image.onload = function(e) {
            var texture = GL.createTexture();
            // 指定像素存储顺序。
            GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
            // 绑定纹理对象到上下文。
            GL.bindTexture(GL.TEXTURE_2D, texture);
            // 读取图像数据到纹理对象。
            GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
            // 指定纹理缩放过滤器使用插值方式。
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
            // GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
            // GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST_MIPMAP_NEAREST);
            // GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST_MIPMAP_LINEAR);
            // GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
            // 生成纹理映射。
            GL.generateMipmap(GL.TEXTURE_2D);
            // 解绑纹理对象。
            GL.bindTexture(GL.TEXTURE_2D, null);
            // 指定图像的纹理对象。
            image.webglTexture = texture;
        };
        return image;
    };

    var dragon_texture = get_texture("resources/dragon.png");

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
        LIBS.rotateX(MOVEMATRIX, PHI);
        LIBS.rotateY(MOVEMATRIX, THETA);
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
        // 如果纹理对象加载完成，则激活并绑定纹理对象。
        if (dragon_texture.webglTexture) {
            // 激活0号纹理。
            GL.activeTexture(GL.TEXTURE0);
            GL.bindTexture(GL.TEXTURE_2D, dragon_texture.webglTexture);
        }

        GL.bindBuffer(GL.ARRAY_BUFFER, DRAGON_VERTEX);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4*(3+3+2), 0);
        GL.vertexAttribPointer(_uv, 2, GL.FLOAT, false, 4*(3+3+2), (3+3)*4);
        GL.vertexAttribPointer(_normal, 3, GL.FLOAT, false, 4*(3+3+2), 3*4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, DRAGON_FACES);
        GL.drawElements(GL.TRIANGLES, DRAGON_NPOINTS, GL.UNSIGNED_INT, 0);

        // 写入缓冲区数据。
        GL.flush();

        // 请求窗口刷新。
        window.requestAnimationFrame(animate);
    };
}