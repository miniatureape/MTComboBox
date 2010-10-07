
MTCombo
==========
User-editable Select box


Options
--------

Most of the options just control the bits of displayed text and the
classes or IDs that items get. You can poke the source for them if 
you need to. 

The only thing to point out is, any of the options needed for the
EditableList class are passed into the main class (ComboBox) options
like so:

var editlistopts = {'listcls': 'overridden-class'};
var options = {'editlistopts': editlistopts}
var combo = new ComboBox($('myselect'), options);

In the example above, an option called 'listcls' (which gives the list
its css class) is passed in. ComboBox passes editlistopts to the EditableList
as options when it creates it.

That sounds complicated, but its really simple. Just take a look at the source.

The only option that needs explaining is the 'evalcallback'.
When the user has entered a new value into the list, the option's
text  is set to whatever the user has entered and the optoin's
value is first passed through this callback function and set to whatever it
returns. By default it returns the raw text, but you could use it to number
the option, make it a slug, lowercase it, etc.

An example makes it clearer: 

var cb = function(val){
    return "myprefix" + val;
}
options = {'evalcallback': cb}
var combo = new ComboBox($('myselect'), options);

If the user enters the new option "Frankenstein" the resulting option
element created looks like: <option value="myprefixFrankenstien">Frankenstien</option>

The callback also gets passed the entire EditableList object in case the you need access
to any of the other elements etc. Just add a parameter to your callback.

This is just a convenience function and you should be sure to check all user input before
doing anything with it on the server.


How To Use
----------

It's easy...

var options = {};
var combo = new ComboBox($('myselect'), options);
