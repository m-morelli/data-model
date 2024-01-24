// We build up on the specification of JANI https://docs.google.com/document/d/1BDQIzPBtscxJFFlDUEPIo8ivKHgXT8_X6hz5quq7jK0/edit
// which is specified in js-schema.
// In this file we show the CONVINCE variant of the original JANI specification, including adaptions, cuts, and additions, made to the original JANI specification.
// This includes feature extensions to describe geometric settings in 2.5D environments and the behavior of the autonomous robot acting in that environment.
// Feature extensions: TODO: list them here!!!!!!!!!!!!!!!!!!!
// JANI features not used in CONVINCE are mentioned in comments around the lines where they are defined in the original specification. 
// In general, timed models are not used in CONVINCE, the array, datatype, option, nondeterministic selection, state-exit reward, and function feature extension is not included currently.


var Identifier = /[^#].*/;

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

// Currently CONVINCE does not used specific ModelFeatures

var VariableDeclaration = schema({
    "name": Identifier,
    "type": Type,
    // CONVINCE only uses non-transient variables
    "?initial-value": [Expression],
  });
  
var ConstantDeclaration = schema({
    "name": Identifier,
    "type": [ BasicType, BoundedType ],
    "?value": Expression
});
  
var Model = schema({
    "name": String,
    "type": ModelType,
    "?actions": Array.of({
      "name": Identifier
    }),
    "?constants": Array.of(ConstantDeclaration),
    "?variables": Array.of(VariableDeclaration),
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
        // CONVINCE only uses non-transient variables
    }),
    "initial-locations": Array.of(Identifier),
    "edges": Array.of({
        "location": Identifier,
        "?action": Identifier,
        "?guard": {
            "exp": Expression
        },
        "destinations": Array.of({
            "location": Identifier,
            "?probability": {
                "exp": Expression
            },
            "?assignments": Array.of({
                "ref": Identifier,
                "value": Expression
            }),
        }),
    }),
});



// Feature extensions for robotic use cases
// UNDER DEVELOPMENT!!!!


var Intersection = schema({
    "op": "intersect",
    "left": Robot.name, //geometric intersection of a robot with
    "right": [Obstacle.name,
        "obstacles",
        "boundaries",
        "all"
    ]
    // a specific or all obstacles or all boundaries or all o. + b.
});

var Obstacle = schema({ //discretization of obstacles in rectangles
    "name": Identifier,
    "movable": [
        true,
        false
    ],
    "x-coord": Expression, // (0,0) in lower left corner
    "y-coord": Expression,
    "shape": Shape,
    "?x-speed": Expression, // in case of a moving obstacle: speed in m/s in x and y dimension
    "?y-speed": Expression
});

var Shape = schema({
   Square,
   Circle,
   Point
});

var Square = schema({
    "length": Expression,
    "width": Expression,
    "height": Expression
});

var Circle = schema({
    "radius": Expression,
    "height": Expression
});

var Point = schema({
    "x-coord": Expression,
    "y-coord": Expression
});

var Robot = schema({
    "name": Identifier,
    "initial-x-coord": Expression,
    "initial-y-coord": Expression,
    "shape": Shape
});

var EnvModel = schema({
    "name": Identifier,
    "boundaries": Array.of(Point),
    "obstacles": Array.of(Obstacle),
    "robots": Array.of(Robot)
});

var RobotAction = schema({
    "name": Identifier,
    "inputs": Array.of({Identifier
    }), //variable names 
                                 //affecting this action
    "assignments": Array.of({
        "variable": Identifier,
        "value": Expression,
        "?probability": ConstantValue //real, in case of a probabilistic action
    }),
    "?return": [S, R, F
    ] //success, running, failure
});

//list of conditions and actions used in corresponding BT
var SkillModel = schema({
    "name": Identifier,
    "conditions": Array.of(Condition),
    "actions": Array.of(RobotAction)
});