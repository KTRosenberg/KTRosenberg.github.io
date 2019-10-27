"use strict"

function vec2_normalize(arr, out) {
    out = out || new Float32Array([0.0, 0.0]);
    const x = arr[0];
    const y = arr[1];;

    let len = (x * x) + (y * y);
    if (len > 0) {
        len = 1 / Math.sqrt(len);
    }
    out[0] = x * len;
    out[1] = y * len;

    return out;
}
function vec3_normalize(arr, out) {
    out = out || new Float32Array([0.0, 0.0, 0.0]);
    const x = arr[0];
    const y = arr[1];
    const z = arr[2];

    let len = (x * x) + (y * y) + (z * z);
    if (len > 0) {
        len = 1 / Math.sqrt(len);
    }
    out[0] = x * len;
    out[1] = y * len;
    out[2] = z * len;

    return out;
}

function vec4_normalize(arr, out) {
    out = out || new Float32Array([0.0, 0.0, 0.0, 0.0]);
    const x = arr[0];
    const y = arr[1];
    const z = arr[2];
    const w = arr[3];

    let len = (x * x) + (y * y) + (z * z) + (w * w);
    if (len > 0) {
        len = 1 / Math.sqrt(len);
    }
    out[0] = x * len;
    out[1] = y * len;
    out[2] = z * len;
    out[3] = w * len;

    return out;
}

function vec3_dot(v0, v1) {
    return (v0[0] * v1[0]) +
           (v0[1] * v1[1]) +
           (v0[2] * v1[2]);
}

function vec4_dot(v0, v1) {
    return (v0[0] * v1[0]) +
           (v0[1] * v1[1]) +
           (v0[2] * v1[2]) +
           (v0[3] * v1[3]);
}

function vec3_scale(v, s, out) {
    out = out || new Float32Array([0, 0, 0]);
    out[0] = v[0] * s;
    out[1] = v[1] * s;
    out[2] = v[2] * s;

    return out;
}

function vec4_scale(v, s, out) {
    out = out || new Float32Array([0, 0, 0, 0]);
    out[0] = v[0] * s;
    out[1] = v[1] * s;
    out[2] = v[2] * s;
    out[3] = v[3] * s;

    return out;
}

function vec3_project(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0]);
    return vec3_scale(v1, vec3_dot(v0, v1) / vec3_dot(v0, v0), out);
}

function vec4_project(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0, 0]);
    return vec4_scale(v1, vec3_dot(v0, v1) / vec3_dot(v0, v0), out);
}

function vec3_add(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0]);
    out[0] = v0[0] + v1[0];
    out[1] = v0[1] + v1[1];
    out[2] = v0[2] + v1[2];

    return out;
}

function vec4_add(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0, 0]);
    out[0] = v0[0] + v1[0];
    out[1] = v0[1] + v1[1];
    out[2] = v0[2] + v1[2];
    out[3] = v0[3] + v1[3];

    return out;
}

function vec3_subtract(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0]);
    out[0] = v0[0] - v1[0];
    out[1] = v0[1] - v1[1];
    out[2] = v0[2] - v1[2];

    return out;
}

function vec4_subtract(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0, 0]);
    out[0] = v0[0] - v1[0];
    out[1] = v0[1] - v1[1];
    out[2] = v0[2] - v1[2];
    out[3] = v0[3] - v1[3];

    return out;
}

function vec3_multiply(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0]);
    out[0] = v0[0] * v1[0];
    out[1] = v0[1] * v1[1];
    out[2] = v0[2] * v1[2];

    return out;    
}

function vec4_multiply(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0, 0]);
    out[0] = v0[0] * v1[0];
    out[1] = v0[1] * v1[1];
    out[2] = v0[2] * v1[2];
    out[3] = v0[3] * v1[3];

    return out;    
}

function vec3_divide(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0]);
    out[0] = v0[0] / v1[0];
    out[1] = v0[1] / v1[1];
    out[2] = v0[2] / v1[2];

    return out;    
}

function vec4_divide(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0, 0]);
    out[0] = v0[0] / v1[0];
    out[1] = v0[1] / v1[1];
    out[2] = v0[2] / v1[2];
    out[3] = v0[3] / v1[3];

    return out;    
}
////////////////////////////// USEFUL VECTOR OPERATIONS

let dot = (a, b) => {
   let value = 0;
   for (let i = 0 ; i < a.length ; i++)
      value += a[i] * b[i];
   return value;
}

let subtract = (a,b) => {
   let c = [];
   for (let i = 0 ; i < a.length ; i++)
      c.push(a[i] - b[i]);
   return c;
}

let normalize = a => {
   let s = Math.sqrt(dot(a, a)), b = [];
   for (let i = 0 ; i < a.length ; i++)
      b.push(a[i] / s);
   return b;
}

let cross = (a, b) => [ a[1] * b[2] - a[2] * b[1],
                        a[2] * b[0] - a[0] * b[2],
                        a[0] * b[1] - a[1] * b[0] ];

function vec3_cross(a, b, out) {
    out = out || new Float32Array(3);

    out[0] = a[1] * b[2] - a[2] * b[1];
    out[1] = a[2] * b[0] - a[0] * b[2];
    out[2] = a[0] * b[1] - a[1] * b[0];

    return out;
} 


function sin01(val) {
    return (1.0 + sin(val)) / 2.0;
}
////////////////////////////// MATRIX OPERATIONS


const cos = Math.cos;
const sin = Math.sin;
let identity = ()       => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
let rotateX = t         => [1,0,0,0, 0,cos(t),sin(t),0, 0,-sin(t),cos(t),0, 0,0,0,1];
let rotateY = t         => [cos(t),0,-sin(t),0, 0,1,0,0, sin(t),0,cos(t),0, 0,0,0,1];
let rotateZ = t         => [cos(t),sin(t),0,0, -sin(t),cos(t),0,0, 0,0,1,0, 0,0,0,1];
let scale = (x,y,z)     => [x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1];
let translate = (x,y,z) => [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1];

let inverse = src => {
  let dst = [], det = 0, cofactor = (c, r) => {
     let s = (i, j) => src[c+i & 3 | (r+j & 3) << 2];
     return (c+r & 1 ? -1 : 1) * ( (s(1,1) * (s(2,2) * s(3,3) - s(3,2) * s(2,3)))
                                 - (s(2,1) * (s(1,2) * s(3,3) - s(3,2) * s(1,3)))
                                 + (s(3,1) * (s(1,2) * s(2,3) - s(2,2) * s(1,3))) );
  }
  for (let n = 0 ; n < 16 ; n++) dst.push(cofactor(n >> 2, n & 3));
  for (let n = 0 ; n <  4 ; n++) det += src[n] * dst[n << 2];
  for (let n = 0 ; n < 16 ; n++) dst[n] /= det;
  return dst;
}

let multiply = (a, b) => {
   let c = [];
   for (let n = 0 ; n < 16 ; n++)
      c.push( a[n&3     ] * b[    n&12] +
              a[n&3 |  4] * b[1 | n&12] +
              a[n&3 |  8] * b[2 | n&12] +
              a[n&3 | 12] * b[3 | n&12] );
   return c;
}

let transpose = m => [ m[0],m[4],m[ 8],m[12],
                       m[1],m[5],m[ 9],m[13],
                       m[2],m[6],m[10],m[14],
                       m[3],m[7],m[11],m[15] ];

let transform = (m, v) => [
   m[0] * v[0] + m[4] * v[1] + m[ 8] * v[2] + m[12] * v[3],
   m[1] * v[0] + m[5] * v[1] + m[ 9] * v[2] + m[13] * v[3],
   m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
   m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3]
];


////////////////////////////// MATRIX CLASS


let Matrix = function() {
   let topIndex = 0,
       stack = [ identity() ],
       getVal = () => stack[topIndex],
       setVal = m => stack[topIndex] = m;

   this.identity  = ()      => setVal(identity());
   this.restore   = ()      => --topIndex;
   this.rotateX   = t       => setVal(multiply(getVal(), rotateX(t)));
   this.rotateY   = t       => setVal(multiply(getVal(), rotateY(t)));
   this.rotateZ   = t       => setVal(multiply(getVal(), rotateZ(t)));
   this.save      = ()      => stack[++topIndex] = stack[topIndex-1].slice();
   this.scale     = (x,y,z) => setVal(multiply(getVal(), scale(x,y,z)));
   this.translate = (x,y,z) => setVal(multiply(getVal(), translate(x,y,z)));
   this.value     = ()      => getVal();
}

let Mat             = null;
let matrixModule    = null;
let M               = null;

async function onReload(state) {
    return MR.dynamicImport(getPath("matrix.js")).then((myModule) => {
        matrixModule = myModule;
        Mat          = matrixModule.Matrix;
    });
}


////////////////////////////// SUPPORT FOR SPLINES


let HermiteBasisMatrix = [
    2,-3, 0, 1,
   -2, 3, 0, 0,
    1,-2, 1, 0,
    1,-1, 0, 0
];

let BezierBasisMatrix = [
   -1,  3, -3,  1,
    3, -6,  3,  0,
   -3,  3,  0,  0,
    1,  0,  0,  0
];

let toCubicCurveCoefficients = (basisMatrix, M) => {
   let C = [];
   for (let i = 0 ; i < M.length ; i++)
      C.push(transform(basisMatrix, M[i]));
   return C;
}

let toCubicPatchCoefficients = (basisMatrix, M) => {
   let C = [];
   for (let i = 0 ; i < M.length ; i++)
      C.push(multiply(basisMatrix, multiply(M[i], transpose(basisMatrix))));
   return C;
}


////////////////////////////// SUPPORT FOR CREATING 3D SHAPES


const VERTEX_SIZE = 8;    // EACH VERTEX IS: [ x,y,z, nx,ny,nz, u,v ]


// FUNCTION createMeshVertices() REPEATEDLY CALLS uvToShape(u, v, args).
// EACH CALL ADDS ANOTHER VERTEX TO THE MESH, IN THE FORM: [x,y,z, nx,ny,nz, u,v]

function createMeshVertices(rows, cols, fnEvaluate, opts) {
    if (!fnEvaluate) {
        return null;
    }

    const info = {  
        vertexOffset : 0,
        vertexCount  : 0,
        indexCount   : 0,
        primitive    : gl.TRIANGLE_STRIP
    };

    const idxOffset = 0;

    const triCount = 2 * (rows) * (cols);
    const vtxCount = rows * cols;

    // part 1:
    // sample all of the necessary vertices in the grid
    // part 2:
    // create an index buffer for all sampled vertices
    const indices = []//new Uint16Array((triCount * 3) + ((rows - 2) * 3));
    function push(arr, el) {
        arr.push(el);
    }

    {
        let inc = 8;
        let vertices = new Float32Array(inc * (rows + 1) * (cols + 1));
        let off = 0;
        
        for (let u = 0; u < rows + 1; u += 1) {
            for (let v = 0; v < cols + 1; v += 1) {
                fnEvaluate(vertices, off, u / rows, v / cols, opts);
                off += inc;
            }
        }

        {
            let i = idxOffset;
            for (let r = 0; r < rows; r += 2) {
                // left to right
                for (let c = 0; c < cols; c += 1) {
                    // add a column, except for the last
                    push(indices, i);
                    push(indices, i + cols + 1);
                    i += 1;
                }
                // add only one vertex in the last column,
                // will be added in right to left phase
                push(indices, i);
                i += cols + 1;

                if (r + 1 >= rows) {
                    continue;
                }

                // right to left
                for (let c = cols - 1; c >= 0; c -= 1) {
                    push(indices, i);
                    push(indices, i + cols + 1);
                    i -= 1;
                }
                push(indices, i);
                i += cols + 1;
            }
            // need to add extraneous vertex
            push(indices, i);

        }


        info.vertices = vertices;
        info.indices  = new Uint16Array(indices);
        info.vertexCount = vertices.length / inc;
        info.indexCount = indices.length;
        return info;
    }

    // IMPLEMENTATION NOTES:

    // THIS IS ESSENTIALLY WHAT YOU HAVE ALREADY IMPLEMENTED.
    // THE ONLY SIGNIFICANT DIFFERENCE IS THAT YOU NEED TO PASS IN
    // arg AS A THIRD ARGUMENT WHEN YOU CALL uvToShape().

    //return [ 0,0,0, 0,0,0, 0,0 ]; // THIS LINE IS JUST A DUMMY PLACEHOLDER.
}

// FOR uvCubicCurvesRibbon(), arg IS IN THE BELOW FORM:
//
// {
//    width: width,
//    data: [
//       [ [a0x,b0x,c0x,d0x], [a0y,b0y,c0y,d0y] [a0z,b0z,c0z,d0z] ], // CURVE 0
//       [ [a1x,b1x,c1x,d1x], [a1y,b1y,c1y,d1y] [a1z,b1z,c1z,d1z] ], // CURVE 1
//       ...                                                         // ...
//    ]
// }

function evalSpline(t, coeff) {
    const a = coeff[0];
    const b = coeff[1];
    const c = coeff[2];
    const d = coeff[3];

    const t2 = t*t;
    const t3 = t2*t;

    return (a*t3) + (b*t2) + (c*t) + d;
}

let uvToCubicCurvesRibbon = (vertices, offset, u, v, arg) => {

    // IMPLEMENTATION NOTES:

    // THE MULTIPLE CURVES TOGETHER SPAN THE LENGTH OF THE RIBBON,
    // FROM u == 0.0 TO u == 1.0 FROM ONE END OF THE RIBBON TO THE OTHER.

    // arg.width SPECIFIES THE WIDTH OF THE RIBBON. THIS IS THE DIRECTION
    // THAT SPANS FROM v == 0.0 TO v == 1.0.

    // EACH ELEMENT OF arg.data PROVIDES CUBIC COEFFICIENTS FOR THE X,Y AND Z
    // COORDINATES, RESPECTIVELY, OF ONE CUBIC SEGMENT ALONG THE CURVE.

    // THE KEY TO IMPLEMENTATION IS TO EVAL THE CUBIC AT TWO SLIGHTLY
    // DIFFERENT VALUES OF u, SUCH AS u AND u+0.001.
    // THE DIFFERENCE VECTOR [dx,dy] IN X,Y CAN THEN BE USED TO
    // CREATE THE VECTOR THAT VARIES ALONG THE WIDTH OF THE RIBBON,
    // FROM p + (dy,-dx) WHEN v == 0.0 TO p + (-dy,dx) WHEN v == 1.0. 

    // VARYING IN Z IS TRICKY, BECAUSE YOU NEED TO FIGURE OUT HOW TO
    // COMPUTE A CORRECT VALUE FOR THE SURFACE NORMAL AT EACH VERTEX.
    // IF YOU CAN'T FIGURE OUT HOW TO PRODUCE A RIBBON THAT VARIES IN Z,
    // IT IS OK TO CREATE A RIBBON WHERE ALL THE Z VALUES ARE THE SAME.

    const w = 20 * arg.width;
    const curve = arg.data;
    const curveCount = curve.length;

    const slen = 1.0 / curveCount;
    const uwhich0 = Math.min(curveCount - 1, Math.floor(u * curveCount));
    const vwhich0 = uwhich0; //Math.min(curveCount - 1, Math.floor(v * curveCount));

    const EPSILON = 0.001;
    const ue = u + EPSILON;
    const ve = v; // + EPSILON;

    const uwhich1 =  Math.min(curveCount - 1, Math.floor(ue * curveCount));
    const vwhich1 =  uwhich1;//Math.min(curveCount - 1, Math.floor(ve * curveCount));

    let x = 0;
    let y = 0;
    let z = 0;
    let nx = 0;
    let ny = 0;
    let nz = 1;

    const seg0u = arg.data[uwhich0];
    const seg1u = arg.data[uwhich1];

    let seg;

    function findSubT(idx_, len_, t_) {
        return (t_ - (idx_ * len_)) / len_;
    }
    // evaluate x
    
        const x0 = evalSpline(findSubT(uwhich0, slen, u ), seg0u[0]);
        const x1 = evalSpline(findSubT(uwhich1, slen, ue), seg0u[0]);

        const dx = x1 - x0;
    
    // evaluate y
        const y0 = evalSpline(findSubT(uwhich0, slen, u ), seg0u[1]);
        const y1 = evalSpline(findSubT(uwhich1, slen, ue), seg1u[1]);

        const dy = y1 - y0;

    // evaluate z
        const z0 = evalSpline(findSubT(uwhich0, slen, u), seg0u[2]);
        const z1 = evalSpline(findSubT(uwhich1, slen, ue), seg0u[2]);

        const dz = z1 - z0;
        x = x0 + (w * (dy - (dy * 2*v)));
        y = y0 + (w * (dx - (dx * 2*(1 - v))));

        // if (v == 0.0) {
        //     x = x0 + (w * dy);
        //     y = y0 - (w * dx);
        // } else if (v == 1.0) {
        //     x = x0 - (w * dy);
        //     y = y0 + (w * dx);
        // }



    z  = z0;

    // const n = [1, -dx/dz];
    // vec2_normalize(n, n);

    // nx = n[0];
    // ny = 0;
    // nz = n[1];

    const n = [-dz, 0, dx];
    vec3_normalize(n, n);
    nx = n[0];
    ny = n[1];
    nz = n[2];

    vertices[offset]     = x;
    vertices[offset + 1] = y;
    vertices[offset + 2] = z;
    vertices[offset + 3] = nx;
    vertices[offset + 4] = ny;
    vertices[offset + 5] = nz;
    vertices[offset + 6] = u;
    vertices[offset + 7] = v;
}


// For uvToCubicPatch, arg consists of bicubic coefficents in the form:
//
// [
//    [x0,x1, ... x15],  // Bicubic coefficients in x
//    [y0,y1, ... y15],  // Bicubic coefficients in y
//    [z0,z1, ... z15]   // Bicubic coefficients in z
// ]

let uvToCubicPatch = (vertices, offset, u, v, arg) => {

    // IMPLEMENTATION NOTES:

    // THE THREE 4x4 MATRICES IN VARIABLE arg ARE VALUES OF Cx, Cy AND Cz.
    // THESE ARE THE BICUBIC COEFFICIENTS FOR X, Y AND Z, RESPECTIVELY.

    // TO EVAL THE X,Y AND Z COORDS AT ANY [u,v] YOU NEED TO MULTIPLY THREE TERMS:

    //   x = U * Cx * transpose( V )
    //   y = U * Cy * transpose( V )
    //   z = U * Cz * transpose( V )

    // WHERE U = [ u*u*u , u*u , u , 1 ] AND V = [ v*v*v , v*v , v , 1 ]

    // NOW YOU HAVE THE SURFACE POINT p = [x,y,z].

    // TO COMPUTE THE SURFACE NORMAL, YOU NEED TO EVALUATE AT SLIGHTLY
    // DIFFERENT PARAMETRIC LOCATIONS pu = [u+.001,v] AND pv = [u,v+.001].

    // THEN YOU CAN TAKE THE DIFFERENCE VECTORS (pu - p) AND (pv - p).

    // THE CROSS PRODUCT OF THOSE TWO VECTORS IS IN A DIRECTION PERPENDICULAR
    // TO THE SURFACE. YOU CAN NORMALIZE THIS VECTOR TO GET THE SURFACE NORMAL.

    // FINALLY, RETURN [ x, y, z,  nx, ny, nz,  u, v ]


    let x  = 0;
    let y  = 0;
    let z  = 0;
    let nx = 0;
    let ny = 0;
    let nz = 0;

    const Cx = arg[0];
    const Cy = arg[1];
    const Cz = arg[2];

    const u1 = u;
    const u2 = u1*u1;
    const u3 = u2*u1;
    const v1 = v;
    const v2 = v1*v1;
    const v3 = v2*v1;

    const U = [ u3 , u2 , u1 , 1 ];
    const V = [ v3 , v2 , v1 , 1 ];

    const buf  = [0, 0, 0, 1];
    const buf2 = [0, 0, 0, 1];
    const buf3 = [0, 0, 0];
    const P = [
        dot(U, Mat.multiplyV(Cx, V, buf)),
        dot(U, Mat.multiplyV(Cy, V, buf)),
        dot(U, Mat.multiplyV(Cz, V, buf)),
        1
    ];

    const EPSILON = 0.001;

    const u1e = u + EPSILON;
    const u2e = u1e * u1e;
    const u3e = u2e * u1e;
    U[0] = u1e;
    U[1] = u2e;
    U[2] = u3e;
    // no need to change v

    const PU = [
        dot(U, Mat.multiplyV(Cx, V, buf)),
        dot(U, Mat.multiplyV(Cy, V, buf)),
        dot(U, Mat.multiplyV(Cz, V, buf)),
        1
    ];

    const v1e = v + EPSILON;
    const v2e = v1e * v1e;
    const v3e = v2e * v1e;
    U[0] = u1;
    U[1] = u2;
    U[2] = u3;
    V[0] = v1e;
    V[1] = v2e;
    V[2] = v3e;

    const PV = [
        dot(U, Mat.multiplyV(Cx, V, buf)),
        dot(U, Mat.multiplyV(Cy, V, buf)),
        dot(U, Mat.multiplyV(Cz, V, buf)),
        1
    ];

    const du = vec4_subtract(PU, P, buf);
    const dv = vec4_subtract(PV, P, buf2)

    const norm = vec3_cross(du, dv, buf3);

    const outn = normalize(norm);

    x = P[0];
    y = P[1];
    z = P[2];
    nx = norm[0];
    ny = norm[1];
    nz = norm[2];

    vertices[offset]     = x;
    vertices[offset + 1] = y;
    vertices[offset + 2] = z;
    vertices[offset + 3] = nx;
    vertices[offset + 4] = ny;
    vertices[offset + 5] = nz;
    vertices[offset + 6] = u;
    vertices[offset + 7] = v;
}


////////////////////////////// SCENE SPECIFIC CODE


async function setup(state) {
    hotReloadFile(getPath('week7.js'));

    matrixModule = await import(getPath("matrix.js"));
    Mat          = matrixModule.Matrix;

    const images = await imgutil.loadImagesPromise([
        getPath("textures/grass_diff.png"),
       getPath("textures/polkadots.png"),
       getPath("textures/night_sky.jpg"),
       getPath("textures/grass_norm.png"),
    ]);


    let libSources = await MREditor.loadAndRegisterShaderLibrariesForLiveEditing(gl, "libs", [
        { 
            key : "pnoise", path : "shaders/noise.glsl", foldDefault : true
        },
        {
            key : "sharedlib1", path : "shaders/sharedlib1.glsl", foldDefault : true
        },      
    ]);

    if (!libSources) {
        throw new Error("Could not load shader library");
    }

    // load vertex and fragment shaders from the server, register with the editor
    let shaderSource = await MREditor.loadAndRegisterShaderForLiveEditing(
        gl,
        "mainShader",
        { 
            onNeedsCompilation : (args, libMap, userData) => {
                const stages = [args.vertex, args.fragment];
                const output = [args.vertex, args.fragment];

                const implicitNoiseInclude = true;
                if (implicitNoiseInclude) {
                    let libCode = MREditor.libMap.get("pnoise");

                    for (let i = 0; i < 2; i += 1) {
                        const stageCode = stages[i];
                        const hdrEndIdx = stageCode.indexOf(';');
                        
                        /*
                        const hdr = stageCode.substring(0, hdrEndIdx + 1);
                        output[i] = hdr + "\n#line 1 1\n" + 
                                    libCode + "\n#line " + (hdr.split('\n').length) + " 0\n" + 
                                    stageCode.substring(hdrEndIdx + 1);
                        console.log(output[i]);
                        */
                        const hdr = stageCode.substring(0, hdrEndIdx + 1);
                        
                        output[i] = hdr + "\n#line 2 1\n" + 
                                    "#include<pnoise>\n#line " + (hdr.split('\n').length + 1) + " 0" + 
                            stageCode.substring(hdrEndIdx + 1);

                        //console.log(output[i]);
                    }
                }

                MREditor.preprocessAndCreateShaderProgramFromStringsAndHandleErrors(
                    output[0],
                    output[1],
                    libMap
                );
            },
            onAfterCompilation : (program) => {
                state.program = program;

                gl.useProgram(program);

                state.uColorLoc        = gl.getUniformLocation(program, 'uColor');
                state.uCursorLoc       = gl.getUniformLocation(program, 'uCursor');
                state.uModelLoc        = gl.getUniformLocation(program, 'uModel');
                state.uProjLoc         = gl.getUniformLocation(program, 'uProj');
                state.uTex0Loc         = gl.getUniformLocation(program, 'uTex0');
                state.uTex1Loc         = gl.getUniformLocation(program, 'uTex1');
                state.uTex2Loc         = gl.getUniformLocation(program, 'uTex2');
                state.uTexIndexLoc     = gl.getUniformLocation(program, 'uTexIndex');
                state.uTimeLoc         = gl.getUniformLocation(program, 'uTime');
                state.uViewLoc         = gl.getUniformLocation(program, 'uView');

                gl.uniform1i(state.uTex0Loc, 0);
                gl.uniform1i(state.uTex1Loc, 1);
                gl.uniform1i(state.uTex2Loc, 2);
            } 
        },
        {
            paths : {
                vertex   : "shaders/vertex.vert.glsl",
                fragment : "shaders/fragment.frag.glsl"
            },
            foldDefault : {
                vertex   : true,
                fragment : false
            }
        }
    );

    // let shaderSource2 = await MREditor.loadAndRegisterShaderForLiveEditing(
    //     gl,
    //     "splineShader",
    //     { 
    //         onNeedsCompilation : (args, libMap, userData) => {
    //             const stages = [args.vertex, args.fragment];
    //             const output = [args.vertex, args.fragment];

    //             const implicitNoiseInclude = true;
    //             if (implicitNoiseInclude) {
    //                 let libCode = MREditor.libMap.get("pnoise");

    //                 for (let i = 0; i < 2; i += 1) {
    //                     const stageCode = stages[i];
    //                     const hdrEndIdx = stageCode.indexOf(';');
                        
    //                     /*
    //                     const hdr = stageCode.substring(0, hdrEndIdx + 1);
    //                     output[i] = hdr + "\n#line 1 1\n" + 
    //                                 libCode + "\n#line " + (hdr.split('\n').length) + " 0\n" + 
    //                                 stageCode.substring(hdrEndIdx + 1);
    //                     console.log(output[i]);
    //                     */
    //                     const hdr = stageCode.substring(0, hdrEndIdx + 1);
                        
    //                     output[i] = hdr + "\n#line 2 1\n" + 
    //                                 "#include<pnoise>\n#line " + (hdr.split('\n').length + 1) + " 0" + 
    //                         stageCode.substring(hdrEndIdx + 1);

    //                     //console.log(output[i]);
    //                 }
    //             }

    //             MREditor.preprocessAndCreateShaderProgramFromStringsAndHandleErrors(
    //                 output[0],
    //                 output[1],
    //                 libMap
    //             );
    //         },
    //         onAfterCompilation : (program) => {
    //             state.program = program;

    //             gl.useProgram(program);

    //             state.uColorLoc        = gl.getUniformLocation(program, 'uColor');
    //             state.uCursorLoc       = gl.getUniformLocation(program, 'uCursor');
    //             state.uModelLoc        = gl.getUniformLocation(program, 'uModel');
    //             state.uProjLoc         = gl.getUniformLocation(program, 'uProj');
    //             state.uTex0Loc         = gl.getUniformLocation(program, 'uTex0');
    //             state.uTex1Loc         = gl.getUniformLocation(program, 'uTex1');
    //             state.uTex2Loc         = gl.getUniformLocation(program, 'uTex2');
    //             state.uTexIndexLoc     = gl.getUniformLocation(program, 'uTexIndex');
    //             state.uTimeLoc         = gl.getUniformLocation(program, 'uTime');
    //             state.uViewLoc         = gl.getUniformLocation(program, 'uView');

    //             gl.uniform1i(state.uTex0Loc, 0);
    //             gl.uniform1i(state.uTex1Loc, 1);
    //             gl.uniform1i(state.uTex2Loc, 2);
    //         } 
    //     },
    //     {
    //         paths : {
    //             vertex   : "shaders/vertex.vert.glsl",
    //             fragment : "shaders/fragment.frag.glsl"
    //         },
    //         foldDefault : {
    //             vertex   : true,
    //             fragment : false
    //         }
    //     }
    // );

    state.turnAngle = -.4;
    state.cursor = ScreenCursor.trackCursor(MR.getCanvas());

    if (!shaderSource) {
        throw new Error("Could not load shader");
    }

    state.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, state.buffer);

    state.bufferIndices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, state.bufferIndices);

    let bpe = Float32Array.BYTES_PER_ELEMENT;

    let aPos = gl.getAttribLocation(state.program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, bpe * VERTEX_SIZE, bpe * 0);

    let aNor = gl.getAttribLocation(state.program, 'aNor');
    gl.enableVertexAttribArray(aNor);
    gl.vertexAttribPointer(aNor, 3, gl.FLOAT, false, bpe * VERTEX_SIZE, bpe * 3);

    let aUV  = gl.getAttribLocation(state.program, 'aUV');
    gl.enableVertexAttribArray(aUV);
    gl.vertexAttribPointer(aUV , 2, gl.FLOAT, false, bpe * VERTEX_SIZE, bpe * 6);

    for (let i = 0 ; i < images.length ; i++) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());

        gl.texParameteri(gl.TEXTURE_2D, gl.CLAMP_TO_EDGE, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.CLAMP_TO_EDGE, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
        gl.generateMipmap(gl.TEXTURE_2D);
    }
}

let m = new Matrix();
let cursorPrevX, cursorPrevZ;

// NOTE: t is the elapsed time since system start in ms, but
// each world could have different rules about time elapsed and whether the time
// is reset after returning to the world
function onStartFrame(t, state) {

    let tStart = t;
    if (!state.tStart) {
        state.tStart = t;
        state.time = t;
    }

    let cursor = state.cursor;

    let cursorValue = () => {
       let p = cursor.position(), canvas = MR.getCanvas();
       return [ p[0] / canvas.clientWidth * 2 - 1, 1 - p[1] / canvas.clientHeight * 2, p[2] ];
    }

    tStart = state.tStart;

    state.time = (t - tStart) / 1000;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0.0, 0.4, 0.76, 1.0);

    // VARY TURN ANGLE AS USER DRAGS CURSOR LEFT OR RIGHT.

    let cursorXYZ = cursorValue();
    if (cursorXYZ[2] && cursorPrevZ)
        state.turnAngle += 2 * (cursorXYZ[0] - cursorPrevX);
    cursorPrevX = cursorXYZ[0];
    cursorPrevZ = cursorXYZ[2];

    gl.uniform3fv(state.uCursorLoc     , cursorXYZ);
    gl.uniform1f (state.uTimeLoc       , state.time);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);  // CULL FACES THAT ARE VISIBLY CLOCKWISE.
}

function onDraw(t, projMat, viewMat, state, eyeIdx) {

    gl.uniformMatrix4fv(state.uViewLoc, false, new Float32Array(viewMat));
    gl.uniformMatrix4fv(state.uProjLoc, false, new Float32Array(projMat));

    let drawShape = (type, color, texture, vertices, indices) => {
       gl.uniform3fv(state.uColorLoc, color );
       gl.uniformMatrix4fv(state.uModelLoc, false, m.value() );
       gl.uniform1i(state.uTexIndexLoc, (texture == null || texture === undefined) ? -1 : texture);
       gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW);

        if (!indices) {
            gl.drawArrays(type, 0, vertices.length / VERTEX_SIZE);
            return;
        }

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STREAM_DRAW);
        gl.drawElements(
            type,
            indices.length,
            gl.UNSIGNED_SHORT,
            0
        )
    }

    gl.useProgram(state.program);

    gl.disable(gl.CULL_FACE);

    m.identity();

    m.translate(0,0,-4);
    m.rotateY(state.turnAngle);
    m.translate(0,0,4);

    let by = 1;

    let S = .3 * Math.sin(state.time);
    by *= S;

    let hermiteCurveInfo = createMeshVertices(48, 1, uvToCubicCurvesRibbon,
       {
          width: .05,
	  data: [
	     toCubicCurveCoefficients(HermiteBasisMatrix, [
                [ 0, 0,-3, 3], // P0.x P1.x R0.x R1.x
                [-1, 0, 0, 0], // P0.y P1.y R0.y R1.y
                [ 0,.4, 0, 0]  // P0.z P1.z R0.z R1.z
             ]),
	     toCubicCurveCoefficients(HermiteBasisMatrix, [
                [ 0, .5,  3,  3], // P0.x P1.x R0.x R1.x
                [ 0,  1,  0,  0], // P0.y P1.y R0.y R1.y
                [.5,  0,  0,  0]  // P0.z P1.z R0.z R1.z
             ]),
	     toCubicCurveCoefficients(HermiteBasisMatrix, [
                [.5, .5,  2, -2], // P0.x P1.x R0.x R1.x
                [ 1, .2,  0,  0], // P0.y P1.y R0.y R1.y
                [ 0,  0,  0,-.5]  // P0.z P1.z R0.z R1.z
             ])
          ]
       }
    );

    let bezierCurveInfo = createMeshVertices(32, 1, uvToCubicCurvesRibbon,
       {
          width: 0.6,
	  data: [
             toCubicCurveCoefficients(BezierBasisMatrix, [
                [ -1, -.6, -.3,  0], // A.x B.x C.x D.x
                [  0,  by, -by,  0], // A.y B.y C.y D.y
                [-by,  .3,   0,-.1]  // A.z B.z C.z D.z
             ]),
             toCubicCurveCoefficients(BezierBasisMatrix, [
                [  0, .3, -.6,  -1],    // A.x B.x C.x D.x
                [  0, by,  -by,  0],    // A.y B.y C.y D.y
                [-.1,0,.3,-by]     // A.z B.z C.z D.z
             ])
          ]
       }
    );






    m.save();
    m.translate(0,0,-3.5);
    drawShape(gl.TRIANGLE_STRIP, [0,0,1], null, hermiteCurveInfo.vertices, hermiteCurveInfo.indices);
    m.restore();

    m.save();
    m.translate(0,1,-3);
    m.rotateZ(state.time);

    m.scale(2, 2, 1);
    drawShape(gl.TRIANGLE_STRIP, [1,0,1], null, bezierCurveInfo.vertices, bezierCurveInfo.indices);
    m.restore();

    const theta = Math.PI/2;
    const sc = 0.5;

                let st = 3 * state.time;
    let s0 = .7 * (-sin01(st + 1));
    let s1 = .7 * (-sin01(st + 1));
    let s2 = .7 * (-sin01(st + 1));
    let s3 = .7 * (-sin01(st + 1));

            let bezierPatchInfo = createMeshVertices(32, 32, uvToCubicPatch,
               toCubicPatchCoefficients(BezierBasisMatrix, [
                  [
                -1,-1/3, 1/3, 1,
                    -1,-1/3, 1/3, 1,
                    -1,-1/3, 1/3, 1,
                    -1,-1/3, 1/3, 1
              ],
                  [
                -1  ,-1  ,-1  ,-1,
                    -1/3,-1/3,-1/3,-1/3,
                     1/3, 1/3, 1/3, 1/3,
                     1  , 1  , 1  , 1
              ],
                  [
                 0,   s3,   s0,  0,
                    s0,   s1,   s2, s3,
                    s0,   s1,   s2, s3,
                     0,   s0,   s3,  0
              ]
               ])
            );

    m.save();
    for (let z = 0; z < 10; z += 1) {
        for (let x = 0; x < 10; x += 1) {
            m.save();
            
            m.translate(2* x - 10, -1, 2 * z - 10);

            let sx = 1;
            let sy = 1;
            let sz = 1;

                
                if (z & 1) {
                    sz = -1;
                } else {
                    sz = 1;
                }   

                if (x & 1) {
                    sx = 1;
                } else {
                    sx = -1;
                }       

            m.scale(sx, 1, sz);
            m.rotateX(theta);


            drawShape(gl.TRIANGLE_STRIP, [1,1,1], 1, bezierPatchInfo.vertices, bezierPatchInfo.indices);
            
            m.restore();
        }
    }

    // m.scale(sc * 1, sc * 1, 1);
    // m.translate(2,0,-4);
    // m.scale(-1, -1, 1);
    // m.rotateX(theta);
    // //m.rotateY(state.time);
    // drawShape(gl.TRIANGLE_STRIP, [1,1,1], 1, bezierPatchInfo.vertices, bezierPatchInfo.indices);
    // m.restore();
    // m.save();
    // m.scale(sc * 1, sc * 1, 1);
    // m.translate(-2,0,-4);
    // m.scale(-1, -1, 1);
    // m.rotateX(theta);
    // drawShape(gl.TRIANGLE_STRIP, [1,1,1], 1, bezierPatchInfo.vertices, bezierPatchInfo.indices);
    // m.restore();
    m.restore();

}

function onEndFrame(t, state) {
}

export default function main() {
    const def = {
        name         : 'week7',
        setup        : setup,
        onStartFrame : onStartFrame,
        onEndFrame   : onEndFrame,
        onDraw       : onDraw,
        onReload     : onReload
    };

    return def;
}
