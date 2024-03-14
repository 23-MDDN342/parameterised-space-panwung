/**
 * The grid for orthographic cubes and the base class for behaviour objects to modify
 */
class OrthoGrid {
	/**
	 * Inner class of orthographically rendered cubes
	 */
	OrthoCube = class {
		/**
		 * Constructor that can be modified with additional properties through behaviour objects
		 * @param {number} xCenter x coord of cube centre
		 * @param {number} yCenter y coord of cube centre
		 * @param {number} gridPos Position on grid
		 * @param {number} viewAngleDeg View angle of cube (in degrees)
		 * @param {number} edgeLength Edge length of cube
		 * @param {boolean} active Flags the cube as active or not
		 */
		constructor(xCenter, yCenter, gridPos, viewAngleDeg, edgeLength, active=false) {
			// Positioning
			this.points = [[
				xCenter,  // Ax
				yCenter	  // Ay
			]];
	
			this.gridPos = gridPos; // Position on grid
	
			// Rendering
			this.viewAngle = viewAngleDeg * Math.PI / 180; // Conver to Rad
			this.edgeLength = edgeLength;
	
			// Status
			this.active = active; // Decides whether the cube is "moving" or not
			this.raiseHeight = 0; // Raise height of the cube
	
			// Building 
			this._initPoints();
		}
	
		/**
		 * Draws the cube
		 * @param {number|Array} coldCol Colour that is shown 100% if the colour lerp returns 0
		 * @param {number|Array} warmCol Colour that is shown 100% if the colour lerp returns 1
		 * @param {number} lerpLowerBound Minimum bound for colour lerping
		 * @param {number} lerpUpperBound Maximum bound for colour lerping
		 * @param {boolean} dimensional Controls the render style 
		 */
		draw(coldCol, warmCol, lerpLowerBound, lerpUpperBound, dimensional=false) {
			push();
			noStroke();
			translate(this.points[0][0], this.points[0][1]);
	
			fill(this._heatMapColor(coldCol, warmCol, lerpLowerBound, lerpUpperBound));
	
			// Draws top rhombus
			if (dimensional) fill(this._heatMapColor(this._colorBrightness(coldCol, 1), this._colorBrightness(warmCol, 1), lerpLowerBound, lerpUpperBound));
			beginShape();
			vertex(0, - this.raiseHeight);                                   // A
			vertex(this.points[1][0], this.points[1][1] - this.raiseHeight); // B
			vertex(this.points[6][0], this.points[6][1] - this.raiseHeight); // G
			vertex(this.points[2][0], this.points[2][1] - this.raiseHeight); // C
			endShape(CLOSE);
	
			// Draws left rhombus
			if (dimensional) fill(this._heatMapColor(this._colorBrightness(coldCol, 2/3), this._colorBrightness(warmCol, 2/3), lerpLowerBound, lerpUpperBound));
			beginShape();
			vertex(0, - this.raiseHeight);                                   // A
			vertex(this.points[1][0], this.points[1][1] - this.raiseHeight); // B
			vertex(this.points[3][0], this.points[3][1] - this.raiseHeight); // D
			vertex(this.points[4][0], this.points[4][1] - this.raiseHeight); // E
			endShape(CLOSE);
	
			// Draws right rhombus
			if (dimensional) fill(this._heatMapColor(this._colorBrightness(coldCol, 1/3), this._colorBrightness(warmCol, 1/3), lerpLowerBound, lerpUpperBound));
			beginShape();
			vertex(0, - this.raiseHeight);                                   // A
			vertex(this.points[2][0], this.points[2][1] - this.raiseHeight); // C
			vertex(this.points[5][0], this.points[5][1] - this.raiseHeight); // F
			vertex(this.points[4][0], this.points[4][1] - this.raiseHeight); // E
			endShape(CLOSE);
	
			pop();
		}
	
		/**
		 * Lerps between two given colours based on upper
		 * @param {number|Array} col1 Colour that is shown 100% if the colour lerp returns 0
		 * @param {number|Array} col2 Colour that is shown 100% if the colour lerp returns 1
		 * @param {number} lerpLowerBound Minimum bound for colour lerping
		 * @param {number} lerpUpperBound Maximum bound for colour lerping
		 * @returns {Object} Returns a p5.Color object
		 */
		_heatMapColor(col1, col2, lerpLowerBound, lerpUpperBound) {
			push();
			colorMode(RGB);
			let heatCol = lerpColor(color(col1), color(col2), map(this.raiseHeight, lerpLowerBound, 1.1 * lerpUpperBound, 0, 1));
			pop();
	
			return heatCol;
		}
	
		/**
		 * Scales all the values in array or single number by some percent
		 * @param {number|Array} cubeColor Colour to be rescaled
		 * @param {number} percentage Percent to scale by
		 * @returns {number|Array} Returns either a number or an array based on what datatype the colour is
		 */
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

	/**
	 * Constructor of OrthoGrid
	 * @param {Object} structureProfile Object containing the x and y coords, the max rows and columns
	 * @param {Object} cubeProfile Object containing the cubes edge length, separation from one another, and the view angle (in degrees)
	 * @param {Object} renderProfile Object containing the drawing style and colours of the cubes, as well as the upper lerp bound
	 * @param {Object} behaviourProfile Object containing the behaviour of the cubes
	 */
	constructor(structureProfile, cubeProfile, renderProfile, behaviourProfile) {
		this.consoleFeedback = true; // For debugging

		this.loadStructureProfile(structureProfile);
		this.loadCubeProfile(cubeProfile);
		this.loadRenderProfile(renderProfile);

		// Behaviour
		this.addedBehaviouralProperties = [];

		// Inherit all of the properties of the behaviourProfile
		for (let property in behaviourProfile) { 
			this[property] = behaviourProfile[property]; 
			this.addedBehaviouralProperties.push(property);
		} 
		
		// Building
		this.build();
	}

	/**
	 * Does the main behaviour
	 */
	doBehaviour(cur_frac) {
		this.mainBehaviour(cur_frac);
	}
	
	/**
	 * Draws all the cubes
	 */
	draw() {
		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {
				let cube = this.cubes[col][row];
				cube.draw(this.coldCol, this.warmCol, this.lerpLowerBound, this.lerpUpperBound, this.dimensional);
			}
		}
	}

	/**
	 * Gets the distance from two cubes in grid space
	 * @param {Object} cube1 Cube object
	 * @param {Object} cube2 Cube object  
	 * @returns {number} Floating point distance between the two cubes
	 */
	cubeDistanceFromActive = function(cube1, cube2) {
		return Math.sqrt( Math.abs(cube1.row - cube2.row) ** 2 + Math.abs(cube1.col - cube2.col) ** 2 );
	}

	/**
	 * Returns an array of all the current active cubes
	 * @returns {Array} Array of all active cubes
	 */
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
	 * Loads date from structureProfile objects to OrthoGrid properties
	 * @param {Object} structureProfile Uses this object to set property values
	 */
	loadStructureProfile(structureProfile) {
		this.x = structureProfile.x;                        // x coord of top cube
		this.y = structureProfile.y;                        // y coord of top cube 
		this.maxRow = structureProfile.maxRow;              // Max row of grid
		this.maxCol = structureProfile.maxCol;              // Max column of grid

		this.sendFeedback("structure");
	}

	/**
	 * Loads date from cubeProfile objects to OrthoGrid properties
	 * @param {Object} cubeProfile Uses this object to set property values
	 */
	loadCubeProfile(cubeProfile) {
		this.edgeLength = cubeProfile.edgeLength;           // Edge length of cube
		this.separation = cubeProfile.separation;           // Separation between cubes
		this.viewAngleDeg = cubeProfile.viewAngleDeg;       // View angle of cube

		this.sendFeedback("cube");
	}

	/**
	 * Loads date from renderProfile objects to OrthoGrid properties
	 * @param {Object} renderProfile Uses this object to set property values
	 */
	loadRenderProfile(renderProfile) {
		this.dimensional = renderProfile.dimensional;       // Render either 3D or flat
		this.coldCol = renderProfile.coldCol;               // Lower colour of lerpColor
		this.warmCol = renderProfile.warmCol;               // Warmer colour of lerpColor
		this.lerpLowerBound = renderProfile.lerpLowerBound; // Lower bound for lerp
		this.lerpUpperBound = renderProfile.lerpUpperBound; // Upper bound for lerp

		this.sendFeedback("render");
	}

	/**
	 * Loads date from behaviourProfile objects to OrthoGrid properties
	 * @param {Object} behaviourProfile Uses this object to set property values and destroy old ones
	 */
	loadBehaviourProfile(behaviourProfile) {
		// Purge old
		for (let property of this.addedBehaviouralProperties) { delete this[property]; }
		this.addedBehaviouralProperties = [];
		
		// Inherit all of the properties of the behaviourProfile
		for (let property in behaviourProfile) { 
			this[property] = behaviourProfile[property]; 
			this.addedBehaviouralProperties.push(property);
		} 

		// Add new properties to cubes
		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {
				this.cubes[col][row].active = false;
				this.initCubeProperties(this.cubes[col][row]);
			}
		}

		this.sendFeedback("behaviour");
	}

	/**
	 * Builds the grid based on the properties
	 */
	build() {
		this.cubes = []; // 2D array of cubes

		let x = this.x;
		let y = this.y;
		let translationAngle = (Math.PI * (360 - 2 * this.viewAngleDeg)) / 720;
		let translationX = (this.edgeLength + this.separation) * Math.cos(translationAngle); // How much to move horizontal when drawing next cube
		let translationY = (this.edgeLength + this.separation) * Math.sin(translationAngle); // How much to move vertically when drawing next cube

		for (let col=0; col<this.maxCol; col++) {
			let rowArray = [];
			for (let row=0; row<this.maxRow; row++) {

				// x and y coords of new cube
				let newX = x + row * translationX;
				let newY = y + row * translationY;

				let newCube = new this.OrthoCube(newX, newY, [row, col], this.viewAngleDeg, this.edgeLength);
				rowArray.push(newCube);
				
				this.initCubeProperties(newCube); // Init additional cube properties needed for this given behaviour
			}
			this.cubes.push(rowArray);

			// Set x and y to the next column's x and y
			x -= translationX;
			y += translationY;
		}

		this.sendFeedback("build")
	}

	sendFeedback(source) {
		if (this.consoleFeedback) {
			if (source === "build") console.log("Grid built");
			else {
				console.log("Loaded new " + source + " profile");
				console.log("Rebuilding may be required (use build method)");
			}
		}
	}
}

class StructureProfile {
	constructor(x, y, maxRow, maxCol) {
		this.x = x;
		this.y = y;
		this.maxRow = maxRow;
		this.maxCol = maxCol;
	}
}

class CubeProfile {
	constructor(edgeLength, separation, viewAngleDeg) {
		this.edgeLength = edgeLength;
		this.separation = separation;
		this.viewAngleDeg = viewAngleDeg;
	}
}

class RenderProfile {
	constructor(dimensional, coldCol, warmCol, lerpLowerBound, lerpUpperBound) {
		this.dimensional = dimensional;
		this.coldCol = coldCol;
		this.warmCol = warmCol;
		this.lerpLowerBound = lerpLowerBound;
		this.lerpUpperBound = lerpUpperBound;
	}
}

class RandomPropagation {
	/**
	 * Properties to be added to OrthoGrid
	 * @param {boolean} rebound Sets whether active cubes "rebound" once they hit the edge
	 * @param {number} speed Number of cubes an active cube moved in one call of mainBehaviour()
	 * @param {number} maxRaiseHeight Maximum raise height of cubes
	 * @param {number} maxRaiseRadius Radius of circle around an active cube that determines how far it should be raised
	 * @param {number} limit If rebound is false, this is the max number of active cubes allowed to exist
	 * @param {number} chanceIf rebound is false, this is the chance of an active cube spawning
	 */
	constructor(rebound, speed, maxRaiseHeight, maxRaiseRadius, limit, chance) {
		this.edgeCubes = [];

		this.rebound = rebound;
		this.speed = speed;                   // Speed at which cubes move
		this.maxRaiseHeight = maxRaiseHeight; // Maximum raise height for active cubes
		this.maxRaiseRadius = maxRaiseRadius; // Radius of influence of active cubes 

		this.limit = limit;
		this.chance = chance;
	}

	/**
	 * Properties to be added to OrthoCube
	 * @param {Object} cube OrthoCube object
	 */
	initCubeProperties = function(cube) {
		cube.step = 0;
		if (
			!(cube.row === 0 && cube.col === 0) && 
			!(cube.row === 0 && cube.col === this.maxCol - 1) &&
			!(cube.row === this.maxRow - 1 && cube.col === 0) && 
			!(cube.row === this.maxRow - 1 && cube.col === this.maxCol - 1)
		) {
			if (cube.row === 0) {
				cube.propagationVector = [+this.speed, 0];
				this.edgeCubes.push(cube); 
			}
			else if (cube.row === this.maxRow - 1) {
				cube.propagationVector = [-this.speed, 0];
				this.edgeCubes.push(cube);
			}
			else if (cube.col === 0) {
				cube.propagationVector = [0, +this.speed]
				this.edgeCubes.push(cube);
			}
			else if (cube.col === this.maxCol - 1) {
				cube.propagationVector = [0, -this.speed]
				this.edgeCubes.push(cube);
			}
		}
	}

	/**
	 * Main behaviour of profile
	 * @param  {cur_frac} cur_frac Uneeded for this profile
	 */
	mainBehaviour = function(cur_frac) {
		this._propagateActive();

		if (!this.rebound) {
			if (grid.getAllActive().length < this.limit) {
				if (Math.random() > 1 - this.chance) {
					grid.setRandomActive();
				}
			}
		}
	}

	/**
	 * Randomly selects an edge cube to be active which begins propagation
	 */
	setRandomActive = function() {
		let edgeCube = this.edgeCubes[Math.floor(Math.random() * this.edgeCubes.length)];
		edgeCube.active = true;
		edgeCube.step = 0;
	}

	/**
	 * Propagates active status to cubes based on propagation vector
	 */
	_propagateActive = function() {
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
				nextCube.step = activeCube.step + this.speed;

				// Set the next cube's active to true and, if it is not an edge cube, set its propagation to the active 
				if (this.rebound) {
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
			activeCube.step = 0;
			if (!this.edgeCubes.includes(activeCube)) activeCube.propagationVector = undefined;
		}

		this._raiseAdjacentCubes();
	}

	/**
	 * Sets the height of cubes adjacent to active cubes
	 */
	_raiseAdjacentCubes = function() {
		// Degeneration factor if a cube is not being influenced
		const DEGENERATION = 0.85; 

		let activeCubes = this.getAllActive();

		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {
				let count = 0; // How many active cubes have influenced this cube
				let newRaiseHeight = 0; // New raise height of the cube
				let cube = this.cubes[col][row];
				let maximumRange;

				for (let activeCube of activeCubes) {
					maximumRange = (activeCube.step < this.maxRaiseRadius) ? activeCube.step : this.maxRaiseRadius;
					let range = this.cubeDistanceFromActive(cube, activeCube); // Get the distance from this cube to some active cube
					
					// If the cube is within range, increase its new height based on its distance from that active cube
					if (range <= maximumRange) {
						newRaiseHeight += ( maximumRange - range ) * this.maxRaiseHeight / maximumRange;
						count++;
					}
				}

				// If the cube has been affected by an active cube, change its raise height. Otherwise, degenerate its height gradually
				cube.raiseHeight = (count > 0) ? newRaiseHeight : cube.raiseHeight * DEGENERATION;
			}
		}
	}
}

class Ripple {
	constructor(amplitude, radius) {
		this.amplitude = amplitude;
		this.radius = radius;
		this.time = 0;
	}

	/**
	 * Properties to be added to OrthoCube (this method is empty but must exist for ducktyping to work)
	 * @param {Object} cube Uneeded for this profile
	 */
	initCubeProperties = function(cube) {}

	/**
	 * Main behaviour of profile
	 * @param {number} cur_frac Number that goes from 0 to 1
	 */
	mainBehaviour = function(cur_frac) {
		let centerCube = this.cubes[ Math.floor(this.cubes.length/2) ][ Math.floor(this.cubes[0].length/2) ];
		centerCube.raiseHeight = 0;

		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {
				let cube = this.cubes[col][row];
				let range = this.cubeDistanceFromActive(cube, centerCube);

				if (range <= this.radius) {
					cube.raiseHeight = this.amplitude/(range+1) * Math.sin(map(cur_frac, 0, 1, 0, 360) * Math.PI/ 180 + range);
				}
			}
		}
	}

	setRandomActive = function() {}
}

class GameOfLife {
	constructor(maxRaiseHeight) {
		this.maxRaiseHeight = maxRaiseHeight;
	}
	
	/**
	 * Properties to be added to OrthoCube (this method is empty but must exist for ducktyping to work)
	 * @param {Object} cube Uneeded for this profile
	 */
	initCubeProperties = function(cube) {}

	mainBehaviour = function(cur_frac) {
		let currentState = new Map();
		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {
				let cube = this.cubes[col][row];
				currentState.set(cube, cube.active);
			}
		}

		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {
				let cube = this.cubes[col][row];
				this._applyRules(cube, currentState);
				cube.raiseHeight = (cube.active) ? this.maxRaiseHeight : 0;
			}
		}
	}

	setRandomActive = function(limit, chance) {
		let count = 0;
		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {
				if (count < limit) {
					if (Math.random() > 1 - chance) this.cubes[col][row].active = true;
				}
			}
		}
	}

	_applyRules = function(cube, currentState) {
		let aliveCount = this._countNeighbours(cube, currentState);
		if (cube.active) {
			if (aliveCount < 2) cube.active = false;
			else if (aliveCount === 2 || aliveCount === 3) cube.active = true;
			else if (aliveCount > 3) cube.active = false;
		}
		else {
			if (aliveCount === 3) cube.active = true;
		}
	} 

	_countNeighbours = function(cube, currentState) {
		let aliveCount = 0;
		for (let j=-1; j<=1; j++) {
			for (let i=-1; i<=1; i++) {
				if (
					cube.row + i >= 0 && cube.row + i < this.cubes[0].length &&
					cube.col + j >= 0 && cube.col + j < this.cubes.length &&
					!(j === 0 && i === 0)
				) {
					let adjacent = this.cubes[cube.col + j][cube.row + i];
					if (currentState.get(adjacent)) aliveCount++;
				}
			}
		}
		return aliveCount;
	}
}

/**
 * TODO:
 * noise- make the spawning predictable
 * offset- make cubes offset spawning
 * will need to change the ripple method so that it can pick any point aside from the centre
 */


//y = canvasHeight/2 + 2 * (profile.edgeLength + profile.separation) * Math.cos( profile.angle / 2 ) * profile.colCount / 4



// Cube profiles
const cProfile1 = new CubeProfile(canvasHeight/20, canvasHeight * 0.01, 120);

// Render profiles
const rProfile1 = new RenderProfile(false, [50, 50, 50], [255, 10, 128], 0, cProfile1.edgeLength * 1.5); // propagation
const rProfile2 = new RenderProfile(false, [251, 189, 204], [170, 8, 47], -cProfile1.edgeLength * 1.5, cProfile1.edgeLength * 1.5); // ripple
const rProfile3 = new RenderProfile(true, [80, 80, 80], [255, 255, 255], 0, cProfile1.edgeLength * 1); // gof
const rProfile4 = new RenderProfile(false, [255, 180, 74], [255, 255, 255], -30, cProfile1.edgeLength * 1); // ripple

// Structure profiles
const sProfile1 = new StructureProfile( // propagation
	canvasWidth/2, 
	canvasHeight/2 + (cProfile1.edgeLength + cProfile1.separation) * Math.cos( cProfile1.viewAngleDeg / 2 ) * 13 / 2,
	13,
	13, 
);
const sProfile2 = new StructureProfile( // ripple
	canvasWidth/2, 
	canvasHeight/2 + (cProfile1.edgeLength + cProfile1.separation) * Math.cos( cProfile1.viewAngleDeg / 2 ) * 15 / 2,
	15,
	15
);
const sProfile3 = new StructureProfile( // gof
	canvasWidth/2, 
	canvasHeight/2 + (cProfile1.edgeLength + cProfile1.separation) * Math.cos( cProfile1.viewAngleDeg / 2 ) * 16 / 2,
	16,
	16
);

// Behaviour profiles
const randomPropagation = new RandomPropagation( 
	false, 1, cProfile1.edgeLength * 1.5, 6, 3, 0.05
);
const ripple = new Ripple(
	cProfile1.edgeLength * 3, 12
);
const gof = new GameOfLife(cProfile1.edgeLength * 0.9);

// Grid
const grid = new OrthoGrid(
	sProfile2, 
	cProfile1,
	rProfile4, 
	ripple
);

grid.setRandomActive(70, 0.3);


const BGC = 30;// rP2[63, 157, 77, 62];

function draw_one_frame(cur_frac) {
	background(BGC);
	grid.draw();
	grid.doBehaviour(cur_frac);
	// noLoop();
}