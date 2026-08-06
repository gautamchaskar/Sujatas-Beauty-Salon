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

    const floatingCartBtn = document.getElementById('floating-cart-btn');
    const cartBadgeCountEl = document.getElementById('cart-badge-count');
    const bottomCartBar = document.getElementById('bottom-cart-bar');
    const bottomCountEl = document.getElementById('bottom-count');
    const bottomTotalEl = document.getElementById('bottom-total');
    const openCartModalBtn = document.getElementById('open-cart-modal-btn');

    const cartModalBackdrop = document.getElementById('cart-modal-backdrop');
    const closeCartModalBtn = document.getElementById('close-cart-modal');
    const cartModalItemsListEl = document.getElementById('cart-modal-items-list');
    const modalTotalEl = document.getElementById('modal-total');
    const modalClearCartBtn = document.getElementById('modal-clear-cart');
    const modalSendWhatsappBtn = document.getElementById('modal-send-whatsapp');

    // Attach listener to all "Add to Booking" buttons
    const bookButtons = document.querySelectorAll('.book-service-btn');

    bookButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const serviceName = btn.getAttribute('data-name');
            const servicePriceRaw = btn.getAttribute('data-price');
            const originalPriceRaw = btn.getAttribute('data-original') || '';
            const savingsRaw = btn.getAttribute('data-savings') || '';
            const numericPrice = parseInt(servicePriceRaw, 10) || 0;
            const numericSavings = parseInt(savingsRaw, 10) || 0;

            toggleServiceSelection(serviceName, numericPrice, servicePriceRaw, originalPriceRaw, savingsRaw, numericSavings);
        });
    });

    function toggleServiceSelection(serviceName, numericPrice, servicePriceRaw, originalPriceRaw = '', savingsRaw = '', numericSavings = 0) {
        const existingIndex = selectedServices.findIndex(item => item.name === serviceName);

        if (existingIndex > -1) {
            // Remove item
            selectedServices.splice(existingIndex, 1);
        } else {
            // Add item
            selectedServices.push({
                name: serviceName,
                price: numericPrice,
                priceText: servicePriceRaw,
                originalText: originalPriceRaw,
                savingsText: savingsRaw,
                savings: numericSavings
            });
        }

        updateButtonStates();
        updateBookingCartUI();
    }

    function updateButtonStates() {
        bookButtons.forEach(btn => {
            const serviceName = btn.getAttribute('data-name');
            const isSelected = selectedServices.some(item => item.name === serviceName);

            if (isSelected) {
                btn.classList.add('added');
                if (btn.classList.contains('btn-icon-add')) {
                    btn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                    btn.setAttribute('title', 'Remove service');
                } else {
                    btn.innerHTML = '<i class="fa-solid fa-trash"></i> Remove';
                }
            } else {
                btn.classList.remove('added');
                if (btn.classList.contains('btn-icon-add')) {
                    btn.innerHTML = '<i class="fa-solid fa-plus"></i>';
                    btn.setAttribute('title', 'Add service to booking');
                } else {
                    btn.innerHTML = '<i class="fa-solid fa-plus"></i> Add to Booking';
                }
            }
        });
    }

    const modalMessagePreviewEl = document.getElementById('modal-message-preview');

    function updateBookingCartUI() {
        const count = selectedServices.length;
        const totalSum = selectedServices.reduce((sum, item) => sum + item.price, 0);
        const totalSavings = selectedServices.reduce((sum, item) => sum + (item.savings || 0), 0);

        if (cartBadgeCountEl) cartBadgeCountEl.textContent = count;
        if (bottomCountEl) bottomCountEl.textContent = count;
        if (bottomTotalEl) bottomTotalEl.textContent = '₹' + totalSum;

        if (modalTotalEl) {
            if (totalSavings > 0) {
                modalTotalEl.innerHTML = `₹${totalSum} <span class="total-save-tag"><i class="fa-solid fa-gift"></i> Save ₹${totalSavings}!</span>`;
            } else {
                modalTotalEl.textContent = '₹' + totalSum;
            }
        }

        if (modalMessagePreviewEl) {
            modalMessagePreviewEl.textContent = generateFormattedMessageText();
        }

        if (count > 0) {
            if (floatingCartBtn) floatingCartBtn.classList.add('active');
            if (bottomCartBar) bottomCartBar.classList.add('active');

            // Render selected items list inside cart modal with individual savings
            if (cartModalItemsListEl) {
                cartModalItemsListEl.innerHTML = selectedServices.map(item => `
                    <div class="cart-modal-item">
                        <div class="item-details">
                            <div class="item-name">${item.name}</div>
                            ${item.savingsText ? `<span class="item-save-badge"><i class="fa-solid fa-tag"></i> Save ${isNaN(item.savingsText) ? item.savingsText : '₹' + item.savingsText}</span>` : ''}
                        </div>
                        <div class="item-right">
                            <div class="price-stack">
                                ${item.originalText && !isNaN(item.originalText) ? `<span class="orig-price">₹${item.originalText}</span>` : ''}
                                <span class="item-price">${item.price ? '₹' + item.price : item.priceText}</span>
                            </div>
                            <button class="remove-item-btn" data-name="${item.name}" title="Remove item">&times;</button>
                        </div>
                    </div>
                `).join('');

                // Attach remove handlers
                cartModalItemsListEl.querySelectorAll('.remove-item-btn').forEach(removeBtn => {
                    removeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const nameToRemove = removeBtn.getAttribute('data-name');
                        toggleServiceSelection(nameToRemove, 0, '');
                    });
                });
            }
        } else {
            if (floatingCartBtn) floatingCartBtn.classList.remove('active');
            if (bottomCartBar) bottomCartBar.classList.remove('active');
            if (cartModalBackdrop) cartModalBackdrop.classList.remove('active');
            if (cartModalItemsListEl) cartModalItemsListEl.innerHTML = '';
            if (modalMessagePreviewEl) modalMessagePreviewEl.textContent = '';
        }
    }

    function generateFormattedMessageText() {
        if (selectedServices.length === 0) return '';
        const totalSum = selectedServices.reduce((sum, item) => sum + item.price, 0);
        let msg = `Hi Sujata's Beauty Salon! 👋\n\nI would like to inquire about booking an appointment for:\n`;
        selectedServices.forEach((item, index) => {
            msg += `${index + 1}. ${item.name} (${item.price ? '₹' + item.price : item.priceText})\n`;
        });
        if (totalSum > 0) {
            msg += `\nEstimated Total: ₹${totalSum}\n`;
        }
        msg += `\nPlease let me know available date & time slots! Thank you.`;
        return msg;
    }

    // Open/Close Cart Modal Handlers
    if (floatingCartBtn) {
        floatingCartBtn.addEventListener('click', () => {
            if (selectedServices.length > 0 && cartModalBackdrop) {
                cartModalBackdrop.classList.add('active');
            }
        });
    }

    if (openCartModalBtn) {
        openCartModalBtn.addEventListener('click', () => {
            if (selectedServices.length > 0 && cartModalBackdrop) {
                cartModalBackdrop.classList.add('active');
            }
        });
    }

    if (closeCartModalBtn) {
        closeCartModalBtn.addEventListener('click', () => {
            if (cartModalBackdrop) cartModalBackdrop.classList.remove('active');
        });
    }

    if (cartModalBackdrop) {
        cartModalBackdrop.addEventListener('click', (e) => {
            if (e.target === cartModalBackdrop) {
                cartModalBackdrop.classList.remove('active');
            }
        });
    }

    // Clear Cart
    if (modalClearCartBtn) {
        modalClearCartBtn.addEventListener('click', () => {
            selectedServices = [];
            updateButtonStates();
            updateBookingCartUI();
        });
    }

    // Send WhatsApp Booking Message from Modal
    if (modalSendWhatsappBtn) {
        modalSendWhatsappBtn.addEventListener('click', () => {
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

    // Send WhatsApp Booking Message (if button exists)
    if (typeof sendWhatsappBookingBtn !== 'undefined' && sendWhatsappBookingBtn) {
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

    // Business Card Edition Toggle Handler
    const displayedSalonCard = document.getElementById('displayed-salon-card');
    const showLuxuryCardBtn = document.getElementById('show-luxury-card-btn');
    const showOriginalCardBtn = document.getElementById('show-original-card-btn');

    if (displayedSalonCard && showLuxuryCardBtn && showOriginalCardBtn) {
        showLuxuryCardBtn.addEventListener('click', () => {
            displayedSalonCard.src = 'images/business_card_luxury.png';
            showLuxuryCardBtn.classList.add('active');
            showOriginalCardBtn.classList.remove('active');
        });

        showOriginalCardBtn.addEventListener('click', () => {
            displayedSalonCard.src = 'card.jpeg';
            showOriginalCardBtn.classList.add('active');
            showLuxuryCardBtn.classList.remove('active');
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
        return 'https://tinyurl.com/sujatas-salon';
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

    // 7. Multi-Language (EN, Marathi, Hindi) Translation Engine
    const i18n = {
        en: {
            top_bar_announcement: "Special Festive & Combo Offers Available",
            nav_home: "Home",
            nav_offers: "Special Offers",
            nav_services: "Services & Pricing",
            nav_about: "About Us",
            nav_contact: "Contact & Location",
            badge_ladies_care: "Premium Ladies Care",
            hero_title: "Enhance Your Natural Glow & Elegance",
            hero_subtitle: "Skin • Hair • Makeup • Nails — Professional care tailored exclusively for women in Karanjade, Panvel.",
            badge_experts: "Certified Experts",
            badge_hygienic: "100% Hygienic",
            badge_combos: "Exclusive Combos",
            btn_view_offers: "View Exclusive Offers",
            btn_send_whatsapp: "Send WhatsApp Message"
        },
        mr: {
            top_bar_announcement: "खास सण व कॉम्बो ऑफर्स उपलब्ध",
            nav_home: "मुख्यपृष्ठ",
            nav_offers: "खास ऑफर्स",
            nav_services: "सर्व्हिसेस व दर पत्रक",
            nav_about: "आमच्याबद्दल",
            nav_contact: "संपर्क व पत्ता",
            badge_ladies_care: "खास महिलांसाठी ब्युटी केअर",
            hero_title: "तुमचे नैसर्गिक सौंदर्य अधिक खुलवा",
            hero_subtitle: "त्वचा • केस • मेकअप • नखे — करंजाडे, पनवेल मधील महिलांसाठी अत्यंत विश्वसनीय व व्यावसायिक सौंदर्य सेवा.",
            badge_experts: "अनुभवी तज्ज्ञ",
            badge_hygienic: "१००% स्वच्छ व हायजिनिक",
            badge_combos: "खास सवलत कॉम्बो",
            btn_view_offers: "खास ऑफर्स पहा",
            btn_send_whatsapp: "व्हॉट्सॲपवर मेसेज करा"
        },
        hi: {
            top_bar_announcement: "विशेष उत्सव व कॉम्बो ऑफर उपलब्ध",
            nav_home: "होम",
            nav_offers: "स्पेशल ऑफर",
            nav_services: "सेवाएं एवं दर सूची",
            nav_about: "हमारे बारे में",
            nav_contact: "संपर्क एवं पता",
            badge_ladies_care: "विशेष महिलाओं के लिए ब्यूटी केयर",
            hero_title: "अपनी प्राकृतिक सुंदरता को और निखारें",
            hero_subtitle: "त्वचा • बाल • मेकअप • नाखून — करंजाडे, पनवेल में महिलाओं के लिए पेशेवर और विश्वसनीय ब्यूटी केयर।",
            badge_experts: "अनुभवी विशेषज्ञ",
            badge_hygienic: "100% स्वच्छ एवं सुरक्षित",
            badge_combos: "विशेष डिस्काउंट कॉम्बो",
            btn_view_offers: "विशेष ऑफर देखें",
            btn_send_whatsapp: "व्हाट्सएप संदेश भेजें"
        }
    };

    function setLanguage(lang) {
        if (!i18n[lang]) return;
        const dict = i18n[lang];

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                el.textContent = dict[key];
            }
        });

        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        localStorage.setItem('sujata_salon_lang', lang);
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const chosenLang = e.target.getAttribute('data-lang');
            setLanguage(chosenLang);
        });
    });

    const savedLang = localStorage.getItem('sujata_salon_lang') || 'en';
    setLanguage(savedLang);
});
