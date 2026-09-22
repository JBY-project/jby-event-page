(function (global) {
    'use strict';

    var TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    var TILE_OPTS = {
        subdomains: 'abcd',
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap &copy; CARTO',
    };

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
        return L.tileLayer(TILE_URL, TILE_OPTS).addTo(map);
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
        DEFAULT_MAP_OPTS: DEFAULT_MAP_OPTS,
        addTileLayer: addTileLayer,
        createMap: createMap,
        officeMarkerIcon: officeMarkerIcon,
        visitPinIcon: visitPinIcon,
        popupContent: popupContent,
        invalidateLater: invalidateLater,
    };
}(window));
