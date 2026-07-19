---
title: Why I Built Noodle
description: Why I built a terminal REST client around YAML files, local collections, and a keyboard-first workflow.
date: 2026-07-19
author:
  name: Carlos Montecinos
  title: Developer
  url: https://github.com/wilfredinni
  picture: https://github.com/wilfredinni.png
tags:
  - introduction
  - philosophy
---

I built Noodle because I wanted a more comfortable way to work with APIs from the terminal.

The breaking point was simple. I was opening a heavyweight client to send a quick `GET` request, then returning to the terminal to keep working. I did not want to create an account just to inspect an API, and I did not want my requests to disappear into an app workspace either. Bruno was close to what I wanted because the requests were files, but I still wanted a keyboard-first tool that felt at home in the terminal.

There are already many good API clients. Some are polished desktop apps, some live in the browser, and some are excellent command-line tools. But I kept running into the same tradeoff: graphical clients could feel heavy for a quick request, while a growing pile of `curl` commands became hard to read, reuse, and share.

Noodle sits in the space between those two approaches. It is a terminal REST client where each request is a `.yml` file on disk. You get an interface for browsing, editing, sending, and inspecting requests, while the requests themselves remain plain files you control.

## Files are the point

I wanted API requests to behave like the rest of a project. They should live next to the code, be easy to review in a diff, and work naturally with Git. A collection is just a directory, and a request is just a file. You do not need an account or a hosted workspace to get started.

That also makes sharing simple. Put a collection in a repository, pass it to a teammate, or keep it as part of a project. Environments stay local when they need to, and the request definitions stay readable.

## The terminal, without the friction

I also wanted to stay in the terminal without giving up the things that make an API client useful. Noodle has a sidebar for collections, inline request editing, environment variables, authentication, forms, a response pane, and a keyboard-first workflow.

The goal is not to replace every tool for every workflow. It is to make the common loop feel good: open a collection, adjust a request, send it, inspect the response, and save the useful version back to disk.

## Built for the way I work

Noodle started as something I wanted for myself, but the underlying idea is useful beyond my own workflow. If you prefer local files, spend most of your time in a terminal, or want API requests that fit naturally into a repository, Noodle may be a good fit.

The project is still growing, and I am sharing what I build along the way. If you give it a try, I would love to hear what feels right, what is missing, and what would make it more useful for your own API work.
