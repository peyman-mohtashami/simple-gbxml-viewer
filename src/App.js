import React, { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import http from "./services/httpService";
import convert from "xml-js";

const style = {
	height: "100vh", //500 // we can control scene size by setting container dimensions
	overflow: "hidden"
};

const colors = {
	InteriorWall: 0x9b4f0f,
	ExteriorWall: 0x8d230f,
	Roof: 0x1e434c,
	InteriorFloor: 0x4b7447,
	//ExposedFloor: 0x40b4ff,
	Shade: 0xc99e10,
	//UndergroundWall: 0xa55200,
	//UndergroundSlab: 0x804000,
	//Ceiling: 0xff8080,
	//Air: 0xffff00,
	//UndergroundCeiling: 0x408080,
	//RaisedFloor: 0x4b417d,
	SlabOnGrade: 0x8eba43
	//FreestandingColumn: 0x808080,
	//EmbeddedColumn: 0x80806e
};

class App extends Component {
	componentDidMount() {
		this.sceneSetup();
		//this.addCustomSceneObjects();
		this.startAnimationLoop();
		window.addEventListener("resize", this.handleWindowResize);
		window.addEventListener(
			"orientationchange",
			this.handleWindowResize,
			false
		);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.handleWindowResize);
		window.removeEventListener(
			"orientationchange",
			this.handleWindowResize,
			false
		);
		window.cancelAnimationFrame(this.requestID);
		this.controls.dispose();
	}

	sceneSetup = () => {
		// get container dimensions and use them for scene sizing
		const width = this.el.clientWidth;
		const height = this.el.clientHeight;

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(
			60, // fov = field of view
			width / height, // aspect ratio
			1, // near plane
			10000 // far plane
		);
		this.camera.up.set(0, 0, 1);
		//this.camera.position.z = 5; // is used here to set some distance from a cube that is located at z = 0

		// OrbitControls allow a camera to orbit around the object
		// https://threejs.org/docs/#examples/controls/OrbitControls
		this.controls = new OrbitControls(this.camera, this.el);
		this.renderer = new THREE.WebGLRenderer({
			alpha: 1,
			antialias: true
		});
		this.renderer.setSize(width, height);
		this.el.appendChild(this.renderer.domElement); // mount using React ref

		// Create Global Ambient Light, Light Direction and Light Point
		this.lightAmbient = new THREE.AmbientLight(0x444444);
		this.scene.add(this.lightAmbient);

		this.lightDirectional = new THREE.DirectionalLight(0xffffff, 1);
		this.lightDirectional.shadow.mapSize.width = 2048; // default 512
		this.lightDirectional.shadow.mapSize.height = 2048;
		this.lightDirectional.castShadow = true;
		this.scene.add(this.lightDirectional);

		// this.lightPoint = new THREE.PointLight(0xffffff, 0.5);
		// this.lightPoint.position = new THREE.Vector3(0, 0, 1);
		// this.camera.add(this.lightPoint);
		this.scene.add(this.camera);

		this.axesHelper = new THREE.AxesHelper(50);
		this.scene.add(this.axesHelper);

		this.readXMLFile();
	};

	// Here should come custom code.
	// Code below is taken from Three.js BoxGeometry example
	// https://threejs.org/docs/#api/en/geometries/BoxGeometry
	// addCustomSceneObjects = () => {
	// 	const geometry = new THREE.BoxGeometry(2, 2, 2);
	// 	const material = new THREE.MeshPhongMaterial({
	// 		color: 0x156289,
	// 		emissive: 0x072534,
	// 		side: THREE.DoubleSide,
	// 		flatShading: true
	// 	});
	// 	this.cube = new THREE.Mesh(geometry, material);
	// 	this.scene.add(this.cube);

	// 	const lights = [];
	// 	lights[0] = new THREE.PointLight(0xffffff, 1, 0);
	// 	lights[1] = new THREE.PointLight(0xffffff, 1, 0);
	// 	lights[2] = new THREE.PointLight(0xffffff, 1, 0);

	// 	lights[0].position.set(0, 200, 0);
	// 	lights[1].position.set(100, 200, 100);
	// 	lights[2].position.set(-100, -200, -100);

	// 	this.scene.add(lights[0]);
	// 	this.scene.add(lights[1]);
	// 	this.scene.add(lights[2]);
	// };

	startAnimationLoop = () => {
		this.renderer.render(this.scene, this.camera);

		// The window.requestAnimationFrame() method tells the browser that you wish to perform
		// an animation and requests that the browser call a specified function
		// to update an animation before the next repaint
		this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
		this.controls.update();
	};

	handleWindowResize = () => {
		const width = this.el.clientWidth;
		const height = this.el.clientHeight;

		this.renderer.setSize(width, height);
		this.camera.aspect = width / height;

		// Note that after making changes to most of camera properties you have to call
		// .updateProjectionMatrix for the changes to take effect.
		this.camera.updateProjectionMatrix();
	};

	readXMLFile = async () => {
		const { data } = await http.get("assets/OfficeBuilding.xml");
		const { gbXML } = convert.xml2js(data, { compact: true, space: 4 });
		this.addCustomSceneObjects(gbXML);
	};

	addCustomSceneObjects = gb => {
		const surfaces = gb.Campus.Surface;

		let polyloops = [];
		let openings = [];

		var selectedPart = "InteriorWall";
		var selectedColor = colors.Roof;

		for (let surface of surfaces) {
			console.log("surface", surface);
			//if (surface.surfaceType === selectedPart) {
			console.log(surface._attributes.surfaceType);
			if (surface.Opening) {
				if (surface.Opening.PlanarGeometry) {
					const polyloop = surface.Opening.PlanarGeometry.PolyLoop;
					const points = this.getPoints(polyloop);
					openings.push([points]);
				} else {
					let arr = [];

					for (let opening of surface.Opening) {
						const polyloop = opening.PlanarGeometry.PolyLoop;
						const points = this.getPoints(polyloop);
						arr.push(points);
					}

					openings.push(arr);
				}
			} else {
				openings.push([]);
			}

			const polyloop = surface.PlanarGeometry.PolyLoop;
			const points = this.getPoints(polyloop);
			polyloops.push(points);
		}
		this.scene.remove(this.campusSurfaces);

		// Create Object 3D
		this.campusSurfaces = new THREE.Object3D();

		for (let i = 0; i < polyloops.length; i++) {
			let material = new THREE.MeshBasicMaterial({
				color: colors[surfaces[i]._attributes.surfaceType],
				side: 2,
				opacity: 1,
				transparent: true
			});
			// if (surfaces[i].surfaceType !== selectedPart) {
			// 	material = new THREE.MeshBasicMaterial({
			// 		color: "#555", //colors[surfaces[i].surfaceType],
			// 		side: 2,
			// 		opacity: 0.2,
			// 		transparent: true
			// 	});
			// }

			const shape = this.drawShapeSinglePassObjects(
				polyloops[i],
				material,
				openings[i]
			);
			this.campusSurfaces.add(shape);
		}

		this.scene.add(this.campusSurfaces);

		// Change Camera Zoom and Position to fit Object to Screen
		this.zoomObjectBoundingSphere(this.campusSurfaces);
	};

	getPoints = polyloop => {
		let points = [];

		for (let CartesianPoint of polyloop.CartesianPoint) {
			const CartesianPointCoordinateArray = CartesianPoint.Coordinate.map(
				obj => obj._text
			);
			const point = new THREE.Vector3().fromArray(
				CartesianPointCoordinateArray
			);
			points.push(point);
		}
		return points;
	};

	drawShapeSinglePassObjects = (vertices, material, holes) => {
		const plane = new THREE.Plane().setFromCoplanarPoints(
			vertices[0],
			vertices[1],
			vertices[2]
		);

		const obj = new THREE.Object3D();
		obj.lookAt(plane.normal);

		const obj2 = new THREE.Object3D();
		obj2.quaternion.copy(obj.clone().quaternion.conjugate());
		obj2.updateMatrixWorld(true);

		for (let vertex of vertices) {
			obj2.localToWorld(vertex);
		}

		const shape = new THREE.Shape(vertices);

		shape.autoClose = true;

		for (let verticesHoles of holes) {
			for (let vertex of verticesHoles) {
				obj2.localToWorld(vertex);
			}

			const hole = new THREE.Path();
			hole.setFromPoints(verticesHoles);
			shape.holes.push(hole);
		}

		const geometryShape = new THREE.ShapeGeometry(shape);

		let shapeMesh = new THREE.Mesh(geometryShape, material);
		shapeMesh.quaternion.copy(obj.quaternion);
		shapeMesh.position.copy(plane.normal.multiplyScalar(-plane.constant));

		return shapeMesh;
	};

	zoomObjectBoundingSphere = obj => {
		let center;
		let radius;
		if (obj.geometry) {
			console.log(1);
			// might not be necessary

			obj.geometry.computeBoundingSphere();
			center = obj.geometry.boundingSphere.center;
			radius = obj.geometry.boundingSphere.radius;
		} else {
			console.log("this.campusSurfaces", this.campusSurfaces);
			const bbox = new THREE.Box3().setFromObject(this.campusSurfaces);
			console.log("bbox", bbox);
			let sphere = new THREE.Sphere();
			bbox.getBoundingSphere(sphere);
			center = sphere.center;
			radius = sphere.radius;
		}

		obj.userData.center = center;
		obj.userData.radius = radius;

		this.controls.target.copy(center);
		this.controls.maxDistance = 5 * radius;

		this.camera.position.copy(
			center
				.clone()
				.add(
					new THREE.Vector3(1.0 * radius, -1.0 * radius, 1.0 * radius)
				)
		);
		this.axesHelper.position.copy(center);

		this.camera.far = 10 * radius;
		this.camera.updateProjectionMatrix();

		this.lightDirectional.position.copy(
			center
				.clone()
				.add(
					new THREE.Vector3(1.5 * radius, 1.5 * radius, 1.5 * radius)
				)
		);

		this.lightDirectional.shadow.camera.scale.set(
			0.2 * radius,
			0.2 * radius,
			0.01 * radius
		);

		this.lightDirectional.target = this.axesHelper;
	};

	render() {
		return <div style={style} ref={ref => (this.el = ref)} />;
	}
}

export default App;
