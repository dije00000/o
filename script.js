document.addEventListener("DOMContentLoaded", function () {
    let prayerTimes = {};

    // جلب مواقيت الصلاة
    function fetchPrayerTimes() {
        fetch("https://api.aladhan.com/v1/timingsByCity?city=Baghdad&country=IQ&method=5&school=0")
            .then(response => response.json())
            .then(data => {
                prayerTimes = {
                    fajr: data.data.timings.Fajr,
                    dhuhr: data.data.timings.Dhuhr,
                    asr: data.data.timings.Asr,
                    maghrib: data.data.timings.Maghrib,
                    isha: data.data.timings.Isha,
                    nightPrayer: data.data.timings.Midnight // تم استبدال منتصف الليل بصلاة الليل
                };

                // تحديث المحتوى على الصفحة
                document.getElementById("fajr").innerText = formatTime(prayerTimes.fajr);
                document.getElementById("dhuhr").innerText = formatTime(prayerTimes.dhuhr);
                document.getElementById("asr").innerText = formatTime(prayerTimes.asr);
                document.getElementById("maghrib").innerText = formatTime(prayerTimes.maghrib);
                document.getElementById("isha").innerText = formatTime(prayerTimes.isha);
                document.getElementById("nightPrayer").innerText = formatTime(prayerTimes.nightPrayer);
                updateNextPrayer();
            })
            .catch(error => console.error("خطأ في جلب مواقيت الصلاة:", error));
    }

    // تنسيق الوقت بتنسيق 12 ساعة
    function formatTime(time) {
        let [hours, minutes] = time.split(":");
        let formattedHours = (parseInt(hours) % 12 || 12); // تحويل إلى 12 ساعة
        let amPm = parseInt(hours) >= 12 ? "م" : "ص"; // إضافة AM/PM
        return `${formattedHours}:${minutes} ${amPm}`;
    }

    // تحديث الوقت الحالي
    function updateClock() {
        let now = new Date();
        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let seconds = now.getSeconds().toString().padStart(2, '0');
        document.getElementById("currentTime").innerText = `الوقت الحالي: ${formatTime(`${hours}:${minutes}`)}`;
    }

    // تحديث الصلاة التالية
    function updateNextPrayer() {
        if (Object.keys(prayerTimes).length === 0) return;

        let now = new Date();
        let nextPrayer = null;
        let minDiff = Infinity;

        let prayers = [
            { name: "الفجر", time: prayerTimes.fajr },
            { name: "الظهر", time: prayerTimes.dhuhr },
            { name: "العصر", time: prayerTimes.asr },
            { name: "المغرب", time: prayerTimes.maghrib },
            { name: "العشاء", time: prayerTimes.isha },
            { name: "صلاة الليل", time: prayerTimes.nightPrayer }
        ];

        prayers.forEach(prayer => {
            let [hours, minutes] = prayer.time.split(":");
            let prayerTime = new Date();
            prayerTime.setHours(hours);
            prayerTime.setMinutes(minutes);
            prayerTime.setSeconds(0);

            let diff = (prayerTime - now) / 1000;
            if (diff > 0 && diff < minDiff) {
                minDiff = diff;
                nextPrayer = prayer;
            }
        });

        if (nextPrayer) {
            let remainingMinutes = Math.floor(minDiff / 60);
            let remainingSeconds = Math.floor(minDiff % 60);
            document.getElementById("nextPrayer").innerText = nextPrayer.name;
            document.getElementById("remainingTime").innerText = `${remainingMinutes}:${remainingSeconds}`;
        } else {
            document.getElementById("nextPrayer").innerText = "الفجر";
            document.getElementById("remainingTime").innerText = "غدًا";
        }
    }

    // جلب مواقيت الصلاة عند تحميل الصفحة
    fetchPrayerTimes();

    // تحديث مواقيت الصلاة كل ساعة
    setInterval(fetchPrayerTimes, 3600000); 

    // تحديث الساعة كل ثانية
    setInterval(updateClock, 1000);

    // تحديث الصلاة التالية كل ثانية
    setInterval(updateNextPrayer, 1000);
});