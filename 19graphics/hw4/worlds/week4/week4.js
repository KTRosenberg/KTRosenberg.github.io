"use strict"

"use strict"

const vec40   = new Float32Array([0.0, 0.0, 0.0, 0.0]);
const vec40W1 = new Float32Array([0.0, 0.0, 0.0, 1.0]);
const vec41   = new Float32Array([1.0, 1.0, 1.0, 1.0]);

const NO_REFLECT  = vec40;
const NO_REFRACT  = vec41;
const OPAQUE      = vec41;
const TRANSPARENT = vec40W1;

const IDX_REFRACT_WATER        = 1.33;
const IDX_REFRACT_ICE          = 1.31;
const IDX_REFRACT_DIAMOND      = 2.417;
const IDX_REFRACT_SAPPHIRE     = 1.77;
const IDX_REFRACT_FUSED_QUARTZ = 1.46;

const GLSL_TYPE_INT   = 0;
const GLSL_TYPE_FLOAT = 1;
const GLSL_TYPE_VEC2  = 2;
const GLSL_TYPE_VEC3  = 3;
const GLSL_TYPE_VEC4  = 4;
const GLSL_TYPE_IVEC2 = 5;
const GLSL_TYPE_IVEC3 = 6;
const GLSL_TYPE_IVEC4 = 7;
const GLSL_TYPE_MAT3  = 8;
const GLSL_TYPE_MAT4  = 9;
const GLSL_TYPE_BOOL  = 10;

const cos = Math.cos;
const sin = Math.sin;

function vec3_normalize(arr) {
    const x = arr[0];
    const y = arr[1];
    const z = arr[2];

    let len = (x * x) + (y * y) + (z * z);
    if (len > 0) {
        len = 1 / Math.sqrt(len);
    }
    arr[0] = arr[0] * len;
    arr[1] = arr[1] * len;
    arr[2] = arr[2] * len;

    return arr;
}

function sin01(val) {
    return (1.0 + sin(val)) / 2.0;
}

class Polyhedron {
    constructor(center, r, plane_count, mat, planes) {
        this.center      = center;
        this.r           = r;
        this.plane_count = plane_count;
        this.mat         = mat;
        this.planes      = planes;
        this.planesArray = [];
        for (let i = 0; i < plane_count; i += 1) {
            this.planesArray.push(this.planes.subarray((i * 4), ((i + 1) * 4)));
        }
    }

    setUniforms(prefix, program) {
        this.locations = {};
        this.locations.center      = gl.getUniformLocation(program, prefix + ".center");
        this.locations.r           = gl.getUniformLocation(program, prefix + ".r");
        this.locations.plane_count = gl.getUniformLocation(program, prefix + ".plane_count"); 
        this.locations.planes = []; 
        for (let i = 0; i < this.plane_count; i += 1) {
            this.locations.planes[i] = gl.getUniformLocation(program, prefix + ".planes[" + i + "]");
        }

        this.upload = {};
        this.upload.center = () => { 
            gl.uniform3fv(this.locations.center, this.center); 
        };
        this.upload.r = () => {
            gl.uniform1f(this.locations.r, this.r);
        };
        this.upload.planes = () => {
            gl.uniform4fv(this.locations.planes[0], this.planes);
        };
        this.upload.planeAt = (idx) => {
            gl.uniform4fv(this.locations.planes[idx], this.planesArray[idx]);
        }
        this.upload.plane_count = () => {
            gl.uniform1i(this.locations.plane_count, this.plane_count);
        }
        this.upload.all = () => {
            this.upload.center();
            this.upload.r();
            this.upload.plane_count();
            this.upload.planes();
        };
        this.mat.setUniforms(prefix + ".mat", program);
    }
}

class Sphere {
    constructor(center, r, mat) {
        this.center = center;
        this.r      = r;
        this.mat    = mat;
    }

    setUniforms(prefix, program) {
        this.locations = {};
        this.locations.center = gl.getUniformLocation(program, prefix + ".center");
        this.locations.r = gl.getUniformLocation(program, prefix + ".r");

        this.upload = {};
        this.upload.center = () => { 
            gl.uniform3fv(this.locations.center, this.center); 
        };
        this.upload.r = () => {
            gl.uniform1f(this.locations.r, this.r);
        };
        this.upload.all = () => {
            this.upload.center();
            this.upload.r();
        };
        this.mat.setUniforms(prefix + ".mat", program);
    }
}
class Material {
    constructor(ambient, diffuse, specular, spec_pow, reflection, refraction) {
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.spec_pow = spec_pow;
        this.reflection = reflection;
        this.refraction = refraction;

    }
    setUniforms(prefix, program) {
        this.locations = {};
        this.locations.ambient    = gl.getUniformLocation(program, prefix + ".ambient");
        this.locations.diffuse    = gl.getUniformLocation(program, prefix + ".diffuse");
        this.locations.specular   = gl.getUniformLocation(program, prefix + ".specular");
        this.locations.spec_pow   = gl.getUniformLocation(program, prefix + ".spec_pow");
        this.locations.reflection = gl.getUniformLocation(program, prefix + ".reflection");
        this.locations.refraction = gl.getUniformLocation(program, prefix + ".refraction");

        this.upload = {};
        this.upload.ambient    = () => { 
            gl.uniform3fv(this.locations.ambient, this.ambient)};
        this.upload.diffuse    = () => { 
            gl.uniform3fv(this.locations.diffuse, this.diffuse)};
        this.upload.specular   = () => { 
            gl.uniform3fv(this.locations.specular, this.specular)};
        this.upload.spec_pow   = () => { 
            gl.uniform1f(this.locations.spec_pow, this.spec_pow)};
        this.upload.reflection = () => { 
            gl.uniform4fv(this.locations.reflection, this.reflection)};
        this.upload.refraction = () => { 
            gl.uniform4fv(this.locations.refraction, this.refraction)};

        this.upload.all = () => {
            this.upload.ambient();
            this.upload.diffuse();
            this.upload.specular();
            this.upload.spec_pow();
            this.upload.reflection();
            this.upload.refraction();
        };
    }
}

const spheres = [
    new Sphere(
        [0.0, 1.5, 0.0],
        0.5,
        new Material(
            [0.0, 0.1, 0.1],
            [1.0, 0.3, 0.3],
            [1.0, 0.3, 0.3],
            2.0,
            [1.0, 1.0, 1.0, 1.0],
            NO_REFRACT
        )
    ),
    new Sphere(
        [0.5, -0.5, -4.0],
        0.3,
        new Material(
            [0.0, 0.1, 0.1],
            [0.3, 0.3, 1.0],
            [0.3, 0.3, 1.0],
            6.0,

            [1.0, 1.0, 1.0, 1.0],
            [0.5, 0.5, 0.5, IDX_REFRACT_WATER]
        )
    ),
    new Sphere(
        [0.0, -0.5, -4.0],
        0.5,
        new Material(
            [0.0, 0.1, 0.1],
            [0.1, 0.1, 0.1],
            [1.0, 1.0, 1.0],
            100.0,

            [1.0, 1.0, 1.0, 1.0],
            [0.5, 0.5, 0.5, IDX_REFRACT_FUSED_QUARTZ]
        )
    )
];

let r = 0.5;
let r3 = 1.0 / Math.sqrt(r);

const polyhedra = [
    new Polyhedron(
        [0.0, 0.0, -10.0],
        0.5,
        6,
        new Material(
            [1.0, 1.0, 1.0],
            [1.0, 1.0, 1.0],
            [0.02, 0.0124, 1.0],
            6.0,
            [1.0, 1.0, 1.0, 1.0],
            [0.5, 0.5, 0.5, IDX_REFRACT_FUSED_QUARTZ]
        ),
        new Float32Array([
           -1.0,  0.0,  0.0, -0.5,
            1.0,  0.0,  0.0, -0.5,
            0.0, -1.0,  0.0, -0.5,
            0.0,  1.0,  0.0, -0.5,
            0.0,  0.0, -1.0, -0.5,
            0.0,  0.0,  1.0, -0.5,
        ])
    ),

    new Polyhedron(
        [0.0, 0.0, -10.0],
        0.5,
        8,
        new Material(
            [0.01, 0.2, 0.01],
            [0.67, 0.0, 0.02],
            [0.01, 0.2, 0.6],
            10.0,
            [1.0, 1.0, 1.0, 1.0],
            [0.5, 0.5, 0.5, IDX_REFRACT_DIAMOND]
        ),
        new Float32Array([
            -r3, -r3, -r3, -r,
             r3, -r3, -r3, -r,
            -r3,  r3, -r3, -r,
             r3,  r3, -r3, -r,
            -r3, -r3,  r3, -r,
             r3, -r3,  r3, -r,
            -r3,  r3,  r3, -r,
             r3,  r3,  r3, -r,
        ])
    ),
]

let cursor;

let matrixModule;
let Matrix;
// matrix stack hierarchy
let H = null;

async function setup(state) {

    matrixModule = await import(getPath("matrix.js"));
    
    Matrix = matrixModule.Matrix;
    H      = new matrixModule.Dynamic_Matrix4x4_Stack();
    

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

                state.uCursorLoc       = gl.getUniformLocation(program, 'uCursor');
                state.uModelLoc        = gl.getUniformLocation(program, 'uModel');
                state.uProjLoc         = gl.getUniformLocation(program, 'uProj');
                state.uTimeLoc         = gl.getUniformLocation(program, 'uTime');
                state.uViewLoc         = gl.getUniformLocation(program, 'uView');
            
                gl.uniform4fv(gl.getUniformLocation(program, "ambient"), [0.045, 0.02, 0.01, 1.0]);
                gl.uniform1i(gl.getUniformLocation(program,  "sphere_count"),     3);
                gl.uniform1i(gl.getUniformLocation(program,  "polyhedron_count"), 0);
                gl.uniform1i(gl.getUniformLocation(program,  "plane_count"),      0);

                for (let i = 0; i < spheres.length; i += 1) {
                    const sphere = spheres[i];
                    let prefix = "spheres[" + i + "]";
                    sphere.setUniforms(prefix, program);
                    sphere.upload.all();
                    sphere.mat.upload.all();
                }

                for (let i = 0; i < polyhedra.length; i += 1) {
                    const polyhedron = polyhedra[i];
                    let prefix = "polyhedra[" + i + "]";
                    polyhedron.setUniforms(prefix, program);
                    polyhedron.upload.all();
                    polyhedron.mat.upload.all();
                }
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

    cursor = ScreenCursor.trackCursor(MR.getCanvas());

    if (!shaderSource) {
        throw new Error("Could not load shader");
    }


    // Create a square as a triangle strip consisting of two triangles
    state.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, state.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,0, 1,1,0, -1,-1,0, 1,-1,0]), gl.STATIC_DRAW);

    // Assign aPos attribute to each vertex
    let aPos = gl.getAttribLocation(state.program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
}

// I HAVE IMPLEMENTED inverse() FOR YOU. FOR HOMEWORK, YOU WILL STILL NEED TO IMPLEMENT:
// identity(), translate(x,y,z), rotateX(a), rotateY(a) rotateZ(a), scale(x,y,z), multiply(A,B)

// NOTE: t is the elapsed time since system start in ms, but
// each world could have different rules about time elapsed and whether the time
// is reset after returning to the world
function onStartFrame(t, state) {

    let tStart = t;
    if (!state.tStart) {
        state.tStart = t;
        state.time = t;
    }

    let cursorValue = () => {
       let p = cursor.position(), canvas = MR.getCanvas();
       return [ p[0] / canvas.clientWidth * 2 - 1, 1 - p[1] / canvas.clientHeight * 2, p[2] ];
    }

    tStart = state.tStart;

    let now = (t - tStart);
    // different from t, since t is the total elapsed time in the entire system, best to use "state.time"
    state.time = now;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let time = now / 1000;

    gl.uniform3fv(state.uCursorLoc     , cursorValue());
    gl.uniform1f (state.uTimeLoc       , time);

    gl.enable(gl.DEPTH_TEST);

    const smv = 0.5 * sin(2.0 * time);

    const sinTime = sin(time);
    const cosTime = cos(time);
    const sin01Time = sin01(time);
    {
        {
            const spCenter = spheres[0].center;
            spCenter[0] = 0.0 - sinTime;
            spCenter[1] = 1.5;
            spCenter[2] = 5.0 * sinTime;
        }
        {
            const spCenter = spheres[1].center;
            spCenter[0] =  0.5;
            spCenter[1] = -0.5;
            spCenter[2] = -4.0 - smv;
        }
        {
            const spCenter = spheres[2].center;
            spCenter[0] =  0.0 + cosTime;
            spCenter[1] = -0.5 + 0.0;
            spCenter[2] = -4.0 + sinTime;
        }
        spheres[0].upload.center();
        spheres[1].upload.center();
        spheres[2].upload.center();
    }
    {
        {
            const ph = polyhedra[0];
            ph.center[1] = sin01Time;
            ph.upload.center();

            const pl = ph.planesArray[5];
            pl[0] = 0.0;
            pl[1] = 0.0;
            pl[2] = 1.0;
            pl[3] = -0.5 - (10.0 * sin01Time);
            ph.upload.planeAt(5);
        }
        {
            const ph = polyhedra[1];
            ph.center[0] = cosTime;
            ph.center[1] = sin01Time;
            ph.center[2] = 0.0;

            ph.upload.center();

            ph.r = sin01(-time);
            const mr = -ph.r;
            r3 = 1.0 / Math.sqrt(r);
            const mr3 = -r3;

            const pl = ph.planesArray;

            pl[0][0] = mr3;
            pl[0][1] = mr3;
            pl[0][2] = mr3;
            pl[0][3] = mr;

            pl[1][0] = r3;
            pl[1][1] = mr3;
            pl[1][2] = mr3;
            pl[1][3] = mr;

            pl[2][0] = mr3;
            pl[2][1] = r3;
            pl[2][2] = mr3;
            pl[2][3] = mr;

            pl[3][0] = r3;
            pl[3][1] = r3;
            pl[3][2] = mr3;
            pl[3][3] = mr;

            pl[4][0] = mr3;
            pl[4][1] = mr3;
            pl[4][2] = r3;
            pl[4][3] = mr;

            pl[5][0] = r3;
            pl[5][1] = mr3;
            pl[5][2] = r3;
            pl[5][3] = mr;

            pl[6][0] = mr3;
            pl[6][1] = r3;
            pl[6][2] = r3;
            pl[6][3] = mr;

            pl[7][0] = r3;
            pl[7][1] = r3;
            pl[7][2] = r3;
            pl[7][3] = mr;

            ph.upload.all();
        }
    }
}


function onDraw(t, projMat, viewMat, state, eyeIdx) {
    const sec = state.time / 1000;

    const my = state;
  

    H.save();

    // Matrix.translate(H.matrix(), Math.sin(sec), 0.0, 0.0);
    // Matrix.rotateZ(H.matrix(), sec, 0.0, 0.0);
    // Matrix.scale(H.matrix(), Math.abs(Math.cos(sec)), Math.abs(Math.cos(sec)), 1.0);

    gl.uniformMatrix4fv(my.uModelLoc, false, Matrix.translate(H.matrix(), 0, 0, -1));
    gl.uniformMatrix4fv(my.uViewLoc,  false, new Float32Array(viewMat));
    gl.uniformMatrix4fv(my.uProjLoc,  false, Matrix.orthographic(H.matrix()));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    H.restore();
}

function onEndFrame(t, state) {
}

export default function main() {
    const def = {
        name         : 'week4',
        setup        : setup,
        onStartFrame : onStartFrame,
        onEndFrame   : onEndFrame,
        onDraw       : onDraw,
    };

    return def;
}
