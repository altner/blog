---
title: "OctoBeat – ein sozialer Nachrichtenaggregator für unabhängige deutschsprachige Blogs"
description: "Wie ich mit Python, Mastodon, Bluesky und einem Embedding-Klassifikator einen News-Aggregator gebaut habe, der Artikel nach echten Social Signals aus dem Fediverse rankt."
date: 2026-05-31
---

Was wäre, wenn ein Nachrichtenaggregator nicht von Redakteuren kuratiert wird, sondern von echten
Menschen – die auf Mastodon und Bluesky teilen, was sie wirklich lesenswert finden?

Genau das ist **OctoBeat**. Ein Projekt, das ich in wenigen Tagen gebaut habe und das jetzt
täglich läuft, um ein Gefühl dafür zu bekommen, was im deutschsprachigen unabhängigen Web
gerade Thema ist.

Der Deploy erfolgt nicht automatisch auf einem festen Zeitplan – sondern immer dann, wenn ich
lokal den Crawler laufen lasse, die Ergebnisse committe und pushe. GitHub Actions baut daraus
in etwa zwei Minuten die statische Seite.

## Die Idee

Statt Links einfach zu zählen, gewichte ich die Quellen. Ein geteilter
Link von einem Account mit vielen Followern und einem gesunden Verhältnis von Followern zu
gefolgten Accounts zählt mehr als einer von einem frisch angelegten Profil.

Außerdem fließt die **Aktualität** stark ins Ranking ein – ein Artikel der vor 40 Stunden geteilt
wurde verliert erheblich an Gewicht gegenüber einem von heute Morgen.

Wichtig: OctoBeat konzentriert sich bewusst auf **unabhängige Blogs und Non-Profit-Medien** –
keine Verlage, keine Kommerzportale. Die Quellenliste ist offen und über GitHub Issues erweiterbar.

## Wie es funktioniert

Ein Python-Crawler läuft lokal durch:

1. **RSS-Feeds** von 13 unabhängigen Blogs und Non-Profit-Quellen liefern die Domains
2. Das **Fediverse** (Mastodon, 8 Instanzen) liefert **Trending Links** direkt über
   die Instanz-API – Artikel die gerade instanzweit geteilt werden
3. **Mastodon** und **Bluesky** werden nach Posts durchsucht, die Links zu diesen Domains
   enthalten – jeder dieser Posts wird als **Syndication URL** gespeichert: der direkte Link
   zum sozialen Post der den Artikel geteilt hat
4. Jedes Signal wird gewichtet: Follower-Zahl, Follower/Following-Ratio, Plattform-Bonus
5. Artikel werden gescort: `Gewicht × log₂(unique Curatoren + 1) × 1/(Alter+2)^1.4 × 1000`
6. Nur Artikel mit mindestens einem Mastodon- oder Bluesky-Signal kommen in den Feed

Das Ergebnis landet als `feed.json` im Git-Repository, das den Deploy auslöst.
GitHub Actions baut daraus in etwa zwei Minuten die statische Seite – kein Server, kein Backend.

## Der spannende Teil: Embedding-Klassifikator

Die Kategorisierung war die größte Herausforderung. Keyword-Listen reichen nicht – wer weiß
schon, dass „Preiserhöhungen" das Wort „Reise" enthält und damit fälschlicherweise unter
#Reisen landet? (Ja, das ist passiert.)

Ich habe daher ein dreistufiges System gebaut:

- **RSS-Tags direkt gemappt** (+3 Gewicht): Der Blog taggt seinen Post mit `#hardware`, das
  landet direkt in der richtigen Kategorie
- **Semantische Embeddings** (+2–4): Der Titel wird mit dem Modell
  `paraphrase-multilingual-MiniLM-L12-v2` vektorisiert und mit Kategorie-Ankertexten verglichen.
  „Turtle Beach Controller für Xbox" wird als Gaming erkannt – ohne explizites Keyword
- **Keyword-Regeln** (+1): Als Fallback und Tiebreaker

Alle Embeddings werden in SQLite gecacht, sodass beim zweiten Lauf nur neue Artikel berechnet
werden müssen.

## Was ich gelernt habe

Das Schwierigste war nicht der Algorithmus, sondern die **Datenqualität**. URLs wie
`winfuture.de/news,159002.htmlvia` (das `via` klebt an der URL), WordPress-Seiten die
`<title>status</title>` zurückgeben, Mastodon-Instanzen bei denen die Such-API deaktiviert ist,
AMP-Duplikate durch Jetpack-Links – das echte Internet ist unordentlich.

Die SQLite-Datenbank akkumuliert über Zeit: Curator-Gewichtungen, Feed-Bewertungen,
Embedding-Cache, Tag-Korrekturen, WordPress-Engagement-Daten. Wenn die Datenbank verloren geht,
exportiert das System nach jedem Run eine `computed.json` – lesbar, versioniert in Git,
und automatisch als Wiederherstellungsquelle genutzt.

## Was die Seite zeigt

Neben dem eigentlichen Feed gibt es drei weitere Seiten:

- **Inspector** – alle Artikel mit Plattform-Labels, Curatoren und Syndication-Links
- **Metrics** – Statistiken über die Kategorisierung: welche Keywords feuern, welche RSS-Tags
  noch nicht gemappt sind, Top-Curatoren nach Plattform
- **Settings** – die aktive Quellenliste (lokal bearbeitbar, im Deploy read-only)

## Was noch kommt

Nach 1–2 Wochen Laufzeit hat die SQLite-Datenbank genug History für **Stufe 3**:
das System lernt automatisch, welche Curatoren welche Themen zuverlässig teilen –
und passt die Gewichte ohne manuellen Eingriff an.

Der Code ist open source unter MIT-Lizenz:
[github.com/altner/octobeat](https://github.com/altner/octobeat)

Die aktuelle Version läuft unter:
[altner.github.io/octobeat](https://altner.github.io/octobeat/)
