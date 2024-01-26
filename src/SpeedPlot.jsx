export function SpeedPlot(canvas, viewGL) {

    function processData(data) {
        if (data.length < 2) return [];
        let res = [];
        let maxvs = 0.0001;
        const interval = data[data.length - 1].t - data[0].t;
        for(let i = 0; i < data.length; i++) {
            const vs = data[i].vs;
            if(vs > maxvs) { maxvs = vs; }
            const t = (data[i].t - data[0].t) / interval;
            res.push({t, vs, shoot: data[i].shoot, hit: data[i].hit});
        }
        return res.map(p => ({...p, vs: (p.vs / maxvs)}));
    }

    function plot() {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width;
        const h = canvas.height - 3;
        const rawData = viewGL.dotProps.map(p => ({t: p.t, vs: p.vs, shoot: p.shoot, hit: p.hit}));
        const data = processData(rawData);

        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'red';
        for(let i = 0; i < data.length - 1; i++) {
            const d0 = data[i];
            const x0 = d0.t * w;
            const y0 = h - d0.vs * h;
            const d1 = data[i+1];
            const x1 = d1.t * w;
            const y1 = h - d1.vs * h;

            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();

            if (d1.shoot) {
                ctx.beginPath();
                ctx.arc(x1, y1, 2, 0, 2 * Math.PI);
                ctx.fill();
            }

        }
        requestAnimationFrame(plot);
    }

    return {
        plot
    }
}