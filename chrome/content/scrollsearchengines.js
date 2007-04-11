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
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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

var ScrollSearchEngines = {

    searchService : null,

    onLoad : function(event) {
        var searchbar = document.getElementById("searchbar");
        searchbar.addEventListener("DOMMouseScroll", function (e) { ScrollSearchEngines.scroll(e); }, false);

        if (window.MenuEdit) {
            setTimeout(this.checkForMenuEdit, 1000);
        } else {
            this.addContextListener();
        }

        this.searchService = Cc["@mozilla.org/browser/search-service;1"].getService(Ci.nsIBrowserSearchService);
    },


    addContextListener : function() {
        var contextMenuItem = document.getElementById("context-searchselect");
        contextMenuItem.addEventListener("DOMMouseScroll", function (e) { ScrollSearchEngines.scrollContextMenu(e); }, false);
    },

    //Checks for the Menu Editor extension and loads our event listener
    //after MenuEditor is initialized.
    checkForMenuEdit : function() {

        if (MenuEdit.loaded) {
            ScrollSearchEngines.addContextListener();
        } else {
            setTimeout(ScrollSearchEngines.checkForMenuEdit, 1000);
        }
    },

    scrollContextMenu : function(event) {

        var oldName = this.searchService.currentEngine.name;
        this.scroll(event);

        var newName = this.searchService.currentEngine.name;
        event.originalTarget.label = event.originalTarget.label.replace(oldName, newName);
    },

    scroll : function(event) {
        BrowserSearch.getSearchBar().selectEngine(event, event.detail > 0);
    }

};

window.addEventListener("load", function(event) { ScrollSearchEngines.onLoad(event); }, false);
