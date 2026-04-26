# __Project IoNoW__
#### Student Name: Luka Milenkovic
#### Home Uni: el25b216@technikum-wien.at
#### Guest Uni: 20120147@setu.ie

Assignment from the IoT Standards & Protocols course of 2026 at [SETU Ireland](https://setu.ie) part of the Study@Home program at [UAS Technikum Wien](https://technikum-wien.at/en).

# __Introduction__
This project focuses on the low-latency & realtime aspects of modernday IoT infrastructure. For this a custom library [KisDB](https://github.com/KhanKudo/kisdb) was actively developed in parallel and it's commits from v0.0.1 to v0.1.3 are to be treated as a part of this submission. Not only is KisDB such a core element of Project IoNoW, but about 60% of the total  time was spent on it.
  <!--TODO: expand introduction to actually _introduce_ what the project does/accomplishes-->
  
# __Demonstration__
<!--TODO: add link/preview of demonstrational video presentation for the final submission through YouTube-->

# __Project time allocation__
This information was obtained from __wakatime__, an automated in-IDE time-tracking extension that considers _active-coding_ instead of just 'ide-open-closed' and splits that per-project & language. I've been using it for many years and love the weekly summary emails from which I took the time-data.

<!-- insert time-graph from time.csv in deifa - use a stacked bar-chart -->

# __Project Overview__
![Project Graphic](graphic/IoT-Assignment-Graphic.drawio.png)
  <!--TODO: update graphic -->
  
<!--TODO: maybe a table-of-contents here if things get too long-->

## __Challenge__
  <!--TODO: also maybe no longer need this section? Though perhaps could mention that all pretty much all conventional IoT platforms and SaaS-Solutions focus on historic data,having seconds huge display latency of numerous seconds, if not a whole minute. Others that aren't THAT slow, simply try to be ok-fast, as to not degrade user-experience but not trying to support any kind of realtime, interactive applications-->

# __Technologies & Tools__

- [HTTP](https://en.wikipedia.org/wiki/HTTP)
  Just plain HTTP/1.1 for serving the static WebUI source files. Also through KisDB (see below), provides an HTTP-API for interacting with the server & database. I doesn't use any encryption as it doesn't need it for localhost-deployments and such as in remote-session tests, when actually deployed, it would sit behind a selfhosted reverse proxy such as [HAProxy](https://www.haproxy.com/) in my case. It is much more secure to let dedicated software handle security-critical, open endpoints.

- [WebSockets](https://en.wikipedia.org/wiki/WebSocket)
  Websockets were used through KisDB (see below) to also serve as a method of connecting the clients to the server & database. Unlike Plain HTTP requests, a websocket connection keeps a persistently open bi-directional tcp-socket, so without any further http, both the server and client can in realtime talk to eachother with less overhead, usually being more performant and stable for streaming events both ways.

- [MQTT](https://en.wikipedia.org/wiki/MQTT)
  MQTT is perhaps the most standard protocol used in almost any IoT application. It was too _standard_ not to use it, even if it wasn't actually needed for the project at all. Though crucially, it ended up being an incredibly good reference for comparison to http/ws, as it works so differently then those do, which makes for an excellent showcase in the project's demonstration.

- [KisDB](https://github.com/KhanKudo/kisdb)
  <!--TODO-->

- [Bun](https://bun.sh)
  Bun was used as a newer alternative to NodeJS. It has many integrated tools and a significant performance boost compared to plain nodejs. It also natively supports TypeScript and can itself compile a TS module, including all it's imports, into a bundled JavaScript file for the Browser. For this project it was used to build the browser bundle and it's http-router as well as native WebSocket implementation were used through KisDB.

# __Hardware__

- [Raspberry Pi 3B](https://www.raspberrypi.com/products/raspberry-pi-3-model-b/)\
  As provided by the university along with the SenseHAT (see below), the Pi will be used as the main intended user-interface device for the project, alongside the WebUI. It will primarily run the python script for the SenseHAT behaving as a client-device using WebSockets to connect to the main server instance. This main server instance needs to simply run the project with Bun. This can be a local Laptop, or it can also be the Pi itself too.

- [SenseHAT](https://www.raspberrypi.com/documentation/accessories/sense-hat.html)\
  The SenseHAT for the Raspberry Pi is at the core of this project. Everything was designed around it's 8x8 rgb matrix display and 5-button joystick. Additionally it's IMU (gyro & accel) data also ended up being used.

- __Any Laptop__\
  Any laptop or phone can also be used as a client-device through the WebUI. Thanks to the special server-driven-architecture, the WebUI can use arrow-keys, WASD and the Space/Enter keys as equivalent to the SenseHAT joystick. The WebUI also has an on-screen 5-button touch joystick for mobile devices. This Laptop is also where the bun-server can be run, serving the WebUI locally and allowing the Pi to connect.

<!--TODO: somewhere fitting mention flipping the rpi upside-down to switch to next-game, also mention gyro/accel middle-click exception -->

# __Display Modes / Games__
- __Demo Screen__\
  <!--TODO-->
  <!--highlight the user-input driven updates (demo) vs gameloop driven (snake*) vs combined (pong)-->
- __Gyroscope__\
  <!--TODO-->
  <!--TODO: mention the achieved resolution (in degrees) thanks to fancy line drawer helper-->
- __Accelerometer__\
  Identical to the gyroscope, except that it's more responsive and has shown to also deliver more reliable data. It is scaled so that the full screen covers a value-range of -1.0 to 1.0. Here when lying flat on a table, the z-axis (blue) will be steady at 1.0 indicating a vertical 1G force (aka gravity) and x-y will be at zero. Moving and/or rotating the device will change these values significantly faster than with the gyro, as this shows the raw, unprocessed IMU readouts.
  <!--TODO: mention the achieved resolution (in G's? mG's?) thanks to fancy line drawer helper-->
- __Snake Game__\
  <!--TODO-->
- __Pong Game__\
  Here 2 Players are required, either two humans, or a human and a bot, or even two bots.
  <!--note how gameloop-->
  <!--TODO-->


# __Game Loader__
<!--TODO: explain the builtin, super-simple error-handling of the game-engine. Also take player-selector as a great example, show some errors/warnings from the log when aborted maybe too? -->
<!--TODO: also mention how gameloader handles saving memory-->

<!--TODO: somewhere fitting, explain the concept of Auth & Identities with KisDB. No need for details, just so that it's clear _how_ the multiplayer works and what the 'anonymous','web-1','web-2','web-3' buttons in the WebUI *actually* do -->

<!--TODO: also note somewhere the security aspect of KisDB Identities too. Note that the WebUI whilst exposing tokens, actually isn't _insecure_ since no write-token is exposed (except for obviously the intended 'writeonly' and 'readonly' tokens) But all admin & server stuff is fully secure. No arbitrary writes or read are allowed outside of public/controls/private e.g. to custom/xyz - forbidden -->


# __Important Helper-Functions__

- __Player Selector__\
  This function can be used inside of a game. It allows for selecting between 0 and 4 human players, with the required remainder auto-initiated with game-provided bots. The game must specify a required total player count (bots or humans or mixed) and may provide any number of bots. From there, the Helperfunction takes care of all display functions and user-inputs. It calculates the minimum and maximum number or human players required to satisfy total player count, based on provided bot-count. Then it allow the player to scroll left-right using the joystick and select the number of human players they wish to have (using middle-button of joystick). If more than one human player was selected, a 1 through 4 ordered screen will show up, allowing players to middle-click to register themselves as the shown player number (1-4). If 0 or 1 human players are selected, this is skipped as the choice is clear.

  To improve clarity of use, dynamic arrows on the sides are shown to indicate that a selection can be made in that direction. These disappear at the end of the valid list range, all entirely self-automated.
<!--TODO: insert player selector graphic with many variants-->
<!--TODO: maybe? mention the drawNumber helper? though far less special & interesting compared to player selector -->
<!--TODO: do mention definitely the line-drawer-->
# __Data Structure__
  <!--TODO: The "Database" type explanation-->

# __API Reference__
  <!--TODO: the HTTP Rest API-->

# __Compromises from the [Original Proposal](proposal.md)__
Given the quite large scope of the original proposal, especially when considering the limited project time of mere 6 weeks total and the fact that it's an addon-course alongside the main study and a part-time job, significant cuts had to be made. I am however happy to say, that the most important parts all stayed ... except HTTP/3 :(

- [HTTP/3](https://en.wikipedia.org/wiki/HTTP/3) / [QUIC](https://en.wikipedia.org/wiki/QUIC)\
  Not that much, but some time was spent trying to successfully compile the [NanoMQ Client](https://github.com/nanomq/nanomq) with special QUIC flags (-DNNG_ENABLE_QUIC=ON + more), but despite the effort and successfully compiling it, I was unable to establish a successful MQTT over QUIC connection with the locally selfhosted [EMQX Broker](https://hub.docker.com/r/emqx/emqx) instance. Whilst I am certain that would have been possible with a bit more time, I deemed that QUIC was just a _behind-the-scenes_ niche feature and didn't _add_ anything to the project. Yes it's very cool, yes I really wanted to use it, yes I am upset about this, but no, I don't regret the choice. I don't know what problems I'd have run into. It might have just worked, or maybe blew up the whole project scope. Project IoNoW's core and all of KisDB is written in TypeScript, running on [Bun](https://bun.sh). MQTT over QUIC was only supported in C/C++, python, go and Erlang. I wasn't going to write a server in C++, Erlang I never touched, Python I used only when needed and go I just got into liking, but it would have taken waayyy too much time. So using QUIC in this project wasn't just about getting nanomq connected, a whole lot more would have needed to be tailor-made for it. Even after all of that, I'd need something to actually show it off! As in, it's cool to send an mqtt message over quic, but if that's __all__ I managed to do, _use_ mqtt... well that wouldn't have been great to say the least.

- __Database__\
  I planned to use PostgreSQL and have a nice ZFS pool for it, everything clean, but again, I understood that it really wasn't worth it. It was just a little _behind-the-scenes_ footnote that would have taken a decent amount of time but wouldn't deliver any new feature, nothing new to show, nothing to learn or discuss. As such, SQLite was continued to be used, which also means that this project is much easier to run yourself, not having to host anything yourself or pay others to.

- __Soil Moisture__\
  After a discussion with the lector, we came to the conclusion that what I had done already was very plenty enough to demonstrate everything. I had real, proper, persistent data-storage, it wasn't necessary to go out of my way and add some, _any_ historic sensor data 'just cuz', when I could spend the time on more meaningful things. Not _every_ IoT Projects need a temperature and humidity graph ;) (though notably instead, realtime gyro & accel sensors were nicely displayed, which wasn't originally planned, so that's a bonus)

- __esp32 & Docker__\
  Having decided not to have use the Plant Sensor, I no longer needed an [esp32](https://www.seeedstudio.com/Seeed-Studio-XIAO-ESP32C6-p-5884.html) for anything, so the [esp-idf](https://github.com/espressif/esp-idf) was also unused. And without MQTT over QUIC, and also using SQLite instead of Postgres, I no longer needed [Docker](https://docs.docker.com/compose/) to host anything. Bun & python just ran natively and well KisDB was a self-contained npm-package for bun, nothing else was needed there either. It wasn't much of a decision to drop these, I just had no use for them anymore.

- __React__\
  Although I only mildly intended on using React, as the plain, basic testing html-css-js WebUI _evolved_, I realised that literally everything was happening in typescript & the server. The was no _real_ UI and much less so a dynamic one. I just put down a canvas and 5 buttons, some minimal css and then didn't touch until basically the end-phase of the project. So React would have been a time-consuming, completely unnecessary, huge dependency. Absolutely zero upside, thus I never even gave it a second of thought.

- __Debian Trixie__\
  So as it turns out, here my lacking Pi experience really shows, Raspberry Pi OS is less _optional_ than I thought and using anything else is much more complicated. Though no matter, I wanted to use plain, headless Debian Trixie, the latest [Raspberry Pi OS (lite)](https://www.raspberrypi.com/software/operating-systems/) image exactly that, just optimized for the Pi. So that's great too! Not an _actual compromise_ to the proposal, I know, but it fits this section best.


# A note on AI
This project utilizes very little AI, I personally simply work better without it; I've tried using Agents, everything takes longer, is much more annoying to make and ends up being far worse, hard to understand/extend and very unreliable.

What AI's great for, is researching very specific/niche, 'hard-to-google' topics & problems. I still love to simply google for stuff (actually Brave/DDG) and look through Documentation/StackOverflow/Reddit results but sometimes nothing comes up. Some tools or problems are too new, since AI noone really posts solutions or questions on forums anymore. So AI as a modern-day search engine is a valid usecase for me. When it comes to code, the same way people would traditionally have used StackOverflow or Google Search (the good old one), I treat AI answers just like any StackOverflow response: Cautiously optimistic.

With that having been said, another great use for AI is _translation_, it really has revolutionized that. So much so, that the KisDB interface files *for python* were fully AI-generated, and then naturally adjusted by me, since Gemini Pro couldn't manage to get everything done I wanted/needed and also had some silly bugs. I've hardly ever needed to use python, even then only on a very minimal basis. With this project's scope and limited time, I could have only scrapped together something awful myself taking a bunch of wasted time, or asked AI to give me a library which I already hand-made in TypeScript, but simplified and in python. This worked wonderfully. AI was also used in some of KisDB's *TypeScript Type-Definitions* (*only* typedefs!) since KCP has a couple very complex types, truly hard to figure out on your own. But other than those two instances, *everything* else was *purely* hand-written. No other code at all was generated.

Regarding writing, I strongly believe that the work we present as our own for others to read and interact with it, shall expeptionlessly truly be our own work. If I can't be bothered to write it, why should anyone else be bothered to read it.

# Project Repository
[GitHub > KhanKudo > setu-iot-2026](https://github.com/KhanKudo/setu-iot-2026.git)