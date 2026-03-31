import { 
  Component, 
  OnInit, 
  ElementRef, 
  ViewChild, 
  signal, 
  computed, 
  effect, 
  inject 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// PrimeNG & GSAP
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

@Component({
  selector: 'app-love',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule, HttpClientModule],
  templateUrl: './love.component.html',
  styleUrl: './love.component.css',
})
export class LoveComponent implements OnInit {
  @ViewChild('noBtn') noBtn!: ElementRef;

  private allCustomers = signal<any[]>([]);
  private customerId = signal<string | null>(null);

  pageData = computed(() => 
    this.allCustomers().find(c => c.id === this.customerId())
  );

  safeVideoUrl = signal<SafeResourceUrl | null>(null);
  displayDialog = signal(false);
  step = signal(1);

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    effect(() => {
      const data = this.pageData();
      if (data) {
        this.updateVideoUrl(data.videoConfig.src, false);
        setTimeout(() => {
          this.playEntranceAnimation();
          this.startGsapHearts(); // Launching GSAP version
        }, 500);
      } else if (this.allCustomers().length > 0) {
        this.router.navigate(['/not-found']);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.customerId.set(params.get('id'));
    });

    this.http.get<any[]>('/customers.json').subscribe({
      next: (data) => this.allCustomers.set(data),
      error: (err) => console.error('JSON loading error:', err)
    });
  }

  // --- Logic & Video ---
  private updateVideoUrl(url: string, autoplay: boolean) {
    let finalUrl = url;
    const isYouTube = this.pageData()?.videoConfig.type === 'youtube';
    if (isYouTube && autoplay) {
      finalUrl += finalUrl.includes('?') ? '&autoplay=1' : '?autoplay=1';
    }
    this.safeVideoUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl));
  }

  openDialog() {
    this.displayDialog.set(true);
    this.step.set(1);
    setTimeout(() => {
      gsap.to('.typewriter-text', {
        duration: 4,
        text: this.pageData()?.dialog.typewriterText || '',
        ease: "none"
      });
    }, 600);
  }

  showVideo() {
    this.step.set(2);
    this.updateVideoUrl(this.pageData()?.videoConfig.src, true);
  }

  // --- GSAP Animations ---
  private playEntranceAnimation() {
    gsap.fromTo('.note-card', 
      { opacity: 0, y: 100, scale: 0.5 },
      { duration: 1, opacity: 1, y: 0, scale: 1, stagger: 0.2, ease: 'back.out(1.7)' }
    );
  }

  moveButton() {
    const x = Math.random() * (window.innerWidth - 150);
    const y = Math.random() * (window.innerHeight - 100);
    gsap.to(this.noBtn.nativeElement, { duration: 0.2, left: x + 'px', top: y + 'px', position: 'fixed' });
  }

  private startGsapHearts() {
    const container = document.querySelector('.heart-container');
    if (!container) return;

    // Create a new heart every 400ms
    setInterval(() => {
      const heart = document.createElement('div');
      heart.innerHTML = '❤️';
      heart.style.position = 'absolute';
      heart.style.left = Math.random() * 100 + 'vw';
      heart.style.bottom = '-10%';
      heart.style.fontSize = (Math.random() * 20 + 20) + 'px';
      heart.style.opacity = '0';
      heart.style.zIndex = '1';
      
      container.appendChild(heart);

      // GSAP Magic
      gsap.to(heart, {
        y: -window.innerHeight - 100, // Move up
        x: (Math.random() - 0.5) * 200, // Random horizontal sway
        rotation: Math.random() * 360,
        opacity: 1,
        duration: Math.random() * 3 + 4,
        ease: "power1.out",
        onStart: () => {
           gsap.set(heart, { opacity: 1 });
        },
        onComplete: () => {
          heart.remove(); // Clean up DOM
        }
      });
    }, 400);
  }
}