var ScrollSearchEngines = {

    onLoad : function(event) {

        var sb = document.getElementById('searchbar');
        sb.addEventListener('DOMMouseScroll', function (e) { ScrollSearchEngines.scroll(e); }, false); 
    },
    
    scroll : function(event) {
		BrowserSearch.getSearchBar().selectEngine(event, event.detail > 0);
    }
    
};

window.addEventListener('load', function(event) { ScrollSearchEngines.onLoad(event); }, false);
