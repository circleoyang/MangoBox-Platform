# DFPlayer and voice API Reference

> Candidate API documentation | source snapshot: 2026-10-26 | High-Level MicroPython for the selected candidate profile only. This page is not a stable release or an eight-target hardware acceptance record. Host Python 0.4.6 does not advertise these new interfaces.

## Availability, source and initialization

The common beginner path across the eight candidate HLMP targets is `audio_begin/audio_volume/mp3/mp3_stop/speak/say`, with a configured external DFPlayer. Host 0.4.6 does not advertise these new methods. Carrier delegates to RC6Original; BarePico dynamically installs the existing Player/AudioManager methods during initialization.

Audio v1.1, the 365-clip bank and paged catalog methods require an actual build overlay. Presence of source files is not proof that an installed UF2 contains that player.

## `audio_begin()`

```python
m.audio_begin()
```

Returns `self`. Reads DM keys `enabled_modules.dfplayer`, `dfplayer_uart_no`, `dfplayer_tx_pin`, `dfplayer_rx_pin`, `dfplayer_busy_pin`. UART is 0/1, TX/RX must be valid distinct pins, and BUSY may be None. Existing GPIO/UART ownership is validated. No TF/Flash write or network start occurs.

Disabled/incomplete configuration or another controller owner raises `RuntimeError`; GPIO conflicts may raise `ValueError`. Repeated calls with the same object's DM mapping can reuse the owner, but are not a way to reassign UART. Success is not an audible hardware test.

## `audio_volume()`

```python
accepted = m.audio_volume(percent)
```

`percent` is an integer 0–100; bool is rejected. Returns the accepted percentage, not the hardware raw level. Conversion to 0–30 is internal. Invalid values raise `ValueError`; missing initialization raises `RuntimeError`. Semantic logging records the first value or a change of at least ten percentage points from the last logged value. Actual volume can still change at one-percent increments.

## `mp3()` and `mp3_stop()`

| Family | Exact signature | Return |
|---|---|---|
| Carrier | `m.mp3(index)` | True when accepted |
| BarePico | `m.mp3(track, loop=False, folder=None)` | True when accepted |
| Both | `m.mp3_stop()` | None; stop is queued |

Shared call:

```python
m.mp3(1)
```

Default `/MP3` track numbers are 1–9999; that does not prove a file exists. BarePico additionally accepts folder 1–99 with track 1–255. Do not pass those extra options to the Carrier facade. Invalid numbers raise `ValueError`; initialization/resource errors can raise `RuntimeError`, and a not-yet-installed BarePico method can be absent.

Acceptance is not BUSY confirmation. Stop clears the Player's music/current voice state, but does not promise to clear all higher-level queued sentences or notification rules. Stop those through their owner. Closing your own Mango at program exit does not authorize taking over another service's player.

## `speak()`

```python
accepted = m.speak(key_or_id, mode="auto")
```

`key_or_id` is a catalog key string or positive logical ID integer; bool is invalid. `mode` is `auto/queue/replace`, default `auto`. Replace acts on the current voice/voice queue; it does not bypass capability checks. Returns True when accepted.

Missing keys can raise `KeyError`; invalid type raises `TypeError`; invalid ID/mode/catalog raises `ValueError`; missing compatible player or restricted high-ID insertion raises `RuntimeError`.

Audio v1.1 maps high IDs using v2 catalog folders 90/91. Voice ID >255 while background music is playing remains explicitly rejected for ADVERT. The implementation does not silently stop music as a substitute. Keep the TF pack and catalog consistent; never truncate IDs to 255 or infer indices from filenames.

## `say()`

Carrier: `m.say(name, **kwargs)` delegates to AudioManager. BarePico: `m.say(topic, temp=None, humi=None, priority="normal", replace=False, style="auto")`.

| Topic | Prerequisite |
|---|---|
| `time` / `date` | Trusted time on the same Mango and required clips |
| `weather` | Valid temperature/humidity; omitted temp can trigger family-specific DHT read |
| `temp` | Valid temperature |
| `number` | Existing API uses `temp=<integer>` as the number argument |
| `welcome` | Catalog contains `welcome_phrase` |

Priority is `normal/high/alarm`; replace controls queued-speech replacement; style is `auto/legacy`. Returns the number of composed clips, not seconds or completion. Up to six waiting utterances and 1–64 clips per utterance are accepted. Missing clips, missing durations without BUSY and invalid parameters raise `ValueError`; a full queue or untrusted time may raise `RuntimeError`.

Read and validate sensors in the main flow, then pass temperature/humidity. Carrier DHT can retain an old numeric value after failure, so a numeric tuple alone does not establish freshness.

## Family-specific extensions and alias boundaries

Carrier has additional `mp3_play/mp3_volume/mp3_status/audio_catalog/rc6_audio/mp3_attach` facades. Initialized BarePico may expose original controller methods such as `mp3_info/mp3_busy/audio_status/audio_playlist/audio_on_event`. `mp3_page/voice_page` additionally require the Audio v1.1 overlay. They are not all shared Mango methods.

`m.volume()` is not the volume entry point here. Do not promote an underlying controller method to the Mango object without source evidence. Pause/resume and high-ID insertion remain source/validation-specific.

## Execution lifecycle

Configure in DM, initialize explicitly and keep one Mango Scheduler running for command transmission, voice sequencing and BUSY observation. Keep callbacks short; defer complex actions to the main loop. Never wait for completion or call `run_once()` inside a callback. Student code should not construct UART packets or fabricate `@@MANGO_EVENT@@` records.

[Complete examples](../guides/dfplayer.md) · [DHT11](dht11.md) · [Clock](clock.md)

## Sources and validation scope

Reviewed against MangoBox source `f875289b5698f0e61faf64196b1165a3b18f2bd5`:

- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/common/peripherals/firmware_candidate/rc6_original.py`
- `runtime/common/peripherals/audio_v11_candidate/mb_mp3/player.py`
- `runtime/common/peripherals/audio_v11_candidate/mb_audio_rc6/manager.py`

Python code blocks received syntax checks. Measurements, audio, networking and physical behavior still require validation on the selected firmware and hardware.
