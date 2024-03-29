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

        this.wallZPos = -800;

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

        this.createDotResource();

        this.bdotNum = 2;
        this.bdotSize = 4.0
        this.updateBdots();

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

        let height = window.innerHeight;
        this.renderer.setSize(height * 16 / 9, height);

        this.realtimeTrace = false;

        this.randOnHit = true;

        this.randWidth = 200;
        this.randHeight = 100;

        this.cameraLastDirection = new THREE.Vector3();
        this.cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(this.cameraLastDirection);
        this.clock = new THREE.Clock();
        this.lastViewSpeed = 0.0;

        this.lastHitObject = null;

        this.update();
    }

    createDotResource = () => {
        const targetMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const targetGeometry = new THREE.CircleGeometry(3.0, 32);
        const traceMaterial = new THREE.MeshBasicMaterial({ color: 0xff9999 });
        const traceGeometry = new THREE.SphereGeometry(this.dotSize, 32, 32);
        const hitTraceMaterial = new THREE.MeshBasicMaterial({ color: 0x00aa00 });
        const missTraceMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.dotResource = {
            targetMaterial,
            targetGeometry,
            traceMaterial,
            traceGeometry,
            hitTraceMaterial,
            missTraceMaterial,
        };
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

    randBdots = () => {
        for (let i = 0; i < this.bdotNum; ++i) {
            let newX = Math.random() * this.randWidth - this.randWidth / 2;
            let newY = Math.random() * this.randHeight - this.randHeight / 2;
            this.bdots[i].position.set(newX, newY, this.wallZPos + 5.0);
        }
    }

    updateBdots = () => {
        if(this.bdots != null) {
            for(let i in this.bdots) {
                this.scene.remove(this.bdots[i]);
            }
        }
        this.bdots = []
        for (let i = 0; i < this.bdotNum; ++i) {
            const bdot = new THREE.Mesh(this.dotResource.targetGeometry, this.dotResource.targetMaterial);
            this.bdots.push(bdot)
            this.scene.add(bdot);
        }
        this.randBdots();
    }

    updateBdotSize = (bsize) => {
        this.bdotSize = bsize;
        this.dotResource.targetGeometry.dispose();
        this.dotResource.targetGeometry = new THREE.SphereGeometry(bsize, 32, 32);
        this.updateBdots();
    }

    updateBdotNum = (bnum) => {
        this.bdotNum = bnum;
        this.updateBdots();
    }

    updateDotNum = (dotNum) => {
        this.dotNum = dotNum;
        this.updateDots();
    }

    updateDotSize = (dotSize) => {
        this.dotSize = dotSize;
        this.dotResource.traceGeometry.dispose();
        this.dotResource.traceGeometry = new THREE.CircleGeometry(this.dotSize, 32);
        this.updateDots();
    }

    updateDots = () => {
        if(this.dots != null) {
            for(let j in this.dots) {
                this.scene.remove(this.dots[j]);
            }
        }
        this.dots = [];
        for (let j in this.dotProps) {
            let prop = this.dotProps[j];
            let dotMaterial;
            let dotGeometry = this.dotResource.traceGeometry;
            if (!prop.shoot) {
                dotMaterial = this.dotResource.traceMaterial;
            } else {
                if (prop.hit) {
                    dotMaterial = this.dotResource.hitTraceMaterial;
                } else {
                    dotMaterial = this.dotResource.missTraceMaterial;
                };
            }
            let dot = new THREE.Mesh(dotGeometry, dotMaterial);
            this.dots.push(dot);
            this.scene.add(dot);
            let pos = prop.pos;
            dot.position.set(pos.x, pos.y, pos.z + 2.0);
            if (prop.shoot) {
                dot.position.set(pos.x, pos.y, pos.z + 3.0);
                dot.scale.set(1.5, 1.5, 1.5);
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
                this.lastHitObject.position.set(newX, newY, this.wallZPos + 5.0);
            }
        }
        if(!this.realtimeTrace) {
            this.updateDots();
            this.dotProps = [];
        }
    }
    
    // ******************* PUBLIC EVENTS ******************* //

    onWindowResize = (height) => {
        this.renderer.setSize(height * 16 / 9, height);
    }

    // ******************* RENDER LOOP ******************* //
    update = (t) => {
        this.stats.begin();

        this.camera.getWorldDirection(this.cameraDir);
        this.rayCaster.set(this.camera.position, this.cameraDir);
        const intersectObjects = this.rayCaster.intersectObject(this.wall);
        const pos = intersectObjects.length > 0 ? intersectObjects[0].point : null;

        this.cameraLastDirection.copy(this.cameraDirection);
        this.camera.getWorldDirection(this.cameraDirection);
        const angleChange = this.cameraDirection.angleTo(this.cameraLastDirection) * 180 / Math.PI;
        const delta = this.clock.getDelta();
        this.lastViewSpeed = angleChange / delta;
        if (pos) {
            let hit = false;
            for (let i = 0; i < this.bdotNum; ++i) {
                const intersectObjects = this.rayCaster.intersectObject(this.bdots[i]);
                if (intersectObjects.length > 0) {
                    this.lastHitObject = this.bdots[i];
                    hit = true
                    break;
                }
            }
            let shoot = false;

            this.dotProps.push({ pos, shoot, hit, t, vs: this.lastViewSpeed });
            while (this.dotProps.length > this.dotNum) {
                this.dotProps.shift();
            }
            if (this.realtimeTrace) {
                this.updateDots();
            }
        }
        if (this.updateViewSpeed !== undefined && this.updateMaxViewSpeed !== undefined) {
            this.updateViewSpeed(this.lastViewSpeed);
            let maxViewSpeed = 0;
            let avgViewSpeed = 0
            for(let i = 0; i < this.dotProps.length; ++i) {
                const vs = this.dotProps[i].vs;
                if(vs > maxViewSpeed) { maxViewSpeed = vs; }
                avgViewSpeed += vs;
            }
            if(this.dotProps.length > 0) { avgViewSpeed /= this.dotProps.length; }
            this.updateMaxViewSpeed(maxViewSpeed);
            this.updateAvgViewSpeed(avgViewSpeed);
        }

        this.renderer.render(this.scene, this.camera);

        this.stats.end();
        requestAnimationFrame(this.update);
    }
}