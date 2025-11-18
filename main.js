import { Line, Rectangle, Circle, BezierQuadratic, BezierCubic } from './shapes.js';

class PaintApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.shapes = [];
        this.currentTool = 'select';
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        this.tempShape = null;
        this.selectedShape = null;
        this.resizeHandle = -1;
        this.dragStart = null;
        this.bezierPoints = [];
        this.strokeColor = '#000000';
        this.fillColor = '#ff0000';
        this.lineWidth = 2;
        this.useFill = false;
        this.algorithm = 'bresenham';

        this.initializeEventListeners();
        this.render();
    }

    initializeEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));

        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTool = e.target.dataset.tool;
                this.bezierPoints = [];
                this.render();
            });
        });

        document.getElementById('strokeColor').addEventListener('change', (e) => {
            this.strokeColor = e.target.value;
        });

        document.getElementById('fillColor').addEventListener('change', (e) => {
            this.fillColor = e.target.value;
        });

        document.getElementById('useFill').addEventListener('change', (e) => {
            this.useFill = e.target.checked;
        });

        document.getElementById('lineWidth').addEventListener('input', (e) => {
            this.lineWidth = parseInt(e.target.value);
            document.getElementById('lineWidthValue').textContent = this.lineWidth;
        });

        document.getElementById('algorithm').addEventListener('change', (e) => {
            this.algorithm = e.target.value;
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            if (confirm('¿Deseas limpiar todo el canvas?')) {
                this.shapes = [];
                this.bezierPoints = [];
                this.render();
            }
        });

        document.getElementById('exportImgBtn').addEventListener('click', () => {
            this.exportImage();
        });

        document.getElementById('exportJsonBtn').addEventListener('click', () => {
            this.exportJSON();
        });

        document.getElementById('importJsonBtn').addEventListener('click', () => {
            document.getElementById('jsonFileInput').click();
        });

        document.getElementById('jsonFileInput').addEventListener('change', (e) => {
            this.importJSON(e);
        });
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    onMouseDown(e) {
        const pos = this.getMousePos(e);

        if (this.currentTool === 'select') {
            if (this.selectedShape) {
                this.resizeHandle = this.selectedShape.getResizeHandle(pos.x, pos.y);
                if (this.resizeHandle !== -1) {
                    this.isDrawing = true;
                    return;
                }
            }

            this.selectedShape = null;
            for (let i = this.shapes.length - 1; i >= 0; i--) {
                if (this.shapes[i].contains(pos.x, pos.y)) {
                    this.selectedShape = this.shapes[i];
                    this.shapes[i].selected = true;
                    this.dragStart = pos;
                    break;
                } else {
                    this.shapes[i].selected = false;
                }
            }
            this.render();
        } else if (this.currentTool === 'bezier2' || this.currentTool === 'bezier3') {
            this.bezierPoints.push(pos);
            this.render();
            if (this.currentTool === 'bezier2' && this.bezierPoints.length === 3) {
                const bezier = new BezierQuadratic(
                    this.bezierPoints.map(p => ({ x: p.x, y: p.y })),
                    this.strokeColor,
                    this.lineWidth
                );
                this.shapes.push(bezier);
                this.bezierPoints = [];
                this.render();
            } else if (this.currentTool === 'bezier3' && this.bezierPoints.length === 4) {
                const bezier = new BezierCubic(
                    this.bezierPoints.map(p => ({ x: p.x, y: p.y })),
                    this.strokeColor,
                    this.lineWidth
                );
                this.shapes.push(bezier);
                this.bezierPoints = [];
                this.render();
            }
        } else {
            this.isDrawing = true;
            this.startX = pos.x;
            this.startY = pos.y;
        }
    }

    onMouseMove(e) {
        const pos = this.getMousePos(e);

        if (!this.isDrawing && this.currentTool === 'select' && this.selectedShape && this.dragStart) {
            const dx = pos.x - this.dragStart.x;
            const dy = pos.y - this.dragStart.y;
            this.selectedShape.move(dx, dy);
            this.dragStart = pos;
            this.render();
        } else if (this.isDrawing) {
            if (this.currentTool === 'select' && this.selectedShape && this.resizeHandle !== -1) {
                this.selectedShape.resize(this.resizeHandle, pos.x, pos.y, e.shiftKey);
                this.render();
            } else {
                this.render();
                this.drawPreview(pos.x, pos.y);
            }
        }
    }

    onMouseUp(e) {
        if (!this.isDrawing) {
            this.dragStart = null;
            return;
        }

        const pos = this.getMousePos(e);

        if (this.currentTool === 'line') {
            const line = new Line(
                this.startX,
                this.startY,
                pos.x,
                pos.y,
                this.strokeColor,
                this.lineWidth,
                this.algorithm
            );
            this.shapes.push(line);
        } else if (this.currentTool === 'rectangle') {
            const width = pos.x - this.startX;
            const height = pos.y - this.startY;
            const rect = new Rectangle(
                this.startX,
                this.startY,
                width,
                height,
                this.strokeColor,
                this.fillColor,
                this.lineWidth,
                this.useFill
            );
            this.shapes.push(rect);
        } else if (this.currentTool === 'circle') {
            const dx = pos.x - this.startX;
            const dy = pos.y - this.startY;
            const radius = Math.sqrt(dx * dx + dy * dy);
            const circle = new Circle(
                this.startX,
                this.startY,
                radius,
                this.strokeColor,
                this.fillColor,
                this.lineWidth,
                this.useFill
            );
            this.shapes.push(circle);
        }

        this.isDrawing = false;
        this.resizeHandle = -1;
        this.dragStart = null;
        this.render();
    }

    onDoubleClick(e) {
    }

    drawPreview(x, y) {
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.setLineDash([5, 5]);

        if (this.currentTool === 'line') {
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        } else if (this.currentTool === 'rectangle') {
            const width = x - this.startX;
            const height = y - this.startY;
            this.ctx.strokeRect(this.startX, this.startY, width, height);
        } else if (this.currentTool === 'circle') {
            const dx = x - this.startX;
            const dy = y - this.startY;
            const radius = Math.sqrt(dx * dx + dy * dy);
            this.ctx.beginPath();
            this.ctx.arc(this.startX, this.startY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        this.ctx.setLineDash([]);
    }

    drawBezierPreview() {
        if (this.bezierPoints.length === 0) return;

        this.ctx.fillStyle = 'red';
        this.bezierPoints.forEach(p => {
            this.ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
        });

        if (this.bezierPoints.length > 1) {
            this.ctx.strokeStyle = '#888';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([4, 4]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.bezierPoints[0].x, this.bezierPoints[0].y);
            for (let i = 1; i < this.bezierPoints.length; i++) {
                this.ctx.lineTo(this.bezierPoints[i].x, this.bezierPoints[i].y);
            }
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.shapes.forEach(shape => shape.draw(this.ctx));
        if (this.bezierPoints.length > 0) {
            this.drawBezierPreview();
        }
    }

    exportImage() {
        const link = document.createElement('a');
        link.download = 'paint-canvas.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }

    exportJSON() {
        const data = JSON.stringify(this.shapes, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = 'paint-canvas.json';
        link.href = URL.createObjectURL(blob);
        link.click();
    }

    importJSON(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                this.shapes = [];

                data.forEach(shapeData => {
                    let shape = null;

                    if (shapeData.x1 !== undefined && shapeData.y1 !== undefined) {
                        shape = new Line(
                            shapeData.x1,
                            shapeData.y1,
                            shapeData.x2,
                            shapeData.y2,
                            shapeData.strokeColor,
                            shapeData.lineWidth,
                            shapeData.algorithm || 'bresenham'
                        );
                    } else if (shapeData.width !== undefined && shapeData.height !== undefined) {
                        shape = new Rectangle(
                            shapeData.x,
                            shapeData.y,
                            shapeData.width,
                            shapeData.height,
                            shapeData.strokeColor,
                            shapeData.fillColor,
                            shapeData.lineWidth,
                            shapeData.useFill
                        );
                    } else if (shapeData.radius !== undefined) {
                        shape = new Circle(
                            shapeData.cx,
                            shapeData.cy,
                            shapeData.radius,
                            shapeData.strokeColor,
                            shapeData.fillColor,
                            shapeData.lineWidth,
                            shapeData.useFill
                        );
                    } else if (shapeData.points) {
                        if (shapeData.points.length === 3) {
                            shape = new BezierQuadratic(
                                shapeData.points,
                                shapeData.strokeColor,
                                shapeData.lineWidth
                            );
                        } else if (shapeData.points.length === 4) {
                            shape = new BezierCubic(
                                shapeData.points,
                                shapeData.strokeColor,
                                shapeData.lineWidth
                            );
                        }
                    }

                    if (shape) {
                        this.shapes.push(shape);
                    }
                });

                this.render();
                alert('Archivo JSON cargado correctamente');
            } catch (error) {
                alert('Error al cargar el archivo JSON: ' + error.message);
            }
        };

        reader.readAsText(file);
        e.target.value = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PaintApp();
});
    