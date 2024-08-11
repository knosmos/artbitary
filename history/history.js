let pt_history = [];

function setup() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    createCanvas(width, height);
    pt_history = [getInitial(100, 30)];
}

// generate initial ring of points
function getInitial(radius, n) {
    let points = [];
    for (let i = 0; i < n; i++) {
        let theta = i * 2 * Math.PI / n;
        let x = 0.05 * radius * cos(theta);
        let y = 0.05 * radius * sin(theta);
        points.push([radius, i * 2 * Math.PI / n, noise(x, y)]); // [r, theta]
    }
    return points;
}

// update points
function updatePoints(points, t) {
    let newPoints = [];
    for (let i = 0; i < points.length; i++) {
        let [r, theta, dr] = points[i];
        let x = cos(theta);
        let y = sin(theta);
        let chg = 0.3 * sin(t / 1000 + dr);
        newPoints.push([r + chg, theta, dr + 0.005 * noise(x, y)]);
    }
    return newPoints;
}

// project cylindrical into isometric
function project(r, theta, z) {
    let x = r * cos(theta);
    let y = r * sin(theta);
    let x_ = (x - y) * cos(PI / 6);
    let y_ = (x + y) * sin(PI / 6) - z;
    return [x_, y_];
}

// main loop
function draw() {
    background(240);
    translate(width / 2, height / 2);
    noFill();
    stroke(40, 2, 64);
    
    for (let z = 0; z < pt_history.length; z+=10) {
        let points = pt_history[z];
        strokeWeight(z / 100 + random(0, 1));
        beginShape();
        for (let i = 0; i < points.length + 3; i++) {
            let [r, theta, dr] = points[i % points.length];
            let [x, y] = project(r, theta, z - pt_history.length);
            curveVertex(x, y);
        }
        endShape();
        pt_history.push(
            updatePoints(
                pt_history[
                    pt_history.length - 1
                ], 
                millis()
            )
        );
        if (pt_history.length > 400) {
            pt_history.shift();
        }
    }
}