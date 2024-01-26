import logo from './logo.svg';
import styles from './App.module.css';
import ViewGL from './ViewGL';
import { Portal } from 'solid-js/web';
import { SpeedPlot } from './SpeedPlot';

import { createSignal, onCleanup, onMount } from 'solid-js';

const defaultConfig = {
  sens: 1.0,
  dotNum: 120,
  dotSize: 2.0,
  targetSize: 4.0,
  targetNum: 2,
  crosshairScale: 1.0,
  hfov: 106,
  realtimeTrace: 1,
  showCrosshair: 1,
  showSpeedPlot: 1,
  randOnHit: 1,
  randWidth: 200,
  randHeight: 100,
  release: "20240126",
};

function App() {
  let viewGL;
  let canvasRef;
  let handleResize;
  let handleMouseDown;
  let plotRef;
  let containerRef;

  const [viewSpeed, setViewSpeed] = createSignal(0);
  const [viewSpeedAtClick, setViewSpeedAtClick] = createSignal(0);
  const [maxViewSpeed, setMaxViewSpeed] = createSignal(0);
  const [avgViewSpeed, setAvgViewSpeed] = createSignal(0);

  const [config, setConfig] = createSignal({});

  onMount(() => {
    viewGL = new ViewGL(canvasRef);
    handleResize = () => {
      const height = window.innerHeight;
      viewGL.onWindowResize(height);
      containerRef.style.height = `${height}px`;
      containerRef.style.width = `${height * 16 / 9}px`;
      // viewGL.onWindowResize(800);
    };
    handleResize();
    handleMouseDown = () => {
      viewGL.controls.lock();
      viewGL.handleMouseDown();
    };
    canvasRef.addEventListener('pointerdown', handleMouseDown);
    window.addEventListener('resize', handleResize);

    let oldConfig = JSON.parse(localStorage.getItem('fps-mouse-tester'));
    if (!oldConfig || oldConfig.release !== defaultConfig.release) {
      oldConfig = defaultConfig;
    } else {
      oldConfig = { ...defaultConfig, ...oldConfig };
    }
    setConfig(oldConfig);
    viewGL.updateSens(parseFloat(oldConfig['sens']));
    viewGL.updateDotNum(parseInt(oldConfig['dotNum']));
    viewGL.updateDotSize(parseFloat(oldConfig['dotSize']));
    viewGL.updateBdotSize(parseFloat(oldConfig['targetSize']));
    viewGL.updateBdotNum(parseFloat(oldConfig['targetNum']));
    viewGL.updateCrosshairScale(parseFloat(oldConfig['crosshairScale']));
    viewGL.updateHfov(parseFloat(oldConfig['hfov']));
    viewGL.updateRandWidth(parseFloat(oldConfig['randWidth']));
    viewGL.updateRandHeight(parseFloat(oldConfig['randHeight']));
    const realtimeTrace = oldConfig['realtimeTrace'] ? true : false;
    viewGL.updateRealtimeTrace(realtimeTrace);
    const randOnHit = oldConfig['randOnHit'] ? true : false;
    viewGL.updateRandOnHit(randOnHit);
    const showCrosshair = oldConfig['showCrosshair'] ? true : false;
    viewGL.updateShowCrosshair(showCrosshair);
    const oldShowSpeedPlot = oldConfig['showSpeedPlot'] ? true : false;
    changeShowSpeedPlot(oldShowSpeedPlot);
    viewGL.updateViewSpeed = setViewSpeed;
    viewGL.updateViewSpeedAtClick = setViewSpeedAtClick;
    viewGL.updateMaxViewSpeed = setMaxViewSpeed;
    viewGL.updateAvgViewSpeed = setAvgViewSpeed;

    const test = SpeedPlot(plotRef, viewGL);
    test.plot();
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

  const onBlackDotNumChange = (event) => {
    let evalue = event.target.value;
    let newcfg = { ...config(), targetNum: evalue };
    setConfig(newcfg);
    let value = parseInt(evalue);
    if (!isNaN(value)) {
      viewGL.updateBdotNum(value);
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

  const changeShowSpeedPlot = (value) => {
    plotRef.style.visibility = value ? 'visible' : 'hidden';
  }

  const onShowSpeedPlotChange = (event) => {
    let value = event.target.checked;
    let newcfg = { ...config(), showSpeedPlot: (value ? 1 : 0) };
    setConfig(newcfg);
    changeShowSpeedPlot(value);
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
        Sens:<input size={1} value={config()['sens'] || ''} onChange={onSensChange} />
        <span style={{ color: '#ff0000' }}>RedDotNum:</span><input size={3} value={config()['dotNum'] || ''} onChange={onRedDotNumChange} />
        RedDotSize:<input size={1} value={config()['dotSize'] || ''} onChange={onRedDotSizeChange} />
        BlackDotNum:<input size={1} value={config()['targetNum'] || ''} onChange={onBlackDotNumChange} />
        BlackDotSize:<input size={1} value={config()['targetSize'] || ''} onChange={onBlackDotSizeChange} />
        HFOV:<input size={1} value={config()['hfov'] || ''} onChange={onHfovChange} />
        RandWidth:<input size={1} value={config()['randWidth'] || ''} onChange={onRandWidthChange} />
        RandHeight:<input size={1} value={config()['randHeight'] || ''} onChange={onRandHeightChange} />
        <br/>
        <span style={{ color: '#ff0000' }}>RealtimeTrace:</span>
        <input type='checkbox' checked={(config()['realtimeTrace'] === 1) ? true : false} onChange={onRealtimeTraceChange} />
        SpeedPlot:
        <input type='checkbox' checked={(config()['showSpeedPlot'] === 1) ? true : false} onChange={onShowSpeedPlotChange} />
        RandOnHit:<input type='checkbox' checked={(config()['randOnHit'] === 1) ? true : false} onChange={onRandOnHitChange} />
        <br/>
        Crosshair:<input type='checkbox' checked={(config()['showCrosshair'] === 1) ? true : false} onChange={onShowCrosshairChange} />
        CrosshairScale:<input size={1} value={config()['crosshairScale'] || ''} onChange={onCrosshairScaleChange} />
        <br/>
      <button onClick={() => { viewGL.controls.lock(); containerRef.requestFullscreen(); }}>FullScreen</button>
    </div>;

  const speedContent = () =>
    'ViewSpeed(deg/s):\n  ' + viewSpeed().toFixed(3)
    + '\nMax(deg/s):\n  ' + maxViewSpeed().toFixed(3)
    + '\nAvg(deg/s):\n  ' + avgViewSpeed().toFixed(3)
    + '\nAtClick(deg/s):\n  ' + viewSpeedAtClick().toFixed(3);
  return (
    <div class={styles.App}>
      <div id={styles.canvasContainer} ref={containerRef}>
        <canvas id={styles.canvas3d} ref={canvasRef} />
        <div id={styles.info}>{speedContent()}</div>
        <canvas id={styles.canvas2d} width="600" height="100" ref={plotRef} />
      </div>
      {menu}
      <a href="https://github.com/benkyoujouzu/fps-mouse-tester" target="_blank">github.com/benkyoujouzu/fps-mouse-tester</a>
    </div>
  );

}

export default App;
