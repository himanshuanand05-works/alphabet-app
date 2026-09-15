import { Component, HostListener, signal, NgZone } from '@angular/core';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';

@Component({
  imports: [],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
  animations: [
    trigger('letterAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.3) rotate(-15deg)' }),
        animate('500ms cubic-bezier(0.34, 1.56, 0.64, 1)', keyframes([
          style({ opacity: 0, transform: 'scale(0.3) rotate(-15deg)', offset: 0 }),
          style({ opacity: 0.6, transform: 'scale(1.15) rotate(5deg)', offset: 0.5 }),
          style({ opacity: 1, transform: 'scale(1) rotate(0deg)', offset: 1.0 }),
        ])),
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'scale(1.3) translateY(-40px)' })),
      ]),
    ]),
    trigger('ringPulse', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
    trigger('bgFlash', [
      transition(':enter', [
        animate('400ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class App {
  currentLetter = signal('');
  showLetter = signal(false);
  colorIndex = 0;
  ringVisible = signal(false);
  showAnimalImage = signal(this.loadAnimalImagePref());

  private static readonly ANIMAL_IMAGE_KEY = 'alphabetApp.showAnimalImage';

  private loadAnimalImagePref(): boolean {
    try {
      return localStorage.getItem(App.ANIMAL_IMAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  toggleAnimalImages() {
    const next = !this.showAnimalImage();
    this.showAnimalImage.set(next);
    try {
      localStorage.setItem(App.ANIMAL_IMAGE_KEY, String(next));
    } catch {
      // ignore storage failures
    }
  }

  private readonly colors = [
    { bg: '#FF6B6B', text: '#FFFFFF', shadow: '#FF4757' },
    { bg: '#FF9FF3', text: '#FFFFFF', shadow: '#F368E0' },
    { bg: '#48DBFB', text: '#FFFFFF', shadow: '#0ABDE3' },
    { bg: '#FECA57', text: '#2C3E50', shadow: '#FFC312' },
    { bg: '#FF6348', text: '#FFFFFF', shadow: '#EE5A24' },
    { bg: '#A29BFE', text: '#FFFFFF', shadow: '#6C5CE7' },
    { bg: '#55E6C1', text: '#1E272E', shadow: '#1DD1A1' },
    { bg: '#FD79A8', text: '#FFFFFF', shadow: '#E84393' },
    { bg: '#74B9FF', text: '#FFFFFF', shadow: '#0984E3' },
    { bg: '#FFEAA7', text: '#2D3436', shadow: '#FDCB6E' },
    { bg: '#DFE6E9', text: '#2D3436', shadow: '#B2BEC3' },
    { bg: '#E17055', text: '#FFFFFF', shadow: '#D63031' },
    { bg: '#00CEC9', text: '#FFFFFF', shadow: '#00B894' },
    { bg: '#6C5CE7', text: '#FFFFFF', shadow: '#5F27CD' },
    { bg: '#FD79A8', text: '#FFFFFF', shadow: '#E84393' },
    { bg: '#FDCB6E', text: '#2D3436', shadow: '#F39C12' },
    { bg: '#E74C3C', text: '#FFFFFF', shadow: '#C0392B' },
    { bg: '#2ECC71', text: '#FFFFFF', shadow: '#27AE60' },
    { bg: '#3498DB', text: '#FFFFFF', shadow: '#2980B9' },
    { bg: '#9B59B6', text: '#FFFFFF', shadow: '#8E44AD' },
    { bg: '#F39C12', text: '#FFFFFF', shadow: '#E67E22' },
    { bg: '#1ABC9C', text: '#FFFFFF', shadow: '#16A085' },
    { bg: '#E74C3C', text: '#FFFFFF', shadow: '#C0392B' },
    { bg: '#2980B9', text: '#FFFFFF', shadow: '#2471A3' },
    { bg: '#8E44AD', text: '#FFFFFF', shadow: '#7D3C98' },
    { bg: '#27AE60', text: '#FFFFFF', shadow: '#229954' },
  ];

  private audioContext: AudioContext | null = null;
  private femaleVoice: SpeechSynthesisVoice | null = null;

  constructor(private ngZone: NgZone) {
    this.loadFemaleVoice();
  }

  private loadFemaleVoice() {
    const synth = window.speechSynthesis;
    const pick = () => {
      const voices = synth.getVoices();
      this.femaleVoice =
        voices.find(v => /female/i.test(v.name)) ||
        voices.find(v => /zira|susan|samantha|karen|moira|tessa|fiona|google.*female|helena|iris|google uk english female|google us english/i.test(v.name)) ||
        voices.find(v => v.lang.startsWith('en') && /woman|she|her/i.test(v.name)) ||
        null;
    };
    pick();
    synth.onvoiceschanged = () => pick();
  }

  readonly alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const key = event.key.toUpperCase();
    if (/^[A-Z]$/.test(key)) {
      this.activateLetter(key);
    }
  }

  activateLetter(letter: string) {
    this.ngZone.run(() => {
      this.showLetter.set(false);
      setTimeout(() => {
        this.currentLetter.set(letter);
        this.showLetter.set(true);
        this.ringVisible.set(true);
        this.speakLetter(letter);
        this.playTone(letter);
        setTimeout(() => this.ringVisible.set(false), 800);
      }, 50);
    });
  }

  private keyClickGuard = -1;

  onAlphaKeyPointerDown(letter: string, event: PointerEvent) {
    if (event.pointerType === 'mouse') {
      return;
    }
    event.preventDefault();
    this.keyClickGuard = Date.now();
    this.activateLetter(letter);
  }

  onAlphaKeyClick(letter: string) {
    if (Date.now() - this.keyClickGuard < 1000) {
      this.keyClickGuard = -1;
      return;
    }
    this.activateLetter(letter);
  }

  getColor() {
    const letter = this.currentLetter();
    if (!letter) return this.colors[0];
    const idx = (letter.charCodeAt(0) - 65) % this.colors.length;
    return this.colors[idx];
  }

  getColorForLetter(letter: string) {
    const idx = (letter.charCodeAt(0) - 65) % this.colors.length;
    return this.colors[idx];
  }

  getWords() {
    const wordMap: Record<string, string[]> = {
      A: ['Apple', 'Ant', 'Airplane'],
      B: ['Ball', 'Bear', 'Butterfly'],
      C: ['Cat', 'Car', 'Cookie'],
      D: ['Dog', 'Duck', 'Drum'],
      E: ['Elephant', 'Egg', 'Eagle'],
      F: ['Fish', 'Flower', 'Fox'],
      G: ['Grape', 'Goat', 'Guitar'],
      H: ['House', 'Heart', 'Horse'],
      I: ['Ice cream', 'Igloo', 'Island'],
      J: ['Jellyfish', 'Juice', 'Jungle'],
      K: ['Kite', 'Koala', 'Key'],
      L: ['Lion', 'Leaf', 'Lamp'],
      M: ['Moon', 'Mushroom', 'Monkey'],
      N: ['Nest', 'Notebook', 'Nut'],
      O: ['Orange', 'Owl', 'Ocean'],
      P: ['Panda', 'Pizza', 'Pineapple'],
      Q: ['Queen', 'Quilt', 'Question'],
      R: ['Rainbow', 'Robot', 'Rocket'],
      S: ['Sun', 'Star', 'Strawberry'],
      T: ['Tiger', 'Tree', 'Train'],
      U: ['Umbrella', 'Unicorn', 'UFO'],
      V: ['Volcano', 'Violin', 'Van'],
      W: ['Whale', 'Watermelon', 'Window'],
      X: ['Xylophone', 'X-ray'],
      Y: ['Yo-yo', 'Yacht', 'Yogurt'],
      Z: ['Zebra', 'Zoo', 'Zipper'],
    };
    return wordMap[this.currentLetter()] || [];
  }

  readonly animals: Record<string, { name: string; image: string }> = {
    A: { name: 'Ant', image: 'animals/a.jpg' },
    B: { name: 'Bear', image: 'animals/b.jpg' },
    C: { name: 'Cat', image: 'animals/c.jpg' },
    D: { name: 'Dog', image: 'animals/d.jpg' },
    E: { name: 'Elephant', image: 'animals/e.jpg' },
    F: { name: 'Fox', image: 'animals/f.jpg' },
    G: { name: 'Goat', image: 'animals/g.jpg' },
    H: { name: 'Horse', image: 'animals/h.jpg' },
    I: { name: 'Iguana', image: 'animals/i.jpg' },
    J: { name: 'Jaguar', image: 'animals/j.jpg' },
    K: { name: 'Koala', image: 'animals/k.jpg' },
    L: { name: 'Lion', image: 'animals/l.jpg' },
    M: { name: 'Monkey', image: 'animals/m.jpg' },    N: { name: 'Nilgai', image: 'animals/n.jpg' },
    O: { name: 'Owl', image: 'animals/o.jpg' },
    P: { name: 'Panda', image: 'animals/p.jpg' },
    Q: { name: 'Quail', image: 'animals/q.jpg' },
    R: { name: 'Rabbit', image: 'animals/r.jpg' },
    S: { name: 'Snake', image: 'animals/s.jpg' },
    T: { name: 'Tortoise', image: 'animals/t.jpg' },
    U: { name: 'Urial', image: 'animals/u.jpg' },
    V: { name: 'Vulture', image: 'animals/v.jpg' },
    W: { name: 'Whale', image: 'animals/w.jpg' },
    X: { name: 'Xerus', image: 'animals/x.jpg' },
    Y: { name: 'Yak', image: 'animals/y.jpg' },
    Z: { name: 'Zebra', image: 'animals/z.jpg' },
  };

  currentAnimal() {
    return this.animals[this.currentLetter()] || null;
  }

  onAnimalImageError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  private speakLetter(letter: string) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(letter);
      utterance.rate = 0.8;
      utterance.pitch = 1.4;
      utterance.volume = 1.0;
      if (this.femaleVoice) {
        utterance.voice = this.femaleVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  }

  private playTone(letter: string) {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const freqMap: Record<string, number> = {
      A: 261.63, B: 293.66, C: 329.63, D: 349.23, E: 392.0, F: 440.0,
      G: 493.88, H: 523.25, I: 587.33, J: 659.25, K: 698.46, L: 783.99,
      M: 880.0, N: 987.77, O: 1046.5, P: 1174.66, Q: 1318.51, R: 1396.91,
      S: 1567.98, T: 1760.0, U: 1975.53, V: 2093.0, W: 2349.32, X: 2637.02,
      Y: 2793.83, Z: 3135.96,
    };

    const freq = freqMap[letter] || 440;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.4, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.5, now);
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.15, now + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.35);

    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 2, now);
    gain3.gain.setValueAtTime(0, now);
    gain3.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now);
    osc3.stop(now + 0.2);
  }
}
