export const projects = [
{
  "slug": "loadlift",
  "name": "LOADLIFT · sklep internetowy",
  "category": "E-commerce / WooCommerce",
  "url": "https://loadlift.pl/",
  "image": "/images/projects/loadlift.png",
  "teaser": "Sklep z osprzętem do podnoszenia i zabezpieczania ładunków. Katalog techniczny, warianty produktów i proces zakupowy dopasowany do oferty.",
  "problem": "Jak ułatwić wybór sprzętu technicznego i połączyć sprzedaż internetową z codzienną obsługą zamówień?",
  "solution": "Rozwój sklepu na WooCommerce obejmuje prezentację produktów, filtrowanie parametrów, wybór wariantów oraz dostosowanie koszyka i formularza zamówienia. Własne rozszerzenia uzupełniają gotową platformę o potrzeby tej oferty.",
  "features": [
    "Katalog z parametrami technicznymi i wariantami produktów.",
    "Dostosowanie procesu zakupowego i danych nabywcy oraz adresu dostawy.",
    "Układ sklepu dopracowany na komputerach i telefonach.",
    "Połączenie zamówień z zapleczem obsługi przez n8n."
  ],
  "result": "Klient może porównać parametry, dobrać wariant i złożyć zamówienie. Dane zamówienia trafiają dalej do narzędzi wspierających jego realizację.",
  "imageCaption": "Zrzut działającej strony głównej LOADLIFT, październik 2026.",
  "relatedSlug": "loadlift-automatyzacje",
  "relatedLabel": "Zobacz automatyzacje obsługi zamówień w n8n →",
  "serviceSlug": "strony-internetowe-dla-firm",
  "serviceLabel": "Poznaj usługę tworzenia stron →"
},
{
  "slug": "loadlift-automatyzacje",
  "name": "LOADLIFT · automatyzacje w n8n",
  "category": "Automatyzacja / e-commerce",
  "url": "https://loadlift.pl/",
  "image": "/images/projects/loadlift-n8n-sync.png",
  "teaser": "Połączenie WooCommerce, n8n i ClickUp: synchronizacja zamówień, przygotowanie wiadomości oraz obsługa informacji o fakturach i przesyłkach.",
  "problem": "Jak ograniczyć ręczne przepisywanie danych pomiędzy sklepem, pocztą i narzędziem do obsługi zamówień, zachowując kontrolę nad błędami?",
  "solution": "Przepływy w n8n łączą sklep ze wspólną bazą zamówień i ClickUp. Każde zamówienie ma powiązane pozycje, informacje o płatności i dane potrzebne do realizacji. Powtórne zdarzenia są rozpoznawane, a niejednoznaczne wyniki kierowane do sprawdzenia.",
  "features": [
    "Synchronizacja zamówienia i jego pozycji do zadań i podzadań w ClickUp.",
    "Przygotowanie wiadomości z produktami, ilościami i adresem dostawy po potwierdzeniu płatności.",
    "Integracja z inFakt i przekazywanie informacji o dokumencie do zamówienia.",
    "Odbiór danych przesyłek z poczty, propozycje dopasowania do zatwierdzenia i monitorowanie statusów."
  ],
  "result": "Operator widzi informacje z kilku systemów przy zamówieniu. Zapisane testy potwierdzają synchronizację oraz pojawienie się alertu przesyłki w ClickUp. Część komunikacji dotyczącej faktur i przesyłek była sprawdzana na wewnętrznej skrzynce.",
  "imageCaption": "Rzeczywisty schemat n8n: synchronizacja zamówień i pozycji z WooCommerce przez bazę OMS do ClickUp.",
  "gallery": [
    {
      "image": "/images/projects/loadlift-n8n-przesylki.png",
      "alt": "Schemat n8n monitorujący statusy przesyłek i przygotowujący alerty",
      "caption": "Przepływ monitorowania przesyłek: odczyt statusu, zapis zmian, wykrycie sytuacji wymagającej sprawdzenia i powiadomienie operatora. Zrzut pokazuje schemat wdrożenia; proces działa w zapleczu sklepu."
    }
  ],
  "relatedSlug": "loadlift",
  "relatedLabel": "Zobacz budowę sklepu LOADLIFT →",
  "serviceSlug": "automatyzacja-procesow",
  "serviceLabel": "Poznaj usługę automatyzacji procesów →"
},
  {
    slug: 'lifting-paulina-karol',
    name: 'Lifting Paulina Karol',
    category: 'Beauty / marka osobista',
    url: 'https://www.liftingpaulinakarol.pl/',
    image: '/images/projects/lifting-paulina-karol.webp',
    teaser:
      'Oferta terapii twarzy, przedstawienie specjalistki i wyraźne zaproszenie do umówienia wizyty.',
    problem:
      'Jak przedstawić specjalistyczne zabiegi i pomóc osobie odwiedzającej stronę przejść od poznania oferty do kontaktu?',
    solution:
      'Strona łączy prezentację Pauliny Karol, zakres zabiegów, cennik, FAQ i dane kontaktowe. Przyciski zapraszające do umówienia wizyty pojawiają się w kontekście oferty.',
    features: [
      'Prezentacja specjalistki i jej podejścia do pracy.',
      'Podział oferty na zabiegi oraz odnośnik do cennika.',
      'FAQ i czytelne wezwania do kontaktu.',
    ],
    result:
      'Odwiedzająca osoba może poznać specjalistkę, sprawdzić zakres oferty i znaleźć drogę do umówienia wizyty na jednej stronie firmowej.',
  },
  {
    slug: 'fizjomind',
    name: 'Fizjomind',
    category: 'Fizjoterapia / usługi lokalne',
    url: 'https://fizjomind-szczecin.pl/',
    image: '/images/projects/fizjomind.webp',
    teaser:
      'Strona gabinetu łącząca opis usług, odpowiedzi na pytania i przejście do rezerwacji w Booksy.',
    problem:
      'Jak pomóc pacjentowi poznać ofertę fizjoterapii, znaleźć odpowiedzi przed pierwszą wizytą i przejść do rezerwacji?',
    solution:
      'Oferta, informacje o specjalistce, FAQ i blog są dostępne obok wyraźnych przycisków prowadzących do Booksy oraz danych kontaktowych.',
    features: [
      'Prezentacja usług i informacji o gabinecie.',
      'FAQ oraz treści blogowe.',
      'Odnośniki do rezerwacji w Booksy i formularz kontaktowy.',
    ],
    result:
      'Pacjent ma dostęp do informacji o usługach i może przejść ze strony do zewnętrznego systemu rezerwacji. Booksy obsługuje umawianie wizyt; strona pomaga do niego dotrzeć.',
  },
  {
    slug: 'kontent-architektura',
    name: 'Kontent Architektura',
    category: 'Architektura / portfolio',
    url: 'https://kontentarchitektura.pl/',
    image: '/images/projects/kontent-architektura.webp',
    teaser:
      'Prezentacja pracowni wnętrz i formularz, który zbiera konkretne informacje o planowanym projekcie.',
    problem:
      'Jak pokazać charakter pracowni i zebrać informacje potrzebne do rozpoczęcia rozmowy o projekcie wnętrza?',
    solution:
      'Strona eksponuje projekty, ofertę i sylwetkę architektki. Formularz pyta o typ nieruchomości, metraż i wariant projektu oraz umożliwia dodanie załącznika.',
    features: [
      'Wizualna prezentacja pracowni i jej projektów.',
      'Oferta dla wnętrz prywatnych i komercyjnych.',
      'Formularz zbierający parametry planowanej współpracy.',
    ],
    result:
      'Osoba zainteresowana współpracą może przedstawić zakres projektu już w pierwszym zapytaniu, korzystając z pól dopasowanych do usług architektonicznych.',
  },
].map((project) => ({
  ...project,
  imageSrcset: project.image.endsWith('.webp') ? [240, 320, 480, 640, 960]
    .map((width) => `${project.image.replace('.webp', `-${width}.webp`)} ${width}w`)
    .concat(`${project.image} 1440w`)
    .join(', ') : undefined,
}));
