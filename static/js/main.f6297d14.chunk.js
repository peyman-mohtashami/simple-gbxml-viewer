(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{44:function(e,n,t){e.exports=t(84)},49:function(e,n,t){},71:function(e,n){},73:function(e,n){},84:function(e,n,t){"use strict";t.r(n);var r=t(6),a=t.n(r),o=t(35),i=t.n(o),c=(t(49),t(18)),s=t.n(c),l=t(36),u=t(37),d=t(38),p=t(42),h=t(39),m=t(43),f=t(0),v=t(40),w=t(4),y=t.n(w);y.a.interceptors.response.use(null,function(e){return e.response&&e.response.status>=400&&e.response.status<500?console.log("Expected error occured.",e.response):console.log("Unexpected error occured.",e),Promise.reject(e)});var g={get:y.a.get,post:y.a.post,put:y.a.put,delete:y.a.delete,setJwt:function(e){y.a.defaults.headers.common["x-auth-token"]=e}},S=t(41),b=t.n(S),x={height:"100vh",overflow:"hidden"},j={InteriorWall:10178319,ExteriorWall:9249551,Roof:1983308,InteriorFloor:4944967,Shade:13213200,SlabOnGrade:9353795},O=function(e){function n(){var e,t;Object(u.a)(this,n);for(var r=arguments.length,a=new Array(r),o=0;o<r;o++)a[o]=arguments[o];return(t=Object(p.a)(this,(e=Object(h.a)(n)).call.apply(e,[this].concat(a)))).sceneSetup=function(){var e=t.el.clientWidth,n=t.el.clientHeight;t.scene=new f.n,t.camera=new f.k(60,e/n,1,1e4),t.camera.up.set(0,0,1),t.controls=new v.a(t.camera,t.el),t.renderer=new f.v({alpha:1,antialias:!0}),t.renderer.setSize(e,n),t.el.appendChild(t.renderer.domElement),t.lightAmbient=new f.a(4473924),t.scene.add(t.lightAmbient),t.lightDirectional=new f.d(16777215,1),t.lightDirectional.shadow.mapSize.width=2048,t.lightDirectional.shadow.mapSize.height=2048,t.lightDirectional.castShadow=!0,t.scene.add(t.lightDirectional),t.scene.add(t.camera),t.axesHelper=new f.b(50),t.scene.add(t.axesHelper),t.readXMLFile()},t.startAnimationLoop=function(){t.renderer.render(t.scene,t.camera),t.requestID=window.requestAnimationFrame(t.startAnimationLoop),t.controls.update()},t.handleWindowResize=function(){var e=t.el.clientWidth,n=t.el.clientHeight;t.renderer.setSize(e,n),t.camera.aspect=e/n,t.camera.updateProjectionMatrix()},t.readXMLFile=Object(l.a)(s.a.mark(function e(){var n,r,a,o;return s.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,g.get("assets/OfficeBuilding.xml");case 2:n=e.sent,r=n.data,a=b.a.xml2js(r,{compact:!0,space:4}),o=a.gbXML,t.addCustomSceneObjects(o);case 6:case"end":return e.stop()}},e)})),t.addCustomSceneObjects=function(e){var n=e.Campus.Surface,r=[],a=[],o=(j.Roof,!0),i=!1,c=void 0;try{for(var s,l=n[Symbol.iterator]();!(o=(s=l.next()).done);o=!0){var u=s.value;if(console.log("surface",u),console.log(u._attributes.surfaceType),u.Opening)if(u.Opening.PlanarGeometry){var d=u.Opening.PlanarGeometry.PolyLoop,p=t.getPoints(d);a.push([p])}else{var h=[],m=!0,v=!1,w=void 0;try{for(var y,g=u.Opening[Symbol.iterator]();!(m=(y=g.next()).done);m=!0){var S=y.value.PlanarGeometry.PolyLoop,b=t.getPoints(S);h.push(b)}}catch(z){v=!0,w=z}finally{try{m||null==g.return||g.return()}finally{if(v)throw w}}a.push(h)}else a.push([]);var x=u.PlanarGeometry.PolyLoop,O=t.getPoints(x);r.push(O)}}catch(z){i=!0,c=z}finally{try{o||null==l.return||l.return()}finally{if(i)throw c}}t.scene.remove(t.campusSurfaces),t.campusSurfaces=new f.i;for(var P=0;P<r.length;P++){var W=new f.h({color:j[n[P]._attributes.surfaceType],side:2,opacity:1,transparent:!0}),D=t.drawShapeSinglePassObjects(r[P],W,a[P]);t.campusSurfaces.add(D)}t.scene.add(t.campusSurfaces),t.zoomObjectBoundingSphere(t.campusSurfaces)},t.getPoints=function(e){var n=[],t=!0,r=!1,a=void 0;try{for(var o,i=e.CartesianPoint[Symbol.iterator]();!(t=(o=i.next()).done);t=!0){var c=o.value.Coordinate.map(function(e){return e._text}),s=(new f.u).fromArray(c);n.push(s)}}catch(l){r=!0,a=l}finally{try{t||null==i.return||i.return()}finally{if(r)throw a}}return n},t.drawShapeSinglePassObjects=function(e,n,t){var r=(new f.l).setFromCoplanarPoints(e[0],e[1],e[2]),a=new f.i;a.lookAt(r.normal);var o=new f.i;o.quaternion.copy(a.clone().quaternion.conjugate()),o.updateMatrixWorld(!0);var i=!0,c=!1,s=void 0;try{for(var l,u=e[Symbol.iterator]();!(i=(l=u.next()).done);i=!0){var d=l.value;o.localToWorld(d)}}catch(L){c=!0,s=L}finally{try{i||null==u.return||u.return()}finally{if(c)throw s}}var p=new f.o(e);p.autoClose=!0;var h=!0,m=!1,v=void 0;try{for(var w,y=t[Symbol.iterator]();!(h=(w=y.next()).done);h=!0){var g=w.value,S=!0,b=!1,x=void 0;try{for(var j,O=g[Symbol.iterator]();!(S=(j=O.next()).done);S=!0){var P=j.value;o.localToWorld(P)}}catch(L){b=!0,x=L}finally{try{S||null==O.return||O.return()}finally{if(b)throw x}}var W=new f.j;W.setFromPoints(g),p.holes.push(W)}}catch(L){m=!0,v=L}finally{try{h||null==y.return||y.return()}finally{if(m)throw v}}var D=new f.p(p),z=new f.g(D,n);return z.quaternion.copy(a.quaternion),z.position.copy(r.normal.multiplyScalar(-r.constant)),z},t.zoomObjectBoundingSphere=function(e){var n,r;if(e.geometry)console.log(1),e.geometry.computeBoundingSphere(),n=e.geometry.boundingSphere.center,r=e.geometry.boundingSphere.radius;else{console.log("this.campusSurfaces",t.campusSurfaces);var a=(new f.c).setFromObject(t.campusSurfaces);console.log("bbox",a);var o=new f.q;a.getBoundingSphere(o),n=o.center,r=o.radius}e.userData.center=n,e.userData.radius=r,t.controls.target.copy(n),t.controls.maxDistance=5*r,t.camera.position.copy(n.clone().add(new f.u(1*r,-1*r,1*r))),t.axesHelper.position.copy(n),t.camera.far=10*r,t.camera.updateProjectionMatrix(),t.lightDirectional.position.copy(n.clone().add(new f.u(1.5*r,1.5*r,1.5*r))),t.lightDirectional.shadow.camera.scale.set(.2*r,.2*r,.01*r),t.lightDirectional.target=t.axesHelper},t}return Object(m.a)(n,e),Object(d.a)(n,[{key:"componentDidMount",value:function(){this.sceneSetup(),this.startAnimationLoop(),window.addEventListener("resize",this.handleWindowResize),window.addEventListener("orientationchange",this.handleWindowResize,!1)}},{key:"componentWillUnmount",value:function(){window.removeEventListener("resize",this.handleWindowResize),window.removeEventListener("orientationchange",this.handleWindowResize,!1),window.cancelAnimationFrame(this.requestID),this.controls.dispose()}},{key:"render",value:function(){var e=this;return a.a.createElement("div",{style:x,ref:function(n){return e.el=n}})}}]),n}(r.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));i.a.render(a.a.createElement(O,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[44,1,2]]]);
//# sourceMappingURL=main.f6297d14.chunk.js.map