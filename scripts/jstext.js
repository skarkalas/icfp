var $j = jQuery.noConflict();
var text=null;

$j(document).ready
(
	function()
	{
		//setup text object
		text=new Text();
		text.init();
	}
);

//definition for Text
//============================================================
	
//constructor
function Text()
{
	Text.message('a new Text instance is created');

	//member variables
	//========================================================
	this.textarea=null;

	//member functions
	//========================================================		
	//initialisation function - executed only once
	this.init=function()
	{
		this.setTextArea('textoutputarea');
		Text.message('member variables are initialised');
	}
	
	//mutator function for textarea
	this.setTextArea=function(textarea)
	{
		var area=$j('#'+textarea);
		
		try
		{
			if(area.is('textarea')===false)
			{
				{
					throw new TypeError('setTextArea: id given does not correspond to a textarea element');
				}			
			}
		}
		catch(error)
		{
			Text.error(error);
			return;
		}
		
		this.textarea=area;
	}
	
	//checks whether a textarea is in place
	this.textAreaReady=function()
	{
		return this.textarea!==null;
	}
	
	//removes the contents from the textarea
	this.clear=function()
	{
		try
		{
			if(this.textAreaReady()===false)
			{
				throw new Error('clear: textarea is not ready - clear is not possible');
			}
		}
		catch(error)
		{
			Text.error(error);
			return false;
		}
		
		this.textarea.val('');
	}
	
	this.read=function()
	{
		var args=Array.prototype.slice.call(arguments);
		
		try
		{
			if(args.length<1)
			{
				throw new Error('output: invalid number of arguments - input is not possible');
			}

			var names=new Array();
			
			for(var i=0;i<args.length;i++)
			{
				Text.POJOreference(args[i]);
				var format=true;
				format=format&&'name' in args[i];
				format=format&&'type' in args[i];
				format=format&&'prompt' in args[i];
				
				if(format===false)
				{
					throw new Error('input: invalid argument format - input is not possible');
				}
				
				format=false;
				format=format||args[i].type==='number';
				format=format||args[i].type==='string';
				format=format||args[i].type==='boolean';
				format=format||args[i].type==='date';

				if(format===false)
				{
					throw new Error('input: invalid type given - input is not possible');
				}

				if(args[i].name.indexOf(' ')!==-1)
				{
					throw new Error('input: names in JSON cannot contain spaces - input is not possible');
				}
				
				if(names.indexOf(args[i].name)===-1)
				{
					names.push(args[i].name);
				}
				else
				{
					throw new Error('input: duplicate names found is JSON - input is not possible');
				}
			}			
		}
		catch(error)
		{
			Text.error(error);
			return false;
		}
		
		return Text.showDialog(args);
	}

	//displays the given text on the textarea
	//accepts any number of parameters
	//enumerates automatically objects
	this.write=function()
	{
		try
		{
			if(this.textAreaReady()===false)
			{
				throw new Error('output: textarea is not ready - output is not possible');
			}
			if(arguments.length<1)
			{
				throw new Error('output: invalid number of arguments - output is not possible');
			}			
		}
		catch(error)
		{
			Text.error(error);
			return false;
		}

		var value='';
		
		for(var i=0;i<arguments.length;i++)
		{			
			value+=(typeof arguments[i]==='object'?Text.toString(arguments[i]):arguments[i]);
		}
		
		this.textarea.val(this.textarea.val()+value);
		Text.message('displayText: some text is displayed');	
		return true;
	}
	
	//displays the given text on the textarea
	//format specifiers can be used, any number of values can be supplied
	this.printf=function()
	{
		try
		{
			if(this.textAreaReady()===false)
			{
				throw new Error('outputf: textarea is not ready - output is not possible');
			}			
			
			if(arguments.length<2)
			{
				throw new Error('outputf: invalid number of arguments - output is not possible');
			}

			var format=arguments[0];
			Text.string(format);
			
			for(var i=1;i<arguments.length;i++)
			{
				format=Text.processFormatSpecifier(format,arguments[i]);
			}
		}
		catch(error)
		{
			Text.error(error);
			return false;
		}
		
		this.textarea.val(this.textarea.val()+format);
		
		Text.message('outputf: some formatted text is displayed');
		
		return true;
	}
}

//non-member (static) functions
//============================================================

//displays modal dialog and returns the input given
Text.showDialog=function(args)
{
	var url='dialog.html';
	var options='dialogWidth: 700; dialogHeight: 400;';

	// Convert the options string into an object.
	var pairs = options.replace(/\s+/g, "").split(";");
	var option = {};

	$j.each
	(
		pairs,
		function()
		{
			var pair = this.split(":");
			if (pair.length != 2) return true;

			option[pair[0]] = pair[1];
		}
	);

	// Get the width and height of the document.
	var width = $j(document).width();
	var height = $j(document).height();

	// Get the width and height of the dialog.
	var dialogWidth = option.dialogWidth.replace("px", ""); 
	var dialogHeight = option.dialogHeight.replace("px", "");

	// Calculate where the dialog needs to be to be
	// centered.
	var dialogLeft = (width - dialogWidth) / 2;
	var dialogTop = (height - dialogHeight) / 2;

	// Add those settings to the options string.
	options += "dialogLeft: " + dialogLeft + "; ";
	options += "dialogTop: " + dialogTop + "; ";

	// Call the function.
	var returnValue=window.showModalDialog(url, args, options);
	return returnValue;
}

//replaces the format specifier in a piece of text with the corresponding value 
Text.processFormatSpecifier=function(text,nextValue)
{
	var nextSpecifier=Text.getNextFormatSpecifier(text);

	if(nextSpecifier===null)
	{
		throw new Error('(processFormatSpecifier) no specifier found');
	}

	var specifier=nextSpecifier;
	specifier=specifier.substring(1);

	var left=specifier[0]==='-';
	
	if(left===true)
	{
		specifier=specifier.substring(1);
	}

	var space=parseFloat(specifier);
	var decimalPlaces=null;

	if(isNaN(space)===false)
	{
		specifier=specifier.substring(space.toString().length);

		if(space%1!==0)
		{
			decimalPlaces=space.toString().split('.')[1];
			decimalPlaces=parseInt(decimalPlaces);
			space=space.toString().split('.')[0];
			space=parseInt(space);
		}
	}

	try
	{
		if(decimalPlaces!==null&&specifier!=='f')
		{
			throw new Error('(processFormatSpecifier) non float value given with decimal places format specifier');
		}
		
		switch(specifier)
		{
			case	'i':
			case	'd':	Text.integer(nextValue);
							break;
			case	'f':	Text.real(nextValue);
							if(decimalPlaces!==null)
							{
								nextValue=nextValue.toFixed(decimalPlaces);
							}							
							break;
			case	's':	Text.string(nextValue);
							break;
			case	'o':	Text.DOMreference(nextValue);
							nextValue=Text.toString(nextValue);
							break;
			case	'O':	Text.POJOreference(nextValue);
							nextValue=Text.toString(nextValue);
							break;
			default:
		}
	}
	catch(error)
	{
		Text.error(error);
		throw new Error('(processFormatSpecifier) value given is incompatible with format specifier');
	}
	
	if(isNaN(space)===false)
	{
		var padding=Array(space+1).join(' ');
		
		if(left===true)
		{
			nextValue=String(nextValue+padding).slice(0,padding.length);
		}
		else
		{
			nextValue=String(padding+nextValue).slice(-padding.length);
		}
	}
	
	text=text.replace(nextSpecifier,nextValue);
	return text;
}

//enumerates an object and returns a textual representation of its contents
Text.toString=function(object)
{
	var properties='';
	
	for(var property in object)
	{
		properties+=property+':'+object[property]+'\n';
	}
	
	return properties;
}

//retrieves a format specifier from a piece of text (if ther is one)
Text.getNextFormatSpecifier=function(text)
{
	var pattern='%[-]?[0-9]*([.][0-9]+)?[idfsoO]';
	var modifiers='';
	var regexp=new RegExp(pattern,modifiers);
	var match=regexp.exec(text);
	return match.toString().split(',')[0];
}

//displays error messages to the console
Text.error=function(error)
{
	if(error instanceof Error===false)
	{
		throw new Error('error handler was called with a non-error parameter');
	}
	
	if (typeof console!=="undefined")
	{
		console.error("(Text) Error type: %s ==> Error message: %s",error.name,error.message);
	}
}

//displays messages to the console
Text.message=function()
{
	if (typeof console!=="undefined")
	{
		for(var i=0;i<arguments.length;i++)
		{
			var argument=arguments[i];
			var specifier=Text.format(argument);
			
			if(specifier!==null)
			{
				console.info('(Text) '+specifier,argument);
			}
		}
	}
}

//formats data to be displayed in the console
Text.format=function(data)
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

//performs input validation for integer values
Text.integer=function(value)
{
	var type=typeof value;

	if(type==='number')
	{
		if(value%1!==0)
		{
			throw new TypeError('integer: value must be an integer');
		}
	}
	else
	{
		throw new TypeError('integer: value must be numeric');
	}
}

//performs input validation for real values
Text.real=function(value)
{
	var type=typeof value;

	if(type!=='number')
	{
		throw new TypeError('real: value must be numeric');
	}
}

//performs input validation for numeric values
Text.number=function()
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
Text.string=function(value)
{
	//return (typeof value === 'string'?value:null);
	
	if(typeof value !== 'string')
	{
		throw new TypeError('invalid type: this value should be a string');
	}
	
	return value;
}

//performs input validation for Function reference values
Text.FUNCTIONreference=function(value)
{
	if(typeof value!=='function')
	{
		throw new TypeError('invalid type: this value should be a Function');
	}
	
	return value;
}

//performs input validation for POJO reference values
Text.POJOreference=function(value)
{
	if(typeof value!=='object')
	{
		throw new TypeError('invalid type: this value should be a POJO');
	}
	
	return value;
}

//performs input validation for DOM reference values
Text.DOMreference=function(value)
{
	if(!(typeof value==='object'&&value instanceof HTMLElement))
	{
		throw new TypeError('invalid type: this value should be a DOM object');
	}
	
	return value;
}



/*
**	public methods
**	==============
**	init()						//initialises the object
**	clear()						//removes all the content from the textarea
**	write(v1,v2,..vn)			//displays the given text on the textarea - accepts any number of arguments - enumerates automatically objects
**	printf('format',v1,v2,..vn)//displays formatted text on the textarea - accepts any number of arguments - enumerates automatically objects
**	read(json1,json2,..jsonn)	//gets input from the user - json is used to specify the input required {name:'..',type='number|string|boolean|date',prompt:'..'}
**/


/*
	get some data from the user and display it formatted
	----------------------------------------------------
	text.clear();
	var name={name:'name',type:'string',prompt:'type your name'};
	var age={name:'age',type:'number',prompt:'type your age'};
	var dob={name:'birthdate',type:'date',prompt:'select your date of birth'};
	var sex={name:'sex',type:'boolean',prompt:'are you male?'};
	var input=text.read(name,age,dob,sex);
	text.printf('Your name is %s and you are %d years old\n',input[0].value,input[1].value);
	text.printf('You are %s and you were born in %d\n',input[3].value?'male':'female',input[2].value.getFullYear());
	
	display unformatted output
	--------------------------
	text.clear();
	var n=5;
	var s='Sokratis';
	var o={name:'sokratis',age:42};
	text.write(n,'\n',s,'\n',o);
	
	display formatted output
	------------------------
	text.clear();
	text.printf('|%-20s|\n','Maria');
	text.printf('|%20.2f|\n',12.59874513);
	text.printf('|%20d|\n',55);
	text.printf('%O\n',{name:'Sokratis',age:42});	
*/
