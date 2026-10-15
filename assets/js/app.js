// Hijri months
        const hijriMonths = ['محرم', 'صفر', 'ربیع الاول', 'ربیع الثانی', 'جمادی الاول', 'جمادی الثانی', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذوالقعدہ', 'ذوالحجہ'];
        const urduDays = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];
        const urduMonths = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'];

        // Convert to Hijri (approximate)
        function gregorianToHijri(date) {
            const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
            const l = jd - 1948440 + 10632;
            const n = Math.floor((l - 1) / 10631);
            const l2 = l - 10631 * n + 354;
            const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
            const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
            const month = Math.floor((24 * l3) / 709);
            const day = l3 - Math.floor((709 * month) / 24);
            const year = 30 * n + j - 30;
            return { day, month, year };
        }

        function updateClock() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;

            // Gregorian date
            const dayName = urduDays[now.getDay()];
            const monthName = urduMonths[now.getMonth()];
            document.getElementById('gregorianDate').textContent = `${dayName} ${now.getDate()} ${monthName} ${now.getFullYear()}`;

            // Hijri date
            const hijri = gregorianToHijri(now);
            document.getElementById('hijriDate').textContent = `${hijri.day} ${hijriMonths[hijri.month - 1]} ${hijri.year}`;

            // Check prayer times for alert
            checkPrayerAlert(now);
        }

        function checkPrayerAlert(now) {
            const prayers = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'];
            const prayerNames = { fajr: 'فجر', zuhr: 'ظہر', asr: 'عصر', maghrib: 'مغرب', isha: 'عشاء' };
            const currentMinutes = now.getHours() * 60 + now.getMinutes();

            let showAlert = false;
            let alertPrayerName = '';

            prayers.forEach(prayer => {
                const input = document.getElementById(prayer);
                if (input && input.value) {
                    const [h, m] = input.value.split(':').map(Number);
                    const prayerMinutes = h * 60 + m;
                    const diff = prayerMinutes - currentMinutes;
                    
                    if (diff > 0 && diff <= 15) {
                        showAlert = true;
                        alertPrayerName = prayerNames[prayer];
                    }
                }
            });

            const alertBox = document.getElementById('adhanAlert');
            const alertText = document.getElementById('alertPrayer');
            
            if (showAlert) {
                alertBox.classList.remove('hidden');
                alertText.textContent = `نماز ${alertPrayerName} میں 15 منٹ باقی`;
            } else {
                alertBox.classList.add('hidden');
            }
        }

        function savePrayerTimes() {
            const prayers = ['tahajjud', 'fajr', 'ishraq', 'chasht', 'zuhr', 'asr', 'maghrib', 'isha'];
            const times = {};
            prayers.forEach(p => {
                times[p] = document.getElementById(p).value;
            });
            localStorage.setItem('prayerTimes', JSON.stringify(times));
        }

        function loadPrayerTimes() {
            const saved = localStorage.getItem('prayerTimes');
            if (saved) {
                const times = JSON.parse(saved);
                Object.keys(times).forEach(p => {
                    const input = document.getElementById(p);
                    if (input) input.value = times[p];
                });
            }
        }

        function calculateExpenses() {
            const inputs = document.querySelectorAll('.card-gradient input[type="number"]');
            let total = 0;
            inputs.forEach(input => {
                total += parseInt(input.value) || 0;
            });
            document.getElementById('totalExpense').textContent = total.toLocaleString() + ' Rs';
        }

        // Event listeners for expense inputs
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('change', calculateExpenses);
        });

        // Fetch weather (simulation - you can integrate real API)
        function updateWeather() {
            const el = document.getElementById('weather');
            if (el) el.textContent = '—';
        }

        // Persist household expenses and restore values safely.
        const expenseInputs = [...document.querySelectorAll('input[type="number"]')];
        function saveExpenses() {
            try { localStorage.setItem('digitalWatchExpenses', JSON.stringify(expenseInputs.map(i => i.value))); } catch (_) {}
        }
        function loadExpenses() {
            try {
                const saved = JSON.parse(localStorage.getItem('digitalWatchExpenses') || 'null');
                if (Array.isArray(saved)) expenseInputs.forEach((input, i) => { if (saved[i] !== undefined) input.value = saved[i]; });
            } catch (_) {}
        }
        expenseInputs.forEach(input => input.addEventListener('input', () => { calculateExpenses(); saveExpenses(); }));

        // Notifications are optional and require permission; browsers may limit background alerts.
        const statusEl = document.getElementById('featureStatus');
        document.getElementById('enableNotifications')?.addEventListener('click', async () => {
            if (!('Notification' in window)) { statusEl.textContent = 'یہ براؤزر نوٹیفکیشن کی سہولت نہیں دیتا۔'; return; }
            try {
                const permission = await Notification.requestPermission();
                statusEl.textContent = permission === 'granted' ? 'نوٹیفکیشن کی اجازت مل گئی؛ براؤزر کھلا ہونا ضروری ہو سکتا ہے۔' : 'نوٹیفکیشن کی اجازت نہیں ملی۔';
                if (permission === 'granted') new Notification('آذان واچ', { body: 'نماز کی یاددہانی فعال ہے۔' });
            } catch (_) { statusEl.textContent = 'نوٹیفکیشن فعال نہ ہو سکے۔'; }
        });
        document.getElementById('testAlarm')?.addEventListener('click', () => {
            try {
                const audio = document.getElementById('adhanSound');
                if (audio) { audio.currentTime = 0; audio.play().catch(() => { statusEl.textContent = 'آواز چلانے کے لیے دوبارہ بٹن دبائیں یا براؤزر کی اجازت دیکھیں۔'; }); }
            } catch (_) {}
        });
        let wakeLock = null;
        document.getElementById('screenWake')?.addEventListener('click', async () => {
            try {
                if (!('wakeLock' in navigator)) { statusEl.textContent = 'اس براؤزر میں اسکرین روشن رکھنے کی سہولت دستیاب نہیں۔'; return; }
                wakeLock = await navigator.wakeLock.request('screen');
                statusEl.textContent = 'اسکرین روشن رکھنے کی درخواست فعال ہے؛ یہ سہولت آلہ/براؤزر پر منحصر ہے۔';
                wakeLock.addEventListener('release', () => { statusEl.textContent = 'اسکرین روشن رکھنے کی درخواست ختم ہوگئی۔'; });
            } catch (_) { statusEl.textContent = 'اسکرین روشن نہیں رکھی جا سکی۔'; }
        });
        document.getElementById('resetSettings')?.addEventListener('click', () => {
            if (!confirm('کیا نماز کے اوقات اور اخراجات کی محفوظ ترتیبات حذف کرنی ہیں؟')) return;
            ['prayerTimes', 'digitalWatchExpenses'].forEach(k => localStorage.removeItem(k));
            location.reload();
        });

        // Initialize
        loadExpenses();
        loadPrayerTimes();
        updateClock();
        calculateExpenses();
        updateWeather();
        
        setInterval(updateClock, 1000);
        // Weather is deliberately not randomized; connect a trusted weather API to show live readings.
    