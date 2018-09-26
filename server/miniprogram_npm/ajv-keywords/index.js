module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = { exports: {} }; __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); if(typeof m.exports === "object") { Object.keys(m.exports).forEach(function(k) { __MODS__[modId].m.exports[k] = m.exports[k]; }); if(m.exports.__esModule) Object.defineProperty(__MODS__[modId].m.exports, "__esModule", { value: true }); } else { __MODS__[modId].m.exports = m.exports; } } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1537948515392, function(require, module, exports) {
'use strict';

var KEYWORDS = require('./keywords');

module.exports = defineKeywords;


/**
 * Defines one or several keywords in ajv instance
 * @param  {Ajv} ajv validator instance
 * @param  {String|Array<String>|undefined} keyword keyword(s) to define
 * @return {Ajv} ajv instance (for chaining)
 */
function defineKeywords(ajv, keyword) {
  if (Array.isArray(keyword)) {
    for (var i=0; i<keyword.length; i++)
      get(keyword[i])(ajv);
    return ajv;
  }
  if (keyword) {
    get(keyword)(ajv);
    return ajv;
  }
  for (keyword in KEYWORDS) get(keyword)(ajv);
  return ajv;
}


defineKeywords.get = get;

function get(keyword) {
  var defFunc = KEYWORDS[keyword];
  if (!defFunc) throw new Error('Unknown keyword ' + keyword);
  return defFunc;
}

}, function(modId) {var map = {"./keywords":1537948515393}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1537948515393, function(require, module, exports) {
'use strict';

module.exports = {
  'instanceof': require('./instanceof'),
  propertyNames: require('./propertyNames'),
  range: require('./range'),
  regexp: require('./regexp'),
  'typeof': require('./typeof'),
  dynamicDefaults: require('./dynamicDefaults'),
  'if': require('./if'),
  prohibited: require('./prohibited'),
  deepProperties: require('./deepProperties'),
  deepRequired: require('./deepRequired')
  // formatMinimum: require('./formatMinimum'),
  // formatMaximum: require('./formatMaximum'),
  // patternRequired: require('./patternRequired'),
  // 'switch': require('./switch')
};

}, function(modId) { var map = {"./instanceof":1537948515394,"./propertyNames":1537948515395,"./range":1537948515396,"./regexp":1537948515397,"./typeof":1537948515398,"./dynamicDefaults":1537948515399,"./if":1537948515400,"./prohibited":1537948515401,"./deepProperties":1537948515402,"./deepRequired":1537948515403}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1537948515394, function(require, module, exports) {
'use strict';

var CONSTRUCTORS = {
  Object: Object,
  Array: Array,
  Function: Function,
  Number: Number,
  String: String,
  Date: Date,
  RegExp: RegExp
};

module.exports = function defFunc(ajv) {
  /* istanbul ignore else */
  if (typeof Buffer != 'undefined')
    CONSTRUCTORS.Buffer = Buffer;

  defFunc.definition = {
    compile: function (schema) {
      if (typeof schema == 'string') {
        var Constructor = getConstructor(schema);
        return function (data) {
          return data instanceof Constructor;
        };
      }

      var constructors = schema.map(getConstructor);
      return function (data) {
        for (var i=0; i<constructors.length; i++)
          if (data instanceof constructors[i]) return true;
        return false;
      };
    },
    CONSTRUCTORS: CONSTRUCTORS,
    metaSchema: {
      anyOf: [
        { type: 'string' },
        {
          type: 'array',
          items: { type: 'string' }
        }
      ]
    }
  };

  ajv.addKeyword('instanceof', defFunc.definition);
  return ajv;

  function getConstructor(c) {
    var Constructor = CONSTRUCTORS[c];
    if (Constructor) return Constructor;
    throw new Error('invalid "instanceof" keyword value ' + c);
  }
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1537948515395, function(require, module, exports) {
'use strict';

module.exports = function defFunc(ajv) {
  defFunc.definition = {
    type: 'object',
    compile: function(schema) {
      var validate = ajv.compile(schema);
      return ajv._opts.allErrors ? vAllErrors : vBreakOnError;

      function vBreakOnError(data) {
        for (var prop in data) {
          if (!validate(prop)) {
            vBreakOnError.errors = validate.errors;
            addPropertyNameError(vBreakOnError.errors, prop);
            return false;
          }
        }
        return true;
      }

      function vAllErrors(data) {
        var errors = [];
        for (var prop in data) {
          if (!validate(prop)) {
            errors = errors.concat(validate.errors);
            addPropertyNameError(errors, prop);
          }
        }
        if (errors.length) vAllErrors.errors = errors;
        return errors.length == 0;
      }

      function addPropertyNameError(errors, propName) {
        errors.push({
          keyword: 'propertyNames',
          params: { propertyName: propName },
          message: 'should have valid property name of "' + propName + '"'
        });
      }
    },
    metaSchema: {
      $ref: ajv._opts.v5
            ? 'https://raw.githubusercontent.com/epoberezkin/ajv/master/lib/refs/json-schema-v5.json#'
            : 'http://json-schema.org/draft-04/schema#'
    },
    errors: true
  };

  ajv.addKeyword('propertyNames', defFunc.definition);
  return ajv;
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1537948515396, function(require, module, exports) {
'use strict';

module.exports = function defFunc(ajv) {
  defFunc.definition = {
    type: 'number',
    macro: function (schema, parentSchema) {
      var min = schema[0]
        , max = schema[1]
        , exclusive = parentSchema.exclusiveRange;

      validateRangeSchema(min, max, exclusive);

      return {
        minimum: min,
        exclusiveMinimum: exclusive,
        maximum: max,
        exclusiveMaximum: exclusive
      };
    },
    metaSchema: {
      type: 'array',
      minItems: 2,
      maxItems: 2,
      items: { type: 'number' }
    }
  };

  ajv.addKeyword('range', defFunc.definition);
  ajv.addKeyword('exclusiveRange');
  return ajv;

  function validateRangeSchema(min, max, exclusive) {
    if (exclusive !== undefined && typeof exclusive != 'boolean')
      throw new Error('Invalid schema for exclusiveRange keyword, should be boolean');

    if (min > max || (exclusive && min == max))
      throw new Error('There are no numbers in range');
  }
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1537948515397, function(require, module, exports) {
'use strict';

module.exports = function defFunc(ajv) {
  defFunc.definition = {
    type: 'string',
    inline: function (it, keyword, schema) {
      return getRegExp() + '.test(data' + (it.dataLevel || '') + ')';

      function getRegExp() {
        try {
          if (typeof schema == 'object')
            return new RegExp(schema.pattern, schema.flags);

          var rx = schema.match(/^\/(.*)\/([gimy]*)$/);
          if (rx) return new RegExp(rx[1], rx[2]);
          throw new Error('cannot parse string into RegExp');
        } catch(e) {
          console.error('regular expression', schema, 'is invalid');
          throw e;
        }
      }
    },
    metaSchema: {
      type: ['string', 'object'],
      properties: {
        pattern: { type: 'string' },
        flags: { type: 'string' }
      },
      required: ['pattern'],
      additionalProperties: false
    }
  };

  ajv.addKeyword('regexp', defFunc.definition);
  return ajv;
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1537948515398, function(require, module, exports) {
'use strict';

var KNOWN_TYPES = ['undefined', 'string', 'number', 'object', 'function', 'boolean', 'symbol'];

module.exports = function defFunc(ajv) {
  defFunc.definition = {
    inline: function (it, keyword, schema) {
      var data = 'data' + (it.dataLevel || '');
      if (typeof schema == 'string') return 'typeof ' + data + ' == "' + schema + '"';
      schema = 'validate.schema' + it.schemaPath + '.' + keyword;
      return schema + '.indexOf(typeof ' + data + ') >= 0';
    },
    metaSchema: {
      anyOf: [
        {
          type: 'string',
          enum: KNOWN_TYPES
        },
        {
          type: 'array',
          items: {
            type: 'string',
            enum: KNOWN_TYPES
          }
        }
      ]
    }
  };

  ajv.addKeyword('typeof', defFunc.definition);
  return ajv;
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1537948515399, function(require, module, exports) {
'use strict';

var sequences = {};

var DEFAULTS = {
  timestamp: function() { return Date.now(); },
  datetime: function() { return (new Date).toISOString(); },
  date: function() { return (new Date).toISOString().slice(0, 10); },
  time: function() { return (new Date).toISOString().slice(11); },
  random: function() { return Math.random(); },
  randomint: function (args) {
    var limit = args && args.max || 2;
    return function() { return Math.floor(Math.random() * limit); };
  },
  seq: function (args) {
    var name = args && args.name || '';
    sequences[name] = sequences[name] || 0;
    return function() { return sequences[name]++; };
  }
};

module.exports = function defFunc(ajv) {
  defFunc.definition = {
    compile: function (schema, parentSchema, it) {
      var funcs = {};

      for (var key in schema) {
        var d = schema[key];
        var func = getDefault(typeof d == 'string' ? d : d.func);
        funcs[key] = func.length ? func(d.args) : func;
      }

      return it.opts.useDefaults && !it.compositeRule
              ? assignDefaults
              : noop;

      function assignDefaults(data) {
        for (var prop in schema)
          if (data[prop] === undefined) data[prop] = funcs[prop]();
        return true;
      }

      function noop() { return true; }
    },
    DEFAULTS: DEFAULTS,
    metaSchema: {
      type: 'object',
      additionalProperties: {
        type: ['string', 'object'],
        additionalProperties: false,
        required: ['func', 'args'],
        properties: {
          func: { type: 'string' },
          args: { type: 'object' }
        }
      }
    }
  };

  ajv.addKeyword('dynamicDefaults', defFunc.definition);
  return ajv;

  function getDefault(d) {
    var def = DEFAULTS[d];
    if (def) return def;
    throw new Error('invalid "dynamicDefaults" keyword property value: ' + d);
  }
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1537948515400, function(require, module, exports) {
'use strict';

module.exports = function defFunc(ajv) {
  if (!ajv._opts.v5) console.warn('keywords if/then/else require v5 option');

  defFunc.definition = {
    macro: function (schema, parentSchema) {
      if (parentSchema.then === undefined)
        throw new Error('keyword "then" is absent');
      var cases = [ { 'if': schema, 'then': parentSchema.then } ];
      if (parentSchema.else !== undefined)
        cases[1] = { 'then': parentSchema.else };
      return { switch: cases };
    }
  };

  ajv.addKeyword('if', defFunc.definition);
  ajv.addKeyword('then');
  ajv.addKeyword('else');
  return ajv;
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1537948515401, function(require, module, exports) {
'use strict';

module.exports = function defFunc(ajv) {
  defFunc.definition = {
    type: 'object',
    macro: function (schema) {
      if (schema.length == 0) return {};
      if (schema.length == 1) return { not: { required: schema } };
      var schemas = schema.map(function (prop) {
        return { required: [prop] };
      });
      return { not: { anyOf: schemas } };
    },
    metaSchema: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  };

  ajv.addKeyword('prohibited', defFunc.definition);
  return ajv;
};


}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1537948515402, function(require, module, exports) {
'use strict';

module.exports = function defFunc(ajv) {
  defFunc.definition = {
    type: 'object',
    macro: function (schema) {
      var schemas = [];
      for (var pointer in schema)
        schemas.push(getSchema(pointer, schema[pointer]));
      return { 'allOf': schemas };
    },
    metaSchema: {
      type: 'object',
      patternProperties: {
        '^(\\/([^~\\/]|~0|~1)*)*(\\/)?$': {
          $ref: ajv._opts.v5
                ? 'https://raw.githubusercontent.com/epoberezkin/ajv/master/lib/refs/json-schema-v5.json#'
                : 'http://json-schema.org/draft-04/schema#'
        }
      },
      additionalProperties: false
    }
  };

  ajv.addKeyword('deepProperties', defFunc.definition);
  return ajv;
};


function getSchema(jsonPointer, schema) {
  var segments = jsonPointer.split('/');
  var rootSchema = {};
  var pointerSchema = rootSchema;
  for (var i=1; i<segments.length; i++) {
    var segment = segments[i];
    var isLast = i == segments.length - 1;
    segment = unescapeJsonPointer(segment);
    var properties = pointerSchema.properties = {};
    var items = undefined;
    if (/[0-9]+/.test(segment)) {
      var count = +segment;
      items = pointerSchema.items = [];
      while (count--) items.push({});
    }
    pointerSchema = isLast ? schema : {};
    properties[segment] = pointerSchema;
    if (items) items.push(pointerSchema);
  }
  return rootSchema;
}


function unescapeJsonPointer(str) {
  return str.replace(/~1/g, '/').replace(/~0/g, '~');
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1537948515403, function(require, module, exports) {
'use strict';

module.exports = function defFunc(ajv) {
  defFunc.definition = {
    type: 'object',
    inline: function (it, keyword, schema) {
      var expr = '';
      for (var i=0; i<schema.length; i++) {
        if (i) expr += ' && ';
        expr += '(' + getData(schema[i], it.dataLevel) + ' !== undefined)';
      }
      return expr;
    },
    metaSchema: {
      type: 'array',
      items: {
        type: 'string',
        format: 'json-pointer'
      }
    }
  };

  ajv.addKeyword('deepRequired', defFunc.definition);
  return ajv;
};


function getData(jsonPointer, lvl) {
  var data = 'data' + (lvl || '');
  if (!jsonPointer) return data;

  var expr = data;
  var segments = jsonPointer.split('/');
  for (var i=1; i<segments.length; i++) {
    var segment = segments[i];
    data += getProperty(unescapeJsonPointer(segment));
    expr += ' && ' + data;
  }
  return expr;
}


var IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
var INTEGER = /^[0-9]+$/;
var SINGLE_QUOTE = /'|\\/g;
function getProperty(key) {
  return INTEGER.test(key)
          ? '[' + key + ']'
          : IDENTIFIER.test(key)
            ? '.' + key
            : "['" + key.replace(SINGLE_QUOTE, '\\$&') + "']";
}


function unescapeJsonPointer(str) {
  return str.replace(/~1/g, '/').replace(/~0/g, '~');
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1537948515392);
})()
//# sourceMappingURL=index.js.map