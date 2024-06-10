
# Video Calling app

This is a video calling application built using WebRTC on a peer-to-peer architecture. The application supports audio-only calls, screen sharing, and can have up to 4 people in a room.

For a detailed explanation of how WebRTC works and the inner workings of this project, please read my <a href="https://medium.com/@indranilsen1983/webrtc-the-magic-behind-communications-over-the-internet-part-2-how-it-works-98cc55bbd694">Medium article</a>.


## Table of content:

1. [Architecture](#architecture)

2. [Features](#features)

3. [Tech Stack](#tech-stack)

## Architecture

WebRTC Architecture
<p align="center">
  <img src="https://github.com/Indranil0603/Video-Calling-app/assets/95271465/21fd74be-0ea5-4f9b-850d-bcdc05327df9" width="700" title="Architecture" alt="Architecture">
</p>

How it works
<p align="center">
  <img src="https://github.com/Indranil0603/Video-Calling-app/assets/95271465/66fba0a0-79fc-4a89-8189-75c3b018c971" width="700" title="Architecture" alt="Architecture">
</p>


## Features
* <strong> Peer-to-Peer Architecture: </strong> Direct connections between participants for low-latency communication.
* <strong> Audio-Only Calls: </strong>Join calls with audio only, reducing bandwidth usage.
* <strong> Screen Sharing: </strong>Share your screen with other participants.
* <strong> Room Capacity: </strong>Supports up to 4 participants per room.

## Tech Stack

**Client:** React, Redux

**Server:** Node Js, Express Js, Twilio, WebSockets, WebRTC


