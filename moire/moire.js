let points;

function setup() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    createCanvas(width, height);
    let density = 0.005;
    points = generatePoints(width * height * density);
}

function generatePoints(n) {
    let points = [];
    for (let i = 0; i < n; i++) {
        let x = random(width);
        let y = random(height);
        points.push([x, y]);
    }
    return points;
}

function rotatePoint(point, angle, offset) {
    let [x, y] = point;
    x -= offset[0];
    y -= offset[1];
    let x_ = x * cos(angle) - y * sin(angle) + offset[0];
    let y_ = x * sin(angle) + y * cos(angle) + offset[1];
    return [x_, y_];
}

function draw() {
    background(4, 48, 18);
    noStroke();
    fill(255);
    rotated_points = [];
    for (let i = 0; i < points.length; i++) {
        let [x, y] = points[i];
        let [x_, y_] = rotatePoint(
            [x, y],
            0.1 * sin(millis() / 1000),
            [mouseX, mouseY]
        );
        rotated_points.push([x_, y_]);
    }
    fill(255, 255, 255);
    for (let i = 0; i < points.length; i++) {
        let [x, y] = points[i];
        circle(x, y, 5);
    }
    fill(70, 232, 114);
    for (let i = 0; i < rotated_points.length; i++) {
        let [x, y] = rotated_points[i];
        circle(x, y, 5);
    }
}