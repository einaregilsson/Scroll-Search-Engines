var winUtils = require('sdk/window/utils');
var windows = require("sdk/windows").browserWindows;
var prefBranch = require("sdk/simple-prefs");
var prefs = prefBranch.prefs;

function devLog(msg) {
	//console.log(msg);
}

exports.onUnload = function (reason) {
    for (let window of winUtils.windows('navigator:browser', {includePrivate:true})) {
        var searchbar = window.document.getElementById("searchbar");
        if (searchbar && searchbar.scrollEngine) {
			window.document.removeEventListener('wheel', scroll);
			delete searchbar.scrollEngine;        
			
			if (searchbar.sseIcon) {
				searchbar.sseIcon.parentNode.removeChild(searchbar.sseIcon);
				delete searchbar.sseIcon;
			}
			searchbar.removeEventListener('keypress', searchbarKeypress);    
			devLog('Removed scroll handler');
        }
    }
};

function scroll(scrollEvent) {
    if (scrollEvent.target.id == "searchbar" && scrollEvent.target.selectEngine) {
    	devLog('Scroll searchbar');
    	scrollEvent.target.scrollEngine(scrollEvent, scrollEvent.deltaY > 0);
    } else if (scrollEvent.target.id == "context-searchselect") {
    	devLog('Scroll context');
    	scrollContextMenu(scrollEvent);
    }
}

function searchbarKeypress(event) {
    if ((event.charCode == 107 || event.charCode == 75) && event.ctrlKey) { //k or K +ctrl
        event.target.scrollEngine(event, !event.shiftKey);            
    }
}

function scrollContextMenu(scrollEvent) {
	var terms = scrollEvent.target.searchTerms;
	if (!terms) {
		return;
	}

	var window = scrollEvent.target;

	//If there's a better way to get the window I'd love to know it...
	while (!window.getElementById) {
		window = window.parentNode;
	}

	var searchbar = window.getElementById('searchbar');
	if (!searchbar || !searchbar.scrollEngine) {
		return;
	}
	var oldEngine = searchbar.currentEngine.name;
	searchbar.scrollEngine(scrollEvent, scrollEvent.deltaY > 0);

	scrollEvent.target.label = scrollEvent.target.label.replace(oldEngine, searchbar.currentEngine.name);
}


function setupScrollHandler() {
    for (let window of winUtils.windows('navigator:browser', {includePrivate:true})) {
        var searchbar = window.document.getElementById("searchbar");
        //Add event listeners for scrolling
        if (!searchbar) {
        	continue;
        }
        if (!searchbar.scrollEngine) {
	        window.document.addEventListener("wheel", scroll, true);
	        searchbar.addEventListener('keypress', searchbarKeypress);
	        devLog('Added scroll handler');
			
			//Add function to scroll engine to the search bar. This is
			//mostly copied from the selectEngine function with added 
			//functionality to scroll in a loop
			searchbar.scrollEngine = function(aEvent, isNextEngine) {
			    var newIndex = this.engines.indexOf(this.currentEngine);
			    newIndex += isNextEngine ? 1 : -1;
			    if (prefs.loopScroll) {
			        if (newIndex == -1) {
			            newIndex = this.engines.length-1;
			        } else if (newIndex == this.engines.length) {
			            newIndex = 0;
			        }
			    }

			    if (newIndex >= 0 && newIndex < this.engines.length) {
			        this.currentEngine = this.engines[newIndex];
			    }
			    devLog('Current engine is ' + this.currentEngine.name);
			    aEvent.preventDefault();
			    aEvent.stopPropagation();
			    if (searchbar.sseIcon) {
					searchbar.sseIcon.style.backgroundImage = 'url(' + searchbar.currentEngine.iconURI.spec + ')';
			    }
			} 
        }

        //Add icon if it's in the prefs and not added already
        if (!searchbar.sseIcon && prefs.addIcon) {
			//Lets create the stupid image! Maybe need something other than 16px in some cases...?
			var image = window.document.createElement('xul:image');
			image.style.width = '16px';
			image.style.height = '16px';
			image.style.marginLeft = '-2px';
			image.style.backgroundSize = 'cover';
			image.style.marginRight = '3px';
			image.style.backgroundImage = 'url(' + searchbar.currentEngine.iconURI.spec + ')';
			
			var searchImage = window.document.getAnonymousElementByAttribute(searchbar, 'class', 'searchbar-search-button')
			searchImage.parentNode.appendChild(image);
       		searchbar.sseIcon = image;
        }

        //Remove icon if someone has just changed the prefs and wants it gone
        if (searchbar.sseIcon && !prefs.addIcon) {
			searchbar.sseIcon.parentNode.removeChild(searchbar.sseIcon);
			delete searchbar.sseIcon;
        }
    }
}

setupScrollHandler();

windows.on('open', setupScrollHandler);
prefBranch.on('addIcon', setupScrollHandler)

