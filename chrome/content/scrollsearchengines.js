// $Id$ 
/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is scrollsearchengines.
 *
 * The Initial Developer of the Original Code is
 *
 * Einar Egilsson. (email: scrollsearchengines@einaregilsson.com)
 *
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU LeSSEr General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var SSE = {

    //Members
    searchService : null,
    loopScroll : false,
    searchBar : null,
    
    //Initialization 
    onLoad : function(loadEvent) {

        //Init members
        SSE.searchService = Cc["@mozilla.org/browser/search-service;1"]
                                .getService(Ci.nsIBrowserSearchService);
        SSE.searchBar = document.getElementById("searchbar");
        SSE.readPrefs();

        
        //Add event listeners for scrolling
        document.addEventListener("DOMMouseScroll", function (scrollEvent) {
            if (scrollEvent.target.id == "searchbar" && scrollEvent.target.selectEngine) {
                SSE.scroll(scrollEvent);
            } else if (scrollEvent.target.id == "context-searchselect") {
                SSE.scrollContextMenu(scrollEvent);
            }

        }, true);


        //Add event listeners for keyboard shortcuts
        SSE.searchBar.addEventListener('keypress', function(event) {
            if ((event.charCode == 107 || event.charCode == 75) && event.ctrlKey) { //k or K +ctrl
                document.getElementById("searchbar").scrollEngine(event, !event.shiftKey);            
            }
        }, true);


        //Add function to scroll engine to the search bar. This is
        //mostly copied from the selectEngine function with added 
        //functionality to scroll in a loop
        SSE.searchBar.scrollEngine = function(aEvent, isNextEngine) {
            var newIndex = this.engines.indexOf(this.currentEngine);
            newIndex += isNextEngine ? 1 : -1;
            if (SSE.loopScroll) {
                if (newIndex == -1) {
                    newIndex = this.engines.length-1;
                } else if (newIndex == this.engines.length) {
                    newIndex = 0;
                }
            }

            if (newIndex >= 0 && newIndex < this.engines.length) {
                this.currentEngine = this.engines[newIndex];
            }
            aEvent.preventDefault();
            aEvent.stopPropagation();
        }  
        
        Cc["@mozilla.org/preferences-service;1"]
            .getService(Ci.nsIPrefBranchInternal)
                .addObserver('extensions.scrollsearchengines', SSE, false);
        
    },
    
    //Cleanup
    onUnload : function(unloadEvent) {
        Cc["@mozilla.org/preferences-service;1"]
            .getService(Ci.nsIPrefBranchInternal)
                .removeObserver('extensions.scrollsearchengines', SSE);
    },
    
    //Read the loop scroll pref setting    
    readPrefs : function() {
        SSE.loopScroll = Cc["@mozilla.org/preferences-service;1"]
                             .getService(Ci.nsIPrefService)
                                 .getBoolPref('extensions.scrollsearchengines.loopscroll');
    },

    //Observe changes in the loop scroll pref setting
    observe : function(subject, topic, data) {
        if (topic == 'nsPref:changed' && data == 'extensions.scrollsearchengines.loopscroll') {
            SSE.readPrefs();
        }
    },

    //Scroll context menu = scroll + change name of engine in the menu
    scrollContextMenu : function(scrollEvent) {

        SSE.scroll(scrollEvent);
        //This code mostly taken from the isTextSelection() function in browser.js
        var selectedText = getBrowserSelection(16);
        if (!selectedText) {
            return;
        }

        if (selectedText.length > 15) {
            selectedText = selectedText.substr(0,15) + "...";
        }

        var engineName = SSE.searchService.currentEngine.name;

        // format "Search <engine> for <selection>" string to show in menu
        scrollEvent.target.label = gNavigatorBundle.getFormattedString("contextMenuSearchText",
                                                          [engineName, selectedText]);
    },

    //Scroll search engines...
    scroll : function(scrollEvent) {
        document.getElementById("searchbar").scrollEngine(scrollEvent, scrollEvent.detail > 0);
    }

};

window.addEventListener("load", SSE.onLoad, false);
window.addEventListener("unload", SSE.onUnload, false);
