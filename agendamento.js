document.addEventListener('DOMContentLoaded', function () {
    // Calendar Logic
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthSpan = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const selectedDateInput = document.getElementById('selected-date');

    let currentDate = new Date();
    let selectedDate = null;

    function renderCalendar(date) {
        calendarGrid.innerHTML = '';
        const year = date.getFullYear();
        const month = date.getMonth();

        // Update Header
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        currentMonthSpan.textContent = `${monthNames[month]} ${year}`;

        // Day Headers
        const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
        daysOfWeek.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('calendar-day-header');
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        // First day of the month
        const firstDay = new Date(year, month, 1).getDay();
        // Days in month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            const emptySlot = document.createElement('div');
            calendarGrid.appendChild(emptySlot);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.textContent = i;

            const currentDayDate = new Date(year, month, i);
            const dayOfWeek = currentDayDate.getDay();

            // Normalize today for comparison
            const todayCheck = new Date();
            todayCheck.setHours(0, 0, 0, 0);

            // Disable past dates, Sundays (0), and Mondays (1)
            if (currentDayDate < todayCheck || dayOfWeek === 0 || dayOfWeek === 1) {
                dayElement.classList.add('disabled');
            } else {
                dayElement.addEventListener('click', () => selectDate(currentDayDate, dayElement));
            }

            // Highlight today
            const today = new Date();
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayElement.classList.add('today');
            }

            // Highlight selected
            if (selectedDate &&
                i === selectedDate.getDate() &&
                month === selectedDate.getMonth() &&
                year === selectedDate.getFullYear()) {
                dayElement.classList.add('selected');
            }

            calendarGrid.appendChild(dayElement);
        }
    }

    function isDomingoOuSegunda(date) {
        const day = date.getDay();
        return day === 0 || day === 1; // 0 = domingo, 1 = segunda
    }

    function mostrarHorarios(visible) {
        const horariosWrapper = document.querySelector('.time-picker-wrapper');
        if (!horariosWrapper) return;

        const formGroup = horariosWrapper.closest('.form-group');
        if (formGroup) {
            formGroup.style.display = visible ? "block" : "none";
        }
    }

    function atualizarHorariosPassados(date) {
        const agora = new Date();
        const isToday = date.toDateString() === agora.toDateString();
        const itens = document.querySelectorAll('.time-picker-item');

        itens.forEach(item => {
            const horario = item.textContent.trim(); // ex: "19:40"
            const [h, m] = horario.split(':').map(Number);
            const horarioDate = new Date();

            horarioDate.setHours(h, m, 0, 0);

            // reset
            item.classList.remove('disabled');

            if (isToday && horarioDate < agora) {
                item.classList.add('disabled');
                item.classList.remove('selected');
                if (item.classList.contains('active')) {
                    item.classList.remove('active');
                    document.getElementById('selected-time').value = '';
                }
            }
        });
    }

    function selectDate(date, element) {
        selectedDate = date;
        selectedDateInput.value = formatDate(date);

        if (isDomingoOuSegunda(date)) {
            mostrarHorarios(false);
        } else {
            mostrarHorarios(true);
            atualizarHorariosPassados(date);
        }

        // Update UI
        document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
    }

    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    renderCalendar(currentDate);


    // Time Picker Logic
    const timePickerList = document.getElementById('time-picker-list');
    const selectedTimeInput = document.getElementById('selected-time');
    const timeSlots = [];

    // Gerar intervalos de tempo (das 8:00 às 20:00, a cada 50 minutos) Parte onde dito o horario de funcionamento!
    const startHour = 9;
    const endHour = 19;
    const intervalMinutes = 35;

    let currentMinutes = startHour * 60;
    const endMinutes = endHour * 60;

    while (currentMinutes <= endMinutes) {
        const h = Math.floor(currentMinutes / 60);
        const m = currentMinutes % 60;
        const timeString = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        timeSlots.push(timeString);
        currentMinutes += intervalMinutes;
    }

    timeSlots.forEach(time => {
        const li = document.createElement('li');
        li.classList.add('time-picker-item');
        li.textContent = time;
        li.dataset.time = time;
        li.addEventListener('click', () => {
            li.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        timePickerList.appendChild(li);
    });

    // Handle Scroll to select
    let scrollTimeout;
    timePickerList.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            updateSelectedTime();
        }, 50); // Debounce
    });

    function updateSelectedTime() {
        const listRect = timePickerList.getBoundingClientRect();
        const center = listRect.top + listRect.height / 2;

        let closestItem = null;
        let minDistance = Infinity;

        document.querySelectorAll('.time-picker-item').forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const itemCenter = itemRect.top + itemRect.height / 2;
            const distance = Math.abs(center - itemCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestItem = item;
            }
        });

        if (closestItem) {
            document.querySelectorAll('.time-picker-item').forEach(i => i.classList.remove('active'));

            if (!closestItem.classList.contains('disabled')) {
                closestItem.classList.add('active');
                selectedTimeInput.value = closestItem.dataset.time;
            } else {
                selectedTimeInput.value = '';
            }
        }
    }

    // Initialize selection
    // Wait for layout
    setTimeout(() => {
        updateSelectedTime();
    }, 100);


    // Generic Custom Dropdown Logic
    const customSelects = document.querySelectorAll('.custom-select');

    customSelects.forEach(select => {
        const trigger = select.querySelector('.select-trigger');
        const triggerText = select.querySelector('.select-trigger span'); // Select the span inside
        const options = select.querySelectorAll('.option');
        const hiddenInputId = select.id.replace('custom-', '').replace('-select', ''); // e.g., custom-service-select -> service
        const hiddenInput = document.getElementById(hiddenInputId);

        // Toggle Dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent immediate closing
            // Close others
            customSelects.forEach(other => {
                if (other !== select) other.classList.remove('open');
            });
            select.classList.toggle('open');
        });

        // Option Selection
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                // Remove selected class from siblings
                options.forEach(opt => opt.classList.remove('selected'));
                // Add to clicked
                option.classList.add('selected');

                // Update Trigger Text and Hidden Input
                const value = option.dataset.value;
                let text = option.textContent;

                // If the option has a specific service name element, use that for the trigger text
                const serviceName = option.querySelector('.service-name');
                if (serviceName) {
                    text = serviceName.textContent;
                }

                triggerText.textContent = text;
                hiddenInput.value = value;

                // Specific Logic for Service "Outros"
                if (hiddenInputId === 'service') {
                    const otherServiceContainer = document.getElementById('other-service-container');
                    const otherServiceInput = document.getElementById('other-service');

                    if (value === 'Outros') {
                        otherServiceContainer.classList.remove('hidden');
                        otherServiceInput.setAttribute('required', 'required');
                    } else {
                        otherServiceContainer.classList.add('hidden');
                        otherServiceInput.removeAttribute('required');
                        otherServiceInput.value = '';
                    }
                }

                // Close Dropdown
                select.classList.remove('open');

                // Trigger Validation or Auto-Select
                if (hiddenInputId === 'barber') {
                    // Auto-select unit logic
                    if (value !== 'Qualquer barbeiro disponível' && barberUnits[value]) {
                        const correctUnit = barberUnits[value];
                        const locationSelect = document.getElementById('custom-location-select');
                        const locationOptions = locationSelect.querySelectorAll('.option');
                        const locationTriggerText = locationSelect.querySelector('.select-trigger span');
                        const locationInput = document.getElementById('location');

                        locationOptions.forEach(opt => {
                            if (opt.dataset.value === correctUnit) {
                                // Update UI
                                locationOptions.forEach(o => o.classList.remove('selected'));
                                opt.classList.add('selected');
                                locationTriggerText.textContent = opt.textContent;
                                locationInput.value = correctUnit;
                            }
                        });
                    }
                    checkBarberUnitConflict();
                } else if (hiddenInputId === 'location') {
                    checkBarberUnitConflict();
                }
            });
        });
    });

    // Close when clicking outside
    document.addEventListener('click', () => {
        customSelects.forEach(select => select.classList.remove('open'));
    });


    // Custom Alert Logic
    const customAlertOverlay = document.getElementById('custom-alert');
    const customAlertMessage = document.getElementById('custom-alert-message');
    const customAlertOkBtn = document.getElementById('custom-alert-ok');

    function showCustomAlert(message) {
        customAlertMessage.textContent = message;
        customAlertOverlay.classList.remove('hidden');
        // Small delay to allow display:block to apply before adding show class for transition
        setTimeout(() => {
            customAlertOverlay.classList.add('show');
        }, 10);
    }

    function hideCustomAlert() {
        customAlertOverlay.classList.remove('show');
        setTimeout(() => {
            customAlertOverlay.classList.add('hidden');
        }, 300); // Wait for transition
    }

    customAlertOkBtn.addEventListener('click', hideCustomAlert);

    // Close on click outside box
    customAlertOverlay.addEventListener('click', (e) => {
        if (e.target === customAlertOverlay) {
            hideCustomAlert();
        }
    });


    // Barbeiro unidade 
    const barberUnits = {
        'Gustavo': 'Unidade Milionários',
        'Uri': 'Unidade Milionários',
        'Marcelo': 'Unidade Flávio Marques Lisboa'
    };

    const conflictModal = document.getElementById('conflict-modal');
    const conflictYesBtn = document.getElementById('conflict-yes');
    const conflictNoBtn = document.getElementById('conflict-no');

    function checkBarberUnitConflict() {
        const selectedBarber = document.getElementById('barber').value;
        const selectedLocation = document.getElementById('location').value;

        if (selectedBarber && selectedLocation && selectedBarber !== 'Qualquer barbeiro disponível') {
            const correctUnit = barberUnits[selectedBarber];

            if (correctUnit && selectedLocation !== correctUnit) {
                // Show conflict modal
                conflictModal.classList.remove('hidden');
                setTimeout(() => {
                    conflictModal.classList.add('show');
                }, 10);
            }
        }
    }

    function hideConflictModal() {
        conflictModal.classList.remove('show');
        setTimeout(() => {
            conflictModal.classList.add('hidden');
        }, 300);
    }

    conflictYesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        hideConflictModal();
    });

    conflictNoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedBarber = document.getElementById('barber').value;
        const correctUnit = barberUnits[selectedBarber];

        if (correctUnit) {
            // Programmatically select the correct unit
            const locationSelect = document.getElementById('custom-location-select');
            const locationOptions = locationSelect.querySelectorAll('.option');
            const locationTriggerText = locationSelect.querySelector('.select-trigger span');
            const locationInput = document.getElementById('location');

            locationOptions.forEach(opt => {
                if (opt.dataset.value === correctUnit) {
                    // Update UI
                    locationOptions.forEach(o => o.classList.remove('selected'));
                    opt.classList.add('selected');
                    locationTriggerText.textContent = opt.textContent;
                    locationInput.value = correctUnit;
                }
            });
        }
        hideConflictModal();
    });

    // Close on click outside box
    conflictModal.addEventListener('click', (e) => {
        if (e.target === conflictModal) {
            hideConflictModal();
        }
    });


    // Form Submission
    const form = document.getElementById('scheduling-form');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Get values
        let service = document.getElementById('service').value;
        const barber = document.getElementById('barber').value;
        const location = document.getElementById('location').value;
        const dateInput = document.getElementById('selected-date').value; // dd/mm/yyyy
        const timeInput = document.getElementById('selected-time').value; // HH:mm
        const observations = document.getElementById('observations').value;

        if (!service) {
            showCustomAlert('Por favor, selecione um serviço.');
            return;
        }
        if (!barber) {
            showCustomAlert('Por favor, selecione um barbeiro.');
            return;
        }
        if (!location) {
            showCustomAlert('Por favor, selecione uma unidade.');
            return;
        }

        // Handle "Outros" service
        if (service === 'Outros') {
            const customService = document.getElementById('other-service').value;
            if (customService.trim() !== '') {
                service = customService; // Use custom name
            } else {
                showCustomAlert('Por favor, especifique o serviço desejado.');
                return;
            }
        }

        if (!dateInput) {
            showCustomAlert('Por favor, selecione uma data.');
            return;
        }
        if (!timeInput) {
            showCustomAlert('Por favor, selecione um horário.');
            return;
        }

        // Convert Date/Time to ISO format expected by DB/Backend
        // Input is dd/mm/yyyy, Time is HH:mm
        const [day, month, year] = dateInput.split('/');
        const [hour, minute] = timeInput.split(':');
        const dateTime = new Date(year, month - 1, day, hour, minute);

        // Get price from UI (This is a bit fragile, ideally should be mapped from value, but scraping from UI is consistent with current visual)
        // Let's optimize: find the selected option and get price data if possible
        // Or simpler: just send the service string and let backend/frontend list handle it? 
        // Backend expects 'price' (integer cents). 
        // We'll try to extract it from the selected option.
        let price = 0;
        const selectedOption = document.querySelector('.option.selected .service-price');
        if (selectedOption) {
            const priceText = selectedOption.textContent.replace('R$', '').trim();
            price = parseInt(priceText) * 100; // to cents
        } else {
            // Fallback default or 0
            price = 4000;
        }

        const payload = {
            date_time: dateTime.toISOString(),
            service: service,
            barber_name: barber,
            barber_shop: location,
            price: price,
            duration_min: 30 // Default for now, could extract from UI too
        };

        const rescheduleId = new URLSearchParams(window.location.search).get('reschedule');
        const submitBtn = document.getElementById('btn-submit-agenda');

        try {
            submitBtn.textContent = 'Verificando...';
            submitBtn.disabled = true;

            // 1. Fetch current appointments to check for conflicts
            const myAppointments = await api.get('/appointments/my');
            const now = new Date();

            // Filter active future appointments
            // We want to block booking if there is ANY active appointment in the future.
            const upcomingConflict = myAppointments.find(a => {
                if (a.status === 'Cancelado' || a.status === 'Finalizado') return false;

                const aDate = new Date(a.date_time);
                if (aDate <= now) return false; // Ignore past appointments

                // If we are explicitly rescheduling THIS appointment, it's not a conflict, it's the target.
                if (rescheduleId && String(a.id) === String(rescheduleId)) return false;

                return true;
            });

            if (upcomingConflict) {
                const conflictDate = new Date(upcomingConflict.date_time);
                // Format: DD/MM/YYYY às HH:MM
                const dateStr = conflictDate.toLocaleDateString('pt-BR');
                const timeStr = conflictDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                // Check if exact match (rare if days differ, but possible)
                if (conflictDate.getTime() === dateTime.getTime()) {
                    showCustomAlert(`Você já tem um agendamento para este horário: ${dateStr} às ${timeStr}.`);
                    setTimeout(() => {
                        window.location.href = 'agendamentos.html';
                    }, 2000);
                    return;
                }

                // Prompt Global Swap
                const confirmChange = await showConfirmModal(`Você já possui um agendamento para <strong>${dateStr} às ${timeStr}</strong>.<br>Só é permitido manter um horário por vez.<br><br>Deseja trocar para <strong>${dateInput} às ${timeInput}</strong>?`);

                if (!confirmChange) {
                    showCustomAlert('Mantendo agendamento original.');
                    setTimeout(() => {
                        window.location.href = 'agendamentos.html';
                    }, 1500);
                    return;
                }

                submitBtn.textContent = 'Atualizando Agenda...';

                // Reschedule the EXISTING conflict to the new time/date AND update all details
                // We use the payload object which contains: date_time, service, barber_name, barber_shop, price
                await api.patch(`/appointments/${upcomingConflict.id}/reschedule`, {
                    date_time: dateTime.toISOString(),
                    barber_name: barber,
                    service: service,
                    barber_shop: location,
                    price: price
                });

                showCustomAlert(`Agenda atualizada com sucesso para ${dateInput} às ${timeInput}!`);
                setTimeout(() => {
                    window.location.href = 'agendamentos.html';
                }, 1500);
                return;
            }

            // No conflict, proceed with normal flow
            submitBtn.textContent = 'Processando...';

            if (rescheduleId) {
                // Reschedule Mode
                await api.patch(`/appointments/${rescheduleId}/reschedule`, {
                    date_time: dateTime.toISOString(),
                    barber_name: barber,
                    service: service,
                    barber_shop: location,
                    price: price
                });
                showCustomAlert('Agendamento reagendado com sucesso!');
                setTimeout(() => {
                    window.location.href = 'agendamentos.html';
                }, 1500);
            } else {
                // Create Mode
                await api.post('/appointments/create', payload);
                showCustomAlert('Agendamento realizado com sucesso!');
                setTimeout(() => {
                    window.location.href = 'agendamentos.html';
                }, 1500);
            }

        } catch (error) {
            console.error(error);
            showCustomAlert(error.message || 'Erro ao realizar agendamento.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Tentar Novamente';
        }
    });

    /**
     * Shows a custom confirmation modal and returns a Promise that resolves to true (Yes) or false (No).
     */
    function showConfirmModal(message) {
        return new Promise((resolve) => {
            const conflictModal = document.getElementById('conflict-modal');
            const conflictMessage = document.getElementById('conflict-message');
            const yesBtn = document.getElementById('conflict-yes');
            const noBtn = document.getElementById('conflict-no');

            // Set message
            conflictMessage.innerHTML = message;

            // Show modal
            conflictModal.classList.remove('hidden');
            setTimeout(() => {
                conflictModal.classList.add('show');
            }, 10);

            // Define cleanup function to remove listeners and hide modal
            function cleanup() {
                conflictModal.classList.remove('show');
                setTimeout(() => {
                    conflictModal.classList.add('hidden');
                }, 300);
                yesBtn.onclick = null;
                noBtn.onclick = null;
            }

            // Handlers
            yesBtn.onclick = function (e) {
                e.preventDefault();
                cleanup();
                resolve(true);
            };

            noBtn.onclick = function (e) {
                e.preventDefault();
                cleanup();
                resolve(false);
            };
        });
    }

    // URL Parameter Parsing
    const params = new URLSearchParams(window.location.search);
    const barberParam = params.get('barbeiro');
    const locationParam = params.get('barbearia');
    const serviceParam = params.get('servico');
    function selecionarDataAtualAutomaticamente() {
        const hoje = new Date();

        if (isDomingoOuSegunda(hoje)) {
            // Se hoje é domingo/segunda → não selecionar nada automaticamente
            return;
        }

        // Encontra o botão do dia atual no calendário
        const dia = hoje.getDate();
        const botoesDias = document.querySelectorAll('.calendar-day');

        botoesDias.forEach(btn => {
            if (Number(btn.textContent.trim()) === dia && !btn.classList.contains('disabled')) {
                btn.click(); // simula o clique automático
            }
        });
    }

    // Integrar tudo ao clique do usuário no calendário (Delegation already handled by selectDate)
    // Inicialização correta ao carregar a página

    const hoje = new Date();

    if (isDomingoOuSegunda(hoje)) {
        // Domingo / segunda → esconder horários
        mostrarHorarios(false);
    } else {
        // Terça a sábado → selecionar automaticamente o dia atual
        selecionarDataAtualAutomaticamente();
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
