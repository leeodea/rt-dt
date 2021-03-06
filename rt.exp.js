var A = B = point(0,0,-20);
var M = m();
var ogFROM;
var FROM = ogFROM = point(0,0,-20);
var UP = normalize(vector(0,1,0))

function set(A)	{
	
	_log("A - x:" + A.x + ", y:" + A.y + ", z:" + A.z)
	
	Data.c.setCTransform(view_transform(A, point(0,0,0)));
}

function setScene()	{

	var l = new point_light(point(-10,0,-10), colour(1,1,1))
	lights(l)
	
	var s = sphere()
	s.transform = m().scaling(2,2,2).translation(0,0,0).rotation_y(Math.PI).rotation_x(Math.PI/4)
	//s.material.transform = m().rotation_x(Math.PI/2).rotation_y((Math.PI) * 0.7)
	
	s.material.casts_shadow = false;
	
	/**
	s.material.normalMap = Data.PPM["normalMap"]
	if(!s.material.normalMap)	{
		
		alert("Please set a Normal Map first! (Hint: 'normalMap.ppm' is available in our PPM archive - remember to go to Options->Set/Unset Normal Map, and select the 'normalMap.ppm' entry AFTER it has loaded!!)")
		
		return false
	}	
	*/
	s.material.specular = 0.0
	
	var c = Data.PPM["earthmap1k.jpg"];
	if(!c)	{
		
		alert("Please set an 'earth' map first! (Hint: 'earthmap1k.jpg' is available!)")
		return false
	}
	var tm = TextureMap(image_pattern(c), spherical_map, s)
	s.material.pattern = my_pattern( tm, s )
	s.material.ambient = 1.0
	s.material.diffuse = 1.0
	
	var ss = sphere("SKYSPHERE")
	
	ss.transform = m().translation(0,0,0).scaling(40,40,40)
	c = Data.PPM["skysphere.jpg"];
	if(!c)	{
		
		alert("Please set a skysphere map first! (Hint: 'skysphere.jpg' is expected.)")
		return false
	}
	tm = TextureMap(image_pattern(c), spherical_map, ss)
	ss.material.pattern = my_pattern( tm, ss )
	ss.material.specular = 0.0
	
	var m_ = sphere("moon")
	m_.transform = identity_matrix().translation(-4,0,0)
	
	if (!(c = Data.PPM[Data.Maps["moon"]]))	{
		
		var b = alert("Please set a 'moon' map first! (Hint: '2k_moon.ppm' is available in our PPM archive.)")
		return false
	}
	tm = TextureMap(image_pattern(c), spherical_map, m_)
	m_.material.pattern = my_pattern( tm, m_ )
	m_.material.pattern.transform = identity_matrix().rotation_y(Math.PI)
	m_.material.specular = 0.0
	
	scene(s, m_/*, ss*/)
	
	setCamera();
						
	//M = m().rotation_y(radians(10))// .rotation_z(radians(10))
	M.t = B
	
	//M.m = identity_matrix()
	
	renderImage()
	console.log("Scene generated.")
	//console.log(FROM)
	
	//debugger;
}

function setCamera()	{
	
		
		/**
		if( eq( Math.abs(dot(normalize(FROM), point(0,1,0))), 1, 1/179) )
			FROM.x = 20 / 45  // multiply_matrix_by_tuple( m().rotation_z(radians(1)), FROM)
		else
			FROM.x = 0
		*/
		
		//var test = 270 // to keep "up" always in the world +y direction, test = round(FROM.z) > 0 && FROM.y > 0 ? 45 : 270;
		// i suppose when rotating around y-axis, test = FROM.z > 0 && FROM.x < 0 ? 45 : 270'
		// when rotating around z-axis, test = FROM.x < 0 &&  FROM.y > 0 ? 45 : 270;
		//var r = radians(test)
		//UP = round_t(multiply_matrix_by_tuple(m().rotation_x(r), normalize(subtract(point(0,0,0), FROM))))

		UP = vector(0,1,0)
		
		/*
		console.log("FROM: ")
		console.log(FROM)
		console.log("UP: ")
		console.log(UP)
		console.log("dot : = " + round(dot(FROM, UP)))
		*/
		Data.c.setCTransform(view_transform(FROM, point(0,0,0), UP));
		
		if(!Data.c.it_c)	{
			
			console.log("Inverse is 0! type unroll = 1 to stop function.");
			debugger;
		}
}

var unroll = 0;
var new_ = point(0,0,0)
var start_ = point(-4,0,0)

function genFrames(fc, revs)	{

	revs = revs || 1;
	fc = fc || 10;
	var step = 360 / fc;
	
	var fn;
	var _m = m().scaling(2,2,2)
	
	for (var j = 0; j < Data.PPM_refs.length; j++)	{
		
		if ((fn = Data.PPM_refs[j]).substring(0,"frame".length)=="frame")	{
			
			Data.PPM[fn] = null;
			Data.PPM_refs.splice(j, 1);
			j--;
			console.log("Deleted frame: ", fn);
		}
	}
	
	Data.frame = 0;
	
	
	saveImage(null, fc, revs);
	
	Data.frame = 1;
	
	for (i = step; i < (360*revs+1) - step; i+=step)	{
		
		if(unroll)
			break;
			
		var i2 = radians(i)
		//console.log("i = " + i)
		
		//M = _m.rotation_y(i2)
		
		//Data.o.s[0].transform = M;
		
		//console.log("w = " + FROM.w);
		//FROM.w = 1
		
		Data.o.s[0].transform = m().rotation_y(i2);
		
		new_ = multiply_matrix_by_tuple(m().rotation_y(i2), start_);
		//console.log(new_)
		Data.o.s[1].transform = m().translation(new_.x, new_.y, new_.z)
		ist[Data.o.s[1].id] = null;
		
		//debugger;
		
		renderImageSync(null, null, null, 1)
		
		convertToPPM(_nonCanvasArr, WIDTH, HEIGHT, "frame" + (Data.frame++));
		console.log("Saved frame " + (Data.frame) + ".");
	}
	
	//_nonCanvasArr = []
}

var to_a, _f = 0, _loopCounts = 0;

function quadrant(from)	{
	
	var q = 0
	
	if(from.z < 0)
		if(from.y > 0)
			if(from.x>0)
				q = 1
			else
				q = 4
		else
			if(from.x>0)
				q = 5
			else
				q = 8
	else
		if(from.y > 0)
			if(from.x>0)
				q = 2
			else
				q = 3
		else
			if(from.x>0)
				q = 6
			else
				q = 7
				
	return q
			
}

function stop()	{

		_f = -1;
}

function animate(cycles)	{
	
	if (cycles>0)	{
		
		_loopCounts = cycles;
		
	}
	
	if(_loopCounts<1)	{
		
		_f = -1
	}
	
	if (_f == -1)	{
		
		_f = 0;
		_loopCounts = 0;
		return;
	}
		
	loadToCanvasFromPPM("frame" + _f)
	
	_f++
	
	if (_f < Data.frame)	{
		to_a = setTimeout(animate, 1000/24)
		return
	}
	
	_f = 0
	
	console.log("Completed a revolution of the animation.")
	
	animate(--_loopCounts)
}

function wait(s)	{
	
	var start = Date.now()
	var end;
	
	while( ( ((end = Date.now()) - start ) / 1000) < s)
		;

	return;
	//var time_sec = (end - start) / 1000
}

Data.frame = 0;
function saveImage(fn, fc, revs)	{
		
	var img = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	var width = img.width
	var height = img.height
	var pix = img.data;
	
	if(!fn)
		console.log("Saved frame (" + String(Data.frame+1) + " of " + Math.floor(fc*revs) + ")")
	else
		console.log("Saved image as " + fn)
		
	convertToPPM(pix, width, height, fn || String("frame" + String(Data.frame++)));
}

function getObject(id)	{
	
	var c = Data.o.s
	// 1. check 'id2', 2. check shape-type. 3. check 'id'.
	var i;
	for(i = 0; i < c.length; i++)	{
		
		if(c[i].id2==id)
			return { sh: c[i], i: i }
		
		if(c[i].type==id)
			return { sh: c[i], i: i }
		
		if(c[i].id==id)
			return { sh: c[i], i: i }
	}
	
	return 'NOT_FOUND';
	
}


function checkShape(obj)	{
	
	return (obj == "cylinder" || obj == "triangle" || obj == "plane" || obj == "cube" || obj == "cone" || obj == "group" || obj == "sphere" || obj == "fir_branch" || false)
}
