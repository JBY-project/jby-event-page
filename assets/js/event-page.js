(function () {
    function initScheduleToggle() {
        const toggle = document.querySelector('[data-event-schedule-toggle]');
        const rows = document.querySelectorAll('[data-schedule-row]');

        if (!toggle || !rows.length) {
            return;
        }

        let expanded = false;

        toggle.addEventListener('click', function () {
            expanded = !expanded;

            rows.forEach(function (row, index) {
                const list = row.closest('[data-event-schedule-list]');
                const visibleCount = parseInt(list?.dataset.visibleCount || '2', 10);

                if (index >= visibleCount) {
                    row.hidden = !expanded;
                }
            });

            toggle.textContent = expanded ? 'View Less' : 'View More';
        });
    }

    function initVesselsCarousel() {
        const track = document.querySelector('[data-event-vessels-track]');
        const prevButton = document.querySelector('[data-event-vessels-prev]');
        const nextButton = document.querySelector('[data-event-vessels-next]');

        if (!track || !nextButton) {
            return;
        }

        const getScrollStep = function () {
            const slide = track.querySelector('.event-vessels-slider__slide');
            if (!slide) {
                return track.clientWidth;
            }

            const styles = window.getComputedStyle(track);
            const gap = parseFloat(styles.columnGap || styles.gap || '16');
            return slide.offsetWidth + gap;
        };

        const updateNavState = function () {
            const maxScrollLeft = track.scrollWidth - track.clientWidth;
            const canScrollPrev = track.scrollLeft > 1;
            const canScrollNext = track.scrollLeft < maxScrollLeft - 1;

            if (prevButton) {
                prevButton.hidden = !canScrollPrev;
            }

            nextButton.disabled = !canScrollNext;
        };

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
            });
        }

        nextButton.addEventListener('click', function () {
            track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
        });

        track.addEventListener('scroll', updateNavState, { passive: true });
        window.addEventListener('resize', updateNavState);
        updateNavState();
    }

    function initRsvpForm() {
        const form = document.getElementById('eventRsvpForm');
        if (!form) {
            return;
        }

        const feedback = document.getElementById('eventRsvpFeedback');
        const submitBtn = form.querySelector('button[type="submit"]');
        const defaultButtonText = submitBtn ? submitBtn.textContent.trim() : 'RSVP';

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            if (!submitBtn) {
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            window.setTimeout(function () {
                if (feedback) {
                    feedback.textContent = 'Your RSVP has been received. Our team will contact you shortly.';
                    feedback.className = 'contact-form__feedback is-success';
                }

                form.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = defaultButtonText;
            }, 600);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initScheduleToggle();
        initVesselsCarousel();
        initRsvpForm();

        if (window.initYachtCardHover) {
            window.initYachtCardHover(document.querySelector('.event-vessels-slider'));
        }
    });
})();
