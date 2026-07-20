import {
  AfterViewInit,
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

export interface Category {
  name: string;
  icon: string;
  description: string;
}

export interface Auction {
  id?: number;
  title: string;
  currentBid: number;
  image: string;
  description: string;
  PhotoList?: string[];
  Category?: any;
  Location?: string;
  StartDate?: any;
  EndDate?: any;
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

  private readonly destroyRef = inject(DestroyRef);

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private mouse = { x: -9999, y: -9999 };
  private animationFrameId = 0;
  private titleTypingTimeoutId?: ReturnType<typeof setTimeout>;
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

  constructor(
    private zone: NgZone,
    private hostRef: ElementRef<HTMLElement>,
    private router: Router,
    private readonly translate: TranslateService,
    private itemService: ItemService,
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

  auctions: Auction[] = [
    {
      id: 1,
      title: 'Vintage Leather Jacket',
      currentBid: 180,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop',
      description: 'An authentic vintage leather jacket in excellent condition.',
      PhotoList: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&auto=format&fit=crop'
      ]
    },
    {
      id: 2,
      title: 'Antique Pocket Watch 1920s',
      currentBid: 550,
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop',
      description: 'A handcrafted antique pocket watch from the 1920s in working condition.',
      PhotoList: [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop'
      ]
    },
    {
      id: 3,
      title: 'BMW 3 Series 2021 M-Sport',
      currentBid: 16200,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop',
      description: 'Full service history, accident-free, luxury interior package.',
      PhotoList: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop'
      ]
    },
    {
      id: 4,
      title: 'Apple iPhone 15 Pro Max',
      currentBid: 950,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop',
      description: 'Brand new sealed box in Natural Titanium.',
      PhotoList: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop'
      ]
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
    if (auction.id) {
      this.router.navigate(['/action-item-page', auction.id], { state: { auction } });
    } else {
      this.router.navigate(['/action-item-page'], { state: { auction } });
    }
  }

  goToAuction(auction: Auction) {
    if (auction.id) {
      this.router.navigate(['/action-item-page', auction.id], { state: { auction } });
    } else {
      this.router.navigate(['/action-item-page'], { state: { auction } });
    }
  }

  ngOnInit(): void {
    this.itemService.getItems().subscribe({
      next: (items: any[]) => {
        if (items && items.length > 0) {
          this.auctions = items.slice(0, 4).map((item: any) => ({
            id: item.ID,
            title: item.Name,
            currentBid: item.CurrentPrice,
            image: item.ImageUrl
              ? (item.ImageUrl.startsWith('http') ? item.ImageUrl : `https://localhost:7137${item.ImageUrl}`)
              : (item.PhotoList && item.PhotoList[0] ? item.PhotoList[0] : 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'),
            description: item.Description || '',
            PhotoList: item.PhotoList || (item.ImageUrl ? [item.ImageUrl] : []),
            Category: item.Category,
            Location: item.Location,
            StartDate: item.StartDate,
            EndDate: item.EndDate,
          }));
        }
      },
      error: (err: any) => console.error('Could not load live homepage items', err),
    });

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