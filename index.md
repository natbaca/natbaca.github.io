---
layout: default
title: "Nat Baca"
---

# Hi, I'm Nat Baca

## About Me

{% include about.md %}

## Posts

{% if site.posts.size > 0 %}
{% for post in site.posts %}
  <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
  <p>{{ post.short }}</p>
{% endfor %}
{% endif %}

## Bookshelf

<div class="bookshelf">
{% include books.html %}
</div>

## Activities

{% include strava.html %}

## Latest Wiki Edits

{% include edits.html %}
