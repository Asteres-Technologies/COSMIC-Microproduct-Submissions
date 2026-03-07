// Canvas-based smoke/distortion effect for text animations
// Uses individual characters as particles for better performance

export class SmokeEffect {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private characters: CharacterParticle[] = [];
  private animationFrame: number | null = null;
  private startTime: number = 0;
  private duration: number = 1200;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  // Initialize character particles from text
  initFromText(text: string, x: number, y: number, fontSize: number, fontWeight: string = '300') {
    this.characters = [];
    
    // Set canvas size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    this.addTextCharacters(text, x, y, fontSize, fontWeight);
  }

  // Add character particles for a text element
  addTextCharacters(text: string, x: number, y: number, fontSize: number, fontWeight: string = '300') {
    // Measure text
    this.ctx.font = `${fontWeight} ${fontSize}px Inter, sans-serif`;
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';
    
    // Split text into characters and create particles
    const chars = text.split('');
    let currentX = x;
    
    for (let i = chars.length - 1; i >= 0; i--) {
      const char = chars[i];
      if (char === ' ') {
        currentX -= this.ctx.measureText(char).width;
        continue;
      }
      
      const charWidth = this.ctx.measureText(char).width;
      // Position character at currentX (right-aligned), which is where it will render
      this.characters.push(new CharacterParticle(
        char,
        currentX, // This is the right edge of the character
        y,
        fontSize,
        fontWeight,
        x - currentX // Distance from right edge for center calculation
      ));
      currentX -= charWidth;
    }
  }

  // Start hide animation (characters explode outward)
  startHide() {
    this.startTime = Date.now();
    this.animate('hide');
  }

  // Start show animation (characters collapse inward)
  startShow() {
    this.startTime = Date.now();
    this.animate('show');
  }

  // Stop animation
  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private animate(type: 'hide' | 'show') {
    const elapsed = Date.now() - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Group characters by blur level for batching (round to nearest 10px for fewer groups)
    const blurGroups = new Map<number, CharacterParticle[]>();
    
    this.characters.forEach(char => {
      if (type === 'hide') {
        char.updateHide(progress);
      } else {
        char.updateShow(progress);
      }
      
      // Round blur to nearest 10px for fewer batches (better performance)
      const blurKey = Math.round(char.blur / 10) * 10;
      if (!blurGroups.has(blurKey)) {
        blurGroups.set(blurKey, []);
      }
      blurGroups.get(blurKey)!.push(char);
    });
    
    // Draw characters in batches by blur level
    blurGroups.forEach((chars, blurLevel) => {
      this.ctx.filter = `blur(${blurLevel}px)`;
      chars.forEach(char => char.draw(this.ctx));
    });
    
    // Reset filter
    this.ctx.filter = 'none';
    
    // Continue animation
    if (progress < 1) {
      this.animationFrame = requestAnimationFrame(() => this.animate(type));
    } else {
      this.stop();
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
  private opacity: number = 1;
  public blur: number = 0;

  constructor(char: string, x: number, y: number, fontSize: number, fontWeight: string, distanceFromCenter: number) {
    this.char = char;
    this.originX = x;
    this.originY = y;
    this.x = x;
    this.y = y;
    this.fontSize = fontSize;
    this.fontWeight = fontWeight;
    
    // Calculate angle for radial movement (with some randomness)
    this.angle = Math.atan2(Math.random() - 0.5, -distanceFromCenter) + (Math.random() - 0.5) * 0.5;
  }

  updateHide(progress: number) {
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    
    // Move outward along angle
    const expandDistance = 200;
    this.x = this.originX + Math.cos(this.angle) * eased * expandDistance;
    this.y = this.originY + Math.sin(this.angle) * eased * expandDistance;
    
    // Add turbulence
    const turbulence = Math.sin(progress * Math.PI * 3 + this.originX * 0.01) * 20;
    this.x += turbulence * progress;
    this.y += turbulence * progress * 0.5;
    
    // Fade out at the end (last 5%)
    this.opacity = progress < 0.95 ? 1 : 1 - ((progress - 0.95) / 0.05);
    
    // Blur increases from 0 to 100px
    this.blur = progress * 100;
  }

  updateShow(progress: number) {
    // Mirror the hide animation - just reverse it
    // Ease in cubic
    const eased = Math.pow(progress, 3);
    
    // Move inward toward origin from outside
    const expandDistance = 200;
    const startX = this.originX + Math.cos(this.angle) * expandDistance;
    const startY = this.originY + Math.sin(this.angle) * expandDistance;
    
    this.x = startX + (this.originX - startX) * eased;
    this.y = startY + (this.originY - startY) * eased;
    
    // Add turbulence (same as hide but reversed)
    const turbulence = Math.sin((1 - progress) * Math.PI * 3 + this.originX * 0.01) * 20;
    this.x += turbulence * (1 - progress);
    this.y += turbulence * (1 - progress) * 0.5;
    
    // Fade out from 80% to 95.83% (960ms to 1150ms)
    if (progress < 0.8) {
      this.opacity = 1;
    } else if (progress < 0.9583) {
      this.opacity = 1 - ((progress - 0.8) / 0.1583);
    } else {
      this.opacity = 0;
    }
    
    // Blur decreases from 100px to 0 (reverse of hide)
    this.blur = (1 - progress) * 100;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Only set opacity, blur is set per batch
    ctx.globalAlpha = this.opacity;
    
    // Set font and draw character - use medium gray to match text
    ctx.font = `${this.fontWeight} ${this.fontSize}px Inter, sans-serif`;
    ctx.fillStyle = 'rgb(120, 120, 120)'; // Medium gray to match actual text color
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic'; // Changed from 'middle' to match HTML text
    ctx.fillText(this.char, this.x, this.y);
    
    // Reset alpha
    ctx.globalAlpha = 1;
  }
}
