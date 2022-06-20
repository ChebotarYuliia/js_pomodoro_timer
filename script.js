const selectors = {
    // TIMER
    buttons: document.querySelectorAll('.timer__button'),
    clock: document.querySelector('.timer__clock span'),
    start: document.querySelector('.timer__start'),
    sounds: document.querySelectorAll('.timer__audio audio[data-sound]'),
    settings: document.querySelector('.timer__settings'),
    // MODAL WINDOW
    modalContainer: document.querySelector('.modal'),
    modalOverlay: document.querySelector('.overlay'),
    modalForm: document.querySelector('.modal__form'),
    modalCloseBtn: document.querySelector('.modal__close'),
    modalSubmit: document.querySelector('.modal__submit'),
};

const timer = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    mode: null,
    remainingTime: null,
    loop: null,
    sessions: 0,
};

function getRemainingTime(endTime) {
    const currentTime = Date.parse(new Date());
    const difference = endTime - currentTime;

    const total = Number.parseInt(difference / 1000, 10);
    const minutes = Number.parseInt((total / 60) % 60, 10);
    const seconds = Number.parseInt(total % 60, 10);
    return {
        total,
        minutes,
        seconds,
    };
};

function startTimer() {
    selectors.start.dataset.action = 'pause';
    selectors.start.innerHTML = 'Pause';
    selectors.start.classList.add('timer__start-active');

    if (timer.mode === 'pomodoro') timer.sessions++;

    let total = timer.remainingTime.total;
    const endTime = Date.parse(new Date()) + total * 1000;

    timer.loop = setInterval(() => {
        timer.remainingTime = getRemainingTime(endTime);
        total = timer.remainingTime.total;
        updateClock();

        if (total < 0) {
            clearInterval(timer.loop);

            switch (timer.mode) {
                case ('pomodoro'):
                    if (timer.sessions % timer.longBreakInterval == 0) {
                        switchTimerMode('longBreak');
                    } else {
                        switchTimerMode('shortBreak')
                    }
                    break;
                default:
                    switchTimerMode('pomodoro');
            }
            selectors.sounds.forEach(sound => {
                sound.dataset.sound == timer.mode ? sound.play() : false;
            });
            startTimer();
        };
    }, 1000);
};

function startBtnUpdate() {
    selectors.start.dataset.action = 'start';
    selectors.start.innerHTML = 'Start';
    selectors.start.classList.remove('timer__start-active');
};

function pauseTimer() {
    startBtnUpdate();
    if (timer.mode === 'pomodoro') timer.sessions--;

    clearInterval(timer.loop);
};

function stopTimer() {
    startBtnUpdate();
    clearInterval(timer.loop);
};

function updateClock() {
    const minutes = timer.remainingTime.minutes < 10 ? `0${timer.remainingTime.minutes}` : timer.remainingTime.minutes;
    const seconds = timer.remainingTime.seconds < 10 ? `0${timer.remainingTime.seconds}` : timer.remainingTime.seconds;
    selectors.clock.innerHTML = `${minutes}:${seconds}`;

    const titleText = timer.mode == 'pomodoro' ? 'Keep working!' : 'Lets take a break!';
    document.title = `${minutes}:${seconds} ${titleText}`;
};

function switchTimerMode(mode) {
    timer.mode = mode;
    timer.remainingTime = {
        total: timer[mode] * 60,
        minutes: timer[mode],
        seconds: 0,
    };

    selectors.buttons.forEach(btn => {
        if (btn.dataset.mode == mode) {
            btn.classList.add('timer__button-active');
        } else {
            btn.classList.remove('timer__button-active');
        }
    });

    document.body.style.background = `var(--${mode})`;

    updateClock();
};

function openSettings() {
    selectors.modalContainer.classList.add('active');
    selectors.modalOverlay.classList.add('active');
};

function closeSettings() {
    selectors.modalContainer.classList.remove('active');
    selectors.modalOverlay.classList.remove('active');
};

function submitSettings(e) {
    e.preventDefault();
    const checkedSettings = selectors.modalForm.querySelectorAll('.modal__checkbox:checked');
    checkedSettings.forEach(setting => {
        timer[setting.getAttribute('name')] = setting.value;
    });

    switchTimerMode(timer.mode)
}

document.addEventListener('DOMContentLoaded', () => {
    switchTimerMode('pomodoro');
});

document.addEventListener('click', e => {
    const target = e.target;

    if (target == selectors.start) {
        const buttonSound = new Audio('./assets/audio/buttonSound.mp3');
        buttonSound.play();
        switch (target.dataset.action) {
            case ('start'):
                startTimer();
                break;
            case ('pause'):
                pauseTimer();
                break;
        };
    };

    if (target.classList.contains('timer__button')) {
        timer.sessions = 0;
        switchTimerMode(target.dataset.mode);
        stopTimer();
    };

    if (target == selectors.settings) {
        stopTimer();
        openSettings();
    };

    if (target == selectors.modalSubmit) {
        closeSettings();
        submitSettings(e);
    };

    if (target == selectors.modalCloseBtn) {
        closeSettings();
    }
});
