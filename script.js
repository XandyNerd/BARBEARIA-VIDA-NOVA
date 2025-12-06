document.addEventListener('DOMContentLoaded', () => {
    console.log('Barbearia Vida Nova site loaded');

    // Alternância do Menu Mobile (básico)
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            if (navLinks.style.display === 'flex') {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '70px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'rgba(15, 15, 15, 0.95)';
                navLinks.style.padding = '2rem';
            }
        });
    }

    // Lógica do Slider Antes/Depois
    const sliderRange = document.getElementById('sliderRange');
    const afterImage = document.querySelector('.after-image');
    const sliderHandle = document.querySelector('.slider-handle');
    const sliderWrapper = document.querySelector('.slider-wrapper');
    let animationInterval;
    let isUserInteracting = false;

    function updateSlider(val) {
        afterImage.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
        sliderHandle.style.left = `${val}%`;
        sliderRange.value = val;
    }

    function startAnimation() {
        // Limpa qualquer animação existente
        clearInterval(animationInterval);

        animationInterval = setInterval(() => {
            if (!isUserInteracting) {
                sliderWrapper.classList.add('slider-animating');

                // Sequência: Centro -> Esquerda -> Direita -> Centro
                setTimeout(() => updateSlider(20), 0);
                setTimeout(() => updateSlider(80), 2500);
                setTimeout(() => updateSlider(50), 5000);

                // Remove animação para permitir arrastar de forma instantânea
                setTimeout(() => {
                    sliderWrapper.classList.remove('slider-animating');
                }, 7000);
            }
        }, 10000); // A cada 10 segundos
    }

    if (sliderRange && afterImage && sliderHandle) {
        // Posição inicial
        const initialPos = sliderRange.value;
        afterImage.style.clipPath = `inset(0 ${100 - initialPos}% 0 0)`;
        sliderHandle.style.left = `${initialPos}%`;

        // Interação do usuário
        sliderRange.addEventListener('input', (e) => {
            isUserInteracting = true;
            sliderWrapper.classList.remove('slider-animating');
            updateSlider(e.target.value);
        });

        sliderRange.addEventListener('mousedown', () => {
            isUserInteracting = true;
            sliderWrapper.classList.remove('slider-animating');
        });
        sliderRange.addEventListener('touchstart', () => {
            isUserInteracting = true;
            sliderWrapper.classList.remove('slider-animating');
        });

        sliderRange.addEventListener('mouseup', () => {
            isUserInteracting = false;
        });
        sliderRange.addEventListener('touchend', () => {
            isUserInteracting = false;
        });

        // Inicia a animação automática
        startAnimation();
    }

    // Lógica de Música de Fundo (YouTube)
    const musicToggle = document.getElementById('music-toggle');
    const musicIcon = musicToggle.querySelector('i');
    let player;
    let isPlaying = true;

    // Carrega API do YouTube
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Função criada automaticamente pela API do YouTube
    window.onYouTubeIframeAPIReady = function () {
        player = new YT.Player('youtube-audio-player', {
            height: '0',
            width: '0',
            videoId: 'x57GYTMVxqI', // ID do vídeo fornecido
            playerVars: {
                'autoplay': 0,
                'controls': 0,
                'loop': 1,
                'playlist': 'x57GYTMVxqI'
            },
            events: {
                'onReady': onPlayerReady
            }
        });
    };

    function onPlayerReady(event) {
        if (musicToggle) {
            musicToggle.addEventListener('click', () => {
                if (!isPlaying) {
                    player.playVideo();
                    musicIcon.classList.remove('fa-play');
                    musicIcon.classList.add('fa-pause');
                    musicToggle.classList.add('playing');
                    isPlaying = true;
                } else {
                    player.pauseVideo();
                    musicIcon.classList.remove('fa-pause');
                    musicIcon.classList.add('fa-play');
                    musicToggle.classList.remove('playing');
                    isPlaying = false;
                }
            });
        }
    }

    // Lógica do Vídeo Principal (Vídeo único)
    // Sem lógica adicional — vídeo já está em loop

    // Lógica do Vídeo Interativo (Barbeiro 1)
    const videoContainer = document.querySelector('.interactive-video-container');
    const hoverVideo = document.querySelector('.hover-video');
    const videoModal = document.getElementById('video-modal');
    const modalVideo = document.getElementById('modal-video');
    const closeModal = document.querySelector('.close-modal');

    if (videoContainer && hoverVideo) {
        // Efeitos de hover
        let isHovering = false;

        videoContainer.addEventListener('mouseenter', () => {
            isHovering = true;
            hoverVideo.style.opacity = '1';
            hoverVideo.muted = false;
            hoverVideo.currentTime = 0;

 
        });

        videoContainer.addEventListener('mouseleave', () => {
            isHovering = false;
            hoverVideo.style.opacity = '0';
            hoverVideo.pause();
            hoverVideo.currentTime = 0;
            hoverVideo.muted = true;
        });



    }

 

    // Lógica do Carrossel de Vídeos
    const track = document.querySelector('.carousel-track');
    if (track) {
        const slides = Array.from(track.children);
        const nextButton = document.querySelector('.carousel-button--right');
        const prevButton = document.querySelector('.carousel-button--left');
        const dotsNav = document.querySelector('.carousel-nav');
        const dots = Array.from(dotsNav.children);

        let currentIndex = 0;
        let autoRotateInterval;

        const updateSlidePosition = () => {
            const slideWidth = slides[0].getBoundingClientRect().width;
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

            // Atualiza classes
            slides.forEach(slide => slide.classList.remove('current-slide'));
            slides[currentIndex].classList.add('current-slide');

            dots.forEach(dot => dot.classList.remove('current-slide'));
            dots[currentIndex].classList.add('current-slide');

            // Gerencia a reprodução dos vídeos
            slides.forEach((slide, index) => {
                const video = slide.querySelector('video');
                if (video) {
                    if (index === currentIndex) {
                        video.muted = true;
                        video.currentTime = 0;
                        const playPromise = video.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(e => console.log("Erro ao tocar vídeo do carrossel", e));
                        }
                    } else {
                        video.pause();
                        video.currentTime = 0;
                    }
                }
            });

            prevButton.classList.remove('is-hidden');
            nextButton.classList.remove('is-hidden');
        };

        const nextSlide = () => {
            currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
            updateSlidePosition();
        };

        const prevSlide = () => {
            currentIndex = (currentIndex === 0) ? slides.length - 1 : currentIndex - 1;
            updateSlidePosition();
        };

        // Setup inicial
        setTimeout(() => {
            updateSlidePosition();

            const firstSlide = slides[0];
            const firstVideo = firstSlide.querySelector('video');
            if (firstVideo) {
                firstVideo.muted = true;
                firstVideo.play().catch(e => console.log("Falha ao iniciar vídeo inicial", e));
            }

            // Rotacionar automaticamente a cada 10s
            clearInterval(autoRotateInterval);
            autoRotateInterval = setInterval(nextSlide, 10000);

        }, 100);

        window.addEventListener('resize', updateSlidePosition);

        prevButton.addEventListener('click', () => {
            prevSlide();
            clearInterval(autoRotateInterval);
            autoRotateInterval = setInterval(nextSlide, 10000);
        });

        nextButton.addEventListener('click', () => {
            nextSlide();
            clearInterval(autoRotateInterval);
            autoRotateInterval = setInterval(nextSlide, 10000);
        });

        dotsNav.addEventListener('click', e => {
            const targetDot = e.target.closest('button');
            if (!targetDot) return;

            const targetIndex = dots.findIndex(dot => dot === targetDot);
            currentIndex = targetIndex;
            updateSlidePosition();

            clearInterval(autoRotateInterval);
            autoRotateInterval = setInterval(nextSlide, 10000);
        });

        // Som no hover
        slides.forEach(slide => {
            const video = slide.querySelector('video');
            if (video) {
                slide.addEventListener('mouseenter', () => {
                    video.muted = false;
                });
                slide.addEventListener('mouseleave', () => {
                    video.muted = true;
                });
            }
        });
    }

    // SERVIÇOS PRESTADO E VALORES 
    const servicesData = {
        "cabelo": [
            { type: 'header', name: '✅ Serviços Individuais' },
            { name: "Corte Masculino", time: "35min", price: "R$ 40" },
            { name: "Pezinho (Acabamento)", time: "15min", price: "R$ 20" },
            { name: "Lavar + Secar", time: "15min", price: "R$ 25" },
            { name: "Hidratação", time: "20min", price: "R$ 20" },
            { type: 'header', name: '🔻 COMBOS DE CORTE' },
            { name: "Corte + Barba", time: "50min", price: "R$ 75" },
            { name: "Corte + Sobrancelha", time: "45min", price: "R$ 60" },
            { name: "Corte + Barba + Sobrancelha", time: "1h", price: "R$95" },
            { name: "Corte + Hidratação", time: "50min", price: "R$ 60" },
            { name: "Corte + Bigode", time: "50min", price: "R$ 65" },
            { name: "Corte + Pigmentação", time: "1h", price: "R$ 70" },
            { name: "Corte + Luzes", time: "1h 30min", price: "R$ 120" }
        ],
        "barba": [
            { type: 'header', name: '✅ Serviços Individuais' },
            { name: "Barboterapia / Barba Completa", time: "35min", price: "R$ 35" },
            { name: "Bigode Tradicional", time: "20min", price: "R$ 25" },
            { type: 'header', name: '🔻 COMBOS DE BARBA' },
            { name: "Barba + Pezinho", time: "50min", price: "R$ 55" },
            { name: "Barba + Hidratação", time: "45min", price: "R$ 65" },
            { name: "Corte + Barba + Pigmentação", time: "1h 15min", price: "R$ 105" },
            { name: "Corte + Barba + Sobrancelha + Tintura", time: "1h 45min", price: "R$ 125" },
            { name: "Corte + Barba + Progressiva", time: "2h", price: "R$ 150" },
            { name: "Corte + Barba + Sobrancelha + Botox", time: "2h", price: "R$ 170" }
        ],
        "sobrancelha": [
            { type: 'header', name: '✅ Serviços Individuais' },
            { name: "Design de Sobrancelha (Navalha)", time: "15min", price: "R$ 20" },
            { name: "Sobrancelha na Pinça", time: "20min", price: "R$ 20" },
            { type: 'header', name: '🔻 COMBOS COM SOBRANCELHA' },
            { name: "Corte + Sobrancelha", time: "45min", price: "R$ 60" },
            { name: "Corte + Barba + Sobrancelha", time: "1h", price: "R$ 95" },
            { name: "Corte + Sobrancelha + Pigmentação", time: "1h 15min", price: "R$ 90" },
            { name: "Corte + Barba + Sobrancelha + Botox", time: "2h", price: "R$ 170" },
            { name: "Corte + Barba + Sobrancelha + Tintura", time: "1h 45min", price: "R$ 125" }
        ],
        "quimica": [
            { type: 'header', name: '✅ Serviços Individuais' },
            { name: "Botox (Alinhamento)", time: "1h", price: "R$ 75" },
            { name: "Progressiva", time: "2h", price: "A partir de R$ 75" },
            { name: "Relaxamento", time: "1h", price: "A consultar" },
            { name: "Tintura / Tonalização", time: "30min", price: "R$ 30" },
            { name: "Luzes", time: "1h 30min", price: "R$ 60" },
            { name: "Platinado", time: "3h", price: "A partir de R$ 150" },
            { type: 'header', name: '🔻 COMBOS COM QUÍMICA' },
            { name: "Corte + Botox", time: "1h 30min", price: "R$ 115" },
            { name: "Corte + Progressiva", time: "2h 30min", price: "R$ 115" },
            { name: "Corte + Relaxamento", time: "1h 30min", price: "R$ 70" },
            { name: "Corte + Tintura + Barba + Sobrancelha", time: "2h", price: "R$ 125" },
            { name: "Corte + Barba + Progressiva", time: "2h 30min", price: "R$ 150" },
            { name: "Corte + Bigode + Relaxamento", time: "1h 30min", price: "R$ 100" }
        ]
    };

    const servicesModal = document.getElementById("services-modal");
    const servicesModalBody = document.getElementById("modal-body");
    const closeServicesModal = document.querySelector(".close-modal");
    const serviceButtons = document.querySelectorAll(".btn-service-details");

    if (servicesModal && servicesModalBody && closeServicesModal) {
        serviceButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const category = e.target.getAttribute("data-category");
                const data = servicesData[category];

                if (data) {
                    servicesModalBody.innerHTML = data.map(item => {
                        if (item.type === 'header') {
                            return `<h3 class="service-category-title">${item.name}</h3>`;
                        }
                        return `
                        <div class="service-item">
                            <div class="service-info">
                                <span class="service-name">${item.name}</span>
                                ${item.time ? `<span class="service-time">${item.time}</span>` : ''}
                            </div>
                            <span class="service-price">${item.price}</span>
                        </div>
                    `}).join("") + `
                        <div style="text-align: center; margin-top: 2rem;">
                            <button id="modal-ok-btn" class="btn-hero" style="min-width: 120px;">OK</button>
                        </div>
                    `;

                    servicesModal.style.display = "block";

                    // Add listener to the new button
                    const okBtn = document.getElementById('modal-ok-btn');
                    if (okBtn) {
                        okBtn.addEventListener('click', () => {
                            servicesModal.style.display = "none";
                        });
                    }
                }
            });
        });

        closeServicesModal.addEventListener("click", () => {
            servicesModal.style.display = "none";
        });

        window.addEventListener("click", (e) => {
            if (e.target == servicesModal) {
                servicesModal.style.display = "none";
            }
        });
    }

    // Scroll Animation Logic
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    initScrollAnimations();
});

// Lógica do Carrossel de Avaliações
const reviewsCarousel = document.getElementById('reviewsCarousel');

if (reviewsCarousel) {
    let autoScrollInterval;
    const scrollDelay = 3000; // Tempo entre cada troca (3 segundos)

    const getCardWidth = () => {
        const card = reviewsCarousel.querySelector('.review-card');
        if (!card) return 0;
        const style = window.getComputedStyle(reviewsCarousel);
        const gap = parseFloat(style.gap) || 0;
        return card.offsetWidth + gap;
    };

    const scrollToNext = () => {
        const cardWidth = getCardWidth();
        if (cardWidth === 0) return;

        // Verifica se chegou ao final
        if (reviewsCarousel.scrollLeft + reviewsCarousel.clientWidth >= reviewsCarousel.scrollWidth - 10) {
            // Volta para o início suavemente
            reviewsCarousel.scrollTo({
                left: 0,
                behavior: 'smooth'
            });
        } else {
            // Vai para o próximo card
            reviewsCarousel.scrollBy({
                left: cardWidth,
                behavior: 'smooth'
            });
        }
    };

    const startAutoScroll = () => {
        stopAutoScroll();
        autoScrollInterval = setInterval(scrollToNext, scrollDelay);
    };

    const stopAutoScroll = () => {
        clearInterval(autoScrollInterval);
    };
    

    // Inicia a rotação automática
    startAutoScroll();

    // Pausa a rotação quando o usuário interage
    reviewsCarousel.addEventListener('mouseenter', stopAutoScroll);
    reviewsCarousel.addEventListener('touchstart', stopAutoScroll, { passive: true });

    // Retoma a rotação quando o usuário para de interagir
    reviewsCarousel.addEventListener('mouseleave', startAutoScroll);
    reviewsCarousel.addEventListener('touchend', startAutoScroll);

    // Opcional: Pausar enquanto estiver fazendo scroll manual
    let isScrolling;
    reviewsCarousel.addEventListener('scroll', () => {
        stopAutoScroll();
        clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
            // Só retoma se não estiver com o mouse em cima (para desktop)
            if (!reviewsCarousel.matches(':hover')) {
                startAutoScroll();
            }
        }, 150);
    }, { passive: true });

    document.querySelectorAll('.interactive-image-container').forEach(container => {
    const img1 = container.querySelector('.static-img');
    const img2 = container.querySelector('.hover-img');

    container.addEventListener('mouseenter', () => {
        img1.style.opacity = "0";
        img2.style.opacity = "1";
    });

    container.addEventListener('mouseleave', () => {
        img1.style.opacity = "1";
        img2.style.opacity = "0";
    });
});

    
}
