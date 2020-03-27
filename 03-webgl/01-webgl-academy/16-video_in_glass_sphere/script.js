function main() {
    const CANVAS = document.querySelector('#glcanvas');
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;
    
    /*========================= 光线变量 ========================= */
    // 光源位置。
    var RAY_VECTOR = [0, 0, 0];
    // 是否与光线相交。
    var RAY_INTERSECT = false;
    // 光线相交球体序号。
    var SPHERE_INTERSECTED = -1;

    /*========================= CAPTURE MOUSE EVENTS ========================= */
    // 运动衰减系数。
    var AMORTIZATION=0.9;

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
        if (!drag) {
            // 发射光线。
            // 正态化当前鼠标位置(-1, 1)。
            var xN = 2 * (e.pageX/CANVAS.width) - 1;
            var yN = 2 * (e.pageY/CANVAS.height) - 1;

            RAY_VECTOR[0] = - (1/PROJMATRIX[0]) * xN;
            RAY_VECTOR[1] = (1/PROJMATRIX[5]) * yN;
            RAY_VECTOR[2] = 1;

            LIBS.normalize(RAY_VECTOR);

            RAY_INTERSECT = false;
            // 相交距离。
            var k2Intersect = 1e12;

            // 计算光线与相机的交集。
            SPHERES.forEach(function(sphere, sphereIndex) {
                // 计算视图参考图中球心的坐标。
                var centerScene = LIBS.getTranslation(sphere.matrix);
                var centerView = LIBS.multiVecMat4(VIEWMATRIX, centerScene);

                // 计算球心与光线的距离。
                var APcrossRay = LIBS.cross(centerView, RAY_VECTOR);
                var d2 = LIBS.squareNorm(APcrossRay);

                // 如果球心与光线的距离小于球半径1。
                if (d2 < 1) {
                    k2 = LIBS.squareNorm(centerView);
                    // 判断最小相交距离。
                    if (k2 < k2Intersect) {
                        k2Intersect = k2;
                        RAY_INTERSECT = true;
                        SPHERE_INTERSECTED = sphereIndex;
                    }
                }
            });

            return false;
        }
        dX = -(e.pageX - x_old)*Math.PI / CANVAS.width;
        dY = (e.pageY - y_old)*Math.PI / CANVAS.height;
        THETA += dX;
        PHI += dY;
        x_old = e.pageX;
        y_old = e.pageY;
        e.preventDefault();
    };

    // 鼠标点击球体后自动旋转标识与角度。
    var ROTATE_AUTO = false;
    var CONSIGN_ANGLE = 0;

    // 查看视频标识、索引及视频平滑展开时间。
    var VIEWING_VIDEO = false;
    var VIEWING_VIDEO_INDEX = 0;
    var VIEWING_VIDEO_T = 0;

    var mouseClick = function(e) {
        if (VIEWING_VIDEO) {
            VIEWING_VIDEO = false;
        } else {
            if (!RAY_INTERSECT) return false;

            ROTATE_AUTO = true;
            CONSIGN_ANGLE = Math.PI/2 - (SPHERE_INTERSECTED+0.25) * 2 * Math.PI / 5;

            while (CONSIGN_ANGLE-THETA < -Math.PI) CONSIGN_ANGLE += 2*Math.PI;
            while (CONSIGN_ANGLE-THETA > Math.PI) CONSIGN_ANGLE -= 2*Math.PI;

            VIEWING_VIDEO = true;
            VIEWING_VIDEO_INDEX = SPHERE_INTERSECTED;
        }
    }

    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);
    CANVAS.addEventListener("mousemove", mouseMove, false);
    CANVAS.addEventListener("click", mouseClick, false);

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
    // 球面半径为1，法线与位置坐标相同，取消uv。
    const shader_vertex_source = "\n\
        attribute vec3 position;\n\
        attribute vec2 uv;\n\
        \n\
        uniform mat4 Pmatrix;\n\
        uniform mat4 Vmatrix;\n\
        uniform mat4 Mmatrix;\n\
        uniform vec3 camera; \n\
        uniform float viewingCoeffVS; \n\
        uniform float aspectRatio; \n\
        \n\
        varying vec2 vUV;\n\
        varying vec3 vNormal; \n\
        varying float vFog; \n\
        void main(void) {\n\
            vec4 scenePosition = Mmatrix * vec4(position, 1.); \n\
            vec4 sceneNormal = Mmatrix * vec4(position, 0.); \n\
            vec3 incident = normalize(scenePosition.xyz+camera);  // 入射单位向量 \n\
            vec3 refracted = refract(incident, sceneNormal.xyz, 1./2.4);  // 折射单位向量(钻石折射率) \n\
            \n\
            float k = -sceneNormal.z / refracted.z; \n\
            vec2 I = sceneNormal.xy + k * refracted.xy; \n\
            \n\
            vec4 viewPosition = Vmatrix * scenePosition; \n\
            vec4 screenPosition = vec4(uv - vec2(0.5, 0.5), 0., 1.); \n\
            screenPosition.y *= aspectRatio; \n\
            gl_Position = mix(Pmatrix * viewPosition, screenPosition, viewingCoeffVS);\n\
            \n\
            vUV = mix(I + vec2(.5, .5), uv, viewingCoeffVS);\n\
            vNormal = vec3(Vmatrix * sceneNormal); \n\
            vFog =1. -smoothstep(2., 18., -viewPosition.z); \n\
        }";

    const shader_fragment_source = "\n\
        precision mediump float;\n\
        uniform sampler2D samplerVideo;\n\
        uniform vec3 cameraFlag; \n\
        uniform float highlight; \n\
        uniform float viewingCoeffFS; \n\
        \n\
        const vec3 LIGHT = vec3(0., 1., 0.); \n\
        \n\
        varying vec2 vUV;\n\
        varying vec3 vNormal; \n\
        varying float vFog; \n\
        void main(void) {\n\
            vec4 videoColor = texture2D(samplerVideo, vUV);\n\
            float I = 1.; // 环境光 \n\
            vec3 R = normalize(reflect(LIGHT, vNormal)); // 反射光 \n\
            I += max(0.001, pow(dot(R, 1.2*normalize(cameraFlag)), 16.)); // 使用0.001避免windows下chrome41中angle的BUG \n\
            I *= 1. - pow(1. - vNormal.z, 2.); // 添加黑色边框 \n\
            I *= vFog; // 添加雾衰减 \n\
            I *= highlight; // 添加高光 \n\
            gl_FragColor = vec4(videoColor.xyz*mix(I, 1., viewingCoeffFS), 1.); \n\
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
    var _samplerVideo = GL.getUniformLocation(SHADER_PROGRAM, "samplerVideo");
    // 获取相机变量。
    var _camera = GL.getUniformLocation(SHADER_PROGRAM, "camera");
    var _cameraFlag = GL.getUniformLocation(SHADER_PROGRAM, "cameraFlag");
    // 获取高光变量。
    var _highlight = GL.getUniformLocation(SHADER_PROGRAM, "highlight");
    // 视频展开效果相关变量。
    var _viewingCoeffVS = GL.getUniformLocation(SHADER_PROGRAM, "viewingCoeffVS");
    var _viewingCoeffFS = GL.getUniformLocation(SHADER_PROGRAM, "viewingCoeffFS");
    // 视频宽高比修正变量。
    var _aspectRatio = GL.getUniformLocation(SHADER_PROGRAM, "aspectRatio");
    // 获取顶点信息。
    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    var _uv = GL.getAttribLocation(SHADER_PROGRAM, "uv");
    // 启用顶点属性数组。
    GL.enableVertexAttribArray(_position);
    GL.enableVertexAttribArray(_uv);
    // 使用程序。
    GL.useProgram(SHADER_PROGRAM);
    // 指定纹理采样器编号，着色器可绑定多个纹理采样器。
    GL.uniform1i(_samplerVideo, 0);

    /*========================= THE SPHERE ========================= */
    // 球体的半径为1。
    // 球体风格的冠（与纬度相关）、带（与经度相关）、顶点数。
    var nCrowns = 64;
    var nBands = 32;
    var nVertices = 0;

    var sphere_vertices = [];
    var sphere_indices = [];
    var c, b, theta, phi;

    for (c = 0; c <= nCrowns; c++) {
        phi = Math.PI * c / nCrowns; // 计算纬度。

        for (b = 0; b <= nBands; b++) {
            theta = 2 * Math.PI * b / nBands; // 计算经度。
            sphere_vertices.push(
                Math.cos(theta) * Math.sin(phi),  // X
                Math.cos(phi),                    // Y
                Math.sin(theta) * Math.sin(phi),  // Z
                theta / (2*Math.PI),              // U
                phi / Math.PI                     // V
            );

            if (c !== 0) {
                sphere_indices.push(c*(nBands+1)+b, c*(nBands+1)+b-1, (c-1)*(nBands+1)+b);
                nVertices += 3;
            }
            if (c !==0 && c !== 1) {
                sphere_indices.push(c*(nBands+1)+b-1, (c-1)*(nBands+1)+b, (c-1)*(nBands+1)+b-1);
                nVertices += 3;
            }
        }
    }

    // 创建顶点缓冲区并缓存数据。
    const SPHERE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, SPHERE_VERTEX);
    GL.bufferData(
        GL.ARRAY_BUFFER,
        new Float32Array(sphere_vertices),
        GL.STATIC_DRAW
    );
    
    // 创建切面缓冲区。
    const SPHERE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SPHERE_FACES);
    GL.bufferData(
        GL.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(sphere_indices),
        GL.STATIC_DRAW
    );

    /*========================= MATRIX ========================= */
    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width/CANVAS.height, 0.1, 20);
    var VIEWMATRIX = LIBS.get_I4();
    var MOVEMATRIX = LIBS.get_I4();

    // 相机位置(鸟瞰视图))。
    var cameraPosition = [0, 0.5, -8];
    GL.uniform3fv(_camera, cameraPosition);
    GL.uniform3fv(_cameraFlag, cameraPosition);

    // 球面坐标系统(r, θ, φ);
    var THETA = 0;
    var PHI = 0;

    /*========================= 初始化球体数组 ========================= */
    var SPHERES = [];
    var radius = 3;

    for (var i = 0; i < 5; i++) {
        // 添加些许偏转角度。
        var angle = (i + 0.25) * (2 * Math.PI / 5);
        var matrix = LIBS.get_I4();
        LIBS.translateX(matrix, radius * Math.cos(angle));
        LIBS.translateZ(matrix, radius * Math.sin(angle));

        var videoElement = document.createElement("video");
        videoElement.setAttribute("autoplay", "true");
        videoElement.setAttribute("loop", "true");
        videoElement.src = "resources/baggy" + i + ".ogv";

        var videoTexture = GL.createTexture();
        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
        GL.bindTexture(GL.TEXTURE_2D, videoTexture);

        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
        
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

        SPHERES.push({
            angle: angle,
            matrix: matrix,
            video: videoElement,
            videoTexture: videoTexture,
            oldTime: 0
        });
    }

    /*========================= DRAWING ========================= */
    // 重置颜色。
    GL.clearColor(15/255, 50/255, 83/255, 1.0);
    
    // 启用深度测试并指定深度函数。
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);

    // 重置深度(像素位到相机距离，与视窗大小相关，为[-1,1]区间的正态函数)。
    GL.clearDepth(1.0);
    
    GL.bindBuffer(GL.ARRAY_BUFFER, SPHERE_VERTEX);
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4*(3+2), 0);
    GL.vertexAttribPointer(_uv, 2, GL.FLOAT, false, 4*(3+2), 4*3);

    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SPHERE_FACES);

    // 旧时间点。
    var time_old = 0;

    var animate = function(time) {
        // 根据时间计算旋转角度。
        var dt = time - time_old;
        // 鼠标放开后，运动衰减。
        if (!drag) {
            dX *= AMORTIZATION, dY *= AMORTIZATION;
            THETA += dX, PHI += dY;
            PHI *= 0.95;
        }

        if (ROTATE_AUTO) {
            if (Math.abs(CONSIGN_ANGLE - THETA) < 0.05) {
                ROTATE_AUTO = false;
            } else {
                THETA += 0.1 * (CONSIGN_ANGLE - THETA);
            }
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
        
        // YZ轴平移，X轴旋转。
        LIBS.set_I4(VIEWMATRIX);
        LIBS.translateY(VIEWMATRIX, cameraPosition[1]);
        LIBS.translateZ(VIEWMATRIX, cameraPosition[2]);
        LIBS.rotateX(VIEWMATRIX, Math.PI/6+PHI);

        // 设置视图矩阵。
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

        SPHERES.forEach(function(sphere, sphereIndex) {
            if (VIEWING_VIDEO_INDEX === sphereIndex) {
                GL.uniform1f(_viewingCoeffVS, VIEWING_VIDEO_T);
                GL.uniform1f(_viewingCoeffFS, VIEWING_VIDEO_T);

                if (VIEWING_VIDEO && VIEWING_VIDEO_T < 1) VIEWING_VIDEO_T += 0.05;
                if (!VIEWING_VIDEO && VIEWING_VIDEO_T > 0) VIEWING_VIDEO_T -= 0.05;

                GL.uniform1f(_aspectRatio, (sphere.video.videoHeight*CANVAS.width)/(sphere.video.videoWidth*CANVAS.height));
            }

            GL.uniform1f(_highlight, (RAY_INTERSECT && SPHERE_INTERSECTED === sphereIndex) ? 1.8 : 1);

            LIBS.set_I4(sphere.matrix);
            LIBS.translateX(sphere.matrix, radius*Math.cos(sphere.angle+THETA));
            LIBS.translateZ(sphere.matrix, radius*Math.sin(sphere.angle+THETA));

            GL.uniformMatrix4fv(_Mmatrix, false, sphere.matrix);
            GL.bindTexture(GL.TEXTURE_2D, sphere.videoTexture);

            // 如果视频正在播放，刷新纹理。
            if (sphere.video.currentTime > 0 && sphere.video.currentTime !== sphere.oldTime) {
                sphere.oldTime = sphere.video.currentTime;
                // // 激活0号纹理。
                // GL.activeTexture(GL.TEXTURE0);
                // 读取视频帧到纹理对象。
                GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, sphere.video);
            }
            
            GL.drawElements(GL.TRIANGLES, nVertices, GL.UNSIGNED_SHORT, 0);

            if (VIEWING_VIDEO_INDEX === sphereIndex) {
                GL.uniform1f(_viewingCoeffVS, 0);
                GL.uniform1f(_viewingCoeffFS, 0);
            }
        });

        // 写入缓冲区数据。
        GL.flush();

        // 请求窗口刷新。
        window.requestAnimationFrame(animate);
    };

    animate(0);
}