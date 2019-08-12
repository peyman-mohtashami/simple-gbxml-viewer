import React, { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import http from "./services/httpService";
import convert from "xml-js";

const style = {
	height: "100vh", // we can control scene size by setting container dimensions
	overflow: "hidden"
};

const colors = {
	InteriorWall: 0xff0000, //0x9b4f0f,
	ExteriorWall: 0x0000ff, //0x8d230f,
	Roof: 0x00ff00, //0x1e434c,
	InteriorFloor: 0xffff00, //0x4b7447,
	//ExposedFloor: 0x40b4ff,
	Shade: 0xff00ff, //0xc99e10,
	//UndergroundWall: 0xa55200,
	//UndergroundSlab: 0x804000,
	//Ceiling: 0xff8080,
	//Air: 0xffff00,
	//UndergroundCeiling: 0x408080,
	//RaisedFloor: 0x4b417d,
	SlabOnGrade: 0x555555 //0x8eba43
	//FreestandingColumn: 0x808080,
	//EmbeddedColumn: 0x80806e
};

class App extends Component {
	componentDidMount() {
		this.sceneSetup();
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
			100, // fov = field of view
			width / height, // aspect ratio
			1, // near plane
			10000 // far plane
		);
		this.camera.up.set(0, 0, 1);

		// OrbitControls allow a camera to orbit around the object
		// https://threejs.org/docs/#examples/controls/OrbitControls
		this.controls = new OrbitControls(this.camera, this.el);
		this.renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true
		});
		this.renderer.setSize(width, height);
		this.el.appendChild(this.renderer.domElement);

		// Create Global Ambient Light, Light Direction and Light Point
		this.lightAmbient = new THREE.AmbientLight(0x999999);
		this.scene.add(this.lightAmbient);

		this.lightDirectional = new THREE.DirectionalLight(0xffffff, 1);
		this.lightDirectional.position.set(1, 0, 1);
		this.lightDirectional.shadow.mapSize.width = 2048; // default 512
		this.lightDirectional.shadow.mapSize.height = 2048;
		this.lightDirectional.castShadow = true;
		this.scene.add(this.lightDirectional);

		this.lightPoint = new THREE.PointLight(0xffffff, 0.5);
		// this.lightPoint.position = new THREE.Vector3(0, 0, 1);
		this.camera.add(this.lightPoint);
		this.scene.add(this.camera);

		this.axesHelper = new THREE.AxesHelper(200);
		this.scene.add(this.axesHelper);

		this.readXMLFile();
	};

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

		for (let surface of surfaces) {
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
			let material = new THREE.MeshPhongMaterial({
				color: colors[surfaces[i]._attributes.surfaceType],
				emissive: 0x000000,
				side: THREE.DoubleSide,
				flatShading: true
			});

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
				obj => parseFloat(obj._text)
			);
			const point = new THREE.Vector3().fromArray(
				CartesianPointCoordinateArray
			);
			points.push(point);
		}
		return points;
	};

	drawShapeSinglePassObjects = (vertices, material, holes) => {
		// Make a shape from vertices
		// Because shape is 2D object, we can only define shapes only in x-y plane
		// So to define a shape in e.g. x-z plane we need to do some calculations to map it in x-y plane

		// Because surface is planar, so make a plane from three points of surface
		const plane = new THREE.Plane().setFromCoplanarPoints(
			vertices[0],
			vertices[1],
			vertices[2]
		);

		// make an object and rotates the object to face a point in world space. Point is normal vector of plane (surface)
		// obj is parallel to surface, so, normal of obj and plane should be the same
		const obj = new THREE.Object3D();
		obj.lookAt(plane.normal);

		// make another object and rotates the object to conjugate quaternion of plane (surface)
		const objQuaternionConjugate = new THREE.Object3D();
		objQuaternionConjugate.quaternion.copy(
			obj.clone().quaternion.conjugate()
		);
		objQuaternionConjugate.updateMatrixWorld(true);

		// Converts the vector from local space to world space.
		// Rotate each point of surface
		// f(p) = q.p.q^-1
		// https://eater.net/quaternions/video/intro
		for (let vertex of vertices) {
			objQuaternionConjugate.localToWorld(vertex);
		}
		// Now vertices are in x-y plane and we can use shape to draw it

		const shape = new THREE.Shape(vertices);
		shape.autoClose = true;

		for (let verticesHoles of holes) {
			for (let vertex of verticesHoles) {
				objQuaternionConjugate.localToWorld(vertex);
			}

			const hole = new THREE.Path();
			hole.setFromPoints(verticesHoles);
			shape.holes.push(hole);
		}

		const geometryShape = new THREE.ShapeGeometry(shape);

		let shapeMesh = new THREE.Mesh(geometryShape, material);
		// back to original direction
		shapeMesh.quaternion.copy(obj.quaternion);
		// if don't do that all surfaces are on each other
		shapeMesh.position.copy(plane.normal.multiplyScalar(-plane.constant));

		return shapeMesh;
	};

	zoomObjectBoundingSphere = obj => {
		// Define boundingBox
		const boundingBox = new THREE.Box3().setFromObject(obj);
		const sphere = new THREE.Sphere();
		boundingBox.getBoundingSphere(sphere);
		const center = sphere.center;
		const radius = sphere.radius;

		// Modify controls if want to control rotation on the object not on axes
		this.controls.target.copy(center);
		this.controls.maxDistance = 5 * radius;

		// Modify camera to look at object
		this.camera.position.copy(
			center
				.clone()
				.add(
					new THREE.Vector3(1.0 * radius, -1.0 * radius, 1.0 * radius)
				)
		);
		this.camera.far = 10 * radius;
		this.camera.updateProjectionMatrix();

		// Modify axesHelper if want to position origin of axesHelper in center of the object
		//this.axesHelper.position.copy(center);

		// Modify lightDirectional position
		// this.lightDirectional.position.copy(
		// 	center
		// 		.clone()
		// 		.add(
		// 			new THREE.Vector3(1.5 * radius, 1.5 * radius, 1.5 * radius)
		// 		)
		// );

		// this.lightDirectional.shadow.camera.scale.set(
		// 	0.2 * radius,
		// 	0.2 * radius,
		// 	0.01 * radius
		// );

		// this.lightDirectional.target = this.axesHelper;
	};

	render() {
		return <div style={style} ref={ref => (this.el = ref)} />;
	}
}

export default App;
