---
layout: default
title: "Nat Baca"
---

{% if site.posts.size > 0 %}
  <h1>Posts</h1>
  {% for post in site.posts %}
    <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
    <p>{{ post.short }}</p>
  {% endfor %}
{% endif %}
