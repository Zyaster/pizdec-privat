/**
 * AndroFlash: ROM Flasher & Root Simulator (4PDA Edition)
 * Complete game logic & interactive smartphone OS simulator.
 */

// --- Sound Synthesizer via Web Audio API ---
class SoundManager {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }
  beep(freq = 600, duration = 0.08, type = 'sine', gainVal = 0.1) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }
  click() {
    this.beep(800, 0.03, 'triangle', 0.08);
  }
  bootChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
      notes.forEach((freq, idx) => {
        setTimeout(() => this.beep(freq, 0.25, 'sine', 0.12), idx * 120);
      });
    } catch (e) {}
  }
  fastbootConnect() {
    this.beep(440, 0.06, 'sawtooth', 0.08);
    setTimeout(() => this.beep(880, 0.1, 'sine', 0.1), 70);
  }
  twrpSwipe() {
    this.beep(520, 0.1, 'sine', 0.12);
    setTimeout(() => this.beep(784, 0.18, 'sine', 0.12), 100);
  }
  error() {
    this.beep(200, 0.18, 'sawtooth', 0.15);
    setTimeout(() => this.beep(150, 0.25, 'sawtooth', 0.15), 120);
  }
  vibrate(ms = 30) {
    if (window.AndroidInterface && window.AndroidInterface.vibrate) {
      window.AndroidInterface.vibrate(ms);
    } else if (navigator.vibrate) {
      navigator.vibrate(ms);
    }
  }
}

const sounds = new SoundManager();

// --- Game State Store ---
const GameState = {
  model: 'Poco X3 Pro (vayu)',
  serial: 'e7c8491a',
  battery: 98,
  usbConnected: true,
  bootloaderUnlocked: false,
  recovery: 'stock', // 'stock' | 'twrp'
  rom: 'stock',      // 'stock' | 'pixel' | 'lineage' | 'crdroid' | null
  romCleanInstalled: true, // Requires format data when switching roms
  isRooted: false,
  magiskZygisk: false,
  playIntegrityModule: false,
  screenState: 'OS', // 'OFF' | 'FASTBOOT' | 'BOOTING' | 'CRASHDUMP' | 'TWRP' | 'OS'

  // Developer settings
  developerModeUnlocked: false,
  buildTapCount: 0,

  // Benchmark
  antutuScore: 0,

  // Storage
  pcDownloads: new Set(['PixelOS_vayu_A14.zip', 'twrp_3.7.0.img']),
  phoneStorage: new Set(),

  // Quests
  quests: [
    { id: 'usb', title: '🔌 Подключение к ПК', desc: 'Убедитесь, что USB кабель подключен к ПК', exp: 50, done: true },
    { id: 'unlock', title: '🔓 Разблокировка загрузчика', desc: 'Перейдите в Fastboot и введите fastboot oem unlock', exp: 150, done: false },
    { id: 'twrp', title: '🦊 Прошивка TWRP', desc: 'Прошейте recovery twrp_3.7.0.img через Fastboot', exp: 200, done: false },
    { id: 'wipe', title: '🧹 Очистка Format Data', desc: 'Сделайте Format Data в TWRP для избежания бутлупа', exp: 150, done: false },
    { id: 'flash_rom', title: '🚀 Установка кастомной ОС', desc: 'Установите PixelOS, LineageOS или crDroid через TWRP', exp: 300, done: false },
    { id: 'root', title: '🧙 Полный Root (Magisk)', desc: 'Прошейте Magisk.zip в TWRP и запустите приложение', exp: 250, done: false },
    { id: 'bank', title: '🛡️ Обход банковских защит', desc: 'Активируйте Play Integrity Fix в Magisk и пройдите проверку банка', exp: 300, done: false },
    { id: 'crdroid_oc', title: '🔥 Оверклок 1,000,000+ очков', desc: 'Запустите AnTuTu на crDroid с Magisk и выбейте рекорд', exp: 500, done: false }
  ]
};

// --- DOM References ---
const UI = {
  tabBtns: document.querySelectorAll('.tab-btn'),
  views: {
    phone: document.getElementById('phone-view'),
    pc: document.getElementById('pc-view'),
    quests: document.getElementById('quests-view')
  },
  usbBtn: document.getElementById('usb-toggle-btn'),
  usbDot: document.querySelector('.usb-dot'),
  usbText: document.querySelector('.usb-text'),

  // Phone Screens
  screens: {
    OFF: document.getElementById('screen-off'),
    FASTBOOT: document.getElementById('screen-fastboot'),
    BOOTING: document.getElementById('screen-booting'),
    CRASHDUMP: document.getElementById('screen-crashdump'),
    TWRP: document.getElementById('screen-twrp'),
    OS: document.getElementById('screen-os')
  },
  phoneScreen: document.getElementById('phone-screen'),

  // Hardware Keys
  hwPower: document.getElementById('btn-hw-power'),
  hwVolUp: document.getElementById('btn-hw-volup'),
  hwVolDown: document.getElementById('btn-hw-voldown'),
  comboPower: document.getElementById('combo-power'),
  comboFastboot: document.getElementById('combo-fastboot'),
  comboRecovery: document.getElementById('combo-recovery'),

  // Fastboot screen
  fbInfoBl: document.getElementById('fb-info-bl'),

  // Booting screen
  unlockedIndicator: document.getElementById('unlocked-indicator'),
  bootAnimBox: document.getElementById('boot-animation-box'),

  // TWRP elements
  twrpPages: {
    main: document.getElementById('twrp-main-menu'),
    install: document.getElementById('twrp-page-install'),
    confirm: document.getElementById('twrp-page-flash-confirm'),
    log: document.getElementById('twrp-page-flash-log'),
    wipe: document.getElementById('twrp-page-wipe'),
    reboot: document.getElementById('twrp-page-reboot')
  },
  twrpClock: document.getElementById('twrp-clock'),
  twrpFileList: document.getElementById('twrp-file-list'),
  flashTargetTitle: document.getElementById('flash-target-title'),
  flashFileDetails: document.getElementById('flash-file-details'),
  swipeHandle: document.getElementById('swipe-handle'),
  swipeTrack: document.querySelector('.swipe-track'),
  twrpConsole: document.getElementById('twrp-console'),
  twrpRebootAfterFlash: document.getElementById('twrp-reboot-after-flash'),
  formatDataBox: document.getElementById('format-data-box'),
  formatYesInput: document.getElementById('format-yes-input'),
  btnConfirmFormat: document.getElementById('btn-confirm-format'),

  // OS elements
  osClock: document.getElementById('os-clock'),
  osWidgetDate: document.getElementById('os-widget-date'),
  osAppsGrid: document.getElementById('os-apps-grid'),
  osRootIndicator: document.getElementById('os-root-indicator'),
  inOsModal: document.getElementById('in-os-modal'),
  inOsModalTitle: document.getElementById('in-os-modal-title'),
  inOsModalBody: document.getElementById('in-os-modal-body'),
  btnCloseOsModal: document.getElementById('btn-close-os-modal'),
  suDialog: document.getElementById('su-dialog'),
  suTimer: document.getElementById('su-timer'),
  btnSuGrant: document.getElementById('btn-su-grant'),
  btnSuDeny: document.getElementById('btn-su-deny'),

  // PC Terminal elements
  pcLog: document.getElementById('pc-terminal-log'),
  pcInput: document.getElementById('pc-terminal-input'),
  pcSendBtn: document.getElementById('pc-terminal-send-btn'),

  // Mi Flash elements
  mfDeviceId: document.getElementById('mf-device-id'),
  mfBar: document.getElementById('mf-bar'),
  mfStatus: document.getElementById('mf-status'),
  mfResult: document.getElementById('mf-result'),
  btnMfRefresh: document.getElementById('btn-miflash-refresh'),
  btnMfFlash: document.getElementById('btn-miflash-flash'),

  // Quests list
  questsList: document.getElementById('quests-list')
};

// --- INITIALIZATION ---
function initApp() {
  bindTabs();
  bindUsbToggle();
  bindHardwareKeys();
  bindPcTerminal();
  bindForumDownloads();
  bindMiFlash();
  bindTwrp();
  bindInOsNavigation();
  renderQuests();
  updateOsUI();
  setScreenState('OS');

  // Clock
  setInterval(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    if (UI.osClock) UI.osClock.textContent = timeStr;
    if (UI.twrpClock) UI.twrpClock.textContent = timeStr;
  }, 1000);
}

// --- TAB SWITCHER ---
function bindTabs() {
  UI.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.click();
      UI.tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.tab;
      Object.keys(UI.views).forEach(key => {
        UI.views[key].classList.toggle('active', key === target);
      });
    });
  });
}

// --- USB CABLE TOGGLE ---
function bindUsbToggle() {
  UI.usbBtn.addEventListener('click', () => {
    GameState.usbConnected = !GameState.usbConnected;
    sounds.click();
    if (GameState.usbConnected) {
      UI.usbDot.classList.add('connected');
      UI.usbText.textContent = 'USB: Подключен';
      sounds.fastbootConnect();
      termLog('USB: Устройство подключено (Fastboot/ADB Interface)', 'info');
      checkQuest('usb');
    } else {
      UI.usbDot.classList.remove('connected');
      UI.usbText.textContent = 'USB: Отключен';
      termLog('USB: Устройство отключено.', 'warning');
    }
    updateMiFlashDevice();
  });
}

// --- SCREEN STATE MACHINE ---
function setScreenState(newState) {
  GameState.screenState = newState;
  Object.keys(UI.screens).forEach(key => {
    if (UI.screens[key]) {
      UI.screens[key].classList.toggle('active', key === newState);
    }
  });

  if (newState === 'FASTBOOT') {
    if (UI.fbInfoBl) {
      UI.fbInfoBl.textContent = GameState.bootloaderUnlocked ? 'DEVICE STATE - unlocked' : 'DEVICE STATE - locked';
      UI.fbInfoBl.className = GameState.bootloaderUnlocked ? 'unlocked' : 'locked';
    }
  } else if (newState === 'OS') {
    updateOsUI();
  }
}

// --- HARDWARE BUTTONS & COMBINATIONS ---
let pressedKeys = { power: false, volUp: false, volDown: false };
let comboTimer = null;

function bindHardwareKeys() {
  const setupKey = (element, keyName) => {
    if (!element) return;
    const startPress = (e) => {
      e.preventDefault();
      pressedKeys[keyName] = true;
      element.classList.add('pressed');
      sounds.click();
      sounds.vibrate(20);
      handleComboCheck();
    };
    const endPress = (e) => {
      e.preventDefault();
      pressedKeys[keyName] = false;
      element.classList.remove('pressed');
      clearTimeout(comboTimer);
    };
    element.addEventListener('mousedown', startPress);
    element.addEventListener('mouseup', endPress);
    element.addEventListener('touchstart', startPress, { passive: false });
    element.addEventListener('touchend', endPress, { passive: false });
  };

  setupKey(UI.hwPower, 'power');
  setupKey(UI.hwVolUp, 'volUp');
  setupKey(UI.hwVolDown, 'volDown');

  // Quick helper buttons
  UI.comboPower.addEventListener('click', () => {
    sounds.click();
    togglePowerDevice();
  });

  UI.comboFastboot.addEventListener('click', () => {
    sounds.click();
    bootToFastboot();
  });

  UI.comboRecovery.addEventListener('click', () => {
    sounds.click();
    bootToRecovery();
  });
}

function handleComboCheck() {
  clearTimeout(comboTimer);
  comboTimer = setTimeout(() => {
    if (pressedKeys.power && pressedKeys.volDown) {
      bootToFastboot();
    } else if (pressedKeys.power && pressedKeys.volUp) {
      bootToRecovery();
    } else if (pressedKeys.power) {
      togglePowerDevice();
    }
  }, 400);
}

function togglePowerDevice() {
  sounds.vibrate(40);
  bootDevice();
}

function bootToFastboot() {
  sounds.vibrate(80);
  setScreenState('FASTBOOT');
  sounds.fastbootConnect();
  termLog('Fastboot: Устройство переведено в Fastboot Mode!', 'info');
  updateMiFlashDevice();
}

function bootToRecovery() {
  sounds.vibrate(80);
  if (GameState.recovery === 'twrp') {
    setScreenState('TWRP');
    openTwrpPage('main');
    sounds.bootChime();
    termLog('Recovery: Запущен TeamWin Recovery Project (TWRP)', 'info');
    checkQuest('twrp');
  } else {
    termLog('Stock Recovery: У вас не установлен TWRP!', 'warning');
    alert('Stock Recovery: TWRP не установлен! Прошейте twrp_3.7.0.img через Fastboot: fastboot flash recovery twrp_3.7.0.img');
    bootDevice();
  }
}

function bootDevice() {
  setScreenState('BOOTING');
  sounds.bootChime();

  if (UI.unlockedIndicator) {
    UI.unlockedIndicator.classList.toggle('visible', GameState.bootloaderUnlocked);
  }

  // Animation logo
  let logoIcon = '⚡';
  let logoTitle = 'HyperOS';
  if (GameState.rom === 'pixel') {
    logoIcon = 'G';
    logoTitle = 'Google Pixel';
  } else if (GameState.rom === 'lineage') {
    logoIcon = '◯';
    logoTitle = 'LineageOS';
  } else if (GameState.rom === 'crdroid') {
    logoIcon = '👾';
    logoTitle = 'crDroid Gaming';
  }

  UI.bootAnimBox.innerHTML = `
    <div class="boot-logo-icon">${logoIcon}</div>
    <div class="boot-logo-title">${logoTitle}</div>
    <div class="boot-spinner"></div>
  `;

  setTimeout(() => {
    if (!GameState.rom) {
      sounds.error();
      setScreenState('FASTBOOT');
      alert('Ошибка: На устройстве не установлена система (No OS). Установите прошивку через TWRP или Mi Flash!');
      return;
    }

    if (!GameState.romCleanInstalled) {
      // Bootloop due to encryption / data mismatch
      sounds.error();
      setScreenState('CRASHDUMP');
      termLog('CRASHDUMP: Device bootloop! Kernel panic: Data encryption mismatch. Сделайте Format Data в TWRP!', 'error');
      return;
    }

    setScreenState('OS');
    sounds.vibrate(50);
    checkQuest('flash_rom');
  }, 2200);
}

// --- TWRP RECOVERY ENGINE ---
let selectedTwrpFile = null;
let isDraggingSlider = false;

function bindTwrp() {
  // Tile navigation
  document.querySelectorAll('.twrp-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.click();
      const action = btn.dataset.action;
      if (action === 'twrp-install') {
        renderTwrpFiles();
        openTwrpPage('install');
      } else if (action === 'twrp-wipe') {
        openTwrpPage('wipe');
      } else if (action === 'twrp-reboot') {
        openTwrpPage('reboot');
      } else if (action === 'twrp-backup') {
        alert('TWRP: Резервная копия Boot, System и Data успешно создана на MicroSD!');
      } else if (action === 'twrp-restore') {
        alert('TWRP: Резервных копий не найдено.');
      } else {
        alert(`TWRP: Раздел ${action} готов к работе.`);
      }
    });
  });

  // Back buttons
  document.querySelectorAll('.twrp-back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.click();
      const target = btn.dataset.back;
      if (target === 'twrp-main') openTwrpPage('main');
      if (target === 'twrp-install') openTwrpPage('install');
    });
  });

  // Reboot buttons
  document.getElementById('btn-reboot-system').addEventListener('click', () => {
    sounds.click();
    bootDevice();
  });
  document.getElementById('btn-reboot-recovery').addEventListener('click', () => {
    sounds.click();
    bootToRecovery();
  });
  document.getElementById('btn-reboot-bootloader').addEventListener('click', () => {
    sounds.click();
    bootToFastboot();
  });
  document.getElementById('btn-reboot-poweroff').addEventListener('click', () => {
    sounds.click();
    setScreenState('OFF');
  });

  // Wipe buttons
  document.getElementById('btn-format-data').addEventListener('click', () => {
    sounds.click();
    UI.formatDataBox.style.display = 'block';
  });

  UI.btnConfirmFormat.addEventListener('click', () => {
    const val = UI.formatYesInput.value.trim().toLowerCase();
    if (val === 'yes') {
      sounds.twrpSwipe();
      UI.formatDataBox.style.display = 'none';
      UI.formatYesInput.value = '';
      openTwrpPage('log');
      runTwrpConsole([
        'Formatting /data and /storage...',
        'Formatting /data using ext4...',
        'Formatting cache...',
        'Data encryption removed successfully.',
        'Updating partition details...',
        'Done! Clean installation is now ready.'
      ], () => {
        GameState.romCleanInstalled = true;
        checkQuest('wipe');
      });
    } else {
      sounds.error();
      alert('Для форматирования введите "yes" в поле ввода!');
    }
  });

  document.getElementById('btn-advanced-wipe').addEventListener('click', () => {
    sounds.click();
    openTwrpPage('log');
    runTwrpConsole([
      'Wiping Dalvik / ART Cache...',
      'Wiping Cache partition...',
      'Wipe Completed successfully.'
    ]);
  });

  UI.twrpRebootAfterFlash.addEventListener('click', () => {
    sounds.click();
    bootDevice();
  });

  initTwrpSwipeHandle();
}

function openTwrpPage(pageName) {
  Object.keys(UI.twrpPages).forEach(k => {
    if (UI.twrpPages[k]) UI.twrpPages[k].classList.remove('active');
  });
  // TWRP main menu doesn't have .twrp-subpage class, handle display style
  if (pageName === 'main') {
    UI.twrpPages.main.style.display = 'grid';
  } else {
    UI.twrpPages.main.style.display = 'none';
    if (UI.twrpPages[pageName]) {
      UI.twrpPages[pageName].classList.add('active');
    }
  }
}

function renderTwrpFiles() {
  UI.twrpFileList.innerHTML = '';
  const files = Array.from(new Set([...GameState.phoneStorage, ...GameState.pcDownloads]));

  if (files.length === 0) {
    UI.twrpFileList.innerHTML = '<div style="padding:16px; color:#888; font-size:11px;">(Папка /sdcard пуста! Скачайте прошивку на 4PDA или передайте через adb push)</div>';
    return;
  }

  files.forEach(filename => {
    if (filename.endsWith('.zip') || filename.endsWith('.img')) {
      const item = document.createElement('div');
      item.className = 'file-item';
      item.innerHTML = `<span>📦</span> <b>${filename}</b>`;
      item.addEventListener('click', () => {
        sounds.click();
        selectedTwrpFile = filename;
        UI.flashTargetTitle.textContent = `Install ${filename}`;
        UI.flashFileDetails.innerHTML = `
          <b>Файл:</b> /sdcard/${filename}<br>
          <b>Размер:</b> 1.84 GB<br>
          <b>Подпись MD5:</b> Проверено (OK)
        `;
        resetSwipeHandle();
        openTwrpPage('confirm');
      });
      UI.twrpFileList.appendChild(item);
    }
  });
}

function initTwrpSwipeHandle() {
  const handle = UI.swipeHandle;
  let startX = 0;
  let currentX = 0;
  const maxDrag = 210;

  const onDragStart = (e) => {
    isDraggingSlider = true;
    startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    handle.style.transition = 'none';
  };

  const onDragMove = (e) => {
    if (!isDraggingSlider) return;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    currentX = Math.max(0, Math.min(clientX - startX, maxDrag));
    handle.style.transform = `translateX(${currentX}px)`;

    if (currentX >= maxDrag - 10) {
      isDraggingSlider = false;
      handle.style.transform = `translateX(${maxDrag}px)`;
      sounds.twrpSwipe();
      sounds.vibrate(60);
      executeTwrpFlash(selectedTwrpFile);
    }
  };

  const onDragEnd = () => {
    if (!isDraggingSlider) return;
    isDraggingSlider = false;
    handle.style.transition = 'transform 0.2s ease';
    handle.style.transform = 'translateX(0px)';
  };

  handle.addEventListener('mousedown', onDragStart);
  handle.addEventListener('touchstart', onDragStart, { passive: true });
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('touchmove', onDragMove, { passive: true });
  window.addEventListener('mouseup', onDragEnd);
  window.addEventListener('touchend', onDragEnd);
}

function resetSwipeHandle() {
  UI.swipeHandle.style.transition = 'none';
  UI.swipeHandle.style.transform = 'translateX(0px)';
}

function executeTwrpFlash(file) {
  openTwrpPage('log');
  UI.twrpRebootAfterFlash.style.display = 'none';

  let logs = [];
  if (file === 'Magisk_v27.0.zip') {
    logs = [
      `Installing zip file '/sdcard/${file}'`,
      'Checking for Digest file...',
      '************************',
      ' Magisk v27.0 Installer ',
      '************************',
      '- Mounting /system, /vendor',
      '- Target: arm64-v8a',
      '- Patching ramdisk in boot.img...',
      '- Flashing patched boot partition...',
      '- Installing Magisk su binaries...',
      'Done! Magisk Superuser installed.'
    ];
    GameState.isRooted = true;
    checkQuest('root');
  } else if (file === 'PlayIntegrityFix_v16.zip') {
    logs = [
      `Installing zip file '/sdcard/${file}'`,
      'Play Integrity Fix by chiteroman',
      '- Injecting keystore hook...',
      '- Bypassing SafetyNet hardware attestation...',
      '- Spoofing Pixel 8 Pro build fingerprint...',
      'Done! SafetyNet & Play Integrity passed.'
    ];
    GameState.playIntegrityModule = true;
    checkQuest('bank');
  } else if (file.startsWith('PixelOS')) {
    logs = [
      `Installing zip file '/sdcard/${file}'`,
      'Target: PixelOS Android 14 (vayu)',
      '- Unpacking system.new.dat.br...',
      '- Patching system image...',
      '- Flashing vendor & product partitions...',
      '- Installing Google Apps (GApps)...',
      '- Updating partition tables...',
      'Script succeeded: result was [1.000000]'
    ];
    GameState.rom = 'pixel';
    GameState.romCleanInstalled = false; // Requires format data to avoid bootloop!
    checkQuest('flash_rom');
  } else if (file.startsWith('LineageOS')) {
    logs = [
      `Installing zip file '/sdcard/${file}'`,
      'Target: LineageOS 21.0 (AOSP 14)',
      '- Verifying system signatures...',
      '- Flashing payload.bin partitions...',
      '- Installing LineageOS Trust HAL...',
      '- Removing telemetry bloatware...',
      'Installation complete!'
    ];
    GameState.rom = 'lineage';
    GameState.romCleanInstalled = false;
    checkQuest('flash_rom');
  } else if (file.startsWith('crDroid')) {
    logs = [
      `Installing zip file '/sdcard/${file}'`,
      'Target: crDroid v10.5 Gaming Edition',
      '- Applying gaming thermal governor...',
      '- Enabling 120Hz display refresh rate mod...',
      '- Flashing crDroid kernel with overclock support...',
      '- Done! Maximum FPS unlocked.'
    ];
    GameState.rom = 'crdroid';
    GameState.romCleanInstalled = false;
    checkQuest('flash_rom');
  } else {
    logs = [
      `Installing file '/sdcard/${file}'`,
      'Processing archive...',
      'Flashing partitions...',
      'Success.'
    ];
  }

  runTwrpConsole(logs, () => {
    UI.twrpRebootAfterFlash.style.display = 'block';
  });
}

function runTwrpConsole(lines, callback) {
  UI.twrpConsole.textContent = '';
  let i = 0;
  function nextLine() {
    if (i < lines.length) {
      UI.twrpConsole.textContent += lines[i] + '\n';
      UI.twrpConsole.scrollTop = UI.twrpConsole.scrollHeight;
      i++;
      setTimeout(nextLine, 120);
    } else {
      if (callback) callback();
    }
  }
  nextLine();
}

// --- OPERATING SYSTEM DESKTOP & APPS ---
function updateOsUI() {
  const os = GameState.rom || 'stock';
  const osEl = UI.screens.OS;

  osEl.className = 'screen-state active';
  if (os === 'pixel') osEl.classList.add('theme-pixel');
  else if (os === 'lineage') osEl.classList.add('theme-lineage');
  else if (os === 'crdroid') osEl.classList.add('theme-crdroid');
  else osEl.classList.add('theme-hyperos');

  UI.osRootIndicator.classList.toggle('visible', GameState.isRooted);

  const osTitles = {
    stock: 'Xiaomi HyperOS / MIUI',
    pixel: 'Google Pixel 8 Pro UI',
    lineage: 'LineageOS 21 AOSP',
    crdroid: 'crDroid 10.5 Gaming'
  };
  document.getElementById('os-widget-date').textContent = osTitles[os];

  renderOsApps();
}

function renderOsApps() {
  const grid = UI.osAppsGrid;
  grid.innerHTML = '';

  const apps = [
    { id: 'settings', name: 'Настройки', icon: '⚙️', bg: '#475569' },
    { id: 'termux', name: 'Termux', icon: '💻', bg: '#000000' },
    { id: 'bank', name: 'СберБанк', icon: '🏦', bg: '#16a34a' },
    { id: 'antutu', name: 'AnTuTu', icon: '🔥', bg: '#dc2626' },
    { id: 'camera', name: 'Камера', icon: '📷', bg: '#2563eb' }
  ];

  if (GameState.isRooted) {
    apps.splice(2, 0, { id: 'magisk', name: 'Magisk', icon: '🪄', bg: '#0284c7' });
  }

  if (GameState.rom === 'crdroid') {
    apps.push({ id: 'crdroid-mods', name: 'crDroid Hub', icon: '⚡', bg: '#7c3aed' });
  }

  apps.forEach(app => {
    const item = document.createElement('div');
    item.className = 'app-icon-item';
    item.innerHTML = `
      <div class="app-badge" style="background:${app.bg}">${app.icon}</div>
      <span class="app-name">${app.name}</span>
    `;
    item.addEventListener('click', () => {
      sounds.click();
      openInOsApp(app.id);
    });
    grid.appendChild(item);
  });
}

function bindInOsNavigation() {
  UI.btnCloseOsModal.addEventListener('click', () => {
    sounds.click();
    UI.inOsModal.classList.remove('active');
  });

  document.querySelectorAll('.dock-app').forEach(dockBtn => {
    dockBtn.addEventListener('click', () => {
      sounds.click();
      const appType = dockBtn.dataset.app;
      if (appType === 'settings') openInOsApp('settings');
      else if (appType === 'terminal') openInOsApp('termux');
      else if (appType === 'browser') alert('Браузер: Посетите 4PDA.to для поиска новых модулей Magisk!');
      else if (appType === 'phone-dialer') alert('Звонилка: Инженерное меню *#*#6484#*#* доступно.');
    });
  });

  document.getElementById('nav-back').addEventListener('click', () => {
    sounds.click();
    UI.inOsModal.classList.remove('active');
  });
  document.getElementById('nav-home').addEventListener('click', () => {
    sounds.click();
    UI.inOsModal.classList.remove('active');
  });
  document.getElementById('nav-recent').addEventListener('click', () => {
    sounds.click();
    sounds.vibrate(20);
  });
}

// --- INTERACTIVE IN-OS APPS ---
function openInOsApp(appId) {
  UI.inOsModal.classList.add('active');
  const body = UI.inOsModalBody;
  body.innerHTML = '';

  if (appId === 'settings') {
    UI.inOsModalTitle.textContent = 'О телефоне';
    renderSettingsApp(body);
  } else if (appId === 'termux') {
    UI.inOsModalTitle.textContent = 'Termux (Linux CLI)';
    renderTermuxApp(body);
  } else if (appId === 'magisk') {
    UI.inOsModalTitle.textContent = 'Magisk Manager v27.0';
    renderMagiskApp(body);
  } else if (appId === 'bank') {
    UI.inOsModalTitle.textContent = 'Банк Онлайн (SafetyNet Check)';
    renderBankApp(body);
  } else if (appId === 'antutu') {
    UI.inOsModalTitle.textContent = 'AnTuTu Benchmark v10';
    renderAntutuApp(body);
  } else if (appId === 'camera') {
    UI.inOsModalTitle.textContent = 'Камера (48 MP HDR)';
    body.innerHTML = `
      <div style="text-align:center; padding:20px;">
        <div style="width:100%; height:180px; background:#111; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#555; border:1px solid #333;">
          📷 [Видоискатель камеры 48MP Sony IMX582]
        </div>
        <p style="margin-top:14px; font-size:11px; color:#aaa;">GCamera Mod активен. Качество снимков: RAW 10-bit.</p>
      </div>
    `;
  } else if (appId === 'crdroid-mods') {
    UI.inOsModalTitle.textContent = 'crDroid Настройки';
    body.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div style="background:#202838; padding:10px; border-radius:8px;">
          <b>🎮 Game Space</b>
          <p style="color:#aaa; font-size:11px;">Частота обновления: 120 Hz (Принудительно)</p>
        </div>
        <div style="background:#202838; padding:10px; border-radius:8px;">
          <b>⚡ Профиль CPU</b>
          <p style="color:#00e676; font-size:11px;">Режим: Performance / Overclock (2.96 GHz)</p>
        </div>
      </div>
    `;
  }
}

function renderSettingsApp(container) {
  const osNames = {
    stock: 'HyperOS 1.0.4.0 (Официальная)',
    pixel: 'PixelOS 14 (Pixel Experience)',
    lineage: 'LineageOS 21 (Android 14)',
    crdroid: 'crDroid 10.5 (Gaming Edition)'
  };

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div style="background:#1e2535; padding:12px; border-radius:8px;">
        <div style="font-size:11px; color:#888;">Устройство</div>
        <b style="font-size:14px;">${GameState.model}</b>
      </div>
      <div style="background:#1e2535; padding:12px; border-radius:8px;">
        <div style="font-size:11px; color:#888;">Версия ОС</div>
        <b>${osNames[GameState.rom || 'stock']}</b>
      </div>
      <div style="background:#1e2535; padding:12px; border-radius:8px;">
        <div style="font-size:11px; color:#888;">Ядро (Kernel)</div>
        <code>Linux 4.14.336-vayu-perf #1 SMP PREEMPT</code>
      </div>
      <div style="background:#1e2535; padding:12px; border-radius:8px;">
        <div style="font-size:11px; color:#888;">Статус загрузчика</div>
        <span style="color:${GameState.bootloaderUnlocked ? '#ff9900' : '#00e676'}; font-weight:bold;">
          ${GameState.bootloaderUnlocked ? 'Разблокирован (Unlocked)' : 'Заблокирован (Locked)'}
        </span>
      </div>
      <div id="settings-build-tile" style="background:#1e2535; padding:12px; border-radius:8px; cursor:pointer;">
        <div style="font-size:11px; color:#888;">Номер сборки (Тапните 7 раз)</div>
        <b id="build-number-text">UQ1A.240205.002 (4PDA-Mod)</b>
        <div id="build-tap-hint" style="font-size:10px; color:#00f2fe; margin-top:4px;">
          ${GameState.developerModeUnlocked ? 'Режим разработчика уже включен!' : 'Тапните, чтобы включить режим разработчика'}
        </div>
      </div>
    </div>
  `;

  document.getElementById('settings-build-tile').addEventListener('click', () => {
    sounds.click();
    if (GameState.developerModeUnlocked) {
      alert('Вы уже являетесь разработчиком!');
      return;
    }
    GameState.buildTapCount++;
    sounds.vibrate(30);
    const remaining = 7 - GameState.buildTapCount;
    if (remaining > 0) {
      document.getElementById('build-tap-hint').textContent = `Осталось шагов: ${remaining}`;
    } else {
      GameState.developerModeUnlocked = true;
      sounds.bootChime();
      sounds.vibrate(100);
      document.getElementById('build-tap-hint').textContent = '🎉 Вы стали разработчиком! Отладка по USB активна.';
      alert('Поздравляем! Режим разработчика разблокирован!');
    }
  });
}

function renderTermuxApp(container) {
  let isSuSession = false;
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%;">
      <div id="termux-output" style="flex:1; background:#000; color:#39ff14; font-family:monospace; font-size:11px; padding:10px; border-radius:6px; overflow-y:auto; white-space:pre-wrap; margin-bottom:8px; height:220px;">
Welcome to Termux!
Wiki:            https://wiki.termux.com
Community forum: https://termux.com/community

Type 'help' or 'su' to request root access.
      </div>
      <div style="display:flex; gap:6px;">
        <span id="termux-prompt" style="font-family:monospace; font-size:11px; color:#00f2fe; align-self:center;">$</span>
        <input type="text" id="termux-input" style="flex:1; background:#111; border:1px solid #333; color:#fff; font-family:monospace; font-size:11px; padding:6px; border-radius:4px;" placeholder="su, uname -a, ls, reboot" autocomplete="off">
        <button id="termux-send" style="background:#238636; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-size:11px; cursor:pointer;">↵</button>
      </div>
      <div style="display:flex; gap:4px; margin-top:6px; overflow-x:auto;">
        <button class="qc-btn" data-termux="su">su</button>
        <button class="qc-btn" data-termux="uname -a">uname -a</button>
        <button class="qc-btn" data-termux="getprop ro.product.model">getprop</button>
        <button class="qc-btn" data-termux="id">id</button>
        <button class="qc-btn" data-termux="reboot">reboot</button>
      </div>
    </div>
  `;

  const output = document.getElementById('termux-output');
  const input = document.getElementById('termux-input');
  const prompt = document.getElementById('termux-prompt');

  const executeTermux = (cmd) => {
    cmd = cmd.trim();
    if (!cmd) return;
    output.textContent += `\n${prompt.textContent} ${cmd}\n`;
    sounds.click();

    if (cmd === 'clear') {
      output.textContent = '';
    } else if (cmd === 'su') {
      if (!GameState.isRooted) {
        sounds.error();
        output.textContent += 'Permission denied: no su binary found. Flash Magisk in TWRP!\n';
      } else {
        triggerSuDialog(() => {
          isSuSession = true;
          prompt.textContent = '#';
          prompt.style.color = '#ff3366';
          output.textContent += 'Superuser access granted via Magisk su binary!\n';
          sounds.bootChime();
        });
      }
    } else if (cmd === 'id') {
      output.textContent += isSuSession ? 'uid=0(root) gid=0(root) groups=0(root),context=u:r:magisk:s0\n' : 'uid=10148(u0_a148) gid=10148(u0_a148)\n';
    } else if (cmd === 'uname -a') {
      output.textContent += 'Linux localhost 4.14.336-vayu-perf #1 SMP PREEMPT aarch64 Android\n';
    } else if (cmd.startsWith('getprop')) {
      output.textContent += `[ro.product.model]: [${GameState.model}]\n[ro.build.version.release]: [14]\n`;
    } else if (cmd === 'reboot') {
      UI.inOsModal.classList.remove('active');
      bootDevice();
    } else if (cmd === 'help') {
      output.textContent += 'Available: su, id, uname -a, getprop, ls, reboot, clear\n';
    } else {
      output.textContent += `sh: ${cmd}: command not found\n`;
    }

    output.scrollTop = output.scrollHeight;
    input.value = '';
  };

  document.getElementById('termux-send').addEventListener('click', () => executeTermux(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeTermux(input.value);
  });

  container.querySelectorAll('.qc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      executeTermux(btn.dataset.termux);
    });
  });
}

function triggerSuDialog(onGranted) {
  UI.suDialog.style.display = 'block';
  sounds.vibrate(60);
  let timeLeft = 10;
  const interval = setInterval(() => {
    timeLeft--;
    UI.suTimer.textContent = `Таймаут: ${timeLeft}с`;
    if (timeLeft <= 0) {
      clearInterval(interval);
      UI.suDialog.style.display = 'none';
    }
  }, 1000);

  UI.btnSuGrant.onclick = () => {
    clearInterval(interval);
    UI.suDialog.style.display = 'none';
    sounds.click();
    onGranted();
  };

  UI.btnSuDeny.onclick = () => {
    clearInterval(interval);
    UI.suDialog.style.display = 'none';
    sounds.click();
  };
}

function renderMagiskApp(container) {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div style="background:#1e2638; border:1px solid #2e3b56; border-radius:10px; padding:14px; text-align:center;">
        <div style="font-size:32px;">🪄</div>
        <b style="font-size:15px; display:block; margin-top:4px;">Magisk v27.0</b>
        <span style="color:#00e676; font-size:11px;">Установлен (Zygisk доступен)</span>
      </div>

      <div style="background:#1e2638; border-radius:10px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <b>Zygisk</b>
          <div style="font-size:10px; color:#888;">Запуск модулей в системном процессе Zygote</div>
        </div>
        <input type="checkbox" id="toggle-zygisk" ${GameState.magiskZygisk ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;">
      </div>

      <div style="background:#1e2638; border-radius:10px; padding:12px;">
        <b>Установленные модули:</b>
        <div id="magisk-modules-list" style="margin-top:8px; display:flex; flex-direction:column; gap:6px;">
          ${GameState.playIntegrityModule ? `
            <div style="background:#28334a; padding:8px; border-radius:6px; font-size:11px; display:flex; justify-content:space-between;">
              <span>🛡️ Play Integrity Fix v16.0</span>
              <span style="color:#00e676;">Активен</span>
            </div>
          ` : `
            <div style="color:#888; font-size:11px;">(Нет активных модулей. Прошейте PlayIntegrityFix_v16.zip в TWRP!)</div>
          `}
        </div>
      </div>
    </div>
  `;

  document.getElementById('toggle-zygisk').addEventListener('change', (e) => {
    sounds.click();
    GameState.magiskZygisk = e.target.checked;
    sounds.vibrate(20);
    alert(GameState.magiskZygisk ? 'Zygisk включен! Требуется перезагрузка для активации хуков.' : 'Zygisk отключен.');
  });
}

function renderBankApp(container) {
  const isSafetyNetPassed = (!GameState.bootloaderUnlocked && !GameState.isRooted) || GameState.playIntegrityModule;

  container.innerHTML = `
    <div style="text-align:center; padding:14px;">
      <div style="font-size:42px; margin-bottom:8px;">🏦</div>
      <h3 style="font-size:16px;">СберБанк Онлайн</h3>
      <p style="font-size:11px; color:#888; margin-top:2px;">Проверка безопасности Play Integrity API...</p>

      <div id="bank-result" style="margin-top:16px; padding:14px; border-radius:10px; text-align:left;">
        <div class="boot-spinner" style="margin:10px auto;"></div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const resBox = document.getElementById('bank-result');
    if (!resBox) return;

    if (isSafetyNetPassed) {
      sounds.bootChime();
      resBox.style.background = '#064e3b';
      resBox.style.border = '1px solid #059669';
      resBox.innerHTML = `
        <b style="color:#34d399; font-size:13px;">✅ Проверка целостности пройдена!</b>
        <p style="font-size:11px; margin-top:6px; color:#d1fae5;">
          • MEETS_DEVICE_INTEGRITY: true<br>
          • MEETS_BASIC_INTEGRITY: true<br>
          • Рут и разблокировка скрыты через Play Integrity Fix!
        </p>
        <div style="margin-top:12px; background:rgba(0,0,0,0.3); padding:10px; border-radius:6px; text-align:center;">
          <span style="font-size:11px; color:#aaa;">Баланс счета:</span>
          <div style="font-size:20px; font-weight:bold; color:#10b981;">1 337 228 ₽</div>
        </div>
      `;
      checkQuest('bank');
    } else {
      sounds.error();
      resBox.style.background = '#450a0a';
      resBox.style.border = '1px solid #dc2626';
      resBox.innerHTML = `
        <b style="color:#f87171; font-size:13px;">❌ Вход заблокирован (Угроза безопасности)!</b>
        <p style="font-size:11px; margin-top:6px; color:#fecaca;">
          Обнаружен Root-доступ или разблокированный Bootloader!<br>
          Play Integrity: FAILED (NO_INTEGRITY)<br><br>
          <b>Как исправить:</b> Установите модуль <code>PlayIntegrityFix_v16.zip</code> в TWRP!
        </p>
      `;
    }
  }, 1000);
}

function renderAntutuApp(container) {
  container.innerHTML = `
    <div style="text-align:center; padding:10px;">
      <div style="font-size:36px;">🔥</div>
      <h3>AnTuTu Benchmark</h3>
      <p style="font-size:11px; color:#888;">Тестирование производительности CPU / GPU / RAM</p>

      <div style="margin:20px 0;">
        <div id="antutu-score-display" style="font-size:38px; font-weight:900; color:#ff9900;">
          ${GameState.antutuScore > 0 ? GameState.antutuScore.toLocaleString() : '--- ---'}
        </div>
        <span style="font-size:11px; color:#888;">Баллов производительности</span>
      </div>

      <button id="btn-run-antutu" class="twrp-action-btn" style="background:#dc2626; border-color:#ef4444; width:80%;">
        Начать тестирование
      </button>

      <div id="antutu-progress-wrap" style="display:none; margin-top:16px;">
        <div class="boot-spinner" style="margin:auto;"></div>
        <div id="antutu-stage" style="font-size:11px; color:#aaa; margin-top:8px;">Тестирование 3D Vulkan...</div>
      </div>
    </div>
  `;

  document.getElementById('btn-run-antutu').addEventListener('click', () => {
    sounds.click();
    document.getElementById('btn-run-antutu').style.display = 'none';
    const wrap = document.getElementById('antutu-progress-wrap');
    wrap.style.display = 'block';

    const stages = ['Тест CPU Multi-Core...', '3D Vulkan Benchmark...', 'Тест RAM / UFS 3.1...', 'Вычисление UX...'];
    let idx = 0;
    const stageEl = document.getElementById('antutu-stage');

    const intv = setInterval(() => {
      if (idx < stages.length) {
        stageEl.textContent = stages[idx];
        sounds.beep(400 + idx * 100, 0.05);
        idx++;
      } else {
        clearInterval(intv);
        wrap.style.display = 'none';
        document.getElementById('btn-run-antutu').style.display = 'inline-block';
        document.getElementById('btn-run-antutu').textContent = 'Повторить тест';

        let baseScore = 560000;
        if (GameState.rom === 'pixel') baseScore = 650000;
        if (GameState.rom === 'lineage') baseScore = 720000;
        if (GameState.rom === 'crdroid') {
          baseScore = 980000;
          if (GameState.isRooted) baseScore = 1145820;
        }

        GameState.antutuScore = baseScore + Math.floor(Math.random() * 8000);
        document.getElementById('antutu-score-display').textContent = GameState.antutuScore.toLocaleString();
        sounds.bootChime();
        sounds.vibrate(80);

        if (GameState.antutuScore > 1000000) {
          checkQuest('crdroid_oc');
          alert(`🔥 Рекорд! ${GameState.antutuScore.toLocaleString()} баллов! Процессор разогнан на crDroid!`);
        }
      }
    }, 700);
  });
}

// --- PC FASTBOOT / ADB CONSOLE ---
function bindPcTerminal() {
  const sendCmd = () => {
    const val = UI.pcInput.value.trim();
    if (!val) return;
    executePcCommand(val);
    UI.pcInput.value = '';
  };

  UI.pcSendBtn.addEventListener('click', sendCmd);
  UI.pcInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendCmd();
  });

  document.querySelectorAll('.qc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.cmd) {
        executePcCommand(btn.dataset.cmd);
      }
    });
  });
}

function termLog(text, type = 'info') {
  const p = document.createElement('p');
  p.className = `term-line ${type}`;
  p.textContent = text;
  UI.pcLog.appendChild(p);
  UI.pcLog.scrollTop = UI.pcLog.scrollHeight;
}

function executePcCommand(cmd) {
  termLog(`C:\\platform-tools> ${cmd}`, 'cmd');
  sounds.click();

  if (!GameState.usbConnected) {
    sounds.error();
    termLog('error: device not found (USB кабель не подключен к ПК!)', 'error');
    return;
  }

  const parts = cmd.split(' ');
  const tool = parts[0].toLowerCase();
  const sub = parts[1] ? parts[1].toLowerCase() : '';
  const arg = parts[2] ? parts[2].toLowerCase() : '';

  if (tool === 'help') {
    termLog('--- Доступные команды прошивки ---', 'info');
    termLog('fastboot devices - список устройств в режиме fastboot', 'info');
    termLog('fastboot oem unlock - разблокировка загрузчика (Bootloader)', 'info');
    termLog('fastboot flash recovery <файл.img> - прошивка Recovery (TWRP)', 'info');
    termLog('fastboot reboot [recovery|bootloader] - перезагрузка', 'info');
    termLog('adb devices - список устройств в Android/TWRP', 'info');
    termLog('adb push <файл> /sdcard/ - копирование файла в память телефона', 'info');
    termLog('adb reboot [recovery|bootloader] - перезагрузка устройства', 'info');
    termLog('cls / clear - очистить консоль', 'info');
    return;
  }

  if (tool === 'cls' || tool === 'clear') {
    UI.pcLog.innerHTML = '';
    return;
  }

  // FASTBOOT COMMANDS
  if (tool === 'fastboot') {
    if (GameState.screenState !== 'FASTBOOT') {
      sounds.error();
      termLog('< waiting for any device > (Переведите телефон в режим Fastboot: Power + Vol-)', 'warning');
      return;
    }

    if (sub === 'devices') {
      termLog(`${GameState.serial}\tfastboot`, 'success');
    } else if (sub === 'oem' && arg === 'unlock') {
      sounds.bootChime();
      GameState.bootloaderUnlocked = true;
      termLog('...', 'info');
      termLog('(bootloader) Unlocking bootloader...', 'warning');
      termLog('(bootloader) Erasing userdata partition (Data wiped)...', 'warning');
      termLog('OKAY [  3.412s]', 'success');
      termLog('finished. total time: 3.412s', 'success');
      termLog('Загрузчик успешно разблокирован! Теперь можно шить кастомные recovery и roms.', 'info');
      setScreenState('FASTBOOT');
      checkQuest('unlock');
    } else if (sub === 'flash') {
      if (arg === 'recovery') {
        if (!GameState.bootloaderUnlocked) {
          sounds.error();
          termLog('FAILED (remote: Device is locked. Cannot flash unauthorized partitions!)', 'error');
          termLog('Подсказка: Сначала выполните fastboot oem unlock!', 'warning');
          return;
        }
        termLog(`Sending 'recovery' (65536 KB)...`, 'info');
        termLog('OKAY [  1.210s]', 'success');
        termLog(`Writing 'recovery'...`, 'info');
        termLog('OKAY [  0.840s]', 'success');
        GameState.recovery = 'twrp';
        termLog('finished. TWRP Recovery успешно прошит в раздел recovery!', 'success');
        checkQuest('twrp');
      } else {
        termLog(`fastboot flash: неизвестный раздел [${arg}]`, 'error');
      }
    } else if (sub === 'reboot') {
      if (arg === 'recovery') {
        termLog('Rebooting into recovery...', 'info');
        bootToRecovery();
      } else if (arg === 'bootloader') {
        termLog('Rebooting into bootloader...', 'info');
        bootToFastboot();
      } else {
        termLog('Rebooting into system...', 'info');
        bootDevice();
      }
    } else {
      termLog(`fastboot: неизвестная команда [${sub}]. Введите help.`, 'error');
    }
    return;
  }

  // ADB COMMANDS
  if (tool === 'adb') {
    if (GameState.screenState !== 'OS' && GameState.screenState !== 'TWRP') {
      sounds.error();
      termLog('error: device offline (Устройство должно быть включено в OS или TWRP)', 'warning');
      return;
    }

    if (sub === 'devices') {
      termLog(`List of devices attached\n${GameState.serial}\tdevice`, 'success');
    } else if (sub === 'push') {
      const fileName = parts[2] || 'files';
      termLog(`Pushing ${fileName} to /sdcard/...`, 'info');
      GameState.pcDownloads.forEach(f => GameState.phoneStorage.add(f));
      termLog('100% [==================================>]', 'success');
      termLog('All files pushed to /sdcard/ successfully.', 'success');
    } else if (sub === 'reboot') {
      if (arg === 'recovery') bootToRecovery();
      else if (arg === 'bootloader') bootToFastboot();
      else bootDevice();
    } else {
      termLog(`adb: команда [${sub}] не поддерживается. Введите help.`, 'error');
    }
  }
}

// --- 4PDA FORUM DOWNLOADS ---
function bindForumDownloads() {
  document.querySelectorAll('.btn-dl').forEach(btn => {
    btn.addEventListener('click', () => {
      const file = btn.dataset.file;
      sounds.click();
      GameState.pcDownloads.add(file);
      GameState.phoneStorage.add(file);
      btn.textContent = '✓ Скачано';
      btn.classList.add('downloaded');
      termLog(`4PDA: Загружен файл [${file}] в C:\\Firmware\\ и /sdcard/`, 'info');
    });
  });
}

// --- MI FLASH TOOL ---
function bindMiFlash() {
  UI.btnMfRefresh.addEventListener('click', () => {
    sounds.click();
    updateMiFlashDevice();
  });

  UI.btnMfFlash.addEventListener('click', () => {
    sounds.click();
    if (!GameState.usbConnected || GameState.screenState !== 'FASTBOOT') {
      sounds.error();
      alert('Mi Flash: Устройство не обнаружено в режиме Fastboot! Подключите USB и переведите телефон в Fastboot.');
      return;
    }

    UI.mfStatus.textContent = 'Flashing...';
    UI.mfResult.textContent = 'In progress';
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      UI.mfBar.style.width = `${progress}%`;
      sounds.beep(700 + progress * 5, 0.03);

      if (progress >= 100) {
        clearInterval(interval);
        UI.mfStatus.textContent = 'Success';
        UI.mfResult.textContent = 'SUCCESS';
        sounds.bootChime();
        sounds.vibrate(80);

        GameState.rom = 'stock';
        GameState.romCleanInstalled = true;
        GameState.recovery = 'stock';
        GameState.isRooted = false;
        GameState.playIntegrityModule = false;

        const isLockRadio = document.querySelector('input[name="mf-type"]:checked').value === 'lock';
        if (isLockRadio) {
          GameState.bootloaderUnlocked = false;
        }

        termLog('Mi Flash: Официальная прошивка HyperOS Stock успешно установлена!', 'success');
        bootDevice();
      }
    }, 250);
  });
}

function updateMiFlashDevice() {
  if (GameState.usbConnected && GameState.screenState === 'FASTBOOT') {
    UI.mfDeviceId.textContent = `${GameState.serial} (fastboot)`;
  } else {
    UI.mfDeviceId.textContent = 'Не подключен';
  }
}

// --- QUESTS PROGRESSION SYSTEM ---
function renderQuests() {
  UI.questsList.innerHTML = '';
  GameState.quests.forEach(q => {
    const card = document.createElement('div');
    card.className = `quest-card ${q.done ? 'completed' : ''}`;
    card.innerHTML = `
      <div class="quest-icon">${q.done ? '✅' : '🎯'}</div>
      <div class="quest-info">
        <div class="quest-title">${q.title}</div>
        <div class="quest-desc">${q.desc}</div>
        <div class="quest-reward">+${q.exp} EXP Репутации 4PDA</div>
      </div>
      <div class="quest-status ${q.done ? 'done' : ''}">${q.done ? 'Выполнено' : 'В процессе'}</div>
    `;
    UI.questsList.appendChild(card);
  });
}

function checkQuest(questId) {
  const q = GameState.quests.find(item => item.id === questId);
  if (q && !q.done) {
    q.done = true;
    sounds.bootChime();
    sounds.vibrate(100);
    renderQuests();
  }
}

window.addEventListener('DOMContentLoaded', initApp);
