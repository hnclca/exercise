var LIBS = {
    // 角度转弧度。
    degToRad: function(angle) {
        return angle * Math.PI / 180;
    },

    // 平方向量。
    squareVec3: function(v) {
        return v[0]*v[0] + v[1]*v[1] + v[2]*v[2];
    },

    // 获取单位向量。
    get_unitVector: function(v) {
        var size = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
        return (size===0) ? [0, 0, 0] : [v[0]/size, v[1]/size, v[2]/size]
    },

    // 获取投影。
    // angle相机角度，a宽高比。
    get_projection: function(angle, a, zMin, zMax) {
        var tan = Math.tan(LIBS.degToRad(0.5 * angle));
        var A = - (zMin + zMax) / (zMax - zMin);
        var B = - (2 * zMin * zMax) / (zMax - zMin);
        return [
            0.5 / tan, 0, 0, 0,
            0, 0.5 * a / tan, 0, 0,
            0, 0, A, -1,
            0, 0, B, 0
        ];
    },

    // 获取单位矩阵。
    get_I3: function() {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    },

    // 获取单位矩阵。
    get_I4: function() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    },

    // 重置单位矩阵。
    set_I4: function(m) {
        m[0] = 1, m[1] = 0, m[2] = 0, m[3] = 0;
        m[4] = 0, m[5] = 1, m[6] = 0, m[7] = 0;
        m[8] = 0, m[9] = 0, m[10] = 1, m[11] = 0;
        m[12] = 0, m[13] = 0, m[14] = 0, m[15] = 1;
    },

    rotateX: function(m, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var mv1 = m[1], mv5 = m[5], mv9 = m[9];
        // 更新YZ运动坐标。
        m[1] = c * m[1] - s * m[2];
        m[5] = c * m[5] - s * m[6]; 
        m[9] = c * m[9] - s * m[10]; 

        m[2] = c * m[2] + s * mv1; 
        m[6] = c * m[6] + s * mv5; 
        m[10] = c * m[10] + s * mv9; 
    },

    rotateY: function(m, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var mv0 = m[0], mv4 = m[4], mv8 = m[8];

        m[0] = c * m[0] + s * m[2];
        m[4] = c * m[4] + s * m[6]; 
        m[8] = c * m[8] + s * m[10]; 

        m[2] = c * m[2] - s * mv0; 
        m[6] = c * m[6] - s * mv4; 
        m[10] = c * m[10] - s * mv8; 
    },
    
    rotateZ: function(m, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var mv0 = m[0], mv4 = m[4], mv8 = m[8];

        m[0] = c * m[0] - s * m[1];
        m[4] = c * m[4] - s * m[5]; 
        m[8] = c * m[8] - s * m[9]; 

        m[1] = c * m[1] + s * mv0;
        m[5] = c * m[5] + s * mv4; 
        m[9] = c * m[9] + s * mv8; 
    }, 

    translateZ: function(m, t) {
        m[14] += t;
    },

    transpose43: function(src, dst) {
        dst[0] = src[0], dst[1] = src[4], dst[2] = src[8],
        dst[3] = src[1], dst[4] = src[5], dst[5] = src[9],
        dst[6] = src[2], dst[7] = src[6], dst[8] = src[10]
    }
};