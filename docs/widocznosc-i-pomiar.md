# Widoczność strony i pomiar zapytań

## Wprowadzone zmiany

- Oferta aplikacji i AI określa rezultaty współpracy i przykłady odbioru.
- Demo konfiguratora jest opisane jako własny interfejs demonstracyjny.
- GET/HEAD na www przekierowuje 301 na HTTPS bez www, z zachowaniem ścieżki i parametrów.
  Pozostałe metody używają 308, aby zachować treść żądania.
- robots.txt i sitemap.xml mają pięciominutowy cache zamiast rocznego.
- Formularz ma opcjonalne źródło kontaktu, przekazywane w e-mailu.
- Serwer zapisuje `contact_accepted` dopiero po sukcesie dostawcy poczty.
  Honeypot, błędne dane i błędy dostawcy nie zwiększają licznika.

## Czynności właściciela

1. W Google Search Console dodaj usługę domenową `adamulanowski.dev`. Skopiuj podany
   przez Google rekord TXT do DNS i potwierdź własność. Nie zmieniaj istniejących rekordów poczty.
2. Prześlij mapę `https://adamulanowski.dev/sitemap.xml`. Sprawdź adres strony głównej,
   `/aplikacje-webowe`, `/integracje-ai` oraz strony realizacji w narzędziu sprawdzania URL.
   Po publikacji możesz poprosić o indeksację; jej termin i wynik zależą od Google.
3. W reverse proxy domena www musi mieć poprawny certyfikat i trafiać do aplikacji
   z oryginalnym nagłówkiem Host. Inaczej przekierowanie aplikacji nie zostanie wykonane.
   Sprawdź `curl -I 'https://www.adamulanowski.dev/integracje-ai?test=1'`:
   oczekiwane 301 i Location `https://adamulanowski.dev/integracje-ai?test=1`.
4. W panelu firewalla/CDN sprawdź blokady OAI-SearchBot. Porównuj adresy źródłowe
   z aktualną listą https://openai.com/searchbot.json, nie tylko nazwę User-Agent.
   Zwykły test HTTP z nazwą bota nie dowodzi, że jego rzeczywiste adresy IP są wpuszczane.
5. Wyślij jedno kontrolne zapytanie i sprawdź doręczenie w skrzynce. Przyjęcie przez
   dostawcę nie oznacza doręczenia; wyłącz testowe zapytanie z własnego zestawienia.
6. Dodaj potwierdzony przykład aplikacji/AI: problem, Twoja rola, wykonane funkcje,
   demo lub zrzuty z prawem publikacji, ograniczenia i sposób testowania. Podaj lata
   doświadczenia i role tylko wtedy, gdy możesz potwierdzić te informacje.
7. Uruchom PageSpeed Insights dla strony głównej i strony usługi na telefonie.
   Zapisz datę, URL oraz wynik. Dane laboratoryjne nie zastępują rzeczywistych Core Web Vitals.

## Odczyt pomiaru

Źródło kontaktu jest dobrowolną deklaracją odwiedzającego, a nie automatyczną atrybucją.
Brak odpowiedzi to `unknown`. Pomiar nie obejmuje bezpośrednich e-maili ani telefonów,
nie mierzy odsłon, unikalnych osób ani współczynnika konwersji. Ponowne wysłanie po
utracie odpowiedzi sieciowej może zostać policzone ponownie.

Na VPS zapisz dostępne logi z ostatnich 30 dni:

```sh
docker logs --since 720h adamulanowski-web > contact-log.txt 2>&1
```

Plik może zawierać również inne logi serwera: przechowuj go prywatnie.
Pobierz go i uruchom w katalogu tego repozytorium:

```sh
node scripts/contact-report.mjs contact-log.txt
```

Logi kontenera mogą zniknąć przy jego wymianie; `--since` nie gwarantuje kompletności
30 dni. Archiwizuj je przed wdrożeniem albo skonfiguruj centralny magazyn logów z
ustaloną retencją. Źródło kontaktu zostaje również w otrzymanej korespondencji.
Raz w miesiącu zestawiaj liczbę zapytań i ich jakość z kliknięciami oraz wyświetleniami
w Search Console. Za punkt odniesienia przyjmij pierwszy pełny miesiąc pomiaru.

## Źródła i ograniczenia

- https://developers.openai.com/api/docs/bots - wyszukiwanie i trening mają oddzielne roboty.
- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide - podstawy
  wyszukiwania i wartościowa treść, bez potrzeby dodawania llms.txt.
- https://support.google.com/webmasters/answer/9008080 - weryfikacja własności.

robots.txt pozwala na indeksowanie; nie potwierdza obecności w wynikach ani odpowiedziach AI.
Nie ma gwarancji poleceń przez ChatGPT. W repozytorium nie ma danych Search Console,
konfiguracji firewalla ani pomiarów Core Web Vitals.
