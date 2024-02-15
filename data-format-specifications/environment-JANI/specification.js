// We build up on the specification of JANI https://docs.google.com/document/d/1BDQIzPBtscxJFFlDUEPIo8ivKHgXT8_X6hz5quq7jK0/edit which is specified in js-schema.
// In this file we show the CONVINCE variant of the original JANI specification, including adaptions, cuts, and additions, made to the original JANI specification.
// Since JANI models are all-encompassing, meaning that they specify one large model including the environment, skills, functions, behavior, and properties to check, the specification here includes the syntax for all those parts, not only specifically for the environment part. Only the property specification syntax is given in `data-format-specifications/property-specification-JANI`.
// This specification for CONVINCE includes JANI feature extensions to describe geometric settings in 2.5D environments and the behavior of the autonomous robot acting in that environment.
// Feature extensions for robotic systems: geometric objects, environment specifications incl. boundaries, object positions, etc. 
// JANI features not used in CONVINCE are mentioned in comments around the lines where they are defined in the original specification. 
// In general, timed models are not used in CONVINCE, the array, datatype, option, nondeterministic selection, state-exit reward, and function feature extensions, except for trigonometric functions, is not included currently.


var Identifier = /[^#]*/; // ATTENTION: Difference to original JANI: no "." allowed in identifiers to allow to access JSON objects directly in the same JSON file (used for property specifications)

var BasicType = schema([
    "bool",
    "int",
    "real"
]);

var BoundedType = schema({ 
    "kind": "bounded",
    "base": [ "int", "real" ],
    "?lower-bound": Expression, 
    "?upper-bound": Expression 
});

var Type = schema([
    BasicType,
    BoundedType,
    // clocks and continuous types are not used in CONVINCE
]);

var ConstantValue = schema([
    Number, // numeric value, integer or real
    true,
    false   // other mathematical constants are currently not used in CONVINCE
]);

var Expression = schema([
    ConstantValue,
    Identifier,
    {
        "op": "ite",
        "if": schema.self,
        "then": schema.self,
        "else": schema.self
    },
    {
        "op": [ "∨", "∧" ], 
        "left": schema.self,
        "right": schema.self
      },
      {
        "op": "¬",
        "exp": schema.self
      },
      {
        "op": [ "⇒", "=>" ], // extension compared to original JANI specification: non-unicode operators are allowed
        "left": schema.self,
        "right": schema.self
      },
    
      {
        "op": [ "=", "≠", "!="], // extension compared to original JANI specification: non-unicode comparison operators are allowed
        "left": schema.self,
        "right": schema.self
      },
      {
        "op": [ "<", "≤", ">", "≥", "<=", ">="], // extension compared to original JANI specification: non-unicode comparison operators are allowed
        "left": schema.self,
        "right": schema.self
      },
      {
        "op": [ "+", "-", "*", "%" ],
        "left": schema.self,
        "right": schema.self
      },
      {
        "op": [ "/", "pow", "log" ], // result type is real (division is real division, no truncation for integers)
        "left": schema.self,
        "right": schema.self
      },
      {
        "op": [ "floor", "ceil" ],
        "exp": schema.self
      }, 
      { 
        "op": [ "min", "max" ],
        "left": schema.self,
        "right": schema.self
      },
      // CONVINCE is not using derivatives or distribution sampling
      { 
        "op": [
          "sin",  // Trigonometric sine, argument in rad
          "cos",  // Trigonometric cosine
        ],
        "exp": schema.self
      }  
]);

// Automata composition
var Composition = schema({
    "elements": Array.of({
      "automaton": Identifier,
      "?input-enable": Array.of(Identifier),
    }),
    "?syncs": Array.of({
      "synchronise": Array.of([ Identifier, null ]),
      "?result": Identifier,
    }),
  });

var ModelType = schema([
    "dtmc",
    "mdp"
  ]);

// Currently CONVINCE does not use specific ModelFeatures

var VariableDeclaration = schema({
    "name": Identifier,
    "type": Type,
    // CONVINCE uses only non-transient variables
    "?initial-value": Expression,
  });
  
var ConstantDeclaration = schema({
    "name": Identifier,
    "type": [ BasicType, BoundedType ],
    "?value": Expression
});
  
var Model = schema({
    "name": String,
    "type": ModelType,
    "features": ["convince-extensions"],
    "?constants": Array.of(ConstantDeclaration),
    "?variables": Array.of(VariableDeclaration),
    "?rob-env-model": RobEnvModel,  // CONVINCE feature extension to define a robotic environment model
    "?actions": Array.of({
      "name": Identifier
    }),
    "?restrict-initial": {
      "exp": Expression
    },
    "?properties": Array.of(Property),
    "automata": Array.of(Automaton),
    "system": Composition 
  });
  
  var Automaton = schema({ 
    "name": Identifier,
    "?variables": Array.of(VariableDeclaration),
    "?restrict-initial": {
        "exp": Expression
    },
    "locations": Array.of({ 
        "name": Identifier,
        // CONVINCE currently does not include timed models 
        // CONVINCE uses only non-transient variables
    }),
    "initial-locations": Array.of(Identifier),
    "edges": Array.of({
        "location": Identifier,
        "?action": Identifier,
        "?guard": {
            "exp": Array.of(Expression, Intersection)   // CONVINCE feature extension to check if objects bumped into each other = intersect in guards to react to it in assignments of action destinations
        },
        "destinations": Array.of({
            "location": Identifier,
            "?probability": {
                "exp": Expression
            },
            "?assignments": Array.of({
                "ref": Identifier,
                "value": [Expression, "intersection-x", "intersection-x"]   // x or y coordinate of the first intersection hit on trajectory
            }),
        }),
    }),
});



// Feature extensions for robotic use cases

var RobEnvModel = schema({      // Robotic Environment Model
    "name": Identifier,
    "boundaries": Array.of(Point),
    "obstacles": Array.of(Obstacle),
    "robots": Array.of(Robot)
});

var Point = schema({
    "x-coord": Expression,
    "y-coord": Expression
});

var Cube = schema({
    "length": Expression,
    "width": Expression,
    "height": Expression
});

var Cylinder = schema({
    "radius": Expression,
    "height": Expression
});

var Shape = schema({
    Cube,
    Cylinder,
    Point
 });

 var SensorType = schema([
    "bumper",   // will be converted into boolean variable in plain JANI with initial value set to false indicating if the bumper is triggered 
    "lidar",    // all types starting from here will be converted into a boolean and a real variable in plain JANI indicating if the sensor is switched on and how far the next detected obstacle is, accessible via sensor[n].on and sensor[n].value
    "radar",
    "camera",
    "special"
]);

 var Sensor = schema({
    "name": Identifier,
    "type": SensorType 
 });

var Obstacle = schema({ //discretization of obstacles in rectangles
    "name": Identifier,
    "movable": [
        true,
        false
    ],
    "position": Point, // (0,0) in lower left corner
    "shape": Shape,
    "?speed": Expression, // in case of a moving obstacle: speed in m/s
    "?direction": Expression, // in case of a moving obstacle: rotation measured from x-axis 
    "shape": Shape,
});

var Robot = schema({   
    "name": Identifier,
    "position": Point, 
    "direction": Expression, // angle of rotation measured from x-axis 
    "shape": Shape,
    "?sensors": Array.of(Sensor)
});

var Intersection = schema({ // CONVINCE feature extension to check if objects bumped into each other = intersect in guards to react to it in assignments of action destinations
    "op": ["intersect", "not-intersect"],
    "left": Robot.name, //geometric intersection of a robot with ...
    "right": Array.of(
            Obstacle.name,
            "obstacles",
            "boundaries",
            "all"),
    "speed": Expression   // driving speed with which object is moving and intersections should be checked
    // ... specific or all obstacles or all boundaries or all obstacles + boundaries
});
