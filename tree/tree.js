let tree;

function setup() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    createCanvas(width, height);

    tree = [[[0, 0, 0]]];
    for (let i=1; i<6; i++) {
        tree.push(makeLayer(tree[i-1], i));
    }
}

function polarToCartesian(r, t) {
    return [r * cos(t), r * sin(t)];
}

function mitchell(r, n) {
    // mitchell best-candidate algorithm
    let pts = [];
    for (let i=0; i<n; i++) {
        let candidates = [];
        for (let j=0; j<10; j++) {
            let cr = Math.random() * r;
            let ct = Math.random() * 2 * Math.PI;
            let [x, y] = polarToCartesian(cr, ct);
            candidates.push([x, y, 0]);
        }
        let best = candidates[0];
        let best_dist = 0;
        for (let j=0; j<candidates.length; j++) {
            let dist = Infinity;
            for (let pt of pts) {
                dist = Math.min(dist, Math.sqrt((candidates[j][0] - pt[0])**2 + (candidates[j][1] - pt[1])**2));
            }
            if (dist > best_dist) {
                best_dist = dist;
                best = candidates[j];
            }
        }
        pts.push(best);
    }
    return pts;
}

function slope(p1,p2){
    /*
    Calculate slope of two points, used to find whether angle is concave.
    */
    return (p1[1]-p2[1])/(p1[0]-p2[0]);
}

function compare(a,b){
    /*
    Comparison function used to sort by x and y coordinates
    */
    if (a[0] == b[0]){
        return a[1]-b[1];
    }
    return a[0]-b[0];
}

function fudge(points){
    /* Used to avoid vertical lines; adds a tiny bit to one point when vertical line is detected */
    let fudgeVal = 0.01;
    for (let i=1; i<points.length; i++){
        if (points[i][0]==points[i-1][0]){
            points[i][0] += fudgeVal;
        }
    }
    return points;
}

function convexhull(points){
    uh = []; // upper hull
    lh = []; // lower hull
    points = points.sort(compare); // sort points in increasing order of x-coordinate
    points = fudge(points);
    /*
    Calculate upper hull first. We process points in order of x-coordinate; for each point, we
    first remove points from uh until the last two points of uh and the
    new point form a convex angle, and then append the new point to uh.
    */
    for (let i=0; i<points.length; i++){
        while (uh.length >= 2){
            if (slope(uh[uh.length-1],uh[uh.length-2]) < slope(uh[uh.length-1],points[i])){
                uh.pop();
            }
            else {
                break;
            }
        }
        uh.push(points[i]);
    }
    /*
    Ditto for the lower hull, except we process from right-to-left instead of left-to-right, and
    our concave angle check is reversed.
    */
    for (let i=points.length-1; i>=0; i--){
        while (lh.length >= 2){
            if (slope(lh[lh.length-1],lh[lh.length-2]) < slope(lh[lh.length-1],points[i])){
                lh.pop();
            }
            else {
                break;
            }
        }
        lh.push(points[i]);
    }
    /*
    Remove last element of each hull (since they overlap) and return full hull
    */
    uh.pop();
    lh.pop();
    return uh.concat(lh);
}

function makeLayer(parents, layer) {
    // get sampled points
    let num_points = Math.pow(3, layer);
    let pts = mitchell(Math.pow(1.5, layer) * 40, num_points);

    // for each point, find the closest parent
    for (let i=0; i<pts.length; i++) {
        let best = 0;
        let best_dist = Infinity;
        for (let j=0; j<parents.length; j++) {
            let dist = Math.sqrt((pts[i][0] - parents[j][0])**2 + (pts[i][1] - parents[j][1])**2);
            if (dist < best_dist) {
                best_dist = dist;
                best = j;
            }
        }
        pts[i][2] = best;
    }
    return pts;
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
    z *= scale * 100;
    let [x_, y_] = iso_map(x, y, z);
    x_ = x_ * scale + offset[0];
    y_ = y_ * scale + offset[1];
    return [x_, y_];
}

function drawShapePencil(vertices) {
    let interpolate_points = 5;
    let random_offset = 3;
    let x0, y0, x1, y1;
    beginShape();
    noFill();
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
    background(140, 11, 93);
    stroke(255);
    for (let i=1; i<tree.length; i++) {
        strokeWeight(0.5);
        for (let pt of tree[i]) {
            pt[0] += random(-1, 1);
            pt[1] += random(-1, 1);
            let [x, y] = scale_map(pt[0], pt[1], i, 1, [width/2, height]);
            let [px, py] = scale_map(
                tree[i-1][pt[2]][0],
                tree[i-1][pt[2]][1],
                i-1,
                1,
                [width/2, height]
            );
            ellipse(x, y, 5, 5);
            drawShapePencil([[x, y], [px, py]]);
        }
        let hull = convexhull(tree[i].map(pt => scale_map(pt[0], pt[1], i, 1, [width/2, height])));
        strokeWeight(2);
        drawShapePencil(hull);
    }
}