(function (global) {
    'use strict';

    // CARTO's light_all basemap now needs an API key, and fails silently: every
    // tile answers 200 with a picture that says API KEY REQUIRED. Esri's Light
    // Gray Canvas is the nearest key-free match. Its labels are a separate
    // layer, so there are two URLs here where there used to be one, and Esri
    // renders to z16 — maxNativeZoom stops requesting past it and Leaflet
    // upscales rather than going blank.
    var TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    var TILE_OPTS = {
        maxNativeZoom: 16,
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri',
    };
    var LABEL_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}';
    var LABEL_OPTS = { maxNativeZoom: 16, maxZoom: 19 };

    var DEFAULT_MAP_OPTS = {
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
        minZoom: 2,
        maxZoom: 16,
    };

    var PIN_SVG = '<svg viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">'
        + '<path d="M15 0 C6.7 0 0 6.7 0 15 c0 10 15 25 15 25 s15-15 15-25 C30 6.7 23.3 0 15 0 z" fill="currentColor"/>'
        + '<circle cx="15" cy="15" r="5" fill="#fff"/>'
        + '</svg>';

    function addTileLayer(map) {
        var base = L.tileLayer(TILE_URL, TILE_OPTS).addTo(map);
        L.tileLayer(LABEL_URL, LABEL_OPTS).addTo(map);
        return base;
    }

    function createMap(elementOrId, options) {
        var opts = Object.assign({}, DEFAULT_MAP_OPTS, options || {});
        return L.map(elementOrId, opts);
    }

    function officeMarkerIcon(options) {
        options = options || {};
        var isCurrent = !!options.current;
        var size = isCurrent ? 22 : 16;
        var classes = 'jby-marker';

        if (isCurrent) {
            classes += ' current';
        }

        return L.divIcon({
            className: 'jby-divicon',
            html: '<div class="' + classes + '"></div>',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
        });
    }

    function visitPinIcon(options) {
        options = options || {};
        var cls = 'leaflet-pin' + (options.maritime ? ' maritime' : '');

        return L.divIcon({
            className: cls,
            html: PIN_SVG,
            iconSize: [30, 40],
            iconAnchor: [15, 40],
            popupAnchor: [0, -36],
        });
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatAddress(address) {
        if (!address) {
            return '';
        }

        return escapeHtml(String(address)).replace(/\n/g, '<br>');
    }

    function popupContent(options) {
        options = options || {};
        var title = options.title || '';
        var address = options.address || '';
        var html = '<div class="jby-pop">';

        if (options.type) {
            html += '<p class="jp-type">' + escapeHtml(options.type) + '</p>';
        }

        html += '<p class="jp-name">' + escapeHtml(title) + '</p>';

        if (address) {
            html += '<p class="jp-addr">' + formatAddress(address) + '</p>';
        }

        html += '</div>';

        return html;
    }

    function invalidateLater(map, delay) {
        window.requestAnimationFrame(function () {
            map.invalidateSize();
        });

        if (delay) {
            window.setTimeout(function () {
                map.invalidateSize();
            }, delay);
        }
    }

    global.JbyLeafletMap = {
        TILE_URL: TILE_URL,
        TILE_OPTS: TILE_OPTS,
        LABEL_URL: LABEL_URL,
        LABEL_OPTS: LABEL_OPTS,
        DEFAULT_MAP_OPTS: DEFAULT_MAP_OPTS,
        addTileLayer: addTileLayer,
        createMap: createMap,
        officeMarkerIcon: officeMarkerIcon,
        visitPinIcon: visitPinIcon,
        popupContent: popupContent,
        invalidateLater: invalidateLater,
    };
}(window));
