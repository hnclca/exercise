// 创建场景
var scene = new THREE.Scene();

// 创建场景相机
// 75 - 视角
// window.innerWidth / window.innerHeight - 相机视窗宽高比
// 0.1 - 最小可视近景距离
// 1000 - 最大可视远景距离
// Z轴 - 垂直屏幕方向（观察者位置）
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// 创建渲染器，将渲染的内容添加到DOM文档树中
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 在画布中创建魔方
var cube;
// 创建纹理加载器
var loader = new THREE.TextureLoader();
// CORS配置仅支持http, data, chrome, chrome-extension, https协议
loader.crossOrigin = ''; 
loader.load('./metal003.png', (texture) => {
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(1, 1);

	// 创建几何体与材质
	var geometry = new THREE.BoxGeometry(3,3,3);
	var material = new THREE.MeshLambertMaterial({
		map: texture,
		shading: THREE.FlatShading,
	});

	// 生成魔方并添加到场景中
	cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	// 将场景交给渲染器绘制
	draw();
});

// 定义环境光
var light = new THREE.AmbientLight('white');
scene.add(light);

// 定义聚光灯
var spotLight = new THREE.SpotLight("red");
spotLight.position.set(100, 1000, 1000);
spotLight.castShadow = true;
scene.add(spotLight);

function draw() {
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	renderer.render(scene, camera);

	requestAnimationFrame(draw);
}