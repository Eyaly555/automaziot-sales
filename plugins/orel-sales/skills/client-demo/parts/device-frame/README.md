# device-frame

Show a phone (or tablet) product on a desk screen: a plain bezel with a status bar and its own scroll, so the phone
screen scrolls inside the frame while the page around it stays put. On a real phone the bezel dissolves and the
content simply is the screen. Content is a node you pass, or a URL in an iframe.

**When it earns its place:** part of the system lives on someone's phone (a technician, a driver, a resident, a
customer) and the meeting happens on a laptop or a TV. The frame tells them "this is the phone app" without words.

```js
import { createDeviceFrame } from "./device-frame.js";      // plus device-frame.css
const phone = createDeviceFrame(sideEl, { kind: "phone", content: techAppEl, time: () => clock.time(clock.now()), label: "אפליקציית הטכנאי" });
const tablet = createDeviceFrame(el, { kind: "tablet", src: "./station.html", dissolveBelow: 900 });
phone.screen.appendChild(moreContent);  phone.scrollTo(0);
```

Restyle: `--part-dframe-w`, `--part-dframe-h`, `--part-dframe-radius`, `--part-dframe-bezel`, `--part-dframe-color`,
`--part-dframe-screen`. The status bar is always laid out left-to-right, as real phones draw it.

**Does not decide:** what is on the phone, or whether the desk shows one phone or several side by side. It is not a
device emulator: the content keeps the page's own fonts and behaviour, only the width and the frame change.
