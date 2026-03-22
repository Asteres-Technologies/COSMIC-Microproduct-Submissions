// Canvas-based smoke/distortion effect for text animations
// Uses individual characters as particles for better performance
// Supports multiple concurrent animation groups on one canvas

interface AnimationGroup {
  characters: CharacterParticle[];
  startTime: number;
  type: 'hide' | 'show';
  duration: number;
}

export class SmokeEffect {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private groups: AnimationGroup[] = [];
  private animationFrame: number | null = null;
  private duration: number = 1200;
  private pendingCharacters: CharacterParticle[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  // Initialize pending from a DOM element — auto-detects alignment, font, position
  initFromElement(el: HTMLElement) {
    this.pendingCharacters = [];
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.addFromElement(el);
  }

  // Add particles from a DOM element — auto-detects alignment, font, position
  addFromElement(el: HTMLElement) {
    const style = getComputedStyle(el);
    const fontSize = parseFloat(style.fontSize);
    const fontWeight = style.fontWeight;
    const textAlign = style.textAlign;
    const rect = el.getBoundingClientRect();
    const text = el.textContent || '';
    const y = rect.top + rect.height * 0.5;

    let align: 'right' | 'left' | 'center';
    let x: number;

    if (textAlign === 'right' || textAlign === 'end') {
      align = 'right';
      x = rect.right;
    } else if (textAlign === 'center') {
      align = 'center';
      x = rect.left + rect.width / 2;
    } else {
      align = 'left';
      x = rect.left;
    }

    this.addTextCharacters(text, x, y, fontSize, fontWeight, align);
  }

  // Initialize pending characters from text (resets pending only, not active groups)
  initFromText(text: string, x: number, y: number, fontSize: number, fontWeight: string = '300', align: 'right' | 'left' | 'center' = 'right') {
    this.pendingCharacters = [];
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.addTextCharacters(text, x, y, fontSize, fontWeight, align);
  }

  // Add character particles to pending
  addTextCharacters(text: string, x: number, y: number, fontSize: number, fontWeight: string = '300', align: 'right' | 'left' | 'center' = 'right') {
    this.ctx.font = `${fontWeight} ${fontSize}px Inter, sans-serif`;
    this.ctx.textBaseline = 'middle';
    const chars = text.split('');

    if (align === 'right') {
      // Original behavior: iterate right-to-left from x
      this.ctx.textAlign = 'right';
      let currentX = x;
      for (let i = chars.length - 1; i >= 0; i--) {
        const char = chars[i];
        if (char === ' ') { currentX -= this.ctx.measureText(char).width; continue; }
        const charWidth = this.ctx.measureText(char).width;
        this.pendingCharacters.push(new CharacterParticle(char, currentX, y, fontSize, fontWeight, x - currentX, 'right'));
        currentX -= charWidth;
      }
    } else {
      // Left or center: iterate left-to-right
      this.ctx.textAlign = 'left';
      let startX = x;
      if (align === 'center') {
        const totalWidth = this.ctx.measureText(text).width;
        startX = x - totalWidth / 2;
      }
      let currentX = startX;
      const centerX = align === 'center' ? x : startX;
      for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        if (char === ' ') { currentX += this.ctx.measureText(char).width; continue; }
        const charWidth = this.ctx.measureText(char).width;
        this.pendingCharacters.push(new CharacterParticle(char, currentX, y, fontSize, fontWeight, currentX - centerX, 'left'));
        currentX += charWidth;
      }
    }
  }

  // Start hide — spawns a new group from pending, doesn't kill active groups
  startHide() {
    if (this.pendingCharacters.length === 0) return;
    this.groups.push({
      characters: [...this.pendingCharacters],
      startTime: Date.now(),
      type: 'hide',
      duration: this.duration,
    });
    this.pendingCharacters = [];
    this.ensureAnimating();
  }

  // Start show — spawns a new group from pending, doesn't kill active groups
  startShow() {
    if (this.pendingCharacters.length === 0) return;
    this.groups.push({
      characters: [...this.pendingCharacters],
      startTime: Date.now(),
      type: 'show',
      duration: this.duration,
    });
    this.pendingCharacters = [];
    this.ensureAnimating();
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.groups = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private ensureAnimating() {
    if (this.animationFrame) return;
    this.renderLoop();
  }

  private renderLoop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const blurGroups = new Map<number, CharacterParticle[]>();

    this.groups = this.groups.filter(group => {
      const elapsed = Date.now() - group.startTime;
      const progress = Math.min(elapsed / group.duration, 1);
      group.characters.forEach(char => {
        if (group.type === 'hide') char.updateHide(progress);
        else char.updateShow(progress);
        const blurKey = Math.round(char.blur / 10) * 10;
        if (!blurGroups.has(blurKey)) blurGroups.set(blurKey, []);
        blurGroups.get(blurKey)!.push(char);
      });
      return progress < 1;
    });

    blurGroups.forEach((chars, blurLevel) => {
      this.ctx.filter = `blur(${blurLevel}px)`;
      chars.forEach(char => char.draw(this.ctx));
    });
    this.ctx.filter = 'none';

    if (this.groups.length > 0) {
      this.animationFrame = requestAnimationFrame(() => this.renderLoop());
    } else {
      this.animationFrame = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

class CharacterParticle {
  private char: string;
  public x: number;
  public y: number;
  private originX: number;
  private originY: number;
  private fontSize: number;
  private fontWeight: string;
  private angle: number;
  private align: 'left' | 'right';
  private opacity: number = 1;
  public blur: number = 0;

  constructor(char: string, x: number, y: number, fontSize: number, fontWeight: string, distanceFromCenter: number, align: 'left' | 'right' = 'right') {
    this.char = char;
    this.originX = x;
    this.originY = y;
    this.x = x;
    this.y = y;
    this.fontSize = fontSize;
    this.fontWeight = fontWeight;
    this.align = align;
    this.angle = Math.atan2(Math.random() - 0.5, -distanceFromCenter) + (Math.random() - 0.5) * 0.5;
  }

  updateHide(progress: number) {
    const eased = 1 - Math.pow(1 - progress, 3);
    const expandDistance = 200;
    this.x = this.originX + Math.cos(this.angle) * eased * expandDistance;
    this.y = this.originY + Math.sin(this.angle) * eased * expandDistance;
    const turbulence = Math.sin(progress * Math.PI * 3 + this.originX * 0.01) * 20;
    this.x += turbulence * progress;
    this.y += turbulence * progress * 0.5;
    this.opacity = progress < 0.95 ? 1 : 1 - ((progress - 0.95) / 0.05);
    this.blur = progress * 100;
  }

  updateShow(progress: number) {
    const eased = Math.pow(progress, 3);
    const expandDistance = 200;
    const startX = this.originX + Math.cos(this.angle) * expandDistance;
    const startY = this.originY + Math.sin(this.angle) * expandDistance;
    this.x = startX + (this.originX - startX) * eased;
    this.y = startY + (this.originY - startY) * eased;
    const turbulence = Math.sin((1 - progress) * Math.PI * 3 + this.originX * 0.01) * 20;
    this.x += turbulence * (1 - progress);
    this.y += turbulence * (1 - progress) * 0.5;
    if (progress < 0.8) {
      this.opacity = 1;
    } else if (progress < 0.9583) {
      this.opacity = 1 - ((progress - 0.8) / 0.1583);
    } else {
      this.opacity = 0;
    }
    this.blur = (1 - progress) * 100;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = this.opacity;
    ctx.font = `${this.fontWeight} ${this.fontSize}px Inter, sans-serif`;
    ctx.fillStyle = 'rgb(120, 120, 120)';
    ctx.textAlign = this.align;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(this.char, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}
