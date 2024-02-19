# XML format specification

## Components

Components are specified as State Charts in SCXML format (see [W3C specification](https://www.w3.org/TR/scxml/)) subject to the following restrictions:

- No hierarchical states
- No <parallel> states
- No <final> states
- No <history> pseudo-states
- No <script> executable elements (TODO: discuss with partners)
- No <cancel> executable elements
- No <donedata> data
- No <content> data
- No system variables other than '_event.data'
- No <invoke> elements

Moreover, <send> <param> and '_event.data' variables have to be used consistently with the declared interface of the component/skill.

Types from the global types definition files can be used without being re-declared.
