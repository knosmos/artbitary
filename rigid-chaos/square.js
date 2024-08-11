let grid;
let size = 50;

function setup() {
    let width = window.innerWidth;
    let height = window.innerHeight * 10;
    createCanvas(width, height);
    grid = makegrid();
}

function makegrid() {
    let grid = [];
    for (let i=0; i<10; i++) {
        let col = [];
        for (let j=0; j<1000; j++) {
            let entropy = j / 30;
            col.push([
                i + random(-entropy, entropy),
                j + random(-entropy, entropy),
                random(-Math.PI * entropy, Math.PI * entropy)
            ]);
        }
        grid.push(col);
    }
    return grid;
}

function drawShapePencil(vertices, random_offset) {
    let interpolate_points = 5;
    let x0, y0, x1, y1;
    beginShape();
    for (let i=0; i<vertices.length; i++) {
        [x0, y0] = vertices[i];
        [x1, y1] = vertices[(i+1) % vertices.length];
        for (let j=0; j<interpolate_points; j++) {
            let t = j / interpolate_points;
            let x = x0 + (x1 - x0) * t + random(-random_offset, random_offset);
            let y = y0 + (y1 - y0) * t + random(-random_offset, random_offset);
            curveVertex(x, y);
        }
    }
    endShape(CLOSE);
}

function drawSquare(x, y, angle, entropy, offsetx=0, offsety=0) {
    let points = [
        [-size/2, -size/2],
        [size/2, -size/2],
        [size/2, size/2],
        [-size/2, size/2]
    ]
    let final_points = [];
    for (let i=0; i<points.length; i++) {
        let [px, py] = points[i];
        let x_ = x * size + px * cos(angle) - py * sin(angle) + offsetx;
        let y_ = y * size + py * cos(angle) + px * sin(angle) + offsety;
        final_points.push([x_, y_]);
    }
    drawShapePencil(final_points, entropy);
}

function draw() {
    background(245, 244, 242);
    strokeWeight(2);
    stroke(0);
    fill(245, 100);
    for (let i=0; i<grid.length; i++) {
        for (let j=0; j<grid[i].length; j++) {
            // test if visible
            let scroll = window.scrollY;
            let top = (scroll - size) / size;
            let bottom = (scroll + window.innerHeight + size) / size;
            if (j < top || j > bottom) {
                continue;
            }
            let [x, y, angle] = grid[i][j];
            drawSquare(x, y, angle, j / 10, width/2 - size * 5, size);
        }
    }
}