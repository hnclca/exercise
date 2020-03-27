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

    // 标准化后的鼠标当前坐标。
    var X_NORMALIZED=0, Y_NORMALIZED=0;

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
        
        X_NORMALIZED = (e.pageX/CANVAS.width) * 2 - 1;
        Y_NORMALIZED = 1 - (e.pageY/CANVAS.height) * 2;
        var ray_direction = [
            -X_NORMALIZED / PROJMATRIX[0],
            -Y_NORMALIZED / PROJMATRIX[5],
            1
        ];
        LIBS.normalize(ray_direction);
        
        // 光线初始坐标。
        var ray_origin = [0, 0, 0];

        var ray_direction_scene = LIBS.multiVectorByMatrixInv(ray_direction, VIEWMATRIX);
        var ray_origin_scene = LIBS.multiPointByMatrixInv(ray_origin, VIEWMATRIX);

        var ray_direction_dragon = LIBS.multiVectorByMatrixInv(ray_direction_scene, MOVEMATRIX);
        var ray_origin_dragon = LIBS.multiPointByMatrixInv(ray_origin_scene, MOVEMATRIX);

        var ray_plucker = LIB_INTERSECT.plucker_axis(ray_origin_dragon, ray_direction_dragon);

        var node_intersect_ray = function(node) {
            if (!LIB_INTERSECT.intersect_ray_AABB(ray_plucker, node.plucker)) return false;
            
            if (node.leaf) {
                for (var face_i in node.faces) {
                    if (LIB_INTERSECT.intersect_ray_triangle(ray_plucker, node.faces[face_i].plucker)) {
                        node.show = true;
                        node.blue = true;
                        return true;
                    }
                }
                return false;
            } else {
                for (var i = 0; i < 8; i++) {
                    if (node_intersect_ray(node.children[i])) {
                        node.show = true;
                        return true;
                    }
                }
                return false;
            }
        };

        CELLS.forEach(function(cell) {
            cell.show = false;
            cell.blue = false;
        });

        node_intersect_ray(OCTREE)

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
        \n\
        uniform mat4 Pmatrix;\n\
        uniform mat4 Vmatrix;\n\
        uniform mat4 Mmatrix;\n\
        \n\
        varying vec2 vUV;\n\
        void main(void) {\n\
            gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);\n\
            vUV = uv;\n\
        }";

    const shader_fragment_source = "\n\
        precision mediump float;\n\
        uniform sampler2D sampler;\n\
        \n\
        varying vec2 vUV;\n\
        void main(void) {\n\
            vec4 color = texture2D(sampler, vUV);\n\
            gl_FragColor = vec4(color.rgb, 0.5);\n\
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
    // // 启用颜色属性数组。
    // GL.enableVertexAttribArray(_uv);
    // // 启用顶点属性数组。
    // GL.enableVertexAttribArray(_position);
    // // 使用程序。
    // GL.useProgram(SHADER_PROGRAM);
    // // 指定纹理采样器编号，着色器可绑定多个纹理采样器。
    // GL.uniform1i(_sampler, 0);

    /*========================= SHADERS_FOR_WIREFRAME ========================= */
    const shader_vertex_octree_source = "\n\
        attribute vec3 position;\n\
        \n\
        uniform mat4 Pmatrix, Vmatrix, Mmatrix;\n\
        uniform vec3 sizeCell, centerCell;\n\
        void main(void) {\n\
            gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(centerCell+(position*sizeCell), 1.);\n\
        }";

    const shader_fragment_octree_source = "\n\
        precision mediump float;\n\
        uniform vec3 color;\n\
        void main(void) {\n\
            gl_FragColor = vec4(color, 1.);\n\
        }";

    var shader_vertex_octree = get_shader(shader_vertex_octree_source, GL.VERTEX_SHADER, "VERTEX OCTREE");
    var shader_fragment_octree = get_shader(shader_fragment_octree_source, GL.FRAGMENT_SHADER, "FRAGMENT OCTREE");

    // 创建着色器程序，合并顶点和切片着色器。
    const SHADER_PROGRAM_OCTREE = GL.createProgram();
    GL.attachShader(SHADER_PROGRAM_OCTREE, shader_vertex_octree);
    GL.attachShader(SHADER_PROGRAM_OCTREE, shader_fragment_octree);

    // 连接着色器程序到WebGL上下文。
    GL.linkProgram(SHADER_PROGRAM_OCTREE);
    // 获取投影矩阵。
    var _Pmatrix_octree = GL.getUniformLocation(SHADER_PROGRAM_OCTREE, "Pmatrix");
    // 获取视图矩阵。
    var _Vmatrix_octree = GL.getUniformLocation(SHADER_PROGRAM_OCTREE, "Vmatrix");
    // 获取运动矩阵。
    var _Mmatrix_octree = GL.getUniformLocation(SHADER_PROGRAM_OCTREE, "Mmatrix");
    // 获取大小、中心点变量。
    var _sizeCell_octree = GL.getUniformLocation(SHADER_PROGRAM_OCTREE, "sizeCell");
    var _centerCell_octree = GL.getUniformLocation(SHADER_PROGRAM_OCTREE, "centerCell");
    // 获取色彩变量。
    var _color_octree = GL.getUniformLocation(SHADER_PROGRAM_OCTREE, "color");
    // 获取顶点信息。
    var _position_octree = GL.getAttribLocation(SHADER_PROGRAM_OCTREE, "position");
    // 启用顶点属性数组。
    GL.enableVertexAttribArray(_position_octree);
    // 使用程序。
    GL.useProgram(SHADER_PROGRAM_OCTREE);

    /*========================= A WIREFRAME CUBE ========================= */
    // 用于调试。
    var CUBE_WIREFRAME_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_WIREFRAME_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array([
        // 正面的点。
        0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,
        -0.5, -0.5, 0.5,
        -0.5, 0.5, 0.5,
        // 背面的点。
        0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,
        -0.5, -0.5, -0.5,
        -0.5, 0.5, -0.5
    ]), GL.STATIC_DRAW);

    var CUBE_WIREFRAME_LINES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_WIREFRAME_LINES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array([
        // 正面的线。
        0, 1,
        1, 2,
        2, 3,
        3, 0,
        // 背面的线。
        4, 5,
        5, 6,
        6, 7,
        7, 4,
        // 连接前后的线。
        0, 4,
        1, 5,
        2, 6,
        3, 7
    ]), GL.STATIC_DRAW);

    /*========================= DRAGON ========================= */
    var DRAGON_VERTEX = false, DRAGON_FACES = false, DRAGON_NPOINTS = 0;
    var CELLS=[];
    var LEVELMAX = 0;

    // 每个点最大属于面数。
    var MAX_FACES_PER_NODE = 32;

    // 初始化八叉树。
    var OCTREE = {
        plucker: false,
        level: 0,
        show: false,
        blue: false,
        center: [0, 0, 0],
        size: [0, 0, 0],
        faces: [],
        children: [],
        leaf: false
    };

    LIBS.get_json("resources/dragonDecimated.json", function(dragon) {
        // 计算龙的边界框。
        var i, x_min = y_min = z_min = 1e6, x_max = y_max = z_max = -1e6;
        for (i=0; i<dragon.vertices.length; i+=8) {
            x_min = Math.min(x_min, dragon.vertices[i]);
            y_min = Math.min(y_min, dragon.vertices[i+1]);
            z_min = Math.min(z_min, dragon.vertices[i+2]);

            x_max = Math.max(x_max, dragon.vertices[i]);
            y_max = Math.max(y_max, dragon.vertices[i+1]);
            z_max = Math.max(z_max, dragon.vertices[i+2]);
        }

        // 将OCTREE的根设置为边界框。
        OCTREE.center[0] = (x_min + x_max) / 2;
        OCTREE.center[1] = (y_min + y_max) / 2;
        OCTREE.center[2] = (z_min + z_max) / 2;

        OCTREE.size[0] = x_max - x_min;
        OCTREE.size[1] = y_max - y_min;
        OCTREE.size[2] = z_max - z_min;

        // 构建面数组。
        var all_faces = [];
        for(i=0; i < dragon.indices.length; i+=3) {
            var iA = dragon.indices[i],
                iB = dragon.indices[i+1],
                iC = dragon.indices[i+2];

            var points = [
                [dragon.vertices[iA*8], dragon.vertices[iA*8+1], dragon.vertices[iA*8+2]],
                [dragon.vertices[iB*8], dragon.vertices[iB*8+1], dragon.vertices[iB*8+2]],
                [dragon.vertices[iC*8], dragon.vertices[iC*8+1], dragon.vertices[iC*8+2]]
            ];

            all_faces.push({
                indices: [iA, iB, iC],
                plucker: LIB_INTERSECT.plucker_triangle(points[0], points[1], points[2]),
                points: points
            });
        }

        // 递归构建八叉树。
        var build_octree_node = function(node, faces) {
            CELLS.push(node);
            LEVELMAX = Math.max(LEVELMAX, node.level);
            node.plucker=LIB_INTERSECT.plucker_AABB(node.center, node.size);
            faces.forEach(function(face) {
                if (LIB_INTERSECT.test_AABB_triangle(node.center, node.size, face.points)) {
                    node.faces.push(face);
                }
            });

            node.leaf = node.faces.length < MAX_FACES_PER_NODE;

            if (!node.leaf) {
                // 切割节点为8个子节点。
                child_size = [node.size[0] / 2, node.size[1] / 2, node.size[2] / 2];

                var x, y, z;
                for (x=-0.5; x<=0.5; x++) {
                    for (y=-0.5; y<=0.5; y++) {
                        for (z=-0.5; z<=0.5; z++) {
                            node.children.push({
                                center: [
                                    node.center[0] + x*child_size[0],
                                    node.center[1] + y*child_size[1],
                                    node.center[2] + z*child_size[2],
                                ],
                                level: node.level + 1,
                                show: false,
                                blue: false,
                                size: child_size,
                                faces: [],
                                children: [],
                                leaf: false
                            });
                        }
                    }
                }
            }

            // 构建子节点八叉树。
            node.children.forEach(function(child){
                build_octree_node(child, node.faces);
            });
        };

        build_octree_node(OCTREE, all_faces);

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

    // 启用混合功能。
    GL.enable(GL.BLEND);
    GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);

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

        // 渲染龙。
        GL.useProgram(SHADER_PROGRAM);
        GL.enableVertexAttribArray(_uv);
        GL.enableVertexAttribArray(_position);
        GL.depthMask(false);
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

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, DRAGON_FACES);
        GL.drawElements(GL.TRIANGLES, DRAGON_NPOINTS, GL.UNSIGNED_INT, 0);

        GL.disableVertexAttribArray(_uv);
        GL.disableVertexAttribArray(_position);

        // 绘制八叉树边界框。
        GL.useProgram(SHADER_PROGRAM_OCTREE);
        GL.enableVertexAttribArray(_position_octree);
        GL.depthMask(true);
        // 设置投影矩阵。
        GL.uniformMatrix4fv(_Pmatrix_octree, false, PROJMATRIX);
        // 设置视图矩阵。
        GL.uniformMatrix4fv(_Vmatrix_octree, false, VIEWMATRIX);
        // 设置运动矩阵。
        GL.uniformMatrix4fv(_Mmatrix_octree, false, MOVEMATRIX);

        GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_WIREFRAME_VERTEX);
        GL.vertexAttribPointer(_position_octree, 3, GL.FLOAT, false, 4 * 3, 0);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_WIREFRAME_LINES);

        CELLS.forEach(function(cell) {
            if (!cell.show) return;
            if (cell.blue) {
                GL.uniform3f(_color_octree, 0, 0, 1);
            } else {
                GL.uniform3f(_color_octree, 1, cell.level / LEVELMAX, 0);
            }
            
            GL.uniform3fv(_sizeCell_octree, cell.size);
            GL.uniform3fv(_centerCell_octree, cell.center);
            GL.drawElements(GL.LINES, 2 * 12, GL.UNSIGNED_SHORT, 0);
        });

        GL.disableVertexAttribArray(_position_octree);

        // 写入缓冲区数据。
        GL.flush();

        // 请求窗口刷新。
        window.requestAnimationFrame(animate);
    };
}