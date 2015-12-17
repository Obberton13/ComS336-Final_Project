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
var modelFilename = "./models/portal_objects/Portal Gun.obj";
var textureFilename = "./models/portal_objects/textures/portalgun_col.jpg";
var normalFilename = "./models/portal_objects/textures/portalgun_nor.jpg";

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
			c.translateZ(-0.5);
			return true;
		case 'a':
			c.translateX(-0.5);
			return true;
		case 's':
			c.translateZ(0.5);
			return true;
		case 'd':
			c.translateX(0.5);
			return true;
		case 'r':
			c.translateY(0.5);
			return true;
		case 'f':
			c.translateY(-0.5);
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
	camera.position.x = -5;
	camera.position.y = 0;
	camera.position.z = -5;
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	
	camera2 = new THREE.PerspectiveCamera( 80, 3/5, 0.1, 1000 );
	camera2.position.x = 4.95;
	camera2.position.y = 0;
	camera2.position.z = 0;
	camera2.lookAt(new THREE.Vector3(0, 0, 0));
	
	camera3 = new THREE.PerspectiveCamera( 80, 3/5, 0.1, 1000 );
	camera3.position.x = 0;
	camera3.position.y = 0;
	camera3.position.z = 4.95;
	camera3.lookAt(new THREE.Vector3(0, 0, 0));
	
	var light = new THREE.PointLight(0xffffff, 1, 1000);
	light.position.set(0,0,0);
	scene.add(light);
	light = new THREE.AmbientLight(0xffffff);
	scene.add(light);

	var ourCanvas = document.getElementById('theCanvas');
	var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});

	//Creates the skybox (the testing room)
	var wallTexture = new THREE.ImageUtils.loadTexture( path + "portal_wall_v2.jpg" );
	wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
	wallTexture.repeat.set(5,5);
	var wallMaterial = new THREE.MeshBasicMaterial( { map: wallTexture, side: THREE.BackSide } );  
	var geometry = new THREE.BoxGeometry( 10, 10, 10 );
	var cube = new THREE.Mesh( geometry, wallMaterial );
	scene.add( cube );

	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};
	
	var gun_texture = new THREE.Texture();
	var loader = new THREE.ImageLoader(manager);
	loader.load(textureFilename, function(image){
		gun_texture.image = image;
		gun_texture.needsUpdate = true;
	});
	
	var gun_normal = new THREE.Texture();
	loader.load(normalFilename, function(image){
		gun_normal.image = image;
		gun_normal.needsUpdate = true;
	});
	
	var loader = new THREE.OBJLoader();
	loader.load( modelFilename, function ( object ) {
		object.traverse( function ( child )
		{
			if ( child instanceof THREE.Mesh )
			{
				child.material.map = gun_texture;
				child.material.normalMap = gun_normal;
			}
		});
		scene.add( object );
	});
	
	/*renderTarget = new THREE.WebGLRenderTarget( 512, 512, { format: THREE.RGBFormat } );
	var planelikeGeometry = new THREE.CubeGeometry( 400, 200, 200 );
	var plane = new THREE.Mesh( planelikeGeometry, new THREE.MeshBasicMaterial( { map: renderTarget } ) );
	plane.position.set(0,100,-500);
	scene.add(plane);
	
	renderer.render( scene, topCamera, renderTarget, true );
	/*renderer.render( scene, topCamera );*/
	
	renderTarget_b = new THREE.WebGLRenderTarget( 512, 512, { format: THREE.RGBFormat } );
	renderTarget_o = new THREE.WebGLRenderTarget( 512, 512, { format: THREE.RGBFormat } );
	
	// Draw the planes that are going to house our portals.
	var geometry = new THREE.PlaneGeometry( 3, 5, 1, 1 );
	//var material = new THREE.MeshBasicMaterial( {color: 0x229900, side: THREE.DoubleSide} );
	var material = new THREE.MeshBasicMaterial( {map: renderTarget_b, side: THREE.DoubleSide} );
	var b_portal = new THREE.Mesh( geometry, material );
	b_portal.position.set(0,0,4.95);
	scene.add( b_portal );
	
	var geometry = new THREE.PlaneGeometry( 3, 5, 1, 1 );
	//var material = new THREE.MeshBasicMaterial( {color: 0xffccff, side: THREE.DoubleSide} );
	var material = new THREE.MeshBasicMaterial( {map: renderTarget_o, side: THREE.DoubleSide} );
	var o_portal = new THREE.Mesh( geometry, material );
	o_portal.position.set(4.95,0,0);
	o_portal.rotation.set(0,Math.PI/2,0);
	scene.add( o_portal );
	
	// Give the planes identifying colors.
	var geometry = new THREE.PlaneGeometry( 3.25, 5.25, 1, 1 );
	var material = new THREE.MeshBasicMaterial( {color: 0x2299FF, side: THREE.DoubleSide} );
	var b_portal_b = new THREE.Mesh( geometry, material );
	b_portal_b.position.set(0,0,4.99);
	scene.add( b_portal_b );
	
	var geometry = new THREE.PlaneGeometry( 3.25, 5.25, 1, 1 );
	var material = new THREE.MeshBasicMaterial( {color: 0xffcc00, side: THREE.DoubleSide} );
	var o_portal_b = new THREE.Mesh( geometry, material );
	o_portal_b.position.set(4.99,0,0);
	o_portal_b.rotation.set(0,Math.PI/2,0);
	scene.add( o_portal_b );

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
		renderer.render(scene, camera2, renderTarget_b, true);
		renderer.render(scene, camera3, renderTarget_o, true);
		renderer.render(scene, camera);
	};

	render();
}