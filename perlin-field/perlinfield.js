function setup() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    createCanvas(width, height);
}

function generate(num_lines, num_points, time, zscale, dx, dy) {
    let lines = [];
    for (let i=0; i<num_lines; i++) {
        let line = [];
        for (let j=0; j<num_points; j++) {
            line.push(noise(i * dx, j * dy, time) * zscale - zscale / 2);
        }      
        lines.push(line);
    }
    return lines;
}

function iso_map(x, y, z) {
    // project 3d point into 2d coordinates isometrically
    let x_ = x - y;
    let y_ = (x + y) / 2 - z;
    return [x_, y_];
}

function scale_map(x, y, z, scale, offset) {
    // scale and project 3d point into 2d coordinates
    x *= scale;
    y *= scale;
    z *= scale;
    let [x_, y_] = iso_map(x, y, z);
    x_ = x_ * scale + offset[0];
    y_ = y_ * scale + offset[1];
    return [x_, y_];
}

function render(lines, scale, offset) {
    for (let i=0; i<lines.length-1; i++) {
        for (let j=0; j<lines[i].length-1; j++) {
            // get points of quad
            let [x0_, y0_] = scale_map(i, j, lines[i][j][0], scale, offset);
            let [x1_, y1_] = scale_map(i+1, j, lines[i+1][j][0], scale, offset);
            let [x2_, y2_] = scale_map(i, j+1, lines[i][j+1][0], scale, offset);
            let [x3_, y3_] = scale_map(i+1, j+1, lines[i+1][j+1][0], scale, offset);

            // get color of quad (average of 4 points)
            //let c = (lines[i][j][1] + lines[i+1][j][1] + lines[i][j+1][1] + lines[i+1][j+1][1]) / 4 * 255;
            let c = lines[i][j][1] * 240;
            fill(c);
            stroke(255-c);

            drawShapePencil([[x0_, y0_], [x1_, y1_], [x3_, y3_], [x2_, y2_]]);
        }
    }
}

function renderClouds(lines, scale, offset) {
    fill(255, 255, 255, 127);
    stroke(255, 255, 255, 127);
    for (let i=0; i<lines.length-1; i++) {
        for (let j=0; j<lines[i].length-1; j++) {
            if (lines[i][j] < 21) {
                continue;
            }
            // get points of quad
            let [x0_, y0_] = scale_map(i, j, lines[i][j], scale, offset);
            let [x1_, y1_] = scale_map(i+1, j, lines[i+1][j], scale, offset);
            let [x2_, y2_] = scale_map(i, j+1, lines[i][j+1], scale, offset);
            let [x3_, y3_] = scale_map(i+1, j+1, lines[i+1][j+1], scale, offset);
            drawShapePencil([[x0_, y0_], [x1_, y1_], [x3_, y3_], [x2_, y2_]]);
        }
    }
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function drawShapePencil(vertices) {
    let interpolate_points = 5;
    let random_offset = 1;
    let x0, y0, x1, y1;
    beginShape();
    for (let i=0; i<vertices.length; i++) {
        [x0, y0] = vertices[i];
        [x1, y1] = vertices[(i+1) % vertices.length];
        // interpolate
        for (let j=0; j<interpolate_points; j++) {
            let t = j / interpolate_points;
            let x = x0 + (x1 - x0) * t + random(-random_offset, random_offset);
            let y = y0 + (y1 - y0) * t + random(-random_offset, random_offset);
            vertex(x, y);
        }
    }
    endShape(CLOSE);
}

function draw() {
    background(230);

    let num_lines = 50;
    let num_points = 50;
    let time = millis() / 4000;

    let scale = 3;
    let offset = [width/2, height/2 - scale_map(num_lines/2, num_points/2 - 10, 0, scale, [0, 0])[1]];

    let waves = generate(num_lines, num_points, time, 10, 0.2, 0.1);
    let mountains = generate(num_lines, num_points, time/10, 40, 0.1, 0.1);
    let clouds = generate(num_lines, num_points, time/2, 20, 0.1, 0.1);

    let mountains_clipped = [];
    for (let i=0; i<waves.length; i++) {
        let line = [];
        for (let j=0; j<waves[i].length; j++) {
            if (mountains[i][j] > waves[i][j]) {
                line.push([mountains[i][j], 1]);
            } else {
                line.push([waves[i][j], 0]);
            }
        }
        mountains_clipped.push(line);
    }

    for (let i=0; i<clouds.length; i++) {
        for (let j=0; j<clouds[i].length; j++) {
            clouds[i][j] += 20;
        }
    }
    
    render(mountains_clipped, scale, offset);
    renderClouds(clouds, scale, offset);
    frameRate(15);
}