class OrthoCube {
	constructor(xCenter, yCenter, gridPos, viewAngleDeg, edgeLength, propagationVector=undefined, active=false) {
		// Positioning
		this.points = [[
			xCenter,  // Ax
			yCenter	  // Ay
		]];

		this.gridPos = gridPos; // Position on grid
		this.propagationVector = propagationVector; // The direction in which the cube moves

		// Rendering
		this.viewAngle = viewAngleDeg * Math.PI / 180; // Conver to Rad
		this.edgeLength = edgeLength;

		// Status
		this.active = active; // Decides whether the cube is "moving" or not
		this.raiseHeight = 0; // Raise height of the cube

		// Building 
		this._initPoints();
	}

	draw(coldCol, warmCol, maxRaiseHeight, dimensional=false) {
		push();
		noStroke();
		translate(this.points[0][0], this.points[0][1]);

		fill(this._heatMapColor(coldCol, warmCol, maxRaiseHeight));

		// Draws top rhombus
		if (dimensional) fill(this._heatMapColor(this._colorBrightness(coldCol, 1), this._colorBrightness(warmCol, 1), maxRaiseHeight));
		beginShape();
		vertex(0, - this.raiseHeight);                                   // A
		vertex(this.points[1][0], this.points[1][1] - this.raiseHeight); // B
		vertex(this.points[6][0], this.points[6][1] - this.raiseHeight); // G
		vertex(this.points[2][0], this.points[2][1] - this.raiseHeight); // C
		endShape(CLOSE);

		// Draws left rhombus
		if (dimensional) fill(this._heatMapColor(this._colorBrightness(coldCol, 2/3), this._colorBrightness(warmCol, 2/3), maxRaiseHeight));
		beginShape();
		vertex(0, - this.raiseHeight);                                   // A
		vertex(this.points[1][0], this.points[1][1] - this.raiseHeight); // B
		vertex(this.points[3][0], this.points[3][1] - this.raiseHeight); // D
		vertex(this.points[4][0], this.points[4][1] - this.raiseHeight); // E
		endShape(CLOSE);

		// Draws right rhombus
		if (dimensional) fill(this._heatMapColor(this._colorBrightness(coldCol, 1/3), this._colorBrightness(warmCol, 1/3), maxRaiseHeight));
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

class OrthoGrid {
	constructor(x, y, maxRow, maxCol, viewAngleDeg, edgeLength, separation, maxRaiseHeight, raiseRadius, dimensional, coldCol, warmCol) {

		// Positioning
		this.x = x; // x coord of top cube
		this.y = y; // y coord of top cube
		
		this.maxRaiseHeight = maxRaiseHeight; // Maximum raise height for active cubes
		this.raiseRadius = raiseRadius; // Radius of influence of active cubes 

		const SPEED = 1; // Speed at which cubes "move"

		// Rendering
		this.dimensional = dimensional;
		this.coldCol = coldCol;
		this.warmCol = warmCol;

		// Building
		this.cubes = []; // 2D array of cubes
		this.edgeCubes = []; // Array of edge cubes

		let translationAngle = (Math.PI * (360 - 2 * viewAngleDeg)) / 720;
		let translationX = (edgeLength + separation) * Math.cos(translationAngle); // How much to move horizontal when drawing next cube
		let translationY = (edgeLength + separation) * Math.sin(translationAngle); // How much to move vertically when drawing next cube

		for (let col=0; col<maxCol; col++) {
			let rowArray = [];
			for (let row=0; row<maxRow; row++) {

				// x and y coords of new cube
				let newX = x + row * translationX;
				let newY = y + row * translationY;

				let newCube = new OrthoCube(newX, newY, [row, col], viewAngleDeg, edgeLength)
				rowArray.push(newCube);

				// Sets the edge cubes propagation and speed, excluding the corner cubes
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

			// Set x and y to the next column's x and y
			x -= translationX;
			y += translationY;
		}
	}

	draw() {
		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {
				let cube = this.cubes[col][row];
				cube.draw(this.coldCol, this.warmCol, this.maxRaiseHeight, this.dimensional);
			}
		}
	}

	behaviour() {

	}

	/**
	 * Propagates active status to cubes based on propagation vector
	 * @param {boolean} rebound 
	 */
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

	/**
	 * Sets the height of each cube based on distance from active cubes
	 */
	setActiveRandomEdgeCube() {
		let edgeCube = this.edgeCubes[Math.floor(Math.random() * this.edgeCubes.length)];
		edgeCube.active = true;
	}

	_dist(cube, activeCube) {
		return Math.sqrt( Math.abs(cube.row - activeCube.row) ** 2 + Math.abs(cube.col - activeCube.col) ** 2 );
	}

	_raiseAdjacentCubes() {
		// Degeneration factor if a cube is not being influenced
		const DEGENERATION = 0.85; 

		let activeCubes = this.getAllActive();

		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {
				let count = 0; // How many active cubes have influenced this cube
				let newRaiseHeight = 0; // New raise height of the cube
				let cube = this.cubes[col][row];

				for (let activeCube of activeCubes) {
					let range = this._dist(cube, activeCube); // Get the distance from this cube to some active cube
					
					// If the cube is within range, increase its new height based on its distance from that active cube
					if (range <= this.raiseRadius) {
						newRaiseHeight += ( this.raiseRadius - range ) * this.maxRaiseHeight / this.raiseRadius;
						count++;
					}
				}

				// If the cube has been affected by an active cube, change its raise height. Otherwise, degenerate its height gradually
				cube.raiseHeight = (count > 0) ? newRaiseHeight : cube.raiseHeight * DEGENERATION;
			}
		}
	}

	/**
	 * Use this method for making OrthoGrid objects
	 */
	static loadProfile(profile) {
		return new OrthoGrid(
			canvasWidth/2, 
			canvasHeight/2 + 2 * (profile.edgeLength + profile.separation) * Math.cos( profile.angle / 2 ) * profile.colCount / 4,
			profile.rowCount, 
			profile.colCount,

			profile.angle,
			profile.edgeLength,
			profile.separation,
			profile.edgeLength * 1.5,
			profile.raiseRadius,

			profile.dimensional,
			profile.coldCol,
			profile.warmCol
		);
	}
}


/**
 * AN INTERESTING THOUGHT:
 * each profile object can have a method which will have a different effect
 * this special method will be called somewhere, probably propagateActiveCubes(...)
 * this method could be something like a different propagation function, or something else
 * maybe like instead of propagating it ripples?
 * 
 * make a separate method that will be called in draw_one_frame() called behaviour(),
 * this will store what effect the cubes will have.
 * if none is provided, use propagateActiveCubes(...)
 * 
 * TODO:
 * noise- make the spawning predictable
 * offset- make cubes offset spawning
 * gradually raise- make cubes raise gradually
 * behaviour- make cubes have different behavour
 * easing- implement easing for movement // DONT DO THIS, IT ISN'T POSSIBLE WITHOUT ADJUSTING SPEED
 * easing height- make cubes raise gradually
 */

const profile1 = {
	rowCount : 13,
	colCount : 13, 

	angle : 120,
	edgeLength : canvasHeight/20,
	separation : 3, // make this number scale
	raiseRadius : 6,

	dimensional : false,
	coldCol : [50, 50, 50],
	warmCol : [255, 10, 128],
}

const profile2 = {
	rowCount : 24,
	colCount : 24, 

	angle : 120,
	edgeLength : canvasHeight/30,
	separation : 3, // make this number scale
	raiseRadius : 12,

	dimensional : false,
	coldCol : [0, 120, 215],
	warmCol : [255, 30, 10],
}

const profile3 = {
	rowCount : 32,
	colCount : 32, 

	angle : 120,
	edgeLength : canvasHeight/12,
	separation : 3, // make this number scale
	raiseRadius : 6,

	dimensional : true,
	coldCol : 35,
	warmCol : 200,
}


const grid = OrthoGrid.loadProfile(profile2);

const BGC = [0, 0, 130];
let REBOUND = true;
const CHANCE = 0.05;

grid.setActiveRandomEdgeCube();
grid.setActiveRandomEdgeCube();
grid.setActiveRandomEdgeCube();

function draw_one_frame() {
	background(BGC);

	grid.draw();

	grid.propagateActiveCubes(REBOUND);


	if (!REBOUND) {
		if (grid.getAllActive().length < 1) {
			if (Math.random() > 1 - CHANCE) {
				grid.setActiveRandomEdgeCube();
			}
		}
	}
}