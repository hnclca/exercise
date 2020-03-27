function main() {
    const CANVAS = document.querySelector('#glcanvas');
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    /*========================= 粒子数组初始化 ========================= */
    var PARTICLES = [];

    var reset_particle = function(particle) {
        particle.position[0] = (Math.random() - 0.5)*4;
        particle.position[1] = (Math.random() - 0.5)*6 - 4;
        particle.position[2] = 0;

        particle.speed[0] = 0.8 * (Math.random()-0.5);
        particle.speed[1] = Math.random();
        particle.speed[2] = 0.08 * (Math.random()-0.5);

        particle.scale = 0.06 + 0.05*Math.random();
        particle.density = 0.5 + 0.5 * Math.abs(particle.position[0]/2);
    };

    for (var i = 0; i < 3000; i++) {
        var particle = {
            spriteOffset: Math.random()*15,
            density: 0,
            position: [0, 0, 0],
            scale: 0,
            speed: [0, 0, 0]
        };
        reset_particle(particle);
        PARTICLES.push(particle);
    }

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
        attribute vec2 uv;\n\
        \n\
        uniform mat4 Pmatrix, Vmatrix, Mmatrix;\n\
        uniform vec3 posParticle; \n\
        uniform float scaleParticle; \n\
        \n\
        uniform mat4 PmatrixVideo, VmatrixVideo;\n\
        uniform mat3 MmatrixInvRot;\n\
        \n\
        uniform float spriteU;\n\
        \n\
        varying vec2 vUV, vUVSmoke;\n\
        void main(void) {\n\
            vec4 clipPosition = Pmatrix * (Vmatrix * Mmatrix * vec4(posParticle, 1.) + scaleParticle * vec4(position, 0.));\n\
            gl_Position = clipPosition;\n\
            vec4 clipPositionVideo = PmatrixVideo * VmatrixVideo * vec4(posParticle+MmatrixInvRot*scaleParticle*position, 1.);\n\
            vUV = 0.5*clipPositionVideo.xy/clipPositionVideo.w + vec2(0.5, 0.5);\n\
            vUVSmoke = (uv + vec2(spriteU, 0.)) / vec2(15., 1.); \n\
        }";

    const shader_fragment_source = "\n\
        precision mediump float;\n\
        uniform sampler2D samplerVideo, samplerSmoke;\n\
        uniform float density; \n\
        \n\
        const vec4 SMOKE_COLOR = vec4(1., 1., 1., 1.); \n\
        \n\
        varying vec2 vUV, vUVSmoke;\n\
        void main(void) {\n\
            vec4 videoColor = texture2D(samplerVideo, vUV); \n\
            float mixCoeff = 1.; \n\
            if (vUV.x > 1. || vUV.x < 0. || vUV.y > 1. || vUV.y < 0.) mixCoeff = 0.; \n\
            vec4 smokeColor = texture2D(samplerSmoke, vUVSmoke); \n\
            vec4 color = mix(SMOKE_COLOR, videoColor, mixCoeff); \n\
            color.a = 0.2*smokeColor.a; \n\
            gl_FragColor = color;\n\
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
    // 视频的投影、视图和运动旋转矩阵。
    var _PmatrixVideo = GL.getUniformLocation(SHADER_PROGRAM, "PmatrixVideo");
    var _VmatrixVideo = GL.getUniformLocation(SHADER_PROGRAM, "VmatrixVideo");
    var _MmatrixInvRot = GL.getUniformLocation(SHADER_PROGRAM, "MmatrixInvRot");
    // 精灵位置变量。
    var _spriteU = GL.getUniformLocation(SHADER_PROGRAM, "spriteU");
    // 获取粒子位置变量。
    var _posParticle = GL.getUniformLocation(SHADER_PROGRAM, "posParticle");
    // 获取粒子比例变量。
    var _scaleParticle = GL.getUniformLocation(SHADER_PROGRAM, "scaleParticle");
    // 获取视频纹理采样器。
    var _samplerVideo = GL.getUniformLocation(SHADER_PROGRAM, "samplerVideo");
    // 获取烟雾纹理采样器。
    var _samplerSmoke = GL.getUniformLocation(SHADER_PROGRAM, "samplerSmoke");
    // 获取深度变量。
    var _density = GL.getUniformLocation(SHADER_PROGRAM, "density");
    // 获取纹理信息。
    var _uv = GL.getAttribLocation(SHADER_PROGRAM, "uv");
    // 获取顶点信息。
    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    // 启用颜色属性数组。
    GL.enableVertexAttribArray(_uv);
    // 启用顶点属性数组。
    GL.enableVertexAttribArray(_position);
    // 使用程序。
    GL.useProgram(SHADER_PROGRAM);
    // 指定纹理采样器编号，着色器可绑定多个纹理采样器。
    GL.uniform1i(_samplerVideo, 0);
    GL.uniform1i(_samplerSmoke, 1);

    /*========================= CUBE ========================= */
    // 顶点(XYZ)和颜色(三位)数据。
    // 0,0,0为正中心。
    var quad_vertex = [
        -1, -1, 0, 0, 0,
        1, -1, 0, 1, 0,
        1, 1, 0, 1, 1,
        -1, 1, 0, 0, 1
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

    /*========================= MATRIX ========================= */
    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width/CANVAS.height, 0.1, 10);
    var VIEWMATRIX = LIBS.get_I4();
    var MOVEMATRIX = LIBS.get_I4();

    var PROJMATRIX_VIDEO = false;
    var VIEWMATRIX_VIDEO = LIBS.get_I4();
    LIBS.translateZ(VIEWMATRIX_VIDEO, -4);
    var MMATRIX_INV_ROT = LIBS.get_I3();

    // Z轴平移。
    LIBS.translateZ(VIEWMATRIX, -6);

    // 球面坐标系统(r, θ, φ);
    var THETA = 0;
    var PHI = 0;

    /*========================= 烟雾纹理  ========================= */
    var smokeImage = new Image();
    var smokeTexture = GL.createTexture();
    smokeImage.onload = function() {
        GL.activeTexture(GL.TEXTURE1);
        GL.bindTexture(GL.TEXTURE_2D, smokeTexture);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST_MIPMAP_LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.MIRRORED_REPEAT);

        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, smokeImage);
        GL.generateMipmap(GL.TEXTURE_2D);

        GL.activeTexture(GL.TEXTURE0);
    };

    smokeImage.src = "resources/smokeSprite.png";

    /*========================= 视频纹理  ========================= */
    var video = document.querySelector("#bunny_video");

    var videoTexture = GL.createTexture();
    // 指定像素存储顺序。
    GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
    // 绑定纹理对象到上下文。
    GL.bindTexture(GL.TEXTURE_2D, videoTexture);
    // 指定纹理缩放过滤器使用插值方式。
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    // 生成纹理映射(视频不存在MIPMAP)。
    // GL.generateMipmap(GL.TEXTURE_2D);
    // 解绑纹理对象。
    GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE );
    GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE );

    var refresh_texture = function() {
        GL.bindTexture(GL.TEXTURE_2D, videoTexture);
        // 读取视频帧到纹理对象。
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, video);
    };

    /*========================= DRAWING ========================= */
    // 重置颜色(#2f83e0)。
    GL.clearColor(0.184, 0.513, 0.878, 1.0);
    
    // 禁用深度测试和深度缓冲区写入。
    GL.disable(GL.DEPTH_TEST);
    GL.depthMask(false);

    // 启用透明度混合。
    GL.enable(GL.BLEND);
    GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);

    // 重置深度(像素位到相机距离，与视窗大小相关，为[-1,1]区间的正态函数)。
    GL.clearDepth(1.0);
    
    GL.bindBuffer(GL.ARRAY_BUFFER, QUAD_VERTEX);
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4*(3+2), 0);
    GL.vertexAttribPointer(_uv, 2, GL.FLOAT, false, 4*(3+2), 3*4);

    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, QUAD_FACES);

    // 旧时间点。
    var time_old = 0;
    // 视频时间。
    var time_video=0;

    var animate = function(time) {
        // 动画间隔时间，单位秒。
        // 解决因tab切换动画暂停导致dt值过大，partices数组重置问题。
        var dt = Math.min(0.2, (time - time_old) / 1000);
        time_old = time;

        // 鼠标放开后，运动衰减。
        if (!drag) {
            dX *= AMORTIZATION, dY *= AMORTIZATION;
            THETA += dX, PHI += dY;
            // 鼠标释放时恢复相机位置。
            THETA *= 0.9;
            PHI *= 0.9;
        }

        LIBS.set_I4(MOVEMATRIX);
        LIBS.rotateX(MOVEMATRIX, PHI);
        LIBS.rotateY(MOVEMATRIX, THETA);

        // 设置视窗，清除颜色缓存位和深度缓存位。
        GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        // 设置投影矩阵。
        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        // 设置视图矩阵。
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        // 设置运动矩阵。
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);

        // 转换并绑定旋转矩阵。
        LIBS.transpose43(MOVEMATRIX, MMATRIX_INV_ROT);
        GL.uniformMatrix3fv(_MmatrixInvRot, false, MMATRIX_INV_ROT);
        // 如果视频正在播放，刷新纹理。
        if (video.currentTime > 0 && video.currentTime != time_video) {
            time_video = video.currentTime;
            if (!PROJMATRIX_VIDEO) {
                // 为更好的视觉效果，投影角度由40修改为30，缩小视频显示尺寸。
                PROJMATRIX_VIDEO = LIBS.get_projection(30, video.videoWidth/video.videoHeight, 0.1, 10);
                GL.uniformMatrix4fv(_PmatrixVideo, false, PROJMATRIX_VIDEO);
                GL.uniformMatrix4fv(_VmatrixVideo, false, VIEWMATRIX_VIDEO);
            }
            refresh_texture();
        }

        PARTICLES.forEach(function(particle){
            GL.uniform3fv(_posParticle, particle.position);
            GL.uniform1f(_scaleParticle, particle.scale);
            GL.uniform1f(_density, particle.density);
            GL.uniform1f(_spriteU, Math.floor(particle.spriteOffset));

            GL.drawElements(GL.TRIANGLES, 3*2, GL.UNSIGNED_SHORT, 0);

            // 浮空力。
            var Fm = [0, 0.02/particle.density, 0];

            var v2 = LIBS.squareVec3(particle.speed);
            // 摩擦系数。
            v2 *= 1;
            var vu = LIBS.get_unitVector(particle.speed);
            // 添加空气摩擦力。
            Fm[0] -= v2 * vu[0], Fm[1] -= v2 * vu[1], Fm[2] -= v2 * vu[2];

            particle.speed[0] += dt * Fm[0];
            particle.speed[1] += dt * Fm[1];
            particle.speed[2] += dt * Fm[2];

            particle.position[0] += dt * particle.speed[0];
            particle.position[1] += dt * particle.speed[1];
            particle.position[2] += dt * particle.speed[2];

            // 设置空间稀释度。
            var dilution = dt * 0.06;
            particle.scale += dilution;
            particle.density *= Math.pow(1-dilution, 3);

            // 当粒子Y坐标过高时，重置粒子属性。
            if (particle.position[1] > 4)  reset_particle(particle);

            ++particle.spriteOffset;
            if (particle.spriteOffset >= 15) particle.spriteOffset = 0;
        });

        // 写入缓冲区数据。
        GL.flush();

        // 请求窗口刷新。
        window.requestAnimationFrame(animate);
    };

    animate(0);
}