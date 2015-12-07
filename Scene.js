//
// Skybox with environment map using Three.js.  
// Edit around lines 165 and 195 to change from reflection to refraction.
//

// a couple of example cube maps
//var path = "../images/park/";
//var path = "../images/sky/";
var path = "../images/portal_images/";

var imageNames = [
                  //path + "px.jpg",
                  //path + "nx.jpg",
                  //path + "py.jpg",
                  //path + "ny.jpg",
                  //path + "pz.jpg",
                  //path + "nz.jpg"
                  //path + "nz.jpg",
                  //path + "nz.jpg",
                  //path + "nz.jpg",
                  //path + "nz.jpg",
                  //path + "nz.jpg",
                  //path + "nz.jpg"
				  path + "portal_wall.jpg"
                  ];

var axis = 'z';
var paused = false;
var camera;

//translate keypress events to strings
//from http://javascript.info/tutorial/keyboard-events
function getChar(event) {
if (event.which == null) {
 return String.fromCharCode(event.keyCode) // IE
} else if (event.which!=0 && event.charCode!=0) {
 return String.fromCharCode(event.which)   // the rest
} else {
 return null // special key
}
}

function cameraControl(c, ch)
{
  var distance = c.position.length();
  var q, q2;
  
  switch (ch)
  {
  // camera controls
  case 'w':
    c.translateZ(-0.1);
    return true;
  case 'a':
    c.translateX(-0.1);
    return true;
  case 's':
    c.translateZ(0.1);
    return true;
  case 'd':
    c.translateX(0.1);
    return true;
  case 'r':
    c.translateY(0.1);
    return true;
  case 'f':
    c.translateY(-0.1);
    return true;
  case 'j':
    // need to do extrinsic rotation about world y axis, so multiply camera's quaternion
    // on left
    q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0),  5 * Math.PI / 180);
    q2 = new THREE.Quaternion().copy(c.quaternion);
    c.quaternion.copy(q).multiply(q2);
    return true;
  case 'l':
    q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0),  -5 * Math.PI / 180);
    q2 = new THREE.Quaternion().copy(c.quaternion);
    c.quaternion.copy(q).multiply(q2);
    return true;
  case 'i':
    // intrinsic rotation about camera's x-axis
    c.rotateX(5 * Math.PI / 180);
    return true;
  case 'k':
    c.rotateX(-5 * Math.PI / 180);
    return true;
  case 'O':
    c.lookAt(new THREE.Vector3(0, 0, 0));
    return true;
  case 'S':
    c.fov = Math.min(80, c.fov + 5);
    c.updateProjectionMatrix();
    return true;
  case 'W':
    c.fov = Math.max(5, c.fov  - 5);
    c.updateProjectionMatrix();
    return true;

    // alternates for arrow keys
  case 'J':
    //this.orbitLeft(5, distance)
    c.translateZ(-distance);
    q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0),  5 * Math.PI / 180);
    q2 = new THREE.Quaternion().copy(c.quaternion);
    c.quaternion.copy(q).multiply(q2);
    c.translateZ(distance)
    return true;
  case 'L':
    //this.orbitRight(5, distance)  
    c.translateZ(-distance);
    q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0),  -5 * Math.PI / 180);
    q2 = new THREE.Quaternion().copy(c.quaternion);
    c.quaternion.copy(q).multiply(q2);
    c.translateZ(distance)
    return true;
  case 'I':
    //this.orbitUp(5, distance)      
    c.translateZ(-distance);
    c.rotateX(-5 * Math.PI / 180);
    c.translateZ(distance)
    return true;
  case 'K':
    //this.orbitDown(5, distance)  
    c.translateZ(-distance);
    c.rotateX(5 * Math.PI / 180);
    c.translateZ(distance)
    return true;
  }
  return false;
}

function handleKeyPress(event)
{
  var ch = getChar(event);
  if (cameraControl(camera, ch)) return;
  
  switch(ch)
  {
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
  default:
    return;
  }
}

function start()
{
  window.onkeypress = handleKeyPress;

  var scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 30, 1.5, 0.1, 1000 );
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 5;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  
  var ourCanvas = document.getElementById('theCanvas');
  var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});

  // Loads the six images
  // Note optional second parameter, this allows the texture to be used for refraction 
  // (and the texture still works for the skybox).
  //var ourCubeMap = THREE.ImageUtils.loadTextureCube(imageNames);
  var ourCubeMap = THREE.ImageUtils.loadTextureCube(imageNames, THREE.CubeRefractionMapping);
  
  // Use a built-in Three.js shader for cube maps
  var cubeMapShader = THREE.ShaderLib["cube"];
  cubeMapShader.uniforms[ "tCube" ].value = ourCubeMap;
  var material = new THREE.ShaderMaterial( {
      fragmentShader: cubeMapShader.fragmentShader,
      vertexShader: cubeMapShader.vertexShader,
      uniforms: cubeMapShader.uniforms,
      side: THREE.BackSide  // we'll only see the inside of the cube
  } );

  // Make a big ole cube for the skybox
  var geometry = new THREE.BoxGeometry( 1000, 1000, 1000 );

  // Create a mesh for the skybox using the cube shader as the material
  var cube = new THREE.Mesh( geometry, material );
  
  // Add it to the scene
  scene.add( cube );

  // put another object in the scene
  geometry = new THREE.SphereGeometry(0.75);
  //geometry = new THREE.TorusKnotGeometry(1, .4, 128, 16);

  // to make it look reflective, set the envMap property
  // we can also set the reflectivity (default 1.0) and/or refraction ratio (default .98)
  // (Note: to get refraction need to load texture with THREE.CubeRefractionMapping, see above.)
  //material = new THREE.MeshBasicMaterial({color : 0xffffff, envMap : ourCubeMap});
  material = new THREE.MeshBasicMaterial({color : 0xffffff, envMap : ourCubeMap,  refractionRatio : 0.66, reflectivity : .75});
  material.wireframe = false;
  var sphere = new THREE.Mesh( geometry, material );
  scene.add(sphere);

  sphere.matrixAutoUpdate = false;

  var render = function () {
    requestAnimationFrame( render );
    var increment = 0.5 * Math.PI / 180.0;
    if (!paused)
    {
      switch(axis)
      {
      case 'x':
        sphere.applyMatrix(new THREE.Matrix4().makeRotationX(increment));
        break;
      case 'y':
        sphere.applyMatrix(new THREE.Matrix4().makeRotationY(increment));  
        break;
      case 'z':
        sphere.applyMatrix(new THREE.Matrix4().makeRotationZ(increment));    
        break;
     default:
      }
    }
    renderer.render(scene, camera);
  };

  render();
}