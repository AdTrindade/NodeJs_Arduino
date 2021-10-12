const socket = io();


let gX, gY, gZ, magX, magY, magZ, serie,mediaQuad,amost;
let temp = 0;

i = 0;
/*{
    "ultraX": 57.8,
    "ultraY": 42.568,
    "Acel_X": 0.000609,
    "Acel_Y": -0.001005,
    "Acel_Z": 1.000337,
    "Gyros_X": 0.033722,
    "Gyros_Y": 0.008545,
    "Gyros_Z": 0.015717,
    "Magnet_X": 87.60184,
    "Magnet_Y": 65.16721,
    "yaw": 65.15633,
    "pitch": -0.001004,
    "roll": -0.000609,
    "Magnet_Z": -17.84742,
    "Temperatura": 26.70581
}
}*/

let xMag   = [];
let yMag   = [];
let zMag   = [];
let xGiros = [];
let yGiros = [];
let zGiros = [];

let cores = ['#8614d7', '#d78614', '#65d714', '#d71434', '#dc3545', '#1434d7'];
socket.on('coordenadas', function (data) {

    const factor = 1000;
    let ctx = document.getElementById('doppler1').getContext('2d');
    let ctx_Magnetometro = document.getElementById('magnetometro').getContext('2d');
    //let ctx_Temperatura =  document.getElementById('temperatura').getContext('2d');
    let ctx_Giroscopio =  document.getElementById('inclinacao').getContext('2d');
    let serie =
        [{

            x: data.ultraX,
            y: data.ultraY,
            r: 5
        }];

    xMag.push(data.Magnet_X);
    yMag.push(data.Magnet_Y);
    zMag.push(data.Magnet_Z)
    xGiros.push(data.Gyros_X * factor)
    yGiros.push(data.Gyros_Y * factor)
    zGiros.push(data.Gyros_Z * factor)
    gX = data.Acel_X;
    gY = data.Acel_Y;
    
    
      
   let doppler = new Chart(ctx, {

        type: 'bubble',
        data: {
            datasets: [{
                label: 'Altura(Y) + Distancia Lateral(X)',
                data: serie,
                borderColor: 'rgb(215, 90, 150)',
                backgroundColor: 'rgb(215, 90, 150)',

            }]
        },
        options: {

            responsive: true,
            animation: false,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        max: 400,
                        min: 0,
                        stepSize: 10,
                    },
                }],


                xAxes: [{
                    ticks: {
                        max: 400,
                        min: 0,
                        stepSize: 10
                    }
                }]
            }
        }
    }); 

   let magnetometro = new Chart(ctx_Magnetometro, {

        type: 'line',
        data: {
            labels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
            datasets: [{
                label: '[μT],Eixo X',
                id: 'gx',
                data: xMag,
                fill: false,

                backgroundColor: cores[0],
                borderColor: cores[0],
                borderWidth: 4,
            }, {
                type: 'line',
                label: '[μT],Eixo Y',
                labels: yMag,
                id: 'gy',
                backgroundColor: cores[2],
                borderColor: cores[2],
                borderWidth: 4,
                data: yMag,
                fill: false,
            }, {
                type: 'line',
                label: '[μT],Eixo Z',
                labels: zMag,
                id: 'gz',
                backgroundColor: cores[4],
                borderColor: cores[4],
                borderWidth: 4,
                data: zMag,
                fill: false,
            }]
        },
        options: {
            responsive: true,
            animation: false,
            maintainAspectRatio: false

        }
    }); 

    let giroscopio = new Chart(ctx_Giroscopio, {
        type: 'line',
        data: {
            labels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
            datasets: [{
                label: 'Pitch,Eixo X',
                id: 'x',
                data: xGiros,
                fill: false,

                backgroundColor: cores[0],
                borderColor: cores[0],
                borderWidth: 4,
            }, {
                type: 'line',
                label: 'Roll,Eixo Y',
                labels: yGiros,
                id: 'y',
                backgroundColor: cores[2],
                borderColor: cores[2],
                borderWidth: 4,
                data: yGiros,
                fill: false,
            }, {
                type: 'line',
                label: 'Yaw,Eixo Z',
                labels: zGiros,
                id: 'z',
                backgroundColor: cores[4],
                borderColor: cores[4],
                borderWidth: 4,
                data: zGiros,
                fill: false,
            }]
        },
        options: {
            responsive: true,
            animation: false,
            maintainAspectRatio: false,

            
        }
    });    

if (i == 19) {
    xMag.shift();
    yMag.shift();
    zMag.shift();
    xGiros.shift();
    yGiros.shift();
    zGiros.shift(); 
    
}
else { i++; }


let vertical = 1366;
let horizontal = 768;

let scene = new THREE.Scene();
let eixos = new THREE.AxesHelper(2);
let gridCaract = new THREE.GridHelper(10, 1);
scene.add(eixos);
scene.add(gridCaract);
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(10, 4, 4);
camera.lookAt(scene.position);
var renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.getElementById("girosXY")
});

renderer.shadowMap.enabled = true;
renderer.setSize(vertical / 3, horizontal / 3);
renderer.setClearColor(0xcbc3b8);
var ilumination = new THREE.AmbientLight(0xeaeeee);




var geometry = new THREE.BoxGeometry(6, 0.2, 5);
var material = new THREE.MeshBasicMaterial({ color: 0x00FF6500 });
var cube = new THREE.Mesh(geometry, material);

scene.add(cube);
scene.add(ilumination);
//data.Gyros_Z ;
camera.position.z = 5;
let giro = -1;

let render = function () {
    requestAnimationFrame(render);
    cube.rotation.x = data.roll * giro;
    cube.rotation.z =  data.pitch * giro;
    cube.rotation.y = data.pitch * giro;
    renderer.render(scene, camera);
}

render();
});