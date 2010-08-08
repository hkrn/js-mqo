/*
 The MIT License

 Copyright (c) 2009 hkrn
 Copyright (c) 2009 Sunao Hashimoto and Keisuke Konishi

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

// <html>
// <head>
// <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>
// <script type="text/javascript" src="./lib/sylvester.js"></script>
// <script type="text/javascript" src="./lib/glUtils.js"></script>
// <script type="text/javascript" src="./lib/webgl-debug.js"></script>
// <script type="text/javascript" src="./metasequoia.js"></script>
// <script id="textureFragmentShader" type="x-shader/x-fragment">
// #ifdef GL_ES
// percision highp float;
// #endif
// uniform sampler2D sampler;
// varying vec2 textureCoord;
// void main(void) {
//   gl_FragColor = texture2D(sampler, vec2(textureCoord.s, textureCoord.t));
// }
// </script>
// <script id="textureVertexShader" type="x-shader/x-vertex">
// attribute vec2 vertexTextureCoord;
// attribute vec3 vertexNormal;
// attribute vec3 vertexPosition;
// uniform mat4 modelViewMatrix;
// uniform mat4 perspectiveMatrix;
// varying vec2 textureCoord;
// void main(void) {
//   vec4 modelViewPosition = modelViewMatrix * vec4(vertexPosition, 1.0);
//   gl_Position = perspectiveMatrix * modelViewPosition;
//   textureCoord = vertexTextureCoord;
// }
// </script>
// <script id="polygonFragmentShader" type="x-shader/x-fragment">
// #ifdef GL_ES
// percision highp float;
// #endif
// //uniform vec4 color;
// uniform sampler2D sampler;
// uniform vec4 color;
// void main(void) {
//   gl_FragColor = color;
// }
// </script>
// <script id="polygonVertexShader" type="x-shader/x-vertex">
// attribute vec3 vertexNormal;
// attribute vec3 vertexPosition;
// uniform mat4 modelViewMatrix;
// uniform mat4 perspectiveMatrix;
// void main(void) {
//   vec4 modelViewPosition = modelViewMatrix * vec4(vertexPosition, 1.0);
//   gl_Position = perspectiveMatrix * modelViewPosition;
// }
// </script>
// <script type="text/javascript">
// var f = [ "../dir", "file.mqo" ];
// var URL = f[0] + "/" + f[1];
// function onLoad() {
//   $.get(URL, function(data) {
//     var canvas = document.getElementById("webgl");
//     var parser = new metasequoia.Parser(canvas, f[0], data);
//     var renderer = parser.parse();
//     console.log("Parse succeeded");
//     renderer.initialize(
//       $("#polygonFragmentShader").text(),
//       $("#polygonVertexShader").text(),
//       $("#textureFragmentShader").text(),
//       $("#textureVertexShader").text()
//     );
//     console.log("Renderer initialized");
//     setInterval(function(){ renderer.render(); }, 100);
// 	   console.log("Render started");
//   });
// }
// </script>
// </head>
// <body onload="onLoad()">
// <canvas id="webgl" width="320" height="480"></canvas>
// </body>
// </html>
var metasequoia = {};

/**
 * @constructor
 */
metasequoia.Point2D = function() {
	this.x = 0.0;
	this.y = 0.0;
};
metasequoia.Point2D.prototype = {
	"x" : 0.0,
	"y" : 0.0,
	"set" : function(point) {
		this.x = point.x;
		this.y = point.y;
	}
};

/**
 * @constructor
 */
metasequoia.Point3D = function() {
	this.x = 0.0;
	this.y = 0.0;
	this.z = 0.0;
};
metasequoia.Point3D.normalize = function(a, b, c) {
	var v0 = a.subtract(b);
	var v1 = c.subtract(b);
	var x = v0.y * v1.z - v0.z * v1.y;
	var y = v0.z * v1.x - v0.x * v1.z;
	var z = v0.x * v1.y - v0.y * v1.x;
	var n = Math.sqrt(x * x + y * y + z * z);
	var newPoint = new this();
	if (n != 0) {
		newPoint.x = x / n;
		newPoint.y = y / n;
		newPoint.z = z / n;
	}
	return newPoint;
};
metasequoia.Point3D.prototype = {
	"x" : 0.0,
	"y" : 0.0,
	"z" : 0.0,
	"set" : function(point) {
		this.x = point.x;
		this.y = point.y;
		this.z = point.z;
	},
	"setMin" : function(point) {
		this.x = this.x > point.x ? point.x : this.x;
		this.y = this.y > point.y ? point.y : this.y;
		this.z = this.z > point.z ? point.z : this.z;
	},
	"setMax" : function(point) {
		this.x = this.x < point.x ? point.x : this.x;
		this.y = this.y < point.y ? point.y : this.y;
		this.z = this.z < point.z ? point.z : this.z;
	},
	"addition" : function(point) {
		var newPoint = new metasequoia.Point3D();
		newPoint.x = this.x + point.x;
		newPoint.y = this.y + point.y;
		newPoint.z = this.z + point.z;
		return newPoint;
	},
	"subtract" : function(point) {
		var newPoint = new metasequoia.Point3D();
		newPoint.x = this.x - point.x;
		newPoint.y = this.y - point.y;
		newPoint.z = this.z - point.z;
		return newPoint;
	},
	"multiply" : function(point) {
		var newPoint = new metasequoia.Point3D();
		newPoint.x = this.x * point.x;
		newPoint.y = this.y * point.y;
		newPoint.z = this.z * point.z;
		return newPoint;
	},
	"divideOne" : function(n) {
		var newPoint = new metasequoia.Point3D();
		newPoint.x = this.x / n;
		newPoint.y = this.y / n;
		newPoint.z = this.z / n;
		return newPoint;
	},
	"acos" : function(p) {
		return Math.acos(this.x * p.x + this.y * p.y + this.z * p.z);
	},
	"sqrt" : function() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}
};

/**
 * @constructor
 */
metasequoia.Face = function() {
	this.uv = [ new metasequoia.Point2D(), new metasequoia.Point2D(),
			new metasequoia.Point2D(), new metasequoia.Point2D() ];
	this.vertexIndexSize = 0;
	this.vertex = [ 0, 0, 0, 0 ];
	this.materialIndex = 0;
	this.color = 0;
};
metasequoia.Face.prototype = {
	"uv" : [ new metasequoia.Point2D() ],
	"vertexIndexSize" : 0,
	"vertex" : [ 0 ],
	"materialIndex" : 0,
	"color" : 0
};

/**
 * @constructor
 */
metasequoia.TextureVertex = function() {
	this.point = new metasequoia.Point3D();
	this.normal = new metasequoia.Point3D();
	this.uv = new metasequoia.Point2D();
};
metasequoia.TextureVertex.prototype = {
	"point" : new metasequoia.Point3D(),
	"normal" : new metasequoia.Point3D(),
	"uv" : new metasequoia.Point2D(),
	"set" : function(facet, a, b, c, uv) {
		this.point.set(a);
		this.uv.set(uv);
		var s = b.acos(c);
		if (facet < s) {
			this.normal.set(b);
		} else {
			this.normal.set(c);
		}
	}
};

/**
 * @constructor
 */
metasequoia.PolygonVertex = function() {
	this.point = new metasequoia.Point3D();
	this.normal = new metasequoia.Point3D();
};
metasequoia.PolygonVertex.prototype = {
	"point" : new metasequoia.Point3D(),
	"normal" : new metasequoia.Point3D(),
	"set" : function(facet, a, b, c) {
		this.point.set(a);
		var s = b.acos(c);
		if (facet < s) {
			this.normal.set(b);
		} else {
			this.normal.set(c);
		}
	}
};

/**
 * @constructor
 */
metasequoia.MaterialVertex = function() {
	var _point = [];
	var _normal = [];
	var _uv = [];
	this.texture = null;
	this.polygon = null;
	this.vertexCount = 0;
	this.allocate = function(hasTexture) {
		var count = this.vertexCount;
		_point = new Array(count * 3);
		_normal = new Array(count * 3);
		if (hasTexture) {
			_uv = new Array(count << 1);
			this.texture = new Array(count);
			for ( var i = 0; i < count; i++) {
				this.texture[i] = new metasequoia.TextureVertex();
			}
		} else {
			this.polygon = new Array(count);
			for ( var i = 0; i < count; i++) {
				this.polygon[i] = new metasequoia.PolygonVertex();
			}
		}
	};
	this.fillVertices = function(hasTexture) {
		var len = 0;
		if (hasTexture) {
			len = this.texture.length;
			for ( var i = 0; i < len; i++) {
				var texture = this.texture[i];
				var p = texture.point;
				var n = texture.normal;
				var u = texture.uv;
				_point.push(p.x, p.y, p.z);
				_normal.push(n.x, n.y, n.z);
				_uv.push(u.x, u.y);
			}
		} else {
			len = this.polygon.length;
			for ( var i = 0; i < len; i++) {
				var polygon = this.polygon[i];
				var p = polygon.point;
				var n = polygon.normal;
				_point.push(p.x, p.y, p.z);
				_normal.push(n.x, n.y, n.z);
			}
		}
	};
	this.getPoint = function() {
		return _point;
	};
	this.getNormal = function() {
		return _normal;
	};
	this.getUV = function() {
		return _uv;
	};
};
metasequoia.MaterialVertex.prototype = {
	"texture" : [ new metasequoia.TextureVertex() ],
	"polygon" : [ new metasequoia.PolygonVertex() ],
	"vertexCount" : 0,
	"allocate" : function(hasTexture) {
	},
	"fillVertices" : function(hasTexture) {
	},
	"getPoint" : function() {
		return [ 0 ];
	},
	"getNormal" : function() {
		return [ 0 ];
	},
	"getUV" : function() {
		return [ 0 ];
	}
};

/**
 * @constructor
 */
metasequoia.Scene = function() {
	this.ambient = [ 0.0, 0.0, 0.0 ];
	this.position = [ 0.0, 0.0, 0.0 ];
	this.lookAt = [ 0.0, 0.0, 0.0 ];
	this.head = 0.0;
	this.pich = 0.0;
	this.ortho = 0.0;
	this.zoom2 = 0.0;
};
metasequoia.Scene.prototype = {
	"ambient" : [ 0.0 ],
	"position" : [ 0.0 ],
	"lookAt" : [ 0.0 ],
	"head" : 0.0,
	"pich" : 0.0,
	"ortho" : 0.0,
	"zoom2" : 0.0
};

/**
 * @constructor
 */
metasequoia.Material = function(url) {
	var _cached = {};
	var _url = url;
	var _texture = null;
	this.name = "";
	this.color = [ 0.0, 0.0, 0.0, 0.0 ];
	this.diffuse = [ 0.0, 0.0, 0.0, 0.0 ];
	this.ambient = [ 0.0, 0.0, 0.0, 0.0 ];
	this.emission = [ 0.0, 0.0, 0.0, 0.0 ];
	this.specular = [ 0.0, 0.0, 0.0, 0.0 ];
	this.projectionPosition = [ 0.0, 0.0, 0.0 ];
	this.projectionScale = [ 0.0, 0.0, 0.0 ];
	this.projectionAngle = [ 0.0, 0.0, 0.0 ];
	this.power = 0.0;
	this.projectionType = 0;
	this.texturePath = "";
	this.alphaTexturePath = "";
	this.bumpTexturePath = "";
	this.loadTexture = function(gl) {
		var url = _url + "/" + this.texturePath;
		if (!_cached[url]) {
			_cached[url] = true;
			_texture = gl.createTexture();
			_texture.image = new Image();
			_texture.image.src = url;
			_texture.image.onload = function() {
				gl.bindTexture(gl.TEXTURE_2D, _texture);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
						gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,
						gl.LINEAR);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB,
						gl.UNSIGNED_BYTE, _texture.image);
				gl.bindTexture(gl.TEXTURE_2D, null);
			};
		}
	};
	this.getTexture = function() {
		return _texture;
	};
	this.hasTexture = function() {
		return this.texturePath.length > 0;
	};
};
metasequoia.Material.prototype = {
	"name" : "",
	"color" : [ 0.0 ],
	"diffuse" : [ 0.0 ],
	"ambient" : [ 0.0 ],
	"emission" : [ 0.0 ],
	"specular" : [ 0.0 ],
	"projectionPosition" : [ 0.0 ],
	"projectionScale" : [ 0.0 ],
	"projectionAngle" : [ 0.0 ],
	"power" : 0.0,
	"projectionType" : 0,
	"texturePath" : "",
	"alphaTexturePath" : "",
	"bumpTexturePath" : "",
	"loadTextures" : function() {
	},
	"getTexture" : function() {
		return _texture;
	},
	"hasTexture" : function() {
		return true;
	}
};

/**
 * @constructor
 */
metasequoia.Object = function(name) {
	this.name = name || "null";
	this.minVertex = new metasequoia.Point3D();
	this.maxVertex = new metasequoia.Point3D();
	this.vertices = [];
	this.materialVertices = [];
	this.faces = [];
	this.vertexSize = 0;
	this.materialVertexSize = 0;
	this.faceSize = 0;
	this.depth = 0;
	this.folding = 0;
	this.scale = [ 0.0, 0.0, 0.0 ];
	this.rotation = [ 0.0, 0.0, 0.0 ];
	this.translation = [ 0.0, 0.0, 0.0 ];
	this.patch = 0;
	this.segment = 0;
	this.visible = 0;
	this.locking = 0;
	this.shading = 0;
	this.facet = 0.0;
	this.color = [ 0.0, 0.0, 0.0 ];
	this.colorType = 0;
	this.mirror = 0;
	this.mirrorAxis = 0;
	this.mirrorDistance = 0.0;
	this.lathe = 0;
	this.latheAxis = 0;
	this.latheSegment = 0;
	this.create = function(gl, materials) {
		var materialSize = materials.length;
		var materialVertices = new Array(materialSize);
		var normalizedVertices = this.normalizeVertices();
		var faceSize = this.faceSize;
		var i = 0;
		for (i = 0; i < materialSize; i++) {
			materialVertices[i] = 0;
		}
		for (i = 0; i < faceSize; i++) {
			var face = this.faces[i];
			var materialIndex = face.materialIndex;
			if (materialIndex < 0 || materialIndex > materialSize) {
				continue;
			}
			if (face.vertexIndexSize == 3) {
				materialVertices[materialIndex] += 3;
			} else if (face.vertexIndexSize == 4) {
				materialVertices[materialIndex] += 6;
			}
		}
		for (i = 0; i < materialSize; i++) {
			this.materialVertices[i] = new metasequoia.MaterialVertex();
		}
		for (i = 0; i < materialSize; i++) {
			var material = materials[i];
			var materialVertex = this.materialVertices[i];
			var vertexCount = materialVertices[i];
			if (vertexCount <= 0)
				continue;
			var hasTexture = material.hasTexture();
			if (hasTexture)
				material.loadTexture(gl);
			materialVertex.vertexCount = vertexCount;
			materialVertex.allocate(hasTexture);
			this.createVerticesFromMaterial(materialVertex, i,
					normalizedVertices, hasTexture);
			var vertices = [];
			if (material.hasTexture()) {
				vertices = materialVertex.texture;
			} else {
				vertices = materialVertex.polygon;
			}
			if (i == 0) {
				var point = vertices[0].point;
				this.minVertex.set(point);
				this.maxVertex.set(point);
			}
			for ( var j = 0; j < vertexCount; j++) {
				var point = vertices[j].point;
				this.minVertex.setMin(point);
				this.maxVertex.setMax(point);
			}
			materialVertex.fillVertices(hasTexture);
		}
	};
	this.createVerticesFromMaterial = function(vertexMaterial, materialIndex,
			normalizedVertices, hasTexture) {
		var vertices = this.vertices;
		var facet = this.facet;
		var dpos = 0, j = 0;
		var initAndSetVertex = null;
		if (hasTexture) {
			var texture = vertexMaterial.texture;
			initAndSetVertex = function(j, face) {
				var t = texture[dpos];
				var uv = face.uv[j];
				var point = vertices[v[j]];
				var n2 = normalizedVertices[v[j]];
				t.set(face, point, n, n2, uv);
				++dpos;
			};
		} else {
			var polygon = vertexMaterial.polygon;
			initAndSetVertex = function(j, face) {
				var p = polygon[dpos];
				var point = vertices[v[j]];
				var n2 = normalizedVertices[v[j]];
				p.set(face, point, n, n2);
				++dpos;
			};
		}
		for ( var i = 0, faceSize = this.faceSize; i < faceSize; i++) {
			var face = this.faces[i];
			if (face.materialIndex != materialIndex)
				continue;
			var v = face.vertex;
			var a = vertices[v[0]];
			var b = vertices[v[1]];
			var c = vertices[v[2]];
			var n = metasequoia.Point3D.normalize(a, b, c);
			if (face.vertexIndexSize == 3) {
				for (j = 0; j < 3; j++) {
					initAndSetVertex(j, face);
				}
			} else if (face.vertexIndexSize == 4) {
				for (j = 0; j < 3; j++) {
					initAndSetVertex(j, face);
				}
				var d = vertices[v[3]];
				n = metasequoia.Point3D.normalize(a, c, d);
				for (j = 0; j < 4; j++) {
					if (j == 1)
						continue;
					initAndSetVertex(j, face);
				}
			}
		}
	};
	this.normalizeVertices = function() {
		var vertexSize = this.vertexSize;
		var vertices = this.vertices;
		var ret = new Array(vertexSize);
		var i = 0, j = 0, faceSize = this.faceSize;
		for (i = 0; i < vertexSize; i++) {
			ret[i] = new metasequoia.Point3D();
		}
		for (i = 0; i < faceSize; i++) {
			var face = this.faces[i];
			var a = vertices[face.vertex[0]];
			var b = vertices[face.vertex[1]];
			var c = vertices[face.vertex[2]];
			var n = metasequoia.Point3D.normalize(a, b, c);
			if (face.vertexIndexSize == 3) {
				for (j = 0; j < 3; j++) {
					var v = face.vertex[j];
					var p = ret[v];
					p.set(p.addition(n));
				}
			} else if (face.vertexIndexSize == 4) {
				for (j = 0; j < 4; j++) {
					if (j == 3)
						continue;
					var v = face.vertex[j];
					var p = ret[v];
					p.set(p.addition(n));
				}
				var d = vertices[face.vertex[3]];
				n = metasequoia.Point3D.normalize(a, c, d);
				for (j = 0; j < 4; j++) {
					if (j == 1)
						continue;
					var v = face.vertex[j];
					var p = ret[v];
					p.set(p.addition(n));
				}
			}
		}
		for (i = 0; i < vertexSize; i++) {
			var v = ret[i];
			var len = v.sqrt();
			if (len != 0) {
				v.set(v.divideOne(len));
			}
		}
		return ret;
	};
};
metasequoia.Object.prototype = {
	"name" : "",
	"minVertex" : new metasequoia.Point3D(),
	"maxVertex" : new metasequoia.Point3D(),
	"vertices" : [ new metasequoia.Point3D() ],
	"materialVertices" : [ new metasequoia.MaterialVertex() ],
	"faces" : [ new metasequoia.Face() ],
	"vertexSize" : 0,
	"materialVertexSize" : 0,
	"faceSize" : 0,
	"depth" : 0,
	"folding" : 0,
	"scale" : [ 0.0 ],
	"rotation" : [ 0.0 ],
	"translation" : [ 0.0 ],
	"patch" : 0,
	"segment" : 0,
	"visible" : 0,
	"locking" : 0,
	"shading" : 0,
	"facet" : 0.0,
	"color" : [ 0.0 ],
	"colorType" : 0,
	"mirror" : 0,
	"mirrorAxis" : 0,
	"mirrorDistance" : 0.0,
	"lathe" : 0,
	"latheAxis" : 0,
	"latheSegment" : 0,
	"create" : function(materials) {
	},
	"createVerticesFromMaterial" : function(vertexMaterial, index,
			normalizedVertices, hasTexture) {
	},
	"normalizeVertices" : function() {
		return [ new metasequoia.Point3D() ];
	}
};

/**
 * @constructor
 */
metasequoia.Model = function() {
	this.minVertex = new metasequoia.Point3D();
	this.maxVertex = new metasequoia.Point3D();
	this.scene = new metasequoia.Scene();
	this.materials = [];
	this.objects = [];
	this.materialIndex = 0;
	this.objectIndex = -1;
	this.create = function(gl) {
		var size = this.objects.length;
		for ( var i = 0; i < size; i++) {
			var object = this.objects[i];
			if (object.faces == null || object.vertices == null)
				continue;
			object.create(gl, this.materials);
			if (i == 0) {
				this.minVertex.set(object.minVertex);
				this.maxVertex.set(object.maxVertex);
			} else {
				this.minVertex.setMin(object.minVertex);
				this.maxVertex.setMax(object.maxVertex);
			}
		}
	};
};
metasequoia.Model.prototype = {
	"minVertex" : new metasequoia.Point3D(),
	"maxVertex" : new metasequoia.Point3D(),
	"scene" : new metasequoia.Scene(),
	"materials" : [ new metasequoia.Material() ],
	"objects" : [ new metasequoia.Object() ],
	"materialIndex" : 0,
	"objectIndex" : 0,
	"create" : function() {
	}
};

/**
 * @constructor
 * @param text
 */
metasequoia.Parser = function(canvas, url, text) {
	var STATE_ROOT_CHUNK = 0;
	var STATE_SCENE_CHUNK = 1;
	var STATE_MATERIAL_CHUNK = 2;
	var STATE_OBJECT_CHUNK = 3;

	/**
	 * @type metasequoia.Model
	 * @member
	 */
	var _model = new metasequoia.Model();

	/**
	 * @type String
	 * @member
	 */
	var _text = "";

	/**
	 * @type Number
	 * @member
	 */
	var _pos = 0;

	/**
	 * @type Number
	 * @member
	 */
	var _length = 0;

	/**
	 * @type RegExp
	 * @member
	 */
	var _digit = /(-?[0-9]+)/;

	/**
	 * @type RegExp
	 * @member
	 */
	var _float = /(-?[0-9\.]+f?)/;

	/**
	 * @type Number
	 * @member
	 */
	var _state = STATE_ROOT_CHUNK;

	/**
	 * @type WebGLContext
	 * @member
	 */
	var _gl = null;

	/**
	 * @type String
	 * @member
	 */
	var _url = url;

	var names = [ "webgl", "experimental-webgl", "webkit-3d", "moz-webgl" ];
	for ( var i in names) {
		try {
			_gl = canvas.getContext(names[i]);
			if (_gl != null) {
				if (typeof WebGLDebugUtils != "undefined") {
					_gl = WebGLDebugUtils.makeDebugContext(_gl);
					console.log("enabled WebGLDebugUtils");
				}
				_gl.viewportWidth = canvas.width;
				_gl.viewportHeight = canvas.height;
				break;
			}
		} catch (e) {
			/* It's not available, so swallow this exception */
		}
	}
	if (!_gl)
		throw new Error("WebGL is not supported on this platform.");

	_text = String(text);
	_length = _text.length;
	_version = 0;

	function skipSpaces() {
		var c = _text.charAt(_pos);
		while (_pos < _length && (c == ' ' || c == '\t' || c == '\n')) {
			++_pos;
			c = _text.charAt(_pos);
		}
	}
	;
	function skipToNextLine() {
		var c = _text.charCodeAt(_pos);
		while (_pos < _length && c != 012) {
			++_pos;
			c = _text.charCodeAt(_pos);
		}
		++_pos;
		skipSpaces();
	}
	;
	function countWordLength() {
		var from = _pos;
		var c = _text.charAt(_pos);
		while (_pos < _length
				&& (c != ' ' && c != '\t' && c != '\r' && c != '\n')) {
			++_pos;
			c = _text.charAt(_pos);
		}
		to = _pos;
		_pos = from;
		var len = to - from;
		return len;
	}
	;
	function getQuotedString(limit) {
		var len = 0, from = 0;
		var c = _text.charAt(_pos);
		if (c == '"') {
			++_pos;
			c = _text.charAt(_pos);
			from = _pos;
			while (_pos < _length && c != '"' && _text.charAt(_pos - 1) != '\\') {
				++_pos;
				c = _text.charAt(_pos);
			}
			len = _pos - from;
			len = len > limit ? limit : len;
			_pos = from;
		}
		return _text.substring(_pos, _pos + len);
	}
	;
	function countWordLengthAndSkipSpaces() {
		var len = countWordLength();
		_pos += len;
		skipSpaces();
		return len;
	}
	;
	function getInteger(pos, len) {
		var word = _text.substr(pos, len);
		var ret = parseInt(word, 10);
		return isNaN(ret) ? 0 : ret;
	}
	;
	function skipSpacesAfterGettingInt() {
		var len = countWordLength();
		var ret = getInteger(_pos, len);
		_pos += len;
		skipSpaces();
		return ret;
	}
	function getFloat(pos, len) {
		var word = _text.substr(pos, len);
		var ret = parseFloat(word);
		return isNaN(ret) ? 0.0 : ret;
	}
	;
	function skipSpacesAfterGettingFloat() {
		var len = countWordLength();
		var ret = getFloat(_pos, len);
		_pos += len;
		skipSpaces();
		return ret;
	}
	;
	function skipSpacesAfterForwarding(forwardTo) {
		_pos += forwardTo;
		skipSpaces();
	}
	;
	function skipSpacesAfterComparingWord(word) {
		var len = countWordLength();
		var src = _text.substring(_pos, _pos + len);
		var matched = _pos + len < _length && src == word;
		_pos += len;
		skipSpaces();
		return matched;
	}
	;
	function skipSpacesAfterGettingQuotedString(limit) {
		var word = getQuotedString(limit);
		_pos += word.length;
		var c = _text.charAt(_pos);
		if (c != ' ' && c != '\t') {
			_pos += countWordLength();
		}
		skipSpaces();
		return word;
	}
	;
	function parseVertexChunk(object) {
		if (_text.charAt(_pos) != '{')
			throw new Error("vertex chunk must start with {");
		skipToNextLine();
		var len = countWordLength();
		var vertices = [];
		while (len != 0 && _text.charAt(_pos) != '}') {
			var vertex = new metasequoia.Point3D();
			vertex.x = getFloat(_pos, len);
			_pos += len;
			skipSpaces();
			vertex.y = skipSpacesAfterGettingFloat();
			vertex.z = skipSpacesAfterGettingFloat();
			skipToNextLine();
			len = countWordLength();
			vertices.push(vertex);
		}
		object.vertices = vertices;
	}
	;
	function parseMaterialChunk() {
		var shader = 0, vcol = 0;
		var diffuse = 0, ambient = 0, emission = 0, specular = 0;
		var red = 0, green = 0, blue = 0, alpha = 0;
		var texturePath = "", bumpTexturePath = "", alphaTexturePath = "";
		var parsers = {
			"amb(" : function() {
				ambient = skipSpacesAfterGettingFloat();
			},
			"col(" : function() {
				red = skipSpacesAfterGettingFloat();
				green = skipSpacesAfterGettingFloat();
				blue = skipSpacesAfterGettingFloat();
				alpha = skipSpacesAfterGettingFloat();
			},
			"dif(" : function() {
				diffuse = skipSpacesAfterGettingFloat();
			},
			"emi(" : function() {
				emission = skipSpacesAfterGettingFloat();
			},
			"spc(" : function() {
				specular = skipSpacesAfterGettingFloat();
			},
			"tex(" : function() {
				skipSpacesAfterForwarding(4);
				texturePath = skipSpacesAfterGettingQuotedString(64);
			},
			"bump(" : function() {
				skipSpacesAfterForwarding(5);
				bumpTexturePath = skipSpacesAfterGettingQuotedString(64);
			},
			"vcol(" : function() {
				vcol = skipSpacesAfterGettingInt();
			},
			"power(" : function() {
				material.power = skipSpacesAfterGettingFloat();
			},
			"aplane(" : function() {
				skipSpacesAfterForwarding(7);
				alphaTexturePath = skipSpacesAfterGettingQuotedString(64);
			},
			"shader(" : function() {
				shader = skipSpacesAfterGettingInt();
			},
			"proj_pos(" : function() {
				for ( var i = 0; i < 3; i++)
					material.projectionPosition[i] = skipSpacesAfterGettingFloat();
			},
			"proj_type(" : function() {
				material.projectionType = skipSpacesAfterGettingInt();
			},
			"proj_scale(" : function() {
				for ( var i = 0; i < 3; i++)
					material.projectionScale[i] = skipSpacesAfterGettingFloat();
			},
			"proj_angle(" : function() {
				for ( var i = 0; i < 3; i++)
					material.projectionAngle[i] = skipSpacesAfterGettingFloat();
			}
		};
		var material = _model.materials[_model.materialIndex];
		var len = countWordLength();
		material.name = _text.substring(_pos, _pos + len).replace(/"/g, '');
		_pos += len;
		skipSpaces();
		len = countWordLength();
		while (len != 0) {
			var word = _text.substring(_pos, _pos + len);
			var found = false;
			for ( var key in parsers) {
				if (word.indexOf(key, 0) == 0) {
					parsers[key]();
					found = true;
					break;
				}
			}
			if (!found) {
				throw new Error("Parse error in Material chunk: " + word);
			}
			len = countWordLength();
		}
		var col = material.color;
		col[0] = red;
		col[1] = green;
		col[2] = blue;
		var diff = material.diffuse;
		diff[0] = diffuse * red;
		diff[1] = diffuse * green;
		diff[2] = diffuse * blue;
		var amb = material.ambient;
		amb[0] = ambient * red;
		amb[1] = ambient * green;
		amb[2] = ambient * blue;
		var emi = material.emission;
		emi[0] = emission * red;
		emi[1] = emission * green;
		emi[2] = emission * blue;
		var spc = material.specular;
		spc[0] = specular * red;
		spc[1] = specular * green;
		spc[2] = specular * blue;
		col[3] = diff[3] = amb[3] = emi[3] = spc[3] = alpha;
		material.texturePath = texturePath;
		material.alphaTexturePath = alphaTexturePath;
		material.bumpTexturePath = bumpTexturePath;
		++_model.materialIndex;
	}
	;
	function parseFacesChunk(object) {
		if (_text.charAt(_pos) != '{')
			throw new Error("faces chunk must start with {");
		skipToNextLine();
		var len = countWordLength();
		var faces = [];
		while (len != 0 && _text.charAt(_pos) != '}') {
			var face = new metasequoia.Face();
			var vertexIndexSize = getInteger(_pos, len);
			face.vertexIndexSize = vertexIndexSize;
			_pos += len;
			skipSpaces();
			var max = vertexIndexSize == 4 ? 4 : 3;
			if (_text.charAt(_pos) == 'V') {
				_pos += 2;
				for ( var i = 0; i < max; i++)
					face.vertex[i] = skipSpacesAfterGettingInt();
			}
			if (_text.charAt(_pos) == 'M') {
				_pos += 2;
				face.materialIndex = skipSpacesAfterGettingInt();
			}
			if (_text.charAt(_pos) == 'U' && _text.charAt(_pos + 1) == 'V') {
				_pos += 3;
				var uv = face.uv;
				for ( var i = 0; i < max; i++) {
					var point = uv[i];
					point.x = skipSpacesAfterGettingFloat();
					point.y = skipSpacesAfterGettingFloat();
				}
			}
			skipToNextLine();
			len = countWordLength();
			faces.push(face);
		}
		object.faces = faces;
	}
	;
	function parseSceneChunk(len) {
		var scene = _model.scene;
		var parsers = {
			"amb" : function() {
				for ( var i = 0; i < 3; i++)
					scene.ambient[i] = skipSpacesAfterGettingFloat();
			},
			"pos" : function() {
				for ( var i = 0; i < 3; i++)
					scene.position[i] = skipSpacesAfterGettingFloat();
			},
			"head" : function() {
				scene.head = skipSpacesAfterGettingFloat();
			},
			"pich" : function() {
				scene.pich = skipSpacesAfterGettingFloat();
			},
			"ortho" : function() {
				scene.ortho = skipSpacesAfterGettingFloat();
			},
			"zoom2" : function() {
				scene.zoom2 = skipSpacesAfterGettingFloat();
			},
			"lookat" : function() {
				for ( var i = 0; i < 3; i++)
					scene.lookAt[i] = skipSpacesAfterGettingFloat();
			}
		};
		var word = _text.substring(_pos, _pos + len);
		var parser = parsers[word];
		if (parser != null) {
			skipSpacesAfterForwarding(len);
			parser();
		} else {
			throw new Error("Parse error in Scene chunk: " + word);
		}
	}
	function parseObjectChunk(len) {
		if (_model.objectIndex > _model.objects.length) {
			throw new Error("Invalid Object Size Error");
		}
		var object = _model.objects[_model.objectIndex];
		var parsers = {
			"face" : function() {
				object.faceSize = skipSpacesAfterGettingInt();
				parseFacesChunk(object);
			},
			"color" : function() {
				for ( var i = 0; i < 3; i++)
					object.color[i] = skipSpacesAfterGettingFloat();
			},
			"depth" : function() {
				object.depth = skipSpacesAfterGettingInt();
			},
			"facet" : function() {
				object.facet = skipSpacesAfterGettingInt();
			},
			"lathe" : function() {
				object.lathe = skipSpacesAfterGettingInt();
			},
			"patch" : function() {
				object.patch = skipSpacesAfterGettingInt();
			},
			"scale" : function() {
				for ( var i = 0; i < 3; i++)
					object.scale[i] = skipSpacesAfterGettingFloat();
			},
			"mirror" : function() {
				object.mirror = skipSpacesAfterGettingInt();
			},
			"vertex" : function() {
				object.vertexSize = skipSpacesAfterGettingInt();
				parseVertexChunk(object);
			},
			"folding" : function() {
				object.folding = skipSpacesAfterGettingInt();
			},
			"locking" : function() {
				object.locking = skipSpacesAfterGettingInt();
			},
			"segment" : function() {
				object.segment = skipSpacesAfterGettingInt();
			},
			"shading" : function() {
				object.shading = skipSpacesAfterGettingInt();
			},
			"visible" : function() {
				object.visible = skipSpacesAfterGettingInt();
			},
			"rotation" : function() {
				for ( var i = 0; i < 3; i++)
					object.rotation[i] = skipSpacesAfterGettingFloat();
			},
			"lathe_seg" : function() {
				object.latheSegment = skipSpacesAfterGettingInt();
			},
			"color_type" : function() {
				object.colorType = skipSpacesAfterGettingInt();
			},
			"lathe_axis" : function() {
				object.latheAxis = skipSpacesAfterGettingInt();
			},
			"mirror_dis" : function() {
				object.mirrorDistance = skipSpacesAfterGettingFloat();
			},
			"mirror_axis" : function() {
				object.mirrorAxis = skipSpacesAfterGettingInt();
			},
			"translation" : function() {
				for ( var i = 0; i < 3; i++)
					object.translation[i] = skipSpacesAfterGettingFloat();
			}
		};
		var word = _text.substring(_pos, _pos + len);
		var parser = parsers[word];
		if (parser != null) {
			skipSpacesAfterForwarding(len);
			parser();
		} else {
			throw new Error("Parse error in Object chunk: " + word);
		}
	}
	;
	function parseRootChunk(len) {
		var parsers = {
			"Eof" : function() {
				_pos += 3;
			},
			"Scene" : function() {
				_state = STATE_SCENE_CHUNK;
			},
			"Object" : function() {
				_state = STATE_OBJECT_CHUNK;
				skipSpacesAfterForwarding(6);
				var len = countWordLength();
				var name = _text.substring(_pos, _pos + len).replace(/"/g, '');
				skipSpacesAfterForwarding(len);
				_model.objects.push(new metasequoia.Object(name));
				_model.objectIndex++;
			},
			"Material" : function() {
				_state = STATE_MATERIAL_CHUNK;
				skipSpacesAfterForwarding(8);
				var size = skipSpacesAfterGettingInt();
				for ( var i = 0; i < size; i++) {
					var material = new metasequoia.Material(_url);
					_model.materials.push(material);
				}
			},
			"BackImage" : function() {
				while (_text.charAt(_pos) != '}') {
					skipToNextLine();
				}
			},
			"IncludeXml" : function() {
				skipToNextLine();
			}
		};
		var word = _text.substring(_pos, _pos + len);
		var parser = parsers[word];
		if (parser != null) {
			parser();
		} else {
			throw new Error("Parse error in Root chunk: " + word);
		}
	}
	;
	function parseChunk() {
		var len = countWordLength();
		if (len == 0) {
			throw new Error("Parse error in Root chunk");
		} else if (_text.charAt(_pos) == '}') {
			if (_state == STATE_OBJECT_CHUNK || _state == STATE_MATERIAL_CHUNK
					|| _state == STATE_SCENE_CHUNK) {
				_state = STATE_ROOT_CHUNK;
			} else {
				throw new Error("Invalid state error");
			}
		} else {
			switch (_state) {
			case STATE_ROOT_CHUNK:
				parseRootChunk(len);
				break;
			case STATE_SCENE_CHUNK:
				parseSceneChunk(len);
				break;
			case STATE_MATERIAL_CHUNK:
				parseMaterialChunk(len);
				break;
			case STATE_OBJECT_CHUNK:
				parseObjectChunk(len);
				break;
			default:
				throw new Error("Invalid state error");
			}
		}
	}
	;
	function parse() {
		if (_length >= 45 && _text.substring(0, 20) == "Metasequoia Document") {
			_pos += 20;
			skipToNextLine();
			if (skipSpacesAfterComparingWord("Format")
					&& skipSpacesAfterComparingWord("Text")
					&& skipSpacesAfterComparingWord("Ver")) {
				var len = countWordLength();
				_version = getFloat(_pos, len);
				skipToNextLine();
				skipToNextLine();
				while (_pos < _length) {
					parseChunk();
					skipToNextLine();
				}
				var renderer = new metasequoia.Renderer(_gl, _model);
				return renderer;
			}
			throw new Error("Header error");
		}
		throw new Error("Signature error");
	}
	;
	function getVersion() {
		return _version;
	}
	;

	return {
		"skipSpaces" : skipSpaces,
		"skipToNextLine" : skipToNextLine,
		"countWordLength" : countWordLength,
		"skipSpacesAfterGettingInt" : skipSpacesAfterGettingInt,
		"skipSpacesAfterGettingFloat" : skipSpacesAfterGettingFloat,
		"skipSpacesAfterForwarding" : skipSpacesAfterForwarding,
		"skipSpacesAfterComparingWord" : skipSpacesAfterComparingWord,
		"skipSpacesAfterGettingQuotedString" : skipSpacesAfterGettingQuotedString,
		"parseVertexChunk" : parseVertexChunk,
		"parseMaterialChunk" : parseMaterialChunk,
		"parseFacesChunk" : parseFacesChunk,
		"parseSceneChunk" : parseSceneChunk,
		"parseObjectChunk" : parseObjectChunk,
		"parseRootChunk" : parseRootChunk,
		"parse" : parse,
		"getVersion" : getVersion
	};
};

metasequoia.Parser.prototype = {
	"parse" : function() {
		return new metasequoia.Renderer(null, null);
	},
	"getVersion" : function() {
		return 0;
	}
};

/**
 * @constructor
 */
metasequoia.Renderer = function(context, model) {
	/**
	 * @type WebGLContext
	 * @member
	 */
	var _gl = context;

	/**
	 * @type WebGLProgram
	 * @member
	 */
	var _polygon = null;

	/**
	 * @type WebGLProgram
	 * @member
	 */
	var _texture = null;

	/**
	 * @type metasequoia.Model
	 * @member
	 */
	var _model = new metasequoia.Model();

	/**
	 * @type Matrix
	 * @member
	 */
	var _perspective = null;

	/**
	 * @type Matrix
	 * @member
	 */
	var _modelViewMatrix = Matrix.I(4);

	_model = model;

	function setMatrixUniforms() {
		var programs = [ _texture, _polygon ];
		var p = new WebGLFloatArray(_perspective.flatten());
		var mv = new WebGLFloatArray(_modelViewMatrix.flatten());
		for ( var i in programs) {
			var program = programs[i];
			_gl.useProgram(program);
			_gl.uniformMatrix4fv(program.perspectiveMatrixUniform, false, p);
			_gl.uniformMatrix4fv(program.modelViewMatrixUniform, false, mv);
			_gl.useProgram(0);
		}
	}
	;
	function setPerspective(fovy, aspect, zfar, znear) {
		_perspective = makePerspective(fovy, aspect, zfar, znear);
		setMatrixUniforms();
	}
	;
	function transform(x, y, z) {
		var r = Matrix.I(4);
		r.elements[0][3] = x;
		r.elements[1][3] = y;
		r.elements[2][3] = z;
		var m = r.ensure4x4();
		_modelViewMatrix = _modelViewMatrix.x(m);
		setMatrixUniforms();
	}
	;
	function setVertexTextureCoords(program, coords) {
		/* set texture coordinates */
		var textureCoordBuffer = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, textureCoordBuffer);
		_gl.bufferData(_gl.ARRAY_BUFFER, new WebGLFloatArray(coords),
				_gl.STATIC_DRAW);
		textureCoordBuffer.itemSize = 2;
		textureCoordBuffer.numItems = textureCoordBuffer.length
				/ textureCoordBuffer.itemSize;
		_gl.vertexAttribPointer(program.vertexTextureCoordAttribute,
				textureCoordBuffer.itemSize, _gl.FLOAT, false, 0, 0);
	}
	;
	function setVertexNormals(program, normals) {
		/* set normals */
		var normalBuffer = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, normalBuffer);
		_gl.bufferData(_gl.ARRAY_BUFFER, new WebGLFloatArray(normals),
				_gl.STATIC_DRAW);
		normalBuffer.itemSize = 3;
		normalBuffer.numItems = normals.length / normalBuffer.itemSize;
		_gl.vertexAttribPointer(program.vertexNormalAttribute,
				normalBuffer.itemSize, _gl.FLOAT, false, 0, 0);
	}
	;
	function drawVertexPoints(program, points) {
		/* draw points */
		var pointBuffer = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, pointBuffer);
		_gl.bufferData(_gl.ARRAY_BUFFER, new WebGLFloatArray(points),
				_gl.STATIC_DRAW);
		pointBuffer.itemSize = 3;
		pointBuffer.numItems = points.length / pointBuffer.itemSize;
		_gl.enableVertexAttribArray(program.vertexPositionAttribute);
		_gl.vertexAttribPointer(program.vertexPositionAttribute,
				pointBuffer.itemSize, _gl.FLOAT, false, 0, 0);
		_gl.drawArrays(_gl.TRIANGLES, 0, pointBuffer.numItems);
	}
	;
	function renderMaterials(materials, object) {
		var material = new metasequoia.Material();
		var materialSize = materials.length;
		var materialVertex = new metasequoia.MaterialVertex();
		var color = [];
		for ( var i = 0; i < materialSize; i++) {
			material = materials[i];
			materialVertex = object.materialVertices[i];
			if (materialVertex.vertexCount <= 0)
				continue;
			if (material.hasTexture()) {
				_gl.useProgram(_texture);
				_gl.activeTexture(_gl.TEXTURE0);
				_gl.bindTexture(_gl.TEXTURE_2D, material.getTexture());
				_gl.uniform1i(_texture.samplerUniform, 0);
				// setVertexNormal(_texture, materialVertex.getNormal());
				setVertexTextureCoords(_texture, materialVertex.getUV());
				drawVertexPoints(_texture, materialVertex.getPoint());
				_gl.bindTexture(_gl.TEXTURE_2D, null);
			} else {
				_gl.useProgram(_polygon);
				color = material.color;
				// setVertexNormal(_polygon, materialVertex.getNormal());
				if (false) {
					var colorBuffer = _gl.createBuffer();
					var len = point.length / 3;
					var colors = [];
					for ( var j = 0; j < len; j++) {
						colors = colors.concat(color);
					}
					/* draw normals */
					_gl.bindBuffer(_gl.ARRAY_BUFFER, colorBuffer);
					_gl.bufferData(_gl.ARRAY_BUFFER,
							new WebGLFloatArray(colors), _gl.STATIC_DRAW);
					colorBuffer.itemSize = 4;
					colorBuffer.numItems = colors.length / 4;
					_gl.vertexAttribPointer(_polygon.vertexColorAttribute,
							colorBuffer.itemSize, _gl.FLOAT, false, 0, 0);
				} else {
					_gl.uniform4f(_polygon.colorUniform, false, color[0],
							color[1], color[2], color[3]);
				}
				drawVertexPoints(_polygon, materialVertex.getPoint());
			}
			_gl.useProgram(0);
		}
	}
	;
	function createShaderProgram(fragmentShader, vertexShader) {
		var map = [ _gl.FRAGMENT_SHADER, fragmentShader, _gl.VERTEX_SHADER,
				vertexShader ];
		var length = map.length;
		var program = _gl.createProgram();
		for ( var i = 0; i < length; i += 2) {
			var shaderType = map[i];
			var shaderSource = map[i + 1];
			var shader = _gl.createShader(shaderType);
			_gl.shaderSource(shader, shaderSource);
			_gl.compileShader(shader);
			if (!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS)) {
				throw new Error(_gl.getShaderInfoLog(shader) + shaderSource);
			}
			_gl.attachShader(program, shader);
		}
		_gl.linkProgram(program);
		if (!_gl.getProgramParameter(program, _gl.LINK_STATUS)) {
			throw new Error("Shader program cannot link");
		}
		return program;
	}
	;
	function initializeProgram(program) {
		// program.vertexNormalAttribute = _gl.getAttribLocation(program,
		// "aVertexNormal");
		program.vertexPositionAttribute = _gl.getAttribLocation(program,
				"vertexPosition");
		program.perspectiveMatrixUniform = _gl.getUniformLocation(program,
				"perspectiveMatrix");
		program.modelViewMatrixUniform = _gl.getUniformLocation(program,
				"modelViewMatrix");
		// _gl.enableVertexAttribArray(program.vertexNormalAttribute);
	}
	;
	function initialize(pfs, pvs, tfs, tvs) {
		_model.create(_gl);
		_polygon = createShaderProgram(pfs, pvs);
		_texture = createShaderProgram(tfs, tvs);
		initializeProgram(_polygon);
		initializeProgram(_texture);
		_polygon.colorUniform = _gl.getUniformLocation(_polygon, "color");
		_texture.vertexTextureCoordAttribute = _gl.getAttribLocation(_texture,
				"vertexTextureCoord");
		_texture.samplerUniform = _gl.getUniformLocation(_texture, "sampler");
		_gl.enableVertexAttribArray(_texture.vertexTextureCoordAttribute);
		_gl.clearColor(0.0, 0.0, 0.1, 1.0);
		_gl.clearDepth(1.0);
		_gl.enable(_gl.CULL_FACE);
		_gl.enable(_gl.DEPTH_TEST);
		_gl.frontFace(_gl.CW);
		_gl.cullFace(_gl.BACK);
		_gl.depthFunc(_gl.LEQUAL);
		_gl.viewport(0, 0, _gl.viewportWidth, _gl.viewportHeight);
		_gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);
		var aspect = _gl.viewportWidth / _gl.viewportHeight;
		setPerspective(100.0, aspect, _model.scene.zoom2, 10000.0);
		transform(0.0, 0.0, -150.0);
	}
	;
	function render() {
		var objects = _model.objects;
		var materials = _model.materials;
		var objectSize = objects.length;
		for ( var i = 0; i < objectSize; i++) {
			var object = objects[i];
			if (object.faces == null || object.vertices == null
					|| object.materialVertices == null || !object.visible)
				continue;
			renderMaterials(materials, object);
			if (object.mirror > 0) {
				switch (object.mirrorAxis) {
				case 1:
				default:
					break;
				case 2:
					break;
				case 4:
					break;
				}
				renderMaterials(materials, object);
			}
		}
	}
	;

	return {
		"initialize" : initialize,
		"transform" : transform,
		"setPerspective" : setPerspective,
		"render" : render,
		"getModel" : function() {
			return _model;
		}
	};
};

metasequoia.Renderer.prototype = {
	"initialize" : function() {
	},
	"render" : function() {
	}
};
