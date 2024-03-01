class OrthoCube {
	constructor(xCenter, yCenter, gridPos, viewAngleDeg, edgeLength, propagationDir=undefined, active=false) {
		this.points = [[
			xCenter,  // Ax
			yCenter	  // Ay
		]];

		this.gridPos = gridPos;

		this.viewAngle = viewAngleDeg * Math.PI / 180; // Conver to Rad
		this.edgeLength = edgeLength;

		this.propagationDir = propagationDir;

		this.active = active;

		this._initPoints();
	}
  
	draw(cubeCol, raiseHeight=0) {
		push();
		noStroke();
		translate(this.points[0][0], this.points[0][1]);

		// Draws top rhombus
		fill(this._colorBrightness(cubeCol, 1));
		beginShape();
		vertex(0, - raiseHeight);						  			// A
		vertex(this.points[1][0], this.points[1][1] - raiseHeight); // B
		vertex(this.points[6][0], this.points[6][1] - raiseHeight); // G
		vertex(this.points[2][0], this.points[2][1] - raiseHeight); // C
		endShape(CLOSE);

		// Draws left rhombus
		fill(this._colorBrightness(cubeCol, 2/3));
		beginShape();
		vertex(0, - raiseHeight);						 			// A
		vertex(this.points[1][0], this.points[1][1] - raiseHeight); // B
		vertex(this.points[3][0], this.points[3][1] - raiseHeight); // D
		vertex(this.points[4][0], this.points[4][1] - raiseHeight); // E
		endShape(CLOSE);

		// Draws right rhombus
		fill(this._colorBrightness(cubeCol, 1/3));
		beginShape();
		vertex(0, - raiseHeight);								    // A
		vertex(this.points[2][0], this.points[2][1] - raiseHeight); // C
		vertex(this.points[5][0], this.points[5][1] - raiseHeight); // F
		vertex(this.points[4][0], this.points[4][1] - raiseHeight); // E
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
	_initPoints() {
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

	_colorBrightness(cubeColor, percentage) {
		return [
			cubeColor[0] * percentage, 
			cubeColor[1] * percentage, 
			cubeColor[2] * percentage
		]
	}

	get x() { return this.points[0][0]; }
	get y() { return this.points[0][1]; }

	get row() { return this.gridPos[0]; }
	get col() { return this.gridPos[1]; }
}

class CubeGrid {
	constructor(x, y, maxRow, maxCol, viewAngleDeg, edgeLength, separation, maxRaiseHeight) {
		this.x = x;
		this.y = y;
		this.maxRaiseHeight = maxRaiseHeight;

		let translationAngle = (Math.PI * (360 - 2 * viewAngleDeg)) / 720;
		let translationX = (edgeLength + separation) * Math.cos(translationAngle);
		let translationY = (edgeLength + separation) * Math.sin(translationAngle);

		this.cubes = []; // 2D array of cubes
		this.edgeCubes = [];

		for (let col=0; col<maxCol; col++) {
			let rowArray = [];
			for (let row=0; row<maxRow; row++) {
				// let newX = x + ((col % 2 == 0) ? 2 * row * translationX : (2 * row + 1) * translationX);
				// let newY = y + col * translationY;

				let newX = x + row * translationX;
				let newY = y + row * translationY;

				let newCube = new OrthoCube(newX, newY, [row, col], viewAngleDeg, edgeLength)
				rowArray.push(newCube);

				// Exclude corner cubes
				if (
					!(row === 0 && col === 0) && 
					!(row === 0 && col === maxCol - 1) &&
					!(row === maxRow - 1 && col === 0) && 
					!(row === maxRow - 1 && col === maxCol - 1)
				) {
					if (row === 0) {
						newCube.propagationDir = [+1, 0];
						this.edgeCubes.push(newCube); 
					}
					else if (row === maxRow - 1) {
						newCube.propagationDir = [-1, 0];
						this.edgeCubes.push(newCube);
					}
					else if (col === 0) {
						newCube.propagationDir = [0, +1]
						this.edgeCubes.push(newCube);
					}
					else if (col === maxCol - 1) {
						newCube.propagationDir = [0, -1]
						this.edgeCubes.push(newCube);
					}
				}
			}
			this.cubes.push(rowArray);
			x -= translationX;
			y += translationY;
		}
	}

	draw() {
		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {
				let cube = this.cubes[col][row];
				cube.draw((cube.active) ? [255, 0, 0] : [0, 255, 255], (cube.active === true) ? this.maxRaiseHeight : 0);
			}
		}
	}

	/**
	 * Grab an activeCube
	 * Figure out the nextCube based on the propagationDir
	 * Set the nextCube to active and set its propigation to the activeCube's
	 * Set activeCube.active to false
	 * Set activeCube.propagationDir to undefined (unless it is in this.edgeCubes)
	 * Add nextCube to an array to exclude from search of activeCubes
	 */
	propagateActiveCubes() {
		let excludeFromSearch = [];

		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {

				// Grabs a cube that might be active
				let activeCube = this.cubes[col][row]; 

				// Checks if the cube is active and if it has not been excluded from search
				if (activeCube.active && !excludeFromSearch.includes(activeCube)) {

					// Calculates the next cube based on the active cubes propagation
					let nextRow = activeCube.row + activeCube.propagationDir[0];
					let nextCol = activeCube.col + activeCube.propagationDir[1];

					// Checks if that propagation is in range of the main array
					if (
						nextRow >= 0 && nextRow < this.cubes[0].length &&
						nextCol >= 0 && nextCol < this.cubes.length
					) {
						// Grabs the cube to propagate to
						let nextCube = this.cubes[nextCol][nextRow];
						
						// Set the next cube's active to true and, if it is not an edge cube, set its propagation to the active 
						// This has the unintended, but interesting, side effect of the active cube "rebounding"
						nextCube.active = true;
						if (!this.edgeCubes.includes(nextCube)) nextCube.propagationDir = activeCube.propagationDir;

						// Exclude it from search
						excludeFromSearch.push(nextCube);

					}
					
					// Set the active cube to false and reset its propagation, unless it is an edge cube
					activeCube.active = false;
					if (!this.edgeCubes.includes(activeCube)) activeCube.propagationDir = undefined;
				}
			}
		}
	}

	toggleCubeActive(row, col) {
		this.cubes[col][row].active = !this.cubes[col][row].active;
	}

	toggleEdgeCubeActive() {
		for (let cube of this.edgeCubes) {
			this.toggleCubeActive(cube.row, cube.col);
		}
	}

	setActiveRandomEdgeCube() {
		let edgeCube = this.edgeCubes[Math.floor(Math.random() * this.edgeCubes.length)];
		console.log(edgeCube.gridPos);
		edgeCube.active = true;
	}
}





const ANGLE = 120;
const EDGE_LENGTH = canvasHeight/9;
const SEPARATION = 7;
const ROW_COUNT = 23;
const COL_COUNT = 23;
const RAISE_HEIGHT = 20;

const grid = new CubeGrid(canvasWidth/2, -canvasHeight, ROW_COUNT, COL_COUNT, ANGLE, EDGE_LENGTH, SEPARATION, RAISE_HEIGHT);

let test = [1, 2, 3, 4]


function draw_one_frame() {
	
	grid.draw();
	grid.propagateActiveCubes();
	
	// noLoop();
	
}





// var x = 300;
// var y = 300;
// var a = 100;
// var b = 100;

// // this is the fireworks example
// function legacy() {
// 	background(255);
// 	x += 2;
// 	y += 2;
// 	a -= 2;
// 	b -= 2;
// 	strokeWeight(1);
// 	translate(width / 2, height / 2);
// 	for (var i = 0; i < 15; i++) {
// 		for (var k = 0; k < 20; k++) {
// 			stroke(255, 255, 255);
// 			rotate(PI / 12.0);
// 			fill(255, 255 - i * 10, 255 - k * 10);
// 			line(a % 100, b % 100, x % 300, y % 300);
// 			ellipse((x + i * 20) % width, (y + k * 20) % height, i + 4, i + 4);
// 			drawtriangle((a - i * 20) % width, (b - k * 20) % height, k / 8);
// 			rect(x % width, y % height, k + 10, k + 10);
// 			fill(0, i * 10, 255 - k * 10);
// 			ellipse((x - i * 20) % width, (y - k * 20) % height, i + 3, i + 3);
// 			rotate(PI / 24.0);
// 			fill(255 - (i + k) * 5, (i + k) * 7, i * 20);
// 			drawtriangle((a + i * 20) % width, (b + k * 20) % height, k / 8);
// 			rect(a % width, b % height, k + 5, k + 5);
// 			drawflower(k, x);
// 		}
// 	}
// }


// function drawtriangle(x, y, r) {
// 	triangle(x, y, x + 7 * r, y - 13.75 * r, x + 14 * r, y);
// }

// function drawflower(i, k) {
// 	if (i % 2 == 1) {
// 		fill(255, (k * 0.4) % 255, 30);
// 		stroke(k % 255, 255, 0);
// 		arc(0, 0, 150 + i + 150 * sin(k * PI / 24), 150, 0, PI / 40);
// 	} else {
// 		fill(k % 255, 0, 255);
// 		stroke(0, (k * 0.4) % 255, 255);
// 		arc(0, 0, (100 + 100 * cos(k * PI / 24)) % 255, 50, 0, PI / 20);
// 	}
// }