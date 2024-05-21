// We build up on the specification of JANI https://docs.google.com/document/d/1BDQIzPBtscxJFFlDUEPIo8ivKHgXT8_X6hz5quq7jK0/edit which is specified in js-schema.
// In this file we show the CONVINCE variant of the original JANI specification, including adaptions, cuts, and additions, made to the original JANI specification.
// Since JANI models are all-encompassing, meaning that they specify one large model including the environment, skills, functions, behavior, and properties to check, the specification here includes the syntax for all those parts, not only specifically for the environment part. Only the property specification syntax is given in `data-format-specifications/property-specification-JANI`.
// This specification for CONVINCE includes JANI feature extensions to describe geometric settings in 2.5D environments and the behavior of the autonomous robot acting in that environment.
// Feature extensions for robotic systems: geometric objects, environment specifications incl. boundaries, object positions, etc. 
// JANI features not used in CONVINCE are mentioned in comments around the lines where they are defined in the original specification. 
// In general, timed models are not used in CONVINCE, the array, datatype, option, nondeterministic selection, state-exit reward, and function feature extensions, except for trigonometric functions, are not included currently.


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
        "op": [ "∨", "∧", "and", "or", "&& ", "||"], 
        "left": schema.self,
        "right": schema.self
      },
      {
        "op": ["¬", "!"],
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
        "op": [ "floor", "ceil", "abs" ],
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
      },
      { 
        "op": [
          "to_cm",  // In case model checkers do not support floats in transient assignments, convert to smaller unit
          "to_m",
          "to_deg",
          "to_rad"
        ],
        "exp": schema.self
      },
      { 
        "op": [
          "norm2d",
        ],
        "x": schema.self,
        "y": schema.self
      },
      { 
        "op": [
          "dot2d",
          "cross2d"
        ],
        "x1": schema.self,
        "x2": schema.self,
        "y1": schema.self,
        "y2": schema.self
      },
      {
        "op": "intersect",    //  Usually assigned to variable `intersect_backup`, calculates the fraction of the trajectory from the current position to the actual destination where the robot hits a barrier and stops at the point where it bumped.
        "robot": RobEnvModel.robots.Robot.name,
        "barrier": ["all", RobEnvModel.obstacles.Obstacle.name, Point] //  In case of Point, at least two have to be given to define a boundary
      },
      {
        "op": "not_intersect",  //  distance of a robot's position to a point in a 2D space
        "left": RobEnvModel.robots.Robot.name,
        "right": [RobEnvModel.obstacles.Obstacle.name, Point] //  In case of Point, at least two have to be given to define a boundary
      },  
      {
        "op": "distance_to_point",  //  distance of a robot's position to a point in a 2D space
        "robot": RobEnvModel.robots.Robot.name,
        "x": expression,
        "y": expression
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
    "?transient": [ true, false ], // behaves as follows:
    // (a) when in a state, its value is that of the expression specified in
    //     "transient-values" for the locations corresponding to that state, or its
    //     initial value if no expression is specified in any of the locations
    //     (if multiple expressions are specified, that is a modelling error);
    // (b) when taking a transition, its value is set to its initial value, then all
    //     assignments of the edges corresponding to the transition are executed.
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
        "?transient-values": Array.of({ 
          "ref": LValue,
          "value": Expression,
        })
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
                "value": Expression,
                "?index": Number.step(1), // index to create sequences of atomic assignment sets and order sequence of assignment executions, default 0
            }),
        }),
    }),
});



// Feature extensions for robotic use cases

var RobEnvModel = schema({      // Robotic Environment Model
    "name": Identifier,
    "sim_step": Expression,   // duration of one simulation step (tick of the model) in seconds
    "boundaries": Array.of(Point),  //Assumption: these points are ordered, to be able to draw proper lines of the boundaries between them
    "?obstacles": Array.of(Obstacle),
    "robots": Array.of(Robot)
});

var Point = schema({
    "x": Expression,
    "y": Expression
});

var Pose =  schema({
  "x": Expression,
  "y": Expression,
  "theta": Expression   //orientation in the environment
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
    "pose": Pose, // (0,0,0) in lower left corner, facing in x-direction
    "shape": Shape,
    "?linear-velocity": Expression,
    "?angular-velocity": Expression
});

var RobotPerception = schema({
  "boundaries": Array.of(Point) ,   // Maybe it is better to consider lines here and also above TODO
  "obstacles": Array.of(Obstacle),   
  "pose": Pose    //The pose the robot thinks it has. Can differ from actual pose in case of sensor issues.
});

var Robot = schema({   
    "name": Identifier,
    "pose": Pose,
    "shape": Shape,
    "perception": RobotPerception,
    "linear-velocity": Expression,
    "angular-velocity": Expression,
});
