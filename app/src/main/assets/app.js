/**
 * AndroFlash: ROM Flasher & Root Simulator (4PDA Edition)
 * 100% Fullscreen, Immersive & Ultra-Realistic Android OS & Modding Engine.
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
  twrpSwipeTone() {
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

// --- Global Simulation State ---
const GameState = {
  model: 'Poco X3 Pro (vayu)',
  serial: 'e7c8491a',
  battery: 98,
  usbConnected: true,
  bootloaderUnlocked: false,
  recovery: 'stock',     // 'stock' | 'twrp'
  rom: 'stock',          // 'stock' | 'pixel' | 'lineage' | 'crdroid' | null
  romCleanInstalled: true, // Dirty flash without format data triggers Qualcomm CrashDump!
  isRooted: false,
  magiskZygisk: false,
  playIntegrityModule: false,
  screenState: 'OS',     // 'OFF' | 'FASTBOOT' | 'BOOTING' | 'CRASHDUMP' | 'TWRP' | 'OS'

  // Developer settings
  developerUnlocked: false,
  buildTapCount: 0,

  // Benchmark
  antutuScore: 0,

  // Downloads & Storage
  pcDownloads: new Set(['PixelOS_vayu_A14.zip', 'twrp_3.7.0.img']),
  phoneStorage: new Set(),

  // Quests
  quests: [
    { id: 'usb', title: '🔌 Подключение к ПК', desc: 'Убедитесь, что USB кабель подключен к ПК', exp: 50, done: true },
    { id: 'unlock', title: '🔓 Разблокировка загрузчика', desc: 'Перейдите в Fastboot и введите fastboot oem unlock', exp: 150, done: false },
    { id: 'twrp', title: '🦊 Прошивка TWRP Recovery', desc: 'Прошейте образ twrp_3.7.0.img через Fastboot', exp: 200, done: false },
    { id: 'wipe', title: '🧹 Очистка Format Data', desc: 'Сделайте Format Data в TWRP для избежания бутлупа', exp: 150, done: false },
    { id: 'flash_rom', title: '🚀 Установка кастомной ОС', desc: 'Установите PixelOS, LineageOS или crDroid через TWRP', exp: 300, done: false },
    { id: 'root', title: '🧙 Полный Root (Magisk)', desc: 'Прошейте Magisk.zip в TWRP и активируйте права суперпользователя', exp: 250, done: false },
    { id: 'bank', title: '🛡️ Обход банковских защит', desc: 'Активируйте Play Integrity Fix в Magisk и пройдите проверку банка', exp: 300, done: false },
    { id: 'crdroid_oc', title: '🔥 Оверклок 1,000,000+ очков', desc: 'Запустите AnTuTu на crDroid с Magisk и выбейте рекорд', exp: 500, done: false }
  ]
};

// --- DOM References ---
const UI = {
  // Screens
  screens: {
    OFF: document.getElementById('screen-off'),
    FASTBOOT: document.getElementById('screen-fastboot'),
    BOOTING: document.getElementById('screen-booting'),
    CRASHDUMP: document.getElementById('screen-crashdump'),
    TWRP: document.getElementById('screen-twrp'),
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
    miflash: document.getElementById('tab-miflash'),
    quests: document.getElementById('tab-quests')
  },

  // Fastboot
  fbDeviceState: document.getElementById('fb-device-state'),

  // Booting
  bootUnlockedIcon: document.getElementById('boot-unlocked-icon'),
  bootAnimCenter: document.getElementById('boot-anim-center'),

  // TWRP
  twrpClock: document.getElementById('twrp-clock'),
  twrpPages: {
    main: document.getElementById('twrp-page-main'),
    install: document.getElementById('twrp-page-install'),
    confirm: document.getElementById('twrp-page-confirm'),
    console: document.getElementById('twrp-page-console'),
    wipe: document.getElementById('twrp-page-wipe'),
    reboot: document.getElementById('twrp-page-reboot')
  },
  twrpFileTree: document.getElementById('twrp-file-tree'),
  confirmTargetName: document.getElementById('confirm-target-name'),
  confirmFileTitle: document.getElementById('confirm-file-title'),
  twrpSliderHandle: document.getElementById('twrp-slider-handle'),
  twrpLogConsole: document.getElementById('twrp-log-console'),
  btnTwrpRebootSystem: document.getElementById('btn-twrp-reboot-system'),
  btnShowFormatData: document.getElementById('btn-show-format-data'),
  formatDataDialog: document.getElementById('format-data-dialog'),
  formatYesInput: document.getElementById('format-yes-input'),
  btnConfirmFormatData: document.getElementById('btn-confirm-format-data'),
  btnDalvikWipe: document.getElementById('btn-dalvik-wipe'),

  // OS
  osClock: document.getElementById('os-clock'),
  heroClock: document.getElementById('hero-clock'),
  heroDate: document.getElementById('hero-date'),
  heroOsTitle: document.getElementById('hero-os-title'),
  osRootBadge: document.getElementById('os-root-badge'),
  osAppGrid: document.getElementById('os-app-grid'),
  osAppWindow: document.getElementById('os-app-window'),
  appWindowTitle: document.getElementById('app-window-title'),
  appWindowContent: document.getElementById('app-window-content'),
  appWindowBack: document.getElementById('app-window-back'),
  appWindowClose: document.getElementById('app-window-close'),
  magiskSuPrompt: document.getElementById('magisk-su-prompt'),
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
  bindTwrp();
  bindOsNavigation();
  renderQuests();
  updateOsUI();
  setScreenState('OS');

  // Realtime Clocks
  setInterval(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    if (UI.osClock) UI.osClock.textContent = timeStr;
    if (UI.heroClock) UI.heroClock.textContent = timeStr;
    if (UI.twrpClock) UI.twrpClock.textContent = timeStr;
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
      // Power + Vol- => FASTBOOT
      bootToFastboot();
    } else if (keyStates.power && keyStates.volUp) {
      // Power + Vol+ => RECOVERY (TWRP)
      bootToRecovery();
    } else if (keyStates.power) {
      // Power => REBOOT / POWER ON
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
  if (GameState.recovery === 'twrp') {
    setScreenState('TWRP');
    openTwrpSubpage('main');
    sounds.bootChime();
    termLog('Recovery: Запущен TeamWin Recovery Project (TWRP)', 'info');
    checkQuest('twrp');
  } else {
    termLog('Stock Recovery: TWRP не установлен! Прошейте twrp_3.7.0.img через Fastboot.', 'warning');
    alert('⚠️ Stock Recovery: У вас не установлен TWRP!\n\nПрошейте recovery через Fastboot:\nfastboot flash recovery twrp_3.7.0.img');
    bootDevice();
  }
}

// Fullscreen Ultra-Realistic Reboot!
function bootDevice() {
  setScreenState('BOOTING');
  sounds.bootChime();

  // Show unlocked icon if bootloader is unlocked
  if (UI.bootUnlockedIcon) {
    UI.bootUnlockedIcon.classList.toggle('visible', GameState.bootloaderUnlocked);
  }

  // Render authentic boot animations based on installed ROM
  const center = UI.bootAnimCenter;
  center.innerHTML = '';

  if (GameState.rom === 'pixel') {
    center.innerHTML = `
      <div class="pixel-g-logo">G</div>
      <div class="logo-sub-text">Google Pixel</div>
    `;
  } else if (GameState.rom === 'lineage') {
    center.innerHTML = `
      <div class="lineage-arc-logo">◯</div>
      <div class="logo-big-text" style="color:#167c80;">LineageOS</div>
    `;
  } else if (GameState.rom === 'crdroid') {
    center.innerHTML = `
      <div style="font-size:54px;">👾</div>
      <div class="logo-big-text" style="color:#e11d48;">crDroid</div>
      <div class="logo-sub-text" style="color:#ff3366;">GAMING EDITION</div>
    `;
  } else if (GameState.rom === 'stock') {
    center.innerHTML = `
      <div class="logo-big-text" style="color:#ff9900;">POCO</div>
      <div class="logo-sub-text">Xiaomi HyperOS</div>
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
      alert('Ошибка: Операционная система не установлена! Прошейте прошивку через TWRP или Mi Flash.');
      return;
    }

    if (!GameState.romCleanInstalled) {
      // Bootloop due to dirty flash! Fullscreen Qualcomm CrashDump!
      sounds.errorTone();
      setScreenState('CRASHDUMP');
      termLog('CRASHDUMP: Device bootloop! Kernel panic: Data encryption mismatch. Сделайте Format Data в TWRP!', 'error');
      return;
    }

    setScreenState('OS');
    sounds.vibrate(40);
    checkQuest('flash_rom');
  }, 2400);
}

// --- TWRP RECOVERY ENGINE (100% AUTHENTIC) ---
let currentTwrpFile = null;
let isDraggingSlider = false;

function bindTwrp() {
  // Tile navigation
  document.querySelectorAll('.twrp-tile[data-action]').forEach(tile => {
    tile.addEventListener('click', () => {
      sounds.click();
      const action = tile.dataset.action;
      if (action === 'install') {
        renderTwrpFiles();
        openTwrpSubpage('install');
      } else if (action === 'wipe') {
        openTwrpSubpage('wipe');
      } else if (action === 'reboot') {
        openTwrpSubpage('reboot');
      } else if (action === 'backup') {
        alert('TWRP: Резервная копия разделов Boot, System и Vendor сохранена в /sdcard/TWRP/BACKUPS/');
      } else if (action === 'restore') {
        alert('TWRP: Резервных копий не обнаружено.');
      } else {
        alert(`TWRP: Функция [${action.toUpperCase()}] готова.`);
      }
    });
  });

  // Nav back buttons
  document.querySelectorAll('.twrp-nav-back').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.click();
      const target = btn.dataset.back;
      openTwrpSubpage(target);
    });
  });

  // Reboot subpage
  document.getElementById('rb-system').addEventListener('click', () => { sounds.click(); bootDevice(); });
  document.getElementById('rb-recovery').addEventListener('click', () => { sounds.click(); bootToRecovery(); });
  document.getElementById('rb-bootloader').addEventListener('click', () => { sounds.click(); bootToFastboot(); });
  document.getElementById('rb-poweroff').addEventListener('click', () => { sounds.click(); setScreenState('OFF'); });

  // Wipe subpage
  UI.btnShowFormatData.addEventListener('click', () => {
    sounds.click();
    UI.formatDataDialog.style.display = 'block';
  });

  UI.btnConfirmFormatData.addEventListener('click', () => {
    const val = UI.formatYesInput.value.trim().toLowerCase();
    if (val === 'yes') {
      sounds.twrpSwipeTone();
      UI.formatDataDialog.style.display = 'none';
      UI.formatYesInput.value = '';
      openTwrpSubpage('console');
      runTwrpConsoleLog([
        'Formatting /data and /storage...',
        'Formatting /data using ext4...',
        'Formatting cache partition...',
        'Removing encryption keys and dm-verity hooks...',
        'Updating partition details...',
        'Format Data completed successfully!'
      ], () => {
        GameState.romCleanInstalled = true;
        checkQuest('wipe');
        UI.btnTwrpRebootSystem.style.display = 'block';
      });
    } else {
      sounds.errorTone();
      alert('Для форматирования введите слово "yes" в поле ввода!');
    }
  });

  UI.btnDalvikWipe.addEventListener('click', () => {
    sounds.click();
    openTwrpSubpage('console');
    runTwrpConsoleLog([
      'Wiping Dalvik / ART Cache...',
      'Wiping Cache partition...',
      'Done. Cache cleaned in 1.2s'
    ], () => {
      UI.btnTwrpRebootSystem.style.display = 'block';
    });
  });

  UI.btnTwrpRebootSystem.addEventListener('click', () => {
    sounds.click();
    bootDevice();
  });

  initTwrpSwipeSlider();
}

function openTwrpSubpage(pageName) {
  Object.keys(UI.twrpPages).forEach(k => {
    if (UI.twrpPages[k]) UI.twrpPages[k].style.display = 'none';
  });
  if (UI.twrpPages[pageName]) {
    UI.twrpPages[pageName].style.display = 'flex';
  }
}

function renderTwrpFiles() {
  UI.twrpFileTree.innerHTML = '';
  const files = Array.from(new Set([...GameState.phoneStorage, ...GameState.pcDownloads]));

  if (files.length === 0) {
    UI.twrpFileTree.innerHTML = '<div style="padding:16px; color:#888; font-size:12px;">(Папка /sdcard пуста! Скачайте прошивки на 4PDA или передайте через adb push)</div>';
    return;
  }

  files.forEach(filename => {
    if (filename.endsWith('.zip') || filename.endsWith('.img')) {
      const row = document.createElement('div');
      row.className = 'twrp-file-row';
      row.innerHTML = `<span>📦</span> <b>${filename}</b>`;
      row.addEventListener('click', () => {
        sounds.click();
        currentTwrpFile = filename;
        UI.confirmTargetName.textContent = filename;
        UI.confirmFileTitle.textContent = `Install ${filename}`;
        resetTwrpSlider();
        openTwrpSubpage('confirm');
      });
      UI.twrpFileTree.appendChild(row);
    }
  });
}

function initTwrpSwipeSlider() {
  const handle = UI.twrpSliderHandle;
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
      sounds.twrpSwipeTone();
      sounds.vibrate(70);
      executeTwrpFlash(currentTwrpFile);
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

function resetTwrpSlider() {
  UI.twrpSliderHandle.style.transition = 'none';
  UI.twrpSliderHandle.style.transform = 'translateX(0px)';
}

function executeTwrpFlash(filename) {
  openTwrpSubpage('console');
  UI.btnTwrpRebootSystem.style.display = 'none';

  let logs = [];
  if (filename === 'Magisk_v27.0.zip') {
    logs = [
      `Installing zip file '/sdcard/${filename}'`,
      'Checking for Digest file...',
      '************************',
      ' Magisk v27.0 Installer ',
      '************************',
      '- Mounting /system, /vendor',
      '- Target CPU: arm64-v8a',
      '- Patching ramdisk in boot.img...',
      '- Flashing patched boot partition...',
      '- Installing Magisk su binaries...',
      'Done! Magisk Superuser installed.'
    ];
    GameState.isRooted = true;
    checkQuest('root');
  } else if (filename === 'PlayIntegrityFix_v16.zip') {
    logs = [
      `Installing zip file '/sdcard/${filename}'`,
      'Play Integrity Fix by chiteroman',
      '- Injecting keystore hook...',
      '- Bypassing SafetyNet hardware attestation...',
      '- Spoofing Pixel 8 Pro build fingerprint...',
      'Done! SafetyNet & Play Integrity passed.'
    ];
    GameState.playIntegrityModule = true;
    checkQuest('bank');
  } else if (filename.startsWith('PixelOS')) {
    logs = [
      `Installing zip file '/sdcard/${filename}'`,
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
  } else if (filename.startsWith('LineageOS')) {
    logs = [
      `Installing zip file '/sdcard/${filename}'`,
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
  } else if (filename.startsWith('crDroid')) {
    logs = [
      `Installing zip file '/sdcard/${filename}'`,
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
      `Installing file '/sdcard/${filename}'`,
      'Processing archive...',
      'Flashing partitions...',
      'Success.'
    ];
  }

  runTwrpConsoleLog(logs, () => {
    UI.btnTwrpRebootSystem.style.display = 'block';
  });
}

function runTwrpConsoleLog(lines, callback) {
  UI.twrpLogConsole.textContent = '';
  let i = 0;
  function step() {
    if (i < lines.length) {
      UI.twrpLogConsole.textContent += lines[i] + '\n';
      UI.twrpLogConsole.scrollTop = UI.twrpLogConsole.scrollHeight;
      i++;
      setTimeout(step, 130);
    } else {
      if (callback) callback();
    }
  }
  step();
}

// --- OPERATING SYSTEM LAUNCHER & APPS ---
function updateOsUI() {
  const os = GameState.rom || 'stock';
  const osEl = UI.screens.OS;

  osEl.className = 'screen-view active';
  if (os === 'pixel') osEl.classList.add('theme-pixel');
  else if (os === 'lineage') osEl.classList.add('theme-lineage');
  else if (os === 'crdroid') osEl.classList.add('theme-crdroid');
  else osEl.classList.add('theme-hyperos');

  UI.osRootBadge.classList.toggle('visible', GameState.isRooted);

  const titles = {
    stock: 'Xiaomi HyperOS / MIUI',
    pixel: 'Google Pixel 8 Pro UI',
    lineage: 'LineageOS 21 AOSP',
    crdroid: 'crDroid 10.5 Gaming'
  };
  UI.heroOsTitle.textContent = titles[os];

  renderOsAppsGrid();
}

function renderOsAppsGrid() {
  const grid = UI.osAppGrid;
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
    const tile = document.createElement('div');
    tile.className = 'app-tile';
    tile.innerHTML = `
      <div class="app-icon-squircle" style="background:${app.bg}">${app.icon}</div>
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
  // Dock items
  document.querySelectorAll('.dock-icon[data-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.click();
      const target = btn.dataset.open;
      if (target === 'phone-app') alert('Звонилка: Инженерное меню *#*#4636#*#* доступно.');
      else openFullscreenApp(target);
    });
  });

  // App window back & close
  UI.appWindowBack.addEventListener('click', closeFullscreenApp);
  UI.appWindowClose.addEventListener('click', closeFullscreenApp);

  // Bottom 3-button keys
  document.getElementById('os-key-back').addEventListener('click', () => {
    sounds.click();
    closeFullscreenApp();
  });
  document.getElementById('os-key-home').addEventListener('click', () => {
    sounds.click();
    closeFullscreenApp();
  });
  document.getElementById('os-key-recents').addEventListener('click', () => {
    sounds.click();
    sounds.vibrate(20);
  });
}

function closeFullscreenApp() {
  UI.osAppWindow.classList.remove('active');
}

function openFullscreenApp(appId) {
  UI.osAppWindow.classList.add('active');
  const body = UI.appWindowContent;
  body.innerHTML = '';

  if (appId === 'settings') {
    UI.appWindowTitle.textContent = 'О телефоне';
    renderSettingsApp(body);
  } else if (appId === 'termux') {
    UI.appWindowTitle.textContent = 'Termux (Linux Terminal)';
    renderTermuxApp(body);
  } else if (appId === 'magisk') {
    UI.appWindowTitle.textContent = 'Magisk Manager v27.0';
    renderMagiskApp(body);
  } else if (appId === 'bank') {
    UI.appWindowTitle.textContent = 'СберБанк Онлайн';
    renderBankApp(body);
  } else if (appId === 'antutu') {
    UI.appWindowTitle.textContent = 'AnTuTu Benchmark v10';
    renderAntutuApp(body);
  } else if (appId === 'camera') {
    UI.appWindowTitle.textContent = 'Камера Sony 48MP';
    body.innerHTML = `
      <div style="text-align:center; padding:30px 10px;">
        <div style="width:100%; height:260px; background:#000; border-radius:16px; border:1px solid #333; display:flex; align-items:center; justify-content:center; color:#666;">
          📷 [Видоискатель камеры 48MP HDR RAW]
        </div>
        <p style="margin-top:16px; color:#888; font-size:12px;">Google Camera Mod активирован. Сенсор: Sony IMX582.</p>
      </div>
    `;
  } else if (appId === 'crdroid-mods') {
    UI.appWindowTitle.textContent = 'crDroid Settings';
    body.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="background:#1e2538; padding:14px; border-radius:10px;">
          <b>🎮 Game Turbo Overclock</b>
          <p style="color:#00e676; font-size:12px; margin-top:4px;">Частота экрана зафиксирована на 120Hz</p>
        </div>
        <div style="background:#1e2538; padding:14px; border-radius:10px;">
          <b>⚡ Профиль CPU</b>
          <p style="color:#ff9900; font-size:12px; margin-top:4px;">Snapdragon 860: 2.96 GHz (Performance mode)</p>
        </div>
      </div>
    `;
  }
}

function renderSettingsApp(container) {
  const osNames = {
    stock: 'Xiaomi HyperOS 1.0.4.0 (Официальная)',
    pixel: 'PixelOS 14 (Pixel Experience)',
    lineage: 'LineageOS 21 (Android 14)',
    crdroid: 'crDroid 10.5 (Gaming Edition)'
  };

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div style="background:#1c2333; padding:14px; border-radius:10px;">
        <div style="font-size:11px; color:#888;">Модель устройства</div>
        <b style="font-size:15px;">${GameState.model}</b>
      </div>
      <div style="background:#1c2333; padding:14px; border-radius:10px;">
        <div style="font-size:11px; color:#888;">Текущая прошивка</div>
        <b style="font-size:14px;">${osNames[GameState.rom || 'stock']}</b>
      </div>
      <div style="background:#1c2333; padding:14px; border-radius:10px;">
        <div style="font-size:11px; color:#888;">Версия ядра</div>
        <code>Linux 4.14.336-vayu-perf #1 SMP PREEMPT</code>
      </div>
      <div style="background:#1c2333; padding:14px; border-radius:10px;">
        <div style="font-size:11px; color:#888;">Статус загрузчика (Bootloader)</div>
        <b style="color:${GameState.bootloaderUnlocked ? '#00e676' : '#ff3366'};">
          ${GameState.bootloaderUnlocked ? 'Разблокирован (Unlocked)' : 'Заблокирован (Locked)'}
        </b>
      </div>
      <div id="settings-build-box" style="background:#1c2333; padding:14px; border-radius:10px; cursor:pointer;">
        <div style="font-size:11px; color:#888;">Номер сборки (Тапните 7 раз)</div>
        <b>UQ1A.240205.002.A1 (4PDA-Mod)</b>
        <div id="build-tap-status" style="font-size:11px; color:#00f2fe; margin-top:6px;">
          ${GameState.developerUnlocked ? 'Режим разработчика активен!' : 'Тапните для включения режима разработчика'}
        </div>
      </div>
    </div>
  `;

  document.getElementById('settings-build-box').addEventListener('click', () => {
    sounds.click();
    if (GameState.developerUnlocked) {
      alert('Вы уже являетесь разработчиком!');
      return;
    }
    GameState.buildTapCount++;
    sounds.vibrate(30);
    const left = 7 - GameState.buildTapCount;
    if (left > 0) {
      document.getElementById('build-tap-status').textContent = `Осталось шагов: ${left}`;
    } else {
      GameState.developerUnlocked = true;
      sounds.bootChime();
      sounds.vibrate(120);
      document.getElementById('build-tap-status').textContent = '🎉 Вы стали разработчиком! Отладка по USB включена.';
      alert('🎉 Поздравляем! Режим разработчика разблокирован!');
    }
  });
}

function renderTermuxApp(container) {
  let isSuSession = false;
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%;">
      <div id="termux-output" style="flex:1; background:#000; color:#39ff14; font-family:monospace; font-size:12px; padding:12px; border-radius:8px; overflow-y:auto; white-space:pre-wrap; margin-bottom:10px; height:280px;">
Welcome to Termux!
Wiki: https://wiki.termux.com
Community forum: https://termux.com/community

Type 'help' or 'su' to request root access.
      </div>
      <div style="display:flex; gap:8px;">
        <span id="termux-prompt" style="font-family:monospace; font-size:13px; color:#00f2fe; align-self:center;">$</span>
        <input type="text" id="termux-input" style="flex:1; background:#111; border:1px solid #333; color:#fff; font-family:monospace; font-size:12px; padding:8px 10px; border-radius:6px;" placeholder="su, uname -a, id, reboot" autocomplete="off">
        <button id="termux-btn-send" style="background:#238636; color:#fff; border:none; padding:8px 14px; border-radius:6px; font-weight:bold; cursor:pointer;">↵</button>
      </div>
      <div style="display:flex; gap:6px; margin-top:8px; overflow-x:auto;">
        <button class="q-btn" data-tcmd="su">su</button>
        <button class="q-btn" data-tcmd="uname -a">uname -a</button>
        <button class="q-btn" data-tcmd="getprop ro.product.model">getprop</button>
        <button class="q-btn" data-tcmd="id">id</button>
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
    } else if (cmd === 'su') {
      if (!GameState.isRooted) {
        sounds.errorTone();
        output.textContent += 'Permission denied: no su binary found. Flash Magisk in TWRP!\n';
      } else {
        triggerMagiskSuModal(() => {
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
      closeFullscreenApp();
      bootDevice();
    } else if (cmd === 'help') {
      output.textContent += 'Available: su, id, uname -a, getprop, reboot, clear\n';
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

function triggerMagiskSuModal(onGranted) {
  UI.magiskSuPrompt.style.display = 'block';
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

function renderMagiskApp(container) {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:14px;">
      <div style="background:#1b2336; border:1px solid #2d3b5c; border-radius:12px; padding:18px; text-align:center;">
        <div style="font-size:38px;">🪄</div>
        <b style="font-size:16px; display:block; margin-top:6px;">Magisk v27.0</b>
        <span style="color:#00e676; font-size:12px;">Установлен (Systemless Root)</span>
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
          ${GameState.playIntegrityModule ? `
            <div style="background:#243048; padding:10px; border-radius:8px; font-size:12px; display:flex; justify-content:space-between;">
              <span>🛡️ Play Integrity Fix v16.0</span>
              <span style="color:#00e676; font-weight:bold;">Активен</span>
            </div>
          ` : `
            <div style="color:#888; font-size:12px;">(Нет активных модулей. Прошейте PlayIntegrityFix_v16.zip в TWRP!)</div>
          `}
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

function renderBankApp(container) {
  const isBypassed = (!GameState.bootloaderUnlocked && !GameState.isRooted) || GameState.playIntegrityModule;

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

    if (isBypassed) {
      sounds.bootChime();
      box.style.background = '#064e3b';
      box.style.border = '1px solid #059669';
      box.innerHTML = `
        <b style="color:#34d399; font-size:14px;">✅ Безопасность подтверждена!</b>
        <p style="font-size:12px; margin-top:6px; color:#d1fae5;">
          • MEETS_DEVICE_INTEGRITY: true<br>
          • MEETS_BASIC_INTEGRITY: true<br>
          • Проверка SafetyNet пройдена успешно!
        </p>
        <div style="margin-top:14px; background:rgba(0,0,0,0.3); padding:12px; border-radius:8px; text-align:center;">
          <span style="font-size:11px; color:#aaa;">Текущий баланс:</span>
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
          <b>Как исправить:</b> Установите модуль <code>PlayIntegrityFix_v16.zip</code> в TWRP!
        </p>
      `;
    }
  }, 1000);
}

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

      <button id="btn-start-antutu" class="twrp-big-btn" style="background:#dc2626; border-color:#ef4444; width:85%; margin:auto;">
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
        if (GameState.rom === 'pixel') base = 650000;
        if (GameState.rom === 'lineage') base = 720000;
        if (GameState.rom === 'crdroid') {
          base = 980000;
          if (GameState.isRooted) base = 1142500;
        }

        GameState.antutuScore = base + Math.floor(Math.random() * 8000);
        document.getElementById('antutu-num').textContent = GameState.antutuScore.toLocaleString();
        sounds.bootChime();
        sounds.vibrate(100);

        if (GameState.antutuScore > 1000000) {
          checkQuest('crdroid_oc');
          alert(`🔥 Рекорд! ${GameState.antutuScore.toLocaleString()} баллов! Процессор разогнан на crDroid Gaming!`);
        }
      }
    }, 700);
  });
}

// --- FLOATING PC STATION & 4PDA OVERLAY ---
function bindPcHud() {
  UI.hudPcToggle.addEventListener('click', () => {
    sounds.click();
    UI.pcOverlay.classList.add('active');
  });

  UI.btnClosePc.addEventListener('click', () => {
    sounds.click();
    UI.pcOverlay.classList.remove('active');
  });

  // Tab switching inside PC station
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
    termLog('--- Доступные команды прошивки ---', 'info');
    termLog('fastboot devices - список устройств в режиме fastboot', 'info');
    termLog('fastboot oem unlock - разблокировка загрузчика (Bootloader)', 'info');
    termLog('fastboot flash recovery <файл.img> - прошивка TWRP', 'info');
    termLog('fastboot reboot [recovery|bootloader] - перезагрузка', 'info');
    termLog('adb devices - список устройств в OS/TWRP', 'info');
    termLog('adb push <файл> /sdcard/ - загрузка файлов в телефон', 'info');
    termLog('adb reboot [recovery|bootloader] - перезагрузка через adb', 'info');
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
      sounds.errorTone();
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
      termLog('(bootloader) Erasing userdata partition...', 'warning');
      termLog('OKAY [  3.412s]', 'success');
      termLog('finished. total time: 3.412s', 'success');
      termLog('Загрузчик успешно разблокирован!', 'info');
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
        termLog(`Sending 'recovery' (65536 KB)...`, 'info');
        termLog('OKAY [  1.210s]', 'success');
        termLog(`Writing 'recovery'...`, 'info');
        termLog('OKAY [  0.840s]', 'success');
        GameState.recovery = 'twrp';
        termLog('finished. TWRP Recovery успешно установлен!', 'success');
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
      sounds.errorTone();
      termLog('error: device offline (Телефон должен быть в OS или TWRP)', 'warning');
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
      alert('Mi Flash: Устройство не обнаружено в Fastboot! Подключите USB и войдите в Fastboot.');
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
        GameState.recovery = 'stock';
        GameState.isRooted = false;
        GameState.playIntegrityModule = false;

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
