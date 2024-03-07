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

	draw(coldCol, hotCol, maxRaiseHeight, dimensional=false) {
		push();
		noStroke();
		translate(this.points[0][0], this.points[0][1]);

		fill(this._heatMapColor(coldCol, hotCol, maxRaiseHeight));

		// Draws top rhombus
		if (dimensional) fill(this._heatMapColor(this._colorBrightness(coldCol, 1), this._colorBrightness(hotCol, 1), maxRaiseHeight));
		beginShape();
		vertex(0, - this.raiseHeight);                                   // A
		vertex(this.points[1][0], this.points[1][1] - this.raiseHeight); // B
		vertex(this.points[6][0], this.points[6][1] - this.raiseHeight); // G
		vertex(this.points[2][0], this.points[2][1] - this.raiseHeight); // C
		endShape(CLOSE);

		// Draws left rhombus
		if (dimensional) fill(this._heatMapColor(this._colorBrightness(coldCol, 2/3), this._colorBrightness(hotCol, 2/3), maxRaiseHeight));
		beginShape();
		vertex(0, - this.raiseHeight);                                   // A
		vertex(this.points[1][0], this.points[1][1] - this.raiseHeight); // B
		vertex(this.points[3][0], this.points[3][1] - this.raiseHeight); // D
		vertex(this.points[4][0], this.points[4][1] - this.raiseHeight); // E
		endShape(CLOSE);

		// Draws right rhombus
		if (dimensional) fill(this._heatMapColor(this._colorBrightness(coldCol, 1/3), this._colorBrightness(hotCol, 1/3), maxRaiseHeight));
		beginShape();
		vertex(0, - this.raiseHeight);                                   // A
		vertex(this.points[2][0], this.points[2][1] - this.raiseHeight); // C
		vertex(this.points[5][0], this.points[5][1] - this.raiseHeight); // F
		vertex(this.points[4][0], this.points[4][1] - this.raiseHeight); // E
		endShape(CLOSE);

		pop();
	}

	_heatMapColor(col1, col2, maxRaiseHeight) {
		push();
		colorMode(RGB);
		let heatCol = lerpColor(color(col1), color(col2), map(this.raiseHeight, 0, 1.25 * maxRaiseHeight, 0, 1));
		pop();

		return heatCol;
	}

	_colorBrightness(cubeColor, percentage) {
		if (typeof cubeColor === "number") return cubeColor * percentage;
		
		let newCubeCol = [];
		for (let i=0; i<cubeColor.length; i++) {
			newCubeCol[i] = cubeColor[i] * percentage;
		}
		return newCubeCol;
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

	get x() { return this.points[0][0]; }
	get y() { return this.points[0][1]; }

	get row() { return this.gridPos[0]; }
	get col() { return this.gridPos[1]; }
}

class CubeGrid {
	constructor(x, y, maxRow, maxCol, viewAngleDeg, edgeLength, separation, maxRaiseHeight, raiseRadius, dimensional) {
		const SPEED = 1;

		// x and y values for the very top cube
		this.x = x;
		this.y = y;
		this.dimensional = dimensional;

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
				cube.draw(passiveCol, activeCol, this.maxRaiseHeight, this.dimensional);
			}
		}
	}

	propagateActiveCubes(rebound=true) {
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
				if (rebound) {
					nextCube.active = true;
					if (!this.edgeCubes.includes(nextCube)) nextCube.propagationVector = activeCube.propagationVector;
				}
				else {
					if (!this.edgeCubes.includes(nextCube)) {
						nextCube.active = true;
						nextCube.propagationVector = activeCube.propagationVector;
					}
				}
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

	setActiveRandomEdgeCube() {
		let edgeCube = this.edgeCubes[Math.floor(Math.random() * this.edgeCubes.length)];
		// console.log(edgeCube.gridPos);
		edgeCube.active = true;
	}

	_dist(cube, activeCube) {
		return Math.sqrt( Math.abs(cube.row - activeCube.row) ** 2 + Math.abs(cube.col - activeCube.col) ** 2 );
	}

	_raiseAdjacentCubes() {
		const DEGENERATION = 0.85;
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
				cube.raiseHeight = (count > 0) ? newRaiseHeight : cube.raiseHeight * DEGENERATION;
			}
		}
	}
}


const ANGLE = 120;
const EDGE_LENGTH = canvasHeight/20; // canvasHeight/20 for 13x13, canvasHeight/30 for 24x24
const SEPARATION = 3;

const X = canvasWidth/2	
const Y = canvasHeight/6; // canvasHeight/6 for 13x13, canvasHeight/18 for 24x24

// 13x13 is perfect for rebounding, 24x24 is perfect for linear
const ROW_COUNT = 13; 
const COL_COUNT = 13; 

const MAX_RAISE_HEIGHT = EDGE_LENGTH * 1.5;
const RAISE_RADIUS = 6;

const BGC = [0, 0, 130];
const PSV_COL = [0, 120, 215];
const ACV_COL = [255, 30, 10];
const DIMENSIONAL = true;

const grid = new CubeGrid(X, Y, ROW_COUNT, COL_COUNT, ANGLE, EDGE_LENGTH, SEPARATION, MAX_RAISE_HEIGHT, RAISE_RADIUS, DIMENSIONAL);


const REBOUND = true;

let count = 0;
const LIMIT = 3;
const CHANCE = 0.05;

grid.setActiveRandomEdgeCube();
grid.setActiveRandomEdgeCube();
grid.setActiveRandomEdgeCube();
grid.setActiveRandomEdgeCube();

function draw_one_frame() {
	background(BGC);

	grid.draw(PSV_COL, ACV_COL);

	grid.propagateActiveCubes(REBOUND);


	if (!REBOUND) {
		if (grid.getAllActive().length < 1) {
			if (Math.random() > 1 - CHANCE) {
				grid.setActiveRandomEdgeCube();
			}
		}
	}
}


/* LEGACY
const EDGE_LENGTH = canvasHeight/16;
const SEPARATION = 3;

const X = canvasWidth/2	
const Y = -canvasHeight; // canvasHeight/6 for 13x13, -canvasHeight/5 for 24x24

// 13x13 is perfect for rebounding, 24x24 is perfect for linear
const ROW_COUNT = 48; 
const COL_COUNT = 48; 

const MAX_RAISE_HEIGHT = EDGE_LENGTH * 2;
const RAISE_RADIUS = 11;

const REBOUND = false;
*/