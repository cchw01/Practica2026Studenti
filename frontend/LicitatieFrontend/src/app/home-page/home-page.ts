import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

export interface Category {
  name: string;
  icon: string;
  description: string;
}

export interface Auction {
  title: string;
  currentBid: number;
  image: string;
  description: string;
}

interface Particle {
  ox: number;
  oy: number;
  x: number;
  y: number;
  radius: number;
  accent: boolean;
}

const HERO_TITLE = 'BID. WIN. REPEAT.';

@Component({
  selector: 'home-page',
  standalone: false,
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css'],
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('heroRef', { static: true }) heroRef!: ElementRef<HTMLDivElement>;

  protected readonly displayedTitle = signal('');

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private mouse = { x: -9999, y: -9999 };
  private animationFrameId = 0;
  private revealObserver?: IntersectionObserver;

  private readonly onMouseMove = (e: MouseEvent) => {
    const rect = this.heroRef.nativeElement.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  };

  private readonly onMouseLeave = () => {
    this.mouse.x = -9999;
    this.mouse.y = -9999;
  };

  private readonly onResize = () => this.initParticles();

  constructor(private zone: NgZone, private hostRef: ElementRef<HTMLElement>, private router: Router) {}

  categories: Category[] = [
    { name: 'Technology', icon: 'memory', description: 'Cutting-edge gadgets and the latest electronics.' },
    { name: 'Auto & Motors', icon: 'directions_car', description: 'Cars, motorcycles, and rare parts.' },
    { name: 'Art & Collectibles', icon: 'palette', description: 'Exclusive art pieces and collections.' },
    { name: 'Real Estate', icon: 'home_work', description: 'Exceptional properties and land.' },
  ];

  auctions: Auction[] = [
    {
      title: 'BMW',
      currentBid: 100,
      image: 'assets/images/car.png',
      description: 'BMW 7 Series, 2022, pristine condition, single owner.',
    },
    {
      title: 'Gold Earrings',
      currentBid: 200,
      image: 'assets/images/cercei.jpeg',
      description: '18k gold earrings with certified diamonds.',
    },
    {
      title: 'Watch Patek Philippe',
      currentBid: 300,
      image: 'assets/images/ceas.jpeg',
      description: 'Limited edition collector watch, box and certificate included.',
    },
    {
      title: 'Villa',
      currentBid: 400,
      image: 'assets/images/vila.jpeg',
      description: 'Luxury villa with pool, 5 bedrooms, panoramic view.',
    },
  ];

  protected readonly searchQuery = signal('');

  exploreAuctions() {
    this.router.navigate(['/auctions']);
  }

  startSelling() {
    this.router.navigate(['/add-item']);
  }

  runSearch() {
    const query = this.searchQuery().trim();
    this.router.navigate(['/auctions'], query ? { queryParams: { search: query } } : {});
  }

  placeBid(auction: Auction) {
    this.router.navigate(['/action-item-page'], { state: { auction } });
  }

  goToAuction(auction: Auction) {
    this.router.navigate(['/action-item-page'], { state: { auction } });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initParticles();
    const hero = this.heroRef.nativeElement;
    hero.addEventListener('mousemove', this.onMouseMove);
    hero.addEventListener('mouseleave', this.onMouseLeave);
    window.addEventListener('resize', this.onResize);
    this.zone.runOutsideAngular(() => this.animate());

    this.setupScrollReveal();
    this.typeHeroTitle();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    const hero = this.heroRef.nativeElement;
    hero.removeEventListener('mousemove', this.onMouseMove);
    hero.removeEventListener('mouseleave', this.onMouseLeave);
    window.removeEventListener('resize', this.onResize);
    this.revealObserver?.disconnect();
  }

  private typeHeroTitle(): void {
    let i = 0;
    const step = () => {
      i++;
      this.displayedTitle.set(HERO_TITLE.slice(0, i));
      if (i < HERO_TITLE.length) {
        setTimeout(step, 45 + Math.random() * 35);
      }
    };
    step();
  }

  private setupScrollReveal(): void {
    const targets = this.hostRef.nativeElement.querySelectorAll('.reveal-on-scroll');
    this.revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
        }
      },
      { threshold: 0.15 },
    );
    targets.forEach((el) => this.revealObserver!.observe(el));
  }

  private initParticles(): void {
    const canvas = this.canvasRef.nativeElement;
    const hero = this.heroRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    const width = hero.clientWidth;
    const height = hero.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    this.ctx = canvas.getContext('2d')!;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(260, Math.round((width * height) / 5500));
    this.particles = Array.from({ length: count }, () => {
      const ox = Math.random() * width;
      const oy = Math.random() * height;
      const accent = Math.random() < 0.18;
      return {
        ox,
        oy,
        x: ox,
        y: oy,
        radius: accent ? 2.2 + Math.random() * 1.6 : 1.1 + Math.random() * 1.2,
        accent,
      };
    });
  }

  private readonly animate = (): void => {
    const width = this.heroRef.nativeElement.clientWidth;
    const height = this.heroRef.nativeElement.clientHeight;
    this.ctx.clearRect(0, 0, width, height);

    const repelRadius = 170;
    for (const p of this.particles) {
      const dx = p.ox - this.mouse.x;
      const dy = p.oy - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let targetX = p.ox;
      let targetY = p.oy;
      let nearBoost = 0;

      if (dist < repelRadius) {
        nearBoost = (repelRadius - dist) / repelRadius;
        const angle = Math.atan2(dy, dx);
        targetX = p.ox + Math.cos(angle) * nearBoost * 60;
        targetY = p.oy + Math.sin(angle) * nearBoost * 60;
      }

      p.x += (targetX - p.x) * 0.16;
      p.y += (targetY - p.y) * 0.16;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius + nearBoost * 2, 0, Math.PI * 2);
      this.ctx.fillStyle = p.accent
        ? `rgba(63, 81, 181, ${0.35 + nearBoost * 0.6})`
        : `rgba(20, 20, 30, ${0.12 + nearBoost * 0.35})`;
      this.ctx.fill();
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  };
}
