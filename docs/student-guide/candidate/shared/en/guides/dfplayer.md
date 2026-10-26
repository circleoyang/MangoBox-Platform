# DFPlayer and Chinese voice guide

> Candidate API documentation | source snapshot: 2026-10-26 | High-Level MicroPython for the selected candidate profile only. This page is not a stable release or an eight-target hardware acceptance record. Host Python 0.4.6 does not advertise these new interfaces.

## 1. What can you build?

DFPlayer plays music and prepared voice clips from a TF card. Configure UART/TX/RX/BUSY and synchronize the catalog in Device Manager first, then call `audio_begin()` to use that configuration without duplicating pins in student code.

All eight candidate HLMP targets require a real enabled external DFPlayer. BarePico does not contain a player or speaker. Working playback requires matching TF files, a Pico catalog, wiring and power; an API call does not install audio onto the TF card.

## 2. A 30-second voice test

Prerequisites: enabled DFPlayer with valid saved pins and a synchronized base voice pack/catalog. The example uses the existing `hr01` key, which maps to “one o'clock” in the corrected pack. It does not load all 365 records into RAM.

```python
from mangobox import Mango
import time

m = Mango()
m.audio_begin()
try:
    m.audio_volume(30)
    m.speak("hr01")  # The synchronized catalog must contain this key.
    while True:
        m.run_once()
        time.sleep_ms(10)
finally:
    m.mp3_stop()
    stop_at = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), stop_at) < 300:
        m.run_once()
        time.sleep_ms(10)
    m.close()
```

Listen for one clip, then press Ctrl+C. Cleanup briefly advances the Scheduler so a queued stop command can be transmitted before closing. This is not physical confirmation that the speaker has stopped.

## 3. What should you observe?

Request acceptance and audible output are different stages. A True return from `speak()` means accepted/queued, not hardware playback success. If there is no sound, first test a known clip in Device Manager rather than immediately increasing volume.

`audio_volume(30)` means 30%, within 0–100. It is not the old raw DFPlayer 0–30 scale. Historical `mp3_volume()` semantics depend on the attachment path, so new examples consistently use `audio_volume()`.

## 4. Common uses and version requirements

- `mp3(1)` plays music track 1.
- `speak("hr01")` plays an existing voice key.
- `say("time")` / `say("date")` compose speech from a trusted clock and a complete catalog on the same Mango instance.
- `say("weather", temp=..., humi=...)` composes speech from a previously validated sensor reading.

The clean 365-clip pack requires the matching Audio v1.1 player overlay and v2 catalog. A firmware version string alone does not prove which player was included in the build. Older RC6 players retain their high-ID limit. Even v1.1 rejects **ADVERT insertion of voice IDs above 255 while music is playing**; do not promise unrestricted insertion of all 365 clips.

## 5. Complete example: music followed by one low-ID voice insertion

Prerequisites: track 1 and `hr01` exist and the player/configuration have been checked. The main loop submits the voice request without re-entering the Scheduler from a callback.

```python
from mangobox import Mango
import time

m = Mango()
m.audio_begin()
try:
    m.audio_volume(30)
    m.mp3(1)
    started_at = time.ticks_ms()
    voice_requested = False
    while time.ticks_diff(time.ticks_ms(), started_at) < 15000:
        m.run_once()
        elapsed = time.ticks_diff(time.ticks_ms(), started_at)
        if elapsed >= 5000 and not voice_requested:
            voice_requested = True
            m.speak("hr01")
            print("Voice request accepted")
        time.sleep_ms(10)
finally:
    m.mp3_stop()
    stop_at = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), stop_at) < 300:
        m.run_once()
        time.sleep_ms(10)
    m.close()
```

The program requests one voice clip and ends after about 15 seconds. It does not repeatedly initialize the player or create another UART owner. For a button-driven version, record a flag in the callback and process it in the main loop.

## 6. Target/mode notes and troubleshooting

Check API profile and player source first, then DFPlayer enablement/UART configuration, DM playback, matching TF/catalog content and finally TX/RX direction, common ground, power, BUSY and the speaker. Playback troubleshooting does not require replacing student startup files.

Carrier exposes `mp3(index)` while BarePico exposes `mp3(track, loop=False, folder=None)` after audio installation. The shared example uses one positional argument. Carrier `mp3_status()` and BarePico `audio_status()/mp3_info()` are not one common method. Some BarePico methods are dynamically installed only after `audio_begin()`.

This guide does not promise pause/resume compatibility: they are not a complete common facade and require source-specific timing validation. Host 0.4.6 does not advertise these new methods.

## 7. Small challenge

Trigger one voice request from a button. Coalesce rapid repeated presses instead of filling the queue. Then add validated DHT11 readings or trusted time to speak real data.

[DFPlayer Reference](../reference/dfplayer.md) · [DHT11](dht11.md) · [Clock](clock.md)

## Sources and validation scope

Reviewed against MangoBox source `f875289b5698f0e61faf64196b1165a3b18f2bd5`:

- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/common/peripherals/firmware_candidate/rc6_original.py`
- `runtime/common/peripherals/audio_v11_candidate/mb_mp3/player.py`
- `runtime/common/peripherals/audio_v11_candidate/mb_audio_rc6/manager.py`

Python code blocks received syntax checks. Measurements, audio, networking and physical behavior still require validation on the selected firmware and hardware.
