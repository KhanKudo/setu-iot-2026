# Project Name: IoNoW
#### Student Name: Luka Milenkovic
#### Home Uni: el25b216@technikum-wien.at
#### Guest Uni: 20120147@setu.ie

Assignment from the IoT Standards & Protocols course of 2026 at [SETU Ireland](https://setu.ie) part of the Study@Home program at [UAS Technikum Wien](https://technikum-wien.at/en).

> project name is meant to be a little playful and sound like a game, given contents to follow. It's also intended to capture the iot and realtime aspects, shortened from iot-right-now -> IoNoW. Aesthetically pleasing, interesting sounding, short-n-sweet, checks all the boxes!

# Introduction
The project will make use of an esp32c6, a raspberry pi, various sensors, a joystick user input and an 8x8 rgb matrix display to create fun interactive experiences for it's users. All of these will be combined with IoT technologies, security layers, a Web Interface and some local hosting aspects with the key focus of realtime minimal latency throughout the entire IoT Stack. Customizable Server-Side Automations are to be utilized to achieve device responsivenes on par with integrated firmware, indistinguishable for the enduser. Modularity and flexibility will be at the heart of each step along the way, as the IoT industry is built upon dynamic environments, constantly evolving tasks and everchanging requirements.

# Project Overview
## Challenge
The general mindest of this project, is to make all the sensors and actuators to be mentioned behave exactly as such; Plain sensors and actuators. In spirit of IoT (and out of curiosity as well as _some_ practicality), the logic will be a matter of 'automation', not embedded firmware. The various IoT Layers should work together to keep the whole system highly responsive and allow realtime application-level logic to be performed on the server-side with pure sensor input and actuator outputs. The fluency of this is supposed to be good enough that an enduser wouldn't be able to tell it's not actual offline firmware logic. And yes, some sensors/actuators may be connected directly to the Raspberry Pi via it's SenseHAT, those however will be treated as separate devices. All communication will without exception go through the complete IoT Stack.
## Soil moisture sensor
- connected through provided Arduino or mentioned below ESP32-C6
- Using WiFi, through MQTT to Rasperry Pi
## Pi SenseHAT v1.0
It features a temperature, humidity, pressure, gyroscope and acceleration sensor.
Additionally it has a joystick (5-button-schema) and an 8x8 RGB matrix display.
The following modes would be selectable from WebUI and or by joystick,
or by using gyro+accel to determine the resting orientation. Perhaps a 'shake-to-interact' feature too.
All sensors would also be time-logged to a persistent database and viewable in the WebUI dashboard.
  - animated simple plant (both on 8x8 matrix and in WebUI)
    - rain-fall (blue moving dots) when it's time to water
    - can make virtual plant seem to be drying out (falling over) when too low moisture
  - low-res moisture bar-chart
    - over time: last 72hrs
    - 8 columns: 9h steps
    - 8 rows: 12.5% steps (perhaps top/bottom clipped, between finer resolution)
    - pixel color/brightnes gradient can achieve higher perceived resolution
    <!--- embedded software handling for bar-chart data-->
  - scrolling text exact numeric readout of moisture
  - similar charts for temperature, humidity and pressure
## Snake Game
The goal of this minigame is as the spirit says, realtime operation.
Gamelogic and control should live inside the server, end-device is treated only as sensor/actuator bridge.
To emphasize this disconnect and making sure that everything is truly happening in the IoT backbone without a dependency on the end-device, the WebUI should have no problem at all
live-streaming Matrix state as well as interacting directly to simulate the joystick inputs via Laptops keyboard (WASD/arrow keys) as if it were the device.
The Pi's 8x8 Matrix, if online, should then naturally also react to any and every change that the laptop might trigger to happen.
## Pong Game
Just like snake, it would be the goal to make everything realtime so that one player could be on laptop and another on raspi and play in real time going through the IoT Layers efficiently. Even a separate spectator laptop could be connected and the system shouldn't struggle with that.

# Technologies

## > [HTTP/3](https://en.wikipedia.org/wiki/HTTP/3) / [QUIC](https://en.wikipedia.org/wiki/QUIC)
The next-generation HTTP-Protocol offering superior latency, bandwidth, reliability and efficiency all with more fine-grained control. It is mature enough now that all modern client devices support it and server-side support is mostly present too, though still developing.
Seeing as this is the future of the internet, it would be a great learning opportunity to get some first-hand experience with the protocol.

## > [MQTT](https://en.wikipedia.org/wiki/MQTT)
As it's standard and extremely widespread, MQTT is just a default-pick for IoT. Traditionally the [Mosquitto Broker](https://github.com/eclipse-mosquitto/mosquitto) is the goto choice for self-hosting, being that it's very easy to set up and it offers enough customization for most personal usecases. It's well-tested and can be considered secure. However [EMQX](https://github.com/emqx/emqx) is an enticing newer option that more so targets enterprise-scale deployment boasting support for hundreds of millions of concurrent devices on a single cluster. It has a full management web-dashboard with complete control over users, identities, permissions, groups, projects and so much more. Among many other features, it natively supports [MQTT over QUIC](https://docs.emqx.com/en/emqx/latest/mqtt-over-quic/introduction.html), fitting in very well with the overall interest of using HTTP/3 in this project.

## > [kisdb](https://github.com/KhanKudo/kisdb)
> ###### _(not yet published)_
A self-developed database interface wrapper with support for realtime communication and ability to act as a functional logic-API-Layer not just a plain DB-Wrapper.
Notably so, an excellent feature of kisdb is that the actual Database behind it can be freely chosen, that includes sqlite, mongodb, postgres, [spacetimedb](https://spacetimedb.com/) or anything else really. In theory a custom mapper could even be used to store different kinds of data in different databases, appealing to each of their unique individual strengths, all completely transparent to the client.
Continuing to fit in with the project theme, kisdb too can be made to serve over a [WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API) socket connection with for example sqlite as a local DB on the server.

## > [React](https://react.dev/)
Given that I come from the world of electronical engineering rather than software, I am very used to low-level. The lower level, the more control. I've always strived to understand everything I use, the best way of doing that is to make it yourself. Taking the time-aspect of such an endeavour aside, it's become somewhat clear to me that some solutions simply are already solved and don't need to be dealt with. I would thus like to experience making the WebUI of this project with React instead of using my usual custom vanilla wrappers and helpers. Albeit, not knowing the full extent of the UI yet, it might end up being far simpler to just go with vanilla, nevertheless I'm optimistic about the opportunity to explore this different world of web-dev.

## > [ESP-IDF](https://github.com/espressif/esp-idf)
For the firmware on the esp32c6 sensor, I will be using esp-idf. The framework made by Espressif specifically for it's microcontrollers.
It supports the complete featureset of the relatively recent esp32c6, which the Arduino Framework doesn't quite do yet.
This also presents a fun opportunity to use FreeRTOS as it very cleanly integrates in with esp-idf.

## > [React](https://react.dev/)
Given that I come from the world of electronical engineering rather than software, I am very used to low-level. The lower level, the more control. I've always strived to understand everything I use, the best way of doing that is to make it yourself. Taking the time-aspect of such an endeavour aside, it's become somewhat clear to me that some solutions simply are already solved and don't need to be dealt with. I would thus like to experience making the WebUI of this project with React instead of using my usual custom vanilla wrappers and helpers. Albeit, not knowing the full extent of the UI yet, it might end up being far simpler to just go with vanilla, nevertheless I'm optimistic about the opportunity to explore this different world of web-dev.

# Tools

## > [Zed Editor](https://zed.dev/)
As a personal preference of mine due to it's customizability, clean flow and the excellent performance, I once more chose Zed.

## > [Bun](https://bun.sh)
As a newer (and by myself vastly preferred) NodeJS competitor, Bun sets itself apart with huge performance boosts, advanced featuresets and preconfigured integrated tools. It natively supports TypeScript, has a testrunner engine and implements many APIs with native optimizations, where NodeJS relies on external Community libraries. One such example would be their direct high performance support for sqlite, Static file serving, HTTP API routing and development hot-reloading of both server and web-client code. I have come to love many of it's features over the years as a somewhat early adopter from back in the beta days of v0.7.1.

## > [Docker Compose](https://docs.docker.com/compose/)
Docker compose is in short a very useful convenience wrapper around the docker cli and takes quite a bit of custom-script work off your hands.
I have used it extensively before, whilst I am far from an expert, not really even an enthusiast, I enjoy using it. In this project, it's usecase will mostly be limited to hosting the mqtt broker and potentially a database. Nevertheless it's easier to include it rather than install everything on straight host system.

## > [Debian Trixie](https://www.debian.org/intro/why_debian)
As a Linux user (endeavourOS), I like linux. For servers however, arch is hardly a sensible choice, debian however is the perfect balance of having everything you need at your fingertips, without any bloat of any kind. Full control, no compromises. This will be used on the Raspberry Pi

## > [MQTTX](https://mqttx.app/)
For testing and debugging MQTT connections during the project, I intend to use the trusted software MQTTX by EMQX, also the makers of the broker planned to be used and frontline pushers of MQTT over QUIC. It has the best and most reliable interface I have seen on an MQTT client so far, is highly reliable and completely open source. Checks all my boxes, so a clear choice.

## > [Zen Browser](https://zen-browser.app/)
For developing and testing the WebUI, I will be using my beloved _Zen Browser_! If you aren't familiar with the amazing Team behind it, definitely worth your attention. Although I keep an instance of ungoogled-chromium on hand for very specific Applications that don't work right in Firefox, it gets used on a sub-monthly basis. Besides, the Zen Team has worked around quite some bugs of Firefox to make their browser even better, truly admirable.

# Hardware

## > [XIAO ESP32-C6](https://www.seeedstudio.com/Seeed-Studio-XIAO-ESP32C6-p-5884.html)
This particular microcontroller is my current goto for any project.
It's tiny, cheap, modern, powerful and efficient: what else could one possibly be asking for. It's even got enough pins (despite the size) for any reasonable project, when that's not enough an IO Expander was needed anyways. The cherry on top is that it uses RISC-V architecture, which has it's own problems for sure, but definitely adds a _"coolness-factor"_.
Given it's list of [features](https://www.espressif.com/en/products/socs/esp32-c6) and capabilities, MQTT over QUIC shouldn't be a major problem. In fact an [example](https://github.com/emqx/ESP32-QUIC) from EMQX on the similar eps32c3 already exists and seems very promising.

## > [Raspberry Pi 3B](https://www.raspberrypi.com/products/raspberry-pi-3-model-b/)
As provided by the university along with a barrage of sensors, I'll be using the Pi for hosting all needed services. I don't intend on using it as a sensor-client (except for HAT sensors), but rather as a server running the web-interface (project dashboard), mqtt broker, database and all needed server-side logic/processing, including outputting to the 8x8 Matrix Display HAT. Nothing fancy, just plain debian 13 with [bun](https://bun.sh) and perhaps some [go](https://go.dev/). Also [Docker compose](https://docs.docker.com/compose/) for running the broker and perhaps Database, depending on choice.


## Some brief words on scope-creep and project complexity
As someone who I assume has read or at least seen the above section of Tools & Technologies, you're thinking it's too much. Well no worries, I've had the same thoughts. All of the above mentioned tools fit well with the overall project task but are primarily chosen by me because I want to learn how they work and gain first-hand experience using them in a project, not just random _Hello, World!_ copy-pastes. Definitely a "nice-to-have" rather than "must-have" kind of mindset. Every single technology mentioned can easily be swapped out for a simpler, weller-known, better supported, tried-n-tested alternative. These are not set-in-stone commitments, should timelines take a turn for the worse, any one _(or many)_ of them can be sacrificed for the sake of completing the project as a whole. With that having been said, going with all the clear and simple options from the beginning might be smart but also quite boring, so this is the most I can compromise :D

# A note on AI
As a general opposer of AI, it will be kept to a minimum in my project. I am plenty well aware of it's positive usecases and astonishing performance in __fitting__ situations, however it's extreme overuse in marketing and general mentality of "Dunno, let's sprinkle some AI on that" is definitely not something I can resonate with. I am using [Brave]() and [DuckDuckGo]() as my default search engines, which do include AI, occassinaly I also use ChatGPT when I have specifialized queries that regular search engines fail to grasp, but code generation (especially agents) and any writing is not something AI will touch. For me, with projects I care about, AI can at most be a personalized version of 'Stack Overflow'. For such instances of specific code snippets or API showcases I see no reason to give special disclaimers. As was the case for decades, no one ever disclosed when, where and how they used Stack Overflow, I use ChatGPT in the exact same way. I am optimistic about it's solutions/snippets but trust them just as much (or rather little) as with any random zero-vote post on Stack Overflow.

Having resisted for long, I tried to understand what people like about coding agents, but with my projects they are horrific. I do things because I enjoy them, want to learn something along the way, gain experience and in the end have something to be proud of. With AI, I keep on fighting it to do what I want, it keeps on breaking things, never understanding the goals, be they as course or detailed as they like, and ultimately I have something that works in some situations, some percentage of time, with lots of frustrations, little to no learning effect and mostly a project I am ashamed of. I see it's usecases in enterprise projects where have the code is context-migrated copy-paste, so AI has seen in millions of times and has no struggles there. Make something more rare, less mainstream and it suddenly knows less than a highschool hobbyist.

Regarding writing, I strongly believe that the work we present as our own for others to read and interact with it, shall expeptionlessly truly be our own work. If at any point a generated segment is to occur, a leading disclaimer will __always__ be present.

# Project Repository
[GitHub > KhanKudo > setu-iot-2026](https://github.com/KhanKudo/setu-iot-2026.git)