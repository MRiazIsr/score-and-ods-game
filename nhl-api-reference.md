# NHL API — полный справочник эндпоинтов

Всё публичное, без API-ключа и регистрации. Источник: [Zmalski/NHL-API-Reference](https://github.com/Zmalski/NHL-API-Reference) + WADL от самой НХЛ.

## Общие соглашения

- `{season}` — формат `YYYYYYYY`, пример: `20242025`
- `{game-type}` — `2` регулярка, `3` плей-офф
- `{team}` — трёхбуквенный код команды (`TOR`, `NYR`, `EDM`, `MTL`…)
- `{date}` — `YYYY-MM-DD`
- `{game-id}` — пример: `2023020204` (формат: сезон + тип + номер игры)
- Все ответы — JSON, метод везде GET

---

## API №1 — `https://api-web.nhle.com/`

Основное API — расписание, счёт, gamecenter, составы, плей-офф, драфт.

### Игроки

| Эндпоинт | Описание |
|---|---|
| `/v1/player/{player}/landing` | Карточка игрока |
| `/v1/player/{player}/game-log/{season}/{game-type}` | Game log игрока за сезон |
| `/v1/player/{player}/game-log/now` | Game log на сейчас |
| `/v1/player-spotlight` | Игроки «в прожекторе» |
| `/v1/skater-stats-leaders/current` | Лидеры-полевые сейчас |
| `/v1/skater-stats-leaders/{season}/{game-type}` | Лидеры-полевые за сезон |
| `/v1/goalie-stats-leaders/current` | Лидеры-вратари сейчас |
| `/v1/goalie-stats-leaders/{season}/{game-type}` | Лидеры-вратари за сезон |

Query: `categories=goals|assists|wins|…`, `limit=N` (`-1` = все).

### Команды

| Эндпоинт | Описание |
|---|---|
| `/v1/standings/now` | Текущая турнирная таблица |
| `/v1/standings/{date}` | Таблица на дату |
| `/v1/standings-season` | Инфа по таблицам по всем сезонам |
| `/v1/club-stats/{team}/now` | Статистика клуба сейчас |
| `/v1/club-stats/{team}/{season}/{game-type}` | Статистика клуба за сезон |
| `/v1/club-stats-season/{team}` | Обзор статистики по всем сезонам клуба |
| `/v1/scoreboard/{team}/now` | Scoreboard команды |
| `/v1/roster/{team}/current` | Текущий состав |
| `/v1/roster/{team}/{season}` | Состав за сезон |
| `/v1/roster-season/{team}` | Все сезоны, сыгранные командой |
| `/v1/prospects/{team}` | Проспекты команды |

### Расписание команды

| Эндпоинт | Описание |
|---|---|
| `/v1/club-schedule-season/{team}/now` | Сезонное расписание команды сейчас |
| `/v1/club-schedule-season/{team}/{season}` | Сезонное расписание за сезон |
| `/v1/club-schedule/{team}/month/now` | Расписание на месяц |
| `/v1/club-schedule/{team}/month/{YYYY-MM}` | Расписание на конкретный месяц |
| `/v1/club-schedule/{team}/week/now` | Расписание на неделю |
| `/v1/club-schedule/{team}/week/{date}` | Расписание на неделю с даты |

### Общее расписание лиги

| Эндпоинт | Описание |
|---|---|
| `/v1/schedule/now` | Расписание на текущую неделю |
| `/v1/schedule/{date}` | Расписание на неделю с даты |
| `/v1/schedule-calendar/now` | Календарь расписания |
| `/v1/schedule-calendar/{date}` | Календарь на дату |

### Игры (ключевое для предсказаний)

| Эндпоинт | Описание |
|---|---|
| `/v1/score/now` | Все счета сегодня |
| `/v1/score/{date}` | Счета за дату |
| `/v1/scoreboard/now` | Общий scoreboard |
| `/v1/gamecenter/{game-id}/landing` | Сводка игры (до и после) |
| `/v1/gamecenter/{game-id}/boxscore` | Бокс-скор |
| `/v1/gamecenter/{game-id}/play-by-play` | Поминутная хроника |
| `/v1/gamecenter/{game-id}/right-rail` | Боковая панель game center |
| `/v1/wsc/game-story/{game-id}` | Текстовая сводка матча |
| `/v1/wsc/play-by-play/{game-id}` | WSC play-by-play |
| `/v1/ppt-replay/goal/{game-id}/{event}` | Повтор гола |
| `/v1/ppt-replay/{game-id}/{event}` | Повтор произвольного события |
| `/v1/network/tv-schedule/now` | ТВ-сетка сейчас |
| `/v1/network/tv-schedule/{date}` | ТВ-сетка на дату |
| `/v1/where-to-watch` | Где смотреть |
| `/v1/partner-game/{country-code}/now` | Коэффициенты от партнёров по стране |

### Плей-офф

| Эндпоинт | Описание |
|---|---|
| `/v1/playoff-series/carousel/{season}/` | Обзор всех серий плей-офф |
| `/v1/schedule/playoff-series/{season}/{letter}` | Расписание конкретной серии (a, b, c…) |
| `/v1/playoff-bracket/{year}` | Сетка плей-офф |
| `/v1/meta/playoff-series/{year}/{letter}` | Метаданные серии |

### Сезоны и драфт

| Эндпоинт | Описание |
|---|---|
| `/v1/season` | Список всех сезонов НХЛ |
| `/v1/draft/rankings/now` | Рейтинги проспектов сейчас |
| `/v1/draft/rankings/{season}/{category}` | Рейтинги по категории (1-4) |
| `/v1/draft-tracker/picks/now` | Трекер драфта |
| `/v1/draft/picks/now` | Последние пики |
| `/v1/draft/picks/{season}/{round}` | Пики за сезон и раунд (`all` = все раунды) |

Категории проспектов: `1` North American Skater, `2` International Skater, `3` NA Goalie, `4` International Goalie.

### Мета

| Эндпоинт | Описание |
|---|---|
| `/v1/meta` | Мета (query: `players`, `teams`, `seasonStates`) |
| `/v1/meta/game/{game-id}` | Мета игры |
| `/v1/location` | Определение страны по IP |
| `/v1/postal-lookup/{postalCode}` | Инфа по почтовому индексу |
| `/model/v1/openapi.json` | OpenAPI spec (сейчас 404) |

### NHL Edge (трекинг — скорость бросков, катание, зоны)

Вся группа даёт данные реального времени — скорость броска, скорость катания, время в зонах, high-danger shots. Полезно для продвинутых предсказаний.

**Team Data:**
- `/v1/edge/team-detail/{team-id}/{season}/{game-type}` (+ `/now`)
- `/v1/edge/team-landing/{season}/{game-type}` (+ `/now`)
- `/v1/edge/team-comparison/{team-id}/{season}/{game-type}` (+ `/now`)
- `/v1/edge/team-skating-distance-top-10/{position}/{strength}/{sort}/{season}/{game-type}`
- `/v1/edge/team-skating-distance-detail/{team-id}/{season}/{game-type}`
- `/v1/edge/team-skating-speed-top-10/{position}/{sort}/{season}/{game-type}`
- `/v1/edge/team-skating-speed-detail/{team-id}/{season}/{game-type}`
- `/v1/edge/team-zone-time-top-10/{strength}/{sort}/{season}/{game-type}`
- `/v1/edge/team-zone-time-details/{team-id}/{season}/{game-type}`
- `/v1/edge/team-shot-speed-top-10/{position}/{sort}/{season}/{game-type}`
- `/v1/edge/team-shot-speed-detail/{team-id}/{season}/{game-type}`
- `/v1/edge/team-shot-location-top-10/{position}/{category}/{sort}/{season}/{game-type}`
- `/v1/edge/team-shot-location-detail/{team-id}/{season}/{game-type}`

**Skater Data:**
- `/v1/edge/skater-detail/{player-id}/{season}/{game-type}` (+ `/now`)
- `/v1/edge/skater-landing/{season}/{game-type}` (+ `/now`)
- `/v1/edge/skater-comparison/{player-id}/{season}/{game-type}`
- `/v1/edge/skater-distance-top-10/{position}/{strength}/{sort}/{season}/{game-type}`
- `/v1/edge/skater-skating-distance-detail/{player-id}/{season}/{game-type}`
- `/v1/edge/skater-speed-top-10/{position}/{sort}/{season}/{game-type}`
- `/v1/edge/skater-skating-speed-detail/{player-id}/{season}/{game-type}`
- `/v1/edge/skater-zone-time-top-10/{position}/{strength}/{sort}/{season}/{game-type}`
- `/v1/edge/skater-zone-time/{player-id}/{season}/{game-type}`
- `/v1/edge/skater-shot-speed-top-10/{position}/{sort}/{season}/{game-type}`
- `/v1/edge/skater-shot-speed-detail/{player-id}/{season}/{game-type}`
- `/v1/edge/skater-shot-location-top-10/{position}/{category}/{sort}/{season}/{game-type}`
- `/v1/edge/skater-shot-location-detail/{player-id}/{season}/{game-type}`
- `/v1/cat/edge/skater-detail/{player-id}/{season}/{game-type}`

**Goalie Data:**
- `/v1/edge/goalie-detail/{player-id}/{season}/{game-type}` (+ `/now`)
- `/v1/edge/goalie-landing/{season}/{game-type}` (+ `/now`)
- `/v1/edge/goalie-comparison/{player-id}/{season}/{game-type}`
- `/v1/edge/goalie-5v5-top-10/{sort}/{season}/{game-type}`
- `/v1/edge/goalie-5v5-detail/{player-id}/{season}/{game-type}`
- `/v1/edge/goalie-shot-location-top-10/{category}/{sort}/{season}/{game-type}`
- `/v1/edge/goalie-shot-location-detail/{player-id}/{season}/{game-type}`
- `/v1/edge/goalie-edge-save-pctg-top-10/{sort}/{season}/{game-type}`
- `/v1/edge/goalie-save-percentage-detail/{player-id}/{season}/{game-type}`
- `/v1/cat/edge/goalie-detail/{player-id}/{season}/{game-type}`

Значения параметров:
- `position`: `all` / `F` / `D`
- `strength`: `all` / `pp` / `pk` / `es`
- `sort-by` для distance: `total` / `avg` / `game` / `period`
- `sort-by` для speed: `max` / `22plus` / `20plus`
- `sort-by` для zone: `offensive` / `neutral` / `defensive`

---

## API №2 — `https://api.nhle.com/stats/rest/`

Агрегированная статистика, фильтрация через cayenneExp. Все эндпоинты принимают префикс языка: `/en/`, `/fr/`, …

### Общие query-параметры (для списочных)

- `cayenneExp` — SQL-подобный фильтр: `seasonId=20232024 and gameTypeId=2`
- `sort`, `dir` (`asc` / `desc`)
- `start`, `limit` (`-1` = всё)
- `include`, `exclude`
- `factCayenneExp`, `isAggregate`, `isGame`

### Игроки

| Эндпоинт | Описание |
|---|---|
| `/{lang}/players` | Инфа по игрокам (лимит ответа 5 по дефолту) |
| `/{lang}/skater` | Список полевых |
| `/{lang}/skater/{report}` | Статистика полевых по отчёту (`summary`, `bios`, `faceoffpercentages`, `goalsForAgainst`, `realtime`, `scoringRates`, `scoringpergame`, `shootout`, `shottype`, `timeonice`, `penalties`, `penaltykill`, `powerplay`, `puckPossessions`, `summaryshooting`, `percentages`) |
| `/{lang}/goalie/{report}` | Статистика вратарей (`summary`, `advanced`, `bios`, `daysrest`, `penaltyShots`, `savesByStrength`, `shootout`, `startedVsRelieved`) |
| `/{lang}/leaders/skaters/{attribute}` | Лидеры полевых по атрибуту |
| `/{lang}/leaders/goalies/{attribute}` | Лидеры вратарей |
| `/{lang}/milestones/skaters` | Майлстоуны полевых |
| `/{lang}/milestones/goalies` | Майлстоуны вратарей |
| `/{lang}/draft` | Инфа по драфту |

### Команды

| Эндпоинт | Описание |
|---|---|
| `/{lang}/team` | Список всех команд |
| `/{lang}/team/id/{id}` | Команда по ID |
| `/{lang}/team/{report}` | Статистика команд (`summary`, `faceoffpercentages`, `faceoffwins`, `goalsagainstbystrength`, `goalsbyperiod`, `goalsforbystrength`, `leadingtrailing`, `outshootoutshotby`, `penalties`, `penaltykill`, `powerplay`, `realtime`, `scoretrailfirst`, `shootout`, `shottype`, `percentages`) |
| `/{lang}/franchise` | Список франшиз |

### Сезоны / игры / разное

| Эндпоинт | Описание |
|---|---|
| `/{lang}/season` | Все сезоны |
| `/{lang}/componentSeason` | Компонент-сезон |
| `/{lang}/game` | Инфа по играм |
| `/{lang}/game/meta` | Мета игр |
| `/{lang}/shiftcharts?cayenneExp=gameId={id}` | Смены в игре |
| `/{lang}/config` | Конфигурация API |
| `/{lang}/country` | Список стран |
| `/{lang}/glossary` | Глоссарий терминов |
| `/{lang}/content/module/{key}` | Контент-модуль по ключу |
| `/ping` | Пинг |

---

## Что использовать для предсказания счёта

Минимальный набор:
1. `/v1/schedule/{date}` — расписание → game_id'ы на день
2. `/v1/gamecenter/{game-id}/landing` — перед матчем (составы, вратари, стартовые позиции) и после матча (итоговый счёт)
3. `/v1/standings/now` — форма команд (win streak, GF/GA, Pts%)
4. `/v1/club-stats/{team}/now` — статы сезона для фич

Для более продвинутой модели:
5. `/v1/gamecenter/{game-id}/boxscore` — shots, hits, PP% в прошлых матчах
6. `/v1/edge/team-comparison/{team-id}/now` — трекинг-метрики
7. `/stats/rest/en/team/summary?cayenneExp=seasonId=20242025&gameTypeId=2` — агрегированные сезонные статы для обучения

## Полезно знать

- CORS открыт → можно дёргать с клиента, но для продакшена лучше через свой бэк (кэш + резилентность).
- Рейт-лимиты не опубликованы, но на практике разумно 1-2 req/s. Уважительно к их CDN.
- Архив глубокий — расписание есть аж с 1917-18 (данные по современным метрикам начинаются позже).
- API не документирован официально НХЛ, но ломается редко. Для защиты от breaking changes — поставь snapshot-тесты на ключевые эндпоинты.
