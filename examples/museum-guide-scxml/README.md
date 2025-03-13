# Museum guide (SCXML model)

This folder contains a UC3-inspired model in the SCXML format obtained by compiling the high-level model with AS2FM.

Currently, the following elements are written/modified by hand:

- Properties are manually obtained by the high-level XML properties specification.
- The `NULL.scxml` model is written by hand (but it is "standard").
- The `global_timer_automata.scxml` is modified by hand to add the time delay to the send event.
