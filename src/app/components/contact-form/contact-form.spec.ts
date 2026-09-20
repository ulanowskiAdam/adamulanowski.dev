import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ContactForm } from './contact-form';
import { vi } from 'vitest';

describe('contact form', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [ContactForm], providers: [provideRouter([])] }),
  );
  afterEach(() => vi.restoreAllMocks());
  async function setup() {
    const fixture = TestBed.createComponent(ContactForm);
    fixture.detectChanges();
    await fixture.whenStable();
    return {
      fixture,
      form: fixture.componentInstance,
      element: fixture.nativeElement as HTMLElement,
    };
  }
  it('shows inline errors, accessible associations and focuses the first invalid field', async () => {
    const { fixture, form, element } = await setup();
    const focus = vi.spyOn(element.querySelector<HTMLInputElement>('#email')!, 'focus');
    await form.submit();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(element.querySelector('#email')?.getAttribute('aria-invalid')).toBe('true');
    expect(element.querySelector('#email')?.getAttribute('aria-describedby')).toBe('email-error');
    expect(element.querySelector('#message-error')?.textContent).toContain('Napisz');
    expect(focus).toHaveBeenCalled();
  });
  it('requires a valid email and message, rejects >2000 characters', async () => {
    const { form } = await setup();
    const send = vi.spyOn(globalThis, 'fetch');
    form.email = 'bad';
    form.message = 'x'.repeat(2001);
    await form.submit();
    expect(form.errors().email).toBeTruthy();
    expect(form.errors().message).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
  });
  it('sends v2, prevents concurrent and repeated accepted submissions', async () => {
    const { form } = await setup();
    let finish!: (response: Response) => void;
    const send = vi
      .spyOn(globalThis, 'fetch')
      .mockReturnValue(new Promise((resolve) => (finish = resolve)));
    form.email = 'jan@example.com';
    form.message = 'Potrzebuję strony';
    const pending = form.submit();
    await form.submit();
    expect(send).toHaveBeenCalledTimes(1);
    finish(new Response(JSON.stringify({ ok: true, status: 'accepted' }), { status: 202 }));
    await pending;
    await form.submit();
    expect(send).toHaveBeenCalledTimes(1);
    expect(JSON.parse(send.mock.calls[0][1]!.body as string)).toMatchObject({
      version: 2,
      name: '',
      email: form.email,
    });
    expect(form.state()).toBe('accepted');
    expect(form.feedback()).not.toContain('dotarła');
  });
  it.each([
    [400, { code: 'validation_error', fields: { email: 'Popraw e-mail.' } }, 'Sprawdź'],
    [429, { code: 'rate_limited' }, 'Zbyt wiele'],
    [503, { code: 'not_configured' }, 'niedostępny'],
    [502, { code: 'provider_error' }, 'Dostawca'],
  ])('keeps input and explains HTTP %i errors', async (status, body, copy) => {
    const { form } = await setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status }));
    form.email = 'jan@example.com';
    form.message = 'Moja wiadomość';
    await form.submit();
    expect(form.email).toBe('jan@example.com');
    expect(form.message).toBe('Moja wiadomość');
    expect(form.state()).toBe('error');
    expect(form.feedback()).toContain(copy);
  });
  it('preserves data on network failure and allows a retry', async () => {
    const { form } = await setup();
    const send = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    form.email = 'jan@example.com';
    form.message = 'Mój projekt';
    await form.submit();
    expect(form.message).toBe('Mój projekt');
    send.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 202 }));
    await form.submit();
    expect(form.state()).toBe('accepted');
  });
});
