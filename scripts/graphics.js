var $j = jQuery.noConflict();
var graphics=null;

$j(document).ready
(
	function()
	{
		//setup graphics object
		graphics=new Graphics();
		graphics.init();
	}
);

//definition for Graphics
//============================================================
	
//constructor
function Graphics()
{
	Graphics.message('a new Graphics instance is created');

	//member variables
	//========================================================
	this.canvas=null;
	this.defaultContext='2d';
	this.context=this.defaultContext;
	this.defaultFillStyle='rgb(255,255,255)';
	this.fillStyle=this.defaultFillStyle;
	this.fillActive=false;
	this.defaultStrokeStyle='rgb(0,0,0)';
	this.strokeStyle=this.defaultStrokeStyle;
	this.strokeActive=false;
	this.defaultStrokeWidth=1;
	this.strokeWidth=this.defaultStrokeWidth;
	this.defaultFontFamily='arial';
	this.fontFamily=this.defaultFontFamily;
	this.defaultFontSize=30;
	this.fontSize=this.defaultFontSize;
	this.defaultFontStyle='normal';
	this.fontStyle=this.defaultFontStyle;
	this.defaultGradientColors=[{stop: 0,color:'rgb(0,0,0)'},{stop: 1,color:'rgb(255,255,255)'}];
	this.gradientColors=this.defaultGradientColors;
	this.fillGradientActive=false;
	this.fillGradientCoordinates=[];
	this.defaultFillGradientStyle='linear';
	this.fillGradientStyle=this.defaultFillGradientStyle;

	Graphics.message('member variables are initialised');
	
	//member functions
	//========================================================		
	//initialisation function - executed only once
	this.init=function()
	{
		this.setCanvas('canvas');
		this.setContext('2d');
	}
		
	//mutator for canvas
	this.setCanvas=function(canvas)
	{
		var canvasref=null;
		
		try
		{
			canvas=Graphics.string(canvas);
			canvasref=$j('#'+canvas);
			Graphics.HTMLreference(canvasref.get(0));
			
			var getContext=canvasref.get(0).getContext;
			Graphics.FUNCTIONreference(getContext);
			this.canvas=canvasref;
		}
		catch(error)
		{
			this.canvas=null;
			Graphics.error(error);
			Graphics.message('setCanvas: canvas is not initialised (problem)');		
			return;
		}		

		Graphics.message('canvas is initialised');
	}
	
	//resizes the canvas and retains the contents
	this.resize=function(width,height)
	{
		try
		{
			if(this.canvasReady()===false)
			{
				throw new Error('resize: canvas not ready');
			}
		}
		catch(error)
		{
			Graphics.error(error);
			Graphics.message('resize: canvas not resized (problem)');		
			return;
		}
		
		var context=this.getContext();

		if(context!==null)
		{
			//create in-memory temporary canvas
			var inMemoryCanvas=document.createElement('canvas');
			var inMemoryContext=inMemoryCanvas.getContext(this.context);
			inMemoryCanvas.width=this.canvas.get(0).width;
			inMemoryCanvas.height=this.canvas.get(0).height;
			
			//save the context
			inMemoryContext.drawImage(this.canvas.get(0),0,0);
			
			//resize the canvas
			this.canvas.get(0).width=width;
			this.canvas.get(0).height=height;
			
			//restore the context
			context.drawImage(inMemoryCanvas, 0, 0);
		}
		else
		{
			this.canvas.get(0).width=width;
			this.canvas.get(0).height=height;				
		}
		
		Graphics.message('resize: canvas is resized');
	}

	//checks the state of canvas
	this.canvasReady=function()
	{
		return this.canvas!==null && typeof this.canvas.get(0)!=='undefined';
	}
	
	//checks the state of canvas for 2D operations
	this.canvas2DReady=function()
	{
		return this.canvasReady()&&this.context==='2d';
	}

	//checks the state of canvas for 3D operations
	this.canvas3DReady=function()
	{
		return this.canvasReady()&&this.context==='3d';
	}
	
	//mutator for context
	this.setContext=function(context)
	{
		try
		{
			context=Graphics.string(context);

			if(context!=='2d'&&context!=='3d')
			{
				throw new RangeError('setContext: invalid context value: this value should be either 2D or 3D');
			}
		}
		catch(error)
		{
			Graphics.error(error);
			Graphics.message('setContext: new context is set to default (problem)');		
			return;
		}
	
		this.context=context;	
		Graphics.message('setContext: context is initialised');
	}
	
	//accessor for context
	this.getContext=function()
	{
		try
		{
			if(this.canvasReady()===false)
			{
				throw new Error('getContext: canvas is not ready - context cannot be accessed');
			}
		}
		catch(error)
		{
			Graphics.error(error);
			return null;
		}

		return this.canvas.get(0).getContext(this.context);
	}
	
	//fills the background (whole canvas area) with colour
	this.background=function()
	{
		try
		{
			if(this.canvas2DReady()===false)
			{
				throw new Error('background: canvas 2D is not ready - background cannot be changed');
			}
		}
		catch(error)
		{
			Graphics.error(error);
			return false;
		}

		var context=this.getContext();

		if(context!==null)
		{
			if(this.fillActive===false)
			{
				context.clearRect(0,0,this.canvas.width(),this.canvas.height());
				Graphics.message('background: canvas is transparent');
			}
			else
			{
				this.rect(0,0,this.canvas.width(),this.canvas.height());
				Graphics.message('background: canvas is given a new colour');
			}
		}
	}
	
	//erases everything on the canvas	
	this.clear=function()
	{
		this.noFill();
		this.noStroke();
		this.background();
	}

	//adds a new color in the array of gradient colors
	this.addGradientColor=function(red,green,blue,stop)
	{
		var color=null;
		
		try
		{
			color=Graphics.color(red,green,blue);
			stop=Graphics.number(stop,0,1);
		}
		catch(error)
		{
			Graphics.error(error);
			Graphics.message('addGradientColor: new gradient fill color is not set (problem)');
			return;
		}
		
		var colorStop={};
		colorStop.stop=stop;
		colorStop.color='rgb('+red+','+green+','+blue+')';
		this.gradientColors.push(colorStop);
	}

	//resets the array of gradient colors
	this.resetGradientColors=function()
	{
		this.gradientColors=this.defaultGradientColors;
	}

	//sets the colour to be used for painting the area of shapes
	this.fillGradient=function()
	{
		var args=Array.prototype.slice.call(arguments);
		try
		{
			switch(args.length)
			{
				case 4:	var x1=args[0];
						var y1=args[1];
						var x2=args[2];
						var y2=args[3];
						Graphics.number(x1,0,this.canvas.width());
						Graphics.number(y1,0,this.canvas.height());
						Graphics.number(x2,0,this.canvas.width());
						Graphics.number(y2,0,this.canvas.height());

						if(this.pointWithinRange(x1,y1)===false||this.pointWithinRange(x2,y2)===false)
						{
							throw new Error('fillGradient: the coordinates given correspond to a point that is out of range');
						}

						this.fillGradientCoordinates=args;
						this.fillGradientStyle='linear';
						break;
						
				case 6:	var x1=args[0];
						var y1=args[1];
						var r1=args[2];
						var x2=args[3];
						var y2=args[4];
						var r2=args[5];
						Graphics.number(x1,0,this.canvas.width());
						Graphics.number(y1,0,this.canvas.height());
						Graphics.number(r1);
						Graphics.number(x2,0,this.canvas.width());
						Graphics.number(y2,0,this.canvas.height());
						Graphics.number(r2);
						
						if(this.pointWithinRange(x1,y1)===false||this.pointWithinRange(x2,y2)===false)
						{
							throw new Error('fillGradient: the coordinates given correspond to a point that is out of range');
						}

						this.fillGradientCoordinates=args;
						this.fillGradientStyle='radial';
						break;

				default: throw new Error('fillGradient: incorrect number of arguments given');
			}
		}
		catch(error)
		{
			this.fillGradientActive=false;
			Graphics.error(error);
			Graphics.message('fillGradient: is not active - new gradient parameters are not set (problem)');
			return;
		}		
		
		this.fillGradientActive=true;
		this.fillActive=true;
		Graphics.message('fillGradient: fillGradient is active - new gradient parameters are set');
	}
	
	//sets the colour to be used for painting the area of shapes
	this.fill=function(red,green,blue)
	{
		var color=null;
		
		try
		{
			color=Graphics.color(red,green,blue);
		}
		catch(error)
		{
			Graphics.error(error);
			Graphics.message('fill: new fill color is not set (problem)');
			return;
		}		
		
		this.fillStyle=color;
		this.fillActive=true;
		Graphics.message('fill: fill is active - new fill color is set');
	}
	
	//sets the colour to be used for painting the area of shapes to default (white)	
	this.noFill=function()
	{
		this.fillStyle=this.defaultFillStyle;
		this.fillActive=false;
		Graphics.message('noFill: fill is inactive - fill color is reset to default');
	}
	
	//sets the width of the stroke for points and lines
	this.strokeWeight=function(size)
	{
		try
		{
			size=Graphics.number(size);
		}
		catch(error)
		{
			Graphics.error(error);
			Graphics.message('strokeWeight: stroke weight cannot be changed (problem)');
			return;
		}				
			
		this.strokeWidth=size;
		Graphics.message('strokeWeight: new stroke weight is chosen');
	}

	//sets the colour to be used for painting the perimeter of shapes
	this.stroke=function(red,green,blue)
	{
		if(arguments.length===0)
		{
			this.strokeWidth=this.defaultStrokeWidth;
			this.strokeStyle=this.defaultStrokeStyle;
		}
		else if (arguments.length===3)
		{
			var color=null;
		
			try
			{
				color=Graphics.color(red,green,blue);
			}
			catch(error)
			{
				Graphics.error(error);
				Graphics.message('stroke: new stroke color is not set (problem)');
				this.strokeActive=false;
				return;
			}		
			
			this.strokeStyle=color;
		}
		else
		{
			this.strokeActive=false;
			throw new Error('stroke: invalid operation - incorrect number of arguments given');
		}
		
		this.strokeActive=true;
		Graphics.message('stroke: stroke is active - new stroke color is chosen');
	}

	//sets the colour to be used for painting the perimeter of shapes to the default (white)
	this.noStroke=function()
	{
		this.strokeStyle=this.defaultStrokeStyle;
		this.strokeActive=false;
		Graphics.message('noStroke: stroke is inactive - stroke color is reset to default');
	}

	//checks whether the coordinates of the given rectangular area are within the bounds of the canvas
	this.withinBounds=function(x,y,width,height)
	{
		try
		{
			Graphics.number(x,0,this.canvas.width());
			Graphics.number(y,0,this.canvas.height());
			Graphics.number(width,0,this.canvas.width()-x);
			Graphics.number(height,0,this.canvas.height()-y);
		}
		catch(error)
		{
			Graphics.error(error);
			Graphics.message('withinBounds: rectangle not within bounds (problem)');
			throw new Error('withinBounds: rectangle not within bounds - rendering is not possible');
		}		
	}

	//diplays a rectange
	this.getGradient=function(context)
	{
		var gradient=null;
		var coord=this.fillGradientCoordinates;
		
		if(this.fillGradientStyle==='linear')
		{
			gradient=context.createLinearGradient(coord[0],coord[1],coord[2],coord[3]);
		}
		else
		{
			gradient=context.createRadialGradient(coord[0],coord[1],coord[2],coord[3],coord[4],coord[5]);
		}
		
		for(var o in this.gradientColors)
		{
			gradient.addColorStop(this.gradientColors[o].stop, this.gradientColors[o].color);
		}
		
		return gradient;
	}

	//diplays a rectange
	this.image=function(url,x,y)
	{
		try
		{
			if(this.canvas2DReady()===false)
			{
				throw new Error('image: canvas 2D is not ready - rendering is not possible');
			}
			
			Graphics.string(url);
			Graphics.number(x,0,this.canvas.width());
			Graphics.number(y,0,this.canvas.height());
		}
		catch(error)
		{
			Graphics.error(error);
			return;
		}
	
		var context=this.getContext();

		if(context!==null)
		{
			var image=new Image();
			image.src=url;
			image.onload=function()
			{
				context.drawImage(image,x,y);
			};		
		}
	}
	
	//diplays a rectange
	this.rect=function(x,y,width,height)
	{
		try
		{
			if(this.canvas2DReady()===false)
			{
				throw new Error('rect: canvas 2D is not ready - rendering is not possible');
			}
			
			this.withinBounds(x,y,width,height);
		}
		catch(error)
		{
			Graphics.error(error);
			return;
		}
	
		var context=this.getContext();

		if(context!==null)
		{
			if(this.fillActive===true)
			{
				if(this.fillGradientActive===true)
				{
					context.fillStyle=this.getGradient(context);
				}
				else
				{
					context.fillStyle=this.fillStyle;
				}

				context.fillRect(x,y,width,height);
			}

			if(this.strokeActive===true)
			{
				context.lineWidth=this.strokeWidth;
				context.strokeStyle=this.strokeStyle;
				context.strokeRect(x,y,width,height);
			}
		}

		Graphics.message('rect: a rectangle is displayed');
	}

	//displays a dot
	this.dot=function(x,y)
	{
		//save values
		var fillStyle=this.fillStyle;
		this.fillStyle=this.strokeStyle;
		
		var fillActive=this.fillActive;
		this.fillActive=true;
		
		var strokeActive=this.strokeActive;
		this.strokeActive=false;
		
		//draw a circle
		this.circle(x,y,this.strokeWidth);

		//restore values
		this.fillStyle=fillStyle;
		this.fillActive=fillActive;
		this.strokeActive=strokeActive;
	}

	//displays a circle
	this.circle=function(centrex,centrey,radius)
	{
		try
		{
			if(this.canvas2DReady()===false)
			{
				throw new Error('circle: canvas 2D is not ready - rendering is not possible');
			}			
		}
		catch(error)
		{
			Graphics.error(error);
			return;
		}
					
		var context=this.getContext();

		if(context!==null)
		{
			context.beginPath();
			context.arc(centrex,centrey,radius,0,Math.PI*2,true);
			context.closePath();
			
			if(this.fillActive===true)
			{
				if(this.fillGradientActive===true)
				{
					context.fillStyle=this.getGradient(context);
				}
				else
				{
					context.fillStyle=this.fillStyle;
				}

				context.fill();
			}

			if(this.strokeActive===true)
			{
				context.lineWidth=this.strokeWidth;
				context.strokeStyle=this.strokeStyle;
				context.stroke();
			}
		}
		
		Graphics.message('circle: a circle is displayed');
	}

	//displays an ellipse
	this.ellipse=function(centrex,centrey,width,height)
	{
		try
		{
			if(this.canvas2DReady()===false)
			{
				throw new Error('ellipse: canvas 2D is not ready - rendering is not possible');
			}			
		}
		catch(error)
		{
			Graphics.error(error);
			return;
		}
					
		var context=this.getContext();

		if(context!==null)
		{
			context.beginPath();
			context.moveTo(centrex, centrey - height/2);

			context.bezierCurveTo(
			centrex + width/2, centrey - height/2,
			centrex + width/2, centrey + height/2,
			centrex, centrey + height/2);

			context.bezierCurveTo(
			centrex - width/2, centrey + height/2,
			centrex - width/2, centrey - height/2,
			centrex, centrey - height/2);
			
			context.closePath();
			
			if(this.fillActive===true)
			{
				if(this.fillGradientActive===true)
				{
					context.fillStyle=this.getGradient(context);
				}
				else
				{
					context.fillStyle=this.fillStyle;
				}

				context.fill();
			}

			if(this.strokeActive===true)
			{
				context.lineWidth=this.strokeWidth;
				context.strokeStyle=this.strokeStyle;
				context.stroke();
			}
		}
		
		Graphics.message('ellipse: an ellipse is displayed');
	}

	//diplays a triangle
	this.triangle=function(x1,y1,x2,y2,x3,y3)
	{
		try
		{
			if(this.canvas2DReady()===false)
			{
				throw new Error('triangle: canvas 2D is not ready - rendering is not possible');
			}			
		}
		catch(error)
		{
			Graphics.error(error);
			return;
		}
					
		var context=this.getContext();

		if(context!==null)
		{
			context.beginPath();
			context.moveTo(x1,y1);
			context.lineTo(x2,y2);
			context.lineTo(x3,y3);
			context.closePath();

			if(this.fillActive===true)
			{
				if(this.fillGradientActive===true)
				{
					context.fillStyle=this.getGradient(context);
				}
				else
				{
					context.fillStyle=this.fillStyle;
				}

				context.fill();
			}

			if(this.strokeActive===true)
			{
				context.lineWidth=this.strokeWidth;
				context.strokeStyle=this.strokeStyle;
				context.stroke();
			}
		}
		
		Graphics.message('triangle: a triangle is displayed');
	}
	
	//diplays a bezier curve
	this.bezier=function(x1,y1,cx1,cy1,cx2,cy2,x2,y2)
	{
		try
		{
			if(this.canvas2DReady()===false)
			{
				throw new Error('bezier: canvas 2D is not ready - rendering is not possible');
			}			

			var inrange=true;
			inrange=inrange&&this.pointWithinRange(x1,y1);
			inrange=inrange&&this.pointWithinRange(cx1,cy1);
			inrange=inrange&&this.pointWithinRange(cx2,cy2);
			inrange=inrange&&this.pointWithinRange(x2,y2);
			
			if(inrange===false)
			{
				throw new Error('bezier: bezier curve not within canvas bounds - rendering is not possible');
			}
		}
		catch(error)
		{
			Graphics.error(error);
			return;
		}
		
		var context=this.getContext();

		if(context!==null)
		{
			if(this.strokeActive===true)
			{
				context.beginPath();
				context.moveTo(x1,y1);
				context.bezierCurveTo(cx1,cy1,cx2,cy2,x2,y2);
				context.closePath();							
				context.lineWidth=this.strokeWidth;
				context.strokeStyle=this.strokeStyle;			
				context.stroke();
			}
		}
		
		Graphics.message('bezier: a bezier curve is displayed');
	}
	
	//diplays a line
	this.line=function(x1,y1,x2,y2)
	{
		try
		{
			if(this.canvas2DReady()===false)
			{
				throw new Error('line: canvas 2D is not ready - rendering is not possible');
			}			

			if(this.pointWithinRange(x1,y1)===false||this.pointWithinRange(x2,y2)===false)
			{
				throw new Error('line: line not within canvas bounds - rendering is not possible');
			}
		}
		catch(error)
		{
			Graphics.error(error);
			return;
		}
		
		var context=this.getContext();

		if(context!==null)
		{
			if(this.strokeActive===true)
			{
				context.lineWidth=this.strokeWidth;
				context.strokeStyle=this.strokeStyle;
				context.moveTo(x1,y1);
				context.lineTo(x2,y2);
				context.stroke();
			}
		}
		
		Graphics.message('line: a line is displayed');
	}
	
	//checks whether the given point is within range on the canvas area
	this.pointWithinRange=function(x,y)
	{
		return this.withinXRange(x)&&this.withinYRange(y);
	}
	
	//checks whether the given value is within range on the horizontal axis
	this.withinXRange=function(x)
	{
		return x>=0 && x<=this.canvas.width();
	}

	//checks whether the given value is within range on the vertical axis
	this.withinYRange=function(y)
	{
		return y>=0 && y<=this.canvas.height();
	}
	
	//returns a textual representation of the graphics object
	this.toString=function()
	{
		var info="";
		info+="canvas ready: "+this.canvasReady()+"\n";
		
		if(this.canvasReady()==true)
		{
			info+="width: "+this.canvas.width()+"\n";
			info+="height: "+this.canvas.height()+"\n";	
		}
		
		info+="default context: "+this.defaultContext+"\n";
		info+="current context: "+this.context+"\n";
		return info;
	}

	//displays a textual representation of the graphics object
	this.displayInfo=function()
	{
		Graphics.message(this.toString());
	};
	
	//mutator for font family
	this.setFontFamily=function(family)
	{
		var fonts=[];
		fonts[0]='arial';
		fonts[1]='verdana';
		fonts[2]='times new roman';
		fonts[3]='courier new';
		fonts[4]='serif';
		fonts[5]='sans-serif';
		
		var found=false;
		var i=0;
		
		while(i<fonts.length&&found==false)
		{
			if(fonts[i]===family.toLowerCase())
			{
				found=true;
			}
			else
			{
				i++;
			}
		}
		
		if(found===true)
		{
			this.fontFamily=family;
		}
		else
		{
			this.fontFamily=this.defaultFontFamily;
		}
	}
	
	//mutator for font size
	this.setFontSize=function(size)
	{
		if(size>0)
		{
			this.fontSize=size;
		}
		else
		{
			this.fontSize=this.defaultFontSize;
		}
	}

	//mutator for font style
	this.setFontStyle=function(style)
	{
		if(style==='normal'||style==='italic'||style==='bold')
		{
			this.fontStyle=style;
		}
		else
		{
			this.fontStyle=this.defaultFontStyle;
		}
	}
	
	//sets the font to be used for drawing text on the canvas
	this.font=function(family,size,style)
	{
		try
		{
			family=Graphics.string(family);
			size=Graphics.number(size);
			style=Graphics.string(style);
		}
		catch(error)
		{
			Graphics.error(error);
			Graphics.message('font: new font is not set (problem)');		
			return;
		}
		
		this.setFontFamily(family);
		this.setFontSize(size);
		this.setFontStyle(style);
		
		Graphics.message('font: new font is set');
	}
	
	//displays the given text on the canvas
	this.text=function(text,x,y)
	{
		try
		{
			if(this.canvas2DReady()===false)
			{
				throw new Error('text: canvas 2D is not ready - rendering is not possible');
			}			

			if(this.pointWithinRange(x,y)===false)
			{
				throw new Error('text: the coordinates given correspond to a point that is out of range');
			}
		}
		catch(error)
		{
			Graphics.error(error);
			return;
		}
				
		var context=this.getContext();

		if(context!==null)
		{
			context.font=this.fontStyle+' '+this.fontSize+'px '+this.fontFamily;
			
			if(this.fillActive===true)
			{
				context.fillStyle=this.fillStyle;
				context.fillText(text,x,y);
			}
			
			if(this.strokeActive===true)
			{
				context.lineWidth=this.strokeWidth;
				context.strokeStyle=this.strokeStyle;
				context.strokeText(text,x,y);
			}					
		}
		
		Graphics.message('text: a line of text is displayed');
	}
}

//non-member (static) functions
//============================================================
//handles errors
Graphics.error=function(error)
{
	if(error instanceof Error===false)
	{
		throw new Error('error handler was called with a non-error parameter');
	}
	
	if (typeof console!=="undefined")
	{
		console.error("(Graphics) Error type: %s ==> Error message: %s",error.name,error.message);
	}
}

//handles errors
Graphics.message=function()
{
	if (typeof console!=="undefined")
	{
		for(var i=0;i<arguments.length;i++)
		{
			var argument=arguments[i];
			var specifier=Graphics.format(argument);
			
			if(specifier!==null)
			{
				console.info('(Graphics) '+specifier,argument);
			}
		}
	}
}

//formats data
Graphics.format=function(data)
{
	//%s string, %d%i integer, %f float, %o dom object, %O POJO, %c css
	var type=typeof data;
	var specifier=null;
	
	if(type==='number')
	{
		if(data%1===0)
		{
			specifier='%i';					//integer
		}
		else
		{
			specifier='%f';					//real
		}
	}
	else if(type==='string')
	{
		specifier='%s';						//string
	}
	else if(type==='object')
	{
		if(data instanceof HTMLElement)
		{
			specifier='%o';					//dom
		}
		else
		{
			specifier='%O';					//POJO
		}
	}
	
	return specifier;
}

//performs input validation for numeric values
Graphics.number=function()
{
	var value=null;
	var from=null;
	var to=null;
	
	switch(arguments.length)
	{
		case 3: to=arguments[2];
				from=arguments[1];
		case 1: value=arguments[0];break;
		default: throw new Error('incorrect number of arguments given for number validation');
	}

	var valid=typeof value==='number';

	if(arguments.length>1)
	{
		valid=valid&&typeof from==='number';
		valid=valid&&typeof to==='number';	
	}
	
	if(valid===false)
	{
		throw new TypeError('number: values must be numeric');
	}

	if(arguments.length>1)
	{
		if(value>=from&&value<=to)
		{
			return value;
		}
		else
		{
			throw new RangeError('number: values must be within the range '+from+'-'+to);
		}
	}
	
	return value;
}

//performs input validation for text values
Graphics.string=function(value)
{
	//return (typeof value === 'string'?value:null);
	
	if(typeof value !== 'string')
	{
		throw new TypeError('invalid type: this value should be a string');
	}
	
	return value;
}

//performs input validation for POJO reference values
Graphics.FUNCTIONreference=function(value)
{
	if(typeof value!=='function')
	{
		throw new TypeError('invalid type: this value should be a Function');
	}
	
	return value;
}

//performs input validation for POJO reference values
Graphics.POJOreference=function(value)
{
	if(typeof value!=='object')
	{
		throw new TypeError('invalid type: this value should be a POJO');
	}
	
	return value;
}

//performs input validation for DOM reference values
Graphics.HTMLreference=function(value)
{
	if(!(typeof value==='object'&&value instanceof HTMLElement))
	{
		throw new TypeError('invalid type: this value should be a DOM object');
	}
	
	return value;
}

//performs input validation for color values in rgb form
Graphics.color=function(red,green,blue)
{
	try
	{
		Graphics.number(red,0,255);
		Graphics.number(green,0,255);
		Graphics.number(blue,0,255);
	}
	catch(error)
	{
		Graphics.error(error);
		throw new TypeError('color: invalid parameters, rgb values nust be within the range 0-255');
	}

	return 'rgb('+red+','+green+','+blue+')';
}


/*
**	public methods
**	==============
**	background()
**	clear()
**	fill(r,g,b)
**	addGradientColor(red,green,blue,stop)
**	resetGradientColors()
**	fillGradient(x1,y2,[r1],x2,y2,[r2])
**	noFill()
**	stroke(r,g,b)
**	strokeWeight(size)
**	noStroke()
**	rect(x,y,width,height)
**	dot(x,y);
**	circle(centrex,centrey,radius)
**	ellipse(centrex,centrey,width,height)
**	triangle(x1,y1,x2,y2,x3,y3)
**	bezier(x1,y1,cx1,cy1,cx2,cy2,x2,y2)
**	line(x1,y1,x2,y2)
**	font(family,size,style)
**	text(text,x,y)
**	image(url,x,y)
**/


/*
	draw a line
	-----------
	graphics.stroke(50,60,80);
	graphics.line(20,20,50,60);

	draw a rectangle
	----------------
	graphics.fill(50,60,80);
	graphics.rect(20,20,50,60);

	draw some text
	--------------
	graphics.fill(50,60,80);
	graphics.font('times new roman',50,'italic');
	graphics.text('sokratis',20,30);
*/
