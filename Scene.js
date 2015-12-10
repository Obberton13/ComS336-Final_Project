//
// Skybox with environment map using Three.js.  
// Edit around lines 165 and 195 to change from reflection to refraction.
//

//README: This code was adapted from the SkyboxWithReflection example from Steve Kautz.
//		  Not Changed
//				- The camera handler
//		  Changed
//				- How the Skybox is textured

var path = "./images/portal_images/";
var modelFilename = "../models/portal_objects/Portal Gun.obj";

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
			c.rotateX(5 * Math.PI / 180);
			return true;
		case 'k':
			c.rotateX(-5 * Math.PI / 180);
			return true;
		case 'O':
			c.lookAt(new THREE.Vector3(0, 0, 0));
			return true;
		case 'S':
			c.fov = Math.min(100, c.fov + 5);
			c.updateProjectionMatrix();
			return true;
		case 'W':
			c.fov = Math.max(5, c.fov  - 5);
			c.updateProjectionMatrix();
			return true;

			// alternates for arrow keys
		case 'J':
			c.translateZ(-distance);
			q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0),  5 * Math.PI / 180);
			q2 = new THREE.Quaternion().copy(c.quaternion);
			c.quaternion.copy(q).multiply(q2);
			c.translateZ(distance)
			return true;
		case 'L':
			c.translateZ(-distance);
			q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0),  -5 * Math.PI / 180);
			q2 = new THREE.Quaternion().copy(c.quaternion);
			c.quaternion.copy(q).multiply(q2);
			c.translateZ(distance)
			return true;
		case 'I':
			c.translateZ(-distance);
			c.rotateX(-5 * Math.PI / 180);
			c.translateZ(distance)
			return true;
		case 'K':
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
	camera = new THREE.PerspectiveCamera( 80, 16/9, 0.1, 1000 );
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 5;
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	console.log(camera);

	var ourCanvas = document.getElementById('theCanvas');
	var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});

	//Creates the skybox (the testing room)
	var wallTexture = new THREE.ImageUtils.loadTexture( path + "portal_wall_v2.jpg" );
	wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
	wallTexture.repeat.set(5,5);
	var wallMaterial = new THREE.MeshBasicMaterial( { map: wallTexture, side: THREE.BackSide } );  
	var geometry = new THREE.BoxGeometry( 100, 100, 100 );
	var cube = new THREE.Mesh( geometry, wallMaterial );
	scene.add( cube );

	/*var loader = new THREE.OBJLoader();
	loader.load( modelFilename, function ( object ) {
		object.applyMatrix(new THREE.Matrix4().makeTranslation(0, 2, 0));
		object.position.set(0, 3, 0);
		object.traverse( function ( child )
		{
		  if ( child instanceof THREE.Mesh )
			child.material.color.setRGB (1, 1, 0);
		});
		scene.add( object );
	});*/

	var render = function () {
		requestAnimationFrame( render );
		var increment = 0.5 * Math.PI / 180.0;
		if (!paused)
		{
			switch(axis)
			{
				case 'x':
					break;
				case 'y':
					break;
				case 'z':
					break;
				default:
					break;
			}
		}
		renderer.render(scene, camera);
	};

	render();
}