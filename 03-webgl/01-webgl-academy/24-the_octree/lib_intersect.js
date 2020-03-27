var LIB_INTERSECT = {
  // ========================= 普吕克函数 ================================
  // 计算AB向量的普吕克坐标。
  plucker_vector: function(A, B) {
    return [
      A[0]*B[1] - A[1]*B[0],
      A[0]*B[2] - A[2]*B[0],
      A[0] - B[0],
      A[1]*B[2] - A[2]*B[1],
      A[2] - B[2],
      B[1] - A[1],
    ];
  },

  // 计算轴(P, u)的普吕克坐标。
  plucker_axis: function(P, u) {
    return [
      P[0]*u[1] - P[1]*u[0],
      P[0]*u[2] - P[2]*u[0],
      -u[0],
      P[1]*u[2] - P[2]*u[1],
      -u[2],
      u[1],
    ];
  },

  /*
   * 普吕克边函数。
   * L：向量的普吕克坐标。
   * R: 轴的普吕克坐标。
   */
  side: function(L, R) {
    return R[5]*L[1] + R[4]*L[0] + R[3]*L[2] + R[2]*L[3] + R[1]*L[5] + R[0]*L[4];
  },

  // 计算三角形每条边的普吕克坐标。
  plucker_triangle: function(A, B, C) {
    return [
      this.plucker_vector(A, B),
      this.plucker_vector(B, C),
      this.plucker_vector(C, A)
    ];
  },

  // 计算四边形每条边的普吕克坐标。
  plucker_quad: function(A, B, C, D) {
    return [
      this.plucker_vector(A, B),
      this.plucker_vector(B, C),
      this.plucker_vector(C, D),
      this.plucker_vector(D, A)
    ];
  },

  /*
   * 判断光线与三角形的交集是否相交。
   * pluck_R: 代表光线的普吕克坐标。
   * pluck_triangle: 代表三角形的普吕克坐标。
   */
  intersect_ray_triangle: function(pluck_R, pluck_triangle) {
    var side0 = this.side(pluck_triangle[0], pluck_R);
    if (side0*this.side(pluck_triangle[1], pluck_R) < 0) return false;
    if (side0*this.side(pluck_triangle[2], pluck_R) < 0) return false;
    return true;
  },

  /*
   * 返回测试四边形与AABB交集的普吕克坐标。 
   * c = [Cx, Cy, Cz]AABB的中心点。
   * d = [Dx, Dy, Dz]AABB的尺寸。
   */
  plucker_AABB: function(c, d) {
    // AABB的八个点。
    var A = [c[0]+0.5*d[0], c[1]-0.5*d[1], c[2]-0.5*d[2]],
        B = [c[0]+0.5*d[0], c[1]+0.5*d[1], c[2]-0.5*d[2]],
        C = [c[0]+0.5*d[0], c[1]+0.5*d[1], c[2]+0.5*d[2]],
        D = [c[0]+0.5*d[0], c[1]-0.5*d[1], c[2]+0.5*d[2]],
        E = [c[0]-0.5*d[0], c[1]-0.5*d[1], c[2]-0.5*d[2]],
        F = [c[0]-0.5*d[0], c[1]+0.5*d[1], c[2]-0.5*d[2]],
        G = [c[0]-0.5*d[0], c[1]+0.5*d[1], c[2]+0.5*d[2]],
        H = [c[0]-0.5*d[0], c[1]-0.5*d[1], c[2]+0.5*d[2]];
    return [
      this.plucker_quad(B, C, H, E),
      this.plucker_quad(A, D, G, F),
      this.plucker_quad(A, B, F, E),
      this.plucker_quad(D, C, G, H)
    ];
  },

  /*
   * 测试光线与四边形的是否存在交集。
   */
  intersect_ray_quad: function(pluck_R, plucker_quad) {
    var side0 = this.side(plucker_quad[0], pluck_R);
    if (side0*this.side(plucker_quad[1], pluck_R) < 0) return false;
    if (side0*this.side(plucker_quad[2], pluck_R) < 0) return false;
    if (side0*this.side(plucker_quad[3], pluck_R) < 0) return false;
    return true;
  },

  /*
   * 测试光线与AABB的是否存在交集。
   */
  intersect_ray_AABB: function(pluck_R, quads) {
    if (this.intersect_ray_quad(pluck_R, quads[0]) < 0) return false;
    if (this.intersect_ray_quad(pluck_R, quads[1]) < 0) return false;
    if (this.intersect_ray_quad(pluck_R, quads[2]) < 0) return false;
    if (this.intersect_ray_quad(pluck_R, quads[3]) < 0) return false;
    return true;
  },

  // ========================= SAT FUNCTIONS ============================
  // 返回轴上A点横坐标。
  abscissa_on_axis: function(u, A) {
    return LIBS.dot(A, u);
  },

  // 判断是否存在分离轴。
  is_separating_axis: function(A, B, Ru) {
    var i, x, xAmin = Infinity, xAmax = -Infinity;
    for (i = 0; i < A.length; i++) {
        x = this.abscissa_on_axis(Ru, A[i]);
        xAmin = Math.min(x, xAmin);
        xAmax = Math.max(x, xAmax);
    }

    for (i = 0; i < B.length; i++) {
        x = this.abscissa_on_axis(Ru, B[i]);
        // B点与A点投影重合。
        if (x >= xAmin && x <= xAmax) {
            return false;
        }
    }
    return true;
  },

  // 获取三角形的边。
  get_tri_edge: function(T) {
    return [
        LIBS.subtract(T[1], T[0]),
        LIBS.subtract(T[2], T[1]),
        LIBS.subtract(T[0], T[2])
    ];
  },

  // 获取三角形的法向量。
  get_tri_normal: function(T) {
    var AB = LIBS.subtract(T[1], T[0]);
    var AC = LIBS.subtract(T[2], T[0]);
    var N = LIBS.cross(AB, AC);
    LIBS.normalize(N);
    return N;
  },

  // 判断是否存在AABB与三角形的交叉点T = [A, B, C]。
  // AABB的维度Cd = [Cx, Cy, Cz]。
  // AABB的中心CO。
  test_AABB_triangle: function(CO, Cd, T) {
    // 判断T点是不是AABB中。
    if ((T[0][0] > CO[0] - Cd[0] / 2 && T[0][0] < CO[0] + Cd[0] / 2) &&
        (T[0][1] > CO[1] - Cd[1] / 2 && T[0][1] < CO[1] + Cd[1] / 2) &&
        (T[0][2] > CO[2] - Cd[2] / 2 && T[0][2] < CO[2] + Cd[2] / 2)) {
        return true;
    }

    // 构建AABB的点列表C。
    var C=[], x, y, z, O = [0, 0, 0], i, j, W;
    for (x = -0.5; x <= 0.5; x++) {
        for (y = -0.5; y <= 0.5; y++) {
            for (z = -0.5; z <= 0.5; z++) {
              C.push([CO[0]+x*Cd[0], CO[1]+y*Cd[1], CO[2]+z*Cd[2]]);
            }
        }
    }

    // 轴垂直于AABB面的方向。
    var Caxes = [[1,0,0], [0,1,0], [0,0,1]];

    // 获取三角形的边。
    var Tedges = this.get_tri_edge(T);

    // 获取三角形的法向量。
    var N = this.get_tri_normal(T);

    // 判断是否存在垂直于三角形的分离轴。
    if (this.is_separating_axis(C, T, N)) return false;

    // 判断是否存在垂直于AABB面的分离轴。
    for (i=0; i<3; i++) {
        if (this.is_separating_axis(C, T, Caxes[i])) return false;
    }

    // 判断分离轴perp。
    // 到三角形的边，到AABB的面。
    for (i=0; i<3; i++) {
        for (j=0; j<3; j++) {
            W = LIBS.cross(Caxes[i], Tedges[j]);
            LIBS.normalize(W);
            if (this.is_separating_axis(C, T, W)) return false;
        }
    }
    return true;
  },
};