/* ==========================================================================
   Sujata's Beauty Salon - Interactive JavaScript App Engine
   - Service Multi-selection & WhatsApp Booking Generator
   - Real-time Category Filtering & Search
   - Business Card QR Code Generator with Download Support
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });

        // Close nav when link clicked
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('show');
            });
        });
    }

    // 2. Set Dynamic Year
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 3. Service Selection & Cart Engine
    let selectedServices = [];

    const bookingCartBar = document.getElementById('booking-cart');
    const selectedCountEl = document.getElementById('selected-count');
    const selectedTotalEl = document.getElementById('selected-total');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const sendWhatsappBookingBtn = document.getElementById('send-whatsapp-booking-btn');

    // Attach listener to all "Add to Booking" buttons
    const bookButtons = document.querySelectorAll('.book-service-btn');

    bookButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const serviceName = btn.getAttribute('data-name');
            const servicePriceRaw = btn.getAttribute('data-price');
            
            // Parse numeric price if valid
            const numericPrice = parseInt(servicePriceRaw, 10) || 0;

            // Check if already selected
            const existingIndex = selectedServices.findIndex(item => item.name === serviceName);

            if (existingIndex > -1) {
                // Remove item if clicked again
                selectedServices.splice(existingIndex, 1);
                btn.classList.remove('added');
                if (btn.querySelector('i')) {
                    btn.querySelector('i').className = 'fa-solid fa-plus';
                }
            } else {
                // Add item
                selectedServices.push({
                    name: serviceName,
                    price: numericPrice,
                    priceText: servicePriceRaw
                });
                btn.classList.add('added');
                if (btn.querySelector('i')) {
                    btn.querySelector('i').className = 'fa-solid fa-check';
                }
            }

            updateBookingCart();
        });
    });

    function updateBookingCart() {
        if (!bookingCartBar) return;

        const count = selectedServices.length;
        const totalSum = selectedServices.reduce((sum, item) => sum + item.price, 0);

        if (count > 0) {
            bookingCartBar.classList.add('active');
            selectedCountEl.textContent = count;
            selectedTotalEl.textContent = '₹' + totalSum;
        } else {
            bookingCartBar.classList.remove('active');
        }
    }

    // Clear Cart
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            selectedServices = [];
            bookButtons.forEach(btn => {
                btn.classList.remove('added');
                if (btn.querySelector('i')) {
                    btn.querySelector('i').className = 'fa-solid fa-plus';
                }
            });
            updateBookingCart();
        });
    }

    // Send WhatsApp Booking Message
    if (sendWhatsappBookingBtn) {
        sendWhatsappBookingBtn.addEventListener('click', () => {
            if (selectedServices.length === 0) return;

            const totalSum = selectedServices.reduce((sum, item) => sum + item.price, 0);
            
            let message = `*Hi Sujata's Beauty Salon!*%0A%0AI would like to book an appointment for the following services:%0A`;
            
            selectedServices.forEach((item, index) => {
                message += `${index + 1}. *${item.name}* (${item.price ? '₹' + item.price : item.priceText})%0A`;
            });

            if (totalSum > 0) {
                message += `%0A*Estimated Total: ₹${totalSum}*%0A`;
            }
            
            message += `%0APlease let me know available date and time slots! Thank you.`;

            const whatsappUrl = `https://wa.me/918928852102?text=${message}`;
            window.open(whatsappUrl, '_blank');
        });
    }

    // 4. Live Category Filtering & Search
    const filterTabs = document.querySelectorAll('.filter-btn');
    const serviceSearchInput = document.getElementById('service-search');
    const serviceItems = document.querySelectorAll('.service-item');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filterValue = tab.getAttribute('data-filter');
            applyFilters(filterValue, serviceSearchInput ? serviceSearchInput.value.toLowerCase() : '');
        });
    });

    if (serviceSearchInput) {
        serviceSearchInput.addEventListener('input', (e) => {
            const activeTab = document.querySelector('.filter-btn.active');
            const activeFilter = activeTab ? activeTab.getAttribute('data-filter') : 'all';
            applyFilters(activeFilter, e.target.value.toLowerCase());
        });
    }

    function applyFilters(category, searchQuery) {
        serviceItems.forEach(item => {
            const itemCat = item.getAttribute('data-category');
            const itemText = item.textContent.toLowerCase();

            const matchesCategory = (category === 'all' || itemCat === category);
            const matchesSearch = (searchQuery === '' || itemText.includes(searchQuery));

            if (matchesCategory && matchesSearch) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // 5. Business Card QR Code Modal Setup
    const qrModal = document.getElementById('qr-modal');
    const openQrBtn = document.getElementById('open-qr-modal');
    const footerQrBtn = document.getElementById('footer-qr-trigger');
    const closeQrBtn = document.getElementById('close-qr-modal');
    const qrCanvasContainer = document.getElementById('qr-canvas-container');
    const qrUrlDisplay = document.getElementById('qr-url-display');
    const downloadQrBtn = document.getElementById('download-qr-btn');

    let qrCodeInstance = null;

    function getWebsiteUrl() {
        // Use live short link or current URL if deployed
        if (window.location.protocol.startsWith('http') && !window.location.hostname.includes('localhost')) {
            return window.location.href;
        }
        return 'https://tinyurl.com/sujatasalon';
    }

    function generateQrCode() {
        if (!qrCanvasContainer) return;
        const targetUrl = getWebsiteUrl();

        if (qrUrlDisplay) {
            qrUrlDisplay.textContent = targetUrl;
        }

        qrCanvasContainer.innerHTML = ''; // Clear previous

        if (typeof QRCode !== 'undefined') {
            qrCodeInstance = new QRCode(qrCanvasContainer, {
                text: targetUrl,
                width: 190,
                height: 190,
                colorDark: "#7A0016",
                colorLight: "#FFFFFF",
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            qrCanvasContainer.innerHTML = `<p style="color:#000; font-size: 0.8rem;">[QR Code Service Ready]</p>`;
        }
    }

    if (openQrBtn) {
        openQrBtn.addEventListener('click', () => {
            generateQrCode();
            qrModal.classList.add('active');
        });
    }

    if (footerQrBtn) {
        footerQrBtn.addEventListener('click', () => {
            generateQrCode();
            qrModal.classList.add('active');
        });
    }

    if (closeQrBtn) {
        closeQrBtn.addEventListener('click', () => {
            qrModal.classList.remove('active');
        });
    }

    if (qrModal) {
        qrModal.addEventListener('click', (e) => {
            if (e.target === qrModal) {
                qrModal.classList.remove('active');
            }
        });
    }

    // Download QR image
    if (downloadQrBtn) {
        downloadQrBtn.addEventListener('click', () => {
            const img = qrCanvasContainer.querySelector('img');
            const canvas = qrCanvasContainer.querySelector('canvas');

            let src = '';
            if (img && img.src) {
                src = img.src;
            } else if (canvas) {
                src = canvas.toDataURL("image/png");
            }

            if (src) {
                const link = document.createElement('a');
                link.href = src;
                link.download = 'Sujata-Salon-Website-QR.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });
    }
});
