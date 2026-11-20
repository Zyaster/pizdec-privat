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
const OS_THEME = {
  stock: 'hyperos',
  pixel: 'pixel',
  lineage: 'lineage',
  crdroid: 'crdroid',
  evolution: 'evolution',
  kali: 'kali'
};

function updateOsUI() {
  const os = GameState.rom || 'stock';
  const osEl = UI.screens.OS;
  const theme = OS_THEME[os] || 'hyperos';

  // Apply root CSS classes + data attribute for each OS
  osEl.className = 'screen-view active';
  osEl.dataset.os = theme;
  UI.osAppWindow.dataset.os = theme;
  if (theme !== 'hyperos') osEl.classList.add('theme-' + theme);

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
  const dateStr = now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

  // 1. GOOGLE PIXEL: At a Glance + two-line Material You clock + search pill
  if (os === 'pixel') {
    UI.pixelSearchBar.style.display = 'flex';
    widget.innerHTML = `
      <div class="px-glance">
        <span>${dateStr}</span>
        <span style="opacity:.5">•</span>
        <span>−3°C</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f5c451" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
      </div>
      <div class="px-clock"><span>${hours}</span><span>${mins}</span></div>
      <div class="px-date-line">${dateStr}</div>
      <div class="hero-kernel-title" style="color:#8e919e;">${GameState.kernelVersion}</div>
    `;
    return;
  }

  UI.pixelSearchBar.style.display = 'none';

  // 2. CRDROID: gaming HUD, red terminal readouts
  if (os === 'crdroid') {
    widget.innerHTML = `
      <div class="cr-hero-hud">
        <div><b>${GameState.displayRefreshRate}</b><span>FPS</span></div>
        <div><b>${GameState.kernel === 'stormbreaker' ? '3.2' : '2.96'}</b><span>GHz</span></div>
        <div><b>${GameState.kernel === 'stormbreaker' ? '825' : '675'}</b><span>MHz GPU</span></div>
        <div><b>38°</b><span>TEMP</span></div>
      </div>
      <div class="cr-clock">${timeStr}</div>
      <div class="cr-tag">// CRDROID 10.5 GAMING EDITION</div>
      <div class="hero-kernel-title" style="color:#8a5b66;">${GameState.kernelVersion}</div>
    `;
    return;
  }

  // 3. KALI NETHUNTER: chroot terminal
  if (os === 'kali') {
    widget.innerHTML = `
      <div class="kali-terminal-widget">
        <span class="k-prompt">root@kali-vayu:~#</span> ./nethunter_init.sh<br>
        <span class="k-ok">[+]</span> chroot arm64: /data/local/nhsystem mounted<br>
        <span class="k-ok">[+]</span> wlan0mon: monitor mode active<br>
        <span class="k-dim">[sys] time ${timeStr} · kernel ${GameState.kernelVersion}</span>
      </div>
      <div class="kali-banner">[ OFFENSIVE SECURITY PLATFORM ]</div>
    `;
    return;
  }

  // 4. EVOLUTION X: Evolver gradient clock
  if (os === 'evolution') {
    widget.innerHTML = `
      <div class="ev-clock">${timeStr}</div>
      <div class="ln-weekday" style="color:#b9a8ce;">${dateStr} • 21°C</div>
      <span class="ev-tag">EVOLVER · NEBULA THEME</span>
      <div class="hero-kernel-title" style="color:#8a7fa0;">${GameState.kernelVersion}</div>
    `;
    return;
  }

  // 5. LINEAGEOS: Trebuchet clock + Trust chip
  if (os === 'lineage') {
    widget.innerHTML = `
      <div class="ln-widget-line">${timeStr}</div>
      <div class="ln-weekday">${dateStr} • Ясно, 21°C</div>
      <div class="ln-trust-chip">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Trust: SELinux ${GameState.selinuxMode === 'enforcing' ? 'Enforcing' : 'Permissive'}
      </div>
      <div class="hero-kernel-title" style="color:#5f807c;">${GameState.kernelVersion}</div>
    `;
    return;
  }

  // 6. XIAOMI HYPEROS (default): big thin clock, weather + step chips
  widget.innerHTML = `
    <div class="hx-clock-line">${hours}<b>:</b>${mins}</div>
    <div class="hx-date-line">${dateStr} • HyperOS</div>
    <div class="hx-chip-row">
      <span class="hx-chip">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></svg>
        6 420 шагов
      </span>
      <span class="hx-chip">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/><circle cx="12" cy="12" r="4"/></svg>
        21°C
      </span>
    </div>
    <div class="hero-kernel-title" style="color:#6f86b8;">${GameState.kernelVersion}</div>
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
    if (os === 'pixel') bg = '#2f3033';
    if (os === 'lineage') bg = '#243230';
    if (os === 'kali') bg = '#04100a';
    if (os === 'crdroid') bg = '#1a040d';
    if (os === 'evolution') bg = '#241a33';

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
  UI.osAppWindow.classList.remove('settings-open');
  document.getElementById('phone-container').classList.remove('app-open');
}

function openFullscreenApp(appId) {
  currentAppBackHandler = null;
  UI.osAppWindow.classList.add('active');
  document.getElementById('phone-container').classList.add('app-open');
  const body = UI.appWindowContent;
  body.innerHTML = '';
  body.onclick = null;
  body.oninput = null;
  UI.osAppWindow.classList.toggle('settings-open', appId === 'settings');

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
  let currentView = 'main';
  let searchQuery = '';
  let easterEggTapCount = 0;
  let eggTapCount = 0;

  const win = container.closest('.os-app-window');
  const romKey = GameState.rom || 'stock';
  const rom = {
    stock: {
      name: 'Xiaomi HyperOS', ver: '1.0.4.0 (Global)', build: 'UQ1A.240205.002.A1',
      security: '1 ноября 2026', badge: 'Global',
      desc: 'Фирменная система Xiaomi: плавный интерфейс, экосистема Mi и HyperOS.'
    },
    pixel: {
      name: 'PixelOS 14', ver: 'Android 14 QPR3', build: 'AP2A.240605.024',
      security: '5 ноября 2026', badge: 'Pixel Edition',
      desc: 'Чистый Android с Material You, монетизацией Google и Pixel-фишками.'
    },
    lineage: {
      name: 'LineageOS 21', ver: '21.0 (AOSP 14)', build: 'lineage_vayu-userdebug 14',
      security: '1 ноября 2026', badge: 'Official',
      desc: 'Открытый Android без лишнего: Trust, Privacy Guard и максимум автономности.'
    },
    crdroid: {
      name: 'crDroid 10.5', ver: 'Android 14', build: 'crDroid-vayu-10.5',
      security: '10 ноября 2026', badge: 'Gaming',
      desc: 'Кастом для геймеров: разгон CPU/GPU, фиксация 120 Гц и анти-троттлинг.'
    },
    evolution: {
      name: 'Evolution X 8.5', ver: 'Android 14', build: 'evolution_vayu-8.5',
      security: '5 ноября 2026', badge: 'Evolver',
      desc: 'Кастомизация каждого элемента: темы, анимации, часы и панель быстрых настроек.'
    },
    kali: {
      name: 'Kali NetHunter', ver: '2024.2 (Android 14)', build: 'nethunter-vayu-2024.2',
      security: '1 ноября 2026', badge: 'Root',
      desc: 'Пентест-платформа: chroot, мониторинг Wi-Fi, Nmap и Metasploit.'
    }
  }[romKey] || null;
  const info = rom || {
    name: 'Android', ver: '14', build: 'UQ1A.240205.002.A1',
    security: '1 ноября 2026', badge: 'AOSP',
    desc: 'Система на базе Android 14.'
  };

  const theme = OS_THEME[romKey] || 'hyperos';
  if (win) {
    win.classList.add('settings-open');
    win.dataset.os = theme;
  }

  if (GameState.netWifi === undefined) GameState.netWifi = true;
  if (GameState.netSim === undefined) GameState.netSim = true;
  if (GameState.netHotspot === undefined) GameState.netHotspot = false;
  if (GameState.fpsOverlay === undefined) GameState.fpsOverlay = true;

  // ---------- inline icon set ----------
  const svg = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const I = {
    search: svg('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'),
    display: svg('<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>'),
    battery: svg('<rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2"/><rect x="5" y="10" width="8" height="4" fill="currentColor" stroke="none"/>'),
    wifi: svg('<path d="M5 12.5a11 11 0 0 1 14 0"/><path d="M2 9a16 16 0 0 1 20 0"/><path d="M8.5 16a6 6 0 0 1 7 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/>'),
    shield: svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
    code: svg('<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 5l-2 14"/>'),
    power: svg('<path d="M18.4 6.6a9 9 0 1 1-12.8 0"/><path d="M12 2v10"/>'),
    info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>'),
    bluetooth: svg('<path d="M7 7l10 10-5 4V3l5 4L7 17"/>'),
    hotspot: svg('<circle cx="12" cy="12" r="2"/><path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4M3.5 3.5a12 12 0 0 0 0 17M20.5 3.5a12 12 0 0 1 0 17"/>'),
    sound: svg('<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>'),
    storage: svg('<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>'),
    apps: svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
    bell: svg('<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>'),
    sim: svg('<path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><rect x="8" y="12" width="8" height="7" rx="1"/>'),
    moon: svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
    palette: svg('<circle cx="12" cy="12" r="9"/><circle cx="8" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="7" r="1.2" fill="currentColor"/><circle cx="17" cy="13" r="1.2" fill="currentColor"/><circle cx="10" cy="16" r="1.2" fill="currentColor"/>'),
    dpi: svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><rect x="9" y="9" width="6" height="6" rx="1"/>'),
    speed: svg('<path d="M4 18a9 9 0 1 1 16 0"/><path d="M12 14l4-4"/><circle cx="12" cy="14" r="1.5"/>'),
    globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>'),
    lock: svg('<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),
    usb: svg('<path d="M12 20V8"/><path d="M12 8l-3-3M12 8l3-3"/><rect x="9" y="20" width="6" height="2" rx="1"/><circle cx="12" cy="5" r="2"/>'),
    refresh: svg('<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>'),
    trash: svg('<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>'),
    key: svg('<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14 9l2 2"/>'),
    badge: svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>'),
    finger: svg('<path d="M12 11a3 3 0 0 1 3 3c0 3-1 5-1 6"/><path d="M8.5 21c.5-1.5 1-3.5 1-7a2.5 2.5 0 0 1 5 0"/><path d="M6 18c.5-2 1-4 1-7a5 5 0 0 1 10 0"/><path d="M4.5 12a7.5 7.5 0 0 1 15 0"/>'),
    update: svg('<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 21h16"/>'),
    gestures: svg('<path d="M8 13V6a1.5 1.5 0 0 1 3 0v6"/><path d="M11 12V5a1.5 1.5 0 0 1 3 0v7"/><path d="M14 12V7a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-1a6 6 0 0 1-5.2-3L4 15a1.6 1.6 0 0 1 2.7-1.7L8 15"/>'),
    buttons: svg('<rect x="2" y="6" width="20" height="12" rx="6"/><circle cx="8" cy="12" r="1.5" fill="currentColor"/><circle cx="16" cy="12" r="1.5" fill="currentColor"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    terminal: svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/>'),
    gamepad: svg('<rect x="2" y="7" width="20" height="10" rx="5"/><path d="M7 12h4M9 10v4"/><circle cx="16" cy="11" r="1" fill="currentColor"/><circle cx="18" cy="13" r="1" fill="currentColor"/>'),
    pin: svg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>'),
    eye: svg('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    crosshair: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>'),
    download: svg('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/>'),
    plane: svg('<path d="M2 12l20-9-7 20-4-7-9-4z"/>'),
    heart: svg('<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-8.3a5 5 0 0 0 0-7.1z"/>'),
    chevron: svg('<path d="M9 6l6 6-6 6"/>')
  };

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // ---------- markup helpers ----------
  function row(o) {
    const r = o || {};
    const right = (r.toggle !== undefined)
      ? `<span class="st-switch ${r.toggle ? 'on' : ''}"><i></i></span>`
      : `${r.value ? `<span class="st-value">${r.value}</span>` : ''}${r.chev === false ? '' : '<span class="st-chev">›</span>'}`;
    const attrs = [
      r.nav ? `data-nav="${r.nav}"` : '',
      r.action ? `data-action="${r.action}"` : '',
      r.ico ? `style="--ic:${r.ico}"` : ''
    ].filter(Boolean).join(' ');
    return `<div class="st-row${r.danger ? ' danger' : ''}" ${attrs}>
      <span class="st-ic">${I[r.icon] || I.info}</span>
      <span class="st-txt">
        <span class="st-title">${r.title || ''}</span>
        ${r.sub ? `<span class="st-sub">${r.sub}</span>` : ''}
      </span>
      <span class="st-right">${right}</span>
    </div>`;
  }

  function section(title, body, cls) {
    return `<div class="st-section ${cls || ''}">${title ? `<div class="st-section-title">${title}</div>` : ''}<div class="st-card">${body}</div></div>`;
  }

  function tiles(list) {
    return `<div class="st-tiles">${list.map(t =>
      `<div class="st-tile ${t.active ? 'active' : ''}" ${t.attr || ''}>
        <div class="st-tile-title">${t.title}</div>
        <div class="st-tile-sub">${t.sub || ''}</div>
      </div>`).join('')}</div>`;
  }

  function hero(icon, title, desc, extra) {
    return `<div class="st-hero">
      <div class="st-hero-ic">${I[icon] || I.info}</div>
      <div class="st-hero-title">${title}</div>
      <div class="st-hero-desc">${desc}</div>
      ${extra || ''}
    </div>`;
  }

  function searchBox(placeholder) {
    return `<div class="st-search">
      <span class="st-search-ic">${I.search}</span>
      <input id="st-search" type="text" placeholder="${placeholder}" value="${esc(searchQuery)}" autocomplete="off" spellcheck="false">
    </div>`;
  }

  function wrap(inner) {
    container.innerHTML = `<div class="st" data-os="${theme}"><div class="st-shell">${inner}</div></div>`;
  }

  function setTitle(t) {
    UI.appWindowTitle.textContent = t;
  }

  // ---------- dynamic values ----------
  function hzNow() { return GameState.displayRefreshRate; }
  function perfName() {
    if (GameState.perfProfile === 'performance') return 'Game Turbo';
    if (GameState.perfProfile === 'powersave') return 'Экономия';
    return 'Сбалансированный';
  }
  function rootName() {
    if (GameState.ksuWorking) return 'KernelSU активен';
    if (GameState.magiskInstalled) return 'Magisk установлен';
    return 'Root не установлен';
  }
  function integrityName() {
    return GameState.ksuUnmountRoot.has('bank') ? 'STRONG' : 'BASIC';
  }

  const MAIN_TITLE = {
    hyperos: 'Настройки',
    pixel: 'Настройки',
    lineage: 'Настройки',
    crdroid: 'crDroid Settings',
    evolution: 'Настройки',
    kali: 'settings --list'
  }[theme] || 'Настройки';

  // ---------- searchable index ----------
  const SEARCH_ITEMS = [
    { title: 'О телефоне', sub: 'Модель, процессор, память, ядро, сборка', view: 'about', icon: 'info' },
    { title: 'Частота обновления экрана', sub: '60 / 90 / 120 Гц, Peak Refresh Rate', view: 'display', icon: 'display' },
    { title: 'Тёмная тема (Dark Mode)', sub: 'AMOLED Black и оформление системы', view: 'display', icon: 'moon' },
    { title: 'Плотность экрана (DPI)', sub: 'Масштаб элементов интерфейса, 392 / 440 dpi', view: 'display', icon: 'dpi' },
    { title: 'Батарея и производительность', sub: 'Game Turbo, энергосбережение, температура', view: 'battery', icon: 'battery' },
    { title: 'Быстрая зарядка 33W', sub: 'Контроллер Mi Turbo Charge', view: 'battery', icon: 'heart' },
    { title: 'Wi-Fi и интернет', sub: 'Подключение 5 ГГц, мобильная сеть', view: 'network', icon: 'wifi' },
    { title: 'Частный DNS (AdGuard)', sub: 'Блокировка рекламы через DNS', view: 'network', icon: 'globe' },
    { title: 'Безопасность и Play Integrity', sub: 'SafetyNet, MEETS_STRONG, аттестация', view: 'security', icon: 'shield' },
    { title: 'KernelSU и Magisk', sub: 'Root на уровне ядра, скрытие от банков', view: 'security', icon: 'key' },
    { title: 'Отладка по USB', sub: 'ADB, связь с ПК, демон adbd', view: 'developer', icon: 'usb' },
    { title: 'Разблокировка загрузчика', sub: 'OEM Unlock и Fastboot', view: 'developer', icon: 'lock' },
    { title: 'Перезагрузка в Recovery', sub: 'TWRP / OrangeFox, очистка Dalvik', view: 'system', icon: 'refresh' },
    { title: 'Перезагрузка в Fastboot', sub: 'Bootloader Poco X3 Pro', view: 'system', icon: 'power' },
    { title: 'Сброс до заводских', sub: 'Format Data и очистка разделов', view: 'system', icon: 'trash' }
  ];

  // ---------- main rows ----------
  const rNetwork = row({ icon: 'wifi', title: 'Сеть и интернет', sub: `Wi-Fi 4PDA_Modder_5GHz • Private DNS`, nav: 'network', ico: '#3b82f6' });
  const rDisplay = row({ icon: 'display', title: 'Экран и яркость', sub: `${hzNow()} Гц • ${GameState.darkMode ? 'тёмная тема' : 'светлая тема'} • DPI ${GameState.dpiScale}`, nav: 'display', ico: '#6366f1' });
  const rBattery = row({ icon: 'battery', title: 'Батарея и питание', sub: `${GameState.battery}% • ${perfName()} • 31.8°C`, nav: 'battery', ico: '#22c55e' });
  const rSecurity = row({ icon: 'shield', title: 'Безопасность и Root', sub: `Play Integrity ${integrityName()} • ${rootName()}`, nav: 'security', ico: '#a855f7' });
  const rDeveloper = row({ icon: 'code', title: 'Для разработчиков', sub: GameState.developerUnlocked ? (GameState.usbDebugging ? 'Отладка по USB включена' : 'Отладка по USB выключена') : 'Заблокировано — 7 тапов по сборке', nav: 'developer', ico: '#f59e0b', value: GameState.developerUnlocked ? '' : 'LOCK' });
  const rSystem = row({ icon: 'power', title: 'Перезагрузка и сброс', sub: 'Recovery • Fastboot • Format Data', nav: 'system', ico: '#ef4444' });
  const rAbout = row({ icon: 'info', title: 'О телефоне', sub: `Poco X3 Pro • ${info.name}`, nav: 'about', ico: '#64748b' });
  const rApps = row({ icon: 'apps', title: 'Приложения', sub: 'Установленные приложения и разрешения', nav: 'security', ico: '#0ea5e9' });
  const rNotifications = row({ icon: 'bell', title: 'Уведомления', sub: 'Каналы, история и беззвучный режим', nav: 'display', ico: '#f97316' });
  const rStorage = row({ icon: 'storage', title: 'Хранилище', sub: '54,2 ГБ из 256 ГБ занято', nav: 'about', ico: '#14b8a6' });
  const rSound = row({ icon: 'sound', title: 'Звук и вибрация', sub: 'Медиа, звонок, будильник', nav: 'display', ico: '#ec4899' });
  const rBluetooth = row({ icon: 'bluetooth', title: 'Bluetooth', sub: 'Наушники Xiaomi Buds 4 Pro', nav: 'network', ico: '#3b82f6' });
  const rHotspot = row({ icon: 'hotspot', title: 'Точка доступа', sub: 'Poco_Hotspot • выключена', nav: 'network', ico: '#0ea5e9' });
  const rSim = row({ icon: 'sim', title: 'Мобильная сеть', sub: 'Tele2 4G+ • VoLTE активен', nav: 'network', ico: '#22c55e' });
  const rDark = row({ icon: 'moon', title: 'Тёмная тема', sub: 'AMOLED Black', action: 'toggle-dark', toggle: GameState.darkMode, ico: '#8b5cf6' });
  const rLocation = row({ icon: 'pin', title: 'Местоположение', sub: 'Доступ к геоданным приложений', nav: 'security', ico: '#10b981' });
  const rPrivacy = row({ icon: 'eye', title: 'Конфиденциальность', sub: 'Privacy Guard, разрешения, реклама', nav: 'security', ico: '#8b5cf6' });
  const rTrust = row({ icon: 'badge', title: 'Lineage Trust', sub: `SELinux ${GameState.selinuxMode} • подпись сборки`, nav: 'security', ico: '#4dd0c4' });
  const rUpdates = row({ icon: 'download', title: 'Обновления системы', sub: 'LineageOS 21 • проверено сегодня', nav: 'about', ico: '#4dd0c4' });
  const rButtons = row({ icon: 'buttons', title: 'Кнопки и жесты', sub: 'Навигация, быстрые действия, подсветка', nav: 'display', ico: '#4dd0c4' });
  const rStatusBar = row({ icon: 'clock', title: 'Строка состояния', sub: 'Часы, значки, батарея, сеть', nav: 'display', ico: '#ff2d55' });
  const rQuick = row({ icon: 'apps', title: 'Панель быстрых настроек', sub: 'Плитки, яркость, ряды', nav: 'display', ico: '#ff2d55' });
  const rLockScreen = row({ icon: 'lock', title: 'Экран блокировки', sub: 'Часы, уведомления, разблокировка', nav: 'display', ico: '#ff2d55' });
  const rGestures = row({ icon: 'gestures', title: 'Жесты', sub: 'Навигация, свайпы, двойной тап', nav: 'display', ico: '#ff2d55' });
  const rThemes = row({ icon: 'palette', title: 'Темы и оформление', sub: 'Material You, акцент, иконки', nav: 'display', ico: '#c9a7ff' });
  const rAnim = row({ icon: 'speed', title: 'Анимации', sub: 'Скорость окон и переходов', nav: 'display', ico: '#c9a7ff' });
  const rEvolver = row({ icon: 'spark', title: 'The Evolver', sub: 'Кастомизация статус-бара и интерфейса', nav: 'display', ico: '#c9a7ff' });
  const rKaliNet = row({ icon: 'crosshair', title: 'wlan0 / wlan0mon', sub: 'Monitor mode, injection, MAC spoof', nav: 'network', ico: '#39ff88', value: 'UP' });
  const rKaliTools = row({ icon: 'terminal', title: 'Nmap · Metasploit · Aircrack', sub: '/usr/bin · chroot arm64', nav: 'security', ico: '#39ff88', value: 'READY' });
  const rKaliChroot = row({ icon: 'key', title: 'Kali chroot', sub: '/data/local/nhsystem · arm64', nav: 'security', ico: '#39ff88', value: 'MOUNTED' });

  function mainHyperOS() {
    return {
      top: `<div class="hx-account">
        <div class="hx-avatar">Z</div>
        <div>
          <div class="hx-account-name">Zyaster</div>
          <div class="hx-account-sub">Mi Account • 4PDA Modder</div>
        </div>
        <span class="hx-account-badge">Синхр.</span>
      </div>`,
      body: `<div class="hx-device" data-nav="about">
        <div class="hx-device-icon">POCO</div>
        <div style="flex:1; min-width:0;">
          <div class="hx-device-title">Poco X3 Pro</div>
          <div class="hx-device-sub">256 ГБ • Занято 54,2 ГБ • ${info.name}</div>
          <div class="hx-device-bar"><i style="width:21%"></i></div>
        </div>
        <span class="hx-device-arrow">›</span>
      </div>
      ${section('Сеть и подключения', rNetwork + rBluetooth + rHotspot)}
      ${section('Экран и звук', rDisplay + rSound + rDark)}
      ${section('Моддинг и безопасность', rSecurity + rDeveloper)}
      ${section('Система', rBattery + rSystem + rAbout)}`
    };
  }

  function mainPixel() {
    return {
      top: `<div class="px-head">
        <div class="px-title">Настройки</div>
        <div class="px-sub">Poco X3 Pro • ${info.name}</div>
      </div>`,
      body: `${section('Сеть и интернет', rNetwork + rSim)}
      ${section('Подключённые устройства', rBluetooth + rHotspot)}
      ${section('Приложения', rApps + rNotifications)}
      ${section('Батарея', rBattery)}
      ${section('Хранилище', rStorage)}
      ${section('Звук и вибрация', rSound)}
      ${section('Экран', rDisplay)}
      ${section('Безопасность и конфиденциальность', rSecurity + rLocation + rPrivacy)}
      ${section('Система', rDeveloper + rSystem + rAbout)}`
    };
  }

  function mainLineage() {
    return {
      top: `<div class="px-head">
        <div class="px-title" style="font-size:24px;">Настройки</div>
        <div class="px-sub">LineageOS 21 • ${GameState.model}</div>
      </div>
      <div class="ln-trust">
        <span class="ln-trust-ic">${I.badge}</span>
        <div>
          <div class="ln-trust-title">Trust: система в порядке</div>
          <div class="ln-trust-sub">SELinux ${GameState.selinuxMode} • загрузчик ${GameState.bootloaderUnlocked ? 'разблокирован' : 'заблокирован'} • Privacy Guard активен</div>
        </div>
      </div>`,
      body: `${section('Сеть и интернет', rNetwork + rSim + rBluetooth)}
      ${section('Приложения', rApps + rNotifications)}
      ${section('Батарея и хранилище', rBattery + rStorage)}
      ${section('Звук и экран', rSound + rDisplay)}
      ${section('LineageOS', rTrust + rUpdates + rButtons)}
      ${section('Безопасность', rSecurity + rPrivacy)}
      ${section('Система', rDeveloper + rSystem + rAbout)}`
    };
  }

  function mainCrDroid() {
    return {
      top: `<div class="cr-hero">
        <div class="cr-hero-top">
          <div class="cr-hero-name">crDroid Settings</div>
          <div class="cr-hero-ver">v10.5</div>
        </div>
        <div class="cr-hero-stats">
          <div><b>${hzNow()}</b><span>FPS LOCK</span></div>
          <div><b>${GameState.kernel === 'stormbreaker' ? '3.20' : '2.96'}</b><span>GHz CPU</span></div>
          <div><b>${GameState.kernel === 'stormbreaker' ? '825' : '675'}</b><span>MHz GPU</span></div>
          <div><b>38°</b><span>TEMP</span></div>
        </div>
      </div>`,
      body: `${section('crDroid Settings', rStatusBar + rQuick + rLockScreen + rButtons + rGestures)}
      ${section('Сеть', rNetwork + rSim)}
      ${section('Экран', rDisplay + rSound)}
      ${section('Батарея', rBattery)}
      ${section('Безопасность', rSecurity + rDeveloper)}
      ${section('Система', rSystem + rAbout)}`
    };
  }

  function mainEvolution() {
    return {
      top: `<div class="ev-hero">
        <div class="ev-hero-name">The Evolver</div>
        <div class="ev-hero-sub">Evolution X 8.5 • ${GameState.model}</div>
        <div class="ev-hero-row">
          <span class="ev-pill">Nebula</span>
          <span class="ev-pill">Material You</span>
          <span class="ev-pill">${hzNow()} Hz</span>
        </div>
      </div>`,
      body: `${section('Evolver', rThemes + rStatusBar + rQuick + rLockScreen + rGestures + rAnim)}
      ${section('Сеть и устройства', rNetwork + rSim + rBluetooth)}
      ${section('Экран и звук', rDisplay + rSound)}
      ${section('Батарея и хранилище', rBattery + rStorage)}
      ${section('Безопасность', rSecurity + rDeveloper)}
      ${section('Система', rSystem + rAbout)}`
    };
  }

  function mainKali() {
    return {
      top: `<div class="kali-hero">
        <span class="k-prompt">root@kali-vayu:~#</span> settings --system<br>
        <span class="k-ok">[+]</span> chroot /data/local/nhsystem : mounted<br>
        <span class="k-ok">[+]</span> wlan0mon : monitor mode active<br>
        <span class="k-warn">[!]</span> kernel ${GameState.kernelVersion}
      </div>`,
      body: `${section('СЕТЬ', rKaliNet + rNetwork + rSim)}
      ${section('ЭКРАН', rDisplay + rSound)}
      ${section('БЕЗОПАСНОСТЬ', rKaliChroot + rSecurity + rKaliTools)}
      ${section('СИСТЕМА', rBattery + rSystem + rAbout)}
      ${section('РАЗРАБОТКА', rDeveloper)}`
    };
  }

  function renderMainView() {
    let main;
    if (theme === 'hyperos') main = mainHyperOS();
    else if (theme === 'pixel') main = mainPixel();
    else if (theme === 'lineage') main = mainLineage();
    else if (theme === 'crdroid') main = mainCrDroid();
    else if (theme === 'evolution') main = mainEvolution();
    else if (theme === 'kali') main = mainKali();
    else main = mainHyperOS();

    const placeholder = theme === 'kali' ? 'grep -i "..."' : 'Поиск настроек';
    setTitle(MAIN_TITLE);
    container.innerHTML = `<div class="st" data-os="${theme}"><div class="st-shell">
      <div id="st-search-zone">${main.top}${searchBox(placeholder)}</div>
      <div id="st-results" style="display:none;"></div>
      <div id="st-main">${main.body}</div>
    </div></div>`;
    applySearch();
  }

  function applySearch() {
    const box = container.querySelector('#st-results');
    const main = container.querySelector('#st-main');
    if (!box || !main) return;
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      box.style.display = 'none';
      main.style.display = 'block';
      return;
    }
    const matches = SEARCH_ITEMS.filter(it =>
      it.title.toLowerCase().includes(q) || it.sub.toLowerCase().includes(q));
    box.style.display = 'block';
    main.style.display = 'none';
    if (!matches.length) {
      box.innerHTML = `<div class="st-empty"><div class="st-empty-ic">${I.search}</div>По запросу «${esc(searchQuery)}» ничего не найдено</div>`;
      return;
    }
    box.innerHTML = section(`Результаты поиска (${matches.length})`, matches.map(it =>
      row({ icon: it.icon, title: it.title, sub: it.sub, nav: it.view, ico: theme === 'hyperos' ? '#3482ff' : '' })
    ).join(''));
  }

  // ---------- subpage: about ----------
  function renderAboutView() {
    setTitle('О телефоне');
    const devHint = GameState.developerUnlocked
      ? '<span id="st-build-hint" style="display:block;margin-top:2px;color:var(--st-accent)">Режим разработчика активирован</span>'
      : '<span id="st-build-hint" style="display:block;margin-top:2px;color:var(--st-accent)">Нажмите 7 раз, чтобы включить режим разработчика</span>';

    wrap(`
      ${hero('info', info.name, info.desc)}
      ${section('Устройство',
        row({ icon: 'info', title: 'Модель устройства', sub: 'POCO X3 Pro (vayu / bhima)', value: 'Xiaomi', chev: false })
        + row({ icon: 'display', title: 'Версия Android', sub: '14 (UpsideDownCake) • 3 тапа для пасхалки', action: 'android-egg', value: '14' })
        + row({ icon: 'speed', title: 'Процессор', sub: GameState.kernel === 'stormbreaker' ? 'Snapdragon 860 @ 3.20 GHz (OC)' : 'Snapdragon 860 @ 2.96 GHz', chev: false })
        + row({ icon: 'gamepad', title: 'Графика', sub: GameState.kernel === 'stormbreaker' ? 'Adreno 640 @ 825 MHz (Vulkan 1.3)' : 'Adreno 640 @ 675 MHz', chev: false })
        + row({ icon: 'storage', title: 'Память', sub: '8 ГБ LPDDR4X + 3 ГБ RAM+ • 256 ГБ UFS 3.1', chev: false })
      )}
      ${section('Сборка и безопасность',
        row({ icon: 'code', title: 'Номер сборки', sub: `${info.build}${devHint}`, action: 'build-tap', chev: false })
        + row({ icon: 'terminal', title: 'Ядро Linux', sub: GameState.kernelVersion, value: GameState.ksuWorking ? 'KSU' : '', chev: false })
        + row({ icon: 'lock', title: 'Загрузчик', sub: GameState.bootloaderUnlocked ? 'Разблокирован • кастомы разрешены' : 'Заблокирован', action: 'boot-state', value: GameState.bootloaderUnlocked ? 'UNLOCKED' : 'LOCKED' })
        + row({ icon: 'shield', title: 'SELinux', sub: GameState.selinuxMode === 'enforcing' ? 'Enforcing (строгий)' : 'Permissive (мягкий)', action: 'toggle-selinux', value: GameState.selinuxMode.toUpperCase() })
      )}
      ${section('Версия системы',
        row({ icon: 'badge', title: info.name, sub: `${info.ver} • патч ${info.security}`, value: info.badge, chev: false })
      )}
    `);
  }

  // ---------- subpage: display ----------
  function renderDisplayView() {
    setTitle('Экран и графика');
    wrap(`
      ${hero('display', 'Экран и графика', 'Частота, тема, цветовой охват и масштаб интерфейса.')}
      ${section('Частота обновления', tiles([
        { title: '60 Hz', sub: 'Экономия', active: hzNow() === 60, attr: 'data-hz="60"' },
        { title: '90 Hz', sub: 'Баланс', active: hzNow() === 90, attr: 'data-hz="90"' },
        { title: '120 Hz', sub: 'Плавность', active: hzNow() === 120, attr: 'data-hz="120"' }
      ]))}
      ${section('Оформление',
        rDark
        + row({ icon: 'speed', title: 'Принудительные 120 Гц', sub: 'Peak refresh rate для игр и видео', action: 'toggle-peak', toggle: GameState.forcePeakRefreshRate, ico: '#f59e0b' })
        + row({ icon: 'palette', title: 'Цветовой охват', sub: GameState.displayColorMode === 'dci_p3' ? 'DCI-P3 (насыщенный)' : 'sRGB (натуральный)', action: 'toggle-color', value: GameState.displayColorMode.toUpperCase(), ico: '#ec4899' })
        + row({ icon: 'dpi', title: 'Плотность экрана', sub: `Масштаб интерфейса: ${GameState.dpiScale} dp`, action: 'toggle-dpi', value: `${GameState.dpiScale} dp`, ico: '#14b8a6' })
      )}
      ${section('Отрисовка',
        row({ icon: 'gamepad', title: '4x MSAA', sub: 'Сглаживание в 3D-играх (OpenGL ES 3.2)', action: 'toggle-msaa', toggle: GameState.forceMsaa, ico: '#8b5cf6' })
      )}
    `);
  }

  // ---------- subpage: battery ----------
  function renderBatteryView() {
    setTitle('Батарея и питание');
    const gauge = `<div class="st-gauge">
      <div class="st-gauge-num">${GameState.battery}%</div>
      <div class="st-gauge-label">${GameState.usbConnected ? '⚡ Mi Turbo Charge 33W • зарядка идёт' : '≈ 19 ч 45 мин работы'}</div>
      <div class="st-gauge-meta">
        <span>Здоровье: <b style="color:#21c46a">98%</b></span>
        <span>Ёмкость: <b>5 160 мАч</b></span>
        <span>Температура: <b style="color:#35d0ff">31.8°C</b></span>
      </div>
    </div>`;
    wrap(`
      ${hero('battery', 'Батарея и питание', 'Профиль производительности и расход заряда.')}
      ${section('', gauge)}
      ${section('Режим производительности', tiles([
        { title: 'Эко', sub: '60 Гц', active: GameState.perfProfile === 'powersave', attr: 'data-perf="powersave"' },
        { title: 'Баланс', sub: 'Адаптивный', active: GameState.perfProfile === 'balanced', attr: 'data-perf="balanced"' },
        { title: 'Turbo', sub: 'Макс. FPS', active: GameState.perfProfile === 'performance', attr: 'data-perf="performance"' }
      ]))}
      ${section('Расход заряда',
        row({ icon: 'display', title: 'Экран (5 ч 42 мин)', sub: 'Яркость 80%, 120 Гц', value: '42%', chev: false })
        + row({ icon: 'gamepad', title: 'Игры и тесты', sub: 'PUBG Mobile, AnTuTu', value: '34%', chev: false })
        + row({ icon: 'terminal', title: 'Система и ядро', sub: 'Фоновые процессы Linux', value: '16%', chev: false })
      )}
    `);
  }

  // ---------- subpage: network ----------
  function renderNetworkView() {
    setTitle('Сеть и интернет');
    wrap(`
      ${hero('wifi', 'Сеть и интернет', 'Wi-Fi, мобильная сеть, DNS и точка доступа.')}
      ${section('Беспроводные сети',
        row({ icon: 'wifi', title: 'Wi-Fi', sub: '4PDA_Modder_5GHz • 866 Мбит/с • WPA3', action: 'net-wifi', toggle: GameState.netWifi, ico: '#3b82f6' })
        + row({ icon: 'sim', title: 'Мобильная сеть (SIM 1)', sub: 'Tele2 4G+ • VoLTE • передача данных', action: 'net-sim', toggle: GameState.netSim, ico: '#22c55e' })
        + row({ icon: 'hotspot', title: 'Точка доступа', sub: 'Poco_Hotspot • 2,4 / 5 ГГц', action: 'net-hotspot', toggle: GameState.netHotspot, ico: '#0ea5e9' })
      )}
      ${section('DNS и подключения',
        row({ icon: 'globe', title: 'Частный DNS', sub: `Сервер: ${GameState.privateDns}`, action: 'toggle-dns', value: 'АКТИВЕН', ico: '#8b5cf6' })
        + row({ icon: 'bluetooth', title: 'Bluetooth', sub: 'Xiaomi Buds 4 Pro • подключены', nav: 'network', chev: false, value: 'ON', ico: '#6366f1' })
      )}
      ${section('Диагностика',
        row({ icon: 'speed', title: 'Тест скорости', sub: 'Загрузка 480 Мбит/с • отдача 96 Мбит/с', action: 'speedtest', ico: '#f59e0b' })
      )}
    `);
  }

  // ---------- subpage: security ----------
  function renderSecurityView() {
    setTitle('Безопасность и Root');
    const strong = GameState.ksuUnmountRoot.has('bank');
    const trustBlock = theme === 'lineage'
      ? `<div class="ln-trust"><span class="ln-trust-ic">${I.badge}</span><div><div class="ln-trust-title">Trust: SELinux ${GameState.selinuxMode}</div><div class="ln-trust-sub">Privacy Guard активен • подпись сборки проверена</div></div></div>`
      : '';
    const kaliBlock = theme === 'kali'
      ? `<div class="kali-hero"><span class="k-prompt">root@kali-vayu:~#</span> su -c "id"<br><span class="k-ok">[+]</span> uid=0(root) gid=0(root) groups=0(root)<br><span class="k-ok">[+]</span> nethunter chroot: MOUNTED<br><span class="k-warn">[!]</span> SELinux: ${GameState.selinuxMode}</div>`
      : '';
    wrap(`
      ${hero('shield', 'Безопасность и Root', 'Аттестация Play Integrity, root-подсистема и шифрование.')}
      ${trustBlock}${kaliBlock}
      ${section('Аттестация устройства',
        row({ icon: 'badge', title: 'Google Play Protect', sub: 'Устройство сертифицировано Google', value: 'CERTIFIED', chev: false, ico: '#22c55e' })
        + row({ icon: 'shield', title: 'Play Integrity API', sub: `BASIC ✅ • DEVICE ✅ • STRONG ${strong ? '✅' : '⚠️'}`, value: strong ? 'STRONG' : 'BASIC', chev: false, ico: '#a855f7' })
      )}
      ${section('Root-подсистема',
        row({ icon: 'key', title: 'KernelSU', sub: GameState.ksuWorking ? 'v0.9.5 • перехват в ядре Linux' : 'Не обнаружен в ядре', value: GameState.ksuWorking ? 'WORKING' : 'OFF', chev: false, ico: '#22c55e' })
        + row({ icon: 'lock', title: 'Magisk', sub: GameState.magiskInstalled ? 'v27.0 • Zygisk активен' : 'Не установлен', value: GameState.magiskInstalled ? 'INSTALLED' : 'ABSENT', chev: false, ico: '#0ea5e9' })
        + row({ icon: 'finger', title: 'Шифрование данных', sub: 'File-Based Encryption (FBE v2)', value: 'ENCRYPTED', chev: false, ico: '#14b8a6' })
        + row({ icon: 'shield', title: 'SELinux', sub: GameState.selinuxMode === 'enforcing' ? 'Enforcing (строгий)' : 'Permissive (мягкий)', action: 'toggle-selinux', value: GameState.selinuxMode.toUpperCase(), ico: '#f59e0b' })
      )}
      ${section('Приватность',
        row({ icon: 'eye', title: 'Privacy Guard', sub: 'Контроль разрешений приложений', value: 'ON', chev: false, ico: '#8b5cf6' })
        + row({ icon: 'pin', title: 'Доступ к геоданным', sub: 'Только для карт и погоды', value: '3 прил.', chev: false, ico: '#10b981' })
      )}
    `);
  }

  // ---------- subpage: developer ----------
  function renderDeveloperView() {
    setTitle('Для разработчиков');
    if (!GameState.developerUnlocked) {
      wrap(`
        ${hero('lock', 'Меню разработчика заблокировано', 'Откройте «О телефоне» и нажмите 7 раз на строку «Номер сборки».', `<div style="margin-top:16px"><div class="st-row" data-nav="about" style="justify-content:center;border:none;background:transparent;"><span class="st-title" style="color:var(--st-accent)">Перейти в «О телефоне» →</span></div></div>`)}
      `);
      return;
    }
    wrap(`
      ${hero('code', 'Для разработчиков', 'Отладка, аппаратное ускорение и системные параметры.')}
      ${section('Отладка и связь с ПК',
        row({ icon: 'usb', title: 'Отладка по USB', sub: 'Разрешить команды ADB с ПК', action: 'toggle-usb', toggle: GameState.usbDebugging, ico: '#3b82f6' })
        + row({ icon: 'lock', title: 'OEM Unlock', sub: 'Разблокировка загрузчика в Fastboot', value: 'ON', chev: false, ico: '#22c55e' })
        + row({ icon: 'refresh', title: 'Перезапустить adbd', sub: 'Сбросить сессию на порту 5555', action: 'adbd', ico: '#f59e0b' })
      )}
      ${section('Аппаратное ускорение',
        row({ icon: 'speed', title: 'Счётчик FPS', sub: 'Показывать частоту кадров поверх окон', action: 'toggle-fps', toggle: GameState.fpsOverlay, ico: '#ef4444' })
        + row({ icon: 'gamepad', title: '4x MSAA', sub: 'Принудительное сглаживание', action: 'toggle-msaa', toggle: GameState.forceMsaa, ico: '#8b5cf6' })
        + row({ icon: 'clock', title: 'Скорость анимаций', sub: 'Окна и переходы системы', action: 'cycle-anim', value: GameState.animationScale, ico: '#ec4899' })
      )}
    `);
  }

  // ---------- subpage: system ----------
  function renderSystemView() {
    setTitle('Перезагрузка и сброс');
    wrap(`
      ${hero('power', 'Перезагрузка и сброс', 'Power menu, Recovery, Fastboot и очистка данных.')}
      ${section('Меню перезагрузки',
        row({ icon: 'refresh', title: 'Перезагрузка системы', sub: 'Обычный reboot', action: 'reboot-system', ico: '#0ea5e9' })
        + row({ icon: 'terminal', title: 'Recovery', sub: GameState.recoveryType === 'orangefox' ? 'OrangeFox R11.1' : 'TWRP 3.7.0', action: 'reboot-recovery', ico: '#f97316' })
        + row({ icon: 'power', title: 'Fastboot / Bootloader', sub: 'Режим прошивки через ПК', action: 'reboot-bootloader', ico: '#6366f1' })
        + row({ icon: 'crosshair', title: 'EDL 9008', sub: 'Аварийное раскирпичивание', action: 'reboot-edl', value: 'EDL', ico: '#ef4444' })
      )}
      ${section('Очистка',
        row({ icon: 'refresh', title: 'Dalvik / ART кэш', sub: 'Устранить сбои после обновления', action: 'wipe-dalvik', ico: '#14b8a6' })
        + row({ icon: 'trash', title: 'Format Data', sub: 'Полное стирание /data и настроек', action: 'factory-reset', danger: true, value: 'RESET', ico: '#ef4444' })
      )}
    `);
  }

  // ---------- subpage: easter egg ----------
  function renderEasterEggView() {
    setTitle('Easter Egg');
    const egg = {
      hyperos: ['🐰', 'Mitu нашёл пасхалку', 'HyperOS прячет кролика Mitu — он уже починил этот Android.'],
      pixel: ['🚀', 'Android 14', 'UpsideDownCake • Space Rocket Mission. Пасхалка Pixel найдена.'],
      lineage: ['🛡️', 'LineageOS Trust', 'Никакой слежки: пасхалка осталась в открытом коде.'],
      crdroid: ['🎮', 'crDroid 120 FPS', 'Gaming-пасхалка: 120 кадров и ни одного троттлинга.'],
      evolution: ['🌌', 'Evolver Nebula', 'Тема Nebula активна. Кастомизация дошла до космоса.'],
      kali: ['🐉', 'Kali NetHunter', 'root@kali-vayu:~# flag{egg_found} — доступ получен.']
    }[theme] || ['🤖', 'Android 14', 'Пасхалка найдена.'];

    wrap(`
      ${hero('heart', egg[1], egg[2])}
      <div style="text-align:center;font-size:64px;margin:4px 0 18px;">${egg[0]}</div>
      ${section('', row({ icon: 'info', title: 'Секрет разблокирован', sub: 'Продолжайте моддить — но делайте бэкапы.', nav: 'about', chev: false, ico: '#f59e0b' }))}
    `);
  }

  // ---------- navigation / search ----------
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
    if (currentView === 'about') renderAboutView();
    else if (currentView === 'display') renderDisplayView();
    else if (currentView === 'battery') renderBatteryView();
    else if (currentView === 'network') renderNetworkView();
    else if (currentView === 'security') renderSecurityView();
    else if (currentView === 'developer') renderDeveloperView();
    else if (currentView === 'system') renderSystemView();
    else if (currentView === 'easter_egg') renderEasterEggView();
    else renderMainView();
  }

  container.oninput = (e) => {
    if (e.target && e.target.id === 'st-search') {
      searchQuery = e.target.value;
      applySearch();
    }
  };

  container.onclick = (e) => {
    const el = e.target.closest('[data-nav],[data-action],[data-hz],[data-perf]');
    if (!el) return;

    if (el.dataset.nav) {
      sounds.click();
      searchQuery = '';
      currentView = el.dataset.nav;
      render();
      return;
    }

    if (el.dataset.hz) {
      sounds.click(); sounds.vibrate(20);
      GameState.displayRefreshRate = parseInt(el.dataset.hz, 10);
      UI.osFpsBadge.textContent = `${GameState.displayRefreshRate} Hz`;
      render();
      return;
    }

    if (el.dataset.perf) {
      sounds.click(); sounds.vibrate(25);
      GameState.perfProfile = el.dataset.perf;
      if (GameState.perfProfile === 'performance') GameState.displayRefreshRate = 120;
      if (GameState.perfProfile === 'powersave') GameState.displayRefreshRate = 60;
      UI.osFpsBadge.textContent = `${GameState.displayRefreshRate} Hz`;
      render();
      return;
    }

    const a = el.dataset.action;
    if (!a) return;
    sounds.click();

    switch (a) {
      case 'toggle-dark':
        sounds.vibrate(20);
        GameState.darkMode = !GameState.darkMode;
        render();
        break;
      case 'toggle-peak':
        sounds.vibrate(20);
        GameState.forcePeakRefreshRate = !GameState.forcePeakRefreshRate;
        if (GameState.forcePeakRefreshRate) GameState.displayRefreshRate = 120;
        UI.osFpsBadge.textContent = `${GameState.displayRefreshRate} Hz`;
        render();
        break;
      case 'toggle-color':
        sounds.vibrate(20);
        GameState.displayColorMode = GameState.displayColorMode === 'dci_p3' ? 'srgb' : 'dci_p3';
        render();
        break;
      case 'toggle-dpi':
        sounds.vibrate(20);
        GameState.dpiScale = GameState.dpiScale === 392 ? 440 : 392;
        render();
        break;
      case 'toggle-msaa':
        sounds.vibrate(20);
        GameState.forceMsaa = !GameState.forceMsaa;
        render();
        break;
      case 'toggle-usb':
        sounds.vibrate(20);
        GameState.usbDebugging = !GameState.usbDebugging;
        render();
        break;
      case 'toggle-fps':
        sounds.vibrate(20);
        GameState.fpsOverlay = !GameState.fpsOverlay;
        UI.osFpsBadge.style.display = GameState.fpsOverlay ? '' : 'none';
        render();
        break;
      case 'cycle-anim': {
        const scales = ['0.5x', '1.0x', 'Без анимаций'];
        GameState.animationScale = scales[(scales.indexOf(GameState.animationScale) + 1) % scales.length];
        render();
        break;
      }
      case 'toggle-dns':
        sounds.vibrate(20);
        GameState.privateDns = GameState.privateDns === 'dns.adguard.com' ? '1dot1dot1dot1.cloudflare-dns.com' : 'dns.adguard.com';
        render();
        break;
      case 'toggle-selinux':
        sounds.vibrate(25);
        GameState.selinuxMode = GameState.selinuxMode === 'enforcing' ? 'permissive' : 'enforcing';
        render();
        break;
      case 'net-wifi':
        GameState.netWifi = !GameState.netWifi; render(); break;
      case 'net-sim':
        GameState.netSim = !GameState.netSim; render(); break;
      case 'net-hotspot':
        GameState.netHotspot = !GameState.netHotspot; render(); break;
      case 'speedtest':
        sounds.vibrate(30);
        alert('Speedtest: загрузка 480 Мбит/с, отдача 96 Мбит/с, ping 6 мс.');
        break;
      case 'adbd':
        sounds.vibrate(40);
        alert('adbd: демон перезапущен, порт 5555 слушает подключения.');
        break;
      case 'boot-state':
        alert(GameState.bootloaderUnlocked ? 'Загрузчик разблокирован. OEM Unlock активен.' : 'Загрузчик заблокирован. Разблокировка — только через Fastboot.');
        break;
      case 'android-egg':
        sounds.vibrate(30);
        eggTapCount++;
        if (eggTapCount >= 3) {
          eggTapCount = 0;
          currentView = 'easter_egg';
          render();
        }
        break;
      case 'build-tap': {
        if (GameState.developerUnlocked) {
          alert('Режим разработчика уже активирован.');
          break;
        }
        GameState.buildTapCount++;
        sounds.vibrate(35);
        const hint = document.getElementById('st-build-hint');
        const left = 7 - GameState.buildTapCount;
        if (left > 0) {
          if (hint) hint.textContent = `Осталось шагов: ${left}`;
        } else {
          GameState.developerUnlocked = true;
          sounds.bootChime();
          sounds.vibrate(150);
          if (hint) hint.textContent = '🎉 Режим разработчика активирован!';
          alert('🎉 Меню «Для разработчиков» разблокировано.');
        }
        break;
      }
      case 'reboot-system':
        closeFullscreenApp(true);
        bootDevice();
        break;
      case 'reboot-recovery':
        closeFullscreenApp(true);
        bootToRecovery();
        break;
      case 'reboot-bootloader':
        closeFullscreenApp(true);
        bootToFastboot();
        break;
      case 'reboot-edl':
        closeFullscreenApp(true);
        setScreenState('CRASHDUMP');
        break;
      case 'wipe-dalvik':
        sounds.vibrate(30);
        alert('🧹 Dalvik / ART Cache очищен. Кэш приложений сброшен.');
        break;
      case 'factory-reset':
        sounds.errorTone();
        sounds.vibrate(60);
        if (confirm('⚠️ ВНИМАНИЕ! Это сотрёт все данные пользователя (/data) и настройки. Продолжить?')) {
          GameState.phoneStorage.clear();
          GameState.modules.clear();
          closeFullscreenApp(true);
          bootDevice();
        }
        break;
    }
  };

  render();
}

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
