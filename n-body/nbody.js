let points;

function setup() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    createCanvas(width, height);
    points = generate(500);
    background(0, 0, 50);
}

function generate(num_points) {
    let points = [];
    for (let i=0; i<num_points; i++) {
        points.push([
            random(width),  // x
            random(height), // y
            random(-2, 2),  // dx
            random(-2, 2),  // dy
            random(1, 5),              // mass
            [               // color
                random(255),
                0,
                random(255)
            ]
        ]);
    }
    // sun
    points.push([
        width / 2,
        height / 2,
        0,
        0,
        50,
        [255, 255, 255]
    ]);
    return points;
}

function calculateForces(points) {
    let k = 0.5;
    for (let i=0; i<points.length-1; i++) {
        let point = points[i];
        for (let j=0; j<points.length; j++) {
            if (i != j) {
                let other = points[j];
                let dx = k * (other[0] - point[0]);
                let dy = k * (other[1] - point[1]);
                let d = Math.sqrt(dx*dx + dy*dy) + 1;
                let fx = other[4] * dx / (d * d * d);
                let fy = other[4] * dy / (d * d * d);
                point[2] += fx;
                point[3] += fy;
            }
        }
    }
}

function movePoints(points) {
    for (let i=0; i<points.length; i++) {
        let point = points[i];
        point[0] += point[2];
        point[1] += point[3];
    }
}

function draw() {
    background(0, 0, 50, 10);
    noStroke();
    calculateForces(points);
    movePoints(points);
    for (let i=0; i<points.length; i++) {
        let point = points[i];
        fill(point[5][0], point[5][1], point[5][2]);
        circle(point[0], point[1], point[4]);
    };
}