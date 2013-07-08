var $j = jQuery.noConflict();

$j(document).ready
(
	function()
	{
		$j("#reset").button();
		$j("#submit").button();
		
		populate(window.dialogArguments);
		
		function populate(args)
		{
			var data=document.getElementById('data');
			
			if(data===null)
			{
				return;
			}
			
			for(var i=0;i<args.length;i++)
			{
				var arg=args[i];
				var row=data.insertRow(-1);
				var cell0=row.insertCell(0);
				var cell1=row.insertCell(1);
				var cell2=row.insertCell(2);
				var cell3=row.insertCell(3);
				cell0.innerHTML='<label for="'+arg.name+'">'+arg.name+'</label>';
				
				if(arg.type==='date')
				{
					cell1.innerHTML='<input type="text" name="'+arg.name+'" id="'+arg.name+'" class="text ui-widget-content ui-corner-all" disabled/>';
					$j('#'+arg.name ).datepicker
					(
						{
							showOn: "button",
							buttonImage: "./images/calendar.gif",
							buttonImageOnly: true,
							changeMonth: true,
							changeYear: true
						}
					);
				}
				else if(arg.type==='boolean')
				{
					var html='';
					html+='<div id='+arg.name+'>';
					html+='<input type="radio" id="radio1" name="'+arg.name+'" value="true"/><label for="radio1">Yes</label>';
					html+='<input type="radio" id="radio2" name="'+arg.name+'" value="false" checked="checked" /><label for="radio2">No</label>';
					html+='</div>';
					cell1.innerHTML=html;
					$j('#'+arg.name ).buttonset();
				}
				else
				{
					cell1.innerHTML='<input type="text" name="'+arg.name+'" id="'+arg.name+'" class="text ui-widget-content ui-corner-all" />';
				}
				
				cell2.innerHTML='<img src="./images/left_small.png" height="30px"></img>';
				cell3.innerHTML='<span>'+arg.prompt+'</span>';
			}
		}
	}
);

function submitData()
{
	var returnValue=validate();
	
	if(returnValue===null)
	{
		return;
	}
	
	window.returnValue=returnValue;
	window.close();
}

function validate()
{
	var args=window.dialogArguments;
	var returnValue=new Array();
	
	for(var i=0;i<args.length;i++)
	{
		var arg=args[i];
		var element=document.getElementById(arg.name);
		var object=new Object();	
		object.name=arg.name;

		var valid=true;
		
		if(arg.type==='number')
		{
			valid=validateNumber(element.value);
		}

		if(arg.type==='date'||arg.type==='string')
		{
			valid=isEmpty(element.value)===false;
		}
		
		if(valid===false)
		{
			alert('invalid input for '+arg.name);
			element.select();
			return null;
		}

		if(arg.type==='boolean')
		{
			var radios=document.getElementsByName(arg.name);

			for(var j=0,length=radios.length;j<length;j++)
			{
				if(radios[j].checked)
				{
					object.value=radios[j].value==='true';
					break;
				}
			}
		}
		else if(arg.type==='number')
		{
			object.value=new Number(element.value).valueOf();
		}
		else if(arg.type==='string')
		{
			object.value=element.value;
		}
		else
		{
			object.value=new Date(element.value);			
		}
		
		returnValue.push(object);
	}

	return returnValue;
}

function validateNumber(value)
{
	if(isEmpty(value)===true)
	{
		return false;
	}
	
	if(isNaN(value)===true)
	{
		return false;
	}
	
	return true;
}

function isEmpty(value)
{
	return value.trim().length===0;
}
