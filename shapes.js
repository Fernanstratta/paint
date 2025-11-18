    // shapes.js - Clases de figuras geométricas

    export class Shape {
        constructor(strokeColor, fillColor, lineWidth, useFill) {
            this.strokeColor = strokeColor;
            this.fillColor = fillColor;
            this.lineWidth = lineWidth;
            this.useFill = useFill;
            this.selected = false;
        }

        draw(ctx) {}
        contains(x, y) { return false; }
        getBounds() { return { x: 0, y: 0, width: 0, height: 0 }; }
        move(dx, dy) {}
        resize(handle, x, y, maintainAspect = false) {}
        getResizeHandle(x, y) { return -1; }
    }

    export class Line extends Shape {
        constructor(x1, y1, x2, y2, strokeColor, lineWidth, algorithm = 'bresenham') {
            super(strokeColor, null, lineWidth, false);
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
            this.algorithm = algorithm;
        }

        draw(ctx) {
            if (this.algorithm === 'bresenham') {
                this.drawBresenham(ctx);
            } else if (this.algorithm === 'dda') {
                this.drawDDA(ctx);
            } else {
                this.drawNative(ctx);
            }

            if (this.selected) {
                this.drawSelectionHandles(ctx);
            }
        }

        drawBresenham(ctx) {
            let x1 = Math.round(this.x1);
            let y1 = Math.round(this.y1);
            let x2 = Math.round(this.x2);
            let y2 = Math.round(this.y2);

            let dx = Math.abs(x2 - x1);
            let dy = Math.abs(y2 - y1);
            let sx = x1 < x2 ? 1 : -1;
            let sy = y1 < y2 ? 1 : -1;
            let err = dx - dy;

            ctx.fillStyle = this.strokeColor;
            const halfWidth = Math.floor(this.lineWidth / 2);

            while (true) {
                for (let i = -halfWidth; i <= halfWidth; i++) {
                    for (let j = -halfWidth; j <= halfWidth; j++) {
                        ctx.fillRect(x1 + i, y1 + j, 1, 1);
                    }
                }

                if (x1 === x2 && y1 === y2) break;
                let e2 = 2 * err;
                if (e2 > -dy) { err -= dy; x1 += sx; }
                if (e2 < dx) { err += dx; y1 += sy; }
            }
        }

        drawDDA(ctx) {
            let x1 = this.x1;
            let y1 = this.y1;
            let x2 = this.x2;
            let y2 = this.y2;

            let dx = x2 - x1;
            let dy = y2 - y1;
            let steps = Math.max(Math.abs(dx), Math.abs(dy));

            let xInc = dx / steps;
            let yInc = dy / steps;

            ctx.fillStyle = this.strokeColor;
            const halfWidth = Math.floor(this.lineWidth / 2);

            for (let i = 0; i <= steps; i++) {
                let x = Math.round(x1);
                let y = Math.round(y1);
                
                for (let j = -halfWidth; j <= halfWidth; j++) {
                    for (let k = -halfWidth; k <= halfWidth; k++) {
                        ctx.fillRect(x + j, y + k, 1, 1);
                    }
                }
                
                x1 += xInc;
                y1 += yInc;
            }
        }

        drawNative(ctx) {
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.lineWidth;
            ctx.beginPath();
            ctx.moveTo(this.x1, this.y1);
            ctx.lineTo(this.x2, this.y2);
            ctx.stroke();
        }

        drawSelectionHandles(ctx) {
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x1 - 4, this.y1 - 4, 8, 8);
            ctx.fillRect(this.x2 - 4, this.y2 - 4, 8, 8);
        }

        contains(x, y) {
            const threshold = 10;
            const dx = this.x2 - this.x1;
            const dy = this.y2 - this.y1;
            const length = Math.sqrt(dx * dx + dy * dy);
            const dot = ((x - this.x1) * dx + (y - this.y1) * dy) / (length * length);
            const closestX = this.x1 + dot * dx;
            const closestY = this.y1 + dot * dy;
            const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);
            return distance < threshold && dot >= 0 && dot <= 1;
        }

        getBounds() {
            return {
                x: Math.min(this.x1, this.x2),
                y: Math.min(this.y1, this.y2),
                width: Math.abs(this.x2 - this.x1),
                height: Math.abs(this.y2 - this.y1)
            };
        }

        move(dx, dy) {
            this.x1 += dx;
            this.y1 += dy;
            this.x2 += dx;
            this.y2 += dy;
        }

        resize(handle, x, y) {
            if (handle === 0) {
                this.x1 = x;
                this.y1 = y;
            } else if (handle === 1) {
                this.x2 = x;
                this.y2 = y;
            }
        }

        getResizeHandle(x, y) {
            if (Math.abs(x - this.x1) < 8 && Math.abs(y - this.y1) < 8) return 0;
            if (Math.abs(x - this.x2) < 8 && Math.abs(y - this.y2) < 8) return 1;
            return -1;
        }
    }

    export class Rectangle extends Shape {
        constructor(x, y, width, height, strokeColor, fillColor, lineWidth, useFill) {
            super(strokeColor, fillColor, lineWidth, useFill);
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }

        draw(ctx) {
            if (this.useFill) {
                ctx.fillStyle = this.fillColor;
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.lineWidth;
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            if (this.selected) {
                this.drawSelectionHandles(ctx);
            }
        }

        drawSelectionHandles(ctx) {
            ctx.fillStyle = '#333';
            const handles = this.getHandlePositions();
            handles.forEach(handle => {
                ctx.fillRect(handle.x - 4, handle.y - 4, 8, 8);
            });
        }

        getHandlePositions() {
            return [
                { x: this.x, y: this.y }, // TL
                { x: this.x + this.width, y: this.y }, // TR
                { x: this.x + this.width, y: this.y + this.height }, // BR
                { x: this.x, y: this.y + this.height } // BL
            ];
        }

        contains(x, y) {
            return x >= this.x && x <= this.x + this.width &&
                y >= this.y && y <= this.y + this.height;
        }

        getBounds() {
            return { x: this.x, y: this.y, width: this.width, height: this.height };
        }

        move(dx, dy) {
            this.x += dx;
            this.y += dy;
        }

        resize(handle, x, y, maintainAspect = false) {
            const originalAspect = Math.abs(this.width / this.height);
            let newX = this.x;
            let newY = this.y;
            let newWidth = this.width;
            let newHeight = this.height;

            switch(handle) {
                case 0: // TL
                    newWidth = this.x + this.width - x;
                    newHeight = this.y + this.height - y;
                    newX = x;
                    newY = y;
                    break;
                case 1: // TR
                    newWidth = x - this.x;
                    newHeight = this.y + this.height - y;
                    newY = y;
                    break;
                case 2: // BR
                    newWidth = x - this.x;
                    newHeight = y - this.y;
                    break;
                case 3: // BL
                    newWidth = this.x + this.width - x;
                    newHeight = y - this.y;
                    newX = x;
                    break;
            }

            if (maintainAspect) {
                const currentAspect = Math.abs(newWidth / newHeight);
                if (currentAspect > originalAspect) {
                    newWidth = Math.abs(newHeight * originalAspect) * Math.sign(newWidth);
                } else {
                    newHeight = Math.abs(newWidth / originalAspect) * Math.sign(newHeight);
                }
            }

            this.x = newX;
            this.y = newY;
            this.width = newWidth;
            this.height = newHeight;
        }

        getResizeHandle(x, y) {
            const handles = this.getHandlePositions();
            for (let i = 0; i < handles.length; i++) {
                if (Math.abs(x - handles[i].x) < 8 && Math.abs(y - handles[i].y) < 8) {
                    return i;
                }
            }
            return -1;
        }
    }

    export class Circle extends Shape {
        constructor(cx, cy, radius, strokeColor, fillColor, lineWidth, useFill) {
            super(strokeColor, fillColor, lineWidth, useFill);
            this.cx = cx;
            this.cy = cy;
            this.radius = radius;
        }

        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI * 2);
            
            if (this.useFill) {
                ctx.fillStyle = this.fillColor;
                ctx.fill();
            }
            
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.lineWidth;
            ctx.stroke();

            if (this.selected) {
                this.drawSelectionHandles(ctx);
            }
        }

        drawSelectionHandles(ctx) {
            ctx.fillStyle = '#333';
            ctx.fillRect(this.cx - 4, this.cy - this.radius - 4, 8, 8);
            ctx.fillRect(this.cx + this.radius - 4, this.cy - 4, 8, 8);
            ctx.fillRect(this.cx - 4, this.cy + this.radius - 4, 8, 8);
            ctx.fillRect(this.cx - this.radius - 4, this.cy - 4, 8, 8);
        }

        contains(x, y) {
            const dx = x - this.cx;
            const dy = y - this.cy;
            return Math.sqrt(dx * dx + dy * dy) <= this.radius;
        }

        getBounds() {
            return {
                x: this.cx - this.radius,
                y: this.cy - this.radius,
                width: this.radius * 2,
                height: this.radius * 2
            };
        }

        move(dx, dy) {
            this.cx += dx;
            this.cy += dy;
        }

        resize(handle, x, y) {
            const dx = x - this.cx;
            const dy = y - this.cy;
            this.radius = Math.sqrt(dx * dx + dy * dy);
        }

        getResizeHandle(x, y) {
            const handles = [
                { x: this.cx, y: this.cy - this.radius },
                { x: this.cx + this.radius, y: this.cy },
                { x: this.cx, y: this.cy + this.radius },
                { x: this.cx - this.radius, y: this.cy }
            ];
            
            for (let i = 0; i < handles.length; i++) {
                if (Math.abs(x - handles[i].x) < 8 && Math.abs(y - handles[i].y) < 8) {
                    return i;
                }
            }
            return -1;
        }
    }

    export class BezierQuadratic extends Shape {
        constructor(points, strokeColor, lineWidth) {
            super(strokeColor, null, lineWidth, false);
            this.points = points;
        }

        draw(ctx) {
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.lineWidth;
            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            ctx.quadraticCurveTo(
                this.points[1].x, this.points[1].y,
                this.points[2].x, this.points[2].y
            );
            ctx.stroke();

            if (this.selected) {
                this.drawControlPoints(ctx);
            }
        }

        drawControlPoints(ctx) {
            ctx.fillStyle = '#333';
            this.points.forEach(p => {
                ctx.fillRect(p.x - 4, p.y - 4, 8, 8);
            });
        }

        contains(x, y) {
            return this.points.some(p => 
                Math.abs(x - p.x) < 10 && Math.abs(y - p.y) < 10
            );
        }

        move(dx, dy) {
            this.points.forEach(p => {
                p.x += dx;
                p.y += dy;
            });
        }
    }

    export class BezierCubic extends Shape {
        constructor(points, strokeColor, lineWidth) {
            super(strokeColor, null, lineWidth, false);
            this.points = points;
        }

        draw(ctx) {
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.lineWidth;
            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            ctx.bezierCurveTo(
                this.points[1].x, this.points[1].y,
                this.points[2].x, this.points[2].y,
                this.points[3].x, this.points[3].y
            );
            ctx.stroke();

            if (this.selected) {
                this.drawControlPoints(ctx);
            }
        }

        drawControlPoints(ctx) {
            ctx.fillStyle = '#333';
            this.points.forEach(p => {
                ctx.fillRect(p.x - 4, p.y - 4, 8, 8);
            });
        }

        contains(x, y) {
            return this.points.some(p => 
                Math.abs(x - p.x) < 10 && Math.abs(y - p.y) < 10
            );
        }

        move(dx, dy) {
            this.points.forEach(p => {
                p.x += dx;
                p.y += dy;
            });
        }
    }