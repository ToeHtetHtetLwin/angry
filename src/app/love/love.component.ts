import { Component, OnInit, ElementRef, ViewChild, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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

  pageData = computed(() => this.allCustomers().find(c => c.id === this.customerId()));
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
          this.startGsapHearts();
        }, 500);
      } else if (this.allCustomers().length > 0) {
        this.router.navigate(['/not-found']);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => this.customerId.set(params.get('id')));
    this.http.get<any[]>('/customers.json').subscribe({
      next: (data) => this.allCustomers.set(data),
      error: (err) => console.error('JSON Error:', err)
    });
  }

  private updateVideoUrl(url: string, autoplay: boolean) {
    let finalUrl = url;
    if (this.pageData()?.videoConfig.type === 'youtube' && autoplay) {
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

  showFlowers() {
    this.step.set(1.5);
  }

  showVideo() {
    this.step.set(2);
    this.updateVideoUrl(this.pageData()?.videoConfig.src, true);
  }

  moveButton(event?: Event) {
    if (event) event.preventDefault();
    const btn = this.noBtn.nativeElement;
    const padding = 30;
    const maxX = window.innerWidth - btn.offsetWidth - padding;
    const maxY = window.innerHeight - btn.offsetHeight - padding;
    const x = Math.max(padding, Math.random() * maxX);
    const y = Math.max(padding, Math.random() * maxY);
    gsap.to(btn, { duration: 0.3, left: x, top: y, position: 'fixed', zIndex: 999 });
  }

  private playEntranceAnimation() {
    gsap.fromTo('.note-card', { opacity: 0, y: 50 }, { duration: 0.8, opacity: 1, y: 0, stagger: 0.2 });
  }

  private startGsapHearts() {
    const container = document.querySelector('.heart-container');
    if (!container) return;
    setInterval(() => {
      const heart = document.createElement('div');
      heart.innerHTML = '❤️';
      heart.style.position = 'absolute';
      heart.style.left = Math.random() * 100 + 'vw';
      heart.style.bottom = '-10%';
      heart.style.fontSize = (Math.random() * 20 + 20) + 'px';
      container.appendChild(heart);
      gsap.to(heart, { y: -window.innerHeight - 100, x: (Math.random() - 0.5) * 150, opacity: 1, duration: 5, onComplete: () => heart.remove() });
    }, 600);
  }
}