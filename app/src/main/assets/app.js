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
    this.beep(800, 0.02, 'triangle', 0.06);
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
      <div style="font-size:54px;">👾</div>
      <div class="logo-big-text" style="color:#e11d48;">crDroid</div>
      <div class="logo-sub-text" style="color:#ff3366;">GAMING EDITION 120 FPS</div>
    `;
  } else if (GameState.rom === 'evolution') {
    center.innerHTML = `
      <div style="font-size:54px;">🧬</div>
      <div class="logo-big-text" style="color:#a855f7;">Evolution X</div>
      <div class="logo-sub-text">Keep Evolving • Android 14</div>
    `;
  } else if (GameState.rom === 'kali') {
    center.innerHTML = `
      <div class="kali-dragon-logo">🐉</div>
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
      <div style="font-size:48px;">⚠️</div>
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
      let icon = '📦';
      if (filename.includes('Kernel')) icon = '⚡';
      if (filename.includes('Fix') || filename.includes('Shamiko')) icon = '🛡️';
      if (filename.endsWith('.apk')) icon = '📱';

      row.innerHTML = `<span>${icon}</span> <b>${filename}</b>`;
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
        <div style="font-size:14px; font-weight:600; color:#d1e4ff;">Среда, 18 ноя • 21°C ⛅</div>
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
        <span>⚡ ${GameState.displayRefreshRate} FPS LOCKED</span>
        <span>🎮 ADRENO 640</span>
        <span>🔥 ${GameState.kernel === 'stormbreaker' ? '3.2 GHz OC' : '2.96 GHz'}</span>
        <span>❄️ 38°C</span>
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
      <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Среда, 18 ноября • 21°C Солнечно</div>
      <div style="display:inline-flex; align-items:center; gap:6px; background:#064e43; border-radius:14px; padding:3px 10px; font-size:10.5px; color:#6ee7b7; margin-top:8px;">
        <span>🛡️ Trust:</span> <b>SELinux Enforcing</b>
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
      <span>👣 6 420 шагов</span> <span>•</span> <span>8.4 км</span>
    </div>
    <div class="hero-kernel-title" style="color:#93c5fd;">${GameState.kernelVersion}</div>
  `;
}

function renderOsAppsGrid(os) {
  const grid = UI.osAppGrid;
  grid.innerHTML = '';

  const apps = [
    { id: 'settings', name: 'Настройки', icon: '⚙️', bg: '#475569' },
    { id: 'termux', name: 'Termux', icon: '💻', bg: '#000000' },
    { id: 'bank', name: 'СберБанк', icon: '🏦', bg: '#16a34a' },
    { id: 'pubg', name: 'PUBG Test', icon: '🎮', bg: '#b45309' },
    { id: 'antutu', name: 'AnTuTu', icon: '🔥', bg: '#dc2626' }
  ];

  if (GameState.ksuWorking) {
    apps.splice(2, 0, { id: 'kernelsu', name: 'KernelSU', icon: '👑', bg: '#15803d' });
  }

  if (GameState.magiskInstalled && !GameState.ksuWorking) {
    apps.splice(2, 0, { id: 'magisk', name: 'Magisk', icon: '🪄', bg: '#0284c7' });
  }

  if (GameState.modules.has('ViPER4Android')) {
    apps.push({ id: 'viper', name: 'ViPER4Android', icon: '🎵', bg: '#6366f1' });
  }

  if (GameState.modules.has('LSPosed')) {
    apps.push({ id: 'lsposed', name: 'LSPosed', icon: '💉', bg: '#8b5cf6' });
  }

  if (os === 'crdroid') {
    apps.push({ id: 'crdroid-mods', name: 'crDroid Hub', icon: '⚡', bg: '#e11d48' });
  }

  if (os === 'kali') {
    apps.push({ id: 'kali-tools', name: 'NetHunter', icon: '🐉', bg: '#0f766e' });
  }

  apps.forEach(app => {
    const tile = document.createElement('div');
    tile.className = 'app-tile';

    // Different icon backgrounds matching OS theme
    let bg = app.bg;
    if (os === 'pixel') bg = '#2a2e3d';
    if (os === 'kali') bg = '#030a0a';
    if (os === 'crdroid') bg = '#1f040f';
    if (os === 'evolution') bg = '#310d54';

    tile.innerHTML = `
      <div class="app-icon-squircle" style="background:${bg}">${app.icon}</div>
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

function closeFullscreenApp(force = false) {
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
  } else if (appId === 'termux') {
    UI.appWindowTitle.textContent = 'Termux (CLI)';
    renderTermuxApp(body);
  } else if (appId === 'bank') {
    UI.appWindowTitle.textContent = 'СберБанк Онлайн';
    renderBankApp(body);
  } else if (appId === 'pubg') {
    UI.appWindowTitle.textContent = 'PUBG Mobile FrameRate Test';
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

// --- APP: PUBG MOBILE FPS TEST ---
function renderPubgApp(container) {
  const is120Supported = GameState.displayRefreshRate === 120 && (GameState.kernel === 'stormbreaker' || GameState.modules.has('Game120FPS') || GameState.rom === 'crdroid');
  const targetFps = is120Supported ? 120 : 60;

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:14px;">
      <div class="pubg-viewfinder">
        <div style="font-size:13px; font-weight:bold; color:#f59e0b;">PUBG Mobile • Эрангель (4K Ultra HD)</div>
        <div class="pubg-fps-counter" id="pubg-fps-val">${targetFps} FPS</div>
        <div style="font-size:11px; color:#cbd5e1;">Рендеринг: Vulkan API • Графика: 90/120 Hz Extreme</div>
      </div>

      <div style="background:#1e293b; padding:14px; border-radius:10px; font-size:12px; line-height:1.7;">
        <b>Статус игрового оверклока:</b><br>
        • Частота экрана: <b>${GameState.displayRefreshRate} Hz</b><br>
        • Ядро: <b>${GameState.kernelVersion}</b><br>
        • 120 FPS Unlocker: <b>${GameState.modules.has('Game120FPS') || is120Supported ? 'Активирован' : 'Не активен (ограничено 60 FPS)'}</b>
      </div>

      ${is120Supported ? `
        <div style="background:#064e3b; border:1px solid #059669; padding:12px; border-radius:8px; color:#34d399; font-size:12px;">
          🎉 <b>120 FPS разблокированы!</b> Процессор разогнан, микрофризов нет.
        </div>
      ` : `
        <div style="background:#450a0a; border:1px solid #dc2626; padding:12px; border-radius:8px; color:#fca5a5; font-size:12px;">
          ⚠️ <b>Ограничение 60 FPS:</b> Установите модуль <code>Game_120FPS_Unlocker.zip</code> или прошейте <b>StormBreaker Kernel</b> в рекавери!
        </div>
      `}
    </div>
  `;

  if (is120Supported) {
    checkQuest('fps120');
  }
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
      icon: '🍏',
      desc: 'Фирменная система Xiaomi с плавным интерфейсом и экосистемой Mi.'
    },
    pixel: {
      name: 'PixelOS 14 (Pixel Experience)',
      codename: 'Android 14 (UpsideDownCake)',
      security: '5 ноября 2026',
      badge: 'Pixel Edition',
      icon: '📱',
      desc: 'Чистый интерфейс Google Pixel с Material You и Google сервисами.'
    },
    lineage: {
      name: 'LineageOS 21.0 Official',
      codename: 'Android 14 (Pure AOSP)',
      security: '1 ноября 2026',
      badge: 'Lineage Trust Enforced',
      icon: '⚡',
      desc: 'Эталонный открытый Android без мусора с контролем безопасности Trust.'
    },
    crdroid: {
      name: 'crDroid 10.5 (Gaming Edition)',
      codename: 'crDroid vayu (Android 14)',
      security: '10 ноября 2026',
      badge: '120 FPS Gaming OC',
      icon: '🎮',
      desc: 'Кастомная прошивка для геймеров с разгоном Adreno и игровым дашбордом.'
    },
    evolution: {
      name: 'Evolution X 8.5 (The Customizer)',
      codename: 'Evolver Build (Android 14)',
      security: '5 ноября 2026',
      badge: 'Themer Engine Active',
      icon: '🔮',
      desc: 'Максимальная кастомизация каждого пикселя интерфейса.'
    },
    kali: {
      name: 'Kali NetHunter Android 14',
      codename: 'Offensive Security Chroot',
      security: '1 ноября 2026',
      badge: 'Root Kernel Injected',
      icon: '💀',
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
          <span class="settings-search-icon">🔍</span>
          <input type="text" id="settings-search-input" class="settings-search-input" placeholder="Поиск настроек (экран, root, usb, герц...)" value="${searchQuery}" autocomplete="off">
        </div>

        <!-- Search Results (if searching) -->
        <div id="settings-search-results" style="display: ${searchQuery.trim() ? 'block' : 'none'};"></div>

        <div id="settings-default-content" style="display: ${searchQuery.trim() ? 'none' : 'flex'}; flex-direction:column; gap:14px;">
          <!-- Modder Profile Card -->
          <div class="settings-profile-card">
            <div class="settings-profile-avatar">👑</div>
            <div style="flex:1;">
              <div class="settings-profile-name">Zyaster (Senior 4PDA Modder)</div>
              <div class="settings-profile-sub">Аккаунт 4PDA синхронизирован • Репутация: 240+</div>
            </div>
            <div style="font-size:18px; color:var(--accent-cyan);">✓</div>
          </div>

          <!-- Hero OS / About Phone Banner -->
          <div class="settings-hero-banner" id="btn-goto-about">
            <div class="settings-hero-header">
              <div class="settings-hero-title">${curRom.icon} ${curRom.name}</div>
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
                <div class="settings-item-icon" style="background:#0284c7;">📱</div>
                <div class="settings-item-text">
                  <div class="settings-item-title">Экран и графика</div>
                  <div class="settings-item-sub">Частота: ${GameState.displayRefreshRate} Гц • Тёмная тема • DPI: ${GameState.dpiScale}</div>
                </div>
              </div>
              <div class="settings-item-right"><span class="settings-item-arrow">›</span></div>
            </div>

            <div class="settings-item" id="btn-goto-battery">
              <div class="settings-item-left">
                <div class="settings-item-icon" style="background:#16a34a;">🔋</div>
                <div class="settings-item-text">
                  <div class="settings-item-title">Батарея и питание</div>
                  <div class="settings-item-sub">${GameState.battery}% • ${GameState.perfProfile === 'performance' ? '🚀 Game Turbo' : '⚖️ Сбалансированный'} • 31.8°C</div>
                </div>
              </div>
              <div class="settings-item-right"><span class="settings-item-arrow">›</span></div>
            </div>

            <div class="settings-item" id="btn-goto-network">
              <div class="settings-item-left">
                <div class="settings-item-icon" style="background:#4f46e5;">📶</div>
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
                <div class="settings-item-icon" style="background:#9333ea;">🛡️</div>
                <div class="settings-item-text">
                  <div class="settings-item-title">Безопасность и Root</div>
                  <div class="settings-item-sub">Play Integrity: Strong • KernelSU: ${GameState.ksuWorking ? 'Активен' : 'Выкл'}</div>
                </div>
              </div>
              <div class="settings-item-right"><span class="settings-item-arrow">›</span></div>
            </div>

            <div class="settings-item" id="btn-goto-developer">
              <div class="settings-item-left">
                <div class="settings-item-icon" style="background:#d97706;">🛠️</div>
                <div class="settings-item-text">
                  <div class="settings-item-title">Для разработчиков</div>
                  <div class="settings-item-sub">
                    ${GameState.developerUnlocked ? (GameState.usbDebugging ? 'Отладка по USB: Вкл' : 'Отладка по USB: Выкл') : 'Заблокировано (7 тапов по сборке)'}
                  </div>
                </div>
              </div>
              <div class="settings-item-right">
                ${GameState.developerUnlocked ? '<span style="color:#00e676; font-size:11px;">АКТИВНО</span>' : '<span style="color:#64748b; font-size:11px;">🔒</span>'}
                <span class="settings-item-arrow">›</span>
              </div>
            </div>
          </div>

          <!-- Group 3: System & Power -->
          <div class="settings-group">
            <div class="settings-group-header">Система</div>

            <div class="settings-item" id="btn-goto-about-item">
              <div class="settings-item-left">
                <div class="settings-item-icon" style="background:#475569;">ℹ️</div>
                <div class="settings-item-text">
                  <div class="settings-item-title">О телефоне</div>
                  <div class="settings-item-sub">POCO X3 Pro • Android 14 • ${curRom.name}</div>
                </div>
              </div>
              <div class="settings-item-right"><span class="settings-item-arrow">›</span></div>
            </div>

            <div class="settings-item" id="btn-goto-system">
              <div class="settings-item-left">
                <div class="settings-item-icon" style="background:#dc2626;">🔄</div>
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

// --- APP: TERMUX ---
function renderTermuxApp(container) {
  let isSuSession = false;
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%;">
      <div id="termux-output" style="flex:1; background:#000; color:#39ff14; font-family:monospace; font-size:12px; padding:12px; border-radius:8px; overflow-y:auto; white-space:pre-wrap; margin-bottom:10px; height:280px;">
Welcome to Termux!
Type 'help', 'ksu', 'su', or 'neofetch'.
      </div>
      <div style="display:flex; gap:8px;">
        <span id="termux-prompt" style="font-family:monospace; font-size:13px; color:#00f2fe; align-self:center;">$</span>
        <input type="text" id="termux-input" style="flex:1; background:#111; border:1px solid #333; color:#fff; font-family:monospace; font-size:12px; padding:8px 10px; border-radius:6px;" placeholder="su, ksu, neofetch, uname -a" autocomplete="off">
        <button id="termux-btn-send" style="background:#238636; color:#fff; border:none; padding:8px 14px; border-radius:6px; font-weight:bold; cursor:pointer;">↵</button>
      </div>
      <div style="display:flex; gap:6px; margin-top:8px; overflow-x:auto;">
        <button class="q-btn" data-tcmd="ksu">ksu</button>
        <button class="q-btn" data-tcmd="su">su</button>
        <button class="q-btn" data-tcmd="neofetch">neofetch</button>
        <button class="q-btn" data-tcmd="uname -a">uname -a</button>
        <button class="q-btn" data-tcmd="reboot">reboot</button>
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

    if (cmd === 'clear') {
      output.textContent = '';
    } else if (cmd === 'su' || cmd === 'ksu') {
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
    } else if (cmd === 'neofetch') {
      output.textContent += `
       .-.          OS: ${GameState.rom || 'stock'} (Android 14)
      /   \\         Host: Xiaomi Poco X3 Pro (vayu)
     |     |        Kernel: ${GameState.kernelVersion}
     |     |        Uptime: 42 mins
      \\   /         Display: 2400x1080 @ ${GameState.displayRefreshRate}Hz
       '-'          CPU: Qualcomm Snapdragon 860 (8) @ 2.96GHz
                    Root: ${GameState.ksuWorking ? 'KernelSU v0.9.5' : (GameState.magiskInstalled ? 'Magisk v27.0' : 'None')}
                    Memory: 4120MiB / 8192MiB
      \n`;
    } else if (cmd === 'id') {
      output.textContent += isSuSession ? 'uid=0(root) gid=0(root) groups=0(root),context=u:r:kernel:s0\n' : 'uid=10148(u0_a148) gid=10148(u0_a148)\n';
    } else if (cmd === 'uname -a') {
      output.textContent += `${GameState.kernelVersion} aarch64 Android\n`;
    } else if (cmd === 'reboot') {
      closeFullscreenApp();
      bootDevice();
    } else {
      output.textContent += `sh: ${cmd}: command not found\n`;
    }

    output.scrollTop = output.scrollHeight;
    input.value = '';
  };

  document.getElementById('termux-btn-send').addEventListener('click', () => exec(input.value));
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') exec(input.value); });
  container.querySelectorAll('.q-btn[data-tcmd]').forEach(b => {
    b.addEventListener('click', () => exec(b.dataset.tcmd));
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
      <div class="q-icon">${q.done ? '✅' : '🎯'}</div>
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
