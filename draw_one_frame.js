class OrthoCube {
	constructor(xCenter, yCenter, gridPos, viewAngleDeg, edgeLength, propagationDir=undefined, active=false) {
		this.points = [[
			xCenter,  // Ax
			yCenter	  // Ay
		]];

		this.gridPos = gridPos;

		this.viewAngle = viewAngleDeg * Math.PI / 180; // Conver to Rad
		this.edgeLength = edgeLength;

		this.propagationDir = propagationDir; // The direction in which the cube moves

		this.active = active;

		this.raiseHeight = 0; // How high to raise the cube above nornmal level
		this.isAffected = false;

		this._initPoints();
	}
  
	draw(cubeCol) {
		push();
		noStroke();
		translate(this.points[0][0], this.points[0][1]);

		// Draws top rhombus
		fill(this._colorBrightness(cubeCol, 1));
		beginShape();
		vertex(0, - this.raiseHeight);						  		     // A
		vertex(this.points[1][0], this.points[1][1] - this.raiseHeight); // B
		vertex(this.points[6][0], this.points[6][1] - this.raiseHeight); // G
		vertex(this.points[2][0], this.points[2][1] - this.raiseHeight); // C
		endShape(CLOSE);

		// Draws left rhombus
		fill(this._colorBrightness(cubeCol, 2/3));
		beginShape();
		vertex(0, - this.raiseHeight);						 			 // A
		vertex(this.points[1][0], this.points[1][1] - this.raiseHeight); // B
		vertex(this.points[3][0], this.points[3][1] - this.raiseHeight); // D
		vertex(this.points[4][0], this.points[4][1] - this.raiseHeight); // E
		endShape(CLOSE);

		// Draws right rhombus
		fill(this._colorBrightness(cubeCol, 1/3));
		beginShape();
		vertex(0, - this.raiseHeight);								     // A
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
						newCube.propagationDir = [+SPEED, 0];
						this.edgeCubes.push(newCube); 
					}
					else if (row === maxRow - 1) {
						newCube.propagationDir = [-SPEED, 0];
						this.edgeCubes.push(newCube);
					}
					else if (col === 0) {
						newCube.propagationDir = [0, +SPEED]
						this.edgeCubes.push(newCube);
					}
					else if (col === maxCol - 1) {
						newCube.propagationDir = [0, -SPEED]
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
		let excludeFromSearch = [];

		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {
				this.cubes[col][row].isAffected = false;
				this.cubes[col][row].raiseHeight = 0;
			}
		}

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

						// Sets the raise height of the next cube to max and changes the active height
						activeCube.raiseHeight = ((this.raiseRadius - 1) * this.maxRaiseHeight / this.raiseRadius)  ;
						nextCube.raiseHeight = this.maxRaiseHeight;

						// Exclude it from search
						excludeFromSearch.push(nextCube);

						// Radiually influence the raise height of adjacent cubes
						this._raiseAdjacentCubes(nextCube);
					}
					
					// Set the active cube to false and reset its propagation, unless it is an edge cube
					activeCube.active = false;
					if (!this.edgeCubes.includes(activeCube)) activeCube.propagationDir = undefined;
				}
			}
		}
	}

	getAdjacentCubes(activeCube) {
		let adjCubes = []; 
		for (let col=-this.raiseRadius; col<=this.raiseRadius; col++) {
			for (let row=-this.raiseRadius; row<=this.raiseRadius; row++) {

				let checkRow = activeCube.row + row;
				let checkCol = activeCube.col + col;
				// Checks if this particular cube is in bounds, ignoring the active
				if (
					checkRow >= 0 && checkRow < this.cubes[0].length &&
					checkCol >= 0 && checkCol < this.cubes.length &&
					!(row === 0 && col === 0)
				) { 
					let cube = this.cubes[checkCol][checkRow];
					if (!cube.active && Math.floor( 
						Math.sqrt( Math.abs(cube.row - activeCube.row) ** 2 + Math.abs(cube.col - activeCube.col) ** 2 ) ) <= this.raiseRadius
					) { 
						cube.isAffected = true;
						adjCubes.push(cube); 
					}
				}
			}
		}
		return adjCubes;
	}

	_raiseAdjacentCubes(activeCube) {
		let adjCubes = this.getAdjacentCubes(activeCube);

		for (let cube of adjCubes) {
			if (cube.isAffected) {
				let range = Math.floor( Math.sqrt( Math.abs(cube.row - activeCube.row) ** 2 + Math.abs(cube.col - activeCube.col) ** 2 ) );
				cube.raiseHeight = ((this.raiseRadius - range) * this.maxRaiseHeight / this.raiseRadius) + cube.raiseHeight ;
			}
		}
	}

	setActiveRandomEdgeCube() {
		let edgeCube = this.edgeCubes[Math.floor(Math.random() * this.edgeCubes.length)];
		console.log(edgeCube.gridPos);
		edgeCube.active = true;
	}
	
	getAllActive() {
		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {
				let activeCube = this.cubes[col][row];
				if (activeCube.active) console.log("POS: (" + activeCube.gridPos + "), DIR: (" + activeCube.propagationDir + ")");
			}
		}
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

const MAX_RAISE_HEIGHT = EDGE_LENGTH * 1.5;
const RAISE_RADIUS = 5;

const grid = new CubeGrid(X, Y, ROW_COUNT, COL_COUNT, ANGLE, EDGE_LENGTH, SEPARATION, MAX_RAISE_HEIGHT, RAISE_RADIUS);

grid.setActiveRandomEdgeCube();


let count = 1;
const LIMIT = 5;
const CHANCE = 0.05
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