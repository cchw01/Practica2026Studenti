import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { ItemService } from '../services/item-service';
import { AuctionItem } from '../Models/item-model';

export interface Category {
  name: string;
  icon: string;
  description: string;
}

export interface AboutFeature {
  icon: string;
  titleKey: string;
  descriptionKey: string;
}

const MIN_REMAINING_MS = 10 * 60 * 1000;

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

  private readonly destroyRef = inject(DestroyRef);

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private mouse = { x: -9999, y: -9999 };
  private animationFrameId = 0;
  private titleTypingTimeoutId?: ReturnType<typeof setTimeout>;
  private revealObserver?: IntersectionObserver;
  private auctionsTimerId?: ReturnType<typeof setInterval>;
  private allAuctions: AuctionItem[] = [];

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

  constructor(
    private zone: NgZone,
    private hostRef: ElementRef<HTMLElement>,
    private router: Router,
    private readonly translate: TranslateService,
    private readonly itemService: ItemService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  categories: Category[] = [
    {
      name: 'Technology',
      icon: 'memory',
      description: 'Cutting-edge gadgets and the latest electronics.',
    },
    {
      name: 'Auto & Motors',
      icon: 'directions_car',
      description: 'Cars, motorcycles, and rare parts.',
    },
    {
      name: 'Art & Collectibles',
      icon: 'palette',
      description: 'Exclusive art pieces and collections.',
    },
    {
      name: 'Real Estate',
      icon: 'home_work',
      description: 'Exceptional properties and land.',
    },
  ];

  displayedAuctions: AuctionItem[] = [];

  aboutFeatures: AboutFeature[] = [
    {
      icon: 'verified_user',
      titleKey: 'HOME.ABOUT.FEATURES.SECURE.TITLE',
      descriptionKey: 'HOME.ABOUT.FEATURES.SECURE.DESCRIPTION',
    },
    {
      icon: 'bolt',
      titleKey: 'HOME.ABOUT.FEATURES.REALTIME.TITLE',
      descriptionKey: 'HOME.ABOUT.FEATURES.REALTIME.DESCRIPTION',
    },
    {
      icon: 'groups',
      titleKey: 'HOME.ABOUT.FEATURES.COMMUNITY.TITLE',
      descriptionKey: 'HOME.ABOUT.FEATURES.COMMUNITY.DESCRIPTION',
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
    this.router.navigate(['/search-page'], query ? { queryParams: { q: query } } : {});
  }

  placeBid(auction: AuctionItem) {
    this.router.navigate(['/action-item-page'], { state: { auction } });
  }

  goToAuction(auction: AuctionItem) {
    this.router.navigate(['/action-item-page'], { state: { auction } });
  }

  getRemainingLabel(endDate: Date): string {
    const diffMs = new Date(endDate).getTime() - Date.now();
    if (diffMs <= 0) return this.translate.instant('AUCTIONS_PAGE.TIME.ENDED');

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m ${seconds}s left`;
  }

  getTimeUrgencyClass(endDate: Date): string {
    const minutesLeft = (new Date(endDate).getTime() - Date.now()) / (1000 * 60);

    if (minutesLeft <= 30) return 'time-urgent';
    if (minutesLeft <= 180) return 'time-medium';
    return 'time-safe';
  }

  private refreshDisplayedAuctions(): void {
    const now = Date.now();

    this.displayedAuctions = this.allAuctions
      .map((item) => ({ item, remainingMs: new Date(item.EndDate).getTime() - now }))
      .filter((entry) => entry.remainingMs >= MIN_REMAINING_MS)
      .sort((a, b) => a.remainingMs - b.remainingMs)
      .map((entry) => entry.item);

    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.translate
      .stream('HOME.HERO.TITLE')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((title) => {
        if (typeof title === 'string') {
          const heroTitle =
            title === 'HOME.HERO.TITLE'
              ? HERO_TITLE
              : title;

          this.typeHeroTitle(heroTitle);
        }
      });

    this.itemService.getItems().subscribe({
      next: (items) => {
        this.allAuctions = items;
        this.refreshDisplayedAuctions();
      },
      error: (err) => console.error('Eroare la încărcarea licitațiilor', err),
    });

    this.auctionsTimerId = setInterval(() => this.refreshDisplayedAuctions(), 1000);
  }

  ngAfterViewInit(): void {
    this.initParticles();

    const hero = this.heroRef.nativeElement;

    hero.addEventListener('mousemove', this.onMouseMove);
    hero.addEventListener('mouseleave', this.onMouseLeave);
    window.addEventListener('resize', this.onResize);

    this.zone.runOutsideAngular(() => this.animate());

    this.setupScrollReveal();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);

    if (this.titleTypingTimeoutId !== undefined) {
      clearTimeout(this.titleTypingTimeoutId);
    }

    if (this.auctionsTimerId !== undefined) {
      clearInterval(this.auctionsTimerId);
    }

    const hero = this.heroRef.nativeElement;

    hero.removeEventListener('mousemove', this.onMouseMove);
    hero.removeEventListener('mouseleave', this.onMouseLeave);
    window.removeEventListener('resize', this.onResize);

    this.revealObserver?.disconnect();
  }

  private typeHeroTitle(title: string): void {
    if (this.titleTypingTimeoutId !== undefined) {
      clearTimeout(this.titleTypingTimeoutId);
    }

    let i = 0;
    this.displayedTitle.set('');

    const step = () => {
      i++;

      this.displayedTitle.set(title.slice(0, i));

      if (i < title.length) {
        this.titleTypingTimeoutId = setTimeout(
          step,
          45 + Math.random() * 35,
        );
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
        radius: accent
          ? 2.2 + Math.random() * 1.6
          : 1.1 + Math.random() * 1.2,
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
      this.ctx.arc(
        p.x,
        p.y,
        p.radius + nearBoost * 2,
        0,
        Math.PI * 2,
      );

      this.ctx.fillStyle = p.accent
        ? `rgba(63, 81, 181, ${0.35 + nearBoost * 0.6})`
        : `rgba(20, 20, 30, ${0.12 + nearBoost * 0.35})`;

      this.ctx.fill();
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  };
}