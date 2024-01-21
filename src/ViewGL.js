import * as THREE from 'three';
import {PointerLockControls} from 'three/addons/controls/PointerLockControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js';


export default class ViewGL{
    constructor(canvasRef) {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvasRef,
            antialias: false,
        });
        // this.renderer.setPixelRatio(0.5);

        this.wallZPos = -800;

        // Create meshes, materials, etc.
        this.camera = new THREE.PerspectiveCamera( 73.74, 16/9, 0.1, 2000 );
        this.cameraDir = new THREE.Vector3();


        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 100, 800);
        this.scene.add(light);

        const wallGeometry = new THREE.BoxGeometry(1600, 900, 1);
        const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        this.wall = new THREE.Mesh(wallGeometry, wallMaterial);
        this.wall.position.z = this.wallZPos;
        this.scene.add(this.wall);

        this.updateBdotSize(3.0);

        const crosshairGeometry = new THREE.CircleGeometry(0.1, 64);
        const crosshairMaterial = new THREE.MeshBasicMaterial({color: 0x00aa00});
        this.crosshair = new THREE.Mesh(crosshairGeometry, crosshairMaterial);
        this.camera.add(this.crosshair)
        this.crosshair.position.set(0, 0, -25);
        this.scene.add(this.camera);

        this.dotNum = 60;
        this.dotSize = 2.0;
        this.dotProps = [];
        this.updateDots();
        
        const box = new THREE.BoxGeometry(1600, 900, 1600);
        const object = new THREE.Mesh(box, new THREE.MeshBasicMaterial(0x000000));
        const boxMesh = new THREE.BoxHelper(object, 0xffffff);
        this.scene.add(boxMesh);

        this.controls = new PointerLockControls( this.camera, this.renderer.domElement );
        this.controls.pointerSpeed = 0.192;

        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild( this.stats.dom );

        this.rayCaster = new THREE.Raycaster();

        let width = window.innerWidth;
        this.renderer.setSize(width, width * 9 / 16);

        this.realtimeTrace = false;

        this.randOnHit = true;

        this.randWidth = 200;
        this.randHeight = 100;

        this.cameraLastDirection = new THREE.Vector3();
        this.cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(this.cameraLastDirection);
        this.clock = new THREE.Clock();
        this.lastViewSpeed = 0.0;

        this.update();
    }

    updateSens = (sens) => {
        this.controls.pointerSpeed = 0.192 * sens;
    }

    updateRandWidth = (value) => {
        this.randWidth = value;
    }

    updateRandHeight = (value) => {
        this.randHeight = value;
    }

    updateBdotSize = (bsize) => {
        if(this.bdot != null) {
            this.scene.remove(this.bdot);
        }
        const bdotGeometry = new THREE.CircleGeometry(bsize, 32);
        const bdotMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.bdot = new THREE.Mesh(bdotGeometry, bdotMaterial);
        this.bdot.position.set(0, 0, this.wallZPos + 1.0);
        this.scene.add(this.bdot);

    }

    updateDotNum = (dotNum) => {
        this.dotNum = dotNum;
        this.updateDots();
    }

    updateDotSize = (dotSize) => {
        this.dotSize = dotSize;
        this.updateDots();
    }

    updateDots = () => {
        if(this.dots != null) {
            for(let j in this.dots) {
                this.dots[j].material.dispose();
                this.dots[j].geometry.dispose();
                this.scene.remove(this.dots[j]);
            }
        }
        this.dots = [];
        for (let j in this.dotProps) {
            const dotGeometry = new THREE.CircleGeometry(this.dotSize, 32);
            const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff9999 });
            let dot = new THREE.Mesh(dotGeometry, dotMaterial);
            this.dots.push(dot);
            this.scene.add(dot);
            let prop = this.dotProps[j];
            let pos = prop.pos;
            dot.position.set(pos.x, pos.y, pos.z + 2.0);
            if (prop.shoot) {
                dot.position.set(pos.x, pos.y, pos.z + 3.0);
                dot.scale.set(1.5, 1.5, 1.5);
                if (prop.hit) {
                    dot.material.color.set(0x00aa00);
                } else {
                    dot.material.color.set(0xff0000);
                };
            }
        }
    }

    updateCrosshairScale = (scale) => {
        this.crosshair.scale.set(scale, scale, scale);
    }

    updateRealtimeTrace = (value) => {
        this.realtimeTrace = value;
    }

    updateRandOnHit = (value) => {
        this.randOnHit = value;
    }

    updateShowCrosshair = (value) => {
        this.crosshair.visible = value;
    }

    updateHfov = (value) => {
        let pi2 = 2 * Math.PI;
        let rad = value * pi2 / 360;
        let hfrad = rad / 2;
        let vrad = Math.atan(Math.tan(hfrad) * 9 / 16) * 2;
        let vdeg = vrad * 360 / pi2;
        this.camera.fov = vdeg;
        this.camera.updateProjectionMatrix();
    }

    handleMouseDown = () => {
        if (this.updateViewSpeedAtClick !== undefined){
            this.updateViewSpeedAtClick(this.lastViewSpeed);
        }
        if(this.dotProps.length > 0) {
            this.dotProps[this.dotProps.length - 1].shoot = true;
            let hit = this.dotProps[this.dotProps.length - 1].hit;
            if (hit && this.randOnHit) {
                let newX = Math.random() * this.randWidth - this.randWidth / 2;
                let newY = Math.random() * this.randHeight - this.randHeight / 2;
                this.bdot.position.set(newX, newY, this.wallZPos + 1.0);
            }
        }
        if(!this.realtimeTrace) {
            this.updateDots();
            this.dotProps = [];
        }
    }
    
    // ******************* PUBLIC EVENTS ******************* //

    onWindowResize = (width) => {
        this.renderer.setSize(width, width * 9 / 16);
    }

    // ******************* RENDER LOOP ******************* //
    update = (t) => {
        this.stats.begin();

        this.camera.getWorldDirection(this.cameraDir);
        this.rayCaster.set(this.camera.position, this.cameraDir);
        let intersectObjects = this.rayCaster.intersectObject(this.wall);
        let pos = intersectObjects.length > 0 ? intersectObjects[0].point : null;
        if (pos) {
            let intersectObjects = this.rayCaster.intersectObject(this.bdot);
            let hit = intersectObjects.length > 0;
            let shoot = false;

            this.dotProps.push({pos, shoot, hit});
            while (this.dotProps.length > this.dotNum) {
                this.dotProps.shift();
            }
            if (this.realtimeTrace){
                this.updateDots();
            }
        }

        this.cameraLastDirection.copy(this.cameraDirection);
        this.camera.getWorldDirection(this.cameraDirection);
        const angleChange = this.cameraDirection.angleTo(this.cameraLastDirection) * 180 / Math.PI;
        const delta = this.clock.getDelta();
        this.lastViewSpeed = angleChange / delta;
        if (this.updateViewSpeed !== undefined){
            this.updateViewSpeed(this.lastViewSpeed);
        }
        

        this.renderer.render(this.scene, this.camera);

        this.stats.end();
        requestAnimationFrame(this.update);
    }
}