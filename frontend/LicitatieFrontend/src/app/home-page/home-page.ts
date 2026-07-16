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
  ViewChild
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

export interface Category {
  id: string;
  nameKey: string;
  icon: string;
  descriptionKey: string;
}

export interface Auction {
  id: string;
  titleKey: string;
  currentBid: number;
  image: string;
  descriptionKey: string;
}

interface LocalizedAuction extends Auction {
  title: string;
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

@Component({
  selector: 'home-page',
  standalone: false,
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css']
})
export class HomePage
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('particleCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  @ViewChild('heroRef', { static: true })
  heroRef!: ElementRef<HTMLDivElement>;

  protected readonly displayedTitle = signal('');

  readonly categories: Category[] = [
    {
      id: 'technology',
      nameKey: 'HOME.CATEGORIES.ITEMS.TECHNOLOGY.NAME',
      icon: 'memory',
      descriptionKey:
        'HOME.CATEGORIES.ITEMS.TECHNOLOGY.DESCRIPTION'
    },
    {
      id: 'auto-motors',
      nameKey: 'HOME.CATEGORIES.ITEMS.AUTO_MOTORS.NAME',
      icon: 'directions_car',
      descriptionKey:
        'HOME.CATEGORIES.ITEMS.AUTO_MOTORS.DESCRIPTION'
    },
    {
      id: 'art-collectibles',
      nameKey:
        'HOME.CATEGORIES.ITEMS.ART_COLLECTIBLES.NAME',
      icon: 'palette',
      descriptionKey:
        'HOME.CATEGORIES.ITEMS.ART_COLLECTIBLES.DESCRIPTION'
    },
    {
      id: 'real-estate',
      nameKey: 'HOME.CATEGORIES.ITEMS.REAL_ESTATE.NAME',
      icon: 'home_work',
      descriptionKey:
        'HOME.CATEGORIES.ITEMS.REAL_ESTATE.DESCRIPTION'
    }
  ];

  readonly auctions: Auction[] = [
    {
      id: 'bmw',
      titleKey: 'HOME.AUCTIONS.ITEMS.BMW.TITLE',
      currentBid: 100,
      image: 'assets/images/car.png',
      descriptionKey:
        'HOME.AUCTIONS.ITEMS.BMW.DESCRIPTION'
    },
    {
      id: 'gold-earrings',
      titleKey:
        'HOME.AUCTIONS.ITEMS.GOLD_EARRINGS.TITLE',
      currentBid: 200,
      image: 'assets/images/cercei.jpeg',
      descriptionKey:
        'HOME.AUCTIONS.ITEMS.GOLD_EARRINGS.DESCRIPTION'
    },
    {
      id: 'patek-philippe',
      titleKey:
        'HOME.AUCTIONS.ITEMS.PATEK_PHILIPPE.TITLE',
      currentBid: 300,
      image: 'assets/images/ceas.jpeg',
      descriptionKey:
        'HOME.AUCTIONS.ITEMS.PATEK_PHILIPPE.DESCRIPTION'
    },
    {
      id: 'villa',
      titleKey: 'HOME.AUCTIONS.ITEMS.VILLA.TITLE',
      currentBid: 400,
      image: 'assets/images/vila.jpeg',
      descriptionKey:
        'HOME.AUCTIONS.ITEMS.VILLA.DESCRIPTION'
    }
  ];

  private readonly destroyRef = inject(DestroyRef);

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];

  private mouse = {
    x: -9999,
    y: -9999
  };

  private animationFrameId = 0;
  private typingTimeoutId?: ReturnType<typeof setTimeout>;
  private revealObserver?: IntersectionObserver;

  private readonly onMouseMove = (
    event: MouseEvent
  ): void => {
    const rect =
      this.heroRef.nativeElement.getBoundingClientRect();

    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  };

  private readonly onMouseLeave = (): void => {
    this.mouse.x = -9999;
    this.mouse.y = -9999;
  };

  private readonly onResize = (): void => {
    this.initParticles();
  };

  constructor(
    private readonly zone: NgZone,
    private readonly hostRef: ElementRef<HTMLElement>,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    /*
     * Emits the translated title initially and again
     * whenever the active language changes.
     */
    this.translate
      .stream('HOME.HERO.TITLE')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((title) => {
        if (typeof title === 'string') {
          this.typeHeroTitle(title);
        }
      });
  }

  ngAfterViewInit(): void {
    this.initParticles();

    const hero = this.heroRef.nativeElement;

    hero.addEventListener(
      'mousemove',
      this.onMouseMove
    );

    hero.addEventListener(
      'mouseleave',
      this.onMouseLeave
    );

    window.addEventListener(
      'resize',
      this.onResize
    );

    this.zone.runOutsideAngular(() => {
      this.animate();
    });

    this.setupScrollReveal();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);

    if (this.typingTimeoutId) {
      clearTimeout(this.typingTimeoutId);
    }

    const hero = this.heroRef.nativeElement;

    hero.removeEventListener(
      'mousemove',
      this.onMouseMove
    );

    hero.removeEventListener(
      'mouseleave',
      this.onMouseLeave
    );

    window.removeEventListener(
      'resize',
      this.onResize
    );

    this.revealObserver?.disconnect();
  }

  exploreAuctions(): void {
    void this.router.navigate(['/auctions']);
  }

  startSelling(): void {
    void this.router.navigate(['/profile-page']);
  }

  placeBid(auction: Auction): void {
    this.navigateToAuction(auction);
  }

  goToAuction(auction: Auction): void {
    this.navigateToAuction(auction);
  }

  private navigateToAuction(
    auction: Auction
  ): void {
    this.translate
      .get([
        auction.titleKey,
        auction.descriptionKey
      ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((translations) => {
        const values = translations as Record<
          string,
          unknown
        >;

        const localizedAuction: LocalizedAuction = {
          ...auction,
          title: String(
            values[auction.titleKey] ??
              auction.titleKey
          ),
          description: String(
            values[auction.descriptionKey] ??
              auction.descriptionKey
          )
        };

        void this.router.navigate(
          ['/action-item-page'],
          {
            state: {
              auction: localizedAuction
            }
          }
        );
      });
  }

  private typeHeroTitle(title: string): void {
    if (this.typingTimeoutId) {
      clearTimeout(this.typingTimeoutId);
    }

    this.displayedTitle.set('');

    if (!title) {
      return;
    }

    let index = 0;

    const step = (): void => {
      index++;

      this.displayedTitle.set(
        title.slice(0, index)
      );

      if (index < title.length) {
        this.typingTimeoutId = setTimeout(
          step,
          45 + Math.random() * 35
        );
      }
    };

    step();
  }

  private setupScrollReveal(): void {
    const targets =
      this.hostRef.nativeElement.querySelectorAll(
        '.reveal-on-scroll'
      );

    this.revealObserver =
      new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            entry.target.classList.toggle(
              'is-visible',
              entry.isIntersecting
            );
          }
        },
        {
          threshold: 0.15
        }
      );

    targets.forEach((element) => {
      this.revealObserver?.observe(element);
    });
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

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    this.ctx = context;

    this.ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    const count = Math.min(
      260,
      Math.round((width * height) / 5500)
    );

    this.particles = Array.from(
      { length: count },
      () => {
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
          accent
        };
      }
    );
  }

  private readonly animate = (): void => {
    if (!this.ctx) {
      return;
    }

    const width =
      this.heroRef.nativeElement.clientWidth;

    const height =
      this.heroRef.nativeElement.clientHeight;

    this.ctx.clearRect(
      0,
      0,
      width,
      height
    );

    const repelRadius = 170;

    for (const particle of this.particles) {
      const dx =
        particle.ox - this.mouse.x;

      const dy =
        particle.oy - this.mouse.y;

      const distance = Math.sqrt(
        dx * dx + dy * dy
      );

      let targetX = particle.ox;
      let targetY = particle.oy;
      let nearBoost = 0;

      if (distance < repelRadius) {
        nearBoost =
          (repelRadius - distance) /
          repelRadius;

        const angle = Math.atan2(dy, dx);

        targetX =
          particle.ox +
          Math.cos(angle) *
            nearBoost *
            60;

        targetY =
          particle.oy +
          Math.sin(angle) *
            nearBoost *
            60;
      }

      particle.x +=
        (targetX - particle.x) * 0.16;

      particle.y +=
        (targetY - particle.y) * 0.16;

      this.ctx.beginPath();

      this.ctx.arc(
        particle.x,
        particle.y,
        particle.radius + nearBoost * 2,
        0,
        Math.PI * 2
      );

      this.ctx.fillStyle = particle.accent
        ? `rgba(63, 81, 181, ${
            0.35 + nearBoost * 0.6
          })`
        : `rgba(20, 20, 30, ${
            0.12 + nearBoost * 0.35
          })`;

      this.ctx.fill();
    }

    this.animationFrameId =
      requestAnimationFrame(this.animate);
  };
}