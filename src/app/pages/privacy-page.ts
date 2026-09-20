import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy-page',
  template: `<main id="main" class="container prose" tabindex="-1">
    <p class="eyebrow">Informacje o danych</p>
    <h1>Polityka prywatności</h1>
    <h2>Kto obsługuje Twoje dane?</h2>
    <p>
      Administratorem danych przekazywanych przez tę stronę jest Adam Ułanowski. W sprawach
      prywatności napisz na <a href="mailto:aulanowski98@gmail.com">aulanowski98&#64;gmail.com</a>.
    </p>
    <h2>Formularz kontaktowy</h2>
    <p>
      Do odpowiedzi potrzebuję Twojego adresu e-mail i treści wiadomości. Imię oraz kontekst z
      demonstracji są opcjonalne. Nie podawaj w wiadomości danych wrażliwych. Podanie danych jest
      dobrowolne, ale bez adresu e-mail nie mogę odpowiedzieć przez formularz.
    </p>
    <h2>Cel i podstawa przetwarzania</h2>
    <p>
      Dane służą obsłudze zapytania i korespondencji. Gdy pytasz o zawarcie umowy, podstawą są
      działania na Twoje żądanie przed jej zawarciem (art. 6 ust. 1 lit. b RODO). Pozostała
      korespondencja i ochrona przed nadużyciami opierają się na prawnie uzasadnionym interesie
      administratora (art. 6 ust. 1 lit. f RODO).
    </p>
    <h2>Obsługa i przechowywanie</h2>
    <p>
      Formularz przekazuje wiadomość do usługi wysyłki Resend, a następnie do skrzynki pocztowej
      administratora. W obsłudze danych uczestniczą dostawcy hostingu i poczty. Korespondencja jest
      potrzebna przez czas obsługi zapytania i dalszych ustaleń; jeśli staje się częścią współpracy,
      okres przechowywania zależy także od obowiązków prawnych i ewentualnych roszczeń.
    </p>
    <p>
      Serwer używa adresu IP do ograniczania liczby prób wysłania w 15-minutowym oknie. Wpisy
      wygasłe są usuwane przy kolejnych żądaniach. Infrastruktura hostingowa może również prowadzić
      logi techniczne potrzebne do bezpieczeństwa.
    </p>
    <h2>Twoje prawa</h2>
    <p>
      W granicach przewidzianych przez RODO możesz żądać dostępu, sprostowania, usunięcia lub
      ograniczenia przetwarzania danych, a także przeniesienia danych. Możesz wnieść sprzeciw wobec
      przetwarzania opartego na uzasadnionym interesie i skargę do Prezesa UODO.
    </p>
    <h2>Demonstracja i pliki cookies</h2>
    <p>
      Wybory w konfiguratorze pozostają w pamięci strony. Jeśli przejdziesz do kontaktu z
      kontekstem, wybrane opcje znajdą się w adresie strony i zostaną wysłane dopiero z formularzem.
      Możesz usunąć kontekst przed wysłaniem. Aplikacja nie zapisuje marketingowych plików cookies
      ani nie podejmuje automatycznych decyzji dotyczących użytkownika.
    </p>
    <p>
      Informacje o prawach:
      <a
        href="https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en"
        >ochrona danych — Komisja Europejska</a
      >.
    </p>
  </main>`,
})
export class PrivacyPage {}
