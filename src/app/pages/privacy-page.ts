import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy-page',
  template: `<main id="main" class="container prose" tabindex="-1">
    <p class="eyebrow">Informacje o danych</p>
    <h1>Polityka prywatności</h1>
    <h2>Kto obsługuje Twoje dane?</h2>
    <p>
      Administratorem danych przekazywanych przez tę stronę jest Adam Ułanowski Software Engineering, ul. Modelarska 6/8, 71-837 Szczecin, NIP: 8513352257. W sprawach
      prywatności napisz na <a href="mailto:kontakt@adamulanowski.dev">kontakt&#64;adamulanowski.dev</a>.
    </p>
    <h2>Formularz kontaktowy</h2>
    <p>
      Do odpowiedzi potrzebuję Twojego adresu e-mail i treści wiadomości. Imię, wybór usługi, budżet, termin oraz kontekst z demonstracji są opcjonalne. Nie podawaj w wiadomości danych wrażliwych. Podanie danych jest
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
    <h2>Google Analytics i wybór zgody</h2>
    <p>Za Twoją zgodą korzystam z Google Analytics 4 do pomiaru odwiedzin, przyjętych zgłoszeń z formularza oraz kliknięć adresu kontaktowego. Podstawą tej analityki jest zgoda (art. 6 ust. 1 lit. a RODO). Bez zgody tag Google nie jest ładowany. Odrzucenie analityki nie blokuje kontaktu.</p>
    <p>Dostawcą jest Google Ireland Limited. Google może przetwarzać dane również poza Europejskim Obszarem Gospodarczym zgodnie z zasadami usługi. Pomiar może obejmować identyfikatory przeglądarki, dane urządzenia, odsłony i interakcje. Do Analytics nie przekazuję imienia, adresu e-mail, treści wiadomości ani parametrów zapytania w adresie strony. Reklamowa personalizacja danych jest wyłączona.</p>
    <p>Po zgodzie Analytics może zapisywać cookies _ga i _ga_*. Ustawiony okres przechowywania danych użytkownika i zdarzeń w usłudze wynosi 2 miesiące. Decyzja o analityce jest zapamiętana lokalnie w przeglądarce do czasu jej zmiany lub usunięcia danych strony. Zgodę możesz wycofać przez „Ustawienia analityki” w stopce; nie wpływa to na zgodność wcześniejszego przetwarzania.</p>
    <p>Więcej informacji: <a href="https://policies.google.com/technologies/partner-sites?hl=pl">jak Google wykorzystuje dane z witryn</a> oraz <a href="https://policies.google.com/privacy?hl=pl">polityka prywatności Google</a>.</p>
    <h2>Demonstracja i pliki cookies</h2>
    <p>
      Opcjonalna odpowiedź „Skąd o mnie wiesz?” trafia do wiadomości kontaktowej.
      Do oceny źródeł zapytań serwer zapisuje także datę przyjęcia wiadomości przez usługę
      wysyłki i wybraną kategorię źródła. Ten wpis statystyczny nie zawiera treści wiadomości,
      adresu e-mail ani adresu IP i nie wymaga zapisywania cookies w przeglądarce.
    </p>
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
        >ochrona danych - Komisja Europejska</a
      >.
    </p>
  </main>`,
})
export class PrivacyPage {}
