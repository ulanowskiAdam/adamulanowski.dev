import { afterNextRender, Component, ElementRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FieldErrors, validateContact } from '../../../shared/contact-validation';

@Component({
  selector: 'app-contact-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm {
  name = '';
  email = '';
  message = '';
  website = '';
  readonly context = signal('');
  readonly errors = signal<FieldErrors>({});
  readonly state = signal<'idle' | 'sending' | 'accepted' | 'error'>('idle');
  readonly feedback = signal('');
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly route = inject(ActivatedRoute);
  constructor() {
    // Context is optional, never inserted into the message or required for submission.
    afterNextRender(() =>
      this.context.set((this.route.snapshot.queryParamMap.get('context') ?? '').slice(0, 500)),
    );
  }
  clearError(field: keyof FieldErrors) {
    this.errors.update((errors) => ({ ...errors, [field]: undefined }));
  }
  private focusError(errors: FieldErrors) {
    const first = (['name', 'email', 'message'] as const).find((field) => errors[field]);
    // Attributes and inline errors render before focus is moved.
    setTimeout(() =>
      this.element.nativeElement
        .querySelector<HTMLElement>(first ? '#' + first : '[role="alert"]')
        ?.focus(),
    );
  }
  async submit() {
    if (this.state() === 'sending' || this.state() === 'accepted') return;
    const errors = validateContact(this);
    this.errors.set(errors);
    this.feedback.set('');
    if (Object.keys(errors).length) {
      this.focusError(errors);
      return;
    }
    this.state.set('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: 2,
          name: this.name.trim(),
          email: this.email.trim(),
          message: this.message,
          website: this.website,
          context: this.context(),
        }),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (response.ok && result.ok === true) {
        this.state.set('accepted');
        this.feedback.set(
          'Dziękuję! Zgłoszenie zostało przyjęte do wysłania. To nie jest potwierdzenie dostarczenia wiadomości.',
        );
        return;
      }
      if (response.status === 400 && result.code === 'validation_error') {
        const fields: FieldErrors = {};
        for (const key of ['name', 'email', 'message'] as const) {
          if (typeof result.fields?.[key] === 'string') fields[key] = result.fields[key];
        }
        this.errors.set(fields);
        this.feedback.set('Sprawdź zaznaczone pola.');
        this.focusError(fields);
      } else {
        this.feedback.set(
          result.code === 'rate_limited' || response.status === 429
            ? 'Zbyt wiele prób. Spróbuj ponownie później lub napisz bezpośrednio e-mailem.'
            : result.code === 'not_configured'
              ? 'Formularz jest chwilowo niedostępny. Napisz na aulanowski98@gmail.com.'
              : 'Dostawca poczty nie potwierdził przyjęcia wiadomości. Spróbuj ponownie lub napisz bezpośrednio e-mailem.',
        );
      }
      this.state.set('error');
    } catch {
      this.state.set('error');
      this.feedback.set(
        'Nie udało się potwierdzić wysłania. Sprawdź połączenie i spróbuj ponownie lub napisz bezpośrednio e-mailem.',
      );
    }
  }
}
