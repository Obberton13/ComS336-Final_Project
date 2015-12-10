//
// Same as LightingWithTexture but uses the Three.js OBJ file
// loader to load a model.  Depends on Camera.js.
//
// Edit the html file to change how the sampled
// value is used to render. Try using the "tarnish" image
// to modulate the specular color. Try using the "steve"
// image to experiment with transparency.
//
// Use the keys 1 through 5 to try out different texture sampling
// parameters.
//

// size of the fbo
var OFFSCREEN_WIDTH = 1024;
var OFFSCREEN_HEIGHT = 1024

var theModel;
var planeModel;

var modelFilename;

// if a filename is given, that will be use by the loader
// to initialize 'theModel'
modelFilename = "../models/teapot.obj";

// Warning, the .obj file for the bunny is 7 MB
//modelFilename = "../models/bunny_cylindrical_tex.obj";

// if no model filename is given, choose a built-in geometry

//theModel = getModelData(new THREE.BoxGeometry(1, 1, 1));
//theModel = getModelData(new THREE.SphereGeometry(1))
//theModel = getModelData(new THREE.SphereGeometry(1, 48, 24));
//theModel = getModelData(new THREE.TorusKnotGeometry(1, .4, 128, 16));

// image file for texture
var imageFilename = "../images/check64.png";
//var imageFilename = "../images/check64border.png";
//var imageFilename = "../images/clover.jpg";
//var imageFilename = "../images/brick.png";
//var imageFilename = "../images/marble.png";
//var imageFilename = "../images/steve.png";
//var imageFilename = "../images/tarnish.jpg";

// given an instance of THREE.Geometry, returns an object
// containing raw data for vertices and normal vectors.
function getModelData(geom) {
	var verticesArray = [];
	var normalsArray = [];
	var vertexNormalsArray = [];
	var reflectedNormalsArray = [];
	var count = 0;
	for (var f = 0; f < geom.faces.length; ++f) {
		var face = geom.faces[f];
		var v = geom.vertices[face.a];
		verticesArray.push(v.x);
		verticesArray.push(v.y);
		verticesArray.push(v.z);

		v = geom.vertices[face.b];
		verticesArray.push(v.x);
		verticesArray.push(v.y);
		verticesArray.push(v.z);

		v = geom.vertices[face.c];
		verticesArray.push(v.x);
		verticesArray.push(v.y);
		verticesArray.push(v.z);
		count += 3;

		var fn = face.normal;
		for (var i = 0; i < 3; ++i) {
			normalsArray.push(fn.x);
			normalsArray.push(fn.y);
			normalsArray.push(fn.z);
		}

		for (var i = 0; i < 3; ++i) {
			var vn = face.vertexNormals[i];
			vertexNormalsArray.push(vn.x);
			vertexNormalsArray.push(vn.y);
			vertexNormalsArray.push(vn.z);
		}

	}

	// texture coords
	//each element is an array of three Vector2
	var uvs = geom.faceVertexUvs[0];
	var texCoordArray = [];
	for (var a = 0; a < uvs.length; ++a) {
		for (var i = 0; i < 3; ++i) {
			var uv = uvs[a][i];
			texCoordArray.push(uv.x);
			texCoordArray.push(uv.y);
		}
	}

	return {
		numVertices: count,
		vertices: new Float32Array(verticesArray),
		normals: new Float32Array(normalsArray),
		vertexNormals: new Float32Array(vertexNormalsArray),
		reflectedNormals: new Float32Array(reflectedNormalsArray),
		texCoords: new Float32Array(texCoordArray)
	};
}

//Code for initializing FBO borrowed directly from teal book example (see chapter 10)
//Returns a handle to the FBO, with an added attribute called 'texture' which is the
//associated texture.  Depends on the two constants OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT.
function initFramebufferObject(gl) {
	var framebuffer, texture, depthBuffer;

//Define the error handling function
	var error = function () {
		if (framebuffer) gl.deleteFramebuffer(framebuffer);
		if (texture) gl.deleteTexture(texture);
		if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
		return null;
	};

//Create a frame buffer object (FBO)
	framebuffer = gl.createFramebuffer();
	if (!framebuffer) {
		console.log('Failed to create frame buffer object');
		return error();
	}

//Create a texture object and set its size and parameters
	texture = gl.createTexture(); // Create a texture object
	if (!texture) {
		console.log('Failed to create texture object');
		return error();
	}
	gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the object to target
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	framebuffer.texture = texture; // Store the texture object

//Create a renderbuffer object and Set its size and parameters
	depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
	if (!depthBuffer) {
		console.log('Failed to create renderbuffer object');
		return error();
	}
	gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer); // Bind the object to target
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);

//Attach the texture and the renderbuffer object to the FBO
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

//Check if FBO is configured correctly
	var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
	if (gl.FRAMEBUFFER_COMPLETE !== e) {
		console.log('Frame buffer object is incomplete: ' + e.toString());
		return error();
	}

//Unbind the buffer object
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);

	return framebuffer;
}


function makeNormalMatrixElements(model, view) {
	var n = new Matrix4(view).multiply(model);
	n.transpose();
	n.invert();
	n = n.elements;
	return new Float32Array([
		n[0], n[1], n[2],
		n[4], n[5], n[6],
		n[8], n[9], n[10]]);
}


var axisVertices = new Float32Array([
	0.0, 0.0, 0.0,
	1.5, 0.0, 0.0,
	0.0, 0.0, 0.0,
	0.0, 1.5, 0.0,
	0.0, 0.0, 0.0,
	0.0, 0.0, 1.5]);

var axisColors = new Float32Array([
	1.0, 0.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 0.0, 1.0, 1.0]);

// A few global variables...

// light and material properties, remember this is column major

// generic white light
var lightPropElements = new Float32Array([
	0.2, 0.2, 0.2,
	0.7, 0.7, 0.7,
	0.7, 0.7, 0.7
]);

// blue light with red specular highlights (because we can)
//var lightPropElements = new Float32Array([
//0.2, 0.2, 0.2,
//0.0, 0.0, 0.7,
//0.7, 0.0, 0.0
//]);

// shiny green plastic
//var matPropElements = new Float32Array([                                        
//0.3, 0.3, 0.3, 
//0.0, 0.8, 0.0,
//0.8, 0.8, 0.8
//]);
//var shininess = 30;

// shiny brass
var matPropElements = new Float32Array([
	0.33, 0.22, 0.03,
	0.78, 0.57, 0.11,
	0.99, 0.91, 0.81
]);
var shininess = 28.0;

// very fake looking white, useful for testing lights
//var matPropElements = new Float32Array([
//1, 1, 1,
//1, 1, 1,
//1, 1, 1
//]);
//var shininess = 20.0;

// clay or terracotta
//var matPropElements = new Float32Array([
//0.75, 0.38, 0.26,
//0.75, 0.38, 0.26,
//0.25, 0.20, 0.15 // weak specular highlight similar to diffuse color
//]);
//var shininess = 10.0;

// the OpenGL context
var gl;

//the framebuffer and associated texture
var fbo;

// our model data
var theModel;

// handle to a buffer on the GPU
var vertexBuffer;
var vertexNormalBuffer;
var texCoordBuffer;

var vertexBufferPlane;
var texCoordBufferPlane;

var axisBuffer;
var axisColorBuffer;

//handle to the texture object on the GPU
var textureHandle;

// handle to the compiled shader program on the GPU
var lightingShader;
var colorShader;
var textureShader;

// transformation matrices
var model = new Matrix4();
var modelScale = new Matrix4();

var axis = 'x';
var paused = false;

//instead of view and projection matrices, use a Camera
var camera = new Camera(30, 1.0);
var cameraFBO = new Camera(30, 1.0);

//translate keypress events to strings
//from http://javascript.info/tutorial/keyboard-events
function getChar(event) {
	if (event.which == null) {
		return String.fromCharCode(event.keyCode) // IE
	} else if (event.which != 0 && event.charCode != 0) {
		return String.fromCharCode(event.which)   // the rest
	} else {
		return null // special key
	}
}

//handler for key press events will choose which axis to
// rotate around
function handleKeyPress(event) {
	var ch = getChar(event);
	if (camera.keyControl(ch)) {

		return;
	}

	switch (ch) {
		case ' ':
			paused = !paused;
			break;
		case 'x':
			axis = 'x';
			break;
		case 'y':
			axis = 'y';
			break;
		case 'z':
			axis = 'z';
			break;
		case 'o':
			model.setIdentity();
			axis = 'x';
			break;

		// experiment with texture parameters
		case '1':
			gl.bindTexture(gl.TEXTURE_2D, textureHandle);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			break;
		case '2':
			gl.bindTexture(gl.TEXTURE_2D, textureHandle);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			break;
		case '3':
			gl.bindTexture(gl.TEXTURE_2D, textureHandle);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			break;
		case '4':
			gl.bindTexture(gl.TEXTURE_2D, textureHandle);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
			break;
		case '5':
			gl.bindTexture(gl.TEXTURE_2D, textureHandle);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			break;


		default:
			return;
	}
}

function drawModel(offScreen) {
	var view = camera.getView();
	var projection = camera.getProjection();

	if (offScreen) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);              // Change the drawing destination to FBO
		gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);  // Set a viewport for FBO
		// specify a fill color for clearing the framebuffer
		gl.clearColor(0.4, 0.4, 0.4, 1.0);
		gl.enable(gl.DEPTH_TEST);
		// clear the framebuffer
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// place camera behind mirror to create mirror image
		cameraFBO = new Camera(camera.getFovy(), camera.getAspectRatio());
		var cx, cy, cz;
		cx = camera.getPosition().elements[0];
		cy = camera.getPosition().elements[1];
		cz = camera.getPosition().elements[2];

		// reflect across z = -1
		cameraFBO.setPosition(cx, -cy, -cz - 1);

		// camera forward vector intersected with plane z = -1
		// to find a position to look at
		// (cx, cy, cz) + t(fx, fy, fz) = (ix, iy, -1)
		var fx, fy, fz;
		fx = -camera.back.elements[0];
		fy = -camera.back.elements[1];
		fz = -camera.back.elements[2];
		var t = (-1 - cz) / fz;
		var ix = cx + t * fx;
		var iy = cy + t * fy;
		cameraFBO.lookAt(ix, iy, -1);

		view = cameraFBO.getView();
		projection = cameraFBO.getProjection();
	}
	else {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);              // Change the drawing destination to FBO
		gl.viewport(0, 0, 600, 600);
		// specify a fill color for clearing the framebuffer
		gl.clearColor(0.0, 0.0, 0.4, 1.0);
		gl.enable(gl.DEPTH_TEST);
		// clear the framebuffer
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


	}


	// bind the shader
	gl.useProgram(lightingShader);

	// get the index for the a_Position attribute defined in the vertex shader
	var positionIndex = gl.getAttribLocation(lightingShader, 'a_Position');
	if (positionIndex < 0) {
		console.log('Failed to get the storage location of a_Position');
		return;
	}

	var normalIndex = gl.getAttribLocation(lightingShader, 'a_Normal');
	if (normalIndex < 0) {
		console.log('Failed to get the storage location of a_Normal');
		return;
	}

	var texCoordIndex = gl.getAttribLocation(lightingShader, 'a_TexCoord');
	if (texCoordIndex < 0) {
		console.log('Failed to get the storage location of a_TexCoord');
		return;
	}

	// "enable" the a_position attribute
	gl.enableVertexAttribArray(positionIndex);
	gl.enableVertexAttribArray(normalIndex);
	gl.enableVertexAttribArray(texCoordIndex);

	// bind buffers for points
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
	gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.vertexAttribPointer(texCoordIndex, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// set uniform in shader for projection * view * model transformation
	var loc = gl.getUniformLocation(lightingShader, "model");
	var current = new Matrix4(model).multiply(modelScale);
	gl.uniformMatrix4fv(loc, false, current.elements);
	loc = gl.getUniformLocation(lightingShader, "view");
	gl.uniformMatrix4fv(loc, false, view.elements);
	loc = gl.getUniformLocation(lightingShader, "projection");
	gl.uniformMatrix4fv(loc, false, projection.elements);
	loc = gl.getUniformLocation(lightingShader, "normalMatrix");
	gl.uniformMatrix3fv(loc, false, makeNormalMatrixElements(model, view));

	loc = gl.getUniformLocation(lightingShader, "lightPosition");
	gl.uniform4f(loc, 2.0, 4.0, 2.0, 1.0);

	// light and material properties
	loc = gl.getUniformLocation(lightingShader, "lightProperties");
	gl.uniformMatrix3fv(loc, false, lightPropElements);
	loc = gl.getUniformLocation(lightingShader, "materialProperties");
	gl.uniformMatrix3fv(loc, false, matPropElements);
	loc = gl.getUniformLocation(lightingShader, "shininess");
	gl.uniform1f(loc, shininess);

	// need to choose a texture unit, then bind the texture to TEXTURE_2D for that unit
	var textureUnit = 1;
	gl.activeTexture(gl.TEXTURE0 + textureUnit);
	gl.bindTexture(gl.TEXTURE_2D, textureHandle);
	loc = gl.getUniformLocation(lightingShader, "sampler");
	gl.uniform1i(loc, textureUnit);

	// draw!
	gl.drawArrays(gl.TRIANGLES, 0, theModel.numVertices);

	gl.disableVertexAttribArray(positionIndex);
	gl.disableVertexAttribArray(normalIndex);

}


// code to actually render our geometry
function draw() {
	drawModel(true);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);              // Change the drawing destination to FBO
	gl.viewport(0, 0, 600, 600);
	// specify a fill color for clearing the framebuffer
	gl.clearColor(0.0, 0.0, 0.4, 1.0);

	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	drawModel(false);

	// draw the plane

	// bind the shader
	gl.useProgram(textureShader);

	// get the index for the a_Position attribute defined in the vertex shader
	var positionIndex = gl.getAttribLocation(textureShader, 'a_Position');
	if (positionIndex < 0) {
		console.log('Failed to get the storage location of a_Position');
		return;
	}

	var texCoordIndex = gl.getAttribLocation(textureShader, 'a_TexCoord');
	if (texCoordIndex < 0) {
		console.log('Failed to get the storage location of a_TexCoord');
		return;
	}

	// "enable" the a_position attribute
	gl.enableVertexAttribArray(positionIndex);
	gl.enableVertexAttribArray(texCoordIndex);


	// bind buffers
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferPlane);
	gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBufferPlane);
	gl.vertexAttribPointer(texCoordIndex, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	var view = camera.getView();
	var projection = camera.getProjection();

	// rotate to be parallel to x-z plane and translate 1 unit down
	//var planeModelMatrix = new Matrix4().translate(0, -1, 0).rotate(-90, 1, 0, 0);
	var planeModelMatrix = new Matrix4().translate(0, 0, -1).rotate(180, 0, 1, 0);
	//var planeModelMatrix = new Matrix4();
	var m = new Matrix4(projection).multiply(view).multiply(planeModelMatrix);
	loc = gl.getUniformLocation(textureShader, "transform");
	gl.uniformMatrix4fv(loc, false, m.elements);

	var textureUnit = 0;
	gl.activeTexture(gl.TEXTURE0 + textureUnit);
	gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
//  gl.bindTexture(gl.TEXTURE_2D, textureHandle);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);


	loc = gl.getUniformLocation(textureShader, "sampler");
	gl.uniform1i(loc, textureUnit);

	// draw
	gl.drawArrays(gl.TRIANGLES, 0, planeModel.numVertices);


	// bind the shader for drawing the axes
	gl.useProgram(colorShader);

	// get the index for the a_Position attribute defined in the vertex shader
	positionIndex = gl.getAttribLocation(colorShader, 'a_Position');
	if (positionIndex < 0) {
		console.log('Failed to get the storage location of a_Position');
		return;
	}

	var colorIndex = gl.getAttribLocation(colorShader, 'a_Color');
	if (colorIndex < 0) {
		console.log('Failed to get the storage location of a_Normal');
		return;
	}

	// "enable" the a_position attribute
	gl.enableVertexAttribArray(positionIndex);
	gl.enableVertexAttribArray(colorIndex);


	// draw axes (not transformed by model transformation)
	gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
	gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, axisColorBuffer);
	gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// set transformation to projection * view only
	loc = gl.getUniformLocation(colorShader, "transform");
	transform = new Matrix4().multiply(projection).multiply(view);
	gl.uniformMatrix4fv(loc, false, transform.elements);

	// draw axes
	gl.drawArrays(gl.LINES, 0, 6);

	// unbind shader and "disable" the attribute indices
	// (not really necessary when there is only one shader)
	gl.disableVertexAttribArray(positionIndex);
	gl.disableVertexAttribArray(colorIndex);
	gl.useProgram(null);

}


//entry point when page is loaded.  Wait for image to load before proceeding
function main() {
	var image = new Image();
	image.onload = function () {
		// chain the next function
		loadModel(image);
	};

	// starts loading the image asynchronously
	image.src = imageFilename;
}

//after loading texture image, load a model
function loadModel(image) {
	// only do this if we were given a filename to use
	if (modelFilename) {

		var callback = function (loadedModel, materials) {
			// assume only one object in the .obj file
			var child = loadedModel.children[0];

			// for the new (2015) obj file loader, this is an instance
			// of THREE.BufferGeometry, not THREE.Geometry, so we don't
			// use the getModelData function
			var geometry = child.geometry;
			theModel = new Object();
			theModel.numVertices = geometry.getAttribute('position').array.length /
				geometry.getAttribute('position').itemSize;
			theModel.vertices = geometry.getAttribute('position').array;
			theModel.vertexNormals = geometry.getAttribute('normal').array;
			theModel.texCoords = geometry.getAttribute('uv').array;

			// set a scale so it's roughly one unit in diameter
			geometry.computeBoundingSphere();
			var scale = 1 / geometry.boundingSphere.radius;
			modelScale = new Matrix4().setScale(scale, scale, scale);

			// chain the next function...
			startForReal(image);
		};

		// load the model file asynchronously
		var objLoader = new THREE.OBJLoader();
		objLoader.load(modelFilename, callback);
	}
	else {
		startForReal(image);
	}

}

// entry point when page is loaded
function startForReal(image) {

	// basically this function does setup that "should" only have to be done once,
	// while draw() does things that have to be repeated each time the canvas is
	// redrawn

	// retrieve <canvas> element
	var canvas = document.getElementById('theCanvas');

	// key handler
	window.onkeypress = handleKeyPress;

	// get the rendering context for WebGL, using the utility from the teal book
	gl = getWebGLContext(canvas, false);
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	// create the framebuffer object and associated texture
	fbo = initFramebufferObject(gl);

	// load and compile the shader pair, using utility from the teal book
	var vshaderSource = document.getElementById('vertexColorShader').textContent;
	var fshaderSource = document.getElementById('fragmentColorShader').textContent;
	if (!initShaders(gl, vshaderSource, fshaderSource)) {
		console.log('Failed to intialize shaders.');
		return;
	}
	colorShader = gl.program;
	gl.useProgram(null);

	// load and compile the shader pair, using utility from the teal book
	var vshaderSource = document.getElementById('vertexLightingShader').textContent;
	var fshaderSource = document.getElementById('fragmentLightingShader').textContent;
	if (!initShaders(gl, vshaderSource, fshaderSource)) {
		console.log('Failed to intialize shaders.');
		return;
	}
	lightingShader = gl.program;
	gl.useProgram(null);

	// load and compile the shader pair, using utility from the teal book
	var vshaderSource = document.getElementById('vertexTextureShader').textContent;
	var fshaderSource = document.getElementById('fragmentTextureShader').textContent;
	if (!initShaders(gl, vshaderSource, fshaderSource)) {
		console.log('Failed to intialize shaders.');
		return;
	}
	textureShader = gl.program;
	gl.useProgram(null);


	// buffer for vertex positions for triangles
	vertexBuffer = gl.createBuffer();
	if (!vertexBuffer) {
		console.log('Failed to create the buffer object');
		return;
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, theModel.vertices, gl.STATIC_DRAW);

	// buffer for normals
	vertexNormalBuffer = gl.createBuffer();
	if (!vertexNormalBuffer) {
		console.log('Failed to create the buffer object');
		return;
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, theModel.vertexNormals, gl.STATIC_DRAW);


	// buffer for tex coords
	texCoordBuffer = gl.createBuffer();
	if (!texCoordBuffer) {
		console.log('Failed to create the buffer object');
		return;
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, theModel.texCoords, gl.STATIC_DRAW);


	// plane for "floor"
	planeModel = getModelData(new THREE.PlaneGeometry(2, 2));

	// buffer for vertex positions for triangles
	vertexBufferPlane = gl.createBuffer();
	if (!vertexBufferPlane) {
		console.log('Failed to create the buffer object');
		return;
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferPlane);
	gl.bufferData(gl.ARRAY_BUFFER, planeModel.vertices, gl.STATIC_DRAW);

	texCoordBufferPlane = gl.createBuffer();
	if (!texCoordBufferPlane) {
		console.log('Failed to create the buffer object');
		return;
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBufferPlane);
	gl.bufferData(gl.ARRAY_BUFFER, planeModel.texCoords, gl.STATIC_DRAW);


	// axes
	axisBuffer = gl.createBuffer();
	if (!axisBuffer) {
		console.log('Failed to create the buffer object');
		return;
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, axisVertices, gl.STATIC_DRAW);

	// buffer for axis colors
	axisColorBuffer = gl.createBuffer();
	if (!axisColorBuffer) {
		console.log('Failed to create the buffer object');
		return;
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, axisColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, axisColors, gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);

//  // ask the GPU to create a texture object
	textureHandle = gl.createTexture();

	// choose a texture unit to use during setup, defaults to zero
	// (can use a different one when drawing)
	// max value is MAX_COMBINED_TEXTURE_IMAGE_UNITS
	gl.activeTexture(gl.TEXTURE0);

	// bind the texture
	gl.bindTexture(gl.TEXTURE_2D, textureHandle);

	// load the image bytes to the currently bound texture, flipping the vertical
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

	// texture parameters are stored with the texture
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	// specify a fill color for clearing the framebuffer
	gl.clearColor(0.0, 0.2, 0.2, 1.0);

	gl.enable(gl.DEPTH_TEST);

	camera.orbitUp(20, 5.0);
	camera.orbitRight(30, 5.0);

	// define an animation loop
	var animate = function () {
		draw();

		// increase the rotation by some amount, depending on the axis chosen
		var increment = 0.5;
		if (!paused) {
			switch (axis) {
				case 'x':
					model = new Matrix4().setRotate(increment, 1, 0, 0).multiply(model);
					axis = 'x';
					break;
				case 'y':
					axis = 'y';
					model = new Matrix4().setRotate(increment, 0, 1, 0).multiply(model);
					break;
				case 'z':
					axis = 'z';
					model = new Matrix4().setRotate(increment, 0, 0, 1).multiply(model);
					break;
				default:
			}
		}

		// request that the browser calls animate() again "as soon as it can"
		requestAnimationFrame(animate, canvas);
	};

	// start drawing!
	animate();


}