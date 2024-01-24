// We build up on the specification of JANI https://docs.google.com/document/d/1BDQIzPBtscxJFFlDUEPIo8ivKHgXT8_X6hz5quq7jK0/edit
// which is specified in js-schema.
// In this file we only show the property specification part of the CONVINCE JANI specification.
// This version replaces the property specification part of the original JANI specification for the use in CONVINCE tooling.
// Comments indicate that parts of the original JANI specification are left out

var Property = schema ({
	"name": Identifier,
	"expr": PropertyExp
});


var PropertyInterval = schema({
	"?lower": Expression, 
	"?lower-exclusive": [ true, false ],
	"?upper": Expression, 
	"?upper-exclusive": [ true, false ] 
});


var RewardAccumulation = schema(Array.of([ 
  "steps" // evaluate the expression when taking a transition, after* all assignments have been executed,
  		  // and accumulate the result (* note that this is different from PRISM's transition rewards)
		  // "time" value is currently not supported in CONVINCE
]));


var PropertyExpression = schema([
	Expression, // all definitions of the CONVINCE JANI Expression schema given in the `environment-JANI/specification.js` file
	{
	  "op": "filter",
	  "fun": [
		"max",  // currently only properties evaluated in the *single* initial state are supported, therefore the filter functions have no meaning and we only support one
	  ],
	  "values": schema.self, 
	  "states": schema.self
	},
	{ 
	  "op": [ "Pmin", "Pmax" ], 
	  "exp": schema.self, 
	},
	// currently no CTL path formulas are supported
	{
	  "op": [ "Emin", "Emax" ],
	  "exp": Expression,
	  "?accumulate": RewardAccumulation, // whether and when to accumulate exp's value
										 // (accumulate to obtain an "F", "C<=" or "C" property)
	  "?reach": schema.self, // the reachability state formula (for PRISM "I" and "F"-style properties), type bool
	  "?step-instant": Expression, // or step instant (number of edges taken, for "I" and "C<=" properties), type int
	  // timed models are currently not supported
	  "?reward-instants": Array.of({
		"exp": Expression, 
		"accumulate": RewardAccumulation, 
		"instant": Expression
	  })
	},
	// currently long-run average values are not supported in CONVINCE
	{ 
		"op": [ "F", "G" ], 
		"exp": schema.self, 
		"?step-bounds": PropertyInterval, 
		// timed models are currently not supported
		"?reward-bounds": Array.of({ 
		  "exp": Expression,
		  "accumulate": RewardAccumulation, 
		  "bounds": PropertyInterval
		})
	},	
	{
	  "op": [ "U", "W" ],
	  "left": schema.self, 
	  "right": schema.self,
	  "?step-bounds": PropertyInterval,
	  // CONVINCE is currently not looking into timed models
	  "?reward-bounds": Array.of({ 
		"exp": Expression, 
		"accumulate": RewardAccumulation, 
		"bounds": PropertyInterval
	  })
	},
	{ // state predicates
	  "op": [ "initial"]  // currently only properties evaluated in the *single* initial state are supported, that's also the reason why the filter functions above have no meaning and we only support one
	}
  ]);
  