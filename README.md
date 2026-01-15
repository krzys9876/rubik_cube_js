# Rubik's Cube Solver

This is a simple and rather barebone Rubik's Cube solver. 

I always wanted to learn how to solve this colored thingy and never actually did anything about it. 
I downloaded a guide from [this place](https://kostki.popex.pl/instrukcje/jak-ulozyc-kostke-rubika-3x3/) 
but there was something missing. 

I just wanted to _SEE_ the cube solving!

## Solving

I used the simples yet quite long method of LBL (_Layer-By-Layer_). A typical solving process takes
roughly 130 moves, which is quite a lot. I might look at other methods sometime, when I master the LBL myself. 
So far I can only read the guide...

You can set your own colors according to your physical cube (double-click to select and click to change color) 
or use random shuffling. Then just press solve and relax. I particularly like the slowest animation, there is something
to it that makes me smile.

---


<img src="rubik01.png" alt="" width="300"/>

---

<img src="solving02.gif" alt="" width="300"/>

---
## Why vanilla JS?

Well, I could choose any known language (mostly Scala, Java, Python) but I had little experience with JavaScript.
I am not a front-end person, I don't really like the concept of new framework being released every so often
and all these discussions about state management and micro-frontends seem boring to me.

But below the surface there is still plain old JavaScript with all its pros and cons. So I decided to go for it
in the most simple way possible. I didn't want to use _ANY_ external library, which meant that
I had to do all visuals by myself. This was actually much easier than I initially thought, these are just
trogonomethic functions, some matrices, generally primary school math. It would be almost improper to use
somebody else's code ;)

For the same reason I did not want to generate any of the code. Of course, I use LLM assisted coding
but this time it was only for educational purposes. 

---

## MCP integration

To have even more fun I write a simple MCP server (pair programming with my friend Claude Code).
It generates a URL and launches default web browser with the application.

I can ask to generate a scramble sequence, set animation speed and optionally start solving.
I tested it with Claude Code and it works great. Not that this is the most useful thing when you think of 
a Rubik's Cube...

<img src="mcp_02.png" alt="" width="600"/>