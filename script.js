document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const uploadArea = document.getElementById('uploadArea');
    const videoInput = document.getElementById('videoInput');
    const durationInput = document.getElementById('duration');
    const processBtn = document.getElementById('process-btn');
    const downloadBtn = document.getElementById('download-btn');
    const preview = document.getElementById('preview');
    const progressBar = document.getElementById('progress-bar');
    const statusText = document.getElementById('status');
    const originalDurationEl = document.getElementById('original-duration');
    const targetDurationEl = document.getElementById('target-duration');
    const methodSelect = document.getElementById('method');
    const langRuBtn = document.getElementById('lang-ru');
    const langEnBtn = document.getElementById('lang-en');
    
    let originalVideo = null;
    let originalVideoDuration = 0;
    let currentLanguage = 'ru';
    
    // Переводы
    const translations = {
        'ru': {
            'title': 'Растягивание видео до 10 часов',
            'subtitle': 'Загрузите видео и растяните его до нужной продолжительности',
            'uploadTitle': 'Загрузка видео',
            'uploadText': 'Перетащите видео сюда или кликните для выбора',
            'uploadFormats': 'Поддерживаемые форматы: MP4, WebM, MOV',
            'durationLabel': 'Желаемая продолжительность (часы:минуты:секунды)',
            'methodLabel': 'Метод растягивания',
            'methodSlow': 'Замедление',
            'methodLoop': 'Зацикливание',
            'methodDuplicate': 'Дублирование кадров',
            'processBtn': 'Обработать видео',
            'downloadBtn': 'Скачать результат',
            'previewTitle': 'Предпросмотр',
            'uploadPrompt': 'Загрузите видео для предпросмотра',
            'originalDuration': 'Исходная длительность:',
            'targetDuration': 'Целевая длительность:',
            'statusLabel': 'Статус:',
            'howItWorks': 'Как это работает?',
            'description1': 'Этот инструмент позволяет растянуть ваше видео до продолжительности в 10 часов. Вы можете использовать один из трех методов:',
            'method1': 'Замедление - видео замедляется до нужной продолжительности',
            'method2': 'Зацикливание - видео повторяется необходимое количество раз',
            'method3': 'Дублирование кадров - увеличивается длительность каждого кадра',
            'note': 'Обратите внимание: обработка видео в браузере имеет ограничения. Для создания 10-часового видео потребуется значительное время и ресурсы.',
            'footer': 'Видео растягиватель © 2023 | Работает непосредственно в вашем браузере',
            'statusWaiting': 'Ожидание загрузки видео',
            'statusUploaded': 'Видео загружено. Нажмите "Обработать видео"',
            'statusProcessing': 'Обработка видео...',
            'statusComplete': 'Обработка завершена!'
        },
        'en': {
            'title': 'Video Stretcher up to 10 hours',
            'subtitle': 'Upload a video and stretch it to the desired duration',
            'uploadTitle': 'Video Upload',
            'uploadText': 'Drag and drop video here or click to select',
            'uploadFormats': 'Supported formats: MP4, WebM, MOV',
            'durationLabel': 'Desired duration (hours:minutes:seconds)',
            'methodLabel': 'Stretching method',
            'methodSlow': 'Slow down',
            'methodLoop': 'Looping',
            'methodDuplicate': 'Frame duplication',
            'processBtn': 'Process Video',
            'downloadBtn': 'Download Result',
            'previewTitle': 'Preview',
            'uploadPrompt': 'Upload a video for preview',
            'originalDuration': 'Original duration:',
            'targetDuration': 'Target duration:',
            'statusLabel': 'Status:',
            'howItWorks': 'How it works?',
            'description1': 'This tool allows you to stretch your video up to 10 hours in duration. You can use one of three methods:',
            'method1': 'Slow down - video is slowed down to the desired duration',
            'method2': 'Looping - video is repeated the required number of times',
            'method3': 'Frame duplication - the duration of each frame is increased',
            'note': 'Note: browser video processing has limitations. Creating a 10-hour video will require significant time and resources.',
            'footer': 'Video Stretcher © 2023 | Works directly in your browser',
            'statusWaiting': 'Waiting for video upload',
            'statusUploaded': 'Video uploaded. Click "Process Video"',
            'statusProcessing': 'Processing video...',
            'statusComplete': 'Processing complete!'
        }
    };

    // Функция перевода
    function updateLanguage(lang) {
        currentLanguage = lang;
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang][key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'OPTION') {
                    element.value = translations[lang][key];
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        });
        
        // Обновляем активную кнопку языка
        langRuBtn.classList.toggle('active', lang === 'ru');
        langEnBtn.classList.toggle('active', lang === 'en');
        
        // Обновляем статус, если нужно
        if (statusText.textContent.includes('Ожидание') || statusText.textContent.includes('Waiting')) {
            statusText.textContent = translations[lang]['statusWaiting'];
        }
    }

    // Обработчики переключения языка
    langRuBtn.addEventListener('click', () => updateLanguage('ru'));
    langEnBtn.addEventListener('click', () => updateLanguage('en'));

    // Обработчики для загрузки видео
    uploadArea.addEventListener('click', () => videoInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#4CAF50';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#ccc';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ccc';
        
        if (e.dataTransfer.files.length) {
            handleVideoFile(e.dataTransfer.files[0]);
        }
    });
    
    videoInput.addEventListener('change', () => {
        if (videoInput.files.length) {
            handleVideoFile(videoInput.files[0]);
        }
    });
    
    // Обновление целевой длительности
    durationInput.addEventListener('change', () => {
        targetDurationEl.textContent = durationInput.value;
    });
    
    // Обработка видео
    processBtn.addEventListener('click', processVideo);
    
    // Обработчик скачивания
    downloadBtn.addEventListener('click', function() {
        alert(currentLanguage === 'ru' 
            ? 'В реальном приложении здесь началось бы скачивание обработанного видеофайла.' 
            : 'In a real application, the processed video file would start downloading here.');
    });

    function handleVideoFile(file) {
        if (!file.type.startsWith('video/')) {
            statusText.textContent = currentLanguage === 'ru' 
                ? 'Пожалуйста, выберите видео файл' 
                : 'Please select a video file';
            return;
        }
        
        const videoURL = URL.createObjectURL(file);
        
        if (originalVideo) {
            preview.removeChild(originalVideo);
        }
        
        originalVideo = document.createElement('video');
        originalVideo.controls = true;
        originalVideo.src = videoURL;
        preview.innerHTML = '';
        preview.appendChild(originalVideo);
        
        originalVideo.addEventListener('loadedmetadata', () => {
            originalVideoDuration = originalVideo.duration;
            originalDurationEl.textContent = formatTime(originalVideoDuration);
            processBtn.disabled = false;
            statusText.textContent = translations[currentLanguage]['statusUploaded'];
        });
    }
    
    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    
    function processVideo() {
        const targetDuration = durationInput.value;
        const [hours, minutes, seconds] = targetDuration.split(':').map(Number);
        const targetSeconds = hours * 3600 + minutes * 60 + seconds;
        
        if (targetSeconds > 36000) {
            alert(currentLanguage === 'ru' 
                ? 'Максимальная продолжительность видео - 10 часов (36000 секунд)' 
                : 'Maximum video duration is 10 hours (36000 seconds)');
            return;
        }
        
        if (targetSeconds < originalVideoDuration) {
            alert(currentLanguage === 'ru' 
                ? 'Целевая продолжительность должна быть больше исходной' 
                : 'Target duration must be greater than original');
            return;
        }
        
        statusText.textContent = translations[currentLanguage]['statusProcessing'];
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
        
        // Имитация процесса обработки
        let progress = 0;
        const interval = setInterval(() => {
            progress += 1;
            progressBar.style.width = `${progress}%`;
            progressBar.textContent = `${progress}%`;
            statusText.textContent = `${translations[currentLanguage]['statusProcessing']}: ${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                statusText.textContent = translations[currentLanguage]['statusComplete'];
                downloadBtn.disabled = false;
                
                // Обновляем превью с "обработанным" видео
                if (originalVideo) {
                    originalVideo.playbackRate = originalVideoDuration / targetSeconds;
                }
            }
        }, 50);
    }
});
