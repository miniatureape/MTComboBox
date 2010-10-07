
/*
---
description: A Select element that allows the user to add her own options 

license: MIT-style

authors:
- Justin Donato

requires:
- core/1.2.4: [Class, Class.Extras, Element, Element.Event, Element.Style, Selectors]

provides: [ComboBox, EditableList]

...
*/

/*
    Copyright (c) 2010 Justin Donato

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
*/

var ComboBox = new Class({
    Implements: [Options, Events],

    options: {
        'phtext': 'Select One', 
        'phcls': 'mtcombo', 
        'wrappercls': 'mtcombo-wrapper', 
        'textcls': 'mtph', 
    },

    initialize: function(select, opts) {
        this.setOptions(opts);
        this.hideDataSrc(select);
        this.elem = this.buildSelect(select);
        this.elem.inject(select, 'after');
        this.setEvents(select);
    },

    hideDataSrc: function(elem) {
        elem.setStyle('display', 'none'); 
    },

    buildSelect: function(elem) {
        var options = elem.getElements('option');
        var selected = this.findSelected(elem) || this.options.phtext;

        var mtcombo = new Element('div', {
            'class': this.options.phcls
        });

        var text = new Element('div',{
            'class': this.options.textcls,
            'text': selected.get('text'), 
        }); 

        // Wrap the UI item in a gratititous wrapper
        // To add another styling hook.

        var wrapper = new Element('div', {
            'class': this.options.wrappercls
        });

        mtcombo.grab(text);
        wrapper.grab(mtcombo);
        return wrapper;
    }, 

    setEvents: function(select) {

        this.elem.addEvent('click', function(){
            var editlist = new EditableList(null, this.options.editlistopts);
            editlist.fill( select.getElements('option') );
            document.id(this).getParent().grab(editlist);
            editlist.positionTo(this.elem);

            editlist.addEvent('added', function(val){
                var evaluator = this.options.evalcallback || this.evaluate;
                document.id(editlist).destroy();

                // If the user has entered a value
                if(val){
                    // Create an options element with the entered text and the result
                    // of evaluator called on the text.
                    // The default evaluator returns the entered text.
                    // It can be overridden to perform some action on the
                    // entered value, such as lowercasing, numbering, slugifying, etc
                    var opts = {
                        'text': val,
                        'value': evaluator(val, editlist),
                    };
                    var opt = new Element('option', opts); 
                    opt.selected = true;
                    select.grab(opt);
                    this.update(select);
                }
            }.bind(this));


            // When the user has selected a item, destroy the list
            // and set the displayed text the the selected option's text
            editlist.addEvent('selected', function(){
                document.id(editlist).destroy();
                this.update(select);
            }.bind(this));

        }.bind(this));


    },

    update: function(select) {
        selected = this.findSelected(select);
        this.setText(selected.get('text'));
    },

    setText: function(txt) {
        var ph = document.id(this).getElements('.' + this.options.textcls)[0];
        ph.set('text', txt);
    },

    evaluate: function(val) {
        return val;
    },

    findSelected: function(elem) {
        var options = elem.getElements('option');
        var selected = null;
        options.each(function(option){
           if(option.selected) selected = option;
        });
        return selected;
    },

    toElement: function() {
        return this.elem;
    }
});

var EditableList = new Class({
    Implements: [Events, Options],
    options: {
        'listcls': 'mtcombo-list',
        'instructtxt': 'Select One',
        'instructcls': 'mtcombo-list-instruct',
        'addertxt': '+ item',
        'addercls': 'mtcombo-list-adder',
        'selectedcls': 'mtcombo-selected',
        'inputid': 'mtcombo-input'
    },

    initialize: function(elem, opts) {
        this.setOptions(opts);
        this.elem = this.build(elem, opts);
        this.addEvent('selected');
    },

    build: function(elem, opts) {
        var elem = elem || new Element('div', {'class': this.options.listcls});

        var instruct = new Element('p', {
            'text': this.options.instructtxt,
            'class': this.options.instructcls
        });

        elem.grab(instruct);

        var wrapper = new Element('div'); 

        elem.grab(wrapper);

        var list = new Element('ol', {
            'class': this.options.listcls
        })

        wrapper.grab(list);
        var added = function(val){
            this.fireEvent('added', val)
        };

        var adder = new Element('a', {
            'text': this.options.addertxt,
            'styles': {'display': 'block'},
            'class': this.options.addercls,
        });
        adder.addEvent('click', function(){
            adder.removeEvents('click');
            var input = this.createInput();
            list.grab(input);
            input.getElement('#' + this.options.inputid).focus();
            list.scrollTo(0, list.getCoordinates().height);
        }.bind(this));

        elem.grab(adder);
        return elem;
    },

    createInput: function() {
        var newitem = new Element('li', {
            'html': '<input type="text" id="' + this.options.inputid +'">',
        });

        newitem.addEvent('keypress', function(evt){
            var val = evt.target.value;
            if(evt.key === 'enter') this.fireEvent('added', val);
        }.bind(this));

        return newitem;
    },

    fill: function(options) {
        list = this.getList();
        options.each(function(option){
            var item = new Element('li', {'text': option.get('text')} );
            if(option.selected) item.addClass(this.options.selectedcls);
            item.store('opt', option); 
            list.grab(item);
            item.addEvent('click', function(evt){
                var storedopt = option;
                storedopt.selected = true;
                this.fireEvent('selected', this);
            }.bind(this));
        }.bind(this)); 
        return list;
    },

    getList: function() {
        return this.elem.getElements('.' 
            + this.options.listcls)[0];
    },

    positionTo: function(elem) {
        // Center the list vertically over the collapsed widget
        var coords = elem.getCoordinates();
        var height = this.elem.getCoordinates().height;
        this.elem.setStyles({
            'position': 'absolute',
            'top': coords.top - (height/2),
            'left': coords.x
        });
    },

    toElement: function() {
        return this.elem;
    }

});
