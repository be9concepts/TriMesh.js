
var demensions = {x:500,y:500}

var MAP = [
[
{x:0,y:0},
{x:demensions.x,y:0},
{x:demensions.x,y:demensions.y},
{x:0,y:demensions.y}
]
];
var OBSTACLES = [
[
{x:20,y:20},
{x:50,y:20},
{x:50,y:70},
{x:20,y:70},
{x:20,y:20},
{x:50,y:70},
],
[
{x:100,y:100},
{x:150,y:120},
{x:150,y:170}
],
[
{x:200,y:300},
{x:250,y:300},
{x:220,y:400},
{x:200,y:400},
{x:200,y:300},
{x:220,y:400},
],
[
{x:350,y:310},
{x:260,y:310},
{x:260,y:10}]
];
var LINES = [];
var OBSTACLE_LINES = [];
var c, ctx;
var RunTime = Date.now();
var Clock = Date.now();
var deltaTime;

init();

function init(){

	c = document.getElementById("myCanvas");
	c.width = demensions.x;
	c.height = demensions.y;
	c.style.border = '1px solid lightgrey'
	c.style.marginTop = '20px'
	ctx = c.getContext("2d");

	drawObstacles();
	console.log('-',OBSTACLES.length,'Polygons Generated in', logElapse(), 'ms')
	console.log('-',OBSTACLE_LINES.length,'Polygons Segments Generated in', logElapse(), 'ms')
	
	connectToBoundaries();
	console.log('-', LINES.length,'Segments Generated To Boundary in', logElapse(), 'ms')

	var lines_before = LINES.length;
	connectToOtherObstacles();
	console.log('-', (LINES.length - lines_before),'Segments Generated To Other Obstacles in', logElapse(), 'ms')
}

function logElapse(){
	var now = Date.now();
    var dt = now - Clock;
    Clock = now;
	return dt;
}
function drawObstacles(){
  ctx.strokeStyle = 'red';
	for (var j = 0; j < OBSTACLES.length; j++) {
		ctx.beginPath();
		ctx.moveTo(OBSTACLES[j][0].x,OBSTACLES[j][0].y);
		for (var i = 0; i < OBSTACLES[j].length; i++) {
			var point = OBSTACLES[j][i];
			ctx.lineTo(point.x,point.y);
			ctx.stroke();
			if (i < OBSTACLES[j].length -1){
			OBSTACLE_LINES.push([[point.x, point.y], [OBSTACLES[j][i+1].x, OBSTACLES[j][i+1].y]])
			}
			else {
			OBSTACLE_LINES.push([[point.x, point.y], [OBSTACLES[j][0].x, OBSTACLES[j][0].y]])
			}

		}

		ctx.lineTo(OBSTACLES[j][0].x,OBSTACLES[j][0].y);
		ctx.stroke();
		ctx.fillStyle = 'rgba(200,0,0,.5)'
		ctx.closePath();ctx.fill();
	}
	// reformat OBSTACLE_LINES
	for (l in OBSTACLE_LINES){
		var Line = OBSTACLE_LINES[l];
			Line = [
			{x:Line[0][0],y:Line[0][1]},
			{x:Line[1][0],y:Line[1][1]}
			];
		OBSTACLE_LINES[l] = Line;
	}
}

function connectToOtherObstacles(){
	for (o in OBSTACLES){ var Obstacle = OBSTACLES[o];
		for (v in Obstacle){ var Vertex = Obstacle[v];
			for (oo in OBSTACLES){ var OObstacle = OBSTACLES[oo];
				for (vv in OObstacle) { var VVertex = OObstacle[vv];
					//console.log('line from',Vertex,"to",VVertex);
					if (Vertex == VVertex) continue;
					var this_ray = [Vertex, VVertex];
					var is_existing_line = false;
					var points_match = 0;
					for (ol in OBSTACLE_LINES){ var ObLine = OBSTACLE_LINES[ol];
						if (ObLine[0].x == this_ray[0].x&&ObLine[0].y == this_ray[0].y){
							if (ObLine[1].x == this_ray[1].x&&ObLine[1].y == this_ray[1].y){
								is_existing_line = true;
							}
						}
						if (ObLine[1].x == this_ray[0].x&&ObLine[1].y == this_ray[0].y){
							if (ObLine[0].x == this_ray[1].x&&ObLine[0].y == this_ray[1].y){
								is_existing_line = true;
							}
						}
					}
					for (l in LINES){ var Line = LINES[l];
						if (Line[0].x == this_ray[0].x&&Line[0].y == this_ray[0].y){
							if (Line[1].x == this_ray[1].x&&Line[1].y == this_ray[1].y){
								is_existing_line = true;
							}
						}
						if (Line[1].x == this_ray[0].x&&Line[1].y == this_ray[0].y){
							if (Line[0].x == this_ray[1].x&&Line[0].y == this_ray[1].y){
								is_existing_line = true;
							}
						}
					}
					if (is_existing_line == true) continue

					var allow_draw = checkLineAgainstLines(this_ray, OBSTACLE_LINES);
					// if we have not collided with any obstacles we can now check against the lines that we have already drawn and stored in an Array ('LINES')
					if (allow_draw == true){
						allow_draw = checkLineAgainstLines(this_ray, LINES);
					}
					if (allow_draw == true){
						//console.log('draw line from:', Vertex, ' to', VVertex);
						LINES.push([Vertex, VVertex]);
							ctx.beginPath();
						ctx.moveTo(Vertex.x,Vertex.y);
						// draw line from vertex to VVertex
						ctx.strokeStyle = 'darkgrey';
						ctx.lineTo(VVertex.x,VVertex.y);
						ctx.stroke();
					}
				}
			}
		}
	}
}

function connectToBoundaries(){
	for (o in OBSTACLES){ var Obstacle = OBSTACLES[o];
		for (v in Obstacle){ var Vertex = Obstacle[v];
			for (m in MAP){ var Bounds = MAP[m];
				for (b in Bounds){ var Bertex = Bounds[b];
					// check if a line from Vertex to Bertex crosses any lines in any Obstacle
					var this_ray = [Vertex, Bertex];
					var allow_draw = checkLineAgainstLines(this_ray, OBSTACLE_LINES);
					// if we have not collided with any obstacles we can now check against the lines that we have already drawn and stored in an Array ('LINES')
					if (allow_draw == true){
						allow_draw = checkLineAgainstLines(this_ray, LINES);
					}
					if (allow_draw == true){
						//console.log('draw line from:', Vertex, ' to', Bertex);
						LINES.push([Vertex, Bertex]);
							ctx.beginPath();
						ctx.moveTo(Vertex.x,Vertex.y);
						// draw line from vertex to bertex
						ctx.strokeStyle = 'black';
						ctx.lineTo(Bertex.x,Bertex.y);
						ctx.stroke();
					}
				}
			}
		}
	}
}
// line = [{x,y}{x,y}] && lines = [[line], [line]]
function checkLineAgainstLines(line, lines){
	var data = true;
	for (l in lines){
		var Line = lines[l];
		var condition = segmentIntersection(line,Line)
		if (condition != null){
			var onSegment = false;
			if ((line[0].x == Line[0].x && line[0].y == Line[0].y)||(line[0].x == Line[1].x && line[0].y == Line[1].y)){
				onSegment = true;
			}
			else if ((line[1].x == Line[0].x && line[1].y == Line[0].y)||(line[1].x == Line[1].x && line[1].y == Line[1].y)){
				onSegment = true;
			}
			if (onSegment == false) {
				data = false;
			}
		}
	}
	return data;
}

// Adapted from: 'https://gist.github.com/werelax/9712818'
function segmentIntersection(a, b) {
	var denom = (((b[1].y - b[0].y) * (a[1].x - a[0].x)) -
	             ((b[1].x - b[0].x) * (a[1].y - a[0].y)));
	if (denom === 0) { return null; }
	var ua = ((((b[1].x - b[0].x) * (a[0].y - b[0].y)) -
	           ((b[1].y - b[0].y) * (a[0].x -b[0].x))) / denom);

	var ub = ((((a[1].x - a[0].x) * (a[0].y - b[0].y)) -
	           ((a[1].y - a[0].y) * (a[0].x - b[0].x))) / denom);

	if ((ua < 0) || (ua > 1) || (ub < 0) || (ub > 1)) { return null; }

	return {
	  x: a[0].x + (ua * (a[1].x - a[0].x)),
	  y: a[0].y + (ua * (a[1].y - a[0].y))
	};
}