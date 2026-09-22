(function () {
    const list = document.getElementById('loc-list');
    const mapEl = document.getElementById('locationsPageMap');
    const modal = document.getElementById('loc-modal');

    if (!list) {
        return;
    }

    const cards = Array.prototype.slice.call(list.querySelectorAll('.loc-card'));
    const tabs = Array.prototype.slice.call(document.querySelectorAll('#loc-filter button'));
    const US_VIEW = { center: [39.5, -96], zoom: 4.4 };

    let map = null;
    const markers = {};
    let modalCard = null;

    function coordsOf(card) {
        return [
            parseFloat(card.getAttribute('data-lat')),
            parseFloat(card.getAttribute('data-lng')),
        ];
    }

    function markerEl(id) {
        const marker = markers[id];
        return marker && marker._icon ? marker._icon.querySelector('.jby-marker') : null;
    }

    function setHover(card, on) {
        card.classList.toggle('active', on);
        const pin = markerEl(card.id);
        if (pin) {
            pin.classList.toggle('on', on);
        }
    }

    function showVisibleReveals() {
        const vh = window.innerHeight || 800;
        document.querySelectorAll('.page-locations .reveal:not(.in)').forEach(function (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top < vh + 120 && rect.bottom > -120) {
                el.classList.add('in');
            }
        });
    }

    function frameMap(animate) {
        if (!map) {
            return;
        }

        const visible = cards.filter(function (card) {
            return !card.classList.contains('hide');
        });

        if (!visible.length) {
            return;
        }

        const points = visible.map(coordsOf).filter(function (point) {
            return !isNaN(point[0]) && !isNaN(point[1]);
        });

        if (!points.length) {
            return;
        }

        const opt = animate ? { animate: true, duration: 0.7 } : { animate: false };

        if (points.length === 1) {
            map.flyTo(points[0], 10, opt);
            return;
        }

        const mainland = points.filter(function (point) {
            return point[1] > -140;
        });
        const lngs = mainland.map(function (point) {
            return point[1];
        });
        const spread = lngs.length ? Math.max.apply(null, lngs) - Math.min.apply(null, lngs) : 0;

        if (mainland.length === points.length && spread > 30) {
            if (animate) {
                map.flyTo(US_VIEW.center, US_VIEW.zoom, opt);
            } else {
                map.setView(US_VIEW.center, US_VIEW.zoom);
            }
            return;
        }

        const boundPoints = mainland.length > 1 ? mainland : points;

        if (animate) {
            map.flyToBounds(boundPoints, { padding: [46, 46], maxZoom: 6, duration: 0.7 });
        } else {
            map.fitBounds(boundPoints, { padding: [46, 46], maxZoom: 6 });
        }
    }

    function initMap() {
        const JbyMap = window.JbyLeafletMap;

        if (!mapEl || typeof L === 'undefined' || !JbyMap) {
            return;
        }

        map = JbyMap.createMap(mapEl, {
            scrollWheelZoom: true,
            wheelPxPerZoomLevel: 90,
        });

        JbyMap.addTileLayer(map);
        map.setView(US_VIEW.center, US_VIEW.zoom);

        cards.forEach(function (card) {
            const latLng = coordsOf(card);
            if (isNaN(latLng[0]) || isNaN(latLng[1])) {
                return;
            }

            const icon = JbyMap.officeMarkerIcon();

            const titleEl = card.querySelector('h2');
            const marker = L.marker(latLng, {
                icon: icon,
                title: titleEl ? titleEl.textContent : '',
            }).addTo(map);

            marker.on('click', function () {
                openModal(card);
            });
            marker.on('mouseover', function () {
                setHover(card, true);
            });
            marker.on('mouseout', function () {
                setHover(card, false);
            });

            markers[card.id] = marker;
        });

        frameMap(false);
        window.setTimeout(function () {
            map.invalidateSize();
            frameMap(false);
        }, 220);
    }

    function openModal(card) {
        if (!modal) {
            return;
        }

        modalCard = card;
        const photo = document.getElementById('loc-modal-photo');
        const title = document.getElementById('loc-modal-title');
        const subtitle = document.getElementById('loc-modal-subtitle');
        const address = document.getElementById('loc-modal-address');
        const phone = document.getElementById('loc-modal-phone');
        const hours = document.getElementById('loc-modal-hours');
        const explore = document.getElementById('loc-modal-explore');
        const addrText = (card.querySelector('.lc-addr') || {}).textContent || '';
        const phoneText = (card.querySelector('.lc-phone') || {}).textContent || '';
        const hoursText = card.getAttribute('data-hours') || '';
        const hoursNote = card.getAttribute('data-hours-note') || '';
        const imageUrl = card.getAttribute('data-image') || '';
        const exploreUrl = card.getAttribute('data-explore') || card.getAttribute('href') || '#';

        if (photo) {
            photo.style.backgroundImage = imageUrl ? 'url("' + imageUrl + '")' : '';
        }

        if (title) {
            title.textContent = (card.querySelector('h2') || {}).textContent || '';
        }

        if (subtitle) {
            subtitle.textContent = card.getAttribute('data-description') || '';
        }

        if (address) {
            address.textContent = addrText;
            address.setAttribute(
                'href',
                'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addrText)
            );
        }

        if (phone) {
            phone.textContent = phoneText;
            phone.setAttribute('href', card.getAttribute('data-phone-href') || ('tel:' + phoneText.replace(/[^0-9+]/g, '')));
        }

        if (hours) {
            hours.innerHTML =
                (hoursText ? '<span>' + hoursText + '</span>' : '') +
                (hoursNote ? '<span class="loc-hours-note">' + hoursNote + '</span>' : '');
        }

        if (explore) {
            explore.setAttribute('href', exploreUrl);
        }

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!modal) {
            return;
        }

        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    cards.forEach(function (card) {
        card.addEventListener('mouseenter', function () {
            setHover(card, true);
        });
        card.addEventListener('mouseleave', function () {
            setHover(card, false);
        });
        card.addEventListener('click', function (event) {
            event.preventDefault();
            openModal(card);
        });
    });

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            tabs.forEach(function (item) {
                item.classList.remove('on');
                item.setAttribute('aria-selected', 'false');
            });

            tab.classList.add('on');
            tab.setAttribute('aria-selected', 'true');

            const filter = tab.getAttribute('data-filter');

            cards.forEach(function (card) {
                const types = (card.getAttribute('data-types') || '').split(' ');
                const show = filter === 'all' || types.indexOf(filter) > -1;
                card.classList.toggle('hide', !show);

                const marker = markers[card.id];
                if (!marker || !map) {
                    return;
                }

                if (show) {
                    marker.addTo(map);
                } else {
                    map.removeLayer(marker);
                }
            });

            frameMap(true);
        });
    });

    if (modal) {
        modal.querySelectorAll('[data-close]').forEach(function (el) {
            el.addEventListener('click', closeModal);
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && modal.classList.contains('open')) {
                closeModal();
            }
        });
    }

    showVisibleReveals();
    window.addEventListener('scroll', showVisibleReveals, { passive: true });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMap);
    } else {
        initMap();
    }
})();
