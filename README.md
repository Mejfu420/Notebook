# Notebook app | RedNotes

## Autor
Imię i Nazwisko: Mateusz Nitkowski
Nr indeksu: 297909  
Grupa: 2

## Aplikacja online
System dostępny jest pod adresem: [https://mejfu.dev](https://mejfu.dev)

## Opis projektu
Aplikacja typu "Notebook" z wbudowanym modułem ogłoszeń. System posiada podział na frontend (Next.js) oraz backend (Node.js/Prisma), które zostały zintegrowane w ramach jednej domeny. Backend serwuje interfejs API pod ścieżką `/api`, co zapewnia ujednoliconą architekturę i eliminuje problemy związane z polityką CORS.

## Architektura systemu
System działa w architekturze klient-serwer:
* **Frontend:** Aplikacja Next.js odpowiedzialna za interfejs użytkownika.
* **Backend:** Serwer API obsługujący zapytania typu CRUD oraz autoryzację.
* **Warstwa danych:** Baza danych PostgreSQL zarządzana przez Prisma ORM.

## Funkcjonalności
* **Zarządzanie notatkami:** Pełny cykl CRUD dla użytkownika.
* **Moduł ogłoszeń:**
    * **Użytkownik:** Wyświetlanie listy ogłoszeń.
    * **Administrator:** Pełne zarządzanie (dodawanie, edycja, usuwanie) ogłoszeniami z poziomu panelu.
* **Bezpieczeństwo:** Weryfikacja ról użytkownika na poziomie API (RBAC).

## Instrukcja uruchomienia (lokalnie)

### Wymagania wstępne
* Node.js (wersja 18+)
* Baza danych PostgreSQL
* npm lub yarn

### Konfiguracja
1. Skopiuj plik `.env.example` do `.env`.
2. Skonfiguruj zmienne środowiskowe, w tym `DATABASE_URL` oraz `CLERK_WEBHOOK_SECRET`.

## Uruchomienie lokalne
Projekt w swojej architekturze wykorzystuje zewnętrzne usługi (Clerk – autoryzacja, PostgreSQL – baza danych), co wymaga konfiguracji zmiennych środowiskowych. 

Ze względu na konieczność posiadania własnych kluczy API oraz instancji bazy danych, dla celów szybkiego zapoznania się z działaniem systemu, rekomenduję korzystanie z wersji online: [https://mejfu.dev](https://mejfu.dev).

Do uruchomienia lokalnego wymagane jest:
1. Posiadanie instancji PostgreSQL.
2. Posiadanie konta w serwisie Clerk i skonfigurowanie Webhook Secret.
3. Utworzenie pliku `.env` na podstawie `.env.example` z odpowiednimi kluczami.
4. Wykonanie migracji bazodanowych (`npx prisma migrate dev`).