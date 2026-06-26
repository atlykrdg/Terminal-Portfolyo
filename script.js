document.addEventListener("DOMContentLoaded", () => {
    const output = document.getElementById("output");
    const input = document.getElementById("command-input");
    const terminalContainer = document.getElementById("terminal-container");

    let cubeSpeedMultiplier = 1;
    let cubeChars = ['@', '$', '~', '#', ';', '+']; // 3D Küp varsayılan karakterleri
    // --- 3D KÜP RENDER MOTORU ---
    let isTitanMode = false;
    let isBlueprintMode = false;
    let topInterval; 

    // --- KOMUT GEÇMİŞİ (HISTORY) İÇİN DEĞİŞKENLER ---
    let commandHistory = [];
    let historyIndex = -1;
    let activeSuggestion = "";

    // --- AKILLI HATA YAKALAMA İÇİN GEÇERLİ KOMUT LİSTESİ ---
    const validCommands = [
        "help", "whoami", "contact", "durum", "status", "github", "repo",
        "projeler", "yetenekler", "kodlama dilleri", "diller", "araçlar", "ide", "eğitim",
        "okul", "iletişim", "mail", "linkedin", "ls projects", "cat about.txt",
        "skills --list", "sudo hire-me", "render", "render wireframe", "render titan", "draw 3d-box", "top", "tasks", "theme light",
        "theme dark", "clock", "saat", "matrix", "sudo", "admin", "clear", "cls",
        "reboot", "restart", "play snake", "dump all"
    ];

    document.addEventListener("click", () => {
        if (!document.getElementById("matrix-canvas")) {
            input.focus();
        }
    });

    function scrollToBottom() {
        terminalContainer.scrollTop = terminalContainer.scrollHeight;
    }

    const bootMessages = [
        "Vanguard-Class Titan OS başlatılıyor...",
        "[OK] Optik Sistemler Aktif...",
        "[OK] Motor Korteks Senkronize Edildi...",
        "[OK] Yapay Zeka Niyet Çözümleyici Yüklendi...",
        "[OK] Nöral Bağlantı Kuruluyor: Pilot Atılay Karadağ...",
        "--------------------------------------------------",
        "<span style='color:#b7d29a; font-weight:bold;'>Protokol 1: Pilota Bağlan.</span>",
        "<span style='color:#b7d29a; font-weight:bold;'>Protokol 2: Görevi Başarıyla Tamamla.</span>",
        "<span style='color:#b7d29a; font-weight:bold;'>Protokol 3: Pilotu Koru.</span>",
        "--------------------------------------------------",
        "Vanguard OS Sistem Arayüzüne Hoş Geldiniz.",
        "<span class='ai-notice'>[Vanguard OS: Özel alt modüller (3D Render, Matrix, Oyun Motoru) başarıyla yüklendi.]</span>",
        "<span style='color:#aaaaaa;'>Tüm komutları ve bu modüllerin nasıl kullanılacağını görmek için <b>'help'</b> yazabilirsiniz.</span>"
    ];

    function runBootSequence(isFast = false) {
        input.disabled = true; 
        output.innerHTML = "";
        
        if (isFast) {
            bootMessages.forEach(msg => printResponse(msg));
            input.disabled = false;
            input.focus();
        } else {
            let delay = 0;
            bootMessages.forEach((msg, index) => {
                setTimeout(() => {
                    printResponse(msg);
                    if (index === bootMessages.length - 1) {
                        input.disabled = false; 
                        input.focus();
                    }
                }, delay);
                delay += (index > 4) ? 400 : 200; 
            });
        }
    }

    function printEcho(text) {
        const div = document.createElement("div");
        div.className = "echo";
        div.textContent = text;
        output.appendChild(div);
        scrollToBottom(); 
    }

    function printResponse(html, typeWriter = false, speed = 5) {
        const div = document.createElement("div");
        div.className = "response";
        output.appendChild(div);

        if (!typeWriter) {
            div.innerHTML = html;
            scrollToBottom();
            return;
        }

        let i = 0;
        let currentHtml = "";
        input.disabled = true;
        
        function type() {
            if (i < html.length) {
                if (html.charAt(i) === '<') {
                    while (i < html.length && html.charAt(i) !== '>') {
                        currentHtml += html.charAt(i);
                        i++;
                    }
                    currentHtml += '>';
                    i++; // Move past '>'
                    div.innerHTML = currentHtml;
                    type(); 
                } else if (html.charAt(i) === '&') {
                    while (i < html.length && html.charAt(i) !== ';') {
                        currentHtml += html.charAt(i);
                        i++;
                    }
                    currentHtml += ';';
                    i++; // Move past ';'
                    div.innerHTML = currentHtml;
                    type();
                } else {
                    currentHtml += html.charAt(i);
                    div.innerHTML = currentHtml;
                    i++;
                    scrollToBottom();
                    setTimeout(type, speed);
                }
            } else {
                input.disabled = false;
                input.focus();
                scrollToBottom();
            }
        }
        type();
    }

    runBootSequence();

    input.addEventListener("keydown", function(e) {
        if (e.key === "Tab") {
            e.preventDefault(); 
            if (activeSuggestion) {
                input.value = activeSuggestion;
                activeSuggestion = ""; // Kullanıldıktan sonra sıfırla
                return;
            }

            const currentInput = input.value.trim().toLowerCase();
            if (!currentInput) return;

            const matches = validCommands.filter(c => c.startsWith(currentInput));
            if (matches.length === 1) {
                input.value = matches[0]; 
            } else if (matches.length > 1) {
                printEcho("Pilot_Atilay@Vanguard-OS:~$ " + input.value);
                printResponse("<span style='color:#aaaaaa;'>Olası komutlar:</span> " + matches.join(", "));
            }
        }
        else if (e.key === "Enter" && !input.disabled) {
            activeSuggestion = ""; // Yeni komut girildiğinde sıfırla
            const cmd = input.value.trim();
            if (cmd) {
                printEcho("Pilot_Atilay@Vanguard-OS:~$ " + cmd);
                commandHistory.push(cmd);
                historyIndex = commandHistory.length;
                processCommand(cmd);
            }
            input.value = "";
            scrollToBottom();
        } 
        else if (e.key === "ArrowUp") {
            e.preventDefault(); 
            if (historyIndex > 0) {
                historyIndex--;
                input.value = commandHistory[historyIndex];
            }
        } 
        else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                input.value = ""; 
            }
        }
    });

    function getClosestCommand(cmd) {
        let minDistance = 3; 
        let closest = "";
        for (const valid of validCommands) {
            let dist = levenshtein(cmd, valid);
            if (dist < minDistance) {
                minDistance = dist;
                closest = valid;
            }
        }
        return closest;
    }

    function levenshtein(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    // --- CANLI GÖREV YÖNETİCİSİ (KONSOL İÇİ) ---
    function startLiveTop() {
        input.disabled = true;
        
        // Ayrı bir tam ekran div yerine, direkt konsolun içine yazdırılacak bir element oluşturuyoruz
        const topDiv = document.createElement("div");
        topDiv.className = "response";
        topDiv.style.fontFamily = "'Consolas', monospace";
        topDiv.style.whiteSpace = "pre";
        topDiv.style.lineHeight = "1.4";
        topDiv.style.marginBottom = "15px";
        output.appendChild(topDiv);

        function renderTopFrame() {
            const cpuUs = (25 + Math.random() * 15).toFixed(1);
            const cpuSy = (8 + Math.random() * 5).toFixed(1);
            const cpuId = (100 - cpuUs - cpuSy).toFixed(1);
            const task1 = (75 + Math.random() * 10).toFixed(1);
            const task2 = (10 + Math.random() * 4).toFixed(1);

            topDiv.innerHTML = 
                `top - ${new Date().toLocaleTimeString()} up 4 days,  3:22,  1 user,  load average: ${(2.1 + Math.random()).toFixed(2)}, 1.95, 1.54\n` +
                `Tasks: 142 total,   2 running, 140 sleeping,   0 stopped,   0 zombie\n` +
                `%Cpu(s): ${cpuUs} us, ${cpuSy} sy,  0.0 ni, ${cpuId} id,  1.0 wa\n\n` +
                `  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n` +
                `    1 root      20   0  168884  13276   8456 S   0.0   0.1   0:05.14 systemd\n` +
                `  843 root      20   0   48576  15424   8192 S   0.1   0.2   1:12.33 NetworkManager\n` +
                ` 1402 atilay    20   0 3548292 215432  65536 S   2.5   1.4  15:42.11 bash\n` +
                ` 4021 atilay    20   0 8541230 405134 105432 R  ${task1}  35.4 120:15.33 python3 CICIoT2023_SMOTE.py\n` +
                ` 4055 atilay    20   0  451230 150231  45123 S  ${task2}  12.0  45:10.12 python3 PyQt5_Cafe_POS.py\n` +
                ` 4102 atilay    20   0  251020  45021  15420 S   4.2   4.2  10:05.45 ./Yaz_Stajina_Hazirlik.sh\n` +
                ` 4199 atilay    20   0   12450   4520   2100 S   1.0   2.1   2:12.50 ./74xx_Logic_Sim.bin\n` +
                ` 4210 atilay    20   0   10240   2140   1020 S   0.5   1.0   0:45.10 Klavye_Akustik_Test.exe\n` +
                ` 4350 atilay    20   0   15420   5120   3140 R   0.5   0.5   0:00.12 top\n\n` +
                `<span style='color: #ff5555; font-weight: bold;'>[CANLI SİMÜLASYON] Kapatıp konsola dönmek için 'q' tuşuna basınız.</span>`;
            
            scrollToBottom();
        }

        renderTopFrame();
        topInterval = setInterval(renderTopFrame, 1000);

        function handleTopExit(e) {
            if (e.key === "q" || e.key === "Q") {
                e.preventDefault();
                clearInterval(topInterval);
                input.disabled = false;
                input.value = "";
                input.focus();
                printResponse("<span class='ai-notice'>[Sistem]</span> Görev yöneticisi canlı modu sonlandırıldı.");
                document.removeEventListener("keydown", handleTopExit);
            }
        }
        document.addEventListener("keydown", handleTopExit);
    }

    function startLiveClock() {
        input.disabled = true;

        const clockDiv = document.createElement("div");
        clockDiv.className = "response";
        clockDiv.style.fontFamily = "monospace";
        clockDiv.style.lineHeight = "1.2";
        clockDiv.style.fontSize = "1.2em";
        clockDiv.style.marginBottom = "15px";
        output.appendChild(clockDiv);

        function renderClockFrame() {
            const asciiTime = getAsciiClock();
            clockDiv.innerHTML = 
                `<span class='ai-notice'>[Vanguard OS: 74xx donanım simülasyonu tetiklendi]</span><br>` +
                `<pre style='color:#b7d29a; font-family:monospace; line-height:1.2; font-size:1.2em;'>${asciiTime}</pre>` +
                `<span style='color:#888888;'>Sistem saati 7490/7447 lojik entegre simülasyonu ve 3161bs-1 modeli üzerinden senkronize edildi.</span><br><br>` +
                `<span style='color: #ff5555; font-weight: bold;'>[CANLI SİMÜLASYON] Kapatıp konsola dönmek için 'q' tuşuna basınız.</span>`;
            
            scrollToBottom();
        }

        renderClockFrame();
        const clockInterval = setInterval(renderClockFrame, 1000);

        function handleClockExit(e) {
            if (e.key === "q" || e.key === "Q") {
                e.preventDefault();
                clearInterval(clockInterval);
                input.disabled = false;
                input.value = "";
                input.focus();
                printResponse("<span class='ai-notice'>[Sistem]</span> Saat simülasyonu sonlandırıldı.");
                document.removeEventListener("keydown", handleClockExit);
            }
        }
        document.addEventListener("keydown", handleClockExit);
    }

    function startSnakeGame() {
        input.disabled = true;

        const gameDiv = document.createElement("div");
        gameDiv.className = "response";
        gameDiv.style.fontFamily = "monospace";
        gameDiv.style.lineHeight = "1";
        gameDiv.style.fontSize = "1.2em";
        gameDiv.style.marginBottom = "15px";
        output.appendChild(gameDiv);

        const width = 20;
        const height = 10;
        let snake = [{x: 10, y: 5}];
        let direction = {x: 1, y: 0};
        let nextDirection = {x: 1, y: 0};
        let food = {x: 15, y: 5};
        let score = 0;
        let gameOver = false;

        function spawnFood() {
            let newFood;
            while (true) {
                newFood = {
                    x: Math.floor(Math.random() * width),
                    y: Math.floor(Math.random() * height)
                };
                let onSnake = false;
                for (let s of snake) {
                    if (s.x === newFood.x && s.y === newFood.y) onSnake = true;
                }
                if (!onSnake) break;
            }
            food = newFood;
        }

        function renderGame() {
            let board = "";
            
            board += "+" + "-".repeat(width) + "+\n";
            for (let y = 0; y < height; y++) {
                board += "|";
                for (let x = 0; x < width; x++) {
                    let char = " ";
                    if (food.x === x && food.y === y) char = "<span style='color:#ff5555'>X</span>";
                    else {
                        for (let i = 0; i < snake.length; i++) {
                            if (snake[i].x === x && snake[i].y === y) {
                                char = i === 0 ? "<span style='color:#b7d29a'>@</span>" : "<span style='color:#A1BC98'>o</span>";
                                break;
                            }
                        }
                    }
                    board += char;
                }
                board += "|\n";
            }
            board += "+" + "-".repeat(width) + "+\n";
            
            let html = `<span class='ai-notice'>[Vanguard OS: Retro oyun motoru başlatıldı]</span><br>`;
            html += `<b>SNAKE (Puan: ${score})</b><br>`;
            html += `<pre style='background-color:#0c0c0c; padding:10px; border-radius:5px; border:1px solid #333; display:inline-block;'>${board}</pre><br>`;
            
            if (gameOver) {
                html += `<span style='color:#ff5555; font-weight:bold;'>GAME OVER!</span> Çıkmak için 'q', yeniden oynamak için 'r' tuşuna basın.`;
            } else {
                html += `<span style='color:#888888;'>Kontrol: Yön tuşları veya W,A,S,D | Çıkış: q</span>`;
            }
            
            gameDiv.innerHTML = html;
            scrollToBottom();
        }

        let snakeInterval = setInterval(() => {
            if (gameOver) return;
            
            direction = nextDirection;
            const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
            
            if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) {
                gameOver = true;
                renderGame();
                return;
            }
            for (let s of snake) {
                if (s.x === head.x && s.y === head.y) {
                    gameOver = true;
                    renderGame();
                    return;
                }
            }
            
            snake.unshift(head);
            
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                spawnFood();
            } else {
                snake.pop();
            }
            
            renderGame();
        }, 150);

        function handleSnakeInput(e) {
            if (e.key === "q" || e.key === "Q") {
                e.preventDefault();
                clearInterval(snakeInterval);
                input.disabled = false;
                input.value = "";
                input.focus();
                printResponse("<span class='ai-notice'>[Sistem]</span> Snake oyunu sonlandırıldı.");
                document.removeEventListener("keydown", handleSnakeInput);
                return;
            }
            if (gameOver) {
                if (e.key === "r" || e.key === "R") {
                    e.preventDefault();
                    snake = [{x: 10, y: 5}];
                    direction = {x: 1, y: 0};
                    nextDirection = {x: 1, y: 0};
                    score = 0;
                    gameOver = false;
                    spawnFood();
                    renderGame();
                }
                return;
            }

            const key = e.key;
            const lowerKey = key.toLowerCase();
            
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key) || ["w", "a", "s", "d"].includes(lowerKey)) {
                e.preventDefault();
            }
            
            if ((key === "ArrowUp" || lowerKey === "w") && direction.y === 0) {
                nextDirection = {x: 0, y: -1};
            } else if ((key === "ArrowDown" || lowerKey === "s") && direction.y === 0) {
                nextDirection = {x: 0, y: 1};
            } else if ((key === "ArrowLeft" || lowerKey === "a") && direction.x === 0) {
                nextDirection = {x: -1, y: 0};
            } else if ((key === "ArrowRight" || lowerKey === "d") && direction.x === 0) {
                nextDirection = {x: 1, y: 0};
            }
        }
        
        document.addEventListener("keydown", handleSnakeInput);
        renderGame();
    }

    function getAsciiClock() {
        const d = new Date();
        const timeStr = [
            ('0' + d.getHours()).slice(-2),
            ('0' + d.getMinutes()).slice(-2),
            ('0' + d.getSeconds()).slice(-2)
        ].join(':');

        const digits = {
            '0': [" _ ", "| |", "|_|"], '1': ["   ", "  |", "  |"], '2': [" _ ", " _|", "|_ "],
            '3': [" _ ", " _|", " _|"], '4': ["   ", "|_|", "  |"], '5': [" _ ", "|_ ", " _|"],
            '6': [" _ ", "|_ ", "|_|"], '7': [" _ ", "  |", "  |"], '8': [" _ ", "|_|", "|_|"],
            '9': [" _ ", "|_|", " _|"], ':': ["   ", " o ", " o "]
        };

        let lines = ["", "", ""];
        for (let i = 0; i < timeStr.length; i++) {
            let char = timeStr[i];
            lines[0] += digits[char][0] + " ";
            lines[1] += digits[char][1] + " ";
            lines[2] += digits[char][2] + " ";
        }
        return lines.join('\n');
    }

    function startMatrixEffect() {
        input.disabled = true;
        const canvas = document.createElement("canvas");
        canvas.id = "matrix-canvas";
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        canvas.style.zIndex = "9999";
        canvas.style.backgroundColor = "black";
        document.body.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const letters = "01010101ATILAYKARADAG01010101";
        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const drops = [];
        for (let x = 0; x < columns; x++) drops[x] = 1;

        const interval = setInterval(() => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#b7d29a"; 
            ctx.font = fontSize + "px monospace";

            for (let i = 0; i < drops.length; i++) {
                const text = letters.charAt(Math.floor(Math.random() * letters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }, 33);

        function stopMatrix() {
            clearInterval(interval);
            document.body.removeChild(canvas);
            input.disabled = false;
            input.focus();
            printResponse("<span class='ai-notice'>[Sistem]</span> Matrix simülasyonu sonlandırıldı.");
            document.removeEventListener("keydown", stopMatrix);
            document.removeEventListener("click", stopMatrix);
        }

        setTimeout(() => {
            document.addEventListener("keydown", stopMatrix);
            document.addEventListener("click", stopMatrix);
        }, 500); 
    }

    function processCommand(cmd) {
        const lowerCmd = cmd.toLowerCase();

        // ---------------- METİN ŞABLONLARI (CV FORMATI) ----------------
        const txtHakkinda = "Merhaba, ben Atılay Karadağ. Balıkesir Üniversitesi Bilgisayar Mühendisliği 2. sınıf öğrencisiyim. Yazılım geliştirme, algoritmik problem çözme ve donanım/yazılım entegrasyonu alanlarına yoğun ilgi duyuyorum. Dinamik takım ortamlarında uyumlu çalışabilen, modern teknolojileri hızla benimseyerek yenilikçi ve verimli çözümler üretmeyi hedefleyen bir mühendis adayıyım.";
        const txtWhoami = "Pilot: Atılay Karadağ<br>Sınıf: Bilgisayar Mühendisliği (2. Yıl)<br>Uzmanlık: Yazılım Geliştirme & Donanım Entegrasyonu<br>Statü: Göreve Hazır";
        const txtEgitim = "<b>Lisans:</b> Balıkesir Üniversitesi, Bilgisayar Mühendisliği (2024-...) | Not Ortalaması: 3,30<br><b>Lise:</b> Bursa Osmangazi Gazi Anadolu Lisesi (2020-2024) | Sayısal - Diploma Puanı: 88,62";
        const txtDiller = "<b>Kodlama Dilleri:</b><br>- C#<br>- Python<br>- HTML<br>- CSS";
        const txtYabanciDiller = "<b>Yabancı Diller:</b><br>- İngilizce (B2 - Teknik ve Mesleki Yeterlilik)<br>- Türkçe (Anadil)";
        const txtAraclar = "<b>Editörler (IDE):</b><br>- Visual Studio Code<br>- Visual Studio<br>- PyCharm<br><br><b>Geliştirme, Tasarım & Kurgu Araçları:</b><br>- Autodesk Fusion 360 (3D CAD/Modelleme)<br>- Blender (3D Render/Animasyon)<br>- Unity (Oyun/Simülasyon Motoru)<br>- DaVinci Resolve (Video Kurgu & Renk Düzenleme)";
        const txtProjeler = "<b>1. Kafe/Restoran POS ve İşletme Yönetim Sistemi</b><br>" +
                            "- <b>Kategori:</b> Masaüstü Yazılım Geliştirme<br>" +
                            "- <b>Teknolojiler:</b> Python 3, PyQt5, SQLite3<br>" +
                            "- <b>Detaylar:</b> Restoran ve kafe işletmeleri için uçtan uca masa takibi, dinamik adisyon oluşturma ve stok kontrolü sağlayan otomasyon sistemi. Kullanıcı deneyimini (UX) artırmak adına modern standartlara uygun 'Dark Mode' teması entegre edildi. Kod mimarisini sadeleştirmek ve uygulama stabilitesini maksimize etmek amacıyla gereksiz yönetici (admin) katmanları projeden tamamen çıkarıldı.<br><br>" +
                            "<b>2. Sayısal Tasarım Dijital Saat ve Alarm Modülü</b><br>" +
                            "- <b>Kategori:</b> Donanım / Gömülü Sistemler (Sayısal Tasarım)<br>" +
                            "- <b>Bileşenler:</b> Breadboard, 74xx serisi mantık entegreleri (7490 Mod-10 sayıcı, 7447 kod çözücü), 3161bs-1 7-Segment Display.<br>" +
                            "- <b>Detaylar:</b> Hiçbir yazılım kullanılmadan, tamamen lojik (mantıksal) donanım kapıları ile sıfırdan tasarlanıp fiziksel olarak inşa edilen asenkron saat devresi. Sinyal senkronizasyonu ve mod-60 (saniye/dakika) mantık devreleri başarıyla kuruldu. Özellikle kullanılan spesifik 3161bs-1 model display'in pin yapısındaki DP (Decimal Point) oryantasyon farklılıkları tespit edildi ve donanım kalibrasyonu buna göre özel olarak uygulandı.<br><br>" +
                            "<b>3. Siber Güvenlik Veri Setlerinde Aşırı Örnekleme ve Veri Sızıntısı Analizi</b><br>" +
                            "- <b>Kategori:</b> Yapay Zeka / Veri Bilimi (Akademik Araştırma)<br>" +
                            "- <b>Teknolojiler:</b> Python, Makine Öğrenmesi (Machine Learning), SMOTE<br>" +
                            "- <b>Detaylar:</b> Nesnelerin İnterneti (IoT) ağlarındaki siber tehditleri içeren devasa 'CICIoT2023' veri seti üzerinde makine öğrenmesi modelleri eğitilirken, azınlık sınıflarını dengelemek için SMOTE (Synthetic Minority Over-sampling Technique) algoritması uygulandı. Sentetik veri üretim aşamalarında yaşanabilecek 'Veri Sızıntısı (Data Leakage)' probleminin, yapay zeka modellerinin siber güvenlik tehditlerini tespit etmedeki gerçek dünya başarı metriklerine etkisi akademik bir yaklaşımla araştırılmaktadır.";
        const txtIletisim = "<b>Email:</b> <a href='mailto:atlykrdg@gmail.com' style='color:#b7d29a; text-decoration:none;'>atlykrdg@gmail.com</a><br><b>LinkedIn:</b> <a href='https://www.linkedin.com/in/atılay-karadağ' target='_blank' style='color:#b7d29a; text-decoration:none;'>www.linkedin.com/in/atılay-karadağ</a>";

        // --- STANDART TERMİNAL KOMUTLARI (PARSING / AYRIŞTIRMA MANTIĞI) ---
        // Yazılan metni komut ve argümanlara ayırma (split) işlemi
        const parsedArgs = lowerCmd.split(" ");
        const baseCmd = parsedArgs[0];
        const arg1 = parsedArgs[1] || "";

        if (baseCmd === "ls") {
            if (arg1 === "projects") {
                printResponse("<span class='ai-notice'>[Vanguard OS: Projeler dizini listeleniyor...]</span><br>" + txtProjeler, true); return;
            } else if (arg1 === "") {
                printResponse("about.txt&nbsp;&nbsp;&nbsp;&nbsp;<span style='color:#b7d29a'>projects/</span>"); return;
            } else {
                printResponse("ls: cannot access '" + arg1 + "': No such file or directory"); return;
            }
        }

        if (baseCmd === "cat") {
            if (arg1 === "about.txt") {
                printResponse("<span class='ai-notice'>[Vanguard OS: about.txt dosyası okundu...]</span><br>" + txtHakkinda, true); return;
            } else if (arg1 === "") {
                printResponse("cat: argüman eksik. Kullanım: cat [dosya_adi]"); return;
            } else {
                printResponse("cat: " + arg1 + ": No such file or directory"); return;
            }
        }

        if (baseCmd === "skills") {
            if (arg1 === "--list") {
                printResponse("<span class='ai-notice'>[Vanguard OS: Yetenek ve araç listesi getiriliyor...]</span><br>" + txtDiller + "<br><br>" + txtYabanciDiller + "<br><br>" + txtAraclar, true); return;
            } else {
                printResponse("Kullanım: skills --list"); return;
            }
        }

        if (lowerCmd === "clear" || lowerCmd === "cls") { printResponse("Optik Sistemler Temizleniyor..."); setTimeout(() => runBootSequence(true), 500); return; }
        if (lowerCmd === "reboot" || lowerCmd === "restart") { printResponse("<span style='color: #ff5555; font-weight: bold;'>[DİKKAT] Eject Sequence Initiated. (Acil Çıkış Protokolü)</span>"); setTimeout(() => runBootSequence(false), 1500); return; }

        if (lowerCmd === "sudo" || lowerCmd === "admin" || lowerCmd === "su" || lowerCmd === "root" || lowerCmd === "login") {
            printResponse("<span style='color: #ff5555; font-weight: bold;'>[Erişim Reddedildi]</span><br>Sistem optimizasyonu ve güvenlik prosedürleri gereği tüm admin giriş noktaları kaynak koddan kalıcı olarak temizlenmiştir. Lütfen standart kullanıcı yetkilerinizle devam edin."); return;
        }

        if (lowerCmd === "matrix") { printResponse("Matrix protokolü başlatılıyor..."); setTimeout(startMatrixEffect, 500); return; }

        if (lowerCmd === "clock" || lowerCmd === "saat") {
            startLiveClock(); return;
        }

        if (lowerCmd === "theme light") { document.body.classList.add("light-theme"); printResponse("<span class='ai-notice'>[Vanguard OS: Ekran modu güncelleniyor]</span><br>Aydınlık tema aktif edildi."); return; }
        if (lowerCmd === "theme dark") { document.body.classList.remove("light-theme"); printResponse("<span class='ai-notice'>[Vanguard OS: Ekran modu güncelleniyor]</span><br>Karanlık tema aktif edildi. Klasik CMD moduna geri dönüldü."); return; }

        if (lowerCmd === "play snake") {
            startSnakeGame(); return;
        }

        if (lowerCmd === "top" || lowerCmd === "tasks" || lowerCmd.includes("görev")) {
            startLiveTop(); return;
        }

        if (lowerCmd === "github" || lowerCmd === "repo" || lowerCmd.includes("git")) {
            printResponse("<span class='ai-notice'>[Vanguard OS: Uzak sunucu bağlantısı kuruluyor]</span><br>GitHub Profili: <a href='https://github.com/atylkrdg' target='_blank' style='color:#b7d29a; text-decoration:none;'>github.com/atylkrdg</a>", true); return;
        }

        if (lowerCmd.includes("durum") || lowerCmd.includes("status") || lowerCmd.includes("güncel")) {
            printResponse("<span class='ai-notice'>[Vanguard OS: Güncel Mühendislik Durum Raporu]</span><br>" +
                          "- <b>Akademik:</b> Bilgisayar Mühendisliği 2. Sınıf / Algoritma ve Veri Yapıları entegrasyonu.<br>" +
                          "- <b>Güncel Odak:</b> Yaz dönemi döngüsünde kodlama algoritmaları ve 3D modelleme/simülasyon teknolojileri üzerinde bağımsız yetkinlik inşası yürütülüyor.<br>" +
                          "- <b>Araştırma:</b> CICIoT2023 siber güvenlik veri setleri üzerinde SMOTE tabanlı veri sızıntısı analizleri.<br>" +
                          "- <b>Donanım:</b> Sayısal devre simülasyonları ve 74xx serisi lojik entegre kalibrasyonları tamamlandı.<br>" +
                          "- <b>Statü:</b> Yeni teknolojileri benimsemeye ve operasyonel takım çalışmasına hazır.", true); return;
        }

        // --- RENDER MOTORU ---
        if (lowerCmd === "draw 3d-box" || lowerCmd === "render wireframe") {
            isTitanMode = false;
            isBlueprintMode = true;
            printResponse("<span class='ai-notice'>[Vanguard OS: Blueprint motoru başlatıldı]</span><br>3D Wireframe render moduna geçildi. Yalnızca köşeler ve ayrıtlar (vertices & edges) hesaplanıyor.");
            return;
        }

        if (lowerCmd === "render titan") {
            isTitanMode = true;
            isBlueprintMode = false;
            printResponse("<span class='ai-notice'>[Vanguard OS: BT-7274 Titan Şeması Yükleniyor]</span><br>Standart 3D motoru askıya alındı. Vanguard Class Titan devrede.");
            return;
        }

        if (lowerCmd.startsWith("render")) {
            const args = lowerCmd.split(" ");
            if (args.length === 1 || args[1] === "help") {
                printResponse("<span class='ai-notice'>[Vanguard OS: Render motoru yapılandırması açıldı]</span><br>" +
                              "<b>Render Alt Komutları:</b><br>" +
                              "- 'render speed [değer]' : Dönüş hızını değiştirir (Örn: render speed 3)<br>" +
                              "- 'render color [hex]' : Küp rengini değiştirir (Örn: render color #ff0000)<br>" +
                              "- 'render char [karakterler]' : Küpün matris çizim karakterlerini günceller (Örn: render char 01)<br>" +
                              "- 'render wireframe' : Wireframe (Tel kafes) modunu açar<br>" +
                              "- 'render titan' : BT-7274 Vanguard Titan şemasını yükler<br>" +
                              "- 'render reset' : Varsayılan ayarlara döner.");
                return;
            }
            if (args[1] === "speed" && args[2]) {
                const val = parseFloat(args[2]);
                if (!isNaN(val)) {
                    cubeSpeedMultiplier = val;
                    printResponse("Render dönüş hızı çarpanı <b>" + val + "x</b> olarak ayarlandı.");
                } else {
                    printResponse("<span style='color:#ff5555;'>Hata:</span> Geçerli bir sayı giriniz.");
                }
                return;
            }
            if (args[1] === "color" && args[2]) {
                let hex = args[2];
                if (!hex.startsWith("#")) {
                    printResponse("<span style='color:#ff5555;'>Uyarı:</span> Lütfen renk kodunun başına <b>#</b> işareti koymayı unutmayın. (Örn: render color #" + hex + ")");
                    return;
                }
                document.getElementById('ascii-cube').style.color = hex;
                printResponse("Render rengi <b>" + hex + "</b> olarak güncellendi.");
                return;
            }
            if (args[1] === "char" && args[2]) {
                const chars = args[2];
                cubeChars = [];
                for (let i = 0; i < 6; i++) {
                    cubeChars.push(chars[i % chars.length]);
                }
                printResponse("Render matris çizim bileşenleri <b>" + chars + "</b> olarak güncellendi.");
                return;
            }
            if (args[1] === "reset") {
                isBlueprintMode = false;
                isTitanMode = false;
                cubeSpeedMultiplier = 1;
                cubeChars = ['@', '$', '~', '#', ';', '+'];
                document.getElementById('ascii-cube').style.color = ""; 
                document.getElementById('ascii-cube').style.transformOrigin = "initial";
                document.getElementById('ascii-cube').style.transform = "none";
                printResponse("Render ayarları varsayılana döndürüldü.");
                return;
            }
        }

        if (lowerCmd === "cat about.txt") { printResponse("<span class='ai-notice'>[Dosya Okunuyor: about.txt]</span><br>" + txtHakkinda); return; }
        if (lowerCmd === "skills --list") { printResponse("<span class='ai-notice'>[Parametre Ayrıştırıldı: --list]</span><br>" + txtDiller + "<br><br>" + txtYabanciDiller + "<br><br>" + txtAraclar); return; }
        if (lowerCmd === "contact") { printResponse("<span class='ai-notice'>[İletişim Portu Açıldı]</span><br>" + txtIletisim); return; }
        if (lowerCmd === "sudo hire-me") {
            printResponse("<span style='color: #b7d29a; font-weight: bold;'>[SİSTEM UYARISI: İŞE ALIM PROTOKOLÜ TETİKLENDİ]</span><br>" +
                          "Tebrikler! Atılay Karadağ'ı ekibinize/projenize katmak için harika bir karar verdiniz.<br>" +
                          "Lütfen teklifinizi veya geri bildiriminizi <b>atlykrdg@gmail.com</b> adresine iletin. Sözleşme hazırlanıyor... [OK]"); return;
        }



        if (lowerCmd.includes("hepsi") || lowerCmd.includes("tümü") || lowerCmd.includes("her şey") || lowerCmd === "all" || lowerCmd === "dump all") {
            const txtHepsi = "<span class='ai-notice'>[Vanguard OS: Tüm veritabanı kayıtları ekrana dökülüyor...]</span><br><br>" +
                             "<span style='color: #b7d29a;'>--- KİMLİK & HAKKINDA ---</span><br>" + txtHakkinda + "<br><br>" +
                             "<span style='color: #b7d29a;'>--- EĞİTİM ---</span><br>" + txtEgitim + "<br><br>" +
                             "<span style='color: #b7d29a;'>--- KODLAMA DİLLERİ ---</span><br>" + txtDiller + "<br><br>" + txtYabanciDiller + "<br><br>" + txtAraclar + "<br><br>" +
                             "<span style='color: #b7d29a;'>--- PROJELER ---</span><br>" + txtProjeler + "<br><br>" +
                             "<span style='color: #b7d29a;'>--- İLETİŞİM ---</span><br>" + txtIletisim;
            printResponse(txtHepsi, true);
            return;
        }

        const isLang = lowerCmd.includes("dil") || lowerCmd.includes("kodlama");
        const isTool = lowerCmd.includes("araç") || lowerCmd.includes("ide") || lowerCmd.includes("editör") || (lowerCmd.includes("program") && !lowerCmd.includes("programlama"));
        const isSkill = lowerCmd.includes("yetenek") || lowerCmd.includes("beceri");

        if (isTool && !isSkill) { printResponse("<span class='ai-notice'>[Vanguard OS: Kullanıcı sadece araçları/IDE'leri sorguladı]</span><br>" + txtAraclar); return; }
        if (isSkill) { printResponse("<span class='ai-notice'>[Vanguard OS: Kullanıcı tüm teknik becerileri ve dilleri sorguluyor]</span><br>" + txtDiller + "<br><br>" + txtYabanciDiller + "<br><br>" + txtAraclar); return; }
        if (lowerCmd.includes("kodlama") || lowerCmd.includes("programlama")) { printResponse("<span class='ai-notice'>[Vanguard OS: Kullanıcı kodlama dillerini sorguladı]</span><br>" + txtDiller); return; }
        if (lowerCmd.includes("dil")) { printResponse("<span class='ai-notice'>[Vanguard OS: Kullanıcı yabancı dilleri sorguladı]</span><br>" + txtYabanciDiller); return; }

        if (lowerCmd.includes("python") && (lowerCmd.includes("proje") || lowerCmd.includes("yap"))) {
            printResponse("<span class='ai-notice'>[Vanguard OS: Kullanıcı sadece 'Python' projelerini filtrelemek istiyor]</span><br><b>Kafe/Restoran POS ve İşletme Yönetim Sistemi (Yazılım)</b><br>- <b>Teknolojiler:</b> Python 3, PyQt5, SQLite3<br>- <b>Detaylar:</b> Restoran ve kafe işletmeleri için uçtan uca masa takibi, dinamik adisyon oluşturma ve stok kontrolü sağlayan otomasyon sistemi. Kod mimarisini sadeleştirmek ve uygulama stabilitesini maksimize etmek amacıyla gereksiz yönetici (admin) katmanları projeden tamamen çıkarıldı."); return;
        }

        if (lowerCmd.includes("proje") || lowerCmd.includes("neler yaptın")) { printResponse("<span class='ai-notice'>[Vanguard OS: Kullanıcı tüm projeleri görmek istiyor]</span><br>" + txtProjeler); return; }
        if (lowerCmd.includes("hakkında") || lowerCmd.includes("kim") || lowerCmd.includes("whoami")) { printResponse("<span class='ai-notice'>[Vanguard OS: Kullanıcı profil bilgisini soruyor]</span><br>" + txtWhoami, true); return; }
        if (lowerCmd.includes("eğitim") || lowerCmd.includes("okul") || lowerCmd.includes("üniversite") || lowerCmd.includes("lise")) { printResponse("<span class='ai-notice'>[Vanguard OS: Kullanıcı eğitim geçmişini sorguluyor]</span><br>" + txtEgitim, true); return; }
        if (lowerCmd.includes("iletişim") || lowerCmd.includes("ulaş") || lowerCmd.includes("mail") || lowerCmd.includes("linkedin")) { printResponse("<span class='ai-notice'>[Vanguard OS: Kullanıcı iletişim kanallarını istiyor]</span><br>" + txtIletisim, true); return; }

        if (lowerCmd.includes("help") || lowerCmd.includes("yardım")) {
            printResponse("Kullanılabilir Komutlar ve Modüller:<br><br>" +
                          "<span style='color: #b7d29a;'>user.identity-</span> <span style='color:#888888;'>// Kimlik ve İletişim</span><br>" +
                          "<pre style='margin:0; font-family:inherit; font-size:inherit;'>" +
                          "  whoami           <span style='color:#888888'>Kişisel kimlik ve profil özeti</span>\n" +
                          "  cat about.txt    <span style='color:#888888'>Hakkımda detaylı bilgi metni</span>\n" +
                          "  contact          <span style='color:#888888'>İletişim ağları (Email, LinkedIn)</span>\n" +
                          "  github           <span style='color:#888888'>Uzak sunucu profili (GitHub)</span>\n" +
                          "  sudo hire-me</pre><br>" +
                          "<span style='color: #b7d29a;'>core.capabilities-</span> <span style='color:#888888;'>// Profesyonel Yetkinlikler</span><br>" +
                          "<pre style='margin:0; font-family:inherit; font-size:inherit;'>" +
                          "  ls projects      <span style='color:#888888'>Geliştirilen projelerin listesi</span>\n" +
                          "  skills --list    <span style='color:#888888'>Teknik beceriler ve araçlar</span>\n" +
                          "  status           <span style='color:#888888'>Güncel akademik ve çalışma durumu</span></pre><br>" +
                          "<span style='color: #b7d29a;'>sub.modules-</span> <span style='color:#888888;'>// Vanguard OS Alt Modülleri</span><br>" +
                          "<pre style='margin:0; font-family:inherit; font-size:inherit;'>" +
                          "  render help      <span style='color:#888888'>3D Küp render motoru kullanım kılavuzu</span>\n" +
                          "  play snake       <span style='color:#888888'>Terminal içi retro yılan oyunu başlatır</span>\n" +
                          "  top              <span style='color:#888888'>Canlı sistem görev yöneticisi (Task Manager)</span>\n" +
                          "  clock            <span style='color:#888888'>74xx donanım simülasyonlu dijital saat</span>\n" +
                          "  matrix           <span style='color:#888888'>Görsel Matrix veri akışı simülasyonu</span></pre><br>" +
                          "<span style='color: #b7d29a;'>sys.utility-</span> <span style='color:#888888;'>// Sistem Yönetimi</span><br>" +
                          "<pre style='margin:0; font-family:inherit; font-size:inherit;'>" +
                          "  dump all         <span style='color:#888888'>Tüm sistem veritabanını tek seferde ekrana döker</span>\n" +
                          "  theme light      <span style='color:#888888'>Arayüz temasını aydınlık (Light) moda çevirir</span>\n" +
                          "  theme dark       <span style='color:#888888'>Arayüz temasını karanlık (Dark) moda çevirir</span>\n" +
                          "  clear            <span style='color:#888888'>Terminal ekranını temizler</span>\n" +
                          "  reboot           <span style='color:#888888'>Sistemi donanım testiyle yeniden başlatır</span></pre><br>" +
                          "<br><span style='color: #b7d29a;'>[ Klavye Kısayolları ]</span><br>" +
                          "<pre style='margin:0; font-family:inherit; font-size:inherit;'>" +
                          "  [Tab]            <span style='color:#888888'>Yazılan komutu otomatik tamamlar</span>\n" +
                          "  [Yukarı / Aşağı] <span style='color:#888888'>Komut geçmişinde (History) gezinmeyi sağlar</span>\n" +
                          "  [q] Tuşu         <span style='color:#888888'>Çalışan aktif bir modülü (Örn: Snake, Top) durdurur ve çıkar</span></pre>");
            return;
        }

        const suggestion = getClosestCommand(lowerCmd);
        if (suggestion) {
            activeSuggestion = suggestion;
            printResponse("<span style='color: #ff5555;'>[Hata: Komut bulunamadı]</span><br>" +
                          "Bunu mu demek istediniz: <span style='color:#b7d29a; font-weight:bold; cursor:pointer;' onclick='document.getElementById(\"command-input\").value=\""+suggestion+"\"; document.getElementById(\"command-input\").focus();'>" + suggestion + "</span>? <span style='color:#888888; font-size:0.9em;'>(Doldurmak için <b>Tab</b> tuşuna bas)</span>");
        } else {
            printResponse("<span style='color: #ff5555;'>[Hata: Sistem cümlenizdeki niyeti çözemedi]</span><br>Girdiğiniz metin veri tabanımla eşleşmedi. Lütfen 'help' yazarak geçerli komutları görüntüleyin.");
        }
    }

    let A = 0, B = 0, C = 0;
    let cubeWidth = 15; 
    let width = 80, height = 40; 
    let zBuffer = [];
    let buffer = [];
    let distanceFromCam = 75; 
    let K1 = 40; 
    let incrementSpeed = 0.3; 

    function calculateForSurface(cubeX, cubeY, cubeZ, ch) {
        let x = cubeX, y = cubeY, z = cubeZ;

        let y1 = Math.cos(A) * y - Math.sin(A) * z;
        let z1 = Math.sin(A) * y + Math.cos(A) * z;
        y = y1; z = z1;

        let x2 = Math.cos(B) * x + Math.sin(B) * z;
        let z2 = -Math.sin(B) * x + Math.cos(B) * z;
        x = x2; z = z2;

        let x3 = Math.cos(C) * x - Math.sin(C) * y;
        let y3 = Math.sin(C) * x + Math.cos(C) * y;
        x = x3; y = y3;

        z += distanceFromCam;
        let ooz = 1 / z;
        
        let xp = Math.floor(width / 2 + K1 * ooz * x * 2); 
        let yp = Math.floor(height / 2 + K1 * ooz * y);

        let idx = xp + yp * width;
        if (idx >= 0 && idx < width * height) {
            if (ooz > zBuffer[idx]) {
                zBuffer[idx] = ooz;
                buffer[idx] = ch;
            }
        }
    }

    function drawLine3D(x1, y1, z1, x2, y2, z2, ch) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        let dz = z2 - z1;
        let steps = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)) / (incrementSpeed * 2);
        if (steps < 1) steps = 1;
        let xInc = dx / steps;
        let yInc = dy / steps;
        let zInc = dz / steps;
        let x = x1, y = y1, z = z1;
        for (let i = 0; i <= steps; i++) {
            calculateForSurface(x, y, z, ch);
            x += xInc; y += yInc; z += zInc;
        }
    }

    function renderCube() {
        if (isTitanMode) {
            const titanAscii = `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣤⣤⣤⣤⣤⣤⣤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⡏⠸⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣿⣿⣿⣿⣿⣿⣿⡿⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠈⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⡆⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠈⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀
⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣧⠀⠀⠀⠀
⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠀
⠀⠀⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠐⢶⣶⣶⣶⣶⣶⣶⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀
⠀⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⠀⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀
⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀
⠘⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠃`;
            const cubeEl = document.getElementById('ascii-cube');
            if(cubeEl) {
                if (cubeEl.innerText !== titanAscii) {
                    cubeEl.innerText = titanAscii;
                    cubeEl.style.color = "#ff5555"; // Titanfall red color
                }
                
                cubeEl.style.transformOrigin = "right center"; // Scale leftwards so it doesn't clip off the right edge

                // Max 10 degrees rotation using Math.sin
                let angleX = Math.sin(A) * 10;
                let angleY = Math.sin(B) * 10;
                let angleZ = Math.sin(C) * 2; 
                
                cubeEl.style.transform = `translate(-50px, 70px) perspective(800px) rotateX(${angleX}deg) rotateY(${angleY}deg) rotateZ(${angleZ}deg) scale(1.5)`;
            }
            A += 0.005 * cubeSpeedMultiplier; 
            B += 0.003 * cubeSpeedMultiplier;
            C += 0.002 * cubeSpeedMultiplier;
            requestAnimationFrame(renderCube);
            return;
        }

        buffer = new Array(width * height).fill(' ');
        zBuffer = new Array(width * height).fill(0);

        if (isBlueprintMode) {
            let w = cubeWidth;
            let ch = cubeChars[0];
            drawLine3D(-w, -w, -w,  w, -w, -w, ch);
            drawLine3D( w, -w, -w,  w,  w, -w, ch);
            drawLine3D( w,  w, -w, -w,  w, -w, ch);
            drawLine3D(-w,  w, -w, -w, -w, -w, ch);
            drawLine3D(-w, -w,  w,  w, -w,  w, ch);
            drawLine3D( w, -w,  w,  w,  w,  w, ch);
            drawLine3D( w,  w,  w, -w,  w,  w, ch);
            drawLine3D(-w,  w,  w, -w, -w,  w, ch);
            drawLine3D(-w, -w, -w, -w, -w,  w, ch);
            drawLine3D( w, -w, -w,  w, -w,  w, ch);
            drawLine3D( w,  w, -w,  w,  w,  w, ch);
            drawLine3D(-w,  w, -w, -w,  w,  w, ch);
        } else {
            for (let cubeX = -cubeWidth; cubeX < cubeWidth; cubeX += incrementSpeed) {
                for (let cubeY = -cubeWidth; cubeY < cubeWidth; cubeY += incrementSpeed) {
                    calculateForSurface(cubeX, cubeY, -cubeWidth, cubeChars[0]);
                    calculateForSurface(cubeWidth, cubeY, cubeX, cubeChars[1]);
                    calculateForSurface(-cubeWidth, cubeY, -cubeX, cubeChars[2]);
                    calculateForSurface(-cubeX, cubeY, cubeWidth, cubeChars[3]);
                    calculateForSurface(cubeX, -cubeWidth, -cubeY, cubeChars[4]);
                    calculateForSurface(cubeX, cubeWidth, cubeY, cubeChars[5]);
                }
            }
        }

        let html = '';
        for (let i = 0; i < width * height; i++) {
            html += i % width === 0 && i !== 0 ? '\n' : buffer[i];
        }
        
        const cubeEl = document.getElementById('ascii-cube');
        if(cubeEl) {
            cubeEl.innerText = html;
        }

        A += 0.005 * cubeSpeedMultiplier; 
        B += 0.004 * cubeSpeedMultiplier;
        C += 0.001 * cubeSpeedMultiplier;
        
        requestAnimationFrame(renderCube);
    }
    
    renderCube();
});