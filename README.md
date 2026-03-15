# Project Name
#### Student Name: Luka Milenkovic   Student ID: el25b216@technikum-wien.at

Assignment from the IoT Standards & Protocols course of 2026 at [SETU Ireland](https://setu.ie) part of the Study@Home program at [UAS Technikum Wien](https://technikum-wien.at/en).

TODO: Write a short project description. (still not sure about exact project details)

## Tools, Technologies and Equipment

### > [HTTP/3](https://en.wikipedia.org/wiki/HTTP/3) / [QUIC](https://en.wikipedia.org/wiki/QUIC)
The next-generation HTTP-Protocol offering superior latency, bandwidth, reliability and efficiency all with more fine-grained control. It is mature enough now that all modern client devices support it and server-side support is mostly present too, though still developing.
Seeing as this is the future of the internet, it would be a great learning opportunity to get some first-hand experience with the protocol.

### > [MQTT](https://en.wikipedia.org/wiki/MQTT)
As it's standard and extremely widespread, MQTT is just a default-pick for IoT. Traditionally the [Mosquitto Broker](https://github.com/eclipse-mosquitto/mosquitto) is the goto choice for self-hosting, being that it's very easy to set up and it offers enough customization for most personal usecases. It's well-tested and can be considered secure. However [EMQX](https://github.com/emqx/emqx) is an enticing newer option that more so targets enterprise-scale deployment boasting support for hundreds of millions of concurrent devices on a single cluster. It has a full management web-dashboard with complete control over users, identities, permissions, groups, projects and so much more. Among many other features, it natively supports [MQTT over QUIC](https://docs.emqx.com/en/emqx/latest/mqtt-over-quic/introduction.html), fitting in very well with the overall interest of using HTTP/3 in this project.

### > [kisdb](https://github.com/KhanKudo/kisdb)
> ###### _(not yet published)_

A self-developed database interface wrapper with support for realtime communication and ability to act as a functional logic-API-Layer not just a plain DB-Wrapper.
Notably so, an excellent feature of kisdb is that the actual Database behind it can be freely chosen, that includes sqlite, mongodb, postgres, spacetimedb or anything else really. In theory a custom mapper could even be used to store different kinds of data in different databases, appealing to each of their unique individual strengths, all completely transparent to the client.
Continuing to fit in with the project theme, kisdb too can be made to serve over a [WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API) socket connection with for example sqlite as a local DB on the server.


## Some brief words on scope-creep and project complexity
As someone who I assume has read or at least seen the above section of Tools & Technologies, you're thinking it's too much. Well no worries, I've had the same thoughts. All of the above mentioned tools fit well with the overall project task but are primarily chosen by me because I want to learn how they work and gain first-hand experience using them in a project, not just random _Hello, World!_ copy-pastes. Definitely a "nice-to-have" rather than "must-have" kind of mindset. Every single tool mentioned can easily be swapped out for a simpler, weller-known, better supported, tried-n-tested alternative. These are not set-in-stone commitments, should timelines take a turn for the worse, any one _(or many)_ of them can be sacrificed for the sake of completing the project as a whole. With that having been said, going with all the clear and simple options from the beginning might be smart but also quite boring, so this is the most I can compromise :D

#

#

#

#

TODO: Write a list of things you propose to use in your work. This can be hardware, programming languages etc.

## Project Repository
[GitHub > KhanKudo > setu-iot-2026](https://github.com/KhanKudo/setu-iot-2026.git)