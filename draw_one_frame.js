class OrthoCube {
	constructor(xCenter, yCenter, gridPos, viewAngleDeg, edgeLength, propagationVector=undefined, active=false) {
		this.points = [[
			xCenter,  // Ax
			yCenter	  // Ay
		]];

		this.gridPos = gridPos;

		this.viewAngle = viewAngleDeg * Math.PI / 180; // Conver to Rad
		this.edgeLength = edgeLength;

		this.propagationVector = propagationVector; // The direction in which the cube moves

		this.active = active;

		this.raiseHeight = 0; // How high to raise the cube above nornmal level

		this._initPoints();
	}
  
	draw(cubeCol) {
		push();
		noStroke();
		translate(this.points[0][0], this.points[0][1]);

		// Draws top rhombus
		fill(this._colorBrightness(cubeCol, 1));
		beginShape();
		vertex(0, - this.raiseHeight);                                   // A
		vertex(this.points[1][0], this.points[1][1] - this.raiseHeight); // B
		vertex(this.points[6][0], this.points[6][1] - this.raiseHeight); // G
		vertex(this.points[2][0], this.points[2][1] - this.raiseHeight); // C
		endShape(CLOSE);

		// Draws left rhombus
		fill(this._colorBrightness(cubeCol, 2/3));
		beginShape();
		vertex(0, - this.raiseHeight);                                   // A
		vertex(this.points[1][0], this.points[1][1] - this.raiseHeight); // B
		vertex(this.points[3][0], this.points[3][1] - this.raiseHeight); // D
		vertex(this.points[4][0], this.points[4][1] - this.raiseHeight); // E
		endShape(CLOSE);

		// Draws right rhombus
		fill(this._colorBrightness(cubeCol, 1/3));
		beginShape();
		vertex(0, - this.raiseHeight);                                   // A
		vertex(this.points[2][0], this.points[2][1] - this.raiseHeight); // C
		vertex(this.points[5][0], this.points[5][1] - this.raiseHeight); // F
		vertex(this.points[4][0], this.points[4][1] - this.raiseHeight); // E
		endShape(CLOSE);

		pop();
	}
	
	/*  
	 * Calculates the points on the cube
	 * 
	 *                       *
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
			+ 0,                                                    //Gx
			- 2 * this.edgeLength * Math.cos( this.viewAngle / 2 )  //Gy
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
	constructor(x, y, maxRow, maxCol, viewAngleDeg, edgeLength, separation, maxRaiseHeight, raiseRadius) {
		const SPEED = 1;

		// x and y values for the very top cube
		this.x = x;
		this.y = y;

		// Maximum raise height for active cubes
		this.maxRaiseHeight = maxRaiseHeight;

		// Radius of influence of active cubes 
		this.raiseRadius = raiseRadius;

		let translationAngle = (Math.PI * (360 - 2 * viewAngleDeg)) / 720;
		let translationX = (edgeLength + separation) * Math.cos(translationAngle);
		let translationY = (edgeLength + separation) * Math.sin(translationAngle);

		this.cubes = []; // 2D array of cubes
		this.edgeCubes = []; // Array of edge cubes

		for (let col=0; col<maxCol; col++) {
			let rowArray = [];
			for (let row=0; row<maxRow; row++) {

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
						newCube.propagationVector = [+SPEED, 0];
						this.edgeCubes.push(newCube); 
					}
					else if (row === maxRow - 1) {
						newCube.propagationVector = [-SPEED, 0];
						this.edgeCubes.push(newCube);
					}
					else if (col === 0) {
						newCube.propagationVector = [0, +SPEED]
						this.edgeCubes.push(newCube);
					}
					else if (col === maxCol - 1) {
						newCube.propagationVector = [0, -SPEED]
						this.edgeCubes.push(newCube);
					}
				}
			}
			this.cubes.push(rowArray);
			x -= translationX;
			y += translationY;
		}
	}

	draw(passiveCol, activeCol) {
		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {
				let cube = this.cubes[col][row];
				cube.draw((cube.active) ? activeCol : passiveCol);
			}
		}
	}

	propagateActiveCubes() {
		let activeCubes = this.getAllActive();

		for (let activeCube of activeCubes) {
			// Calculates the next cube based on the active cubes propagation
			let nextRow = activeCube.row + activeCube.propagationVector[0];
			let nextCol = activeCube.col + activeCube.propagationVector[1];

			// Checks if that propagation is in range of the main array
			if (
				nextRow >= 0 && nextRow < this.cubes[0].length &&
				nextCol >= 0 && nextCol < this.cubes.length
			) {
				let nextCube = this.cubes[nextCol][nextRow];

				// Set the next cube's active to true and, if it is not an edge cube, set its propagation to the active 
				// This has the unintended, but interesting, side effect of the active cube "rebounding"
				nextCube.active = true;
				if (!this.edgeCubes.includes(nextCube)) nextCube.propagationVector = activeCube.propagationVector;
			}

			// Set the active cube to false and reset its propagation, unless it is an edge cube
			activeCube.active = false;
			if (!this.edgeCubes.includes(activeCube)) activeCube.propagationVector = undefined;
		}

		this._raiseAdjacentCubes();
	}

	getAllActive() {
		let activeCubes = [];
		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {
				let activeCube = this.cubes[col][row];
				if (activeCube.active) activeCubes.push(activeCube);
			}
		}
		return activeCubes;
	}

	_dist(cube, activeCube) {
		return Math.sqrt( Math.abs(cube.row - activeCube.row) ** 2 + Math.abs(cube.col - activeCube.col) ** 2 );
	}

	_raiseAdjacentCubes() {
		let activeCubes = this.getAllActive();

		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {
				let count = 0;
				let newRaiseHeight = 0;
				let cube = this.cubes[col][row];

				for (let activeCube of activeCubes) {
					let range = this._dist(cube, activeCube);
					
					if (range <= this.raiseRadius) {
						newRaiseHeight += ( this.raiseRadius - range ) * this.maxRaiseHeight / this.raiseRadius;
						count++;
					}
				}
				cube.raiseHeight = (count > 0) ? newRaiseHeight : 0;
			}
		}
	}

	setActiveRandomEdgeCube() {
		let edgeCube = this.edgeCubes[Math.floor(Math.random() * this.edgeCubes.length)];
		console.log(edgeCube.gridPos);
		edgeCube.active = true;
	}
}


const ANGLE = 120;
const EDGE_LENGTH = canvasHeight/20;
const SEPARATION = 1;

const X = canvasWidth/2	
const Y = canvasHeight/6; // canvasHeight/6 for 13x13, -canvasHeight/5 for 24x24

// 13x13 is perfect for rebounding, 24x24 is perfect for linear
const ROW_COUNT = 13; 
const COL_COUNT = 13; 

const MAX_RAISE_HEIGHT = EDGE_LENGTH * 1;
const RAISE_RADIUS = 6;

const grid = new CubeGrid(X, Y, ROW_COUNT, COL_COUNT, ANGLE, EDGE_LENGTH, SEPARATION, MAX_RAISE_HEIGHT, RAISE_RADIUS);

grid.setActiveRandomEdgeCube();

let count = 1;
const LIMIT = 5;
const CHANCE = 0.1;
function draw_one_frame() {

	grid.draw([0, 255, 255], [255, 0, 0]);

	grid.propagateActiveCubes();

	if (count < LIMIT) {
		if (Math.random() > 1 - CHANCE) {
			grid.setActiveRandomEdgeCube();
			count++;
		}
	}
}