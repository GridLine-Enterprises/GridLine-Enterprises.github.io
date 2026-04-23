document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.querySelector(".menu-toggle");
    const siteNav = document.querySelector(".site-nav");
    const navLinks = document.querySelectorAll(".site-nav a");
    const revealItems = document.querySelectorAll("[data-reveal]");
    const countItems = document.querySelectorAll("[data-count]");
    const form = document.querySelector(".contact-form");
    const formStatus = document.querySelector("[data-form-status]");

    if (menuButton && siteNav) {
        menuButton.addEventListener("click", () => {
            const isOpen = siteNav.classList.toggle("is-open");
            menuButton.classList.toggle("is-open", isOpen);
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });

        navLinks.forEach((link) => {
            link.addEventListener("click", () => {
                siteNav.classList.remove("is-open");
                menuButton.classList.remove("is-open");
                menuButton.setAttribute("aria-expanded", "false");
            });
        });
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.18
    });

    revealItems.forEach((item) => revealObserver.observe(item));

    const countObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            const element = entry.target;
            const target = Number(element.dataset.count || 0);
            const duration = 1200;
            const startTime = performance.now();

            const updateCount = (now) => {
                const progress = Math.min((now - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                element.textContent = Math.round(target * eased);

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    element.textContent = String(target);
                }
            };

            requestAnimationFrame(updateCount);
            observer.unobserve(element);
        });
    }, {
        threshold: 0.55
    });

    countItems.forEach((item) => countObserver.observe(item));

    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const name = String(formData.get("name") || "").trim();
            const email = String(formData.get("email") || "").trim();
            const message = String(formData.get("message") || "").trim();
            const submitButton = form.querySelector('button[type="submit"]');

            if (!name || !email || !message) {
                if (formStatus) {
                    formStatus.textContent = "Please fill in your name, email, and project details.";
                    formStatus.classList.remove("is-success");
                    formStatus.classList.add("is-error");
                }
                return;
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Sending...";
            }

            if (formStatus) {
                formStatus.textContent = "Sending your project details...";
                formStatus.classList.remove("is-success", "is-error");
            }

            fetch(form.action, {
                method: "POST",
                body: formData,
                headers: {
                    Accept: "application/json"
                }
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Request failed");
                    }

                    return response.json();
                })
                .then((result) => {
                    if (!result.success) {
                        throw new Error(result.message || "Submission failed");
                    }

                    form.reset();

                    if (formStatus) {
                        formStatus.textContent = "Message sent. Check abdelkareemm321@gmail.com for the FormSubmit activation email if this is the first submission.";
                        formStatus.classList.remove("is-error");
                        formStatus.classList.add("is-success");
                    }
                })
                .catch(() => {
                    if (formStatus) {
                        formStatus.textContent = "Something went wrong while sending. Please try again in a moment.";
                        formStatus.classList.remove("is-success");
                        formStatus.classList.add("is-error");
                    }
                })
                .finally(() => {
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = "Send Project Details";
                    }
                });
        });
    }
});
