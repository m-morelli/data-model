// We build up on the specification of JANI https://docs.google.com/document/d/1BDQIzPBtscxJFFlDUEPIo8ivKHgXT8_X6hz5quq7jK0/edit
// which is specified in js-schema.
// In this file we only discuss the adaptions made to the original JANI specification.
// This includes feature extensions to describe geometric settings in 2.5D environments and the behavior of the autonomous robot acting in that environment.
// Feature Extensions:
// Features Not Used in CONVINCE Tooling:


var Identifier = /[^#].*/;

var Type = schema(
    {
    [
        "bool",
        "int",
        "real"
    ]
},
);

var ConstantValue = schema([
    Number, //numeric value, integer or real
    true,
    false
]);

var BoundedType = schema({
    "type": [
        "int",
        "real"
    ],
    "?lower": Expression,
    "?upper": Expression
});

var Intersection = schema({
    "op": "intersect",
    "left": Robot.name, //geometric intersection of a robot with
    "right": [Obstacle.name,
        "obstacles",
        "boundaries",
        "all"
    ]
    //a specific or all obstacles or all boundaries or all o. + b.
});

var Ite = schema({
    "if": [Expression, Intersection
    ],
    "then": [schema.self, S, F
    ], //success, failure
    "else": [schema.self, S, F
    ]
});

var Expression = schema([     
    ConstantValue,
    Identifier,
    {
        "op": [
            "or",
            "and"
        ],
        "left": schema.self,
        "right": schema.self
    },
    {
        "op": "not",
        "exp": schema.self
    },
    {
        "op": [
            "=",
            "!=",
            "+",
            "-",
            "*",
            "/",
            "<",
            ">",
            ">=",
            "<="
        ],
        "left": schema.self,
        "right": schema.self
    }
]);

var VariableDeclaration = schema({ //to specify e.g. the amount of resources in the beginning, etc.
    "name": Identifier,
    "type": Type,
    "initial": Expression
});

var Obstacle = schema({ //discretisation of obstacles in rectangles
    "name": Identifier,
    "movable": [
        true,
        false
    ],
    "x-coord": Expression, //(0,0) in lower left corner
    "y-coord": Expression,
    "shape": Shape,
    "?x-speed": Expression, //in case of a moving obstacle: speed in m/s in x and y dimension
    "?y-speed": Expression
});

var Shape = schema({
    [
        "radius": Expression,
        "height": Expression
    ],
    [
        "length": Expression,
        "width": Expression,
        "height": Expression
    ]
});

var Point = schema({
    "x-coord": Expression,
    "y-coord": Expression
})

var Robot = schema({
    "name": Identifier,
    "initial-x-coord": Expression,
    "initial-y-coord": Expression,
    "shape": Shape,
    "features": [Identifier: Type
    ]
});

var EnvModel = schema({
    "name": Identifier,
    "boundaries": Array.of(Point),
    "obstacles": Array.of(Obstacle),
    "robots": Array.of(Robot)
});





var Assign = schema([
    "left": Identifier,
    "right": Expression
]);

var Condition = schema({
    "name": Identifier,
    "cond": Ite,
});

var Action = schema({
    "name": Identifier,
    "inputs": Array.of({Identifier
    }) //variable names 
                                 //affecting this action
    "assignments": Array.of({
        "variable": Identifier,
        "value": Expression,
        "?probability": ConstantValue //real, in case of a probabilistic action
    })
    "?return": [S, R, F
    ] //success, running, failure
});

//list of conditions and actions used in corresponding BT
var SkillModel = schema({
    "name": Identifier,
    "conditions": Array.of(Condition),
    "actions": Array.of(Action)
});