export class Line {
    constructor(x1, y1, x2, y2, strokeColor, lineWidth, algorithm = 'bresenham') {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;
        this.algorithm = algorithm;
        this.selected = false;
    }

    draw(ctx) {
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
    }

    contains() { return false; }
    getResizeHandle() { return -1; }
    move(dx, dy) {
        this.x1 += dx;
        this.y1 += dy;
        this.x2 += dx;
        this.y2 += dy;
    }
    resize() {}
}

export class Rectangle {
    constructor(x, y, width, height, strokeColor, fillColor, lineWidth, useFill) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.strokeColor = strokeColor;
        this.fillColor = fillColor;
        this.lineWidth = lineWidth;
        this.useFill = useFill;
        this.selected = false;
    }

    draw(ctx) {
        ctx.lineWidth = this.lineWidth;
        if (this.useFill) {
            ctx.fillStyle = this.fillColor;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        ctx.strokeStyle = this.strokeColor;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    contains(px, py) {
        return (
            px >= this.x &&
            px <= this.x + this.width &&
            py >= this.y &&
            py <= this.y + this.height
        );
    }

    getResizeHandle() { return -1; }
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
    resize() {}
}

export class Circle {
    constructor(cx, cy, radius, strokeColor, fillColor, lineWidth, useFill) {
        this.cx = cx;
        this.cy = cy;
        this.radius = radius;
        this.strokeColor = strokeColor;
        this.fillColor = fillColor;
        this.lineWidth = lineWidth;
        this.useFill = useFill;
        this.selected = false;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI * 2);
        if (this.useFill) {
            ctx.fillStyle = this.fillColor;
            ctx.fill();
        }
        ctx.strokeStyle = this.strokeColor;
        ctx.stroke();
    }

    contains(px, py) {
        const dx = px - this.cx;
        const dy = py - this.cy;
        return dx * dx + dy * dy <= this.radius * this.radius;
    }

    getResizeHandle() { return -1; }
    move(dx, dy) {
        this.cx += dx;
        this.cy += dy;
    }
    resize() {}
}

export class BezierQuadratic {
    constructor(points, strokeColor, lineWidth) {
        this.points = points;
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;
        this.selected = false;
    }

    draw(ctx) {
        if (this.points.length !== 3) return;
        const [p0, p1, p2] = this.points;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
        ctx.stroke();
    }

    contains() { return false; }
    getResizeHandle() { return -1; }
    move(dx, dy) {
        this.points.forEach(p => {
            p.x += dx;
            p.y += dy;
        });
    }
    resize() {}
}

export class BezierCubic {
    constructor(points, strokeColor, lineWidth) {
        this.points = points;
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;
        this.selected = false;
    }

    draw(ctx) {
        if (this.points.length !== 4) return;
        const [p0, p1, p2, p3] = this.points;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        ctx.stroke();
    }

    contains() { return false; }
    getResizeHandle() { return -1; }
    move(dx, dy) {
        this.points.forEach(p => {
            p.x += dx;
            p.y += dy;
        });
    }
    resize() {}
}
    