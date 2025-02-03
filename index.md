---
layout: default
title: "Nat Baca"
---

# Hi! 

## About Me

{% include_relative about.md %}


{% if site.posts.size > 0 %}
<h2>Blog</h2>
{% for post in site.posts %}
  <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
  <p>{{ post.short }}</p>
{% endfor %}
{% endif %}
