import { Component, ElementRef, HostListener, OnDestroy, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
})
export class SiteHeader implements OnDestroy {
  readonly menuOpen = signal(false);
  private readonly drawer = viewChild.required<ElementRef<HTMLDialogElement>>('drawer');
  private previousOverflow = '';

  openMenu(): void {
    const dialog = this.drawer().nativeElement;
    this.previousOverflow = dialog.ownerDocument.documentElement.style.overflow;
    dialog.ownerDocument.documentElement.style.overflow = 'hidden';
    dialog.showModal();
    this.menuOpen.set(true);
  }

  closeMenu(): void {
    this.drawer().nativeElement.close();
    this.restoreScroll();
  }

  restoreScroll(): void {
    if (!this.menuOpen()) return;
    this.drawer().nativeElement.ownerDocument.documentElement.style.overflow =
      this.previousOverflow;
    this.menuOpen.set(false);
  }

  closeOnBackdrop(event: MouseEvent): void {
    if (event.target === this.drawer().nativeElement) this.closeMenu();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (
      this.menuOpen() &&
      this.drawer().nativeElement.ownerDocument.defaultView!.innerWidth >= 768
    ) {
      this.closeMenu();
    }
  }

  ngOnDestroy(): void {
    this.restoreScroll();
  }
}
