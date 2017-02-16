
/*
 * OpenSimplex (Simplectic) Noise in Javascript.
 * original by Kurt Spencer (https://gist.github.com/KdotJPG/b1270127455a94ac5d19)
 * ported to Javascript by Ryan Guthrie
 * 
 */

//function OpenSimplexNoise(seed){
var OpenSimplexNoise = function(seed) { 
	STRETCH_CONSTANT_2D = -0.211324865405187;    //(1/Math.sqrt(2+1)-1)/2;
	SQUISH_CONSTANT_2D = 0.366025403784439;      //(Math.sqrt(2+1)-1)/2;
	STRETCH_CONSTANT_3D = -1.0 / 6;              //(1/Math.sqrt(3+1)-1)/3;
	SQUISH_CONSTANT_3D = 1.0 / 3;                //(Math.sqrt(3+1)-1)/3;
	STRETCH_CONSTANT_4D = -0.138196601125011;    //(1/Math.sqrt(4+1)-1)/4;
	SQUISH_CONSTANT_4D = 0.309016994374947;      //(Math.sqrt(4+1)-1)/4;
	
	NORM_CONSTANT_2D = 47;
	NORM_CONSTANT_3D = 103;
	NORM_CONSTANT_4D = 30;
	
	DEFAULT_SEED = 0;
	
	perm = [];
	permGradIndex3D = [];

	//Gradients for 2D. They approximate the directions to the
	//vertices of an octagon from the center.
	var gradients2D = [
		 5,  2,    2,  5,
		-5,  2,   -2,  5,
		 5, -2,    2, -5,
		-5, -2,   -2, -5,
	];
	
	//Gradients for 3D. They approximate the directions to the
	//vertices of a rhombicuboctahedron from the center, skewed so
	//that the triangular and square facets can be inscribed inside
	//circles of the same radius.
	var gradients3D = [
		-11,  4,  4,     -4,  11,  4,    -4,  4,  11,
		 11,  4,  4,      4,  11,  4,     4,  4,  11,
		-11, -4,  4,     -4, -11,  4,    -4, -4,  11,
		 11, -4,  4,      4, -11,  4,     4, -4,  11,
		-11,  4, -4,     -4,  11, -4,    -4,  4, -11,
		 11,  4, -4,      4,  11, -4,     4,  4, -11,
		-11, -4, -4,     -4, -11, -4,    -4, -4, -11,
		 11, -4, -4,      4, -11, -4,     4, -4, -11,
	];
	
	//Gradients for 4D. They approximate the directions to the
	//vertices of a disprismatotesseractihexadecachoron from the center,
	//skewed so that the tetrahedral and cubic facets can be inscribed inside
	//spheres of the same radius.
	var gradients4D = [
	     3,  1,  1,  1,      1,  3,  1,  1,      1,  1,  3,  1,      1,  1,  1,  3,
	    -3,  1,  1,  1,     -1,  3,  1,  1,     -1,  1,  3,  1,     -1,  1,  1,  3,
	     3, -1,  1,  1,      1, -3,  1,  1,      1, -1,  3,  1,      1, -1,  1,  3,
	    -3, -1,  1,  1,     -1, -3,  1,  1,     -1, -1,  3,  1,     -1, -1,  1,  3,
	     3,  1, -1,  1,      1,  3, -1,  1,      1,  1, -3,  1,      1,  1, -1,  3,
	    -3,  1, -1,  1,     -1,  3, -1,  1,     -1,  1, -3,  1,     -1,  1, -1,  3,
	     3, -1, -1,  1,      1, -3, -1,  1,      1, -1, -3,  1,      1, -1, -1,  3,
	    -3, -1, -1,  1,     -1, -3, -1,  1,     -1, -1, -3,  1,     -1, -1, -1,  3,
	     3,  1,  1, -1,      1,  3,  1, -1,      1,  1,  3, -1,      1,  1,  1, -3,
	    -3,  1,  1, -1,     -1,  3,  1, -1,     -1,  1,  3, -1,     -1,  1,  1, -3,
	     3, -1,  1, -1,      1, -3,  1, -1,      1, -1,  3, -1,      1, -1,  1, -3,
	    -3, -1,  1, -1,     -1, -3,  1, -1,     -1, -1,  3, -1,     -1, -1,  1, -3,
	     3,  1, -1, -1,      1,  3, -1, -1,      1,  1, -3, -1,      1,  1, -1, -3,
	    -3,  1, -1, -1,     -1,  3, -1, -1,     -1,  1, -3, -1,     -1,  1, -1, -3,
	     3, -1, -1, -1,      1, -3, -1, -1,      1, -1, -3, -1,      1, -1, -1, -3,
	    -3, -1, -1, -1,     -1, -3, -1, -1,     -1, -1, -3, -1,     -1, -1, -1, -3,
	];

	seed = (seed) ? seed : DEFAULT_SEED;
	if( Array.isArray(seed) ) {
		perm = seed;
		var permGradIndex3d = [];
		for(var i=0; i<256; i++) {
			//Since 3D has 24 gradients, simple bitmask won't work, so precompute modulo array.
			permGradIndex3D[i] = (parseInt(seed[i] % (gradients3D.length / 3)) * 3);
		}
	} else {
		//Initializes the class using a permutation array generated from a 64-bit seed.
		//Generates a proper permutation (i.e. doesn't merely perform N successive pair swaps on a base array)
		//Uses a simple 64-bit LCG.
		seed = parseFloat(seed);
		if(!seed || isNaN(seed) ) seed = DEFAULT_SEED;
		perm = [];
		permGradIndex3D = [];
		var source = [];
		var i = 0;
		for(i=0; i<256; i++) {
			source[i] = i;
		}
		seed = seed * 6364136223846793005 + 1442695040888963407;
		seed = seed * 6364136223846793005 + 1442695040888963407;
		seed = seed * 6364136223846793005 + 1442695040888963407;
		for(i=255; i>=0; i--) {
			seed = seed * 6364136223846793005 + 1442695040888963407;
			var r = parseInt( (seed+31) % (i+1) );
			if(r < 0) {
				r += (i+1);
			}
			perm[i] = source[r];
			permGradIndex3D[i] = (parseInt(perm[i] % gradients3D.length / 3)*3);
			source[r] = source[i];
		}
		
	}

	//
	var extrapolate2d = function(xsb, ysb, dx, dy) {
		var index = perm[(perm[xsb & 0xFF] + ysb) & 0xFF] & 0x0E;
		return gradients2D[index] * dx
			+ gradients2D[index + 1] * dy;
	};

	var extrapolate3d = function(xsb, ysb, zsb, dx, dy, dz){
		var index = permGradIndex3D[(perm[(perm[xsb & 0xFF] + ysb) & 0xFF] + zsb) & 0xFF];
		return gradients3D[index] * dx
			+ gradients3D[index + 1] * dy
			+ gradients3D[index + 2] * dz;
	};
	
	var extrapolate4d = function(xsb, ysb, zsb, wsb, dx, dy, dz, dw){
		var index = perm[(perm[(perm[(perm[xsb & 0xFF] + ysb) & 0xFF] + zsb) & 0xFF] + wsb) & 0xFF] & 0xFC;
		return gradients4D[index] * dx
			+ gradients4D[index + 1] * dy
			+ gradients4D[index + 2] * dz
			+ gradients4D[index + 3] * dw;
	};
	
	var fastFloor = function(x) {
		return Math.floor(x);
		//var xi = parseInt(x);
		//return x < xi ? xi - 1 : xi;
	}
	
	var eval2d = function(x, y) {
		//Place input coordinates onto grid.
		var stretchOffset = (x + y) * STRETCH_CONSTANT_2D;
		var xs = x + stretchOffset;
		var ys = y + stretchOffset;
		
		//Floor to get grid coordinates of rhombus (stretched square) super-cell origin.
		var xsb = fastFloor(xs);
		var ysb = fastFloor(ys);
		
		//Skew out to get actual coordinates of rhombus origin. We'll need these later.
		var squishOffset = (xsb + ysb) * SQUISH_CONSTANT_2D;
		var xb = xsb + squishOffset;
		var yb = ysb + squishOffset;
		
		//Compute grid coordinates relative to rhombus origin.
		var xins = xs - xsb;
		var yins = ys - ysb;
		
		//Sum those together to get a value that determines which region we're in.
		var inSum = xins + yins;

		//Positions relative to origin point.
		var dx0 = x - xb;
		var dy0 = y - yb;
		
		//We'll be defining these inside the next block and using them afterwards.
		var dx_ext, dy_ext;
		var xsv_ext, ysv_ext;
		
		var value = 0;

		//Contribution (1,0)
		var dx1 = dx0 - 1 - SQUISH_CONSTANT_2D;
		var dy1 = dy0 - 0 - SQUISH_CONSTANT_2D;
		var attn1 = 2 - dx1 * dx1 - dy1 * dy1;
		if (attn1 > 0) {
			attn1 *= attn1;
			value += attn1 * attn1 * extrapolate2d(xsb + 1, ysb + 0, dx1, dy1);
		}

		//Contribution (0,1)
		var dx2 = dx0 - 0 - SQUISH_CONSTANT_2D;
		var dy2 = dy0 - 1 - SQUISH_CONSTANT_2D;
		var attn2 = 2 - dx2 * dx2 - dy2 * dy2;
		if (attn2 > 0) {
			attn2 *= attn2;
			value += attn2 * attn2 * extrapolate2d(xsb + 0, ysb + 1, dx2, dy2);
		}
		
		if (inSum <= 1) { //We're inside the triangle (2-Simplex) at (0,0)
			var zins = 1 - inSum;
			if (zins > xins || zins > yins) { //(0,0) is one of the closest two triangular vertices
				if (xins > yins) {
					xsv_ext = xsb + 1;
					ysv_ext = ysb - 1;
					dx_ext = dx0 - 1;
					dy_ext = dy0 + 1;
				} else {
					xsv_ext = xsb - 1;
					ysv_ext = ysb + 1;
					dx_ext = dx0 + 1;
					dy_ext = dy0 - 1;
				}
			} else { //(1,0) and (0,1) are the closest two vertices.
				xsv_ext = xsb + 1;
				ysv_ext = ysb + 1;
				dx_ext = dx0 - 1 - 2 * SQUISH_CONSTANT_2D;
				dy_ext = dy0 - 1 - 2 * SQUISH_CONSTANT_2D;
			}
		} else { //We're inside the triangle (2-Simplex) at (1,1)
			var zins = 2 - inSum;
			if (zins < xins || zins < yins) { //(0,0) is one of the closest two triangular vertices
				if (xins > yins) {
					xsv_ext = xsb + 2;
					ysv_ext = ysb + 0;
					dx_ext = dx0 - 2 - 2 * SQUISH_CONSTANT_2D;
					dy_ext = dy0 + 0 - 2 * SQUISH_CONSTANT_2D;
				} else {
					xsv_ext = xsb + 0;
					ysv_ext = ysb + 2;
					dx_ext = dx0 + 0 - 2 * SQUISH_CONSTANT_2D;
					dy_ext = dy0 - 2 - 2 * SQUISH_CONSTANT_2D;
				}
			} else { //(1,0) and (0,1) are the closest two vertices.
				dx_ext = dx0;
				dy_ext = dy0;
				xsv_ext = xsb;
				ysv_ext = ysb;
			}
			xsb += 1;
			ysb += 1;
			dx0 = dx0 - 1 - 2 * SQUISH_CONSTANT_2D;
			dy0 = dy0 - 1 - 2 * SQUISH_CONSTANT_2D;
		}
		
		//Contribution (0,0) or (1,1)
		var attn0 = 2 - dx0 * dx0 - dy0 * dy0;
		if (attn0 > 0) {
			attn0 *= attn0;
			value += attn0 * attn0 * extrapolate2d(xsb, ysb, dx0, dy0);
		}
		
		//Extra Vertex
		var attn_ext = 2 - dx_ext * dx_ext - dy_ext * dy_ext;
		if (attn_ext > 0) {
			attn_ext *= attn_ext;
			value += attn_ext * attn_ext * extrapolate2d(xsv_ext, ysv_ext, dx_ext, dy_ext);
		}
		
		return value / NORM_CONSTANT_2D;
	};

	var eval3d = function(x, y, z) {
		//TODO:: 
		console.log("3d not implemented!");
		return null;
	};

	var eval4d = function(x,y,z,w) {
		//TODO::
		console.log("4d Not implemented!");
		return null;
	}

	return {
		eval : function(x, y, z, w) {
			if(x && y ) {
				if(z) {
					if(w) return eval4d(x,y,z,w);
					else return eval3d(x,y,z);
				} else {
					return eval2d(x,y);
				}
			} else {
				//error!
				return eval2d(x, x + 300);
			}
		}
	};
};
