---
title: "OctoBeat – ein sozialer Nachrichtenaggregator für die deutschsprachige Blogosphäre"
description: "Wie ich mit Python, Mastodon, Bluesky und einem Embedding-Klassifikator einen News-Aggregator gebaut habe, der Artikel nach echten Social Signals rankt."
date: 2026-05-31
---

Was wäre, wenn ein Nachrichtenaggregator nicht von Redakteuren kuratiert wird, sondern von echten
Menschen – die auf Mastodon und Bluesky teilen, was sie wirklich lesenswert finden?

Genau das ist **OctoBeat**. Ein Projekt, das ich in den letzten 4–5 Tagen gebaut habe.

Der Deploy erfolgt nicht automatisch auf einem festen Zeitplan – sondern immer dann, wenn ich
lokal den Crawler laufen lasse, die Ergebnisse committe und pushe. GitHub Actions baut daraus
in etwa zwei Minuten die statische Seite.

## Die Idee

Statt Links einfach zu zählen, gewichte ich die Quellen. Ein geteilter
Link von einem Account mit vielen Followern und einem gesunden Verhältnis von Followern zu
gefolgten Accounts zählt mehr als einer von einem frisch angelegten Profil.

Außerdem fließt die **Aktualität** stark ins Ranking ein – ein Artikel der vor 40 Stunden geteilt
wurde verliert erheblich an Gewicht gegenüber einem von heute Morgen.

## Wie es funktioniert

Ein Python-Crawler läuft lokal durch:

1. **RSS-Feeds** von 24 deutschsprachigen Quellen liefern die Domains
2. Das **Fediverse** (Mastodon, 9 Instanzen) und **Bluesky** werden nach Posts durchsucht, die Links zu diesen Domains enthalten – jeder dieser Posts wird als **Syndication URL** gespeichert: der direkte Link zum sozialen Post der den Artikel geteilt hat
3. Jedes Signal wird gewichtet: Follower-Zahl, Follower/Following-Ratio, Plattform-Bonus
4. Artikel werden gescort: `Gewicht × log₂(unique Curatoren + 1) × 1/(Alter+2)^1.4 × 1000`
5. Nur Artikel mit mindestens einem Mastodon- oder Bluesky-Signal kommen in den Feed

Das Ergebnis landet als `feed.json` im Git-Repository, das den Deploy auslöst.

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
`winfuture.de/news,159002.htmlvia` (das `via` klebt an der URL), Seiten die `<title>status</title>`
zurückgeben, Mastodon-Instanzen bei denen die Such-API deaktiviert ist – das echte Internet ist
unordentlich.

Die SQLite-Datenbank akkumuliert über Zeit: Curator-Gewichtungen, Feed-Bewertungen,
Embedding-Cache, Tag-Korrekturen. Wenn die Datenbank verloren geht, exportiert das System
nach jedem Run eine `computed.json` – lesbar, versioniert in Git, und automatisch als
Wiederherstellungsquelle genutzt.

## Was noch kommt

- **Stufe 3**: Die gesammelten Daten sollen dem System helfen zu lernen, welche Curatoren
  welche Themen zuverlässig teilen – und die Gewichte automatisch anpassen
- Mehr deutschsprachige Quellen
- Vielleicht ein wöchentliches Digest per RSS

Der Code ist open source unter MIT-Lizenz:
[github.com/altner/octobeat](https://github.com/altner/octobeat)

Die aktuelle Version läuft unter:
[altner.github.io/octobeat](https://altner.github.io/octobeat/)
