class OrthoCube {
	constructor(xCenter, yCenter, gridPos, viewAngleDeg, edgeLength, active=false) {
		this.points = [[
			xCenter,  // Ax
			yCenter	  // Ay
		]];

		this.gridPos = gridPos;

		this.viewAngle = viewAngleDeg * Math.PI / 180; // Conver to Rad
		this.edgeLength = edgeLength;
	  
		this.active = active;

		this._buildPoints();
	}
  
	draw(topColor, leftColor, rightColor, raiseHeight=0, cubeScale=1) {
		push();
		scale(cubeScale);
		translate(this.points[0][0], this.points[0][1]);

		// Draws top rhombus
		fill(topColor);
		beginShape();
		vertex(0, raiseHeight);						  				// A
		vertex(this.points[1][0], this.points[1][1] + raiseHeight); // B
		vertex(this.points[6][0], this.points[6][1] + raiseHeight); // G
		vertex(this.points[2][0], this.points[2][1] + raiseHeight); // C
		endShape(CLOSE);

		// Draws left rhombus
		fill(leftColor);
		beginShape();
		vertex(0, raiseHeight);						 				// A
		vertex(this.points[1][0], this.points[1][1] + raiseHeight); // B
		vertex(this.points[3][0], this.points[3][1] + raiseHeight); // D
		vertex(this.points[4][0], this.points[4][1] + raiseHeight); // E
		endShape(CLOSE);

		// Draws right rhombus
		fill(rightColor);
		beginShape();
		vertex(0, raiseHeight);								     	// A
		vertex(this.points[2][0], this.points[2][1] + raiseHeight); // C
		vertex(this.points[5][0], this.points[5][1] + raiseHeight); // F
		vertex(this.points[4][0], this.points[4][1] + raiseHeight); // E
		endShape(CLOSE);

		pop();
	}
	
	/*                       *
	 *           G           *
	 *        •     •        *
	 *     B           C     *
	 *     •  •     •  •     *
	 *     •     A     •     *
	 *     D     •     F     *
	 *        •  •  •        *
	 *           E           *
	 *                       */
	_buildPoints() {
		let B = [
			- this.edgeLength * Math.sin( this.viewAngle / 2 ), // Bx
			- this.edgeLength * Math.cos( this.viewAngle / 2 )  // By
		];

		let C = [
			+ this.edgeLength * Math.sin( this.viewAngle / 2 ), // Cx
			- this.edgeLength * Math.cos( this.viewAngle / 2 )  // Cy
		];

		let D = [
			- this.edgeLength * Math.sin( this.viewAngle / 2 ),     // Dx
			this.edgeLength * (1 - Math.cos( this.viewAngle / 2 ))  // Dy
		];

		let E = [
			+ 0, 			   // Ey
			+ this.edgeLength  // Ex
		];

		let F = [
			+ this.edgeLength * Math.sin( this.viewAngle / 2 ),     // Fx
			this.edgeLength * (1 - Math.cos( this.viewAngle / 2 ))  // Fy
		];

		let G = [
			+ 0,  //Gx
			- 2 * this.edgeLength * Math.cos( this.viewAngle / 2 )
		];

		this.points.push(B, C, D, E, F, G);
	}

	get x() { return this.points[0][0]; }
	get y() { return this.points[0][1]; }
  
}
  

const ANGLE = 120;
const EDGE_LENGTH = 30;
const SEPARATION = 3;
let translationAngle = (Math.PI * (360 - 2 * ANGLE)) / 720;
let translationX = EDGE_LENGTH * Math.cos(translationAngle);
let translationY = EDGE_LENGTH * Math.sin(translationAngle);


let test1 = new OrthoCube(200, 200, undefined, ANGLE, EDGE_LENGTH);
let test2 = new OrthoCube(200 + translationX + SEPARATION, 200 + translationY + SEPARATION, undefined, ANGLE, EDGE_LENGTH);


var x = 300;
var y = 300;
var a = 100;
var b = 100;
// this is the fireworks example
function draw_one_frame() {
	test1.draw(255, 200, 100);
	test2.draw(255, 200, 100);

	//background(255);
	// x += 2;
	// y += 2;
	// a -= 2;
	// b -= 2;
	// strokeWeight(1);
	// translate(width / 2, height / 2);
	// for (var i = 0; i < 15; i++) {
	// 	for (var k = 0; k < 20; k++) {
	// 		stroke(255, 255, 255);
	// 		rotate(PI / 12.0);
	// 		fill(255, 255 - i * 10, 255 - k * 10);
	// 		line(a % 100, b % 100, x % 300, y % 300);
	// 		ellipse((x + i * 20) % width, (y + k * 20) % height, i + 4, i + 4);
	// 		drawtriangle((a - i * 20) % width, (b - k * 20) % height, k / 8);
	// 		rect(x % width, y % height, k + 10, k + 10);
	// 		fill(0, i * 10, 255 - k * 10);
	// 		ellipse((x - i * 20) % width, (y - k * 20) % height, i + 3, i + 3);
	// 		rotate(PI / 24.0);
	// 		fill(255 - (i + k) * 5, (i + k) * 7, i * 20);
	// 		drawtriangle((a + i * 20) % width, (b + k * 20) % height, k / 8);
	// 		rect(a % width, b % height, k + 5, k + 5);
	// 		drawflower(k, x);
	// 	}
	// }
}

function drawtriangle(x, y, r) {
	triangle(x, y, x + 7 * r, y - 13.75 * r, x + 14 * r, y);
}

function drawflower(i, k) {
	if (i % 2 == 1) {
		fill(255, (k * 0.4) % 255, 30);
		stroke(k % 255, 255, 0);
		arc(0, 0, 150 + i + 150 * sin(k * PI / 24), 150, 0, PI / 40);
	} else {
		fill(k % 255, 0, 255);
		stroke(0, (k * 0.4) % 255, 255);
		arc(0, 0, (100 + 100 * cos(k * PI / 24)) % 255, 50, 0, PI / 20);
	}
}