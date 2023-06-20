import * as THREE from 'three';

import { Water } from '../jsm/objects/Water.js';
import { Sky } from '../jsm/objects/Sky.js';

import { OBJLoader } from '../jsm/loaders/OBJLoader.js';
import { MTLLoader } from '../jsm/loaders/MTLLoader.js';

let container;
let camera, scene, renderer;
let water,sun;
let boat;

let dpi = window.devicePixelRatio;

let parameters = {
    elevation:2,//標高：太陽の高さ
    azimuth:180//方位角：太陽の角度
};

window.addEventListener('DOMContentLoaded',()=>{
    init();
    animate();
});

function init(){
    //カンバス
    container = document.getElementById('conteiner');

    //レンダラー
    renderer = new THREE.WebGLRenderer({
        antialias:true,
        alpha:true
    });
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setPixelRatio(dpi);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;//白飛びをどう処理するか
    container.appendChild(renderer.domElement);

    //シーン
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xbaa59e, 1.0, 800.0);

    //カメラ
    const fov = 60;
    const fovRad = (fov / 2) * (Math.PI / 180);
    const dist = window.innerHeight / 2 / Math.tan(fovRad);
    camera = new THREE.PerspectiveCamera(
        fov,
        window.innerWidth/window.innerHeight,
        1,
        1000
    );
	camera.position.set(0,10,dist);

    //太陽
    sun = new THREE.Vector3();

    //海
    const waterGeometry = new THREE.PlaneGeometry(10000,10000);
    water = new Water(
        waterGeometry,
        {
            textureWidth:512,
            textureHeight:512,
            waterNormals:new THREE.TextureLoader().load('../textures/waternormals.jpg',function(texture){
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection:new THREE.Vector3(),
            sunColor:0xffffff,
            waterColor:0x22bbff,
            distorsionScale:2.0,
            fog:scene.fog !== undefined
        }
    );
    
    water.rotation.x = -Math.PI/2;
    water.material.uniforms['cameraWorldPosition'] = { value:new THREE.Vector3() };

    scene.add(water);

    //空
    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;

    skyUniforms['turbidity'].value = 8;//濁度
    skyUniforms['rayleigh'].value = 3;//レイリー散乱
    skyUniforms['mieCoefficient'].value = 0.005;//ミー係数
    skyUniforms['mieDirectionalG'].value = 0.8;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    let renderTarget;

    //太陽
    function updateSun(){
        var phi = THREE.MathUtils.degToRad(90-parameters.elevation);
        var theta = THREE.MathUtils.degToRad(parameters.azimuth);

        sun.setFromSphericalCoords(1,phi,theta);

        sky.material.uniforms['sunPosition'].value.copy(sun);//太陽の光を空に反映させる
        water.material.uniforms['sunDirection'].value.copy(sun).normalize();//太陽の光を海面に反映させる

        if(renderTarget !== undefined) renderTarget.dispose();//反射するターゲットがなければ、メモリの解放
        renderTarget = pmremGenerator.fromScene(sky);//反射するターゲットがあれば、環境光を反射させる
        scene.environment = renderTarget.texture;
    }

    updateSun();

    //環境光
    let ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    //平行光源
    let directionalLight = new THREE.DirectionalLight(0xffffff);
    scene.add(directionalLight);

    //テキストの追加
    let textColor = new THREE.Color(0x2b3638);
    let fontSize = 10;

    let text1 = createMesh(
        'Every night  \nI see you I feel you', 
        fontSize, 
        textColor
        );
    scene.add(text1);
    text1.position.set(-40,10,300);
    text1.rotation.y = Math.PI/4;

    let text2 = createMesh(
        "that is how I know \nyou go on.", 
        fontSize, 
        textColor
        );
    scene.add(text2);
    text2.position.set(40,10,0);
    text2.rotation.y = -Math.PI/4;

    let text3 = createMesh(
        "Far across \nthe distance",
        fontSize,
        textColor
    );
    scene.add(text3);
    text3.position.set(-40,10,-300);
    text3.rotation.y = Math.PI/4;

    let text4 = createMesh(
        "and spaces \nbetween us",
        fontSize,
        textColor
    );
    scene.add(text4);
    text4.position.set(40,10,-600);
    text4.rotation.y = -Math.PI/4;

    let text5 = createMesh(
        "you have come to show \nyou go on.",
        fontSize,
        textColor
    );
    scene.add(text5);
    text5.position.set(-40,10,-900);
    text5.rotation.y = Math.PI/4;

    let text6 = createMesh(
        "Near, far, \nwhere ever you are",
        fontSize,
        textColor
    );
    scene.add(text6);
    text6.position.set(40,10,-1200);
    text6.rotation.y = -Math.PI/4;

    let text7 = createMesh(
        "I believe that \nthe heart does go on.",
        fontSize,
        textColor
    );
    scene.add(text7);
    text7.position.set(-40,10,-1500);
    text7.rotation.y = Math.PI/4;

    let text8 = createMesh(
        "Once more, \nyou open the door",
        fontSize,
        textColor
    );
    scene.add(text8);
    text8.position.set(40,10,-1800);
    text8.rotation.y = -Math.PI/4;

    let text9 = createMesh(
        "and you're here \nin my heart and",
        fontSize,
        textColor
    );
    scene.add(text9);
    text9.position.set(-40,10,-2100);
    text9.rotation.y = Math.PI/4;

    let text10 = createMesh(
        "my heart will \ngo on and on.",
        fontSize,
        textColor
    );
    scene.add(text10);
    text10.position.set(40,10,-2400);
    text10.rotation.y = -Math.PI/4;


    //モデルの読み込み
    var mtlLoader = new MTLLoader();
    mtlLoader.setPath("./models/");
    mtlLoader.load("boat.mtl", function(materials){
        materials.preload();

        var objLoader = new OBJLoader();
        objLoader.setPath("./models/");
        objLoader.setMaterials(materials);
        objLoader.load("boat.obj", function(object){
            object.scale.set(5,5,5);
            boat = object;
            scene.add(boat);
            boat.castShadow = true;
            boat.position.set(
                camera.position.x, 
                camera.position.y - 10.5, 
                camera.position.z - 25
            );
            boat.rotation.set(0, 180 * Math.PI / 180, 0);
        });
    });
    
    window.addEventListener('resize',onWindowResize);
}


//ブラウザをリサイズした時の挙動
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
}


//アニメーション
function animate(){
    requestAnimationFrame(animate);
    render();
}


//レンダリング
function render(){
    water.material.uniforms['time'].value += 1.0/60.0;

    renderer.render(scene,camera);

    const delay = 0.1;
    
    window.onmousewheel = function(event){
        camera.position.z += event.wheelDelta * delay;
        boat.position.z += event.wheelDelta * delay;
        // カメラのZ座標を時間に応じて変化させる（sin波に沿って移動）
        const time = Date.now() * delay;
        const amplitude = 3;
        const period = 60;
        const displacement = Math.sin(time / period) * amplitude;
        camera.position.x = displacement;

        if (camera.position.z < -2500) {
            const fov = 60;
            const fovRad = (fov / 2) * (Math.PI / 180);
            const dist = window.innerHeight / 2 / Math.tan(fovRad);
            camera.position.z = dist;
            boat.position.z = camera.position.z - 25;
        }
    }
}

//テキストを表示するメッシュを作成する関数
function createMesh(text, fontSize, textColor){
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');

    //ctxのフォントを../fonts/以下のフォントに設定
    let fontFamily = 'Noto Serif Medium';
    // let fontPath = 'fonts/NotoSerif-Medium.ttf';
    // let font = new FontFace(fontFamily, `url(${fontPath})`);
    // font.load().then(function(loadedFont){
    //     document.fonts.add(loadedFont);
    // });
    ctx.font = `bold ${fontSize * dpi}px '${fontFamily}'`;
    
    // 改行文字でテキストを分割
    let lines = text.split('\n');

    // 各行のテキストの最大幅を計算
    let maxLineWidth = 0;
    lines.forEach(line => {
        let lineWidth = ctx.measureText(line).width;
        if (lineWidth > maxLineWidth) {
            maxLineWidth = lineWidth;
        }
    });

    // テキストの高さを計算
    let lineHeight = fontSize * dpi;
    let textHeight = lineHeight * lines.length;

    canvas.width = maxLineWidth;
    canvas.height = textHeight;

    ctx.font = `bold ${fontSize * dpi}px '${fontFamily}'`;
    ctx.textBaseline = 'top';

    let r = Math.floor(textColor.r * 255);
    let g = Math.floor(textColor.g * 255);
    let b = Math.floor(textColor.b * 255);

    ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',0.9)';
    
    // 各行ごとにテキストを描画
    lines.forEach((line, index) => {
        ctx.fillText(line, 0, index * lineHeight);
    });

    let texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    let geometry = new THREE.PlaneGeometry(maxLineWidth / dpi, textHeight / dpi, 1, 1);
    let material = new THREE.MeshStandardMaterial({
        map:texture,
        transparent:true,
    });

    let mesh = new THREE.Mesh(geometry, material);
    return mesh;
}