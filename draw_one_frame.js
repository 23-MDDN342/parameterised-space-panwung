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
		 * @param {number|Array<number>} coldCol Colour that is shown 100% if the colour lerp returns 0
		 * @param {number|Array<number>} warmCol Colour that is shown 100% if the colour lerp returns 1
		 * @param {number} lerpLowerBound Minimum bound for colour lerping
		 * @param {number} lerpUpperBound Maximum bound for colour lerping
		 * @param {boolean} dimensional Controls whether the cube renders as dimensional or flat
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
		 * @param {number|Array<number>} col1 Colour that is shown 100% if the colour lerp returns 0
		 * @param {number|Array<number>} col2 Colour that is shown 100% if the colour lerp returns 1
		 * @param {number} lerpLowerBound Minimum bound for colour lerping
		 * @param {number} lerpUpperBound Maximum bound for colour lerping
		 * @returns {p5.Color} Returns a p5.Color object
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
		 * @param {number|Array<number>} cubeColor Colour to be rescaled
		 * @param {number} percentage Percent to scale by
		 * @returns {number|Array<number>} Returns either a number or an array based on what datatype the colour is
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
	 * @param {StructureProfile} structureProfile Object containing the x and y coords, the max rows and columns
	 * @param {CubeProfile} cubeProfile Object containing the cubes edge length, separation from one another, and the view angle (in degrees)
	 * @param {RenderProfile} renderProfile Object containing the drawing style and colours of the cubes, as well as the upper lerp bound
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
	 * Sets a chosen cube to be active
	 * @param {number} row Row of cube
	 * @param {number} col Column of cube
	 * @param {boolean} active Active status of cube if not undefined, otherwise it will toggle the cube's current status
	 */
	setActive(row, col, active=undefined) {
		this.cubes[col][row].active = (active == undefined) ? !this.cubes[col][row].active : active;
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
	 * @param {OrthoCube} cube1 OrthoCube Cube
	 * @param {OrthoCube} cube2 OrthoCube Cube  
	 * @returns {number} Floating point distance between the two cubes
	 */
	cubeDistanceFromActive = function(cube1, cube2) {
		return Math.sqrt( Math.abs(cube1.row - cube2.row) ** 2 + Math.abs(cube1.col - cube2.col) ** 2 );
	}

	/**
	 * Returns an array of all the current active cubes
	 * @returns {Array<OrthoCube>} Array of all active cubes
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
	 * @param {StructureProfile} structureProfile Uses this object to set property values
	 * @param {boolean} rebuild Rebuild the grid immediatly
	 */
	loadStructureProfile(structureProfile, rebuild=false) {
		this.x = structureProfile.x;                        // x coord of top cube
		this.y = structureProfile.y;                        // y coord of top cube 
		this.maxRow = structureProfile.maxRow;              // Max row of grid
		this.maxCol = structureProfile.maxCol;              // Max column of grid

		this.sendFeedback("structure");
		if (rebuild) this.build();
	}

	/**
	 * Loads date from cubeProfile objects to OrthoGrid properties
	 * @param {CubeProfile} cubeProfile Uses this object to set property values
	 * @param {boolean} rebuild Rebuild the grid immediatly
	 */
	loadCubeProfile(cubeProfile, rebuild=false) {
		this.edgeLength = cubeProfile.edgeLength;           // Edge length of cube
		this.separation = cubeProfile.separation;           // Separation between cubes
		this.viewAngleDeg = cubeProfile.viewAngleDeg;       // View angle of cube

		this.sendFeedback("cube");
		if (rebuild) this.build();
	}

	/**
	 * Loads date from renderProfile objects to OrthoGrid properties
	 * @param {RenderProfile} renderProfile Uses this object to set property values
	 * @param {boolean} rebuild Rebuild the grid immediatly
	 */
	loadRenderProfile(renderProfile, rebuild=false) {
		this.dimensional = renderProfile.dimensional;       // Render either 3D or flat
		this.coldCol = renderProfile.coldCol;               // Lower colour of lerpColor
		this.warmCol = renderProfile.warmCol;               // Warmer colour of lerpColor
		this.lerpLowerBound = renderProfile.lerpLowerBound; // Lower bound for lerp
		this.lerpUpperBound = renderProfile.lerpUpperBound; // Upper bound for lerp

		this.sendFeedback("render");
		if (rebuild) this.build();
	}

	/**
	 * Loads date from behaviourProfile objects to OrthoGrid properties
	 * @param {Object} behaviourProfile Uses this object to set property values and destroy old ones
	 * @param {boolean} rebuild Rebuild the grid immediatly
	 */
	loadBehaviourProfile(behaviourProfile, rebuild=false) {
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
				this.setActive(row, col, false)
				this.initCubeProperties(this.cubes[col][row]);
			}
		}

		this.sendFeedback("behaviour");
		if (rebuild) this.build();
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

	/**
	 * Sends debug info to console when loading profiles
	 * @param {string} source What aspect is being loaded
	 */
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

/**
 * Stores structure information that will be loaded into Orthogrid
 */
class StructureProfile {
	/**
	 * Constructor
	 * @param {number} x x coordinate of top cube
	 * @param {number} y y coordinate of top cube
	 * @param {number} maxRow Maximum number of rows in grid
	 * @param {number} maxCol Maximum number of columns in grid
	 */
	constructor(x, y, maxRow, maxCol) {
		this.x = x;
		this.y = y;
		this.maxRow = maxRow;
		this.maxCol = maxCol;
	}
}

/**
 * Stores cube information that will be loaded into Orthogrid
 */
class CubeProfile {
	/**
	 * Constructor
	 * @param {number} edgeLength Length of each cubes edge
	 * @param {number} separation Separation between each cube
	 * @param {number} viewAngleDeg Angle the cubes will be viewed from in degrees
	 */
	constructor(edgeLength, separation, viewAngleDeg) {
		this.edgeLength = edgeLength;
		this.separation = separation;
		this.viewAngleDeg = viewAngleDeg;
	}
}

/**
 * Stores render information that will be loaded into Orthogrid
 */
class RenderProfile {
	/**
	 * Constructor
	 * @param {boolean} dimensional Controls whether the cube renders as dimensional or flat
	 * @param {number|Array<number>} coldCol Colour that is shown 100% if the colour lerp returns 0
	 * @param {number|Array<number>} warmCol Colour that is shown 100% if the colour lerp returns 1
	 * @param {number} lerpLowerBound Minimum bound for colour lerping
	 * @param {number} lerpUpperBound Maximum bound for colour lerping
	 */
	constructor(dimensional, coldCol, warmCol, lerpLowerBound, lerpUpperBound) {
		this.dimensional = dimensional;
		this.coldCol = coldCol;
		this.warmCol = warmCol;
		this.lerpLowerBound = lerpLowerBound;
		this.lerpUpperBound = lerpUpperBound;
	}
}

/**
 * Behaviour profile of propagating cubes effect
 */
class RandomPropagation {
	/**
	 * Properties to be added to OrthoGrid
	 * @param {boolean} rebound Sets whether active cubes "rebound" once they hit the edge
	 * @param {number} speed Number of cubes an active cube moved in one call of mainBehaviour()
	 * @param {number} maxRaiseHeight Maximum raise height of cubes
	 * @param {number} maxRaiseRadius Radius of circle around an active cube that determines how far adjacent cubes should be raised
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

		this.behaviour = "randompropagation";
	}

	/**
	 * Properties to be added to OrthoCube
	 * @param {OrthoCube} cube OrthoCube object
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

/**
 * Behaviour profile of rippling cubes effect
 */
class Ripple {
	/**
	 * Properties to be added to OrthoGrid
	 * @param {number} amplitude Maximum amplitude of cubes
	 * @param {number} radius Radius of circle around an active cube that determines how far adjacent cubes should be raised
	 */
	constructor(amplitude, radius) {
		this.amplitude = amplitude;
		this.radius = radius;
		this.time = 0;

		this.behaviour = "ripple";
	}

	/**
	 * Properties to be added to OrthoCube (this method is empty but must exist for ducktyping to work)
	 */
	initCubeProperties = function() {}

	/**
	 * Main behaviour of profile
	 * @param {number} cur_frac Number that goes from 0 to 1
	 */
	mainBehaviour = function(cur_frac) {
		// Degeneration factor if a cube is not being influenced
		const DEGENERATION = 0.85; 

		let activeCubes = this.getAllActive();

		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {
				let count = 0; // How many active cubes have influenced this cube
				let newRaiseHeight = 0; // New raise height of the cube
				let cube = this.cubes[col][row];

				for (let activeCube of activeCubes) {
					let range = this.cubeDistanceFromActive(cube, activeCube); // Get the distance from this cube to some active cube
					
					// If the cube is within range, increase its new height based on its distance from that active cube
					if (range <= this.radius) {
						newRaiseHeight += this.amplitude/(range+1) * Math.sin(map(cur_frac, 0, 1, 0, 360) * Math.PI/ 180 + range);
						count++;
					}
				}

				// If the cube has been affected by an active cube, change its raise height. Otherwise, degenerate its height gradually
				cube.raiseHeight = (count > 0) ? newRaiseHeight : cube.raiseHeight * DEGENERATION;
			}
		}
	}

	/**
	 * Randomly selects a cube to be active which begins ripple effect
	 */
	setRandomActive = function() {
		this.setActive(
			Math.floor(this.cubes[0].length * Math.random()),
			Math.floor(this.cubes.length * Math.random()),
			true
		);
	}
}

/**
 * Behaviour profile of Game of Life effect
 */
class GameOfLife {
	/**
	 * Properties to be added to OrthoGrid
	 * @param {number} maxRaiseHeight  Maximum raise height of cubes
	 */
	constructor(maxRaiseHeight) {
		this.maxRaiseHeight = maxRaiseHeight;

		this.behaviour = "gameoflife";
	}
	
	/**
	 * Properties to be added to OrthoCube (this method is empty but must exist for ducktyping to work)
	 */
	initCubeProperties = function() {}

	/**
	 * Main behaviour of profile
	 * @param {number} cur_frac Number that goes from 0 to 1
	 */
	mainBehaviour = function() {
		// Add the states of all cubes to a map
		let currentState = new Map();
		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {
				let cube = this.cubes[col][row];
				currentState.set(cube, cube.active);
			}
		}

		// Apply rules to all the cubes
		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {
				let cube = this.cubes[col][row];
				this._applyRules(cube, currentState);
				cube.raiseHeight = (cube.active) ? this.maxRaiseHeight : 0;
			}
		}
	}

	/**
	 * Sets random cubes to active based on a limit and a probability of being active
	 * @param {number} limit Maximum number of active cubes allowed to be set
	 * @param {number} chance Probability of cube becoming active
	 */
	setRandomActive = function(limit, chance) {
		let count = 0;
		for (let col=0; col<this.cubes.length; col++) {
			for (let row=0; row<this.cubes[0].length; row++) {
				if (count < limit) {
					if (Math.random() > 1 - chance) this.setActive(row, col, true)
				}
			}
		}
	}

	/**
	 * Applies the rules to a cube
	 * @param {OrthoCube} cube OrthoCube cube
	 * @param {Map<OrthoCube, boolean>} currentState Map storing the current active state of the cubes
	 */
	_applyRules = function(cube, currentState) {
		let aliveCount = this._countNeighbours(cube, currentState);
		if (cube.active) {
			// Any live cell with fewer than two live neighbors dies, as if by underpopulation
			if (aliveCount < 2) cube.active = false;

			// Any live cell with two or three live neighbors lives on to the next generation
			else if (aliveCount === 2 || aliveCount === 3) cube.active = true;

			// Any live cell with more than three live neighbors dies, as if by overpopulation
			else if (aliveCount > 3) cube.active = false;
		}
		else {
			// Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction
			if (aliveCount === 3) cube.active = true;
		}
	} 

	/**
	 * Counts the neighbours of a given cube
	 * @param {OrthoCube} cube OrthoCube cube
	 * @param {Map<OrthoCube, boolean>} currentState Map storing the current active state of the cubes
	 * @returns 
	 */
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

// Cube profile
const cProfile = new CubeProfile(canvasHeight/22, canvasHeight * 0.01, 120);

// Render profiles
const rProfile1 = new RenderProfile(false, [0, 0, 255], [255, 0, 0], 0, cProfile.edgeLength * 1.5); // Propagation
const rProfile2 = new RenderProfile(false, [255, 180, 74], [255, 255, 255], -30, cProfile.edgeLength * 1); // Ripple
const rProfile3 = new RenderProfile(true, [80, 80, 80], [255, 255, 255], 0, cProfile.edgeLength * 1); // GoL

// Structure profiles

// Propagation
const ROW_COL_COUNT_1 = 17; 
const sProfile1 = new StructureProfile(canvasWidth/2, canvasHeight/2 + (cProfile.edgeLength + cProfile.separation) * Math.cos( cProfile.viewAngleDeg / 2 ) * ROW_COL_COUNT_1 / 2, ROW_COL_COUNT_1, ROW_COL_COUNT_1);

// Ripple
const ROW_COL_COUNT_2 = 16;
const sProfile2 = new StructureProfile(canvasWidth/2, canvasHeight/2 + (cProfile.edgeLength + cProfile.separation) * Math.cos( cProfile.viewAngleDeg / 2 ) * ROW_COL_COUNT_2 / 2, ROW_COL_COUNT_2, ROW_COL_COUNT_2);

// GoL
const ROW_COL_COUNT_3 = 19;
const sProfile3 = new StructureProfile(canvasWidth/2, canvasHeight/2 + (cProfile.edgeLength + cProfile.separation) * Math.cos( cProfile.viewAngleDeg / 2 ) * ROW_COL_COUNT_3 / 2, ROW_COL_COUNT_3, ROW_COL_COUNT_3);

// Behaviour profiles
const randomPropagation = new RandomPropagation(false, 1, cProfile.edgeLength * 1.5, 6, 3, 0.05);
const ripple = new Ripple(cProfile.edgeLength * 3, 19);
const GoL = new GameOfLife(cProfile.edgeLength * 0.9);

// Grid
const grid = new OrthoGrid(
	sProfile2, 
	cProfile,
	rProfile2, 
	ripple
);
grid.consoleFeedback = false; // Turn off debug text

// Default arrangement for ripple behaviour
if (grid.behaviour === "ripple") {
	grid.setActive(3, 0, true);
	grid.setActive(0, 9, true);
	grid.setActive(2, 5, true);
	grid.setActive(9, 12, true);
	grid.setActive(7, 11, true);
}

// Background colour
const BGC = 30;
function draw_one_frame(cur_frac) {
	background(BGC);
	grid.draw();
	grid.doBehaviour(cur_frac);
}

// HTML Loading functions

function loadRenderProfile1() { grid.loadRenderProfile(rProfile1); }
function loadRenderProfile2() { grid.loadRenderProfile(rProfile2); }
function loadRenderProfile3() { grid.loadRenderProfile(rProfile3); }
function toggleDimension() { grid.dimensional = ! grid.dimensional; }

function loadRandomPropagation() {
	grid.loadStructureProfile(sProfile1);
	grid.loadBehaviourProfile(randomPropagation);
	grid.build();
}
function randomPropagationRebound() {
	try { grid.rebound = !grid.rebound; }
	catch (Error) {}
}

function loadRipple() {
	grid.loadStructureProfile(sProfile2);
	grid.loadBehaviourProfile(ripple);
	grid.build();
}

function loadGoL() {
	grid.loadStructureProfile(sProfile3);
	grid.loadBehaviourProfile(GoL);
	grid.build();
}

function spawnRandom() {
	grid.setRandomActive(75, 0.25);
}