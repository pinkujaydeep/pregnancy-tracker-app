// Audio utility for reminder notifications

const audioContext = typeof window !== "undefined" ? window.AudioContext || window.webkitAudioContext : null;

export function playNotificationSound(type = "bell") {
  // Prevent autoplay issues by using simple web audio API
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    if (type === "bell") {
      // Bell sound effect
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Bell frequencies
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === "chime") {
      // Chime sound effect
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.4);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === "alert") {
      // Alert beep
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Two beeps
      osc.frequency.value = 1000;
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.setValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);

      gain.gain.setValueAtTime(0.3, now + 0.15);
      gain.gain.setValueAtTime(0, now + 0.25);
      osc.start(now + 0.15);
      osc.stop(now + 0.25);
    }
  } catch (err) {
    console.log("Audio playback not available:", err.message);
  }
}
