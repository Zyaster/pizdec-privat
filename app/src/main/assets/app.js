/**
 * AndroFlash: ROM Flasher & Root Simulator (4PDA Edition)
 * Huge Content Expansion: KernelSU, OrangeFox, Custom Kernels, 6 Distinct OSes, ViPER4Android, LSPosed & Gaming 120 FPS.
 */

// --- Audio Synthesizer (Realistic Haptic & Chimes via Web Audio API) ---
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
    this.beep(320, 0.018, 'sine', 0.08);
  }
  bootChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.beep(freq, 0.28, 'sine', 0.12), idx * 110);
      });
    } catch (e) {}
  }
  fastbootTone() {
    this.beep(440, 0.06, 'sawtooth', 0.08);
    setTimeout(() => this.beep(880, 0.1, 'sine', 0.1), 70);
  }
  swipeTone() {
    this.beep(520, 0.1, 'sine', 0.12);
    setTimeout(() => this.beep(784, 0.18, 'sine', 0.12), 100);
  }
  errorTone() {
    this.beep(180, 0.2, 'sawtooth', 0.18);
    setTimeout(() => this.beep(130, 0.28, 'sawtooth', 0.18), 120);
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

// --- Complete Global Simulation State ---
const GameState = {
  model: 'Poco X3 Pro (vayu)',
  serial: 'e7c8491a',
  battery: 98,
  usbConnected: true,
  bootloaderUnlocked: false,

  // Recovery
  recoveryType: 'twrp', // 'twrp' | 'orangefox'
  recoveryInstalled: true,

  // Kernel & Modern Root Architecture
  kernel: 'stock', // 'stock' | 'ngk_ksu' | 'stormbreaker'
  kernelVersion: 'Linux 4.14.336-stock',
  ksuWorking: false, // True if kernel has KernelSU hook
  ksuSuperuserApps: new Set(['termux']),
  ksuUnmountRoot: new Set(['bank']), // Signature KernelSU feature: root unmounted from banking apps!
  magiskInstalled: false,
  magiskZygisk: false,

  // Active Modules
  modules: new Set(),

  // ROM & System
  rom: 'stock', // 'stock' | 'pixel' | 'lineage' | 'crdroid' | 'evolution' | 'kali' | null
  romCleanInstalled: true, // Dirty flash without format data triggers Qualcomm CrashDump!
  screenState: 'OS', // 'OFF' | 'FASTBOOT' | 'BOOTING' | 'CRASHDUMP' | 'RECOVERY' | 'OS'

  // Display & Performance
  displayRefreshRate: 120, // 60 or 120 Hz
  antutuScore: 0,
  developerUnlocked: false,
  buildTapCount: 0,
  selinuxMode: 'enforcing', // 'enforcing' | 'permissive'
  usbDebugging: true,
  perfProfile: 'balanced', // 'balanced' | 'performance' | 'powersave'
  privateDns: 'dns.adguard.com',
  darkMode: true,
  displayColorMode: 'dci_p3', // 'dci_p3' | 'srgb'
  forcePeakRefreshRate: false,
  dpiScale: 392,
  animationScale: '1.0x',
  forceMsaa: false,

  // Modder Career & 4PDA Community
  modderReputation: 245,
  modderRank: 'Куратор темы Poco X3 Pro',
  solvedForumThreads: new Set(),
  solvedOrders: new Set(),

  // Hardware Overclocking (FKM)
  cpuFreq: 2.96, // 1.80 - 3.20 GHz
  gpuFreq: 675, // 675 - 825 MHz
  cpuGovernor: 'schedutil', // 'performance', 'powersave', 'schedutil'
  zramSize: 3, // GB
  thermalProfile: 'gaming', // 'stock', 'gaming', 'extreme'
  cpuTemp: 34.2, // degrees C

  // Virtual Filesystem & build.prop for MT Manager & Termux
  buildProp: {
    'ro.product.brand': 'POCO',
    'ro.product.model': 'Poco X3 Pro',
    'ro.product.device': 'vayu',
    'ro.build.version.release': '14',
    'ro.build.display.id': 'UQ1A.240205.002.A1',
    'debug.sf.fps': '120',
    'persist.sys.unlimited_gphotos': 'true'
  },

  // Downloads & Storage
  pcDownloads: new Set([
    'PixelOS_vayu_A14.zip',
    'NGK_KernelSU_v5.2.zip',
    'KernelSU_Manager.apk',
    'PlayIntegrityFix_v16.zip',
    'twrp_3.7.0.img'
  ]),
  phoneStorage: new Set(),

  // Quests & Progression
  quests: [
    { id: 'usb', title: '🔌 Подключение к ПК', desc: 'Убедитесь, что USB кабель подключен к ПК', exp: 50, done: true },
    { id: 'unlock', title: '🔓 Разблокировка загрузчика', desc: 'Перейдите в Fastboot и введите fastboot oem unlock', exp: 150, done: false },
    { id: 'recovery', title: '🦊 Прошивка рекавери', desc: 'Прошейте TWRP или OrangeFox через Fastboot', exp: 200, done: false },
    { id: 'wipe', title: '🧹 Очистка Format Data', desc: 'Сделайте Format Data в рекавери для избежания бутлупа', exp: 150, done: false },
    { id: 'flash_rom', title: '🚀 Установка кастомной ОС', desc: 'Прошейте PixelOS, crDroid, Evolution X или Kali NetHunter', exp: 300, done: false },
    { id: 'ksu_kernel', title: '👑 Установка ядра с KernelSU', desc: 'Прошейте NoGravityKernel или StormBreaker с поддержкой KSU', exp: 350, done: false },
    { id: 'ksu_root', title: '🛡️ Активация прав KernelSU', desc: 'Откройте KernelSU Manager и предоставьте root приложению Termux', exp: 250, done: false },
    { id: 'modules', title: '🧩 Установка модулей Zygisk', desc: 'Установите Play Integrity Fix, Shamiko или ViPER4Android', exp: 200, done: false },
    { id: 'bank', title: '🏦 Обход банковских защит', desc: 'Изолируйте root через KernelSU или активируйте Play Integrity Fix', exp: 300, done: false },
    { id: 'fps120', title: '🎮 Разгон PUBG до 120 FPS', desc: 'Запустите игровой тест на crDroid с разогнанным ядром', exp: 400, done: false },
    { id: 'antutu_record', title: '🔥 Рекорд AnTuTu (1,000,000+)', desc: 'Выбейте миллион очков на StormBreaker Kernel с оверклоком', exp: 500, done: false }
  ]
};

// --- DOM References ---
const UI = {
  screens: {
    OFF: document.getElementById('screen-off'),
    FASTBOOT: document.getElementById('screen-fastboot'),
    BOOTING: document.getElementById('screen-booting'),
    CRASHDUMP: document.getElementById('screen-crashdump'),
    RECOVERY: document.getElementById('screen-recovery'),
    OS: document.getElementById('screen-os')
  },

  // Edge Hardware Controls
  hwPower: document.getElementById('btn-hw-power'),
  hwVolUp: document.getElementById('btn-hw-volup'),
  hwVolDown: document.getElementById('btn-hw-voldown'),

  // Floating PC HUD
  hudPcToggle: document.getElementById('hud-pc-toggle'),
  hudUsbDot: document.getElementById('hud-usb-dot'),
  pcOverlay: document.getElementById('pc-overlay'),
  btnClosePc: document.getElementById('btn-close-pc'),
  pcTabs: document.querySelectorAll('.pc-tab-btn'),
  pcViews: {
    terminal: document.getElementById('tab-terminal'),
    forum: document.getElementById('tab-forum'),
    kernels: document.getElementById('tab-kernels'),
    modules: document.getElementById('tab-modules'),
    miflash: document.getElementById('tab-miflash'),
    quests: document.getElementById('tab-quests')
  },

  // Fastboot
  fbDeviceState: document.getElementById('fb-device-state'),

  // Booting
  bootUnlockedIcon: document.getElementById('boot-unlocked-icon'),
  bootAnimCenter: document.getElementById('boot-anim-center'),

  // Recovery (TWRP / OrangeFox)
  screenRecovery: document.getElementById('screen-recovery'),
  recBrandTitle: document.getElementById('rec-brand-title'),
  recClock: document.getElementById('rec-clock'),
  recPages: {
    main: document.getElementById('rec-page-main'),
    install: document.getElementById('rec-page-install'),
    confirm: document.getElementById('rec-page-confirm'),
    console: document.getElementById('rec-page-console'),
    wipe: document.getElementById('rec-page-wipe'),
    backup: document.getElementById('rec-page-backup'),
    restore: document.getElementById('rec-page-restore'),
    mount: document.getElementById('rec-page-mount'),
    settings: document.getElementById('rec-page-settings'),
    advanced: document.getElementById('rec-page-advanced'),
    reboot: document.getElementById('rec-page-reboot')
  },
  recFileTree: document.getElementById('rec-file-tree'),
  confirmTargetName: document.getElementById('confirm-target-name'),
  confirmFileTitle: document.getElementById('confirm-file-title'),
  recSliderHandle: document.getElementById('rec-slider-handle'),
  recLogConsole: document.getElementById('rec-log-console'),
  btnRecRebootSystem: document.getElementById('btn-rec-reboot-system'),
  btnShowFormatData: document.getElementById('btn-show-format-data'),
  formatDataDialog: document.getElementById('format-data-dialog'),
  formatYesInput: document.getElementById('format-yes-input'),
  btnConfirmFormatData: document.getElementById('btn-confirm-format-data'),
  btnDalvikWipe: document.getElementById('btn-dalvik-wipe'),

  // OS
  osClock: document.getElementById('os-clock'),
  osHeroWidget: document.getElementById('os-hero-widget'),
  pixelSearchBar: document.getElementById('pixel-search-bar'),
  osKsuBadge: document.getElementById('os-ksu-badge'),
  osMagiskBadge: document.getElementById('os-magisk-badge'),
  osFpsBadge: document.getElementById('os-fps-badge'),
  osAppGrid: document.getElementById('os-app-grid'),
  osAppWindow: document.getElementById('os-app-window'),
  appWindowTitle: document.getElementById('app-window-title'),
  appWindowContent: document.getElementById('app-window-content'),
  appWindowBack: document.getElementById('app-window-back'),
  appWindowClose: document.getElementById('app-window-close'),

  // Superuser Dialog
  magiskSuPrompt: document.getElementById('magisk-su-prompt'),
  suPromptTitle: document.getElementById('su-prompt-title'),
  suPromptDesc: document.getElementById('su-prompt-desc'),
  suCountdown: document.getElementById('su-countdown'),
  suBtnGrant: document.getElementById('su-btn-grant'),
  suBtnDeny: document.getElementById('su-btn-deny'),

  // PC Terminal
  pcLog: document.getElementById('pc-terminal-log'),
  pcInput: document.getElementById('pc-terminal-input'),
  pcSend: document.getElementById('pc-terminal-send'),

  // Mi Flash
  mfDeviceName: document.getElementById('mf-device-name'),
  mfProgressBar: document.getElementById('mf-progress-bar'),
  mfStatusText: document.getElementById('mf-status-text'),
  mfResultText: document.getElementById('mf-result-text'),
  btnMfRefresh: document.getElementById('btn-mf-refresh'),
  btnMfFlash: document.getElementById('btn-mf-flash'),

  // Quests
  questsScroll: document.getElementById('quests-scroll')
};

// --- INITIALIZATION ---
function initApp() {
  bindEdgeHardwareKeys();
  bindPcHud();
  bindPcTerminal();
  bindForumDownloads();
  bindMiFlash();
  bindRecovery();
  bindOsNavigation();
  renderQuests();
  updateOsUI();
  setScreenState('OS');

  // Realtime Clocks
  setInterval(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');

    if (UI.osClock) UI.osClock.textContent = timeStr;
    if (UI.recClock) UI.recClock.textContent = timeStr;

    // Update dynamic clock in OS hero widget
    const dynamicTime = document.getElementById('dyn-clock-time');
    if (dynamicTime) dynamicTime.textContent = timeStr;
    const dynH = document.getElementById('dyn-clock-h');
    const dynM = document.getElementById('dyn-clock-m');
    if (dynH && dynM) {
      dynH.textContent = hours;
      dynM.textContent = mins;
    }
  }, 1000);
}

// --- FULLSCREEN SCREEN STATE MACHINE ---
function setScreenState(newState) {
  GameState.screenState = newState;
  Object.keys(UI.screens).forEach(key => {
    if (UI.screens[key]) {
      UI.screens[key].classList.toggle('active', key === newState);
    }
  });

  if (newState === 'FASTBOOT') {
    if (UI.fbDeviceState) {
      UI.fbDeviceState.textContent = GameState.bootloaderUnlocked ? 'unlocked' : 'locked';
      UI.fbDeviceState.className = GameState.bootloaderUnlocked ? 'state-unlocked' : 'state-locked';
    }
  } else if (newState === 'RECOVERY') {
    applyRecoveryTheme();
  } else if (newState === 'OS') {
    updateOsUI();
  }
}

// --- EDGE HARDWARE KEYS & COMBO GESTURES ---
let keyStates = { power: false, volUp: false, volDown: false };
let keyTimer = null;

function bindEdgeHardwareKeys() {
  const attachKey = (btn, keyName) => {
    if (!btn) return;
    const onPress = (e) => {
      e.preventDefault();
      keyStates[keyName] = true;
      btn.classList.add('pressed');
      sounds.click();
      sounds.vibrate(25);
      checkKeyCombos();
    };
    const onRelease = (e) => {
      e.preventDefault();
      keyStates[keyName] = false;
      btn.classList.remove('pressed');
      clearTimeout(keyTimer);
    };

    btn.addEventListener('mousedown', onPress);
    btn.addEventListener('mouseup', onRelease);
    btn.addEventListener('touchstart', onPress, { passive: false });
    btn.addEventListener('touchend', onRelease, { passive: false });
  };

  attachKey(UI.hwPower, 'power');
  attachKey(UI.hwVolUp, 'volUp');
  attachKey(UI.hwVolDown, 'volDown');
}

function checkKeyCombos() {
  clearTimeout(keyTimer);
  keyTimer = setTimeout(() => {
    if (keyStates.power && keyStates.volDown) {
      bootToFastboot();
    } else if (keyStates.power && keyStates.volUp) {
      bootToRecovery();
    } else if (keyStates.power) {
      togglePower();
    }
  }, 450);
}

function togglePower() {
  sounds.vibrate(50);
  bootDevice();
}

function bootToFastboot() {
  sounds.vibrate(80);
  setScreenState('FASTBOOT');
  sounds.fastbootTone();
  termLog('Fastboot: Устройство переведено в Fastboot Mode!', 'info');
  updateMiFlashDevice();
}

function bootToRecovery() {
  sounds.vibrate(80);
  if (GameState.recoveryInstalled) {
    setScreenState('RECOVERY');
    openRecoverySubpage('main');
    sounds.bootChime();
    termLog(`Recovery: Запущен ${GameState.recoveryType === 'orangefox' ? 'OrangeFox Recovery Project R11.1' : 'TeamWin Recovery Project 3.7'}`, 'info');
    checkQuest('recovery');
  } else {
    termLog('Stock Recovery: Кастомное рекавери не установлено! Прошейте twrp_3.7.0.img или orangefox_R11.1.img через Fastboot.', 'warning');
    alert('⚠️ Stock Recovery: У вас не установлено кастомное рекавери!\n\nПрошейте TWRP или OrangeFox через Fastboot:\nfastboot flash recovery twrp_3.7.0.img');
    bootDevice();
  }
}

// Fullscreen Ultra-Realistic Reboot!
function bootDevice() {
  setScreenState('BOOTING');
  sounds.bootChime();

  if (UI.bootUnlockedIcon) {
    UI.bootUnlockedIcon.classList.toggle('visible', GameState.bootloaderUnlocked);
  }

  const center = UI.bootAnimCenter;
  center.innerHTML = '';

  if (GameState.rom === 'pixel') {
    center.innerHTML = `
      <div class="pixel-g-logo">G</div>
      <div class="logo-sub-text">Google Pixel • Android 14</div>
    `;
  } else if (GameState.rom === 'lineage') {
    center.innerHTML = `
      <div class="lineage-arc-logo">◯</div>
      <div class="logo-big-text" style="color:#167c80;">LineageOS</div>
      <div class="logo-sub-text">LineageOS 21 (AOSP)</div>
    `;
  } else if (GameState.rom === 'crdroid') {
    center.innerHTML = `
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#e11d48" stroke="#fb7185" stroke-width="1.5"/></svg>
      <div class="logo-big-text" style="color:#e11d48;">crDroid</div>
      <div class="logo-sub-text" style="color:#ff3366;">GAMING EDITION 120 FPS</div>
    `;
  } else if (GameState.rom === 'evolution') {
    center.innerHTML = `
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      <div class="logo-big-text" style="color:#a855f7;">Evolution X</div>
      <div class="logo-sub-text">Keep Evolving • Android 14</div>
    `;
  } else if (GameState.rom === 'kali') {
    center.innerHTML = `
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" stroke-width="2"><path d="M12 2a10 10 0 0 0-7.07 17.07L12 22l7.07-2.93A10 10 0 0 0 12 2z"/><path d="M9 10h.01M15 10h.01M9 15c1.5 1.5 4.5 1.5 6 0"/></svg>
      <div class="logo-big-text" style="color:#00f2fe;">Kali NetHunter</div>
      <div class="logo-sub-text">Offensive Security Edition</div>
    `;
  } else if (GameState.rom === 'stock') {
    center.innerHTML = `
      <div class="logo-big-text" style="color:#ff9900;">POCO</div>
      <div class="logo-sub-text">Xiaomi HyperOS 1.0</div>
    `;
  } else {
    center.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <div class="logo-big-text" style="color:#ff3366;">NO OS INSTALLED</div>
    `;
  }

  setTimeout(() => {
    if (!GameState.rom) {
      sounds.errorTone();
      setScreenState('FASTBOOT');
      alert('Ошибка: Операционная система не найдена! Прошейте прошивку через рекавери или Mi Flash.');
      return;
    }

    if (!GameState.romCleanInstalled) {
      sounds.errorTone();
      setScreenState('CRASHDUMP');
      termLog('CRASHDUMP: Device bootloop! Kernel panic: Data encryption mismatch. Сделайте Format Data в рекавери!', 'error');
      return;
    }

    setScreenState('OS');
    sounds.vibrate(40);
    checkQuest('flash_rom');
  }, 2400);
}

// --- RECOVERY ENGINE (TWRP & ORANGEFOX HYBRID) ---
let currentRecFile = null;
let isDraggingSlider = false;

function applyRecoveryTheme() {
  const el = UI.screenRecovery;
  if (GameState.recoveryType === 'orangefox') {
    el.className = 'screen-view active theme-orangefox';
    UI.recBrandTitle.textContent = '🦊 OrangeFox Recovery Project R11.1';
  } else {
    el.className = 'screen-view active theme-twrp';
    UI.recBrandTitle.textContent = 'Team Win Recovery Project 3.7.0';
  }
}

let currentRecoveryPage = 'main';

function handleRecoveryBack() {
  sounds.click();
  sounds.vibrate(20);
  if (currentRecoveryPage === 'confirm') {
    openRecoverySubpage('install');
  } else if (currentRecoveryPage === 'console') {
    openRecoverySubpage('main');
  } else if (currentRecoveryPage !== 'main') {
    openRecoverySubpage('main');
  } else {
    // If user is on the main recovery screen, ask if they want to reboot to System
    if (confirm('Перезагрузиться в систему (Reboot System)?')) {
      bootDevice();
    }
  }
}

function openRecoverySubpage(pageName) {
  currentRecoveryPage = pageName;
  Object.keys(UI.recPages).forEach(k => {
    if (UI.recPages[k]) UI.recPages[k].style.display = 'none';
  });
  if (UI.recPages[pageName]) {
    UI.recPages[pageName].style.display = 'flex';
  }
}

function bindRecovery() {
  // Top Back Button in Recovery
  const topBack = document.getElementById('rec-top-back-btn');
  if (topBack) {
    topBack.addEventListener('click', handleRecoveryBack);
  }

  // Bottom Navigation Bar Buttons
  const btmBack = document.getElementById('rec-bottom-back');
  if (btmBack) {
    btmBack.addEventListener('click', handleRecoveryBack);
  }

  const btmHome = document.getElementById('rec-bottom-home');
  if (btmHome) {
    btmHome.addEventListener('click', () => {
      sounds.click();
      sounds.vibrate(20);
      openRecoverySubpage('main');
    });
  }

  const btmConsole = document.getElementById('rec-bottom-console');
  if (btmConsole) {
    btmConsole.addEventListener('click', () => {
      sounds.click();
      sounds.vibrate(20);
      if (currentRecoveryPage === 'console') openRecoverySubpage('main');
      else openRecoverySubpage('console');
    });
  }

  const btmReboot = document.getElementById('rec-bottom-reboot');
  if (btmReboot) {
    btmReboot.addEventListener('click', () => {
      sounds.click();
      sounds.vibrate(20);
      openRecoverySubpage('reboot');
    });
  }

  // Main 8 tiles
  document.querySelectorAll('.rec-tile[data-action]').forEach(tile => {
    tile.addEventListener('click', () => {
      sounds.click();
      const action = tile.dataset.action;
      if (action === 'install') {
        renderRecoveryFiles();
        openRecoverySubpage('install');
      } else if (action === 'wipe') {
        openRecoverySubpage('wipe');
      } else if (action === 'backup') {
        openRecoverySubpage('backup');
      } else if (action === 'restore') {
        openRecoverySubpage('restore');
      } else if (action === 'mount') {
        openRecoverySubpage('mount');
      } else if (action === 'settings') {
        openRecoverySubpage('settings');
      } else if (action === 'advanced') {
        openRecoverySubpage('advanced');
      } else if (action === 'reboot') {
        openRecoverySubpage('reboot');
      }
    });
  });

  // All in-page Back buttons
  document.querySelectorAll('.rec-nav-back').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.click();
      const target = btn.dataset.back || 'main';
      openRecoverySubpage(target);
    });
  });

  // Reboot buttons
  document.getElementById('rb-system').addEventListener('click', () => { sounds.click(); bootDevice(); });
  document.getElementById('rb-recovery').addEventListener('click', () => { sounds.click(); bootToRecovery(); });
  document.getElementById('rb-bootloader').addEventListener('click', () => { sounds.click(); bootToFastboot(); });
  document.getElementById('rb-poweroff').addEventListener('click', () => { sounds.click(); setScreenState('OFF'); });

  // Backup subpage action
  const btnDoBackup = document.getElementById('btn-do-backup');
  if (btnDoBackup) {
    btnDoBackup.addEventListener('click', () => {
      sounds.click();
      openRecoverySubpage('console');
      runRecoveryConsoleLog([
        'Backing up Boot partition (64 MB)...',
        'Backing up Super / System image (4120 MB)...',
        'Backing up Vendor image (1840 MB)...',
        'Generating MD5 checksums...',
        'Nandroid backup saved to /sdcard/TWRP/BACKUPS/vayu_backup.tar',
        'Backup Completed successfully in 3.8s!'
      ], () => {
        UI.btnRecRebootSystem.style.display = 'block';
      });
    });
  }

  // Restore subpage action
  const itemRestore = document.getElementById('item-restore-backup');
  if (itemRestore) {
    itemRestore.addEventListener('click', () => {
      sounds.click();
      if (confirm('Восстановить бэкап Stock HyperOS? Текущие разделы будут перезаписаны.')) {
        openRecoverySubpage('console');
        runRecoveryConsoleLog([
          'Restoring Boot partition from backup...',
          'Restoring System and Vendor images...',
          'Verifying MD5 checksum...',
          'Restoring SELinux contexts...',
          'Nandroid Restore completed successfully!'
        ], () => {
          GameState.rom = 'stock';
          GameState.kernel = 'stock';
          GameState.kernelVersion = 'Linux 4.14.336-stock';
          GameState.ksuWorking = false;
          UI.btnRecRebootSystem.style.display = 'block';
        });
      }
    });
  }

  // Mount subpage action
  const btnToggleMtp = document.getElementById('btn-toggle-mtp');
  if (btnToggleMtp) {
    btnToggleMtp.addEventListener('click', () => {
      sounds.click();
      sounds.vibrate(30);
      alert('MTP: Режим передачи файлов по USB активирован. Память /sdcard подключена к ПК.');
    });
  }

  // Advanced subpage actions
  const btnAdvTerm = document.getElementById('btn-adv-terminal');
  if (btnAdvTerm) {
    btnAdvTerm.addEventListener('click', () => {
      sounds.click();
      openRecoverySubpage('console');
      runRecoveryConsoleLog([
        'TWRP Recovery Terminal CLI (sh 5.1)',
        '# id',
        'uid=0(root) gid=0(root) groups=0(root) context=u:r:recovery:s0',
        '# uname -a',
        `Linux localhost ${GameState.kernelVersion} #1 SMP PREEMPT aarch64`,
        '# mount -o remount,rw /system',
        '# echo "Ready for recovery scripting"'
      ], () => {
        UI.btnRecRebootSystem.style.display = 'none';
      });
    });
  }

  const btnAdvPerm = document.getElementById('btn-adv-fix-permissions');
  if (btnAdvPerm) {
    btnAdvPerm.addEventListener('click', () => {
      sounds.click();
      openRecoverySubpage('console');
      runRecoveryConsoleLog([
        'Fixing SELinux file contexts on /data and /system...',
        'Restoring permissions on /system/bin/sh...',
        'Contexts restored successfully!'
      ], () => {
        UI.btnRecRebootSystem.style.display = 'none';
      });
    });
  }

  const btnAdvLog = document.getElementById('btn-adv-copy-log');
  if (btnAdvLog) {
    btnAdvLog.addEventListener('click', () => {
      sounds.click();
      sounds.vibrate(25);
      alert('📋 Лог recovery.log успешно скопирован в /sdcard/recovery.log!');
    });
  }

  // Wipe subpage
  UI.btnShowFormatData.addEventListener('click', () => {
    sounds.click();
    UI.formatDataDialog.style.display = 'block';
  });

  UI.btnConfirmFormatData.addEventListener('click', () => {
    const val = UI.formatYesInput.value.trim().toLowerCase();
    if (val === 'yes') {
      sounds.swipeTone();
      UI.formatDataDialog.style.display = 'none';
      UI.formatYesInput.value = '';
      openRecoverySubpage('console');
      runRecoveryConsoleLog([
        'Formatting /data and /storage...',
        'Formatting /data using ext4 / f2fs...',
        'Formatting cache partition...',
        'Removing encryption keys and dm-verity...',
        'Updating partition details...',
        'Format Data completed successfully! Ready for clean install.'
      ], () => {
        GameState.romCleanInstalled = true;
        checkQuest('wipe');
        UI.btnRecRebootSystem.style.display = 'block';
      });
    } else {
      sounds.errorTone();
      alert('Для форматирования введите слово "yes"!');
    }
  });

  UI.btnDalvikWipe.addEventListener('click', () => {
    sounds.click();
    openRecoverySubpage('console');
    runRecoveryConsoleLog([
      'Wiping Dalvik / ART Cache...',
      'Wiping Cache partition...',
      'Done. Cache cleaned in 1.1s'
    ], () => {
      UI.btnRecRebootSystem.style.display = 'block';
    });
  });

  UI.btnRecRebootSystem.addEventListener('click', () => {
    sounds.click();
    bootDevice();
  });

  initRecoverySwipeSlider();
}

function renderRecoveryFiles() {
  UI.recFileTree.innerHTML = '';
  const files = Array.from(new Set([...GameState.phoneStorage, ...GameState.pcDownloads]));

  if (files.length === 0) {
    UI.recFileTree.innerHTML = '<div style="padding:16px; color:#888; font-size:12px;">(Папка /sdcard пуста! Скачайте прошивки или ядра на 4PDA или передайте через adb push)</div>';
    return;
  }

  files.forEach(filename => {
    if (filename.endsWith('.zip') || filename.endsWith('.img') || filename.endsWith('.apk')) {
      const row = document.createElement('div');
      row.className = 'rec-file-row';
      let badgeType = 'zip';
      if (filename.endsWith('.img')) badgeType = 'img';
      if (filename.endsWith('.apk')) badgeType = 'apk';
      if (filename.endsWith('.tgz')) badgeType = 'tgz';

      row.innerHTML = `<span class="dl-badge ${badgeType}">${badgeType.toUpperCase()}</span> <b style="margin-left:8px;">${filename}</b>`;
      row.addEventListener('click', () => {
        sounds.click();
        currentRecFile = filename;
        UI.confirmTargetName.textContent = filename;
        UI.confirmFileTitle.textContent = `Install ${filename}`;
        resetRecoverySlider();
        openRecoverySubpage('confirm');
      });
      UI.recFileTree.appendChild(row);
    }
  });
}

function initRecoverySwipeSlider() {
  const handle = UI.recSliderHandle;
  const track = handle.parentElement;
  let startX = 0;
  let currentX = 0;

  const onStart = (e) => {
    isDraggingSlider = true;
    startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    handle.style.transition = 'none';
  };

  const onMove = (e) => {
    if (!isDraggingSlider) return;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const maxDrag = track.clientWidth - handle.clientWidth - 8;
    currentX = Math.max(0, Math.min(clientX - startX, maxDrag));
    handle.style.transform = `translateX(${currentX}px)`;

    if (currentX >= maxDrag - 12) {
      isDraggingSlider = false;
      handle.style.transform = `translateX(${maxDrag}px)`;
      sounds.swipeTone();
      sounds.vibrate(70);
      executeRecoveryFlash(currentRecFile);
    }
  };

  const onEnd = () => {
    if (!isDraggingSlider) return;
    isDraggingSlider = false;
    handle.style.transition = 'transform 0.2s ease';
    handle.style.transform = 'translateX(0px)';
  };

  handle.addEventListener('mousedown', onStart);
  handle.addEventListener('touchstart', onStart, { passive: true });
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('mouseup', onEnd);
  window.addEventListener('touchend', onEnd);
}

function resetRecoverySlider() {
  UI.recSliderHandle.style.transition = 'none';
  UI.recSliderHandle.style.transform = 'translateX(0px)';
}

function executeRecoveryFlash(filename) {
  openRecoverySubpage('console');
  UI.btnRecRebootSystem.style.display = 'none';

  let logs = [];

  // KERNEL FLASHING WITH KERNELSU!
  if (filename.includes('NGK_KernelSU')) {
    logs = [
      `Installing zip file '/sdcard/${filename}'`,
      'NoGravityKernel Installer v5.2',
      '- Unpacking boot image and dtb...',
      '- Detecting Linux kernel 4.14.336-vayu...',
      '- Injecting KernelSU v0.9.5 syscall hooks into kernel space...',
      '- Patching SELinux policy in memory...',
      '- Repacking boot.img with KernelSU driver...',
      '- Flashing boot partition...',
      'Done! KernelSU Native Root is now active in Kernel!'
    ];
    GameState.kernel = 'ngk_ksu';
    GameState.kernelVersion = 'Linux 4.14.336-NGK-KernelSU #52 SMP';
    GameState.ksuWorking = true;
    checkQuest('ksu_kernel');
  } else if (filename.includes('StormBreaker')) {
    logs = [
      `Installing zip file '/sdcard/${filename}'`,
      'StormBreaker Kernel v9 Installer (Overclock Edition)',
      '- Applying CPU overclock: Prime Core 3.2 GHz unlocked!',
      '- GPU Adreno 640 overclocked to 825 MHz',
      '- Injecting KernelSU v0.9.5 kernel hook...',
      '- Locking display refresh rate to 120Hz native...',
      '- Flashing new boot partition...',
      'Done! Maximum gaming power unleashed.'
    ];
    GameState.kernel = 'stormbreaker';
    GameState.kernelVersion = 'Linux 4.14.336-StormBreaker-OC-3.2GHz #9';
    GameState.ksuWorking = true;
    GameState.displayRefreshRate = 120;
    checkQuest('ksu_kernel');
  } else if (filename.includes('KernelSU_Manager')) {
    logs = [
      `Installing '/sdcard/${filename}'`,
      '- Installing KernelSU Manager application to /system/priv-app...',
      'Done! KernelSU Manager is ready.'
    ];
    GameState.ksuWorking = true;
    checkQuest('ksu_root');
  } else if (filename === 'Magisk_v27.0.zip') {
    logs = [
      `Installing zip file '/sdcard/${filename}'`,
      'Magisk v27.0 Installer',
      '- Patching ramdisk in boot.img...',
      '- Installing Magisk su binaries...',
      'Done! Magisk Superuser installed.'
    ];
    GameState.magiskInstalled = true;
  } else if (filename.includes('PlayIntegrityFix')) {
    logs = [
      `Installing module '/sdcard/${filename}'`,
      'Play Integrity Fix v16 by chiteroman',
      '- Spoofing Pixel 8 Pro fingerprint...',
      '- Overriding KeyStore attestation...',
      'Done! MEETS_DEVICE_INTEGRITY passed.'
    ];
    GameState.modules.add('PlayIntegrityFix');
    checkQuest('modules');
    checkQuest('bank');
  } else if (filename.includes('Shamiko')) {
    logs = [
      `Installing module '/sdcard/${filename}'`,
      'Shamiko v1.0.1 by LSPosed Developers',
      '- Enabling Zygisk root hiding daemon...',
      '- DenyList is now invisible to detection engines.',
      'Done!'
    ];
    GameState.modules.add('Shamiko');
    checkQuest('modules');
    checkQuest('bank');
  } else if (filename.includes('ViPER4Android')) {
    logs = [
      `Installing module '/sdcard/${filename}'`,
      'ViPER4Android FX Sound Engine',
      '- Injecting audio_effects.xml configuration...',
      '- Installing V4A DSP driver...',
      'Done! Studio sound quality active.'
    ];
    GameState.modules.add('ViPER4Android');
    checkQuest('modules');
  } else if (filename.includes('LSPosed')) {
    logs = [
      `Installing module '/sdcard/${filename}'`,
      'LSPosed Framework (Zygisk Release)',
      '- Hooking zygote process startup...',
      'Done! Xposed module injection is ready.'
    ];
    GameState.modules.add('LSPosed');
    checkQuest('modules');
  } else if (filename.includes('Game_120FPS')) {
    logs = [
      `Installing module '/sdcard/${filename}'`,
      '120 FPS Game Unlocker',
      '- Spoofing device model to ASUS ROG Phone 8 Pro...',
      '- Unlocking ultra frame rate in PUBG and Call of Duty...',
      'Done!'
    ];
    GameState.modules.add('Game120FPS');
    checkQuest('modules');
    checkQuest('fps120');
  }

  // ROM FLASHING
  else if (filename.startsWith('PixelOS')) {
    logs = [
      `Installing ROM '/sdcard/${filename}'`,
      'Target: PixelOS Android 14 (vayu)',
      '- Flashing system, vendor & product partitions...',
      '- Installing Google Apps & Monet Engine...',
      'Script succeeded: result was [1.000000]'
    ];
    GameState.rom = 'pixel';
    GameState.romCleanInstalled = false; // requires format data!
    checkQuest('flash_rom');
  } else if (filename.startsWith('LineageOS')) {
    logs = [
      `Installing ROM '/sdcard/${filename}'`,
      'Target: LineageOS 21.0 (AOSP 14)',
      '- Flashing payload.bin partitions...',
      '- Installing LineageOS Trust subsystem...',
      'Installation complete!'
    ];
    GameState.rom = 'lineage';
    GameState.romCleanInstalled = false;
    checkQuest('flash_rom');
  } else if (filename.startsWith('crDroid')) {
    logs = [
      `Installing ROM '/sdcard/${filename}'`,
      'Target: crDroid v10.5 Gaming Edition',
      '- Applying gaming thermal governor...',
      '- Unlocking 120Hz display refresh rate...',
      'Done! Maximum FPS unlocked.'
    ];
    GameState.rom = 'crdroid';
    GameState.romCleanInstalled = false;
    checkQuest('flash_rom');
  } else if (filename.startsWith('EvolutionX')) {
    logs = [
      `Installing ROM '/sdcard/${filename}'`,
      'Target: Evolution X 8.5 (The Customizer)',
      '- Flashing Evolution Themer & System UI...',
      '- Injecting custom status bar styles and lockscreens...',
      'Installation succeeded!'
    ];
    GameState.rom = 'evolution';
    GameState.romCleanInstalled = false;
    checkQuest('flash_rom');
  } else if (filename.startsWith('Kali_NetHunter')) {
    logs = [
      `Installing ROM '/sdcard/${filename}'`,
      'Target: Kali NetHunter Android 14 (PenTest Edition)',
      '- Unpacking Kali chroot environment...',
      '- Installing Metasploit, Nmap, Wireshark and Aircrack-ng...',
      '- Configuring USB OTG WiFi monitor mode drivers...',
      'Done! Mobile PenTesting station ready.'
    ];
    GameState.rom = 'kali';
    GameState.romCleanInstalled = false;
    checkQuest('flash_rom');
  } else {
    logs = [
      `Installing file '/sdcard/${filename}'`,
      'Processing archive...',
      'Flashing partitions...',
      'Success.'
    ];
  }

  runRecoveryConsoleLog(logs, () => {
    UI.btnRecRebootSystem.style.display = 'block';
  });
}

function runRecoveryConsoleLog(lines, callback) {
  UI.recLogConsole.textContent = '';
  let i = 0;
  function step() {
    if (i < lines.length) {
      UI.recLogConsole.textContent += lines[i] + '\n';
      UI.recLogConsole.scrollTop = UI.recLogConsole.scrollHeight;
      i++;
      setTimeout(step, 120);
    } else {
      if (callback) callback();
    }
  }
  step();
}

// --- DRAMATICALLY DISTINCT OS VISUAL ENGINE ---
function updateOsUI() {
  const os = GameState.rom || 'stock';
  const osEl = UI.screens.OS;

  // Apply root CSS classes for each OS
  osEl.className = 'screen-view active';
  if (os === 'pixel') osEl.classList.add('theme-pixel');
  else if (os === 'lineage') osEl.classList.add('theme-lineage');
  else if (os === 'crdroid') osEl.classList.add('theme-crdroid');
  else if (os === 'evolution') osEl.classList.add('theme-evolution');
  else if (os === 'kali') osEl.classList.add('theme-kali');
  else osEl.classList.add('theme-hyperos');

  // Badges in statusbar
  UI.osKsuBadge.classList.toggle('visible', GameState.ksuWorking);
  UI.osMagiskBadge.classList.toggle('visible', GameState.magiskInstalled && !GameState.ksuWorking);
  UI.osFpsBadge.textContent = `${GameState.displayRefreshRate} Hz`;

  // Dynamic Widgets per Operating System
  renderOsWidgets(os);

  // App Grid with OS specific styling
  renderOsAppsGrid(os);
}

function renderOsWidgets(os) {
  const widget = UI.osHeroWidget;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');

  // 1. GOOGLE PIXELOS: At a Glance + Huge Pastel 2-line Material You Clock + Google Search Pill
  if (os === 'pixel') {
    UI.pixelSearchBar.style.display = 'flex';
    widget.innerHTML = `
      <div style="text-align:left; padding:0 8px; margin-bottom:12px;">
        <div style="font-size:14px; font-weight:600; color:#d1e4ff; display:flex; align-items:center; gap:6px;">
          <span>Среда, 18 ноя • 21°C</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        </div>
        <div style="font-size:11px; color:#8e919e; margin-top:2px;">Google Pixel Experience • Чистый Android 14</div>
      </div>
      <div style="display:flex; justify-content:center; align-items:center; line-height:0.85; font-size:74px; font-weight:900; color:#a8c7fa; font-family:'Google Sans', sans-serif;">
        <span id="dyn-clock-h">${hours}</span><br><span id="dyn-clock-m">${mins}</span>
      </div>
      <div class="hero-kernel-title" style="color:#8e919e; margin-top:8px;">${GameState.kernelVersion}</div>
    `;
    return;
  }

  // Search pill hidden for other OSes
  UI.pixelSearchBar.style.display = 'none';

  // 2. CRDROID: Cyberpunk Gaming HUD with 120 FPS & Overclock status
  if (os === 'crdroid') {
    widget.innerHTML = `
      <div class="crdroid-hud-box">
        <span>FPS: ${GameState.displayRefreshRate} LOCKED</span>
        <span>GPU: ADRENO 640</span>
        <span>CPU: ${GameState.kernel === 'stormbreaker' ? '3.2 GHz OC' : '2.96 GHz'}</span>
        <span>TEMP: 38°C</span>
      </div>
      <div style="font-family:var(--font-mono); font-size:38px; font-weight:900; color:#ff3366; text-shadow:0 0 15px rgba(255,51,102,0.6);" id="dyn-clock-time">
        ${timeStr}
      </div>
      <div style="font-family:var(--font-mono); font-size:11px; color:#ff99bb; margin-top:4px;">// CRDROID V10.5 GAMING EDITION</div>
      <div class="hero-kernel-title" style="color:#ff6699;">${GameState.kernelVersion}</div>
    `;
    return;
  }

  // 3. KALI NETHUNTER: Interactive Retro Hacker CRT Terminal Widget
  if (os === 'kali') {
    widget.innerHTML = `
      <div class="kali-terminal-widget">
        <span style="color:#00f2fe;">root@kali-vayu:~#</span> ./nethunter_init.sh<br>
        <span style="color:#22c55e;">[+] Chroot ARM64: /data/local/nhsystem mounted</span><br>
        <span style="color:#22c55e;">[+] Monitor Mode: wlan0mon active</span><br>
        <span style="color:#e2e8f0;">[SYS] TIME: <b id="dyn-clock-time">${timeStr}</b> | KERNEL: ${GameState.kernelVersion}</span>
      </div>
      <div style="font-family:var(--font-mono); font-size:10px; color:#00f2fe; text-align:center;">
        [ OFFENSIVE SECURITY PEN-TEST PLATFORM ]
      </div>
    `;
    return;
  }

  // 4. EVOLUTION X: Artistic Neon Violet Typographic Themer Clock
  if (os === 'evolution') {
    widget.innerHTML = `
      <div style="font-size:36px; font-weight:900; background:linear-gradient(135deg, #c084fc, #38bdf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; text-shadow:0 0 20px rgba(192,132,252,0.4);" id="dyn-clock-time">
        ${timeStr}
      </div>
      <div style="font-size:11px; font-weight:700; color:#c084fc; letter-spacing:2px; margin-top:2px;">KEEP EVOLVING • ANDROID 14</div>
      <div style="display:inline-block; background:rgba(192,132,252,0.15); border:1px solid #c084fc; border-radius:12px; padding:2px 10px; font-size:10px; color:#e0e7ff; margin-top:6px;">
        Evolution Themer: Nebula Violet
      </div>
      <div class="hero-kernel-title" style="color:#cbd5e1;">${GameState.kernelVersion}</div>
    `;
    return;
  }

  // 5. LINEAGEOS: Minimalist Clean AOSP + Lineage Trust Badge
  if (os === 'lineage') {
    widget.innerHTML = `
      <div style="font-size:42px; font-weight:700; color:#e6edf3;" id="dyn-clock-time">${timeStr}</div>
      <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Среда, 18 ноября • 21°C Ясно</div>
      <div style="display:inline-flex; align-items:center; gap:6px; background:#064e43; border-radius:14px; padding:3px 10px; font-size:10.5px; color:#6ee7b7; margin-top:8px;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>Trust:</span> <b>SELinux Enforcing</b>
      </div>
      <div class="hero-kernel-title" style="color:#6ee7b7;">${GameState.kernelVersion}</div>
    `;
    return;
  }

  // 6. XIAOMI HYPEROS (Default): Big Thin Split Magazine Clock + Mi Health Pill
  widget.innerHTML = `
    <div style="font-size:52px; font-weight:300; letter-spacing:-1px; color:#ffffff;" id="dyn-clock-time">${timeStr}</div>
    <div style="font-size:12px; color:#cbd5e1; margin-top:2px;">Среда, 18 ноября • Xiaomi HyperOS 1.0</div>
    <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.15); border-radius:14px; padding:3px 12px; font-size:10.5px; color:#fff; margin-top:8px;">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
      <span>6 420 шагов</span> <span>•</span> <span>8.4 км</span>
    </div>
    <div class="hero-kernel-title" style="color:#93c5fd;">${GameState.kernelVersion}</div>
  `;
}

function renderOsAppsGrid(os) {
  const grid = UI.osAppGrid;
  grid.innerHTML = '';

  const appVectors = {
    settings: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    forum: `<svg viewBox="0 0 36 36" width="32" height="32"><rect width="36" height="36" rx="8" fill="#005999"/><text x="4" y="25" font-family="Arial, sans-serif" font-weight="900" font-size="22" fill="#fff" letter-spacing="-1">4</text><text x="17" y="25" font-family="Arial, sans-serif" font-weight="700" font-size="12" fill="#38bdf8">PDA</text></svg>`,
    fkm: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M4.93 4.93l2.83 2.83M2 12h4M4.93 19.07l2.83-2.83"/><path d="M13 10l5-6-3 8h4l-7 10 2-7h-4z" fill="#facc15" stroke="#f59e0b" stroke-width="1.5"/></svg>`,
    mtmanager: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><rect x="2" y="4" width="9" height="16" rx="2" fill="#0284c7" stroke="#38bdf8" stroke-width="1.2"/><rect x="13" y="4" width="9" height="16" rx="2" fill="#d97706" stroke="#fbbf24" stroke-width="1.2"/><path d="M4 9h5M4 12h5M4 15h3M15 9h5M15 12h5M15 15h3" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    pubg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9a9 9 0 0 0-9-9z" fill="#1e293b"/><path d="M4 11h16M7 11v6M17 11v6M9 14h6" stroke="#f59e0b"/><circle cx="12" cy="11" r="2" fill="#ef4444"/></svg>`,
    termux: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><rect x="2" y="3" width="20" height="18" rx="4" fill="#0c0e12" stroke="#22c55e" stroke-width="1.5"/><path d="M7 8l4 4-4 4" stroke="#22c55e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><line x1="13" y1="16" x2="18" y2="16" stroke="#22c55e" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    bank: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><circle cx="12" cy="12" r="10" fill="#15803d" stroke="#22c55e" stroke-width="1.5"/><path d="M8 12.5l2.5 2.5 5.5-5.5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    antutu: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" fill="#ef4444" stroke="#f97316" stroke-width="1.5"/></svg>`,
    kernelsu: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><path d="M12 2l3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 9l6-1z" fill="#15803d" stroke="#4ade80" stroke-width="1.5"/><text x="12" y="14" text-anchor="middle" font-size="7" font-family="monospace" font-weight="900" fill="#fff">KSU</text></svg>`,
    magisk: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/><path d="M9 10l2 2 4-4M9 14l3 3 3-3" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    viper: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#c084fc" stroke-width="2" stroke-linecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><circle cx="4" cy="12" r="2" fill="#c084fc"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><circle cx="12" cy="10" r="2" fill="#c084fc"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><circle cx="20" cy="14" r="2" fill="#c084fc"/></svg>`,
    lsposed: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#c084fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h4v4M17 7l5-5M19 15v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3"/><circle cx="12" cy="12" r="3" fill="#8b5cf6"/></svg>`,
    'crdroid-mods': `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#e11d48" stroke="#fb7185" stroke-width="1.5"/></svg>`,
    'kali-tools': `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#2dd4bf" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 0-7.07 17.07L12 22l7.07-2.93A10 10 0 0 0 12 2z"/><path d="M9 10h.01M15 10h.01M9 15c1.5 1.5 4.5 1.5 6 0"/></svg>`
  };

  const apps = [
    { id: 'settings', name: 'Настройки', bg: '#475569' },
    { id: 'forum', name: '4PDA Форум', bg: '#005999' },
    { id: 'fkm', name: 'FKM Разгон', bg: '#ea580c' },
    { id: 'mtmanager', name: 'MT Manager', bg: '#0f172a' },
    { id: 'pubg', name: 'PUBG Arena', bg: '#78350f' },
    { id: 'termux', name: 'Termux', bg: '#000000' },
    { id: 'bank', name: 'СберБанк', bg: '#166534' },
    { id: 'antutu', name: 'AnTuTu', bg: '#991b1b' }
  ];

  if (GameState.ksuWorking) {
    apps.splice(2, 0, { id: 'kernelsu', name: 'KernelSU', bg: '#14532d' });
  }

  if (GameState.magiskInstalled && !GameState.ksuWorking) {
    apps.splice(2, 0, { id: 'magisk', name: 'Magisk', bg: '#0369a1' });
  }

  if (GameState.modules.has('ViPER4Android')) {
    apps.push({ id: 'viper', name: 'ViPER4Android', bg: '#4c1d95' });
  }

  if (GameState.modules.has('LSPosed')) {
    apps.push({ id: 'lsposed', name: 'LSPosed', bg: '#581c87' });
  }

  if (os === 'crdroid') {
    apps.push({ id: 'crdroid-mods', name: 'crDroid Hub', bg: '#881337' });
  }

  if (os === 'kali') {
    apps.push({ id: 'kali-tools', name: 'NetHunter', bg: '#042f2e' });
  }

  apps.forEach(app => {
    const tile = document.createElement('div');
    tile.className = 'app-tile';

    let bg = app.bg;
    if (os === 'pixel') bg = '#252936';
    if (os === 'kali') bg = '#030a0a';
    if (os === 'crdroid') bg = '#1a040d';
    if (os === 'evolution') bg = '#240a3d';

    const vector = appVectors[app.id] || `<span style="font-weight:900; font-size:16px; color:#fff;">${app.name.substring(0, 2)}</span>`;

    tile.innerHTML = `
      <div class="app-icon-squircle" style="background:${bg}">${vector}</div>
      <span class="app-label">${app.name}</span>
    `;
    tile.addEventListener('click', () => {
      sounds.click();
      openFullscreenApp(app.id);
    });
    grid.appendChild(tile);
  });
}

function bindOsNavigation() {
  document.querySelectorAll('.dock-icon[data-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.click();
      const target = btn.dataset.open;
      if (target === 'phone-app') alert('Звонилка: Инженерное меню *#*#4636#*#* доступно.');
      else openFullscreenApp(target);
    });
  });

  UI.appWindowBack.addEventListener('click', () => closeFullscreenApp(false));
  UI.appWindowClose.addEventListener('click', () => closeFullscreenApp(true));

  document.getElementById('os-key-back').addEventListener('click', () => { sounds.click(); closeFullscreenApp(false); });
  document.getElementById('os-key-home').addEventListener('click', () => { sounds.click(); closeFullscreenApp(true); });
  document.getElementById('os-key-recents').addEventListener('click', () => { sounds.click(); sounds.vibrate(20); });
}

let currentAppBackHandler = null;
let activePubgAnimationId = null;

function closeFullscreenApp(force = false) {
  if (activePubgAnimationId) {
    cancelAnimationFrame(activePubgAnimationId);
    activePubgAnimationId = null;
  }
  if (!force && currentAppBackHandler) {
    const handler = currentAppBackHandler;
    currentAppBackHandler = null;
    handler();
    return;
  }
  currentAppBackHandler = null;
  UI.osAppWindow.classList.remove('active');
}

function openFullscreenApp(appId) {
  currentAppBackHandler = null;
  UI.osAppWindow.classList.add('active');
  const body = UI.appWindowContent;
  body.innerHTML = '';

  if (appId === 'kernelsu') {
    UI.appWindowTitle.textContent = 'KernelSU Manager v0.9.5';
    renderKernelSUApp(body);
  } else if (appId === 'magisk') {
    UI.appWindowTitle.textContent = 'Magisk Manager v27.0';
    renderMagiskApp(body);
  } else if (appId === 'settings') {
    UI.appWindowTitle.textContent = 'Настройки устройства';
    renderSettingsApp(body);
  } else if (appId === 'forum') {
    UI.appWindowTitle.textContent = '4PDA Форум & Биржа заказов';
    renderForumApp(body);
  } else if (appId === 'fkm') {
    UI.appWindowTitle.textContent = 'Franco Kernel Manager (FKM OC)';
    renderFkmApp(body);
  } else if (appId === 'mtmanager') {
    UI.appWindowTitle.textContent = 'MT Manager (build.prop Editor)';
    renderMtManagerApp(body);
  } else if (appId === 'termux') {
    UI.appWindowTitle.textContent = 'Termux (Bash Shell)';
    renderTermuxApp(body);
  } else if (appId === 'bank') {
    UI.appWindowTitle.textContent = 'СберБанк Онлайн';
    renderBankApp(body);
  } else if (appId === 'pubg') {
    UI.appWindowTitle.textContent = 'PUBG Mobile 120 FPS Arena';
    renderPubgApp(body);
  } else if (appId === 'viper') {
    UI.appWindowTitle.textContent = 'ViPER4Android FX Audio Engine';
    renderViperApp(body);
  } else if (appId === 'lsposed') {
    UI.appWindowTitle.textContent = 'LSPosed Framework (Zygisk)';
    renderLsposedApp(body);
  } else if (appId === 'antutu') {
    UI.appWindowTitle.textContent = 'AnTuTu Benchmark v10';
    renderAntutuApp(body);
  } else if (appId === 'crdroid-mods') {
    UI.appWindowTitle.textContent = 'crDroid Gaming Settings';
    body.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="background:#1e2538; padding:14px; border-radius:10px;">
          <b>🎮 Game Turbo 120Hz</b>
          <p style="color:#22c55e; font-size:12px; margin-top:4px;">Частота обновления дисплея зафиксирована на 120 Hz</p>
        </div>
        <div style="background:#1e2538; padding:14px; border-radius:10px;">
          <b>⚡ Профиль CPU Overclock</b>
          <p style="color:#ff9900; font-size:12px; margin-top:4px;">${GameState.kernel === 'stormbreaker' ? 'Частота 3.2 GHz (StormBreaker Extreme)' : 'Частота 2.96 GHz (Standard)'}</p>
        </div>
      </div>
    `;
  } else if (appId === 'kali-tools') {
    UI.appWindowTitle.textContent = 'Kali NetHunter Suite';
    body.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="background:#0f172a; padding:14px; border-radius:10px; border:1px solid #0f766e;">
          <b>🐉 NetHunter Chroot Terminal</b>
          <p style="color:#00f2fe; font-size:12px; margin-top:4px;">Запустите Termux и введите 'nethunter' или 'nh' для входа в root chroot!</p>
        </div>
        <div style="background:#0f172a; padding:14px; border-radius:10px;">
          <b>📶 Беспроводные атаки</b>
          <p style="color:#94a3b8; font-size:12px;">Драйверы Atheros / RTL8812AU загружены в ядро.</p>
        </div>
      </div>
    `;
  }
}

// --- APP: KERNELSU MANAGER ---
function renderKernelSUApp(container) {
  let activeTab = 'status';

  const renderInner = () => {
    container.innerHTML = `
      <div class="ksu-card">
        <div class="ksu-header-badge">
          <div class="ksu-icon-big">👑</div>
          <div>
            <b style="font-size:16px;">KernelSU</b>
            <div><span class="ksu-status-tag ${GameState.ksuWorking ? '' : 'not-installed'}">${GameState.ksuWorking ? 'Работает (LKM Kernel Mode)' : 'Не установлено'}</span></div>
          </div>
        </div>
        <div style="margin-top:12px; font-size:11.5px; color:#cbd5e1; line-height:1.6;">
          <b>Ядро:</b> ${GameState.kernelVersion}<br>
          <b>Версия KSU:</b> v0.9.5 (11872)<br>
          <b>Режим безопасности:</b> Kernel Hooked Syscalls
        </div>
      </div>

      <div class="ksu-tabs-row">
        <button class="ksu-tab-pill ${activeTab === 'status' ? 'active' : ''}" id="ksu-tab-btn-status">Главная</button>
        <button class="ksu-tab-pill ${activeTab === 'su' ? 'active' : ''}" id="ksu-tab-btn-su">Суперпользователь</button>
        <button class="ksu-tab-pill ${activeTab === 'modules' ? 'active' : ''}" id="ksu-tab-btn-modules">Модули</button>
      </div>

      <div id="ksu-tab-content"></div>
    `;

    document.getElementById('ksu-tab-btn-status').onclick = () => { activeTab = 'status'; renderInner(); };
    document.getElementById('ksu-tab-btn-su').onclick = () => { activeTab = 'su'; renderInner(); };
    document.getElementById('ksu-tab-btn-modules').onclick = () => { activeTab = 'modules'; renderInner(); };

    const content = document.getElementById('ksu-tab-content');
    if (activeTab === 'status') {
      content.innerHTML = `
        <div style="background:#1e293b; padding:14px; border-radius:10px; font-size:12px; line-height:1.6;">
          <b>Особенности KernelSU:</b><br>
          • Root работает полностью внутри пространства ядра (Kernel Space).<br>
          • Приложения без root-доступа даже не могут обнаружить бинарник <code>su</code>!<br>
          • <b>Unmount модулей:</b> Вы можете полностью скрыть root от банковских приложений в 1 клик.
        </div>
      `;
    } else if (activeTab === 'su') {
      content.innerHTML = `
        <div style="margin-bottom:8px; font-size:11.5px; color:#888;">Приложения с правами Superuser и изоляция:</div>
        <div class="ksu-app-item">
          <div>
            <b>Termux (com.termux)</b>
            <div style="font-size:10px; color:#aaa;">UID: 10148 • Доступ к sh/su</div>
          </div>
          <input type="checkbox" id="chk-su-termux" ${GameState.ksuSuperuserApps.has('termux') ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;">
        </div>

        <div class="ksu-app-item">
          <div>
            <b>СберБанк (ru.sberbankmobile)</b>
            <div style="font-size:10px; color:#22c55e;">Изолировать root (Unmount)</div>
          </div>
          <input type="checkbox" id="chk-unmount-bank" ${GameState.ksuUnmountRoot.has('bank') ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;">
        </div>

        <div class="ksu-app-item">
          <div>
            <b>PUBG Mobile (com.tencent.ig)</b>
            <div style="font-size:10px; color:#22c55e;">Изолировать root от античита</div>
          </div>
          <input type="checkbox" id="chk-unmount-pubg" ${GameState.ksuUnmountRoot.has('pubg') ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;">
        </div>
      `;

      document.getElementById('chk-su-termux').onchange = (e) => {
        sounds.click();
        if (e.target.checked) GameState.ksuSuperuserApps.add('termux');
        else GameState.ksuSuperuserApps.delete('termux');
        checkQuest('ksu_root');
      };
      document.getElementById('chk-unmount-bank').onchange = (e) => {
        sounds.click();
        if (e.target.checked) GameState.ksuUnmountRoot.add('bank');
        else GameState.ksuUnmountRoot.delete('bank');
        checkQuest('bank');
      };
      document.getElementById('chk-unmount-pubg').onchange = (e) => {
        sounds.click();
        if (e.target.checked) GameState.ksuUnmountRoot.add('pubg');
        else GameState.ksuUnmountRoot.delete('pubg');
      };
    } else if (activeTab === 'modules') {
      const activeList = Array.from(GameState.modules);
      if (activeList.length === 0) {
        content.innerHTML = '<div style="color:#888; font-size:12px; padding:12px;">(Модули не установлены. Прошейте PlayIntegrityFix или Shamiko в рекавери!)</div>';
      } else {
        content.innerHTML = activeList.map(m => `
          <div class="ksu-app-item">
            <div>
              <b>🧩 ${m}</b>
              <div style="font-size:10px; color:#22c55e;">Модуль активен</div>
            </div>
            <span style="color:#22c55e; font-size:12px; font-weight:bold;">Вкл</span>
          </div>
        `).join('');
      }
    }
  };

  renderInner();
}

// --- APP: MAGISK MANAGER ---
function renderMagiskApp(container) {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:14px;">
      <div style="background:#1b2336; border:1px solid #2d3b5c; border-radius:12px; padding:18px; text-align:center;">
        <div style="font-size:38px;">🪄</div>
        <b style="font-size:16px; display:block; margin-top:6px;">Magisk v27.0</b>
        <span style="color:#00e676; font-size:12px;">Установлен (Ramdisk Patch)</span>
      </div>

      <div style="background:#1b2336; border-radius:12px; padding:14px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <b>Zygisk</b>
          <div style="font-size:11px; color:#888;">Запуск модулей в системном процессе Zygote</div>
        </div>
        <input type="checkbox" id="chk-zygisk" ${GameState.magiskZygisk ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;">
      </div>

      <div style="background:#1b2336; border-radius:12px; padding:14px;">
        <b>Установленные модули:</b>
        <div style="margin-top:10px; display:flex; flex-direction:column; gap:8px;">
          ${Array.from(GameState.modules).map(m => `
            <div style="background:#243048; padding:10px; border-radius:8px; font-size:12px; display:flex; justify-content:space-between;">
              <span>🛡️ ${m}</span>
              <span style="color:#00e676; font-weight:bold;">Активен</span>
            </div>
          `).join('') || '<div style="color:#888; font-size:12px;">(Нет активных модулей)</div>'}
        </div>
      </div>
    </div>
  `;

  document.getElementById('chk-zygisk').addEventListener('change', (e) => {
    sounds.click();
    GameState.magiskZygisk = e.target.checked;
    sounds.vibrate(30);
    alert(GameState.magiskZygisk ? 'Zygisk включен! Требуется перезагрузка.' : 'Zygisk выключен.');
  });
}

// --- APP: VIPER4ANDROID FX ---
function renderViperApp(container) {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div style="background:#192233; padding:14px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <b style="font-size:15px; color:#6366f1;">Master Power</b>
          <div style="font-size:11px; color:#aaa;">Главный звуковой процессор V4A</div>
        </div>
        <input type="checkbox" checked style="width:22px; height:22px;">
      </div>

      <div class="viper-slider-row">
        <div>
          <b>ViPER Bass (Усиление низких)</b>
          <div style="font-size:10px; color:#888;">Natural Bass / 60 Hz</div>
        </div>
        <input type="range" min="0" max="100" value="85">
      </div>

      <div class="viper-slider-row">
        <div>
          <b>ViPER Clarity (Кристальный звук)</b>
          <div style="font-size:10px; color:#888;">Ozone+ High-definition</div>
        </div>
        <input type="range" min="0" max="100" value="70">
      </div>

      <div style="background:#192233; padding:14px; border-radius:12px;">
        <b>10-полосный эквалайзер:</b>
        <div style="display:flex; justify-content:space-around; align-items:flex-end; height:100px; margin-top:12px;">
          <div style="width:12px; height:60px; background:#6366f1; border-radius:4px;"></div>
          <div style="width:12px; height:80px; background:#6366f1; border-radius:4px;"></div>
          <div style="width:12px; height:45px; background:#6366f1; border-radius:4px;"></div>
          <div style="width:12px; height:55px; background:#6366f1; border-radius:4px;"></div>
          <div style="width:12px; height:75px; background:#6366f1; border-radius:4px;"></div>
          <div style="width:12px; height:90px; background:#6366f1; border-radius:4px;"></div>
          <div style="width:12px; height:65px; background:#6366f1; border-radius:4px;"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:9px; color:#888; margin-top:6px;">
          <span>31Hz</span><span>125Hz</span><span>500Hz</span><span>2kHz</span><span>8kHz</span><span>16kHz</span>
        </div>
      </div>
    </div>
  `;
}

// --- APP: LSPOSED FRAMEWORK ---
function renderLsposedApp(container) {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div style="background:#1e1b4b; border:1px solid #4338ca; padding:16px; border-radius:12px; text-align:center;">
        <div style="font-size:36px;">💉</div>
        <b style="font-size:16px; display:block; margin-top:4px;">LSPosed v1.9.2</b>
        <span style="color:#22c55e; font-size:12px;">Zygote Hooking Active</span>
      </div>

      <div style="background:#1e293b; padding:14px; border-radius:12px;">
        <b>Активированные Xposed модули:</b>
        <div style="margin-top:10px; display:flex; flex-direction:column; gap:8px;">
          <div style="background:#0f172a; padding:10px; border-radius:8px; display:flex; justify-content:space-between;">
            <div>
              <b>Core Patch</b>
              <div style="font-size:10px; color:#aaa;">Отключение проверки подписи APK</div>
            </div>
            <span style="color:#22c55e; font-weight:bold;">Вкл</span>
          </div>
          <div style="background:#0f172a; padding:10px; border-radius:8px; display:flex; justify-content:space-between;">
            <div>
              <b>Disable-Flag-Secure</b>
              <div style="font-size:10px; color:#aaa;">Скриншоты в банковских приложениях</div>
            </div>
            <span style="color:#22c55e; font-weight:bold;">Вкл</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- APP: PLAYABLE PUBG MOBILE 120 FPS MINI-GAME ---
function renderPubgApp(container) {
  if (activePubgAnimationId) {
    cancelAnimationFrame(activePubgAnimationId);
    activePubgAnimationId = null;
  }

  const is120 = GameState.displayRefreshRate === 120 && (GameState.cpuFreq >= 2.96 || GameState.rom === 'crdroid' || GameState.kernel === 'stormbreaker');
  const maxFps = is120 ? 120 : 60;

  container.innerHTML = `
    <div class="pubg-game-wrapper">
      <div class="pubg-hud-bar">
        <div>❤️ HP: <b id="pubg-hp-val" style="color:#00e676;">100%</b></div>
        <div>💀 Очки: <b id="pubg-score-val" style="color:#f59e0b;">0</b></div>
        <div>⚡ <span id="pubg-fps-indicator" style="color:#38bdf8; font-weight:bold;">${maxFps} FPS</span></div>
        <div>🌡️ <span id="pubg-temp-val" style="color:#ef4444;">${GameState.cpuTemp.toFixed(1)}°C</span></div>
      </div>

      <div class="pubg-canvas-frame">
        <canvas id="pubg-canvas" width="340" height="240"></canvas>
        <div id="pubg-game-over-overlay" style="display:none; position:absolute; inset:0; background:rgba(0,0,0,0.85); flex-direction:column; align-items:center; justify-content:center; gap:12px; z-index:10;">
          <div style="font-size:24px; font-weight:900; color:#ef4444;">ВЫ ПОГИБЛИ</div>
          <div style="font-size:13px; color:#cbd5e1;">Итоговый счет: <b id="final-pubg-score" style="color:#f59e0b;">0</b></div>
          <button id="btn-pubg-restart" class="rec-big-btn success" style="width:auto; padding:8px 24px;">Возродиться в зоне</button>
        </div>
      </div>

      <div class="pubg-controls">
        <div class="pubg-dpad">
          <div></div>
          <button class="dpad-btn" id="dpad-up">▲</button>
          <div></div>
          <button class="dpad-btn" id="dpad-left">◀</button>
          <button class="dpad-btn" id="dpad-down">▼</button>
          <button class="dpad-btn" id="dpad-right">▶</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:4px; font-size:10px; color:#64748b; text-align:center;">
          <div>Управление: D-Pad / Тап</div>
          <div>Разгон CPU: <b>${GameState.cpuFreq} GHz</b></div>
          <div>Частота: <b>${is120 ? '120 FPS Extreme' : '60 FPS Normal'}</b></div>
        </div>

        <button class="pubg-fire-btn" id="btn-pubg-fire">
          🔥 ОГОНЬ
        </button>
      </div>
    </div>
  `;

  const canvas = document.getElementById('pubg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let player = {
    x: 170,
    y: 120,
    radius: 12,
    hp: 100,
    speed: GameState.cpuFreq >= 3.2 ? 3.5 : 2.5,
    angle: 0
  };

  let bullets = [];
  let enemies = [];
  let particles = [];
  let score = 0;
  let isGameOver = false;

  let lastTime = performance.now();
  let frameCount = 0;
  let lastFpsUpdate = performance.now();
  let currentFps = maxFps;

  const keys = { up: false, down: false, left: false, right: false };

  function setupDpadBtn(id, dir) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = (e) => { e.preventDefault(); keys[dir] = true; };
    const end = (e) => { e.preventDefault(); keys[dir] = false; };
    el.addEventListener('mousedown', start);
    el.addEventListener('mouseup', end);
    el.addEventListener('touchstart', start, { passive: false });
    el.addEventListener('touchend', end);
  }
  setupDpadBtn('dpad-up', 'up');
  setupDpadBtn('dpad-down', 'down');
  setupDpadBtn('dpad-left', 'left');
  setupDpadBtn('dpad-right', 'right');

  function fireBullet() {
    if (isGameOver) return;
    sounds.beep(750, 0.04, 'square', 0.08);
    sounds.vibrate(15);

    let targetX = player.x + Math.cos(player.angle) * 100;
    let targetY = player.y + Math.sin(player.angle) * 100;
    if (enemies.length > 0) {
      let nearest = enemies[0];
      let minDist = 9999;
      enemies.forEach(e => {
        let d = Math.hypot(e.x - player.x, e.y - player.y);
        if (d < minDist) { minDist = d; nearest = e; }
      });
      targetX = nearest.x;
      targetY = nearest.y;
    }

    const angle = Math.atan2(targetY - player.y, targetX - player.x);
    player.angle = angle;
    const bSpeed = GameState.cpuFreq >= 3.2 ? 9 : 6.5;
    bullets.push({
      x: player.x + Math.cos(angle) * (player.radius + 4),
      y: player.y + Math.sin(angle) * (player.radius + 4),
      vx: Math.cos(angle) * bSpeed,
      vy: Math.sin(angle) * bSpeed,
      radius: 3.5
    });

    if (GameState.cpuFreq >= 3.2) {
      bullets.push({
        x: player.x + Math.cos(angle + 0.15) * (player.radius + 4),
        y: player.y + Math.sin(angle + 0.15) * (player.radius + 4),
        vx: Math.cos(angle + 0.15) * bSpeed,
        vy: Math.sin(angle + 0.15) * bSpeed,
        radius: 3
      });
    }
  }

  const fireBtn = document.getElementById('btn-pubg-fire');
  fireBtn.addEventListener('click', (e) => { e.preventDefault(); fireBullet(); });
  fireBtn.addEventListener('touchstart', (e) => { e.preventDefault(); fireBullet(); }, { passive: false });

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.angle = Math.atan2(clickY - player.y, clickX - player.x);
    fireBullet();
  });

  let spawnTimer = 0;
  function spawnEnemy() {
    const edge = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    if (edge === 0) { x = Math.random() * canvas.width; y = -10; }
    else if (edge === 1) { x = canvas.width + 10; y = Math.random() * canvas.height; }
    else if (edge === 2) { x = Math.random() * canvas.width; y = canvas.height + 10; }
    else { x = -10; y = Math.random() * canvas.height; }

    enemies.push({
      x: x,
      y: y,
      hp: 2,
      maxHp: 2,
      speed: 1.0 + Math.random() * 0.8,
      radius: 11
    });
  }

  function addParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 1 + Math.random() * 3;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 1.0,
        color: color
      });
    }
  }

  function loop(timestamp) {
    if (!document.getElementById('pubg-canvas')) return;

    const delta = timestamp - lastTime;
    lastTime = timestamp;
    frameCount++;

    if (timestamp - lastFpsUpdate >= 400) {
      const measured = Math.round((frameCount * 1000) / (timestamp - lastFpsUpdate));
      currentFps = Math.min(measured, maxFps);
      frameCount = 0;
      lastFpsUpdate = timestamp;
      const fpsEl = document.getElementById('pubg-fps-indicator');
      if (fpsEl) {
        fpsEl.textContent = `${currentFps} FPS`;
        fpsEl.style.color = currentFps >= 110 ? '#00e676' : (currentFps >= 55 ? '#38bdf8' : '#f59e0b');
      }
    }

    if (!isGameOver) {
      if (keys.up && player.y > player.radius) player.y -= player.speed;
      if (keys.down && player.y < canvas.height - player.radius) player.y += player.speed;
      if (keys.left && player.x > player.radius) player.x -= player.speed;
      if (keys.right && player.x < canvas.width - player.radius) player.x += player.speed;

      spawnTimer += delta;
      if (spawnTimer >= (GameState.cpuFreq >= 3.2 ? 900 : 1300)) {
        spawnTimer = 0;
        spawnEnemy();
      }

      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
          bullets.splice(i, 1);
          continue;
        }

        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (Math.hypot(b.x - e.x, b.y - e.y) < b.radius + e.radius) {
            e.hp--;
            addParticles(b.x, b.y, '#f59e0b');
            bullets.splice(i, 1);
            if (e.hp <= 0) {
              addParticles(e.x, e.y, '#ef4444');
              enemies.splice(j, 1);
              score += 100;
              sounds.beep(220, 0.08, 'triangle', 0.1);
              const scoreEl = document.getElementById('pubg-score-val');
              if (scoreEl) scoreEl.textContent = score;
              if (score >= 500) checkQuest('fps120');
            }
            break;
          }
        }
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const angle = Math.atan2(player.y - e.y, player.x - e.x);
        e.x += Math.cos(angle) * e.speed;
        e.y += Math.sin(angle) * e.speed;

        if (Math.hypot(player.x - e.x, player.y - e.y) < player.radius + e.radius) {
          player.hp -= 15;
          sounds.beep(140, 0.12, 'sawtooth', 0.15);
          sounds.vibrate(40);
          addParticles(player.x, player.y, '#ff3366');
          enemies.splice(i, 1);
          const hpEl = document.getElementById('pubg-hp-val');
          if (hpEl) {
            hpEl.textContent = `${Math.max(0, player.hp)}%`;
            hpEl.style.color = player.hp > 50 ? '#00e676' : (player.hp > 25 ? '#f59e0b' : '#ef4444');
          }

          if (player.hp <= 0) {
            isGameOver = true;
            sounds.errorTone();
            document.getElementById('pubg-game-over-overlay').style.display = 'flex';
            document.getElementById('final-pubg-score').textContent = score;
          }
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        if (p.life <= 0) particles.splice(i, 1);
      }
    }

    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(30, 45, 70, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    });
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = GameState.cpuFreq >= 3.2 ? '#00f2fe' : '#fbbf24';
    ctx.shadowBlur = 8;
    ctx.shadowColor = ctx.fillStyle;
    bullets.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    enemies.forEach(e => {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fee2e2';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#000';
      ctx.fillRect(e.x - 3, e.y - 2, 2, 2);
      ctx.fillRect(e.x + 1, e.y - 2, 2, 2);
    });

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, -3, 16, 6);

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    activePubgAnimationId = requestAnimationFrame(loop);
  }

  activePubgAnimationId = requestAnimationFrame(loop);

  document.getElementById('btn-pubg-restart').onclick = () => {
    sounds.click();
    player.hp = 100;
    player.x = 170;
    player.y = 120;
    bullets = [];
    enemies = [];
    particles = [];
    score = 0;
    isGameOver = false;
    document.getElementById('pubg-game-over-overlay').style.display = 'none';
    document.getElementById('pubg-hp-val').textContent = '100%';
    document.getElementById('pubg-score-val').textContent = '0';
  };
}

// --- APP: FRANCO KERNEL MANAGER (FKM OC) ---
function renderFkmApp(container) {
  function render() {
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="background:#151c2a; border:1px solid #233147; border-radius:14px; padding:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b>Qualcomm Snapdragon 860</b>
            <span style="font-size:10px; color:#00e676; font-weight:800; background:rgba(0,230,118,0.15); padding:2px 8px; border-radius:10px;">8 CORES ONLINE</span>
          </div>

          <div class="fkm-core-grid">
            <div class="fkm-core-card">
              <div class="fkm-core-label">Core 0-1</div>
              <div class="fkm-core-mhz">1.8 GHz</div>
            </div>
            <div class="fkm-core-card">
              <div class="fkm-core-label">Core 2-3</div>
              <div class="fkm-core-mhz">1.8 GHz</div>
            </div>
            <div class="fkm-core-card">
              <div class="fkm-core-label">Core 4-6</div>
              <div class="fkm-core-mhz">2.42 GHz</div>
            </div>
            <div class="fkm-core-card" style="border-color:#38bdf8;">
              <div class="fkm-core-label" style="color:#38bdf8;">Prime 7</div>
              <div class="fkm-core-mhz" style="color:#00f2fe;">${GameState.cpuFreq.toFixed(2)} GHz</div>
            </div>
          </div>

          <div style="font-size:11px; color:#94a3b8; display:flex; justify-content:space-between; margin-top:6px;">
            <span>Текущее ядро: <b style="color:#fff;">${GameState.kernelVersion}</b></span>
            <span>GPU: <b style="color:#00e676;">${GameState.gpuFreq} MHz</b></span>
          </div>
        </div>

        <div class="settings-group">
          <div class="settings-group-header">Максимальная частота CPU Prime Core</div>
          <div style="padding:12px 14px; display:flex; flex-direction:column; gap:8px;">
            <div class="settings-tile-grid">
              <div class="settings-tile ${GameState.cpuFreq === 1.8 ? 'active' : ''}" data-freq="1.8">
                <div class="settings-tile-title">1.80 GHz</div>
                <div class="settings-tile-sub">Эко</div>
              </div>
              <div class="settings-tile ${GameState.cpuFreq === 2.42 ? 'active' : ''}" data-freq="2.42">
                <div class="settings-tile-title">2.42 GHz</div>
                <div class="settings-tile-sub">Штат</div>
              </div>
              <div class="settings-tile ${GameState.cpuFreq === 2.96 ? 'active' : ''}" data-freq="2.96">
                <div class="settings-tile-title">2.96 GHz</div>
                <div class="settings-tile-sub">Stock Max</div>
              </div>
            </div>
            <div class="settings-tile ${GameState.cpuFreq === 3.20 ? 'active' : ''}" data-freq="3.2" style="border-color:#ef4444; background:rgba(239,68,68,0.1);">
              <div class="settings-tile-title" style="color:#ef4444;">⚡ 3.20 GHz Extreme OC (StormBreaker)</div>
              <div class="settings-tile-sub">Максимальный оверклок для 120 FPS в PUBG и рекорда AnTuTu</div>
            </div>
          </div>
        </div>

        <div class="settings-group">
          <div class="settings-group-header">Частота Adreno 640 & Говернор</div>
          <div style="padding:12px 14px; display:flex; flex-direction:column; gap:10px;">
            <div>
              <div style="font-size:11px; color:#888; margin-bottom:6px;">Частота GPU:</div>
              <div style="display:flex; gap:8px;">
                <button class="fkm-gov-chip ${GameState.gpuFreq === 675 ? 'active' : ''}" data-gpufreq="675">675 MHz (Default)</button>
                <button class="fkm-gov-chip ${GameState.gpuFreq === 750 ? 'active' : ''}" data-gpufreq="750">750 MHz (Turbo)</button>
                <button class="fkm-gov-chip ${GameState.gpuFreq === 825 ? 'active' : ''}" data-gpufreq="825">825 MHz (Max OC)</button>
              </div>
            </div>

            <div>
              <div style="font-size:11px; color:#888; margin-bottom:6px;">CPU Governor (Планировщик):</div>
              <div style="display:flex; gap:8px;">
                <button class="fkm-gov-chip ${GameState.cpuGovernor === 'schedutil' ? 'active' : ''}" data-gov="schedutil">schedutil</button>
                <button class="fkm-gov-chip ${GameState.cpuGovernor === 'performance' ? 'active' : ''}" data-gov="performance">performance</button>
                <button class="fkm-gov-chip ${GameState.cpuGovernor === 'powersave' ? 'active' : ''}" data-gov="powersave">powersave</button>
              </div>
            </div>
          </div>
        </div>

        <button id="btn-apply-fkm" class="rec-big-btn success" style="margin-top:6px;">
          💾 Применить настройки ядра
        </button>
      </div>
    `;

    container.querySelectorAll('[data-freq]').forEach(tile => {
      tile.onclick = () => {
        sounds.click();
        GameState.cpuFreq = parseFloat(tile.dataset.freq);
        render();
      };
    });

    container.querySelectorAll('[data-gpufreq]').forEach(btn => {
      btn.onclick = () => {
        sounds.click();
        GameState.gpuFreq = parseInt(btn.dataset.gpufreq);
        render();
      };
    });

    container.querySelectorAll('[data-gov]').forEach(btn => {
      btn.onclick = () => {
        sounds.click();
        GameState.cpuGovernor = btn.dataset.gov;
        render();
      };
    });

    document.getElementById('btn-apply-fkm').onclick = () => {
      sounds.bootChime();
      sounds.vibrate(60);
      alert(`⚡ FKM: Параметры ядра успешно сохранены!\nCPU: ${GameState.cpuFreq.toFixed(2)} GHz\nGPU: ${GameState.gpuFreq} MHz\nGovernor: ${GameState.cpuGovernor}\n\nPUBG и AnTuTu работают на максимальной производительности!`);
      if (GameState.cpuFreq >= 3.20) {
        checkQuest('fps120');
      }
    };
  }

  render();
}

// --- APP: 4PDA FORUM & CLIENT ORDERS ---
function renderForumApp(container) {
  let activeTab = 'threads';

  function render() {
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div class="forum-tabs">
          <button class="forum-tab ${activeTab === 'threads' ? 'active' : ''}" data-ftab="threads">
            <span>Темы & FAQ</span>
          </button>
          <button class="forum-tab ${activeTab === 'orders' ? 'active' : ''}" data-ftab="orders">
            <span>Биржа заказов</span>
          </button>
          <button class="forum-tab ${activeTab === 'profile' ? 'active' : ''}" data-ftab="profile">
            <span>Профиль [ +${GameState.modderReputation} ]</span>
          </button>
        </div>

        <div id="forum-content"></div>
      </div>
    `;

    container.querySelectorAll('[data-ftab]').forEach(tab => {
      tab.onclick = () => {
        sounds.click();
        activeTab = tab.dataset.ftab;
        render();
      };
    });

    const body = document.getElementById('forum-content');

    if (activeTab === 'threads') {
      renderThreads(body);
    } else if (activeTab === 'orders') {
      renderOrders(body);
    } else {
      renderProfile(body);
    }
  }

  function renderThreads(body) {
    body.innerHTML = `
      <div class="forum-thread-card">
        <div class="forum-user-badge">
          <div class="forum-user-avatar-mini">N</div>
          <span>Noob_Poco_2026</span>
          <span class="forum-rep-pill">[ - | +2 ]</span>
          <span style="color:#64748b; font-size:10px; margin-left:auto;">5 мин назад • #482</span>
        </div>
        <div style="font-weight:700; color:#fff; font-size:13px;">
          SOS! Окирпичил Poco X3 Pro после прошивки PixelOS! Висит Qualcomm CrashDump!
        </div>
        <div class="pda-quote">
          <div class="pda-quote-title">Цитата (Noob_Poco_2026):</div>
          <div class="pda-quote-body">
            Мужики, накатил архив поверх стока, не сделал Format Data и словил черный экран с дампом. Что делать, плату в утиль или реболл?!
          </div>
        </div>
        ${GameState.solvedForumThreads.has('thread1') ? `
          <div style="background:#064e3b; border:1px solid #059669; padding:8px 12px; border-radius:6px; color:#34d399; font-size:11px;">
            ✓ Вы ответили: «Переведи в Fastboot, открой TWRP и сделай Format Data yes». Автор поднял репутацию (+25)!
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:6px; margin-top:4px;">
            <button class="forum-reply-option" id="btn-ans-1a">
              [Совет] «Зажми Power + Vol- для входа в Fastboot, прошей TWRP и сделай Format Data с вводом 'yes' для снятия шифрования»
            </button>
            <button class="forum-reply-option" id="btn-ans-1b">
              [Флуд] «Выбрось в помойку и не трогай прошивки, если читать шапку темы не умеешь»
            </button>
          </div>
        `}
      </div>

      <div class="forum-thread-card">
        <div class="forum-user-badge">
          <div class="forum-user-avatar-mini">C</div>
          <span>Cybersport_Dimon</span>
          <span class="forum-rep-pill">[ - | +84 ]</span>
          <span style="color:#64748b; font-size:10px; margin-left:auto;">12 мин назад • #483</span>
        </div>
        <div style="font-weight:700; color:#fff; font-size:13px;">
          Какое ядро шить для стабильных 120 FPS в PUBG без троттлинга?
        </div>
        <div class="pda-quote">
          <div class="pda-quote-title">Цитата (Cybersport_Dimon):</div>
          <div class="pda-quote-body">
            Стоковое ядро HyperOS сбрасывает частоты до 1.5 ГГц при нагреве, в катках фпс падает до 45. Какое кастомное ядро держит частоту?
          </div>
        </div>
        ${GameState.solvedForumThreads.has('thread2') ? `
          <div style="background:#064e3b; border:1px solid #059669; padding:8px 12px; border-radius:6px; color:#34d399; font-size:11px;">
            ✓ Вы ответили: «Шей StormBreaker Kernel с разгоном до 3.2 ГГц и GPU 825 МГц». Модератор закрепил пост в шапке темы (+30 Репутации)!
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:6px; margin-top:4px;">
            <button class="forum-reply-option" id="btn-ans-2a">
              [Совет] «Прошей StormBreaker Kernel через TWRP: разгон до 3.20 GHz Prime и Adreno 825 MHz держат стабильные 120 FPS»
            </button>
            <button class="forum-reply-option" id="btn-ans-2b">
              [Флуд] «Положи телефон в морозилку во время катки»
            </button>
          </div>
        `}
      </div>

      <div class="forum-thread-card">
        <div class="forum-user-badge">
          <div class="forum-user-avatar-mini">A</div>
          <span>Alexey_Banker</span>
          <span class="forum-rep-pill">[ - | +42 ]</span>
          <span style="color:#64748b; font-size:10px; margin-left:auto;">28 мин назад • #484</span>
        </div>
        <div style="font-weight:700; color:#fff; font-size:13px;">
          СберБанк видит Magisk даже со Shamiko! Как пройти Play Integrity?
        </div>
        <div class="pda-quote">
          <div class="pda-quote-title">Цитата (Alexey_Banker):</div>
          <div class="pda-quote-body">
            Google обновил DroidGuard, Magisk Hide палится через системные вызовы. Как заставить Сбер работать с рутом?
          </div>
        </div>
        ${GameState.solvedForumThreads.has('thread3') ? `
          <div style="background:#064e3b; border:1px solid #059669; padding:8px 12px; border-radius:6px; color:#34d399; font-size:11px;">
            ✓ Вы ответили: «Переходи на KernelSU и активируй Unmount Root для Сбера». Решение признано лучшим в ветке (+35 Репутации)!
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:6px; margin-top:4px;">
            <button class="forum-reply-option" id="btn-ans-3a">
              [Совет] «Переходи на KernelSU: ядерный рут изолируется из mount namespace приложения через функцию Unmount, Сбер видит чистую систему»
            </button>
            <button class="forum-reply-option" id="btn-ans-3b">
              [Флуд] «Удали СберБанк и пользуйся браузером»
            </button>
          </div>
        `}
      </div>
    `;

    const ans1a = document.getElementById('btn-ans-1a');
    if (ans1a) ans1a.onclick = () => {
      sounds.bootChime();
      sounds.vibrate(50);
      GameState.modderReputation += 25;
      GameState.solvedForumThreads.add('thread1');
      alert('Автор темы: «Огромное человеческое спасибо, брат! Сделал Format Data в TWRP и телефон воскрес! Лови + в репу!»');
      render();
    };

    const ans2a = document.getElementById('btn-ans-2a');
    if (ans2a) ans2a.onclick = () => {
      sounds.bootChime();
      sounds.vibrate(50);
      GameState.modderReputation += 30;
      GameState.solvedForumThreads.add('thread2');
      alert('Куратор ветки Poco X3 Pro: «Отличный совет! Добавлено в FAQ по ядрам! Репутация повышена!»');
      render();
    };

    const ans3a = document.getElementById('btn-ans-3a');
    if (ans3a) ans3a.onclick = () => {
      sounds.bootChime();
      sounds.vibrate(50);
      GameState.modderReputation += 35;
      GameState.solvedForumThreads.add('thread3');
      alert('Сообщество 4PDA: «Проверено на практике, KernelSU Unmount действительно обходит MEETS_STRONG_INTEGRITY!»');
      render();
    };
  }

  function renderOrders(body) {
    body.innerHTML = `
      <div style="font-size:12px; color:#94a3b8; margin-bottom:8px;">
        Выполняйте реальные заказы пользователей на прошивку для повышения моддерского ранга:
      </div>

      <div class="forum-thread-card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <b style="color:#60a5fa;">Заказ #1: Прошить чистый PixelOS 14</b>
          <span style="color:#00e676; font-size:11px; font-weight:800;">+200 XP • +40 Rep</span>
        </div>
        <div style="font-size:11px; color:#cbd5e1;">
          Клиент: Иван • Требование: Установить прошивку PixelOS через Fastboot или Рекавери.
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
          <span style="font-size:11px; color:${GameState.rom === 'pixel' ? '#00e676' : '#f59e0b'};">
            Статус: ${GameState.rom === 'pixel' ? '✓ PixelOS установлена' : 'Не выполнено (текущая: ' + GameState.rom + ')'}
          </span>
          <button class="rec-big-btn success" id="btn-submit-order-1" style="width:auto; padding:6px 14px; margin:0;" ${GameState.rom === 'pixel' && !GameState.solvedOrders.has('order1') ? '' : 'disabled'}>
            ${GameState.solvedOrders.has('order1') ? '✓ Сдан' : 'Сдать заказ'}
          </button>
        </div>
      </div>

      <div class="forum-thread-card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <b style="color:#60a5fa;">Заказ #2: KernelSU & 120 FPS для геймера</b>
          <span style="color:#00e676; font-size:11px; font-weight:800;">+300 XP • +50 Rep</span>
        </div>
        <div style="font-size:11px; color:#cbd5e1;">
          Клиент: Максим • Требование: Прошить ядро с KernelSU и включить 120 Гц в настройках.
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
          <span style="font-size:11px; color:${GameState.ksuWorking && GameState.displayRefreshRate === 120 ? '#00e676' : '#f59e0b'};">
            Статус: ${GameState.ksuWorking && GameState.displayRefreshRate === 120 ? '✓ Ядро KSU + 120Hz готовы' : 'Не выполнено'}
          </span>
          <button class="rec-big-btn success" id="btn-submit-order-2" style="width:auto; padding:6px 14px; margin:0;" ${GameState.ksuWorking && GameState.displayRefreshRate === 120 && !GameState.solvedOrders.has('order2') ? '' : 'disabled'}>
            ${GameState.solvedOrders.has('order2') ? '✓ Сдан' : 'Сдать заказ'}
          </button>
        </div>
      </div>

      <div class="forum-thread-card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <b style="color:#60a5fa;">Заказ #3: Настройка СберБанка (Play Integrity)</b>
          <span style="color:#00e676; font-size:11px; font-weight:800;">+250 XP • +35 Rep</span>
        </div>
        <div style="font-size:11px; color:#cbd5e1;">
          Клиент: Артем • Требование: Изолировать рут от банковского приложения в KernelSU Manager.
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
          <span style="font-size:11px; color:${GameState.ksuUnmountRoot.has('bank') ? '#00e676' : '#f59e0b'};">
            Статус: ${GameState.ksuUnmountRoot.has('bank') ? '✓ Root отмонтирован' : 'Не выполнено'}
          </span>
          <button class="rec-big-btn success" id="btn-submit-order-3" style="width:auto; padding:6px 14px; margin:0;" ${GameState.ksuUnmountRoot.has('bank') && !GameState.solvedOrders.has('order3') ? '' : 'disabled'}>
            ${GameState.solvedOrders.has('order3') ? '✓ Сдан' : 'Сдать заказ'}
          </button>
        </div>
      </div>
    `;

    const sub1 = document.getElementById('btn-submit-order-1');
    if (sub1) sub1.onclick = () => {
      sounds.bootChime();
      sounds.vibrate(60);
      GameState.solvedOrders.add('order1');
      GameState.modderReputation += 40;
      alert('Заказ #1 выполнен! Клиент в восторге от плавности PixelOS 14. +40 к репутации 4PDA!');
      render();
    };

    const sub2 = document.getElementById('btn-submit-order-2');
    if (sub2) sub2.onclick = () => {
      sounds.bootChime();
      sounds.vibrate(60);
      GameState.solvedOrders.add('order2');
      GameState.modderReputation += 50;
      alert('Заказ #2 выполнен! В PUBG стабильные 120 FPS без просадок. +50 к репутации 4PDA!');
      render();
    };

    const sub3 = document.getElementById('btn-submit-order-3');
    if (sub3) sub3.onclick = () => {
      sounds.bootChime();
      sounds.vibrate(60);
      GameState.solvedOrders.add('order3');
      GameState.modderReputation += 35;
      alert('Заказ #3 выполнен! СберБанк запускается без предупреждений. +35 к репутации 4PDA!');
      render();
    };
  }

  function renderProfile(body) {
    let rank = 'Новичок 4PDA';
    if (GameState.modderReputation > 50) rank = 'Форумчанин';
    if (GameState.modderReputation > 150) rank = 'Актив темы';
    if (GameState.modderReputation > 250) rank = 'Куратор темы Poco X3 Pro';
    if (GameState.modderReputation > 350) rank = 'Почетный разработчик 4PDA';
    GameState.modderRank = rank;

    body.innerHTML = `
      <div style="text-align:center; padding:20px; background:#151c2a; border-radius:14px; border:1px solid #233147;">
        <div class="fp-avatar" style="width:56px; height:56px; font-size:24px; margin:0 auto;">4P</div>
        <div style="font-size:18px; font-weight:900; color:#fff; margin-top:10px;">Zyaster</div>
        <div style="font-size:13px; color:#38bdf8; font-weight:700; margin-top:2px;">${rank}</div>
        
        <div style="display:flex; justify-content:center; gap:24px; margin-top:16px;">
          <div>
            <div style="font-size:24px; font-weight:900; color:#00e676;">+${GameState.modderReputation}</div>
            <div style="font-size:11px; color:#888;">Репутация на форуме</div>
          </div>
          <div>
            <div style="font-size:24px; font-weight:900; color:#f59e0b;">${GameState.solvedOrders.size} / 3</div>
            <div style="font-size:11px; color:#888;">Сдано заказов</div>
          </div>
        </div>
      </div>
    `;
  }

  render();
}

// --- APP: MT MANAGER (ROOT EXPLORER & BUILD.PROP EDITOR) ---
function renderMtManagerApp(container) {
  let currentDir = '/system';
  let isEditingBuildProp = false;

  function render() {
    if (isEditingBuildProp) {
      renderBuildPropEditor();
      return;
    }

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; height:100%;">
        <div style="display:flex; align-items:center; gap:8px; background:#0d131f; padding:8px 12px; border-radius:8px; border:1px solid #1e293b; font-family:var(--font-mono); font-size:12px; color:#38bdf8; margin-bottom:10px;">
          <span>📂</span>
          <span style="flex:1;">${currentDir}</span>
          ${currentDir !== '/' ? `<button id="btn-mt-up" style="background:#1e293b; color:#fff; border:none; padding:4px 10px; border-radius:4px; font-size:11px; cursor:pointer;">▲ Вверх</button>` : ''}
        </div>

        <div style="flex:1; background:#090d14; border:1px solid #1a2333; border-radius:10px; overflow-y:auto;">
          ${renderFileList()}
        </div>

        <div style="font-size:11px; color:#64748b; margin-top:8px;">
          Нажмите на <b>build.prop</b> для редактирования системных свойств модели и разгона.
        </div>
      </div>
    `;

    const btnUp = document.getElementById('btn-mt-up');
    if (btnUp) btnUp.onclick = () => {
      sounds.click();
      const parts = currentDir.split('/').filter(Boolean);
      parts.pop();
      currentDir = '/' + parts.join('/');
      if (currentDir === '') currentDir = '/';
      render();
    };

    container.querySelectorAll('.mt-file-row').forEach(row => {
      row.onclick = () => {
        sounds.click();
        const type = row.dataset.type;
        const name = row.dataset.name;
        if (type === 'dir') {
          currentDir = currentDir === '/' ? `/${name}` : `${currentDir}/${name}`;
          render();
        } else if (name === 'build.prop') {
          isEditingBuildProp = true;
          render();
        } else {
          alert(`Файл: [${name}] открыт для чтения.`);
        }
      };
    });
  }

  function renderFileList() {
    let items = [];
    if (currentDir === '/') {
      items = [
        { name: 'sdcard', type: 'dir', icon: '📁' },
        { name: 'system', type: 'dir', icon: '📁' },
        { name: 'data', type: 'dir', icon: '📁' },
        { name: 'vendor', type: 'dir', icon: '📁' }
      ];
    } else if (currentDir === '/system') {
      items = [
        { name: 'bin', type: 'dir', icon: '📁' },
        { name: 'etc', type: 'dir', icon: '📁' },
        { name: 'lib64', type: 'dir', icon: '📁' },
        { name: 'build.prop', type: 'file', icon: '📄', sub: 'Редактор свойств системы' }
      ];
    } else if (currentDir === '/sdcard') {
      items = [
        { name: 'Download', type: 'dir', icon: '📁' },
        { name: 'TWRP', type: 'dir', icon: '📁' },
        { name: 'Android', type: 'dir', icon: '📁' },
        { name: 'recovery.log', type: 'file', icon: '📋' }
      ];
    } else {
      items = [
        { name: 'app', type: 'dir', icon: '📁' },
        { name: 'adb', type: 'dir', icon: '📁' }
      ];
    }

    return items.map(item => `
      <div class="mt-file-row" data-type="${item.type}" data-name="${item.name}">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:16px;">${item.icon}</span>
          <div>
            <div style="font-weight:700; color:${item.name === 'build.prop' ? '#00f2fe' : '#fff'}; font-size:12px;">${item.name}</div>
            ${item.sub ? `<div style="font-size:10px; color:#888;">${item.sub}</div>` : ''}
          </div>
        </div>
        <span style="color:#475569; font-size:12px;">›</span>
      </div>
    `).join('');
  }

  function renderBuildPropEditor() {
    const textContent = Object.keys(GameState.buildProp)
      .map(k => `${k}=${GameState.buildProp[k]}`)
      .join('\n');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; height:100%; gap:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <b style="color:#00f2fe; font-size:13px;">Редактор /system/build.prop</b>
          <button id="btn-mt-cancel" style="background:transparent; border:none; color:#888; cursor:pointer;">Отмена</button>
        </div>

        <textarea id="mt-editor-input" class="mt-editor-box">${textContent}</textarea>

        <button id="btn-mt-save" class="rec-big-btn success">
          💾 Сохранить изменения и обновить свойства
        </button>
      </div>
    `;

    document.getElementById('btn-mt-cancel').onclick = () => {
      sounds.click();
      isEditingBuildProp = false;
      render();
    };

    document.getElementById('btn-mt-save').onclick = () => {
      sounds.bootChime();
      sounds.vibrate(60);
      const val = document.getElementById('mt-editor-input').value;
      const lines = val.split('\n');
      lines.forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const k = parts[0].trim();
          const v = parts.slice(1).join('=').trim();
          GameState.buildProp[k] = v;
          if (k === 'ro.product.model') {
            GameState.model = v;
          }
        }
      });
      alert(`🎉 build.prop сохранен!\nМодель устройства теперь: ${GameState.model}\nСвойства системы обновлены.`);
      isEditingBuildProp = false;
      render();
    };
  }

  render();
}

// --- APP: SETTINGS (Full-Fledged Android 14 System Settings) ---
function renderSettingsApp(container) {
  let currentView = 'main'; // 'main', 'about', 'display', 'battery', 'network', 'security', 'developer', 'system', 'easter_egg'
  let searchQuery = '';
  let easterEggTapCount = 0;

  const osDetails = {
    stock: {
      name: 'Xiaomi HyperOS 1.0.4.0 (Global)',
      codename: 'HyperOS 1.0 (Android 14)',
      security: '1 ноября 2026',
      badge: 'Официальная Global',
      desc: 'Фирменная система Xiaomi с плавным интерфейсом и экосистемой Mi.'
    },
    pixel: {
      name: 'PixelOS 14 (Pixel Experience)',
      codename: 'Android 14 (UpsideDownCake)',
      security: '5 ноября 2026',
      badge: 'Pixel Edition',
      desc: 'Чистый интерфейс Google Pixel с Material You и Google сервисами.'
    },
    lineage: {
      name: 'LineageOS 21.0 Official',
      codename: 'Android 14 (Pure AOSP)',
      security: '1 ноября 2026',
      badge: 'Lineage Trust Enforced',
      desc: 'Эталонный открытый Android без мусора с контролем безопасности Trust.'
    },
    crdroid: {
      name: 'crDroid 10.5 (Gaming Edition)',
      codename: 'crDroid vayu (Android 14)',
      security: '10 ноября 2026',
      badge: '120 FPS Gaming OC',
      desc: 'Кастомная прошивка для геймеров с разгоном Adreno и игровым дашбордом.'
    },
    evolution: {
      name: 'Evolution X 8.5 (The Customizer)',
      codename: 'Evolver Build (Android 14)',
      security: '5 ноября 2026',
      badge: 'Themer Engine Active',
      desc: 'Максимальная кастомизация каждого пикселя интерфейса.'
    },
    kali: {
      name: 'Kali NetHunter Android 14',
      codename: 'Offensive Security Chroot',
      security: '1 ноября 2026',
      badge: 'Root Kernel Injected',
      desc: 'Дистрибутив для этичного хакинга, аудита сетей и тестирования на проникновение.'
    }
  };

  function updateBackHandler() {
    if (currentView !== 'main') {
      currentAppBackHandler = () => {
        sounds.click();
        currentView = 'main';
        render();
      };
    } else {
      currentAppBackHandler = null;
    }
  }

  function render() {
    updateBackHandler();
    const curRom = osDetails[GameState.rom || 'stock'] || osDetails.stock;

    if (currentView === 'about') {
      UI.appWindowTitle.textContent = 'О телефоне';
      renderAboutView(curRom);
    } else if (currentView === 'display') {
      UI.appWindowTitle.textContent = 'Экран и графика';
      renderDisplayView();
    } else if (currentView === 'battery') {
      UI.appWindowTitle.textContent = 'Батарея и питание';
      renderBatteryView();
    } else if (currentView === 'network') {
      UI.appWindowTitle.textContent = 'Сеть и интернет';
      renderNetworkView();
    } else if (currentView === 'security') {
      UI.appWindowTitle.textContent = 'Безопасность и Root';
      renderSecurityView();
    } else if (currentView === 'developer') {
      UI.appWindowTitle.textContent = 'Для разработчиков';
      renderDeveloperView();
    } else if (currentView === 'system') {
      UI.appWindowTitle.textContent = 'Система и сброс';
      renderSystemView();
    } else if (currentView === 'easter_egg') {
      UI.appWindowTitle.textContent = 'Android 14 Easter Egg';
      renderEasterEggView();
    } else {
      UI.appWindowTitle.textContent = 'Настройки';
      renderMainView(curRom);
    }
  }

  // === 1. MAIN SETTINGS VIEW ===
  function renderMainView(curRom) {
    container.innerHTML = `
      <div class="settings-container">
        <!-- Search Bar -->
        <div class="settings-search-wrapper">
          <span class="settings-search-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input type="text" id="settings-search-input" class="settings-search-input" placeholder="Поиск настроек (экран, root, usb, герц...)" value="${searchQuery}" autocomplete="off">
        </div>

        <!-- Search Results (if searching) -->
        <div id="settings-search-results" style="display: ${searchQuery.trim() ? 'block' : 'none'};"></div>

        <div id="settings-default-content" style="display: ${searchQuery.trim() ? 'none' : 'flex'}; flex-direction:column; gap:14px;">
          <!-- Modder Profile Card -->
          <div class="settings-profile-card">
            <div class="fp-avatar" style="width:38px; height:38px; font-size:14px;">4P</div>
            <div style="flex:1;">
              <div class="settings-profile-name">Zyaster (Senior 4PDA Modder)</div>
              <div class="settings-profile-sub">Аккаунт 4PDA синхронизирован • Репутация: +${GameState.modderReputation}</div>
            </div>
            <div style="font-size:16px; color:var(--accent-cyan);">✓</div>
          </div>

          <!-- Hero OS / About Phone Banner -->
          <div class="settings-hero-banner" id="btn-goto-about">
            <div class="settings-hero-header">
              <div class="settings-hero-title">${curRom.name}</div>
              <span class="settings-hero-badge">${curRom.badge}</span>
            </div>
            <div style="font-size:12px; color:#cbd5e1;">Poco X3 Pro (vayu) • Snapdragon 860</div>
            <div class="settings-hero-storage">
              <div class="storage-text">
                <span>Память UFS 3.1</span>
                <b>54.2 ГБ / 256 ГБ занято</b>
              </div>
              <div class="storage-bar-bg">
                <div class="storage-bar-fill" style="width: 21%;"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:10px; color:#64748b; margin-top:2px;">
                <span>Безопасность: ${curRom.security}</span>
                <span style="color:var(--accent-cyan); font-weight:700;">Подробнее ›</span>
              </div>
            </div>
          </div>

          <!-- Group 1: Hardware & Interface -->
          <div class="settings-group">
            <div class="settings-group-header">Устройство и экран</div>
            
            <div class="settings-item" id="btn-goto-display">
              <div class="settings-item-left">
                <div class="settings-item-icon" style="background:#0284c7;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                </div>
                <div class="settings-item-text">
                  <div class="settings-item-title">Экран и графика</div>
                  <div class="settings-item-sub">Частота: ${GameState.displayRefreshRate} Гц • Тёмная тема • DPI: ${GameState.dpiScale}</div>
                </div>
              </div>
              <div class="settings-item-right"><span class="settings-item-arrow">›</span></div>
            </div>

            <div class="settings-item" id="btn-goto-battery">
              <div class="settings-item-left">
                <div class="settings-item-icon" style="background:#16a34a;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="2" y="7" width="16" height="10" rx="2"/><line x1="20" y1="11" x2="20" y2="13"/><rect x="5" y="10" width="8" height="4" fill="#fff"/></svg>
                </div>
                <div class="settings-item-text">
                  <div class="settings-item-title">Батарея и питание</div>
                  <div class="settings-item-sub">${GameState.battery}% • ${GameState.perfProfile === 'performance' ? 'Game Turbo' : 'Сбалансированный'} • 31.8°C</div>
                </div>
              </div>
              <div class="settings-item-right"><span class="settings-item-arrow">›</span></div>
            </div>

            <div class="settings-item" id="btn-goto-network">
              <div class="settings-item-left">
                <div class="settings-item-icon" style="background:#4f46e5;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
                </div>
                <div class="settings-item-text">
                  <div class="settings-item-title">Сеть и интернет</div>
                  <div class="settings-item-sub">Wi-Fi: 4PDA_Modder_5GHz • Частный DNS: AdGuard</div>
                </div>
              </div>
              <div class="settings-item-right"><span class="settings-item-arrow">›</span></div>
            </div>
          </div>

          <!-- Group 2: Modding & Security -->
          <div class="settings-group">
            <div class="settings-group-header">Моддинг и безопасность</div>

            <div class="settings-item" id="btn-goto-security">
              <div class="settings-item-left">
                <div class="settings-item-icon" style="background:#9333ea;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div class="settings-item-text">
                  <div class="settings-item-title">Безопасность и Root</div>
                  <div class="settings-item-sub">Play Integrity: Strong • KernelSU: ${GameState.ksuWorking ? 'Активен' : 'Выкл'}</div>
                </div>
              </div>
              <div class="settings-item-right"><span class="settings-item-arrow">›</span></div>
            </div>

            <div class="settings-item" id="btn-goto-developer">
              <div class="settings-item-left">
                <div class="settings-item-icon" style="background:#d97706;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                </div>
                <div class="settings-item-text">
                  <div class="settings-item-title">Для разработчиков</div>
                  <div class="settings-item-sub">
                    ${GameState.developerUnlocked ? (GameState.usbDebugging ? 'Отладка по USB: Вкл' : 'Отладка по USB: Выкл') : 'Заблокировано (7 тапов по сборке)'}
                  </div>
                </div>
              </div>
              <div class="settings-item-right">
                ${GameState.developerUnlocked ? '<span style="color:#00e676; font-size:11px;">АКТИВНО</span>' : '<span style="color:#64748b; font-size:11px;">[LOCKED]</span>'}
                <span class="settings-item-arrow">›</span>
              </div>
            </div>
          </div>

          <!-- Group 3: System & Power -->
          <div class="settings-group">
            <div class="settings-group-header">Система</div>

            <div class="settings-item" id="btn-goto-about-item">
              <div class="settings-item-left">
                <div class="settings-item-icon" style="background:#475569;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>
                <div class="settings-item-text">
                  <div class="settings-item-title">О телефоне</div>
                  <div class="settings-item-sub">POCO X3 Pro • Android 14 • ${curRom.name}</div>
                </div>
              </div>
              <div class="settings-item-right"><span class="settings-item-arrow">›</span></div>
            </div>

            <div class="settings-item" id="btn-goto-system">
              <div class="settings-item-left">
                <div class="settings-item-icon" style="background:#dc2626;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
                </div>
                <div class="settings-item-text">
                  <div class="settings-item-title">Перезагрузка и сброс</div>
                  <div class="settings-item-sub">Reboot в Recovery/Fastboot • Очистка Dalvik • Format Data</div>
                </div>
              </div>
              <div class="settings-item-right"><span class="settings-item-arrow">›</span></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind Search Input
    const searchInput = document.getElementById('settings-search-input');
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      handleSearch(searchQuery, curRom);
    });

    // Navigation clicks
    document.getElementById('btn-goto-about').onclick = () => { sounds.click(); currentView = 'about'; render(); };
    document.getElementById('btn-goto-about-item').onclick = () => { sounds.click(); currentView = 'about'; render(); };
    document.getElementById('btn-goto-display').onclick = () => { sounds.click(); currentView = 'display'; render(); };
    document.getElementById('btn-goto-battery').onclick = () => { sounds.click(); currentView = 'battery'; render(); };
    document.getElementById('btn-goto-network').onclick = () => { sounds.click(); currentView = 'network'; render(); };
    document.getElementById('btn-goto-security').onclick = () => { sounds.click(); currentView = 'security'; render(); };
    document.getElementById('btn-goto-developer').onclick = () => { sounds.click(); currentView = 'developer'; render(); };
    document.getElementById('btn-goto-system').onclick = () => { sounds.click(); currentView = 'system'; render(); };
  }

  // --- SEARCH HANDLER ---
  function handleSearch(q, curRom) {
    const resBox = document.getElementById('settings-search-results');
    const defBox = document.getElementById('settings-default-content');
    if (!q.trim()) {
      resBox.style.display = 'none';
      defBox.style.display = 'flex';
      return;
    }
    resBox.style.display = 'block';
    defBox.style.display = 'none';

    const searchableItems = [
      { title: 'О телефоне', sub: 'Спецификации, процессор, память, ядро, сборка', view: 'about', icon: '📱' },
      { title: 'Частота экрана (Hz)', sub: '60 Гц, 90 Гц, 120 Гц, Peak Refresh Rate', view: 'display', icon: '📺' },
      { title: 'Тёмный режим (Dark Mode)', sub: 'Оформление AMOLED Black', view: 'display', icon: '🌙' },
      { title: 'Плотность экрана (DPI)', sub: 'Масштаб элементов интерфейса (392/440 DPI)', view: 'display', icon: '🔍' },
      { title: 'Батарея и производительность', sub: 'Game Turbo, энергосбережение, температура, заряд', view: 'battery', icon: '🔋' },
      { title: 'Быстрая зарядка 33W', sub: 'Параметры контроллера зарядки Xiaomi', view: 'battery', icon: '⚡' },
      { title: 'Wi-Fi и интернет', sub: 'Подключение 5 GHz, настройки сети', view: 'network', icon: '📶' },
      { title: 'Частный DNS (AdGuard)', sub: 'Блокировка баннеров и рекламы через DNS', view: 'network', icon: '🌐' },
      { title: 'Безопасность и Play Integrity', sub: 'Сертификация SafetyNet, Root Isolate', view: 'security', icon: '🛡️' },
      { title: 'KernelSU & Magisk', sub: 'Статус рутирования на уровне ядра Linux', view: 'security', icon: '👑' },
      { title: 'Отладка по USB (USB Debugging)', sub: 'Связь с консолью ADB на ПК', view: 'developer', icon: '🛠️' },
      { title: 'Заводская разблокировка (OEM)', sub: 'Разрешение разблокировки загрузчика', view: 'developer', icon: '🔓' },
      { title: 'Перезагрузка в Recovery (TWRP/OrangeFox)', sub: 'Запуск рекавери для прошивки архивов', view: 'system', icon: '🦊' },
      { title: 'Перезагрузка в Fastboot', sub: 'Режим загрузчика Poco X3 Pro', view: 'system', icon: '⚡' },
      { title: 'Сброс до заводских (Format Data)', sub: 'Очистка разделов, предотвращение бутлупа', view: 'system', icon: '⚠️' }
    ];

    const matches = searchableItems.filter(item => 
      item.title.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      resBox.innerHTML = `
        <div style="text-align:center; padding:30px 10px; color:#64748b;">
          <div style="font-size:32px; margin-bottom:8px;">🔍</div>
          <div>По запросу "<b>${q}</b>" ничего не найдено</div>
        </div>
      `;
      return;
    }

    resBox.innerHTML = `
      <div class="settings-group">
        <div class="settings-group-header">Результаты поиска (${matches.length})</div>
        ${matches.map((item, idx) => `
          <div class="settings-item search-match-item" data-view="${item.view}" style="cursor:pointer;">
            <div class="settings-item-left">
              <div class="settings-item-icon" style="background:#1e293b;">${item.icon}</div>
              <div class="settings-item-text">
                <div class="settings-item-title">${item.title}</div>
                <div class="settings-item-sub">${item.sub}</div>
              </div>
            </div>
            <div class="settings-item-right"><span class="settings-item-arrow">›</span></div>
          </div>
        `).join('')}
      </div>
    `;

    resBox.querySelectorAll('.search-match-item').forEach(el => {
      el.onclick = () => {
        sounds.click();
        currentView = el.dataset.view;
        render();
      };
    });
  }

  // === 2. ABOUT VIEW ===
  function renderAboutView(curRom) {
    container.innerHTML = `
      <div class="settings-container">
        <div class="settings-subpage-hero">
          <div class="settings-subpage-hero-icon">${curRom.icon}</div>
          <div class="settings-subpage-hero-title">${curRom.name}</div>
          <div class="settings-subpage-hero-desc">${curRom.desc}</div>
        </div>

        <div class="settings-group">
          <div class="settings-group-header">Характеристики устройства</div>

          <div class="settings-item">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Модель устройства</div>
                <div class="settings-item-sub">POCO X3 Pro (vayu / bhima)</div>
              </div>
            </div>
            <div class="settings-item-right"><span>Xiaomi Inc.</span></div>
          </div>

          <div class="settings-item" id="btn-tap-android" style="cursor:pointer;">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Версия Android</div>
                <div class="settings-item-sub">14 (UpsideDownCake) • Тапните 3 раза для пасхалки!</div>
              </div>
            </div>
            <div class="settings-item-right"><span style="color:#00f2fe; font-weight:800;">14 ›</span></div>
          </div>

          <div class="settings-item">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Процессор (SoC)</div>
                <div class="settings-item-sub">
                  ${GameState.kernel.includes('stormbreaker') ? 'Qualcomm Snapdragon 860 @ 3.20 GHz OC (StormBreaker)' : 'Qualcomm Snapdragon 860 Octa-Core @ 2.96 GHz'}
                </div>
              </div>
            </div>
          </div>

          <div class="settings-item">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Видеоускоритель</div>
                <div class="settings-item-sub">
                  ${GameState.kernel.includes('stormbreaker') ? 'Adreno 640 @ 825 MHz OC (Vulkan 1.3)' : 'Adreno 640 @ 675 MHz'}
                </div>
              </div>
            </div>
          </div>

          <div class="settings-item">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Оперативная память (RAM)</div>
                <div class="settings-item-sub">8.00 ГБ LPDDR4X (+3.0 ГБ виртуальной памяти RAM+)</div>
              </div>
            </div>
          </div>

          <div class="settings-item">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Внутренний накопитель</div>
                <div class="settings-item-sub">256 ГБ UFS 3.1 (Свободно: 201.8 ГБ)</div>
              </div>
            </div>
          </div>

          <div class="settings-item">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Ядро Linux (Kernel)</div>
                <div class="settings-item-sub" style="color:#00f2fe; font-family:monospace;">${GameState.kernelVersion}</div>
              </div>
            </div>
            <div class="settings-item-right">
              ${GameState.ksuWorking ? '<span style="color:#00e676; font-size:10px; font-weight:bold;">KSU HOOKED</span>' : ''}
            </div>
          </div>

          <div class="settings-item">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Статус загрузчика (Bootloader)</div>
                <div class="settings-item-sub">
                  ${GameState.bootloaderUnlocked ? 'Разблокирован (Unlocked) • Прошивка кастомов разрешена' : 'Заблокирован (Locked)'}
                </div>
              </div>
            </div>
            <div class="settings-item-right">
              <span style="color:${GameState.bootloaderUnlocked ? '#00e676' : '#ff3366'}; font-weight:bold;">
                ${GameState.bootloaderUnlocked ? 'UNLOCKED' : 'LOCKED'}
              </span>
            </div>
          </div>

          <div class="settings-item" id="btn-toggle-selinux" style="cursor:pointer;">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Режим SELinux</div>
                <div class="settings-item-sub">Текущий статус: ${GameState.selinuxMode === 'enforcing' ? 'Enforcing (Строгий)' : 'Permissive (Мягкий)'}</div>
              </div>
            </div>
            <div class="settings-item-right">
              <span style="color:${GameState.selinuxMode === 'enforcing' ? '#00e676' : '#f59e0b'}; font-weight:bold; font-size:11px;">
                ${GameState.selinuxMode.toUpperCase()}
              </span>
            </div>
          </div>

          <div class="settings-item" id="btn-build-number" style="cursor:pointer; background:rgba(0, 242, 254, 0.05);">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Номер сборки</div>
                <div class="settings-item-sub" style="font-family:monospace;">UQ1A.240205.002.A1 (4PDA-Mod)</div>
                <div id="build-tap-hint" style="font-size:10px; color:#00f2fe; margin-top:2px;">
                  ${GameState.developerUnlocked ? '✓ Режим разработчика разблокирован!' : 'Тапните 7 раз для включения режима разработчика'}
                </div>
              </div>
            </div>
            <div class="settings-item-right"><span style="color:#00f2fe;">🛠️</span></div>
          </div>
        </div>
      </div>
    `;

    // Android 14 Easter Egg Tap
    document.getElementById('btn-tap-android').onclick = () => {
      sounds.click();
      sounds.vibrate(30);
      easterEggTapCount++;
      if (easterEggTapCount >= 3) {
        easterEggTapCount = 0;
        currentView = 'easter_egg';
        render();
      }
    };

    // SELinux toggle
    document.getElementById('btn-toggle-selinux').onclick = () => {
      sounds.click();
      sounds.vibrate(25);
      GameState.selinuxMode = GameState.selinuxMode === 'enforcing' ? 'permissive' : 'enforcing';
      render();
    };

    // 7 Taps on Build Number
    document.getElementById('btn-build-number').onclick = () => {
      sounds.click();
      if (GameState.developerUnlocked) {
        alert('Вы уже являетесь разработчиком!');
        return;
      }
      GameState.buildTapCount++;
      sounds.vibrate(35);
      const left = 7 - GameState.buildTapCount;
      const hint = document.getElementById('build-tap-hint');
      if (left > 0) {
        hint.textContent = `Осталось шагов: ${left}`;
      } else {
        GameState.developerUnlocked = true;
        sounds.bootChime();
        sounds.vibrate(150);
        hint.textContent = '🎉 Режим разработчика активирован!';
        alert('🎉 Поздравляем! Меню «Для разработчиков» разблокировано.');
      }
    };
  }

  // === 3. DISPLAY VIEW ===
  function renderDisplayView() {
    container.innerHTML = `
      <div class="settings-container">
        <div class="settings-group">
          <div class="settings-group-header">Частота обновления экрана</div>
          <div style="padding:14px 16px;">
            <div style="font-size:12px; color:#94a3b8; margin-bottom:10px;">
              Выберите частоту для плавности отображения элементов и игр.
            </div>
            <div class="settings-tile-grid">
              <div class="settings-tile ${GameState.displayRefreshRate === 60 ? 'active' : ''}" data-hz="60">
                <div class="settings-tile-title">60 Hz</div>
                <div class="settings-tile-sub">Энергия</div>
              </div>
              <div class="settings-tile ${GameState.displayRefreshRate === 90 ? 'active' : ''}" data-hz="90">
                <div class="settings-tile-title">90 Hz</div>
                <div class="settings-tile-sub">Баланс</div>
              </div>
              <div class="settings-tile ${GameState.displayRefreshRate === 120 ? 'active' : ''}" data-hz="120">
                <div class="settings-tile-title">120 Hz</div>
                <div class="settings-tile-sub">Плавность</div>
              </div>
            </div>
          </div>

          <div class="settings-item" id="btn-toggle-peak-hz">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Принудительные 120 Гц (Peak Rate)</div>
                <div class="settings-item-sub">Блокирует сброс частоты кадров до 60 FPS в видео и играх</div>
              </div>
            </div>
            <div class="settings-item-right">
              <div class="settings-switch ${GameState.forcePeakRefreshRate ? 'active' : ''}">
                <div class="settings-switch-thumb"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="settings-group">
          <div class="settings-group-header">Цвет и оформление</div>

          <div class="settings-item" id="btn-toggle-dark-mode">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Тёмная тема (AMOLED Black)</div>
                <div class="settings-item-sub">Глубокий чёрный цвет для экономии заряда батареи</div>
              </div>
            </div>
            <div class="settings-item-right">
              <div class="settings-switch ${GameState.darkMode ? 'active' : ''}">
                <div class="settings-switch-thumb"></div>
              </div>
            </div>
          </div>

          <div class="settings-item" id="btn-toggle-color-mode">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Цветовой охват</div>
                <div class="settings-item-sub">Текущий профиль: ${GameState.displayColorMode === 'dci_p3' ? 'DCI-P3 (Насыщенный)' : 'sRGB (Натуральный)'}</div>
              </div>
            </div>
            <div class="settings-item-right"><span style="color:#00f2fe; font-size:11px; font-weight:bold;">${GameState.displayColorMode.toUpperCase()}</span></div>
          </div>

          <div class="settings-item" id="btn-toggle-dpi">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Минимальная ширина (DPI)</div>
                <div class="settings-item-sub">Масштаб интерфейса: ${GameState.dpiScale} dp (${GameState.dpiScale === 392 ? 'Стандартный' : 'Компактный'})</div>
              </div>
            </div>
            <div class="settings-item-right"><span style="color:#00e676; font-weight:bold;">${GameState.dpiScale} dp</span></div>
          </div>
        </div>
      </div>
    `;

    // Bind Hz tiles
    container.querySelectorAll('.settings-tile').forEach(tile => {
      tile.onclick = () => {
        sounds.click();
        sounds.vibrate(20);
        const hz = parseInt(tile.dataset.hz);
        GameState.displayRefreshRate = hz;
        UI.osFpsBadge.textContent = `${hz} Hz`;
        render();
      };
    });

    // Peak rate toggle
    document.getElementById('btn-toggle-peak-hz').onclick = () => {
      sounds.click();
      sounds.vibrate(20);
      GameState.forcePeakRefreshRate = !GameState.forcePeakRefreshRate;
      if (GameState.forcePeakRefreshRate) GameState.displayRefreshRate = 120;
      UI.osFpsBadge.textContent = `${GameState.displayRefreshRate} Hz`;
      render();
    };

    // Dark mode toggle
    document.getElementById('btn-toggle-dark-mode').onclick = () => {
      sounds.click();
      sounds.vibrate(20);
      GameState.darkMode = !GameState.darkMode;
      render();
    };

    // Color mode toggle
    document.getElementById('btn-toggle-color-mode').onclick = () => {
      sounds.click();
      sounds.vibrate(20);
      GameState.displayColorMode = GameState.displayColorMode === 'dci_p3' ? 'srgb' : 'dci_p3';
      render();
    };

    // DPI toggle
    document.getElementById('btn-toggle-dpi').onclick = () => {
      sounds.click();
      sounds.vibrate(20);
      GameState.dpiScale = GameState.dpiScale === 392 ? 440 : 392;
      render();
    };
  }

  // === 4. BATTERY VIEW ===
  function renderBatteryView() {
    container.innerHTML = `
      <div class="settings-container">
        <!-- Battery Meter -->
        <div class="battery-gauge-box">
          <div class="battery-gauge-num">${GameState.battery}%</div>
          <div class="battery-gauge-label">
            ${GameState.usbConnected ? '⚡ Идет быстрая зарядка (Mi Turbo Charge 33W)' : 'Осталось ~19 ч 45 мин работы'}
          </div>
          <div style="display:flex; justify-content:center; gap:16px; margin-top:14px; font-size:11px; color:#94a3b8;">
            <span>Здоровье: <b style="color:#00e676;">98% (5 160 мАч)</b></span>
            <span>•</span>
            <span>Температура: <b style="color:#00f2fe;">31.8°C</b></span>
          </div>
        </div>

        <div class="settings-group">
          <div class="settings-group-header">Режим производительности</div>
          <div style="padding:14px 16px;">
            <div class="settings-tile-grid">
              <div class="settings-tile ${GameState.perfProfile === 'powersave' ? 'active' : ''}" data-perf="powersave">
                <div class="settings-tile-title">🍃 Эко</div>
                <div class="settings-tile-sub">60 Гц / Сбережение</div>
              </div>
              <div class="settings-tile ${GameState.perfProfile === 'balanced' ? 'active' : ''}" data-perf="balanced">
                <div class="settings-tile-title">⚖️ Баланс</div>
                <div class="settings-tile-sub">Адаптивный режим</div>
              </div>
              <div class="settings-tile ${GameState.perfProfile === 'performance' ? 'active' : ''}" data-perf="performance">
                <div class="settings-tile-title">🚀 Turbo</div>
                <div class="settings-tile-sub">Макс. FPS</div>
              </div>
            </div>
          </div>
        </div>

        <div class="settings-group">
          <div class="settings-group-header">Расход заряда приложениями</div>

          <div class="settings-item">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Экран (Screen on time: 5 ч 42 мин)</div>
                <div class="settings-item-sub">Яркость 80%, частота 120 Гц</div>
              </div>
            </div>
            <div class="settings-item-right"><b style="color:#f1f5f9;">42%</b></div>
          </div>

          <div class="settings-item">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Игры и тесты (PUBG Mobile, AnTuTu)</div>
                <div class="settings-item-sub">Рендеринг Adreno 640 @ 825MHz</div>
              </div>
            </div>
            <div class="settings-item-right"><b style="color:#f1f5f9;">34%</b></div>
          </div>

          <div class="settings-item">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Система Android & Kernel</div>
                <div class="settings-item-sub">Фоновые процессы ядра Linux</div>
              </div>
            </div>
            <div class="settings-item-right"><b style="color:#f1f5f9;">16%</b></div>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.settings-tile').forEach(tile => {
      tile.onclick = () => {
        sounds.click();
        sounds.vibrate(25);
        GameState.perfProfile = tile.dataset.perf;
        if (GameState.perfProfile === 'performance') {
          GameState.displayRefreshRate = 120;
          UI.osFpsBadge.textContent = '120 Hz';
        } else if (GameState.perfProfile === 'powersave') {
          GameState.displayRefreshRate = 60;
          UI.osFpsBadge.textContent = '60 Hz';
        }
        render();
      };
    });
  }

  // === 5. NETWORK VIEW ===
  function renderNetworkView() {
    container.innerHTML = `
      <div class="settings-container">
        <div class="settings-group">
          <div class="settings-group-header">Беспроводные сети</div>

          <div class="settings-item">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Wi-Fi (Подключено)</div>
                <div class="settings-item-sub">4PDA_Modder_5GHz • 866 Мбит/с • WPA3</div>
              </div>
            </div>
            <div class="settings-item-right">
              <div class="settings-switch active"><div class="settings-switch-thumb"></div></div>
            </div>
          </div>

          <div class="settings-item">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Мобильная сеть (SIM 1)</div>
                <div class="settings-item-sub">Tele2 4G+ VoLTE • Передача данных активна</div>
              </div>
            </div>
            <div class="settings-item-right">
              <div class="settings-switch active"><div class="settings-switch-thumb"></div></div>
            </div>
          </div>

          <div class="settings-item" id="btn-toggle-dns" style="cursor:pointer;">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Частный DNS (Private DNS)</div>
                <div class="settings-item-sub">Сервер: ${GameState.privateDns} (Блокировка рекламы)</div>
              </div>
            </div>
            <div class="settings-item-right"><span style="color:#00e676; font-weight:bold; font-size:11px;">АКТИВЕН</span></div>
          </div>

          <div class="settings-item">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Точка доступа Wi-Fi</div>
                <div class="settings-item-sub">Poco_Hotspot (Выключено)</div>
              </div>
            </div>
            <div class="settings-item-right">
              <div class="settings-switch"><div class="settings-switch-thumb"></div></div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-toggle-dns').onclick = () => {
      sounds.click();
      sounds.vibrate(20);
      GameState.privateDns = GameState.privateDns === 'dns.adguard.com' ? '1dot1dot1dot1.cloudflare-dns.com' : 'dns.adguard.com';
      render();
    };
  }

  // === 6. SECURITY VIEW ===
  function renderSecurityView() {
    const isStrong = GameState.ksuUnmountRoot.has('bank');
    container.innerHTML = `
      <div class="settings-container">
        <div class="settings-group">
          <div class="settings-group-header">Аттестация и целостность устройства</div>

          <div class="settings-item">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Google Play Protect</div>
                <div class="settings-item-sub">Устройство сертифицировано Google</div>
              </div>
            </div>
            <div class="settings-item-right"><span style="color:#00e676; font-weight:bold;">CERTIFIED ✓</span></div>
          </div>

          <div class="settings-item">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Play Integrity API</div>
                <div class="settings-item-sub">MEETS_BASIC: ✅ | MEETS_DEVICE: ✅ | MEETS_STRONG: ${isStrong ? '✅' : '⚠️'}</div>
              </div>
            </div>
            <div class="settings-item-right">
              <span style="color:${isStrong ? '#00e676' : '#f59e0b'}; font-weight:bold; font-size:11px;">
                ${isStrong ? 'STRONG PASS' : 'NEEDS UNMOUNT'}
              </span>
            </div>
          </div>
        </div>

        <div class="settings-group">
          <div class="settings-group-header">Подсистема Root-доступа</div>

          <div class="settings-item">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">KernelSU (Ядерный перехват)</div>
                <div class="settings-item-sub">
                  ${GameState.ksuWorking ? 'Версия v0.9.5 активна в /boot (ядро Linux)' : 'Не обнаружен в ядре (установите NGK Kernel)'}
                </div>
              </div>
            </div>
            <div class="settings-item-right">
              <span style="color:${GameState.ksuWorking ? '#00e676' : '#64748b'}; font-weight:bold; font-size:11px;">
                ${GameState.ksuWorking ? 'WORKING' : 'DISABLED'}
              </span>
            </div>
          </div>

          <div class="settings-item">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Magisk Root (Ramdisk)</div>
                <div class="settings-item-sub">
                  ${GameState.magiskInstalled ? 'Magisk v27.0 установлен (Zygisk активен)' : 'Не установлен'}
                </div>
              </div>
            </div>
            <div class="settings-item-right">
              <span style="color:${GameState.magiskInstalled ? '#00e676' : '#64748b'}; font-weight:bold; font-size:11px;">
                ${GameState.magiskInstalled ? 'INSTALLED' : 'ABSENT'}
              </span>
            </div>
          </div>

          <div class="settings-item">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Шифрование данных пользователя</div>
                <div class="settings-item-sub">File-Based Encryption (FBE v2)</div>
              </div>
            </div>
            <div class="settings-item-right"><span style="color:#00e676; font-size:11px;">ENCRYPTED</span></div>
          </div>
        </div>
      </div>
    `;
  }

  // === 7. DEVELOPER VIEW ===
  function renderDeveloperView() {
    if (!GameState.developerUnlocked) {
      container.innerHTML = `
        <div class="settings-container">
          <div class="settings-subpage-hero" style="padding:40px 16px;">
            <div class="settings-subpage-hero-icon">🔒</div>
            <div class="settings-subpage-hero-title">Меню разработчика заблокировано</div>
            <div class="settings-subpage-hero-desc" style="max-width:280px; margin:8px auto;">
              Для разблокировки перейдите в <b>«О телефоне»</b> и быстро нажмите 7 раз на строку <b>«Номер сборки»</b>.
            </div>
            <button id="btn-goto-about-dev" class="rec-big-btn" style="margin-top:20px; display:inline-block; width:auto; padding:10px 24px;">
              Перейти в «О телефоне»
            </button>
          </div>
        </div>
      `;
      document.getElementById('btn-goto-about-dev').onclick = () => {
        sounds.click();
        currentView = 'about';
        render();
      };
      return;
    }

    container.innerHTML = `
      <div class="settings-container">
        <div class="settings-group">
          <div class="settings-group-header">Отладка и связь с ПК</div>

          <div class="settings-item" id="btn-toggle-usb-debug" style="cursor:pointer;">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Отладка по USB (USB Debugging)</div>
                <div class="settings-item-sub">Разрешить команды ADB с подключенного ПК</div>
              </div>
            </div>
            <div class="settings-item-right">
              <div class="settings-switch ${GameState.usbDebugging ? 'active' : ''}">
                <div class="settings-switch-thumb"></div>
              </div>
            </div>
          </div>

          <div class="settings-item">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Заводская разблокировка (OEM Unlock)</div>
                <div class="settings-item-sub">Разрешить разблокировку загрузчика в Fastboot</div>
              </div>
            </div>
            <div class="settings-item-right">
              <div class="settings-switch active"><div class="settings-switch-thumb"></div></div>
            </div>
          </div>

          <div class="settings-item" id="btn-restart-adbd" style="cursor:pointer;">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Перезапустить ADB демон (kill-server)</div>
                <div class="settings-item-sub">Сбросить сессию adbd на порту 5555</div>
              </div>
            </div>
            <div class="settings-item-right"><span style="color:var(--accent-cyan);">🔄</span></div>
          </div>
        </div>

        <div class="settings-group">
          <div class="settings-group-header">Аппаратное ускорение и отрисовка</div>

          <div class="settings-item" id="btn-toggle-fps-overlay" style="cursor:pointer;">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Отображать частоту обновления (Hz / FPS)</div>
                <div class="settings-item-sub">Показывать счетчик кадров поверх всех окон</div>
              </div>
            </div>
            <div class="settings-item-right">
              <div class="settings-switch active"><div class="settings-switch-thumb"></div></div>
            </div>
          </div>

          <div class="settings-item" id="btn-toggle-msaa" style="cursor:pointer;">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Принудительный 4x MSAA</div>
                <div class="settings-item-sub">Сглаживание текстур в 3D играх (OpenGL ES 3.2)</div>
              </div>
            </div>
            <div class="settings-item-right">
              <div class="settings-switch ${GameState.forceMsaa ? 'active' : ''}">
                <div class="settings-switch-thumb"></div>
              </div>
            </div>
          </div>

          <div class="settings-item" id="btn-toggle-anim-scale" style="cursor:pointer;">
            <div class="settings-item-left">
              <div class="settings-item-text">
                <div class="settings-item-title">Скорость анимаций</div>
                <div class="settings-item-sub">Анимация окон и переходов: ${GameState.animationScale}</div>
              </div>
            </div>
            <div class="settings-item-right"><span style="color:#00f2fe; font-weight:bold;">${GameState.animationScale}</span></div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-toggle-usb-debug').onclick = () => {
      sounds.click();
      sounds.vibrate(20);
      GameState.usbDebugging = !GameState.usbDebugging;
      render();
    };

    document.getElementById('btn-restart-adbd').onclick = () => {
      sounds.click();
      sounds.vibrate(40);
      alert('adbd: демон успешно перезапущен. Порт 5555 слушает подключения.');
    };

    document.getElementById('btn-toggle-msaa').onclick = () => {
      sounds.click();
      sounds.vibrate(20);
      GameState.forceMsaa = !GameState.forceMsaa;
      render();
    };

    document.getElementById('btn-toggle-anim-scale').onclick = () => {
      sounds.click();
      sounds.vibrate(20);
      const scales = ['0.5x', '1.0x', 'Без анимаций'];
      const nextIdx = (scales.indexOf(GameState.animationScale) + 1) % scales.length;
      GameState.animationScale = scales[nextIdx];
      render();
    };
  }

  // === 8. SYSTEM VIEW ===
  function renderSystemView() {
    container.innerHTML = `
      <div class="settings-container">
        <div class="settings-group">
          <div class="settings-group-header">Меню перезагрузки (Power Menu)</div>

          <div class="settings-item" id="btn-rb-sys" style="cursor:pointer;">
            <div class="settings-item-left">
              <div class="settings-item-icon" style="background:#0284c7;">🔄</div>
              <div class="settings-item-text">
                <div class="settings-item-title">Обычная перезагрузка (Reboot System)</div>
                <div class="settings-item-sub">Перезапуск текущей операционной системы</div>
              </div>
            </div>
            <div class="settings-item-right"><span class="settings-item-arrow">›</span></div>
          </div>

          <div class="settings-item" id="btn-rb-rec" style="cursor:pointer;">
            <div class="settings-item-left">
              <div class="settings-item-icon" style="background:#ea580c;">🦊</div>
              <div class="settings-item-text">
                <div class="settings-item-title">Перезагрузка в Recovery</div>
                <div class="settings-item-sub">Запуск ${GameState.recoveryType === 'orangefox' ? 'OrangeFox R11.1' : 'TWRP 3.7.0'}</div>
              </div>
            </div>
            <div class="settings-item-right"><span class="settings-item-arrow">›</span></div>
          </div>

          <div class="settings-item" id="btn-rb-bootloader" style="cursor:pointer;">
            <div class="settings-item-left">
              <div class="settings-item-icon" style="background:#4f46e5;">⚡</div>
              <div class="settings-item-text">
                <div class="settings-item-title">Перезагрузка в Fastboot (Bootloader)</div>
                <div class="settings-item-sub">Режим прошивки через ПК консоль</div>
              </div>
            </div>
            <div class="settings-item-right"><span class="settings-item-arrow">›</span></div>
          </div>

          <div class="settings-item" id="btn-rb-edl" style="cursor:pointer;">
            <div class="settings-item-left">
              <div class="settings-item-icon" style="background:#b91c1c;">💀</div>
              <div class="settings-item-text">
                <div class="settings-item-title">Аварийный режим EDL (Qualcomm 9008)</div>
                <div class="settings-item-sub">Экстренное раскирпичивание через тест-поинты</div>
              </div>
            </div>
            <div class="settings-item-right"><span style="color:#ff3366; font-size:11px;">EDL 9008</span></div>
          </div>
        </div>

        <div class="settings-group">
          <div class="settings-group-header">Очистка и сброс</div>

          <div class="settings-item" id="btn-wipe-dalvik" style="cursor:pointer;">
            <div class="settings-item-left">
              <div class="settings-item-icon" style="background:#059669;">🧹</div>
              <div class="settings-item-text">
                <div class="settings-item-title">Очистить Dalvik / ART кэш</div>
                <div class="settings-item-sub">Очистка байткода приложений для устранения сбоев</div>
              </div>
            </div>
            <div class="settings-item-right"><span class="settings-item-arrow">›</span></div>
          </div>

          <div class="settings-item" id="btn-factory-reset" style="cursor:pointer; background:rgba(239, 68, 68, 0.08);">
            <div class="settings-item-left">
              <div class="settings-item-icon" style="background:#dc2626;">⚠️</div>
              <div class="settings-item-text">
                <div class="settings-item-title" style="color:#ff5252;">Сброс до заводских (Format Data)</div>
                <div class="settings-item-sub">Полное стирание данных пользователя (/data) и сброс настроек</div>
              </div>
            </div>
            <div class="settings-item-right"><span style="color:#ff5252; font-weight:bold;">RESET</span></div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-rb-sys').onclick = () => {
      closeFullscreenApp(true);
      bootDevice();
    };
    document.getElementById('btn-rb-rec').onclick = () => {
      closeFullscreenApp(true);
      bootToRecovery();
    };
    document.getElementById('btn-rb-bootloader').onclick = () => {
      closeFullscreenApp(true);
      bootToFastboot();
    };
    document.getElementById('btn-rb-edl').onclick = () => {
      closeFullscreenApp(true);
      setScreenState('CRASHDUMP');
    };
    document.getElementById('btn-wipe-dalvik').onclick = () => {
      sounds.click();
      sounds.vibrate(30);
      alert('🧹 Dalvik / ART Cache успешно очищен! Кэш приложений сброшен.');
    };
    document.getElementById('btn-factory-reset').onclick = () => {
      sounds.errorTone();
      sounds.vibrate(60);
      if (confirm('⚠️ ВНИМАНИЕ! Это действие сотрет все данные пользователя (/data), настройки и вызовет перезагрузку. Продолжить?')) {
        GameState.phoneStorage.clear();
        GameState.modules.clear();
        closeFullscreenApp(true);
        bootDevice();
      }
    };
  }

  // === 9. EASTER EGG VIEW ===
  function renderEasterEggView() {
    container.innerHTML = `
      <div class="settings-container" style="text-align:center; padding:30px 10px;">
        <div style="font-size:72px; animation:boot-pulse 1.5s infinite;">🚀</div>
        <div style="font-size:24px; font-weight:900; color:#00f2fe; margin-top:12px;">Android 14</div>
        <div style="font-size:14px; color:#94a3b8; margin-top:4px;">UpsideDownCake • Space Rocket Mission</div>
        
        <div style="background:#161d2b; border:1px solid #28354c; border-radius:18px; padding:18px; margin:24px 0; text-align:left;">
          <div style="color:#00e676; font-weight:700; font-size:13px; margin-bottom:6px;">🛰️ Полет нормальный!</div>
          <div style="font-size:12px; color:#cbd5e1; line-height:1.5;">
            Вы открыли секретную пасхалку Android 14. Смартфон POCO X3 Pro (vayu) успешно синхронизирован со станцией моддинга 4PDA.
          </div>
        </div>

        <button id="btn-exit-easter-egg" class="rec-big-btn" style="display:inline-block; width:auto; padding:12px 30px;">
          ← Назад в настройки
        </button>
      </div>
    `;

    document.getElementById('btn-exit-easter-egg').onclick = () => {
      sounds.click();
      currentView = 'about';
      render();
    };
  }

  // Initial render
  render();
}

// --- APP: RICH LINUX BASH TERMUX ---
function renderTermuxApp(container) {
  let isSuSession = false;
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%;">
      <div id="termux-output" style="flex:1; background:#000; color:#39ff14; font-family:monospace; font-size:11.5px; padding:12px; border-radius:8px; overflow-y:auto; white-space:pre-wrap; margin-bottom:10px; height:280px; line-height:1.4;">
Welcome to Termux on POCO X3 Pro (vayu)!
Type 'help' for available commands.
Type 'su' or 'ksu' to request root permissions.
      </div>
      <div style="display:flex; gap:8px;">
        <span id="termux-prompt" style="font-family:monospace; font-size:13px; color:#00f2fe; align-self:center;">$</span>
        <input type="text" id="termux-input" style="flex:1; background:#111; border:1px solid #333; color:#fff; font-family:monospace; font-size:12px; padding:8px 10px; border-radius:6px;" placeholder="help, neofetch, su, ls, free, uname" autocomplete="off">
        <button id="termux-btn-send" style="background:#238636; color:#fff; border:none; padding:8px 14px; border-radius:6px; font-weight:bold; cursor:pointer;">↵</button>
      </div>
      <div style="display:flex; gap:6px; margin-top:8px; overflow-x:auto;">
        <button class="q-btn" data-tcmd="help">help</button>
        <button class="q-btn" data-tcmd="neofetch">neofetch</button>
        <button class="q-btn" data-tcmd="su">su</button>
        <button class="q-btn" data-tcmd="ls /sdcard">ls /sdcard</button>
        <button class="q-btn" data-tcmd="free -m">free -m</button>
        <button class="q-btn" data-tcmd="ps">ps</button>
      </div>
    </div>
  `;

  const output = document.getElementById('termux-output');
  const input = document.getElementById('termux-input');
  const prompt = document.getElementById('termux-prompt');

  const exec = (cmd) => {
    cmd = cmd.trim();
    if (!cmd) return;
    output.textContent += `\n${prompt.textContent} ${cmd}\n`;
    sounds.click();

    const parts = cmd.split(' ');
    const main = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    if (main === 'clear') {
      output.textContent = '';
    } else if (main === 'help') {
      output.textContent += `Available shell commands:
  help       - Print this help message
  neofetch   - Display system info & ASCII art
  su / ksu   - Escalate to superuser (root)
  whoami     - Print current user ID
  id         - Print UID and GID info
  uname -a   - Print Linux kernel version
  ls [path]  - List directory contents
  cat [file] - Display file contents
  free -m    - Display RAM and swap memory
  df -h      - Display disk partition usage
  ps / top   - Display running processes
  getprop    - Get Android build properties
  setprop    - Set Android build property
  reboot     - Reboot system [recovery|bootloader]
  clear      - Clear terminal window\n`;
    } else if (main === 'su' || main === 'ksu') {
      if (GameState.ksuWorking) {
        if (!GameState.ksuSuperuserApps.has('termux')) {
          triggerSuDialog('KernelSU', () => {
            GameState.ksuSuperuserApps.add('termux');
            isSuSession = true;
            prompt.textContent = '#';
            prompt.style.color = '#ff3366';
            output.textContent += 'Superuser access granted via KernelSU!\n';
            sounds.bootChime();
            checkQuest('ksu_root');
          });
        } else {
          isSuSession = true;
          prompt.textContent = '#';
          prompt.style.color = '#ff3366';
          output.textContent += 'KernelSU: uid=0(root) active.\n';
        }
      } else if (GameState.magiskInstalled) {
        triggerSuDialog('Magisk', () => {
          isSuSession = true;
          prompt.textContent = '#';
          prompt.style.color = '#ff3366';
          output.textContent += 'Superuser access granted via Magisk su binary!\n';
          sounds.bootChime();
        });
      } else {
        sounds.errorTone();
        output.textContent += 'Permission denied: no root found. Flash KernelSU or Magisk in Recovery!\n';
      }
    } else if (main === 'whoami') {
      output.textContent += isSuSession ? 'root\n' : 'u0_a142\n';
    } else if (main === 'id') {
      output.textContent += isSuSession ? 'uid=0(root) gid=0(root) groups=0(root),context=u:r:kernel:s0\n' : 'uid=10148(u0_a148) gid=10148(u0_a148)\n';
    } else if (main === 'uname') {
      output.textContent += `Linux localhost ${GameState.kernelVersion} #1 SMP PREEMPT aarch64 Android\n`;
    } else if (main === 'free') {
      output.textContent += `              total        used        free      shared     buff/cache   available
Mem:           7842        3412        2140         128           2290        4150
Swap:          3072         410        2662\n`;
    } else if (main === 'df') {
      output.textContent += `Filesystem           Size     Used    Avail   Use%  Mounted on
/dev/block/dm-0      4.2G     3.8G     400M    90%  /system
/dev/block/dm-1      1.8G     1.6G     200M    88%  /vendor
/dev/block/sda32     225G      54G     171G    24%  /data
/data/media          225G      54G     171G    24%  /sdcard\n`;
    } else if (main === 'ps' || main === 'top') {
      output.textContent += `USER       PID  %CPU %MEM   VSZ   RSS TTY      STAT START   TIME COMMAND
root         1   0.0  0.1  2.1M  1.1M ?        Ss   12:00   0:02 init
root       412   1.2  0.4 12.4M  4.2M ?        S    12:00   0:15 /system/bin/surfaceflinger
system     890   4.2  8.2  1.8G  640M ?        Sl   12:01   1:42 system_server
u0_a142   2412   2.1  1.4  420M  110M pts/0    R+   12:10   0:05 /data/data/com.termux/files/usr/bin/bash\n`;
    } else if (main === 'ls') {
      const p = arg || '/sdcard';
      if (p.includes('sdcard')) {
        const files = Array.from(new Set([...GameState.phoneStorage, ...GameState.pcDownloads, 'Android', 'DCIM', 'Download', 'TWRP']));
        output.textContent += files.join('   ') + '\n';
      } else {
        output.textContent += 'bin   etc   lib64   build.prop   framework   app   xbin\n';
      }
    } else if (main === 'cat') {
      if (arg.includes('build.prop')) {
        output.textContent += Object.keys(GameState.buildProp).map(k => `${k}=${GameState.buildProp[k]}`).join('\n') + '\n';
      } else if (arg.includes('cpuinfo')) {
        output.textContent += `Processor\t: AArch64 Processor rev 14 (aarch64)
Hardware\t: Qualcomm Technologies, Inc SM8150 (Snapdragon 860)
Features\t: fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp\n`;
      } else {
        output.textContent += `cat: ${arg}: No such file or directory\n`;
      }
    } else if (main === 'neofetch') {
      output.textContent += `
       .-.          u0_a142@vayu
      /   \\         --------------------
     |     |        OS: Android 14 (${GameState.rom || 'Stock'})
     |     |        Host: ${GameState.model}
     |     |        Kernel: ${GameState.kernelVersion}
      \\   /         Uptime: 2 hours, 14 mins
       '-'          CPU: Snapdragon 860 @ ${GameState.cpuFreq}GHz (8 cores)
                    GPU: Adreno 640 @ ${GameState.gpuFreq}MHz
                    Memory: 3412MiB / 7842MiB
                    Root: ${GameState.ksuWorking ? 'KernelSU v0.9.5' : (GameState.magiskInstalled ? 'Magisk v27' : 'None')}\n`;
    } else if (main === 'reboot') {
      if (arg === 'recovery') {
        output.textContent += 'Rebooting into recovery...\n';
        setTimeout(bootToRecovery, 500);
      } else if (arg === 'bootloader' || arg === 'fastboot') {
        output.textContent += 'Rebooting into bootloader...\n';
        setTimeout(bootToFastboot, 500);
      } else {
        output.textContent += 'Rebooting system...\n';
        setTimeout(bootDevice, 500);
      }
    } else {
      output.textContent += `sh: command not found: ${main}. Type 'help' for command list.\n`;
    }

    output.scrollTop = output.scrollHeight;
    input.value = '';
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      exec(input.value);
    }
  });

  document.getElementById('termux-btn-send').addEventListener('click', () => {
    exec(input.value);
  });

  container.querySelectorAll('.q-btn').forEach(btn => {
    btn.onclick = () => {
      exec(btn.dataset.tcmd);
    };
  });
}

function triggerSuDialog(provider, onGranted) {
  UI.magiskSuPrompt.style.display = 'block';
  UI.suPromptTitle.textContent = `${provider} Superuser Request`;
  UI.suPromptDesc.textContent = `Приложение Termux запрашивает root через ${provider}!`;
  sounds.vibrate(60);
  let timeLeft = 10;
  const timer = setInterval(() => {
    timeLeft--;
    UI.suCountdown.textContent = `Таймаут: ${timeLeft}с`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      UI.magiskSuPrompt.style.display = 'none';
    }
  }, 1000);

  UI.suBtnGrant.onclick = () => {
    clearInterval(timer);
    UI.magiskSuPrompt.style.display = 'none';
    sounds.click();
    onGranted();
  };

  UI.suBtnDeny.onclick = () => {
    clearInterval(timer);
    UI.magiskSuPrompt.style.display = 'none';
    sounds.click();
  };
}

// --- APP: SBERBANK (REAL INTEGRITY CHECK) ---
function renderBankApp(container) {
  const isKsuHidden = GameState.ksuWorking && GameState.ksuUnmountRoot.has('bank');
  const isModuleBypassed = GameState.modules.has('PlayIntegrityFix') || GameState.modules.has('Shamiko');
  const isSafe = (!GameState.bootloaderUnlocked && !GameState.ksuWorking && !GameState.magiskInstalled) || isKsuHidden || isModuleBypassed;

  container.innerHTML = `
    <div style="text-align:center; padding:20px 10px;">
      <div style="font-size:46px; margin-bottom:8px;">🏦</div>
      <h3 style="font-size:18px;">СберБанк Онлайн</h3>
      <p style="font-size:12px; color:#888;">Проверка безопасности Google Play Integrity...</p>
      <div id="bank-result-box" style="margin-top:20px; padding:16px; border-radius:12px; text-align:left;">
        <div class="boot-spinner" style="margin:16px auto;"></div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const box = document.getElementById('bank-result-box');
    if (!box) return;

    if (isSafe) {
      sounds.bootChime();
      box.style.background = '#064e3b';
      box.style.border = '1px solid #059669';
      box.innerHTML = `
        <b style="color:#34d399; font-size:14px;">✅ Безопасность подтверждена!</b>
        <p style="font-size:12px; margin-top:6px; color:#d1fae5;">
          • MEETS_DEVICE_INTEGRITY: true<br>
          • MEETS_BASIC_INTEGRITY: true<br>
          • ${isKsuHidden ? 'KernelSU: Root изолирован и размонтирован из пространства имен банка!' : 'Play Integrity Fix активен.'}
        </p>
        <div style="margin-top:14px; background:rgba(0,0,0,0.3); padding:12px; border-radius:8px; text-align:center;">
          <span style="font-size:11px; color:#aaa;">Текущий баланс карты:</span>
          <div style="font-size:24px; font-weight:bold; color:#10b981;">1 337 228 ₽</div>
        </div>
      `;
      checkQuest('bank');
    } else {
      sounds.errorTone();
      box.style.background = '#450a0a';
      box.style.border = '1px solid #dc2626';
      box.innerHTML = `
        <b style="color:#f87171; font-size:14px;">❌ Вход заблокирован (Угроза безопасности)!</b>
        <p style="font-size:12px; margin-top:6px; color:#fecaca;">
          Обнаружен Root или разблокированный Bootloader!<br>
          Play Integrity: FAILED (NO_INTEGRITY)<br><br>
          <b>Как исправить:</b><br>
          • В <b>KernelSU Manager</b> включите «Изолировать root» для СберБанка!<br>
          • Или установите модуль <code>PlayIntegrityFix.zip</code> в рекавери!
        </p>
      `;
    }
  }, 900);
}

// --- APP: ANTUTU BENCHMARK ---
function renderAntutuApp(container) {
  container.innerHTML = `
    <div style="text-align:center; padding:16px;">
      <div style="font-size:42px;">🔥</div>
      <h3 style="font-size:18px;">AnTuTu Benchmark v10</h3>
      <p style="font-size:12px; color:#888;">Тестирование производительности Snapdragon 860</p>

      <div style="margin:24px 0;">
        <div id="antutu-num" style="font-size:42px; font-weight:900; color:#ff9900;">
          ${GameState.antutuScore > 0 ? GameState.antutuScore.toLocaleString() : '--- ---'}
        </div>
        <span style="font-size:12px; color:#888;">Баллов в общем зачете</span>
      </div>

      <button id="btn-start-antutu" class="rec-big-btn" style="background:#dc2626; border-color:#ef4444; width:85%; margin:auto;">
        Запустить тестирование
      </button>

      <div id="antutu-spinner-box" style="display:none; margin-top:20px;">
        <div class="boot-spinner" style="margin:auto;"></div>
        <div id="antutu-sub-status" style="font-size:12px; color:#aaa; margin-top:10px;">Тестирование 3D Vulkan...</div>
      </div>
    </div>
  `;

  document.getElementById('btn-start-antutu').addEventListener('click', () => {
    sounds.click();
    document.getElementById('btn-start-antutu').style.display = 'none';
    const sBox = document.getElementById('antutu-spinner-box');
    sBox.style.display = 'block';

    const stages = ['Тест CPU Multi-Core...', '3D Vulkan Graphics...', 'Тест RAM & UFS 3.1...', 'UX & Частота кадров...'];
    let idx = 0;
    const sub = document.getElementById('antutu-sub-status');

    const intv = setInterval(() => {
      if (idx < stages.length) {
        sub.textContent = stages[idx];
        sounds.beep(420 + idx * 90, 0.05);
        idx++;
      } else {
        clearInterval(intv);
        sBox.style.display = 'none';
        document.getElementById('btn-start-antutu').style.display = 'inline-block';
        document.getElementById('btn-start-antutu').textContent = 'Повторить тест';

        let base = 560000;
        if (GameState.rom === 'pixel') base = 670000;
        if (GameState.rom === 'lineage') base = 730000;
        if (GameState.rom === 'evolution') base = 780000;
        if (GameState.rom === 'crdroid') base = 960000;

        if (GameState.kernel === 'ngk_ksu') base += 140000;
        if (GameState.kernel === 'stormbreaker') base += 260000;

        GameState.antutuScore = base + Math.floor(Math.random() * 8000);
        document.getElementById('antutu-num').textContent = GameState.antutuScore.toLocaleString();
        sounds.bootChime();
        sounds.vibrate(100);

        if (GameState.antutuScore > 1000000) {
          checkQuest('antutu_record');
          alert(`🔥 Рекорд! ${GameState.antutuScore.toLocaleString()} баллов! Процессор разогнан на кастомном ядре!`);
        }
      }
    }, 700);
  });
}

// --- PC STATION & 4PDA OVERLAY ---
function bindPcHud() {
  UI.hudPcToggle.addEventListener('click', () => {
    sounds.click();
    UI.pcOverlay.classList.add('active');
  });

  UI.btnClosePc.addEventListener('click', () => {
    sounds.click();
    UI.pcOverlay.classList.remove('active');
  });

  UI.pcTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      sounds.click();
      UI.pcTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      Object.keys(UI.pcViews).forEach(k => {
        UI.pcViews[k].classList.toggle('active', k === target);
      });
    });
  });
}

// --- PC FASTBOOT / ADB CONSOLE ---
function bindPcTerminal() {
  const send = () => {
    const val = UI.pcInput.value.trim();
    if (!val) return;
    executePcCommand(val);
    UI.pcInput.value = '';
  };

  UI.pcSend.addEventListener('click', send);
  UI.pcInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') send();
  });

  document.querySelectorAll('.q-btn[data-cmd]').forEach(b => {
    b.addEventListener('click', () => executePcCommand(b.dataset.cmd));
  });
}

function termLog(text, type = 'info') {
  const p = document.createElement('p');
  p.className = `t-line ${type}`;
  p.textContent = text;
  UI.pcLog.appendChild(p);
  UI.pcLog.scrollTop = UI.pcLog.scrollHeight;
}

function executePcCommand(cmd) {
  termLog(`C:\\platform-tools> ${cmd}`, 'cmd');
  sounds.click();

  if (!GameState.usbConnected) {
    sounds.errorTone();
    termLog('error: device not found (USB кабель не подключен к ПК!)', 'error');
    return;
  }

  const parts = cmd.split(' ');
  const tool = parts[0].toLowerCase();
  const sub = parts[1] ? parts[1].toLowerCase() : '';
  const arg = parts[2] ? parts[2].toLowerCase() : '';

  if (tool === 'help') {
    termLog('--- Команды Fastboot & ADB ---', 'info');
    termLog('fastboot devices - список устройств в Fastboot', 'info');
    termLog('fastboot oem unlock - разблокировка загрузчика (Bootloader)', 'info');
    termLog('fastboot flash recovery <файл.img> - прошивка TWRP или OrangeFox', 'info');
    termLog('fastboot flash boot <файл.img> - прошивка ядра (KernelSU boot)', 'info');
    termLog('fastboot reboot [recovery|bootloader] - перезагрузка', 'info');
    termLog('adb devices - список устройств в OS/Рекавери', 'info');
    termLog('adb push <файл> /sdcard/ - загрузка файлов в телефон', 'info');
    termLog('cls / clear - очистить консоль', 'info');
    return;
  }

  if (tool === 'cls' || tool === 'clear') {
    UI.pcLog.innerHTML = '';
    return;
  }

  // FASTBOOT
  if (tool === 'fastboot') {
    if (GameState.screenState !== 'FASTBOOT') {
      sounds.errorTone();
      termLog('< waiting for any device > (Переведите телефон в режим Fastboot: Power + Vol-)', 'warning');
      return;
    }

    if (sub === 'devices') {
      termLog(`${GameState.serial}\tfastboot`, 'success');
    } else if (sub === 'oem' && arg === 'unlock') {
      sounds.bootChime();
      GameState.bootloaderUnlocked = true;
      termLog('(bootloader) Unlocking bootloader...', 'warning');
      termLog('(bootloader) Erasing userdata partition...', 'warning');
      termLog('OKAY [  3.412s]', 'success');
      termLog('finished. Загрузчик успешно разблокирован!', 'info');
      setScreenState('FASTBOOT');
      checkQuest('unlock');
    } else if (sub === 'flash') {
      if (arg === 'recovery') {
        if (!GameState.bootloaderUnlocked) {
          sounds.errorTone();
          termLog('FAILED (remote: Device is locked. Cannot flash unauthorized partitions!)', 'error');
          termLog('Сначала разблокируйте загрузчик: fastboot oem unlock', 'warning');
          return;
        }
        const file = parts[3] || 'twrp_3.7.0.img';
        if (file.includes('orangefox')) {
          GameState.recoveryType = 'orangefox';
          termLog(`Writing 'recovery' with OrangeFox Recovery R11.1...`, 'info');
        } else {
          GameState.recoveryType = 'twrp';
          termLog(`Writing 'recovery' with TWRP 3.7.0...`, 'info');
        }
        termLog('OKAY [  1.420s]', 'success');
        GameState.recoveryInstalled = true;
        checkQuest('recovery');
      } else if (arg === 'boot') {
        termLog(`Sending 'boot' (65536 KB)...`, 'info');
        termLog(`Writing 'boot' with KernelSU patched kernel...`, 'info');
        termLog('OKAY [  1.120s]', 'success');
        GameState.kernel = 'ngk_ksu';
        GameState.kernelVersion = 'Linux 4.14.336-NGK-KernelSU';
        GameState.ksuWorking = true;
        checkQuest('ksu_kernel');
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

  // ADB
  if (tool === 'adb') {
    if (GameState.screenState !== 'OS' && GameState.screenState !== 'RECOVERY') {
      sounds.errorTone();
      termLog('error: device offline (Телефон должен быть в OS или Рекавери)', 'warning');
      return;
    }

    if (GameState.screenState === 'OS' && !GameState.usbDebugging) {
      sounds.errorTone();
      termLog(`error: device unauthorized (${GameState.serial} unauthorized). Включите «Отладку по USB» в Настройках -> Для разработчиков!`, 'warning');
      return;
    }

    if (sub === 'devices') {
      termLog(`List of devices attached\n${GameState.serial}\tdevice`, 'success');
    } else if (sub === 'push') {
      const f = parts[2] || 'files';
      termLog(`Pushing ${f} to /sdcard/...`, 'info');
      GameState.pcDownloads.forEach(file => GameState.phoneStorage.add(file));
      termLog('100% [==================================>]', 'success');
      termLog('Все файлы загружены в память /sdcard/!', 'success');
    } else if (sub === 'reboot') {
      if (arg === 'recovery') bootToRecovery();
      else if (arg === 'bootloader') bootToFastboot();
      else bootDevice();
    } else {
      termLog(`adb: команда [${sub}] не найдена.`, 'error');
    }
  }
}

// --- 4PDA FORUM DOWNLOADS ---
function bindForumDownloads() {
  document.querySelectorAll('.btn-download').forEach(btn => {
    btn.addEventListener('click', () => {
      const file = btn.dataset.file;
      sounds.click();
      GameState.pcDownloads.add(file);
      GameState.phoneStorage.add(file);
      btn.textContent = '✓ Скачано';
      btn.classList.add('downloaded');
      termLog(`4PDA: Загружен файл [${file}] в /sdcard/`, 'info');
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
      sounds.errorTone();
      alert('Mi Flash: Устройство не найдено в Fastboot! Подключите USB и войдите в Fastboot.');
      return;
    }

    UI.mfStatusText.textContent = 'Flashing...';
    UI.mfResultText.textContent = 'In progress';
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      UI.mfProgressBar.style.width = `${progress}%`;
      sounds.beep(700 + progress * 5, 0.03);

      if (progress >= 100) {
        clearInterval(interval);
        UI.mfStatusText.textContent = 'Success';
        UI.mfResultText.textContent = 'SUCCESS';
        sounds.bootChime();
        sounds.vibrate(80);

        GameState.rom = 'stock';
        GameState.romCleanInstalled = true;
        GameState.kernel = 'stock';
        GameState.kernelVersion = 'Linux 4.14.336-stock';
        GameState.ksuWorking = false;
        GameState.magiskInstalled = false;
        GameState.modules.clear();

        const isLock = document.querySelector('input[name="mf-opt"]:checked').value === 'lock';
        if (isLock) GameState.bootloaderUnlocked = false;

        termLog('Mi Flash: Официальная заводская HyperOS Stock успешно установлена!', 'success');
        bootDevice();
      }
    }, 250);
  });
}

function updateMiFlashDevice() {
  if (GameState.usbConnected && GameState.screenState === 'FASTBOOT') {
    UI.mfDeviceName.textContent = `${GameState.serial} (fastboot)`;
  } else {
    UI.mfDeviceName.textContent = 'Не обнаружен';
  }
}

// --- QUESTS PROGRESSION SYSTEM ---
function renderQuests() {
  UI.questsScroll.innerHTML = '';
  GameState.quests.forEach(q => {
    const item = document.createElement('div');
    item.className = `quest-item ${q.done ? 'completed' : ''}`;
    item.innerHTML = `
      <div class="q-icon">
        ${q.done ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="#64748b"/></svg>'}
      </div>
      <div class="q-body">
        <div class="q-title">${q.title}</div>
        <div class="q-desc">${q.desc}</div>
        <div class="q-reward">+${q.exp} Репутации 4PDA</div>
      </div>
      <div class="q-pill ${q.done ? 'done' : ''}">${q.done ? 'Выполнено' : 'В процессе'}</div>
    `;
    UI.questsScroll.appendChild(item);
  });
}

function checkQuest(id) {
  const q = GameState.quests.find(item => item.id === id);
  if (q && !q.done) {
    q.done = true;
    sounds.bootChime();
    sounds.vibrate(100);
    renderQuests();
  }
}

window.addEventListener('DOMContentLoaded', initApp);
