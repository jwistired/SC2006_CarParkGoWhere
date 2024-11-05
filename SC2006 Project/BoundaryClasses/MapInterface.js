function initializeMap()
{
    $.get("https://www.onemap.gov.sg/maps/json/raster/tilejson/2.2.0/Default.json", function (data) {
        if (map) {
            map.remove();
        }
        map = L.TileJSON.createMap('mapdiv', data);
        map.setMaxBounds(bounds);
        map.setView(L.latLng(1.2868108, 103.8545349), 16);

        // Add attribution
        map.attributionControl.setPrefix('<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/>&nbsp;<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>');
        
        // Call functions that need the map to be initialized
        showUserLocation();
    });
}