(function () {
    function buildShareUrl(network, pageUrl, pageTitle) {
        const encodedUrl = encodeURIComponent(pageUrl);
        const encodedTitle = encodeURIComponent(pageTitle);
        const encodedText = encodeURIComponent(pageTitle + ' ' + pageUrl);

        switch (network) {
            case 'facebook':
                return 'https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl;
            case 'x':
                return 'https://twitter.com/intent/tweet?url=' + encodedUrl + '&text=' + encodedTitle;
            case 'linkedin':
                return 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodedUrl;
            case 'whatsapp':
                return 'https://wa.me/?text=' + encodedText;
            case 'pinterest':
                return 'https://pinterest.com/pin/create/button/?url=' + encodedUrl + '&description=' + encodedTitle;
            case 'telegram':
                return 'https://t.me/share/url?url=' + encodedUrl + '&text=' + encodedTitle;
            case 'email':
                return 'mailto:?subject=' + encodedTitle + '&body=' + encodedUrl;
            default:
                return pageUrl;
        }
    }

    function openShareWindow(url) {
        const width = 640;
        const height = 560;
        const left = Math.max(0, (window.screen.width - width) / 2);
        const top = Math.max(0, (window.screen.height - height) / 2);
        const features = 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',noopener,noreferrer';

        window.open(url, 'jb-share-window', features);
    }

    function closeAllShareMenus(exceptMenu) {
        document.querySelectorAll('[data-share-menu]').forEach(function (menu) {
            if (menu === exceptMenu) {
                return;
            }

            const trigger = menu.querySelector('.share-menu__trigger');
            const dropdown = menu.querySelector('.share-menu__dropdown');

            if (dropdown) {
                dropdown.hidden = true;
            }

            if (trigger) {
                trigger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function setFeedback(menu, message) {
        const feedback = menu.querySelector('[data-share-feedback]');
        if (!feedback) {
            return;
        }

        feedback.textContent = message;

        if (!message) {
            return;
        }

        window.clearTimeout(menu._shareFeedbackTimer);
        menu._shareFeedbackTimer = window.setTimeout(function () {
            feedback.textContent = '';
        }, 2200);
    }

    function getShareData(menu) {
        return {
            url: menu.dataset.shareUrl || window.location.href,
            title: menu.dataset.shareTitle || document.title,
        };
    }

    function initShareMenu(menu) {
        const trigger = menu.querySelector('.share-menu__trigger');
        const dropdown = menu.querySelector('.share-menu__dropdown');
        const nativeButton = menu.querySelector('[data-share-native]');

        if (!trigger || !dropdown) {
            return;
        }

        if (nativeButton && navigator.share) {
            nativeButton.hidden = false;
        }

        trigger.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();

            const isOpen = !dropdown.hidden;
            closeAllShareMenus(menu);

            dropdown.hidden = isOpen;
            trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
            setFeedback(menu, '');
        });

        dropdown.querySelectorAll('[data-share-network]').forEach(function (item) {
            item.addEventListener('click', function (event) {
                event.preventDefault();

                const network = item.getAttribute('data-share-network');
                const shareData = getShareData(menu);
                const shareUrl = buildShareUrl(network, shareData.url, shareData.title);

                if (network === 'email') {
                    window.location.href = shareUrl;
                } else {
                    openShareWindow(shareUrl);
                }

                dropdown.hidden = true;
                trigger.setAttribute('aria-expanded', 'false');
            });
        });

        const copyButton = menu.querySelector('[data-share-copy]');
        if (copyButton) {
            copyButton.addEventListener('click', async function () {
                const shareData = getShareData(menu);

                try {
                    await navigator.clipboard.writeText(shareData.url);
                    setFeedback(menu, 'Link copied');
                } catch (error) {
                    window.prompt('Copy this link:', shareData.url);
                }

                dropdown.hidden = true;
                trigger.setAttribute('aria-expanded', 'false');
            });
        }

        if (nativeButton) {
            nativeButton.addEventListener('click', async function () {
                const shareData = getShareData(menu);

                try {
                    await navigator.share({
                        title: shareData.title,
                        url: shareData.url,
                    });
                } catch (error) {
                    if (error?.name !== 'AbortError') {
                        setFeedback(menu, 'Unable to open share menu');
                    }
                }

                dropdown.hidden = true;
                trigger.setAttribute('aria-expanded', 'false');
            });
        }
    }

    document.addEventListener('click', function (event) {
        if (!event.target.closest('[data-share-menu]')) {
            closeAllShareMenus();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeAllShareMenus();
        }
    });

    function init() {
        document.querySelectorAll('[data-share-menu]').forEach(initShareMenu);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
