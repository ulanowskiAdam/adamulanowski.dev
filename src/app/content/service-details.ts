export const serviceDetails: Record<string, {
  title?: string; description?: string; lead?: string; examples?: string[];
  sections: { title: string; paragraphs: string[]; items?: string[]; links?: { path: string; label: string }[] }[];
}> = {
  "strony-internetowe-dla-firm": {
    "sections": [
      {
        "title": "Strona internetowa dla lokalnej firmy ze Szczecina",
        "paragraphs": [
          "Oferta jest skierowana także do firm ze Szczecina i okolic: gabinetów, specjalistów, pracowni i sklepów. W treści ustalamy, jakie usługi oferujesz, na jakim obszarze działasz i jak klient ma przejść od poznania oferty do kontaktu.",
          "Przykładem strony gabinetu jest Fizjomind w Szczecinie. Realizacja łączy informacje o fizjoterapii i specjalistce z odpowiedziami na pytania oraz przejściem do rezerwacji w Booksy. Zakres strony dopasowujemy do rzeczywistego sposobu obsługi pacjentów."
        ],
        "links": [
          {
            "path": "/realizacje/fizjomind",
            "label": "Zobacz realizację Fizjomind w Szczecinie →"
          }
        ]
      },
      {
        "title": "Ile kosztuje strona firmowa lub sklep internetowy?",
        "paragraphs": [
          "Cena wykonania strony firmowej zaczyna się od 1500 zł netto + VAT, a sklepu internetowego od 4500 zł netto + VAT. Są to ceny startowe; ostateczny koszt ustalam po określeniu zakresu.",
          "Na wycenę wpływają liczba podstron, przygotowanie materiałów, funkcje sklepu oraz potrzebne połączenia z innymi systemami. Integracje n8n i niestandardowe funkcje wyceniam osobno. Koszty domeny, hostingu, licencji i utrzymania określamy oddzielnie przed rozpoczęciem prac."
        ],
        "items": [
          "Strona firmowa: od 1500 zł netto + VAT.",
          "Sklep internetowy: od 4500 zł netto + VAT."
        ]
      },
      {
        "title": "Tworzenie strony firmowej: od oferty do kontaktu",
        "paragraphs": [
          "Strona firmowa powinna pomóc odbiorcy ustalić, czy trafił do właściwej osoby. Dlatego zaczynam od usług, odbiorców i pytań, które pojawiają się przed pierwszym kontaktem. Na tej podstawie ustalam podział na podstrony, kolejność informacji oraz miejsca na formularz lub dane kontaktowe.",
          "Zakres może obejmować stronę główną, osobne opisy usług, realizacje, sekcję o firmie i kontakt. Landing page ma węższy cel: przedstawia jedną ofertę i prowadzi do konkretnego działania. Liczbę podstron dobieramy do treści, które rzeczywiście pomagają klientowi podjąć decyzję."
        ]
      },
      {
        "title": "Strony dla gabinetów, specjalistów i pracowni",
        "paragraphs": [
          "W gabinecie ważne są informacje o usługach, specjaliście i przygotowaniu do wizyty. W portfolio pracowni większe znaczenie mają realizacje oraz możliwość opisania planowanego projektu. Układ i formularze dopasowuję do tych różnic."
        ],
        "items": [
          "Fizjomind: prezentacja oferty gabinetu i przejście do zewnętrznej rezerwacji w Booksy.",
          "Kontent Architektura: pokazanie projektów oraz formularz zbierający informacje o nieruchomości i zakresie współpracy.",
          "Lifting Paulina Karol: przedstawienie specjalistki, zabiegów, cennika i drogi do kontaktu."
        ]
      },
      {
        "title": "Sklep internetowy i funkcje dopasowane do oferty",
        "paragraphs": [
          "Przy sprzedaży online poza wyglądem strony trzeba zaplanować katalog, parametry produktów, warianty i zakup. W LOADLIFT rozwój sklepu na WooCommerce obejmuje produkty techniczne, filtrowanie, wybór wariantu, koszyk oraz dane nabywcy i dostawy.",
          "Sklep może też wymagać przekazywania zamówień do innych narzędzi. Taki zakres ustalamy oddzielnie od budowy części zakupowej. Przykład połączenia sklepu z n8n i narzędziami obsługi pokazuję w realizacji LOADLIFT."
        ],
        "links": [
          {
            "path": "/realizacje/loadlift",
            "label": "Zobacz sklep LOADLIFT i zakres prac →"
          },
          {
            "path": "/automatyzacja-procesow",
            "label": "Przeczytaj o automatyzacji obsługi zamówień →"
          }
        ]
      },
      {
        "title": "Edycja treści, publikacja i przygotowanie do Google",
        "paragraphs": [
          "Przed wyborem technologii ustalamy, kto będzie zmieniał ofertę, zdjęcia i realizacje. Jeśli potrzebujesz samodzielnej edycji, uwzględniam to w rozwiązaniu i sposobie przekazania strony. Sam formularz kontaktowy, blog czy dodatkowa wersja językowa również powinny znaleźć się w ustalonym zakresie.",
          "Przy wdrożeniu sprawdzam układ na telefonie, formularze, odnośniki, tytuły i opisy podstron, strukturę nagłówków oraz ustawienia indeksowania. To przygotowanie techniczne do obecności w wyszukiwarce. Dalsza widoczność wymaga również rozwijania treści i mierzenia wyników."
        ]
      },
      {
        "title": "Od czego zależą cena i termin wykonania strony?",
        "paragraphs": [
          "Na wycenę wpływają liczba i różnorodność podstron, przygotowanie tekstów i zdjęć, sposób edycji treści oraz dodatkowe funkcje. Sklep z wariantami produktów i integracjami wymaga innego zakresu niż strona prezentująca jedną usługę.",
          "Do wstępnej rozmowy wystarczy opis działalności, lista potrzebnych funkcji, przykłady stron, które Ci odpowiadają, oraz informacja o dostępnych materiałach. Na tej podstawie ustalam zakres, kolejność prac i harmonogram. Osobno określamy koszty domeny, hostingu, licencji i późniejszego utrzymania."
        ]
      }
    ],
    "title": "Tworzenie stron internetowych dla firm w Szczecinie",
    "description": "Strony internetowe dla firm ze Szczecina i okolic od 1500 zł netto + VAT. Sklepy od 4500 zł netto + VAT. Zobacz zakres prac i realizacje.",
    "lead": "Tworzę strony dla firm ze Szczecina i okolic: od przedstawienia oferty po kontakt lub zamówienie."
  },
  "aplikacje-webowe": {
    "sections": [
      {
        "title": "Kiedy warto zbudować dedykowaną aplikację webową?",
        "paragraphs": [
          "Własne narzędzie ma sens wtedy, gdy reguły pracy firmy trudno odwzorować w gotowym systemie. Może to być obieg zlecenia, panel dla klientów, zbieranie wymagań lub konfigurator, który oblicza wynik według konkretnych zasad.",
          "Najpierw sprawdzamy, czy wystarczy skonfigurować albo połączyć narzędzia, z których już korzystasz. Jeżeli potrzebny jest własny interfejs i logika, określamy najważniejszy proces oraz dane, które aplikacja ma przechowywać."
        ]
      },
      {
        "title": "Pierwsza wersja aplikacji: jeden proces, jasno określony zakres",
        "paragraphs": [
          "Pierwsza wersja powinna pozwalać wykonać konkretne zadanie od początku do końca. Dla panelu zleceń może to oznaczać utworzenie sprawy, przypisanie jej do klienta, zmianę statusu i podgląd historii. Pozostałe moduły planujemy dopiero po sprawdzeniu tego przebiegu."
        ],
        "items": [
          "Użytkownicy i uprawnienia: kto widzi dane, kto je zmienia i jakie operacje wymagają potwierdzenia.",
          "Dane i reguły: obowiązkowe pola, walidacja, statusy oraz sposób poprawiania błędów.",
          "Integracje: źródła danych, dostępne API i zachowanie przy przerwie w połączeniu.",
          "Odbiór: przykładowe zadania i sytuacje wyjątkowe, na których sprawdzamy działanie."
        ]
      },
      {
        "title": "Integracje z istniejącymi systemami",
        "paragraphs": [
          "Połączenie z innym systemem wymaga sprawdzenia jego dokumentacji, dostępów, limitów i kosztów. Ustalamy również, który system jest źródłem danych i co zrobić, jeśli aktualizacja nie dotrze albo pojawi się drugi raz.",
          "W LOADLIFT własne rozszerzenia WooCommerce i przepływy n8n łączą zamówienia ze wspólną bazą oraz ClickUp. To przykład zaplecza integracyjnego sklepu. Pokazuje obsługę danych między systemami; nie przedstawiam go jako osobnej autorskiej aplikacji dla klientów."
        ],
        "links": [
          {
            "path": "/realizacje/loadlift-automatyzacje",
            "label": "Zobacz integracje zamówień w LOADLIFT →"
          }
        ]
      },
      {
        "title": "Co ustalamy przed wyceną aplikacji?",
        "paragraphs": [
          "Najbardziej przydatny jest opis obecnej pracy: kto wykonuje zadanie, skąd bierze dane, jakie podejmuje decyzje i gdzie pojawiają się błędy. Przykładowy arkusz lub zanonimizowane zlecenie często mówi więcej niż długa lista ekranów.",
          "Koszt i harmonogram zależą od liczby procesów, ról użytkowników, migracji danych, integracji oraz wymagań dotyczących dostępu i utrzymania. Budowę dzielimy na etapy, żeby można było sprawdzić kolejną część przed rozbudową."
        ]
      }
    ],
    "title": "Aplikacje webowe dla firm ze Szczecina",
    "description": "Dedykowane aplikacje webowe dla firm ze Szczecina i okolic. Zakres pierwszej wersji, integracje, uprawnienia i przygotowanie do wyceny."
  },
  "automatyzacja-procesow": {
    "title": "Automatyzacja procesów i n8n dla firm ze Szczecina",
    "description": "Automatyzacja procesów dla firm ze Szczecina i okolic. Integracje n8n na przykładzie LOADLIFT: WooCommerce, ClickUp, faktury i przesyłki.",
    "lead": "Połącz sklep z narzędziami obsługi zamówień i ogranicz ręczne przenoszenie danych.",
    "examples": [
      "Synchronizacja zamówień WooCommerce i ich pozycji do ClickUp.",
      "Przygotowanie wiadomości z produktami, ilościami i danymi dostawy.",
      "Przekazywanie informacji o fakturze i monitorowanie statusów przesyłek."
    ],
    "sections": [
      {
        "title": "Automatyzacja obsługi sklepu na przykładzie LOADLIFT",
        "paragraphs": [
          "W sklepie LOADLIFT wdrożenie n8n łączy zamówienia z WooCommerce, wspólną bazę danych, ClickUp, obsługę poczty i informacje o dokumentach oraz przesyłkach. W portfolio pokazuję schematy tych przepływów.",
          "To punkt wyjścia do rozmowy o podobnym procesie w Twojej firmie. Przed potwierdzeniem zakresu sprawdzam systemy, z których korzystasz, ich możliwości integracji oraz reguły obsługi zamówień."
        ]
      },
      {
        "title": "WooCommerce i ClickUp: zamówienie oraz jego pozycje",
        "paragraphs": [
          "W LOADLIFT zamówienie i jego produkty trafiają do wspólnej bazy, a przepływ n8n synchronizuje je z ClickUp. Zamówienie jest zadaniem głównym, a jego pozycje mają powiązane podzadania. Operator może odczytać dane potrzebne do realizacji bez ręcznego przepisywania każdej pozycji.",
          "Synchronizacja uwzględnia kolejne zmiany oraz powtórzone zdarzenia. Zapamiętane powiązania pozwalają aktualizować istniejące zadania. Błąd połączenia jest obsługiwany oddzielnie od zapisu zamówienia w sklepie."
        ]
      },
      {
        "title": "Wiadomości, faktury i informacje o przesyłkach",
        "paragraphs": [
          "Kolejne przepływy przygotowują wiadomość z produktami, ilościami i adresem dostawy po sprawdzeniu płatności. Integracja z inFakt przekazuje informacje o dokumencie do zamówienia. Osobny proces odczytuje statusy przesyłek i wykrywa sytuacje wymagające kontroli.",
          "Dopasowanie przesyłki na podstawie wiadomości może wymagać zatwierdzenia przez operatora. W dokumentowanych testach część komunikacji dotyczącej faktur i przesyłek trafiała na wewnętrzną skrzynkę. Schematy przepływów oraz zakres wdrożenia przedstawiam w opisie realizacji."
        ],
        "links": [
          {
            "path": "/realizacje/loadlift-automatyzacje",
            "label": "Zobacz przepływy n8n i opis realizacji LOADLIFT →"
          }
        ]
      },
      {
        "title": "Co się dzieje po błędzie albo ponownym zdarzeniu?",
        "paragraphs": [
          "Automatyzacja musi uwzględniać więcej niż udany przebieg. To samo zdarzenie może dotrzeć ponownie, system zewnętrzny może nie odpowiedzieć, a wynik wysyłki może być niejednoznaczny. Wtedy potrzebne są zapis stanu, historia i ustalony sposób dalszej obsługi.",
          "W LOADLIFT stosowane są powiązania zamówień i dokumentów, kolejki oraz blokady powtórnej wysyłki. Niepewny wynik nie powinien automatycznie uruchamiać kolejnej wiadomości lub drugiego dokumentu. Przypadki wymagające decyzji pozostają do sprawdzenia."
        ]
      },
      {
        "title": "Jak przygotować się do wyceny integracji n8n?",
        "paragraphs": [
          "Opisz jedno zadanie, które obecnie wykonujesz ręcznie. Podaj używane systemy, moment rozpoczęcia procesu, dane wejściowe oraz oczekiwany wynik. Potrzebne są także przykłady wyjątków: zwrot, anulowane zamówienie, brak informacji lub zmiana danych.",
          "Na koszt wpływają dostępność API, liczba połączeń, reguły dopasowania danych i sposób obsługi błędów. Osobno ustalamy hosting n8n, koszty usług zewnętrznych, monitorowanie i późniejsze utrzymanie. Harmonogram wynika z uzgodnionego zakresu oraz dostępności środowisk do testów."
        ]
      }
    ]
  },
  "integracje-ai": {
    "sections": [
      {
        "title": "Od konkretnego zadania do pilotażu AI",
        "paragraphs": [
          "Integrację AI zaczynamy od wybrania jednego zadania i przykładów oczekiwanego wyniku. Może to być przygotowanie szkicu odpowiedzi, uporządkowanie zapytania lub podsumowanie dokumentu. Ustalamy też sytuacje, w których wynik ma trafić do człowieka.",
          "Opisane zastosowania są zakresem możliwej współpracy, a nie listą ukończonych realizacji AI. Pierwszy etap służy sprawdzeniu, czy rozwiązanie osiąga potrzebną jakość na Twoich danych i mieści się w przyjętym budżecie."
        ]
      },
      {
        "title": "Jakie materiały są potrzebne do sprawdzenia pomysłu?",
        "paragraphs": [
          "Przydatne są zatwierdzone dokumenty, przykładowe pytania i wzorcowe odpowiedzi. Określamy, które źródła są aktualne, kto może z nich korzystać oraz jakie informacje mogą być przekazywane do wybranego dostawcy modelu.",
          "Zbiór testowy powinien zawierać także pytania, na które nie ma odpowiedzi, niejednoznaczne dane i próby wyjścia poza zakres. Sam poprawny wynik na kilku łatwych przykładach nie wystarcza do decyzji o szerszym wdrożeniu."
        ]
      },
      {
        "title": "Kontrola jakości, kosztów i udział człowieka",
        "paragraphs": [
          "Przed pilotażem ustalamy kryteria oceny: zgodność odpowiedzi ze źródłami, użyteczność wyniku, czas oczekiwania i koszt wykonania zadania. W razie potrzeby odpowiedź powinna wskazywać dokument źródłowy albo sygnalizować brak informacji.",
          "Model może przygotować propozycję, a operator ją zatwierdzać. To, czy wynik może uruchomić kolejną operację, wymaga osobnego ustalenia. Dostęp do narzędzi i danych powinien odpowiadać zakresowi zadania."
        ]
      },
      {
        "title": "Co wpływa na wycenę integracji AI?",
        "paragraphs": [
          "Znaczenie mają jakość i liczba źródeł, wymagane uprawnienia, sposób połączenia z istniejącym systemem oraz zakres testów. Koszt budowy trzeba oddzielić od późniejszych opłat za model, przechowywanie danych i utrzymanie.",
          "Do pierwszej rozmowy wystarczy opis zadania i kilka zanonimizowanych przykładów. Na tej podstawie można określić zakres pilotażu, potrzebne materiały i warunki decyzji o dalszej pracy."
        ]
      }
    ],
    "title": "Integracje AI dla firm ze Szczecina",
    "description": "Integracje AI dla firm ze Szczecina i okolic. Pilotaż jednego zadania, ocena jakości na własnych danych oraz ustalenie kosztów i zakresu."
  }
};
