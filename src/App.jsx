import logo from './logo.svg';
import styles from './App.module.css';
import ViewGL from './ViewGL';
import { Portal } from 'solid-js/web';

import { createSignal, onCleanup, onMount } from 'solid-js';

const defaultConfig = {
        sens: 1.0,
        dotNum: 60,
        dotSize: 2.0,
        targetSize: 4.0,
        crosshairScale: 1.0,
        hfov: 106,
        realtimeTrace: 1,
        showCrosshair: 1,
        randOnHit: 1,
        randWidth: 200,
        randHeight: 100,
      };

function App() {
  let viewGL;
  let canvasRef;
  let handleResize;
  let handleMouseDown;

  const [viewSpeed, setViewSpeed] = createSignal(0);
  const [viewSpeedAtClick, setViewSpeedAtClick] = createSignal(0);

  const [config, setConfig] = createSignal({});

  onMount(() => {
    viewGL = new ViewGL(canvasRef);
    handleResize = () => {
      viewGL.onWindowResize(window.innerWidth);
      // viewGL.onWindowResize(800);
    };
    handleMouseDown = () => {
      viewGL.controls.lock();
      viewGL.handleMouseDown();
    };
    canvasRef.addEventListener('pointerdown', handleMouseDown);
    window.addEventListener('resize', handleResize);
    
        let oldConfig = JSON.parse(localStorage.getItem('fps-mouse-tester'));
    if(!oldConfig) {
      oldConfig = defaultConfig;
    } else {
      oldConfig = {...defaultConfig, ...oldConfig};
    }
    setConfig(oldConfig);
    viewGL.updateSens(parseFloat(oldConfig['sens']));
    viewGL.updateDotNum(parseInt(oldConfig['dotNum']));
    viewGL.updateDotSize(parseFloat(oldConfig['dotSize']));
    viewGL.updateBdotSize(parseFloat(oldConfig['targetSize']));
    viewGL.updateCrosshairScale(parseFloat(oldConfig['crosshairScale']));
    viewGL.updateHfov(parseFloat(oldConfig['hfov']));
    viewGL.updateRandWidth(parseFloat(oldConfig['randWidth']));
    viewGL.updateRandHeight(parseFloat(oldConfig['randHeight']));
    let realtimeTrace = oldConfig['realtimeTrace'] ? true : false;
    viewGL.updateRealtimeTrace(realtimeTrace);
    let randOnHit = oldConfig['randOnHit'] ? true : false;
    viewGL.updateRandOnHit(randOnHit);
    let showCrosshair = oldConfig['showCrosshair'] ? true : false;
    viewGL.updateShowCrosshair(showCrosshair);

    viewGL.updateViewSpeed = setViewSpeed;
    viewGL.updateViewSpeedAtClick = setViewSpeedAtClick;
  });

  onCleanup(() => {
      canvasRef.removeEventListener('pointerdown', handleMouseDown);
      window.removeEventListener('resize', handleResize);
  });

    const onSensChange = (event) => {
    let evalue = event.target.value;
    let newcfg = { ...config(), sens: evalue };
    setConfig(newcfg);
    let value = parseFloat(evalue);
    if (!isNaN(value)) {
      viewGL.updateSens(value);
      localStorage.setItem('fps-mouse-tester', JSON.stringify(newcfg))
    }
  }

  const onRedDotNumChange = (event) => {
    let evalue = event.target.value;
    let newcfg = { ...config(), dotNum: evalue };
    setConfig(newcfg);
    let value = parseInt(evalue);
    if (!isNaN(value)) {
      viewGL.updateDotNum(value);
      localStorage.setItem('fps-mouse-tester', JSON.stringify(newcfg))
    }
  }

  const onRedDotSizeChange = (event) => {
    let evalue = event.target.value;
    let newcfg = { ...config(), dotSize: evalue };
    setConfig(newcfg);
    let value = parseFloat(evalue);
    if (!isNaN(value)) {
      viewGL.updateDotSize(value);
      localStorage.setItem('fps-mouse-tester', JSON.stringify(newcfg))
    }
  }

  const onBlackDotSizeChange = (event) => {
    let evalue = event.target.value;
    let newcfg = { ...config(), targetSize: evalue };
    setConfig(newcfg);
    let value = parseFloat(evalue);
    if (!isNaN(value)) {
      viewGL.updateBdotSize(value);
      localStorage.setItem('fps-mouse-tester', JSON.stringify(newcfg))
    }
  }

  const onCrosshairScaleChange = (event) => {
    let evalue = event.target.value;
    let newcfg = { ...config(), crosshairScale: evalue };
    setConfig(newcfg);
    let value = parseFloat(evalue);
    if (!isNaN(value)) {
      viewGL.updateCrosshairScale(value);
      localStorage.setItem('fps-mouse-tester', JSON.stringify(newcfg))
    }
  }

  const onRealtimeTraceChange = (event) => {
    let value = event.target.checked;
    let newcfg = { ...config(), realtimeTrace: (value ? 1 : 0) };
    setConfig(newcfg);
    viewGL.updateRealtimeTrace(value);
    localStorage.setItem('fps-mouse-tester', JSON.stringify(newcfg));
  }

  const onRandOnHitChange = (event) => {
    let value = event.target.checked;
    let newcfg = { ...config(), randOnHit: (value ? 1 : 0) };
    setConfig(newcfg);
    viewGL.updateRandOnHit(value);
    localStorage.setItem('fps-mouse-tester', JSON.stringify(newcfg));
  }

  const onShowCrosshairChange = (event) => {
    let value = event.target.checked;
    let newcfg = { ...config(), showCrosshair: (value ? 1 : 0) };
    setConfig(newcfg);
    viewGL.updateShowCrosshair(value);
    localStorage.setItem('fps-mouse-tester', JSON.stringify(newcfg));
  }

  const onHfovChange = (event) => {
    let evalue = event.target.value;
    let newcfg = { ...config(), hfov: evalue };
    setConfig(newcfg);
    let value = parseFloat(evalue);
    if (!isNaN(value)) {
      viewGL.updateHfov(value);
      localStorage.setItem('fps-mouse-tester', JSON.stringify(newcfg))
    }
  }

  const onRandWidthChange = (event) => {
    let evalue = event.target.value;
    let newcfg = { ...config(), randWidth: evalue };
    setConfig(newcfg);
    let value = parseFloat(evalue);
    if (!isNaN(value)) {
      viewGL.updateRandWidth(value);
      localStorage.setItem('fps-mouse-tester', JSON.stringify(newcfg))
    }
  }

  const onRandHeightChange = (event) => {
    let evalue = event.target.value;
    let newcfg = { ...config(), randHeight: evalue };
    setConfig(newcfg);
    let value = parseFloat(evalue);
    if (!isNaN(value)) {
      viewGL.updateRandHeight(value);
      localStorage.setItem('fps-mouse-tester', JSON.stringify(newcfg))
    }
  }
    const menu =
    <div>
      <p>
        Sens:<input size={3} value={config()['sens'] || ''} onChange={onSensChange} />
        RedDotNum:<input size={3} value={config()['dotNum'] || ''} onChange={onRedDotNumChange} />
        RedDotSize:<input size={3} value={config()['dotSize'] || ''} onChange={onRedDotSizeChange} />
        BlackDotSize:<input size={3} value={config()['targetSize'] || ''} onChange={onBlackDotSizeChange} />
        Crosshair:<input type='checkbox' checked={(config()['showCrosshair'] === 1) ? true : false} onChange={onShowCrosshairChange} />
        CrosshairScale:<input size={3} value={config()['crosshairScale'] || ''} onChange={onCrosshairScaleChange} />
        HFOV:<input size={3} value={config()['hfov'] || ''} onChange={onHfovChange} />
        RandWidth:<input size={3} value={config()['randWidth'] || ''} onChange={onRandWidthChange} />
        RandHeight:<input size={3} value={config()['randHeight'] || ''} onChange={onRandHeightChange} />
        <span style={{color: '#ff0000'}}>RealtimeTrace:</span><input type='checkbox' checked={(config()['realtimeTrace'] === 1) ? true : false} onChange={onRealtimeTraceChange} />
        RandOnHit:<input type='checkbox' checked={(config()['randOnHit'] === 1) ? true : false} onChange={onRandOnHitChange} />
      </p>
      <p><button onClick={() => { viewGL.controls.lock(); canvasRef.requestFullscreen(); }}>FullScreen</button></p>
    </div>;

    const speedContent = () => 'ViewSpeed(deg/s):\n  ' + viewSpeed().toFixed(3) + '\nAtClick(deg/s):\n  ' + viewSpeedAtClick().toFixed(3)
  return (
    <div>
      <div>
      <canvas ref={canvasRef} />
        <div class={styles.info}>{speedContent()}</div>
      </div>
      {menu}
    </div>
  );

//   onMount(() => {

//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

//     const renderer = new THREE.WebGLRenderer({canvas: canvasRef});
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     // document.body.appendChild( renderer.domElement );

//     const geometry = new THREE.BoxGeometry(1, 1, 1);
//     const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//     const cube = new THREE.Mesh(geometry, material);
//     scene.add(cube);

//     camera.position.z = 5;

//     function animate() {
//       requestAnimationFrame(animate);
//       renderer.render(scene, camera);
//     }
// animate();
//   });
  return (
      <canvas ref={canvasRef}/>
    // <div class={styles.App}>
    //   <header class={styles.header}>
    //     <img src={logo} class={styles.logo} alt="logo" />
    //     <p>
    //       Edit <code>src/App.jsx</code> and save to reload.
    //     </p>
    //     <a
    //       class={styles.link}
    //       href="https://github.com/solidjs/solid"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn Solid
    //     </a>
    //   </header>
    // </div>
  );
}

export default App;
