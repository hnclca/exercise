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
        attribute vec2 position;\n\
        \n\
        varying vec2 vUV;\n\
        void main(void) {\n\
            gl_Position = vec4(position, 0., 1.);\n\
            vUV = 0.5*(position + vec2(1., 1.));\n\
        }";

    const shader_fragment_source = "\n\
        precision highp float;\n\
        uniform sampler2D samplerVideo, samplerPalette;\n\
        \n\
        varying vec2 vUV;\n\
        void main(void) {\n\
            vec4 videoColor = texture2D(samplerVideo, vUV);\n\
            \n\
            videoColor = floor(256.*videoColor - vec4(0.01/256., 0., 0., 0.))/256.; \n\
            videoColor = clamp(videoColor, vec4(0., 0., 0., 0.), vec4(1., 1., 1., 1.)); \n\
            \n\
            float blueBlock = floor(videoColor.b * 256.); \n\
            float yBlue = floor(blueBlock/16.)/16.; \n\
            float xBlue = floor((blueBlock - yBlue*256.)/16.)/16.; \n\
            \n\
            vec2 uvPalette = vec2(videoColor.r/16. + yBlue, 1.-videoColor.g/16. - xBlue); \n\
            gl_FragColor = texture2D(samplerPalette, uvPalette); \n\
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
    // 获取纹理采样器。
    var _samplerVideo = GL.getUniformLocation(SHADER_PROGRAM, "samplerVideo");
    var _samplerPalette = GL.getUniformLocation(SHADER_PROGRAM, "samplerPalette");
    // 获取顶点信息。
    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    // 启用顶点属性数组。
    GL.enableVertexAttribArray(_position);
    // 使用程序。
    GL.useProgram(SHADER_PROGRAM);
    // 指定纹理采样器编号，着色器可绑定多个纹理采样器。
    GL.uniform1i(_samplerVideo, 0);
    GL.uniform1i(_samplerPalette, 1);

    /*========================= CUBE ========================= */
    // 顶点(XYZ)和颜色(三位)数据。
    // 0,0,0为正中心。
    var quad_vertex = [
        -1, -1,
        1, -1,
        1, 1,
        -1, 1,
    ];

    // 创建顶点缓冲区并缓存数据。
    const QUAD_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, QUAD_VERTEX);
    GL.bufferData(
        GL.ARRAY_BUFFER,
        new Float32Array(quad_vertex),
        GL.STATIC_DRAW
    );

    // 正方体面。
    var quad_faces = [
        0, 1, 2,
        0, 2, 3
    ];
    
    // 创建切面缓冲区。
    const QUAD_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, QUAD_FACES);
    GL.bufferData(
        GL.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(quad_faces),
        GL.STATIC_DRAW
    );

    /*========================= 调色盘纹理 ========================= */
    var paletteImage = new Image();
    var paletteTexture = GL.createTexture();

    paletteImage.onload = function() {
        GL.activeTexture(GL.TEXTURE1);

        GL.bindTexture(GL.TEXTURE_2D, paletteTexture);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);

        GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, paletteImage);
    };

    paletteImage.src = "resources/palette_modified.jpg";

    /*========================= TEXTURES ========================= */
    var video = document.querySelector("#bunny_video");

    var texture = GL.createTexture();
    // 指定像素存储顺序。
    GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
    // 绑定纹理对象到上下文。
    GL.bindTexture(GL.TEXTURE_2D, texture);
    // 指定纹理缩放过滤器使用插值方式。
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    // 生成纹理映射(视频不存在MIPMAP)。
    // GL.generateMipmap(GL.TEXTURE_2D);
    // 解绑纹理对象。
    GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE );
    GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE );
    GL.bindTexture(GL.TEXTURE_2D, null);

    var refresh_texture = function() {
        GL.bindTexture(GL.TEXTURE_2D, texture);
        // 读取视频帧到纹理对象。
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, video);
    };

    /*========================= DRAWING ========================= */
    // 重置颜色。
    GL.clearColor(0.0, 0.0, 0.0, 0.0);
    GL.clear(GL.COLOR_BUFFER_BIT);
    GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);
    
    // 禁用深度测试并指定深度函数。
    GL.disable(GL.DEPTH_TEST);
    GL.disable(GL.SCISSOR_TEST);

    // 重置深度(像素位到相机距离，与视窗大小相关，为[-1,1]区间的正态函数)。
    GL.clearDepth(1.0);

    GL.bindBuffer(GL.ARRAY_BUFFER, QUAD_VERTEX);
    GL.vertexAttribPointer(_position, 2, GL.FLOAT, false,4*2,0) ;

    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, QUAD_FACES);

    var animate = function() {
        if (video.currentTime>0) {
            GL.activeTexture(GL.TEXTURE0);
            refresh_texture();
          }
      
          GL.drawElements(GL.TRIANGLES, 6, GL.UNSIGNED_SHORT, 0);
          GL.flush();
      

        // 请求窗口刷新。
        window.requestAnimationFrame(animate);
    };

    animate();
}