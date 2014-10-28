/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */
function universalModule() {
  var $Object = Object;

function createClass(ctor, methods, staticMethods, superClass) {
  var proto;
  if (superClass) {
    var superProto = superClass.prototype;
    proto = $Object.create(superProto);
  } else {
    proto = ctor.prototype;
  }
  $Object.keys(methods).forEach(function (key) {
    proto[key] = methods[key];
  });
  superClass && $Object.keys(superClass).forEach(function (key) {
    ctor[key] = superClass[key];
  });
  $Object.keys(staticMethods).forEach(function (key) {
    ctor[key] = staticMethods[key];
  });
  proto.constructor = ctor;
  ctor.prototype = proto;
  return ctor;
}

function superCall(self, proto, name, args) {
  return $Object.getPrototypeOf(proto)[name].apply(self, args);
}

function defaultSuperCall(self, proto, args) {
  superCall(self, proto, 'constructor', args);
}

var $traceurRuntime = {};
$traceurRuntime.createClass = createClass;
$traceurRuntime.superCall = superCall;
$traceurRuntime.defaultSuperCall = defaultSuperCall;
"use strict";
function mixin(ctor, methods) {
  var proto = ctor.prototype;
  Object.keys(methods).forEach(function(key) {
    proto[key] = methods[key];
  });
  return ctor;
}
function is(first, second) {
  if (first === second) {
    return first !== 0 || second !== 0 || 1 / first === 1 / second;
  }
  if (first !== first) {
    return second !== second;
  }
  if (first && typeof first.equals === 'function') {
    return first.equals(second);
  }
  return false;
}
var DELETE = 'delete';
var SHIFT = 5;
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;
var NOT_SET = {};
var CHANGE_LENGTH = {value: false};
var DID_ALTER = {value: false};
function MakeRef(ref) {
  ref.value = false;
  return ref;
}
function SetRef(ref) {
  ref && (ref.value = true);
}
function OwnerID() {}
function arrCopy(arr, offset) {
  offset = offset || 0;
  var len = Math.max(0, arr.length - offset);
  var newArr = new Array(len);
  for (var ii = 0; ii < len; ii++) {
    newArr[ii] = arr[ii + offset];
  }
  return newArr;
}
function invariant(condition, error) {
  if (!condition)
    throw new Error(error);
}
function hash(o) {
  if (!o) {
    return 0;
  }
  if (o === true) {
    return 1;
  }
  var type = typeof o;
  if (type === 'number') {
    if ((o | 0) === o) {
      return o & HASH_MAX_VAL;
    }
    o = '' + o;
    type = 'string';
  }
  if (type === 'string') {
    return o.length > STRING_HASH_CACHE_MIN_STRLEN ? cachedHashString(o) : hashString(o);
  }
  if (o.hashCode) {
    return hash(typeof o.hashCode === 'function' ? o.hashCode() : o.hashCode);
  }
  return hashJSObj(o);
}
function cachedHashString(string) {
  var hash = stringHashCache[string];
  if (hash === undefined) {
    hash = hashString(string);
    if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
      STRING_HASH_CACHE_SIZE = 0;
      stringHashCache = {};
    }
    STRING_HASH_CACHE_SIZE++;
    stringHashCache[string] = hash;
  }
  return hash;
}
function hashString(string) {
  var hash = 0;
  for (var ii = 0; ii < string.length; ii++) {
    hash = (31 * hash + string.charCodeAt(ii)) & HASH_MAX_VAL;
  }
  return hash;
}
function hashJSObj(obj) {
  var hash = weakMap && weakMap.get(obj);
  if (hash)
    return hash;
  hash = obj[UID_HASH_KEY];
  if (hash)
    return hash;
  if (!canDefineProperty) {
    hash = obj.propertyIsEnumerable && obj.propertyIsEnumerable[UID_HASH_KEY];
    if (hash)
      return hash;
    hash = getIENodeHash(obj);
    if (hash)
      return hash;
  }
  if (Object.isExtensible && !Object.isExtensible(obj)) {
    throw new Error('Non-extensible objects are not allowed as keys.');
  }
  hash = ++objHashUID & HASH_MAX_VAL;
  if (weakMap) {
    weakMap.set(obj, hash);
  } else if (canDefineProperty) {
    Object.defineProperty(obj, UID_HASH_KEY, {
      'enumerable': false,
      'configurable': false,
      'writable': false,
      'value': hash
    });
  } else if (obj.propertyIsEnumerable && obj.propertyIsEnumerable === obj.constructor.prototype.propertyIsEnumerable) {
    obj.propertyIsEnumerable = function() {
      return this.constructor.prototype.propertyIsEnumerable.apply(this, arguments);
    };
    obj.propertyIsEnumerable[UID_HASH_KEY] = hash;
  } else if (obj.nodeType) {
    obj[UID_HASH_KEY] = hash;
  } else {
    throw new Error('Unable to set a non-enumerable property on object.');
  }
  return hash;
}
var canDefineProperty = (function() {
  try {
    Object.defineProperty({}, 'x', {});
    return true;
  } catch (e) {
    return false;
  }
}());
function getIENodeHash(node) {
  if (node && node.nodeType > 0) {
    switch (node.nodeType) {
      case 1:
        return node.uniqueID;
      case 9:
        return node.documentElement && node.documentElement.uniqueID;
    }
  }
}
var weakMap = typeof WeakMap === 'function' && new WeakMap();
var HASH_MAX_VAL = 0x7FFFFFFF;
var objHashUID = 0;
var UID_HASH_KEY = '__immutablehash__';
if (typeof Symbol === 'function') {
  UID_HASH_KEY = Symbol(UID_HASH_KEY);
}
var STRING_HASH_CACHE_MIN_STRLEN = 16;
var STRING_HASH_CACHE_MAX_SIZE = 255;
var STRING_HASH_CACHE_SIZE = 0;
var stringHashCache = {};
var ITERATE_KEYS = 0;
var ITERATE_VALUES = 1;
var ITERATE_ENTRIES = 2;
var FAUX_ITERATOR_SYMBOL = '@@iterator';
var REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;
var Iterator = function Iterator(next) {
  this.next = next;
};
($traceurRuntime.createClass)(Iterator, {toString: function() {
    return '[Iterator]';
  }}, {});
var IteratorPrototype = Iterator.prototype;
IteratorPrototype.inspect = IteratorPrototype.toSource = function() {
  return this.toString();
};
IteratorPrototype[ITERATOR_SYMBOL] = function() {
  return this;
};
function iteratorValue(type, k, v, iteratorResult) {
  var value = type === 0 ? k : type === 1 ? v : [k, v];
  iteratorResult ? (iteratorResult.value = value) : (iteratorResult = {
    value: value,
    done: false
  });
  return iteratorResult;
}
function iteratorDone() {
  return {
    value: undefined,
    done: true
  };
}
function hasIterator(maybeIterable) {
  return !!_iteratorFn(maybeIterable);
}
function isIterator(maybeIterator) {
  return maybeIterator && typeof maybeIterator.next === 'function';
}
function getIterator(iterable) {
  var iteratorFn = _iteratorFn(iterable);
  return iteratorFn && iteratorFn.call(iterable);
}
function _iteratorFn(iterable) {
  var iteratorFn = iterable && ((REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) || iterable[FAUX_ITERATOR_SYMBOL]);
  if (typeof iteratorFn === 'function') {
    return iteratorFn;
  }
}
var Iterable = function Iterable(value) {
  return arguments.length === 0 ? emptySequence() : isIterable(value) ? value : seqFromValue(value, false);
};
var $Iterable = Iterable;
($traceurRuntime.createClass)(Iterable, {
  toArray: function() {
    assertNotInfinite(this.size);
    var array = new Array(this.size || 0);
    this.valueSeq().__iterate((function(v, i) {
      array[i] = v;
    }));
    return array;
  },
  toIndexedSeq: function() {
    return new ToIndexedSequence(this);
  },
  toJS: function() {
    return this.toSeq().map((function(value) {
      return value && typeof value.toJS === 'function' ? value.toJS() : value;
    })).__toJS();
  },
  toKeyedSeq: function() {
    return new ToKeyedSequence(this, true);
  },
  toMap: function() {
    assertNotInfinite(this.size);
    return Map.from(this.toKeyedSeq());
  },
  toObject: function() {
    assertNotInfinite(this.size);
    var object = {};
    this.__iterate((function(v, k) {
      object[k] = v;
    }));
    return object;
  },
  toOrderedMap: function() {
    assertNotInfinite(this.size);
    return OrderedMap.from(this.toKeyedSeq());
  },
  toSet: function() {
    assertNotInfinite(this.size);
    return Set.from(this);
  },
  toSetSeq: function() {
    return new ToSetSequence(this, true);
  },
  toSeq: function() {
    return isIndexed(this) ? this.toIndexedSeq() : isKeyed(this) ? this.toKeyedSeq() : this.toSetSeq();
  },
  toStack: function() {
    assertNotInfinite(this.size);
    return Stack.from(this);
  },
  toVector: function() {
    assertNotInfinite(this.size);
    return Vector.from(this);
  },
  toString: function() {
    return this.__toString('Seq {', '}');
  },
  __toString: function(head, tail) {
    if (this.size === 0) {
      return head + tail;
    }
    return head + ' ' + this.toSeq().map(this.__toStringMapper).join(', ') + ' ' + tail;
  },
  concat: function() {
    for (var values = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      values[$__2] = arguments[$__2];
    return reify(this, concatFactory(this, values, true));
  },
  contains: function(searchValue) {
    return this.some((function(value) {
      return is(value, searchValue);
    }));
  },
  entries: function() {
    return this.__iterator(ITERATE_ENTRIES);
  },
  every: function(predicate, context) {
    var returnValue = true;
    this.__iterate((function(v, k, c) {
      if (!predicate.call(context, v, k, c)) {
        returnValue = false;
        return false;
      }
    }));
    return returnValue;
  },
  filter: function(predicate, context) {
    return reify(this, filterFactory(this, predicate, context, true));
  },
  find: function(predicate, context, notSetValue) {
    var foundValue = notSetValue;
    this.__iterate((function(v, k, c) {
      if (predicate.call(context, v, k, c)) {
        foundValue = v;
        return false;
      }
    }));
    return foundValue;
  },
  forEach: function(sideEffect, context) {
    return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
  },
  join: function(separator) {
    separator = separator !== undefined ? '' + separator : ',';
    var joined = '';
    var isFirst = true;
    this.__iterate((function(v) {
      isFirst ? (isFirst = false) : (joined += separator);
      joined += v !== null && v !== undefined ? v : '';
    }));
    return joined;
  },
  keys: function() {
    return this.__iterator(ITERATE_KEYS);
  },
  map: function(mapper, context) {
    return reify(this, mapFactory(this, mapper, context));
  },
  reduce: function(reducer, initialReduction, context) {
    var reduction;
    var useFirst;
    if (arguments.length < 2) {
      useFirst = true;
    } else {
      reduction = initialReduction;
    }
    this.__iterate((function(v, k, c) {
      if (useFirst) {
        useFirst = false;
        reduction = v;
      } else {
        reduction = reducer.call(context, reduction, v, k, c);
      }
    }));
    return reduction;
  },
  reduceRight: function(reducer, initialReduction, context) {
    var reversed = this.toKeyedSeq().reverse();
    return reversed.reduce.apply(reversed, arguments);
  },
  reverse: function() {
    return reify(this, reverseFactory(this, true));
  },
  slice: function(begin, end) {
    if (wholeSlice(begin, end, this.size)) {
      return this;
    }
    var resolvedBegin = resolveBegin(begin, this.size);
    var resolvedEnd = resolveEnd(end, this.size);
    if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
      return this.toSeq().cacheResult().slice(begin, end);
    }
    var skipped = resolvedBegin === 0 ? this : this.skip(resolvedBegin);
    return reify(this, resolvedEnd === undefined || resolvedEnd === this.size ? skipped : skipped.take(resolvedEnd - resolvedBegin));
  },
  some: function(predicate, context) {
    return !this.every(not(predicate), context);
  },
  sort: function(comparator) {
    return this.sortBy(valueMapper, comparator);
  },
  values: function() {
    return this.__iterator(ITERATE_VALUES);
  },
  butLast: function() {
    return this.slice(0, -1);
  },
  count: function(predicate, context) {
    if (predicate) {
      return this.toSeq().filter(predicate, context).count();
    }
    if (this.size === undefined) {
      this.size = this.__iterate(returnTrue);
    }
    return this.size;
  },
  countBy: function(grouper, context) {
    var $__0 = this;
    var groupMap = {};
    var groups = [];
    this.__iterate((function(v, k) {
      var g = grouper.call(context, v, k, $__0);
      var h = hash(g);
      if (!groupMap.hasOwnProperty(h)) {
        groupMap[h] = groups.length;
        groups.push([g, 1]);
      } else {
        groups[groupMap[h]][1]++;
      }
    }));
    return new ArraySequence(groups).fromEntrySeq();
  },
  equals: function(other) {
    if (this === other) {
      return true;
    }
    if (!other || typeof other.equals !== 'function') {
      return false;
    }
    if (this.size !== undefined && other.size !== undefined) {
      if (this.size !== other.size) {
        return false;
      }
      if (this.size === 0 && other.size === 0) {
        return true;
      }
    }
    if (this.__hash !== undefined && other.__hash !== undefined && this.__hash !== other.__hash) {
      return false;
    }
    return this.__deepEquals(other);
  },
  __deepEquals: function(other) {
    var entries = this.entries();
    return typeof other.every === 'function' && other.every((function(v, k) {
      var entry = entries.next().value;
      return entry && is(entry[0], k) && is(entry[1], v);
    })) && entries.next().done;
  },
  entrySeq: function() {
    var iterable = this;
    if (iterable._cache) {
      return new ArraySequence(iterable._cache);
    }
    var entriesSequence = iterable.toSeq().map(entryMapper).toIndexedSeq();
    entriesSequence.fromEntrySeq = (function() {
      return iterable.toSeq();
    });
    return entriesSequence;
  },
  filterNot: function(predicate, context) {
    return this.filter(not(predicate), context);
  },
  findKey: function(predicate, context) {
    var foundKey;
    this.__iterate((function(v, k, c) {
      if (predicate.call(context, v, k, c)) {
        foundKey = k;
        return false;
      }
    }));
    return foundKey;
  },
  findLast: function(predicate, context, notSetValue) {
    return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
  },
  findLastKey: function(predicate, context) {
    return this.toKeyedSeq().reverse().findKey(predicate, context);
  },
  first: function() {
    return this.find(returnTrue);
  },
  flatMap: function(mapper, context) {
    var $__0 = this;
    var coerce = iterableClass(this);
    return reify(this, this.toSeq().map((function(v, k) {
      return coerce(mapper.call(context, v, k, $__0));
    })).flatten(true));
  },
  flatten: function(depth) {
    return reify(this, flattenFactory(this, depth, true));
  },
  fromEntrySeq: function() {
    return new FromEntriesSequence(this);
  },
  get: function(searchKey, notSetValue) {
    return this.find((function(_, key) {
      return is(key, searchKey);
    }), undefined, notSetValue);
  },
  getIn: function(searchKeyPath, notSetValue) {
    var nested = this;
    if (searchKeyPath) {
      for (var ii = 0; ii < searchKeyPath.length; ii++) {
        nested = nested && nested.get ? nested.get(searchKeyPath[ii], NOT_SET) : NOT_SET;
        if (nested === NOT_SET) {
          return notSetValue;
        }
      }
    }
    return nested;
  },
  groupBy: function(grouper, context) {
    return groupByFactory(this, grouper, context, true);
  },
  has: function(searchKey) {
    return this.get(searchKey, NOT_SET) !== NOT_SET;
  },
  isSubset: function(seq) {
    seq = typeof seq.contains === 'function' ? seq : $Iterable(seq);
    return this.every((function(value) {
      return seq.contains(value);
    }));
  },
  isSuperset: function(seq) {
    return seq.isSubset(this);
  },
  keySeq: function() {
    return this.toSeq().map(keyMapper).toIndexedSeq();
  },
  last: function() {
    return this.toSeq().reverse().first();
  },
  max: function(comparator) {
    return this.maxBy(valueMapper, comparator);
  },
  maxBy: function(mapper, comparator) {
    comparator = comparator || defaultComparator;
    var seq = this;
    var maxEntry = seq.entrySeq().reduce((function(max, next) {
      return comparator(mapper(next[1], next[0], seq), mapper(max[1], max[0], seq)) > 0 ? next : max;
    }));
    return maxEntry && maxEntry[1];
  },
  min: function(comparator) {
    return this.minBy(valueMapper, comparator);
  },
  minBy: function(mapper, comparator) {
    comparator = comparator || defaultComparator;
    var seq = this;
    var minEntry = seq.entrySeq().reduce((function(min, next) {
      return comparator(mapper(next[1], next[0], seq), mapper(min[1], min[0], seq)) < 0 ? next : min;
    }));
    return minEntry && minEntry[1];
  },
  rest: function() {
    return this.slice(1);
  },
  skip: function(amount) {
    return reify(this, skipFactory(this, amount, true));
  },
  skipLast: function(amount) {
    return reify(this, this.toSeq().reverse().skip(amount).reverse());
  },
  skipWhile: function(predicate, context) {
    return reify(this, skipWhileFactory(this, predicate, context, true));
  },
  skipUntil: function(predicate, context) {
    return this.skipWhile(not(predicate), context);
  },
  sortBy: function(mapper, comparator) {
    comparator = comparator || defaultComparator;
    var seq = this;
    return reify(this, new ArraySequence(seq.entrySeq().entrySeq().toArray().sort((function(a, b) {
      return comparator(mapper(a[1][1], a[1][0], seq), mapper(b[1][1], b[1][0], seq)) || a[0] - b[0];
    }))).fromEntrySeq().valueSeq().fromEntrySeq());
  },
  take: function(amount) {
    return reify(this, takeFactory(this, amount));
  },
  takeLast: function(amount) {
    return reify(this, this.toSeq().reverse().take(amount).reverse());
  },
  takeWhile: function(predicate, context) {
    return reify(this, takeWhileFactory(this, predicate, context));
  },
  takeUntil: function(predicate, context) {
    return this.takeWhile(not(predicate), context);
  },
  valueSeq: function() {
    return this.toIndexedSeq();
  },
  hashCode: function() {
    return this.__hash || (this.__hash = this.size === Infinity ? 0 : this.reduce((function(h, v, k) {
      return (h + (hash(v) ^ (v === k ? 0 : hash(k)))) & HASH_MAX_VAL;
    }), 0));
  }
}, {});
var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
var IterablePrototype = Iterable.prototype;
IterablePrototype[IS_ITERABLE_SENTINEL] = true;
IterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.values;
IterablePrototype.toJSON = IterablePrototype.toJS;
IterablePrototype.__toJS = IterablePrototype.toArray;
IterablePrototype.__toStringMapper = quoteString;
IterablePrototype.inspect = IterablePrototype.toSource = function() {
  return this.toString();
};
IterablePrototype.chain = IterablePrototype.flatMap;
(function() {
  try {
    Object.defineProperty(IterablePrototype, 'length', {get: function() {
        var stack;
        try {
          throw new Error();
        } catch (error) {
          stack = error.stack;
        }
        if (stack.indexOf('_wrapObject') === -1) {
          console && console.warn && console.warn('iterable.length has been deprecated, ' + 'use iterable.size or iterable.count(). ' + 'This warning will become a silent error in a future version. ' + stack);
          return this.size;
        }
      }});
  } catch (e) {}
})();
var KeyedIterable = function KeyedIterable(seqable) {
  if (arguments.length === 0) {
    return emptySequence().toKeyedSeq();
  }
  if (!isIterable(seqable)) {
    seqable = seqFromValue(seqable, false);
  }
  return isKeyed(seqable) ? seqable : seqable.fromEntrySeq();
};
var $KeyedIterable = KeyedIterable;
($traceurRuntime.createClass)(KeyedIterable, {
  flip: function() {
    return reify(this, flipFactory(this));
  },
  mapEntries: function(mapper, context) {
    var $__0 = this;
    var iterations = 0;
    return reify(this, this.toSeq().map((function(v, k) {
      return mapper.call(context, [k, v], iterations++, $__0);
    })).fromEntrySeq());
  },
  mapKeys: function(mapper, context) {
    var $__0 = this;
    return reify(this, this.toSeq().flip().map((function(k, v) {
      return mapper.call(context, k, v, $__0);
    })).flip());
  }
}, {from: function(seqable) {
    return $KeyedIterable(iteratorFrom.apply(this, arguments));
  }}, Iterable);
var KeyedIterablePrototype = KeyedIterable.prototype;
KeyedIterablePrototype[IS_KEYED_SENTINEL] = true;
KeyedIterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.entries;
KeyedIterablePrototype.__toJS = IterablePrototype.toObject;
KeyedIterablePrototype.__toStringMapper = (function(v, k) {
  return k + ': ' + quoteString(v);
});
var SetIterable = function SetIterable(seqable) {
  if (arguments.length === 0) {
    return emptySequence().toSetSeq();
  }
  var isIter = isIterable(seqable);
  return isIter && !isAssociative(seqable) ? seqable : (isIter ? seqable : seqFromValue(seqable, false)).toSetSeq();
};
var $SetIterable = SetIterable;
($traceurRuntime.createClass)(SetIterable, {
  get: function(value, notSetValue) {
    return this.has(value) ? value : notSetValue;
  },
  contains: function(value) {
    return this.has(value);
  },
  keySeq: function() {
    return this.valueSeq();
  }
}, {from: function(seqable) {
    return $SetIterable(iteratorFrom.apply(this, arguments));
  }}, Iterable);
var SetIterablePrototype = SetIterable.prototype;
SetIterablePrototype.has = IterablePrototype.contains;
var IndexedIterable = function IndexedIterable(seqable) {
  return arguments.length === 0 ? emptySequence() : isIndexed(seqable) ? seqable : (isIterable(seqable) ? seqable : seqFromValue(seqable, false)).toIndexedSeq();
};
var $IndexedIterable = IndexedIterable;
($traceurRuntime.createClass)(IndexedIterable, {
  toKeyedSeq: function() {
    return new ToKeyedSequence(this, false);
  },
  toString: function() {
    return this.__toString('Seq [', ']');
  },
  concat: function() {
    for (var values = [],
        $__3 = 0; $__3 < arguments.length; $__3++)
      values[$__3] = arguments[$__3];
    return reify(this, concatFactory(this, values, false));
  },
  filter: function(predicate, context) {
    return reify(this, filterFactory(this, predicate, context, false));
  },
  findIndex: function(predicate, context) {
    var key = this.findKey(predicate, context);
    return key === undefined ? -1 : key;
  },
  indexOf: function(searchValue) {
    return this.findIndex((function(value) {
      return is(value, searchValue);
    }));
  },
  lastIndexOf: function(searchValue) {
    return this.toKeyedSeq().reverse().indexOf(searchValue);
  },
  reverse: function() {
    return reify(this, reverseFactory(this, false));
  },
  splice: function(index, removeNum) {
    var numArgs = arguments.length;
    removeNum = Math.max(removeNum | 0, 0);
    if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
      return this;
    }
    index = resolveBegin(index, this.size);
    var spliced = this.slice(0, index);
    return reify(this, numArgs === 1 ? spliced : spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum)));
  },
  findLastIndex: function(predicate, context) {
    return this.toKeyedSeq().reverse().findIndex(predicate, context);
  },
  first: function() {
    return this.get(0);
  },
  flatten: function(depth) {
    return reify(this, flattenFactory(this, depth, false));
  },
  get: function(index, notSetValue) {
    index = wrapIndex(this, index);
    return (index < 0 || (this.size === Infinity || (this.size !== undefined && index > this.size))) ? notSetValue : this.find((function(_, key) {
      return key === index;
    }), undefined, notSetValue);
  },
  groupBy: function(grouper, context) {
    return groupByFactory(this, grouper, context, false);
  },
  has: function(index) {
    index = wrapIndex(this, index);
    return index >= 0 && (this.size !== undefined ? this.size === Infinity || index < this.size : this.indexOf(index) !== -1);
  },
  interpose: function(separator) {
    return reify(this, interposeFactory(this, separator));
  },
  last: function() {
    return this.get(-1);
  },
  skip: function(amount) {
    var seq = this;
    var skipSeq = skipFactory(seq, amount, false);
    if (skipSeq !== seq) {
      skipSeq.get = function(index, notSetValue) {
        index = wrapIndex(this, index);
        return index >= 0 ? seq.get(index + amount, notSetValue) : notSetValue;
      };
    }
    return reify(this, skipSeq);
  },
  skipWhile: function(predicate, context) {
    return reify(this, skipWhileFactory(this, predicate, context, false));
  },
  sortBy: function(mapper, comparator) {
    comparator = comparator || defaultComparator;
    var seq = this;
    return reify(this, new ArraySequence(this.entrySeq().toArray().sort((function(a, b) {
      return comparator(mapper(a[1], a[0], seq), mapper(b[1], b[0], seq)) || a[0] - b[0];
    }))).fromEntrySeq().valueSeq());
  },
  take: function(amount) {
    var seq = this;
    var takeSeq = takeFactory(seq, amount);
    if (takeSeq !== seq) {
      takeSeq.get = function(index, notSetValue) {
        index = wrapIndex(this, index);
        return index >= 0 && index < amount ? seq.get(index, notSetValue) : notSetValue;
      };
    }
    return reify(this, takeSeq);
  }
}, {from: function(seqable) {
    return $IndexedIterable(iteratorFrom.apply(this, arguments));
  }}, Iterable);
var IndexedIterablePrototype = IndexedIterable.prototype;
IndexedIterablePrototype[IS_INDEXED_SENTINEL] = true;
var LazySequence = function LazySequence(value) {
  return Iterable.apply(this, arguments).toSeq();
};
($traceurRuntime.createClass)(LazySequence, {
  toSeq: function() {
    return this;
  },
  cacheResult: function() {
    if (!this._cache && this.__iterateUncached) {
      assertNotInfinite(this.size);
      this._cache = this.entrySeq().toArray();
      if (this.size === undefined) {
        this.size = this._cache.length;
      }
    }
    return this;
  },
  __iterate: function(fn, reverse) {
    return iterate(this, fn, reverse, true);
  },
  __iterator: function(type, reverse) {
    return iterator(this, type, reverse, true);
  }
}, {
  from: function(seqable) {
    return iteratorFrom.apply(this, arguments).toSeq();
  },
  of: function() {
    return this.from(arguments);
  }
}, Iterable);
var LazyKeyedSequence = function LazyKeyedSequence(value) {
  return KeyedIterable.apply(this, arguments).toSeq();
};
var $LazyKeyedSequence = LazyKeyedSequence;
($traceurRuntime.createClass)(LazyKeyedSequence, {
  toKeyedSeq: function() {
    return this;
  },
  toSeq: function() {
    return this;
  }
}, {
  empty: function() {
    return $LazyKeyedSequence();
  },
  from: function(seqable) {
    return $LazyKeyedSequence(iteratorFrom.apply(this, arguments));
  }
}, LazySequence);
mixin(LazyKeyedSequence, KeyedIterable.prototype);
var LazySetSequence = function LazySetSequence(value) {
  return SetIterable.apply(this, arguments).toSeq();
};
var $LazySetSequence = LazySetSequence;
($traceurRuntime.createClass)(LazySetSequence, {toSetSeq: function() {
    return this;
  }}, {
  empty: function() {
    return $LazySetSequence();
  },
  from: function(seqable) {
    return $LazySetSequence(iteratorFrom.apply(this, arguments));
  }
}, LazySequence);
mixin(LazySetSequence, SetIterable.prototype);
var LazyIndexedSequence = function LazyIndexedSequence(value) {
  return IndexedIterable.apply(this, arguments).toSeq();
};
var $LazyIndexedSequence = LazyIndexedSequence;
($traceurRuntime.createClass)(LazyIndexedSequence, {
  toIndexedSeq: function() {
    return this;
  },
  __iterate: function(fn, reverse) {
    return iterate(this, fn, reverse, false);
  },
  __iterator: function(type, reverse) {
    return iterator(this, type, reverse, false);
  }
}, {
  empty: function() {
    return $LazyIndexedSequence();
  },
  from: function(seqable) {
    return $LazyIndexedSequence(iteratorFrom.apply(this, arguments));
  }
}, LazySequence);
mixin(LazyIndexedSequence, IndexedIterable.prototype);
LazySequence.empty = emptySequence;
LazySequence.isLazy = isLazy;
LazySequence.Keyed = LazyKeyedSequence;
LazySequence.Set = LazySetSequence;
LazySequence.Indexed = LazyIndexedSequence;
var IS_LAZY_SENTINEL = '@@__IMMUTABLE_LAZY__@@';
LazySequence.prototype[IS_LAZY_SENTINEL] = true;
function isLazy(maybeLazy) {
  return !!(maybeLazy && maybeLazy[IS_LAZY_SENTINEL]);
}
var Collection = function Collection() {
  throw TypeError('Abstract');
};
($traceurRuntime.createClass)(Collection, {}, {
  empty: function() {
    return this(emptySequence());
  },
  of: function() {
    return this(arguments);
  }
}, Iterable);
var KeyedCollection = function KeyedCollection() {
  $traceurRuntime.defaultSuperCall(this, $KeyedCollection.prototype, arguments);
};
var $KeyedCollection = KeyedCollection;
($traceurRuntime.createClass)(KeyedCollection, {}, {from: function(seqable) {
    return this(LazyKeyedSequence.from.apply(this, arguments));
  }}, Collection);
mixin(KeyedCollection, KeyedIterable.prototype);
var SetCollection = function SetCollection() {
  $traceurRuntime.defaultSuperCall(this, $SetCollection.prototype, arguments);
};
var $SetCollection = SetCollection;
($traceurRuntime.createClass)(SetCollection, {}, {from: function(seqable) {
    return this(LazySetSequence.from.apply(this, arguments));
  }}, Collection);
mixin(SetCollection, SetIterable.prototype);
var IndexedCollection = function IndexedCollection() {
  $traceurRuntime.defaultSuperCall(this, $IndexedCollection.prototype, arguments);
};
var $IndexedCollection = IndexedCollection;
($traceurRuntime.createClass)(IndexedCollection, {}, {from: function(seqable) {
    return this(LazyIndexedSequence.from.apply(this, arguments));
  }}, Collection);
mixin(IndexedCollection, IndexedIterable.prototype);
Collection.Keyed = KeyedCollection;
Collection.Set = SetCollection;
Collection.Indexed = IndexedCollection;
function isIterable(maybeIterable) {
  return !!(maybeIterable && maybeIterable[IS_ITERABLE_SENTINEL]);
}
function isKeyed(maybeKeyed) {
  return !!(maybeKeyed && maybeKeyed[IS_KEYED_SENTINEL]);
}
function isIndexed(maybeIndexed) {
  return !!(maybeIndexed && maybeIndexed[IS_INDEXED_SENTINEL]);
}
function isAssociative(maybeAssociative) {
  return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
}
var EMPTY_SEQ;
function emptySequence() {
  return EMPTY_SEQ || (EMPTY_SEQ = new ArraySequence([]));
}
function iteratorFrom(iterLike) {
  var iter = isIterable(iterLike) ? iterLike : seqFromValue(iterLike, false);
  if (arguments.length > 1) {
    iter = iter.map(arguments[1], arguments.length > 2 ? arguments[2] : undefined);
  }
  return iter;
}
Iterable.from = iteratorFrom;
Iterable.isIterable = isIterable;
Iterable.isKeyed = isKeyed;
Iterable.isIndexed = isIndexed;
Iterable.isAssociative = isAssociative;
Iterable.Keyed = KeyedIterable;
Iterable.Set = SetIterable;
Iterable.Indexed = IndexedIterable;
var IteratorSequence = function IteratorSequence(iterator) {
  this._iterator = iterator;
  this._iteratorCache = [];
};
($traceurRuntime.createClass)(IteratorSequence, {
  __iterateUncached: function(fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterator = this._iterator;
    var cache = this._iteratorCache;
    var iterations = 0;
    while (iterations < cache.length) {
      if (fn(cache[iterations], iterations++, this) === false) {
        return iterations;
      }
    }
    var step;
    while (!(step = iterator.next()).done) {
      var val = step.value;
      cache[iterations] = val;
      if (fn(val, iterations++, this) === false) {
        break;
      }
    }
    return iterations;
  },
  __iteratorUncached: function(type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = this._iterator;
    var cache = this._iteratorCache;
    var iterations = 0;
    return new Iterator((function() {
      if (iterations >= cache.length) {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        cache[iterations] = step.value;
      }
      return iteratorValue(type, iterations, cache[iterations++]);
    }));
  }
}, {}, LazyIndexedSequence);
var IterableSequence = function IterableSequence(iterable) {
  this._iterable = iterable;
  this.size = iterable.length || iterable.size;
};
($traceurRuntime.createClass)(IterableSequence, {
  __iterateUncached: function(fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterable = this._iterable;
    var iterator = getIterator(iterable);
    var iterations = 0;
    if (isIterator(iterator)) {
      var step;
      while (!(step = iterator.next()).done) {
        if (fn(step.value, iterations++, this) === false) {
          break;
        }
      }
    }
    return iterations;
  },
  __iteratorUncached: function(type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterable = this._iterable;
    var iterator = getIterator(iterable);
    if (!isIterator(iterator)) {
      return new Iterator(iteratorDone);
    }
    var iterations = 0;
    return new Iterator((function() {
      var step = iterator.next();
      return step.done ? step : iteratorValue(type, iterations++, step.value);
    }));
  }
}, {}, LazyIndexedSequence);
var ObjectSequence = function ObjectSequence(object) {
  var keys = Object.keys(object);
  this._object = object;
  this._keys = keys;
  this.size = keys.length;
};
($traceurRuntime.createClass)(ObjectSequence, {
  get: function(key, notSetValue) {
    if (notSetValue !== undefined && !this.has(key)) {
      return notSetValue;
    }
    return this._object[key];
  },
  has: function(key) {
    return this._object.hasOwnProperty(key);
  },
  __iterate: function(fn, reverse) {
    var object = this._object;
    var keys = this._keys;
    var maxIndex = keys.length - 1;
    for (var ii = 0; ii <= maxIndex; ii++) {
      var key = keys[reverse ? maxIndex - ii : ii];
      if (fn(object[key], key, this) === false) {
        return ii + 1;
      }
    }
    return ii;
  },
  __iterator: function(type, reverse) {
    var object = this._object;
    var keys = this._keys;
    var maxIndex = keys.length - 1;
    var ii = 0;
    return new Iterator((function() {
      var key = keys[reverse ? maxIndex - ii : ii];
      return ii++ > maxIndex ? iteratorDone() : iteratorValue(type, key, object[key]);
    }));
  }
}, {}, LazyKeyedSequence);
var ArraySequence = function ArraySequence(array) {
  this._array = array;
  this.size = array.length;
};
($traceurRuntime.createClass)(ArraySequence, {
  get: function(index, notSetValue) {
    return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
  },
  __iterate: function(fn, reverse) {
    var array = this._array;
    var maxIndex = array.length - 1;
    for (var ii = 0; ii <= maxIndex; ii++) {
      if (fn(array[reverse ? maxIndex - ii : ii], ii, this) === false) {
        return ii + 1;
      }
    }
    return ii;
  },
  __iterator: function(type, reverse) {
    var array = this._array;
    var maxIndex = array.length - 1;
    var ii = 0;
    return new Iterator((function() {
      return ii > maxIndex ? iteratorDone() : iteratorValue(type, ii, array[reverse ? maxIndex - ii++ : ii++]);
    }));
  }
}, {}, LazyIndexedSequence);
function reify(kind, seq) {
  return isLazy(kind) ? seq : kind.constructor.from(seq);
}
function seqFromValue(value, maybeSingleton) {
  var seq = maybeSingleton && typeof value === 'string' ? new ArraySequence([value]) : isArrayLike(value) ? new ArraySequence(value) : isIterator(value) ? new IteratorSequence(value) : hasIterator(value) ? new IterableSequence(value) : (maybeSingleton ? isPlainObj(value) : typeof value === 'object') ? new ObjectSequence(value) : maybeSingleton ? new ArraySequence([value]) : undefined;
  if (!seq) {
    throw new TypeError('Expected iterable: ' + value);
  }
  return seq;
}
function isArrayLike(value) {
  return value && typeof value.length === 'number';
}
function isPlainObj(value) {
  return value && value.constructor === Object;
}
function wholeSlice(begin, end, size) {
  return (begin === 0 || (size !== undefined && begin <= -size)) && (end === undefined || (size !== undefined && end >= size));
}
function resolveBegin(begin, size) {
  return resolveIndex(begin, size, 0);
}
function resolveEnd(end, size) {
  return resolveIndex(end, size, size);
}
function resolveIndex(index, size, defaultIndex) {
  return index === undefined ? defaultIndex : index < 0 ? Math.max(0, size + index) : size === undefined ? index : Math.min(size, index);
}
function valueMapper(v) {
  return v;
}
function keyMapper(v, k) {
  return k;
}
function entryMapper(v, k) {
  return [k, v];
}
function returnTrue() {
  return true;
}
function not(predicate) {
  return function() {
    return !predicate.apply(this, arguments);
  };
}
function quoteString(value) {
  return typeof value === 'string' ? JSON.stringify(value) : value;
}
function defaultComparator(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
}
function wrapIndex(seq, index) {
  if (index < 0) {
    if (seq.size === undefined) {
      seq.cacheResult();
    }
    return seq.size + index;
  }
  return index;
}
function resolveSize(indexedSeq) {
  if (indexedSeq.size === undefined) {
    indexedSeq.cacheResult();
  }
  assertNotInfinite(indexedSeq.size);
  return indexedSeq.size;
}
function assertNotInfinite(size) {
  invariant(size !== Infinity, 'Cannot perform this action with an infinite sequence.');
}
function iterate(sequence, fn, reverse, useKeys) {
  var cache = sequence._cache;
  if (cache) {
    var maxIndex = cache.length - 1;
    for (var ii = 0; ii <= maxIndex; ii++) {
      var entry = cache[reverse ? maxIndex - ii : ii];
      if (fn(entry[1], useKeys ? entry[0] : ii, sequence) === false) {
        return ii + 1;
      }
    }
    return ii;
  }
  return sequence.__iterateUncached(fn, reverse);
}
function iterator(sequence, type, reverse, useKeys) {
  var cache = sequence._cache;
  if (cache) {
    var maxIndex = cache.length - 1;
    var ii = 0;
    return new Iterator((function() {
      var entry = cache[reverse ? maxIndex - ii : ii];
      return ii++ > maxIndex ? iteratorDone() : iteratorValue(type, useKeys ? entry[0] : ii - 1, entry[1]);
    }));
  }
  return sequence.__iteratorUncached(type, reverse);
}
var ToIndexedSequence = function ToIndexedSequence(seq) {
  this._seq = seq;
  this.size = seq.size;
};
($traceurRuntime.createClass)(ToIndexedSequence, {
  contains: function(value) {
    return this._seq.contains(value);
  },
  cacheResult: function() {
    this._seq.cacheResult();
    this.size = this._seq.size;
    return this;
  },
  __iterate: function(fn, reverse) {
    var $__0 = this;
    var iterations = 0;
    return this._seq.__iterate((function(v) {
      return fn(v, iterations++, $__0);
    }), reverse);
  },
  __iterator: function(type, reverse) {
    var iterator = this._seq.__iterator(ITERATE_VALUES, reverse);
    var iterations = 0;
    return new Iterator((function() {
      var step = iterator.next();
      return step.done ? step : iteratorValue(type, iterations++, step.value, step);
    }));
  }
}, {}, LazyIndexedSequence);
var ToKeyedSequence = function ToKeyedSequence(indexedSeq, useKeys) {
  this._seq = indexedSeq;
  this._useKeys = useKeys;
  this.size = indexedSeq.size;
};
($traceurRuntime.createClass)(ToKeyedSequence, {
  get: function(key, notSetValue) {
    return this._seq.get(key, notSetValue);
  },
  has: function(key) {
    return this._seq.has(key);
  },
  valueSeq: function() {
    return this._seq.valueSeq();
  },
  reverse: function() {
    var $__0 = this;
    var reversedSequence = reverseFactory(this, true);
    if (!this._useKeys) {
      reversedSequence.valueSeq = (function() {
        return $__0._seq.toSeq().reverse();
      });
    }
    return reversedSequence;
  },
  map: function(mapper, context) {
    var $__0 = this;
    var mappedSequence = mapFactory(this, mapper, context);
    if (!this._useKeys) {
      mappedSequence.valueSeq = (function() {
        return $__0._seq.toSeq().map(mapper, context);
      });
    }
    return mappedSequence;
  },
  cacheResult: function() {
    this._seq.cacheResult();
    this.size = this._seq.size;
    return this;
  },
  __iterate: function(fn, reverse) {
    var $__0 = this;
    var ii;
    return this._seq.__iterate(this._useKeys ? (function(v, k) {
      return fn(v, k, $__0);
    }) : ((ii = reverse ? resolveSize(this) : 0), (function(v) {
      return fn(v, reverse ? --ii : ii++, $__0);
    })), reverse);
  },
  __iterator: function(type, reverse) {
    if (this._useKeys) {
      return this._seq.__iterator(type, reverse);
    }
    var iterator = this._seq.__iterator(ITERATE_VALUES, reverse);
    var ii = reverse ? resolveSize(this) : 0;
    return new Iterator((function() {
      var step = iterator.next();
      return step.done ? step : iteratorValue(type, reverse ? --ii : ii++, step.value, step);
    }));
  }
}, {}, LazyKeyedSequence);
var ToSetSequence = function ToSetSequence(seq) {
  this._seq = seq;
  this.size = seq.size;
};
($traceurRuntime.createClass)(ToSetSequence, {
  has: function(key) {
    return this._seq.contains(key);
  },
  cacheResult: function() {
    this._seq.cacheResult();
    this.size = this._seq.size;
    return this;
  },
  __iterate: function(fn, reverse) {
    var $__0 = this;
    return this._seq.__iterate((function(v) {
      return fn(v, v, $__0);
    }), reverse);
  },
  __iterator: function(type, reverse) {
    var iterator = this._seq.__iterator(ITERATE_VALUES, reverse);
    return new Iterator((function() {
      var step = iterator.next();
      return step.done ? step : iteratorValue(type, step.value, step.value, step);
    }));
  }
}, {}, LazySetSequence);
var FromEntriesSequence = function FromEntriesSequence(entriesSeq) {
  this._seq = entriesSeq;
  this.size = entriesSeq.size;
};
($traceurRuntime.createClass)(FromEntriesSequence, {
  entrySeq: function() {
    return this._seq.toSeq();
  },
  cacheResult: function() {
    this._seq.cacheResult();
    this.size = this._seq.size;
    return this;
  },
  __iterate: function(fn, reverse) {
    var $__0 = this;
    return this._seq.__iterate((function(entry) {
      if (entry) {
        validateEntry(entry);
        return fn(entry[1], entry[0], $__0);
      }
    }), reverse);
  },
  __iterator: function(type, reverse) {
    var iterator = this._seq.__iterator(ITERATE_VALUES, reverse);
    return new Iterator((function() {
      while (true) {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        if (entry) {
          validateEntry(entry);
          return type === ITERATE_ENTRIES ? step : iteratorValue(type, entry[0], entry[1], step);
        }
      }
    }));
  }
}, {}, LazyKeyedSequence);
function validateEntry(entry) {
  if (entry !== Object(entry)) {
    throw new TypeError('Expected [K, V] tuple: ' + entry);
  }
}
function iterableClass(iterable) {
  return isKeyed(iterable) ? KeyedIterable : isIndexed(iterable) ? IndexedIterable : SetIterable;
}
function makeSequence(iterable) {
  return Object.create((isKeyed(iterable) ? LazyKeyedSequence : isIndexed(iterable) ? LazyIndexedSequence : LazySetSequence).prototype);
}
function flipFactory(iterable) {
  var flipSequence = makeSequence(iterable);
  flipSequence.size = iterable.size;
  flipSequence.flip = (function() {
    return iterable;
  });
  flipSequence.reverse = function() {
    var reversedSequence = iterable.reverse.apply(this);
    reversedSequence.flip = (function() {
      return iterable.reverse();
    });
    return reversedSequence;
  };
  flipSequence.has = (function(key) {
    return iterable.contains(key);
  });
  flipSequence.contains = (function(key) {
    return iterable.has(key);
  });
  flipSequence.__iterateUncached = function(fn, reverse) {
    var $__0 = this;
    return iterable.__iterate((function(v, k) {
      return fn(k, v, $__0) !== false;
    }), reverse);
  };
  flipSequence.__iteratorUncached = function(type, reverse) {
    if (type === ITERATE_ENTRIES) {
      var iterator = iterable.__iterator(type, reverse);
      return new Iterator((function() {
        var step = iterator.next();
        if (!step.done) {
          var k = step.value[0];
          step.value[0] = step.value[1];
          step.value[1] = k;
        }
        return step;
      }));
    }
    return iterable.__iterator(type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES, reverse);
  };
  return flipSequence;
}
function mapFactory(iterable, mapper, context) {
  var mappedSequence = makeSequence(iterable);
  mappedSequence.size = iterable.size;
  mappedSequence.has = (function(key) {
    return iterable.has(key);
  });
  mappedSequence.get = (function(key, notSetValue) {
    var v = iterable.get(key, NOT_SET);
    return v === NOT_SET ? notSetValue : mapper.call(context, v, key, iterable);
  });
  mappedSequence.__iterateUncached = function(fn, reverse) {
    var $__0 = this;
    return iterable.__iterate((function(v, k, c) {
      return fn(mapper.call(context, v, k, c), k, $__0) !== false;
    }), reverse);
  };
  mappedSequence.__iteratorUncached = function(type, reverse) {
    var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
    return new Iterator((function() {
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      var key = entry[0];
      return iteratorValue(type, key, mapper.call(context, entry[1], key, iterable), step);
    }));
  };
  return mappedSequence;
}
function reverseFactory(iterable, useKeys) {
  var reversedSequence = makeSequence(iterable);
  reversedSequence.size = iterable.size;
  reversedSequence.reverse = (function() {
    return iterable;
  });
  if (iterable.flip) {
    reversedSequence.flip = function() {
      var flipSequence = flipFactory(iterable);
      flipSequence.reverse = (function() {
        return iterable.flip();
      });
      return flipSequence;
    };
  }
  reversedSequence.get = (function(key, notSetValue) {
    return iterable.get(useKeys ? key : -1 - key, notSetValue);
  });
  reversedSequence.has = (function(key) {
    return iterable.has(useKeys ? key : -1 - key);
  });
  reversedSequence.contains = (function(value) {
    return iterable.contains(value);
  });
  reversedSequence.cacheResult = function() {
    iterable.cacheResult();
    this.size = iterable.size;
    return this;
  };
  reversedSequence.__iterate = function(fn, reverse) {
    var $__0 = this;
    return iterable.__iterate((function(v, k) {
      return fn(v, k, $__0);
    }), !reverse);
  };
  reversedSequence.__iterator = (function(type, reverse) {
    return iterable.__iterator(type, !reverse);
  });
  return reversedSequence;
}
function filterFactory(iterable, predicate, context, useKeys) {
  var filterSequence = makeSequence(iterable);
  if (useKeys) {
    filterSequence.has = (function(key) {
      var v = iterable.get(key, NOT_SET);
      return v !== NOT_SET && !!predicate.call(context, v, key, iterable);
    });
    filterSequence.get = (function(key, notSetValue) {
      var v = iterable.get(key, NOT_SET);
      return v !== NOT_SET && predicate.call(context, v, key, iterable) ? v : notSetValue;
    });
  }
  filterSequence.__iterateUncached = function(fn, reverse) {
    var $__0 = this;
    var iterations = 0;
    iterable.__iterate((function(v, k, c) {
      if (predicate.call(context, v, k, c)) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, $__0);
      }
    }), reverse);
    return iterations;
  };
  filterSequence.__iteratorUncached = function(type, reverse) {
    var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
    var iterations = 0;
    return new Iterator((function() {
      while (true) {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        var key = entry[0];
        var value = entry[1];
        if (predicate.call(context, value, key, iterable)) {
          return iteratorValue(type, useKeys ? key : iterations++, value, step);
        }
      }
    }));
  };
  return filterSequence;
}
function groupByFactory(seq, grouper, context, useKeys) {
  var groupMap = {};
  var groups = [];
  seq.__iterate((function(v, k) {
    var g = grouper.call(context, v, k, seq);
    var h = hash(g);
    var e = useKeys ? [k, v] : v;
    if (!groupMap.hasOwnProperty(h)) {
      groupMap[h] = groups.length;
      groups.push([g, [e]]);
    } else {
      groups[groupMap[h]][1].push(e);
    }
  }));
  return new ArraySequence(groups).fromEntrySeq().map(useKeys ? (function(group) {
    return new ArraySequence(group).fromEntrySeq();
  }) : (function(group) {
    return new ArraySequence(group);
  }));
}
function takeFactory(iterable, amount) {
  if (amount > iterable.size) {
    return iterable;
  }
  if (amount < 0) {
    amount = 0;
  }
  var takeSequence = makeSequence(iterable);
  takeSequence.size = iterable.size && Math.min(iterable.size, amount);
  takeSequence.__iterateUncached = function(fn, reverse) {
    var $__0 = this;
    if (amount === 0) {
      return 0;
    }
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterations = 0;
    iterable.__iterate((function(v, k) {
      return ++iterations && fn(v, k, $__0) !== false && iterations < amount;
    }));
    return iterations;
  };
  takeSequence.__iteratorUncached = function(type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = amount && iterable.__iterator(type, reverse);
    var iterations = 0;
    return new Iterator((function() {
      if (iterations++ > amount) {
        return iteratorDone();
      }
      return iterator.next();
    }));
  };
  return takeSequence;
}
function takeWhileFactory(iterable, predicate, context) {
  var takeSequence = makeSequence(iterable);
  takeSequence.__iterateUncached = function(fn, reverse) {
    var $__0 = this;
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterations = 0;
    iterable.__iterate((function(v, k, c) {
      return predicate.call(context, v, k, c) && ++iterations && fn(v, k, $__0);
    }));
    return iterations;
  };
  takeSequence.__iteratorUncached = function(type, reverse) {
    var $__0 = this;
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
    var iterating = true;
    return new Iterator((function() {
      if (!iterating) {
        return iteratorDone();
      }
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      var k = entry[0];
      var v = entry[1];
      if (!predicate.call(context, v, k, $__0)) {
        iterating = false;
        return iteratorDone();
      }
      return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
    }));
  };
  return takeSequence;
}
function skipFactory(iterable, amount, useKeys) {
  if (amount <= 0) {
    return iterable;
  }
  var skipSequence = makeSequence(iterable);
  skipSequence.size = iterable.size && Math.max(0, iterable.size - amount);
  skipSequence.__iterateUncached = function(fn, reverse) {
    var $__0 = this;
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var skipped = 0;
    var isSkipping = true;
    var iterations = 0;
    iterable.__iterate((function(v, k) {
      if (!(isSkipping && (isSkipping = skipped++ < amount))) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, $__0);
      }
    }));
    return iterations;
  };
  skipSequence.__iteratorUncached = function(type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = amount && iterable.__iterator(type, reverse);
    var skipped = 0;
    var iterations = 0;
    return new Iterator((function() {
      while (skipped < amount) {
        skipped++;
        iterator.next();
      }
      var step = iterator.next();
      if (useKeys || type === ITERATE_VALUES) {
        return step;
      } else if (type === ITERATE_KEYS) {
        return iteratorValue(type, iterations++, undefined, step);
      } else {
        return iteratorValue(type, iterations++, step.value[1], step);
      }
    }));
  };
  return skipSequence;
}
function skipWhileFactory(iterable, predicate, context, useKeys) {
  var skipSequence = makeSequence(iterable);
  skipSequence.__iterateUncached = function(fn, reverse) {
    var $__0 = this;
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var isSkipping = true;
    var iterations = 0;
    iterable.__iterate((function(v, k, c) {
      if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, $__0);
      }
    }));
    return iterations;
  };
  skipSequence.__iteratorUncached = function(type, reverse) {
    var $__0 = this;
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
    var skipping = true;
    var iterations = 0;
    return new Iterator((function() {
      var step,
          k,
          v;
      do {
        step = iterator.next();
        if (step.done) {
          if (useKeys || type === ITERATE_VALUES) {
            return step;
          } else if (type === ITERATE_KEYS) {
            return iteratorValue(type, iterations++, undefined, step);
          } else {
            return iteratorValue(type, iterations++, step.value[1], step);
          }
        }
        var entry = step.value;
        k = entry[0];
        v = entry[1];
        skipping && (skipping = predicate.call(context, v, k, $__0));
      } while (skipping);
      return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
    }));
  };
  return skipSequence;
}
function concatFactory(iterable, values, useKeys) {
  var isKeyedIter = isKeyed(iterable);
  var iters = new ArraySequence([iterable].concat(values)).map((function(v) {
    if (!isIterable(v)) {
      v = seqFromValue(v, true);
    }
    if (isKeyedIter) {
      v = KeyedIterable(v);
    }
    return v;
  }));
  if (isKeyedIter) {
    iters = iters.toKeyedSeq();
  } else if (!isIndexed(iterable)) {
    iters = iters.toSetSeq();
  }
  var flat = iters.flatten(true);
  flat.size = iters.reduce((function(sum, seq) {
    if (sum !== undefined) {
      var size = seq.size;
      if (size !== undefined) {
        return sum + size;
      }
    }
  }), 0);
  return flat;
}
function flattenFactory(iterable, depth, useKeys) {
  var flatSequence = makeSequence(iterable);
  flatSequence.__iterateUncached = function(fn, reverse) {
    var iterations = 0;
    var stopped = false;
    function flatDeep(seq, currentDepth) {
      var $__0 = this;
      seq.__iterate((function(v, k) {
        if ((!depth || currentDepth < depth) && isIterable(v)) {
          flatDeep(v, currentDepth + 1);
        } else if (fn(v, useKeys ? k : iterations++, $__0) === false) {
          stopped = true;
        }
        return !stopped;
      }), reverse);
    }
    flatDeep(iterable, 0);
    return iterations;
  };
  flatSequence.__iteratorUncached = function(type, reverse) {
    var iterator = iterable.__iterator(type, reverse);
    var stack = [];
    var iterations = 0;
    return new Iterator((function() {
      while (iterator) {
        var step = iterator.next();
        if (step.done !== false) {
          iterator = stack.pop();
          continue;
        }
        var v = step.value;
        if (type === ITERATE_ENTRIES) {
          v = v[1];
        }
        if ((!depth || stack.length < depth) && isIterable(v)) {
          stack.push(iterator);
          iterator = v.__iterator(type, reverse);
        } else {
          return useKeys ? step : iteratorValue(type, iterations++, v, step);
        }
      }
      return iteratorDone();
    }));
  };
  return flatSequence;
}
function interposeFactory(iterable, separator) {
  var interposedSequence = makeSequence(iterable);
  interposedSequence.size = iterable.size && iterable.size * 2 - 1;
  interposedSequence.__iterateUncached = function(fn, reverse) {
    var $__0 = this;
    var iterations = 0;
    iterable.__iterate((function(v, k) {
      return (!iterations || fn(separator, iterations++, $__0) !== false) && fn(v, iterations++, $__0) !== false;
    }), reverse);
    return iterations;
  };
  interposedSequence.__iteratorUncached = function(type, reverse) {
    var iterator = iterable.__iterator(ITERATE_VALUES, reverse);
    var iterations = 0;
    var step;
    return new Iterator((function() {
      if (!step || iterations % 2) {
        step = iterator.next();
        if (step.done) {
          return step;
        }
      }
      return iterations % 2 ? iteratorValue(type, iterations++, separator) : iteratorValue(type, iterations++, step.value, step);
    }));
  };
  return interposedSequence;
}
var Map = function Map(seqable) {
  return arguments.length === 0 ? $Map.empty() : seqable && seqable.constructor === $Map ? seqable : $Map.empty().merge(seqable);
};
var $Map = Map;
($traceurRuntime.createClass)(Map, {
  toString: function() {
    return this.__toString('Map {', '}');
  },
  get: function(k, notSetValue) {
    return this._root ? this._root.get(0, hash(k), k, notSetValue) : notSetValue;
  },
  set: function(k, v) {
    return updateMap(this, k, v);
  },
  setIn: function(keyPath, v) {
    invariant(keyPath.length > 0, 'Requires non-empty key path.');
    return this.updateIn(keyPath, (function() {
      return v;
    }));
  },
  remove: function(k) {
    return updateMap(this, k, NOT_SET);
  },
  removeIn: function(keyPath) {
    invariant(keyPath.length > 0, 'Requires non-empty key path.');
    return this.updateIn(keyPath, (function() {
      return NOT_SET;
    }));
  },
  update: function(k, notSetValue, updater) {
    return arguments.length === 1 ? k(this) : this.updateIn([k], notSetValue, updater);
  },
  updateIn: function(keyPath, notSetValue, updater) {
    if (!updater) {
      updater = notSetValue;
      notSetValue = undefined;
    }
    return keyPath.length === 0 ? updater(this) : updateInDeepMap(this, keyPath, notSetValue, updater, 0);
  },
  clear: function() {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = 0;
      this._root = null;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return $Map.empty();
  },
  merge: function() {
    return mergeIntoMapWith(this, undefined, arguments);
  },
  mergeWith: function(merger) {
    for (var seqs = [],
        $__4 = 1; $__4 < arguments.length; $__4++)
      seqs[$__4 - 1] = arguments[$__4];
    return mergeIntoMapWith(this, merger, seqs);
  },
  mergeDeep: function() {
    return mergeIntoMapWith(this, deepMerger(undefined), arguments);
  },
  mergeDeepWith: function(merger) {
    for (var seqs = [],
        $__5 = 1; $__5 < arguments.length; $__5++)
      seqs[$__5 - 1] = arguments[$__5];
    return mergeIntoMapWith(this, deepMerger(merger), seqs);
  },
  cursor: function(maybeKeyPath, onChange) {
    var keyPath = arguments.length === 0 || typeof maybeKeyPath === 'function' && (onChange = maybeKeyPath) ? [] : Array.isArray(maybeKeyPath) ? maybeKeyPath : [maybeKeyPath];
    return makeCursor(this, keyPath, onChange);
  },
  withMutations: function(fn) {
    var mutable = this.asMutable();
    fn(mutable);
    return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
  },
  asMutable: function() {
    return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
  },
  asImmutable: function() {
    return this.__ensureOwner();
  },
  wasAltered: function() {
    return this.__altered;
  },
  __iterator: function(type, reverse) {
    return new MapIterator(this, type, reverse);
  },
  __iterate: function(fn, reverse) {
    var $__0 = this;
    var iterations = 0;
    this._root && this._root.iterate((function(entry) {
      iterations++;
      return fn(entry[1], entry[0], $__0);
    }), reverse);
    return iterations;
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeMap(this.size, this._root, ownerID, this.__hash);
  }
}, {empty: function() {
    return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
  }}, KeyedCollection);
var MapPrototype = Map.prototype;
MapPrototype[DELETE] = MapPrototype.remove;
var BitmapIndexedNode = function BitmapIndexedNode(ownerID, bitmap, nodes) {
  this.ownerID = ownerID;
  this.bitmap = bitmap;
  this.nodes = nodes;
};
var $BitmapIndexedNode = BitmapIndexedNode;
($traceurRuntime.createClass)(BitmapIndexedNode, {
  get: function(shift, hash, key, notSetValue) {
    var bit = (1 << ((shift === 0 ? hash : hash >>> shift) & MASK));
    var bitmap = this.bitmap;
    return (bitmap & bit) === 0 ? notSetValue : this.nodes[popCount(bitmap & (bit - 1))].get(shift + SHIFT, hash, key, notSetValue);
  },
  update: function(ownerID, shift, hash, key, value, didChangeSize, didAlter) {
    var hashFrag = (shift === 0 ? hash : hash >>> shift) & MASK;
    var bit = 1 << hashFrag;
    var bitmap = this.bitmap;
    var exists = (bitmap & bit) !== 0;
    if (!exists && value === NOT_SET) {
      return this;
    }
    var idx = popCount(bitmap & (bit - 1));
    var nodes = this.nodes;
    var node = exists ? nodes[idx] : undefined;
    var newNode = updateNode(node, ownerID, shift + SHIFT, hash, key, value, didChangeSize, didAlter);
    if (newNode === node) {
      return this;
    }
    if (!exists && newNode && nodes.length >= MAX_BITMAP_SIZE) {
      return expandNodes(ownerID, nodes, bitmap, hashFrag, newNode);
    }
    if (exists && !newNode && nodes.length === 2 && isLeafNode(nodes[idx ^ 1])) {
      return nodes[idx ^ 1];
    }
    if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
      return newNode;
    }
    var isEditable = ownerID && ownerID === this.ownerID;
    var newBitmap = exists ? newNode ? bitmap : bitmap ^ bit : bitmap | bit;
    var newNodes = exists ? newNode ? setIn(nodes, idx, newNode, isEditable) : spliceOut(nodes, idx, isEditable) : spliceIn(nodes, idx, newNode, isEditable);
    if (isEditable) {
      this.bitmap = newBitmap;
      this.nodes = newNodes;
      return this;
    }
    return new $BitmapIndexedNode(ownerID, newBitmap, newNodes);
  },
  iterate: function(fn, reverse) {
    var nodes = this.nodes;
    for (var ii = 0,
        maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
      if (nodes[reverse ? maxIndex - ii : ii].iterate(fn, reverse) === false) {
        return false;
      }
    }
  }
}, {});
var ArrayNode = function ArrayNode(ownerID, count, nodes) {
  this.ownerID = ownerID;
  this.count = count;
  this.nodes = nodes;
};
var $ArrayNode = ArrayNode;
($traceurRuntime.createClass)(ArrayNode, {
  get: function(shift, hash, key, notSetValue) {
    var idx = (shift === 0 ? hash : hash >>> shift) & MASK;
    var node = this.nodes[idx];
    return node ? node.get(shift + SHIFT, hash, key, notSetValue) : notSetValue;
  },
  update: function(ownerID, shift, hash, key, value, didChangeSize, didAlter) {
    var idx = (shift === 0 ? hash : hash >>> shift) & MASK;
    var removed = value === NOT_SET;
    var nodes = this.nodes;
    var node = nodes[idx];
    if (removed && !node) {
      return this;
    }
    var newNode = updateNode(node, ownerID, shift + SHIFT, hash, key, value, didChangeSize, didAlter);
    if (newNode === node) {
      return this;
    }
    var newCount = this.count;
    if (!node) {
      newCount++;
    } else if (!newNode) {
      newCount--;
      if (newCount < MIN_ARRAY_SIZE) {
        return packNodes(ownerID, nodes, newCount, idx);
      }
    }
    var isEditable = ownerID && ownerID === this.ownerID;
    var newNodes = setIn(nodes, idx, newNode, isEditable);
    if (isEditable) {
      this.count = newCount;
      this.nodes = newNodes;
      return this;
    }
    return new $ArrayNode(ownerID, newCount, newNodes);
  },
  iterate: function(fn, reverse) {
    var nodes = this.nodes;
    for (var ii = 0,
        maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
      var node = nodes[reverse ? maxIndex - ii : ii];
      if (node && node.iterate(fn, reverse) === false) {
        return false;
      }
    }
  }
}, {});
var HashCollisionNode = function HashCollisionNode(ownerID, hash, entries) {
  this.ownerID = ownerID;
  this.hash = hash;
  this.entries = entries;
};
var $HashCollisionNode = HashCollisionNode;
($traceurRuntime.createClass)(HashCollisionNode, {
  get: function(shift, hash, key, notSetValue) {
    var entries = this.entries;
    for (var ii = 0,
        len = entries.length; ii < len; ii++) {
      if (is(key, entries[ii][0])) {
        return entries[ii][1];
      }
    }
    return notSetValue;
  },
  update: function(ownerID, shift, hash, key, value, didChangeSize, didAlter) {
    var removed = value === NOT_SET;
    if (hash !== this.hash) {
      if (removed) {
        return this;
      }
      SetRef(didAlter);
      SetRef(didChangeSize);
      return mergeIntoNode(this, ownerID, shift, hash, [key, value]);
    }
    var entries = this.entries;
    var idx = 0;
    for (var len = entries.length; idx < len; idx++) {
      if (is(key, entries[idx][0])) {
        break;
      }
    }
    var exists = idx < len;
    if (removed && !exists) {
      return this;
    }
    SetRef(didAlter);
    (removed || !exists) && SetRef(didChangeSize);
    if (removed && len === 2) {
      return new ValueNode(ownerID, this.hash, entries[idx ^ 1]);
    }
    var isEditable = ownerID && ownerID === this.ownerID;
    var newEntries = isEditable ? entries : arrCopy(entries);
    if (exists) {
      if (removed) {
        idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
      } else {
        newEntries[idx] = [key, value];
      }
    } else {
      newEntries.push([key, value]);
    }
    if (isEditable) {
      this.entries = newEntries;
      return this;
    }
    return new $HashCollisionNode(ownerID, this.hash, newEntries);
  },
  iterate: function(fn, reverse) {
    var entries = this.entries;
    for (var ii = 0,
        maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
      if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
        return false;
      }
    }
  }
}, {});
var ValueNode = function ValueNode(ownerID, hash, entry) {
  this.ownerID = ownerID;
  this.hash = hash;
  this.entry = entry;
};
var $ValueNode = ValueNode;
($traceurRuntime.createClass)(ValueNode, {
  get: function(shift, hash, key, notSetValue) {
    return is(key, this.entry[0]) ? this.entry[1] : notSetValue;
  },
  update: function(ownerID, shift, hash, key, value, didChangeSize, didAlter) {
    var removed = value === NOT_SET;
    var keyMatch = is(key, this.entry[0]);
    if (keyMatch ? value === this.entry[1] : removed) {
      return this;
    }
    SetRef(didAlter);
    if (removed) {
      SetRef(didChangeSize);
      return;
    }
    if (keyMatch) {
      if (ownerID && ownerID === this.ownerID) {
        this.entry[1] = value;
        return this;
      }
      return new $ValueNode(ownerID, hash, [key, value]);
    }
    SetRef(didChangeSize);
    return mergeIntoNode(this, ownerID, shift, hash, [key, value]);
  },
  iterate: function(fn) {
    return fn(this.entry);
  }
}, {});
var MapIterator = function MapIterator(map, type, reverse) {
  this._type = type;
  this._reverse = reverse;
  this._stack = map._root && mapIteratorFrame(map._root);
};
($traceurRuntime.createClass)(MapIterator, {next: function() {
    var type = this._type;
    var stack = this._stack;
    while (stack) {
      var node = stack.node;
      var index = stack.index++;
      var maxIndex;
      if (node.entry) {
        if (index === 0) {
          return mapIteratorValue(type, node.entry);
        }
      } else if (node.entries) {
        maxIndex = node.entries.length - 1;
        if (index <= maxIndex) {
          return mapIteratorValue(type, node.entries[this._reverse ? maxIndex - index : index]);
        }
      } else {
        maxIndex = node.nodes.length - 1;
        if (index <= maxIndex) {
          var subNode = node.nodes[this._reverse ? maxIndex - index : index];
          if (subNode) {
            if (subNode.entry) {
              return mapIteratorValue(type, subNode.entry);
            }
            stack = this._stack = mapIteratorFrame(subNode, stack);
          }
          continue;
        }
      }
      stack = this._stack = this._stack.__prev;
    }
    return iteratorDone();
  }}, {}, Iterator);
function mapIteratorValue(type, entry) {
  return iteratorValue(type, entry[0], entry[1]);
}
function mapIteratorFrame(node, prev) {
  return {
    node: node,
    index: 0,
    __prev: prev
  };
}
function makeMap(size, root, ownerID, hash) {
  var map = Object.create(MapPrototype);
  map.size = size;
  map._root = root;
  map.__ownerID = ownerID;
  map.__hash = hash;
  map.__altered = false;
  return map;
}
function updateMap(map, k, v) {
  var didChangeSize = MakeRef(CHANGE_LENGTH);
  var didAlter = MakeRef(DID_ALTER);
  var newRoot = updateNode(map._root, map.__ownerID, 0, hash(k), k, v, didChangeSize, didAlter);
  if (!didAlter.value) {
    return map;
  }
  var newSize = map.size + (didChangeSize.value ? v === NOT_SET ? -1 : 1 : 0);
  if (map.__ownerID) {
    map.size = newSize;
    map._root = newRoot;
    map.__hash = undefined;
    map.__altered = true;
    return map;
  }
  return newRoot ? makeMap(newSize, newRoot) : Map.empty();
}
function updateNode(node, ownerID, shift, hash, key, value, didChangeSize, didAlter) {
  if (!node) {
    if (value === NOT_SET) {
      return node;
    }
    SetRef(didAlter);
    SetRef(didChangeSize);
    return new ValueNode(ownerID, hash, [key, value]);
  }
  return node.update(ownerID, shift, hash, key, value, didChangeSize, didAlter);
}
function isLeafNode(node) {
  return node.constructor === ValueNode || node.constructor === HashCollisionNode;
}
function mergeIntoNode(node, ownerID, shift, hash, entry) {
  if (node.hash === hash) {
    return new HashCollisionNode(ownerID, hash, [node.entry, entry]);
  }
  var idx1 = (shift === 0 ? node.hash : node.hash >>> shift) & MASK;
  var idx2 = (shift === 0 ? hash : hash >>> shift) & MASK;
  var newNode;
  var nodes = idx1 === idx2 ? [mergeIntoNode(node, ownerID, shift + SHIFT, hash, entry)] : ((newNode = new ValueNode(ownerID, hash, entry)), idx1 < idx2 ? [node, newNode] : [newNode, node]);
  return new BitmapIndexedNode(ownerID, (1 << idx1) | (1 << idx2), nodes);
}
function packNodes(ownerID, nodes, count, excluding) {
  var bitmap = 0;
  var packedII = 0;
  var packedNodes = new Array(count);
  for (var ii = 0,
      bit = 1,
      len = nodes.length; ii < len; ii++, bit <<= 1) {
    var node = nodes[ii];
    if (node !== undefined && ii !== excluding) {
      bitmap |= bit;
      packedNodes[packedII++] = node;
    }
  }
  return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
}
function expandNodes(ownerID, nodes, bitmap, including, node) {
  var count = 0;
  var expandedNodes = new Array(SIZE);
  for (var ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
    expandedNodes[ii] = bitmap & 1 ? nodes[count++] : undefined;
  }
  expandedNodes[including] = node;
  return new ArrayNode(ownerID, count + 1, expandedNodes);
}
function mergeIntoMapWith(map, merger, seqable) {
  var seqs = [];
  for (var ii = 0; ii < seqable.length; ii++) {
    seqable[ii] && seqs.push(LazyKeyedSequence(seqable[ii]));
  }
  return mergeIntoCollectionWith(map, merger, seqs);
}
function deepMerger(merger) {
  return (function(existing, value) {
    return existing && existing.mergeDeepWith ? existing.mergeDeepWith(merger, value) : merger ? merger(existing, value) : value;
  });
}
function mergeIntoCollectionWith(collection, merger, seqs) {
  if (seqs.length === 0) {
    return collection;
  }
  return collection.withMutations((function(collection) {
    var mergeIntoMap = merger ? (function(value, key) {
      var existing = collection.get(key, NOT_SET);
      collection.set(key, existing === NOT_SET ? value : merger(existing, value));
    }) : (function(value, key) {
      collection.set(key, value);
    });
    for (var ii = 0; ii < seqs.length; ii++) {
      seqs[ii].forEach(mergeIntoMap);
    }
  }));
}
function updateInDeepMap(collection, keyPath, notSetValue, updater, offset) {
  invariant(!collection || collection.set, 'updateIn with invalid keyPath');
  var key = keyPath[offset];
  var existing = collection ? collection.get(key, NOT_SET) : NOT_SET;
  var existingValue = existing === NOT_SET ? undefined : existing;
  var value = offset === keyPath.length - 1 ? updater(existing === NOT_SET ? notSetValue : existing) : updateInDeepMap(existingValue, keyPath, notSetValue, updater, offset + 1);
  return value === existingValue ? collection : value === NOT_SET ? collection && collection.remove(key) : (collection || Map.empty()).set(key, value);
}
function popCount(x) {
  x = x - ((x >> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  x = x + (x >> 8);
  x = x + (x >> 16);
  return x & 0x7f;
}
function setIn(array, idx, val, canEdit) {
  var newArray = canEdit ? array : arrCopy(array);
  newArray[idx] = val;
  return newArray;
}
function spliceIn(array, idx, val, canEdit) {
  var newLen = array.length + 1;
  if (canEdit && idx + 1 === newLen) {
    array[idx] = val;
    return array;
  }
  var newArray = new Array(newLen);
  var after = 0;
  for (var ii = 0; ii < newLen; ii++) {
    if (ii === idx) {
      newArray[ii] = val;
      after = -1;
    } else {
      newArray[ii] = array[ii + after];
    }
  }
  return newArray;
}
function spliceOut(array, idx, canEdit) {
  var newLen = array.length - 1;
  if (canEdit && idx === newLen) {
    array.pop();
    return array;
  }
  var newArray = new Array(newLen);
  var after = 0;
  for (var ii = 0; ii < newLen; ii++) {
    if (ii === idx) {
      after = 1;
    }
    newArray[ii] = array[ii + after];
  }
  return newArray;
}
var MAX_BITMAP_SIZE = SIZE / 2;
var MIN_ARRAY_SIZE = SIZE / 4;
var EMPTY_MAP;
var Vector = function Vector(seqable) {
  return arguments.length === 0 ? $Vector.empty() : $Vector.from(seqable);
};
var $Vector = Vector;
($traceurRuntime.createClass)(Vector, {
  toString: function() {
    return this.__toString('Vector [', ']');
  },
  get: function(index, notSetValue) {
    index = wrapIndex(this, index);
    if (index < 0 || index >= this.size) {
      return notSetValue;
    }
    index += this._origin;
    var node = vectorNodeFor(this, index);
    return node && node.array[index & MASK];
  },
  set: function(index, value) {
    return updateVector(this, index, value);
  },
  remove: function(index) {
    return !this.has(index) ? this : index === 0 ? this.shift() : index === this.size - 1 ? this.pop() : this.splice(index, 1);
  },
  clear: function() {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = this._origin = this._capacity = 0;
      this._level = SHIFT;
      this._root = this._tail = null;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return $Vector.empty();
  },
  push: function() {
    var values = arguments;
    var oldSize = this.size;
    return this.withMutations((function(vect) {
      setVectorBounds(vect, 0, oldSize + values.length);
      for (var ii = 0; ii < values.length; ii++) {
        vect.set(oldSize + ii, values[ii]);
      }
    }));
  },
  pop: function() {
    return setVectorBounds(this, 0, -1);
  },
  unshift: function() {
    var values = arguments;
    return this.withMutations((function(vect) {
      setVectorBounds(vect, -values.length);
      for (var ii = 0; ii < values.length; ii++) {
        vect.set(ii, values[ii]);
      }
    }));
  },
  shift: function() {
    return setVectorBounds(this, 1);
  },
  merge: function() {
    return mergeIntoVectorWith(this, undefined, arguments);
  },
  mergeWith: function(merger) {
    for (var seqs = [],
        $__6 = 1; $__6 < arguments.length; $__6++)
      seqs[$__6 - 1] = arguments[$__6];
    return mergeIntoVectorWith(this, merger, seqs);
  },
  mergeDeep: function() {
    return mergeIntoVectorWith(this, deepMerger(undefined), arguments);
  },
  mergeDeepWith: function(merger) {
    for (var seqs = [],
        $__7 = 1; $__7 < arguments.length; $__7++)
      seqs[$__7 - 1] = arguments[$__7];
    return mergeIntoVectorWith(this, deepMerger(merger), seqs);
  },
  setSize: function(size) {
    return setVectorBounds(this, 0, size);
  },
  slice: function(begin, end) {
    var size = this.size;
    if (wholeSlice(begin, end, size)) {
      return this;
    }
    return setVectorBounds(this, resolveBegin(begin, size), resolveEnd(end, size));
  },
  __iterator: function(type, reverse) {
    return new VectorIterator(this, type, reverse);
  },
  __iterate: function(fn, reverse) {
    var $__0 = this;
    var iterations = 0;
    var eachFn = (function(v) {
      return fn(v, iterations++, $__0);
    });
    var tailOffset = getTailOffset(this._capacity);
    if (reverse) {
      iterateVNode(this._tail, 0, tailOffset - this._origin, this._capacity - this._origin, eachFn, reverse) && iterateVNode(this._root, this._level, -this._origin, tailOffset - this._origin, eachFn, reverse);
    } else {
      iterateVNode(this._root, this._level, -this._origin, tailOffset - this._origin, eachFn, reverse) && iterateVNode(this._tail, 0, tailOffset - this._origin, this._capacity - this._origin, eachFn, reverse);
    }
    return iterations;
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      this.__ownerID = ownerID;
      return this;
    }
    return makeVector(this._origin, this._capacity, this._level, this._root, this._tail, ownerID, this.__hash);
  }
}, {
  empty: function() {
    return EMPTY_VECT || (EMPTY_VECT = makeVector(0, 0, SHIFT));
  },
  from: function(seqable) {
    if (seqable && seqable.constructor === $Vector) {
      return seqable;
    }
    var isArray = Array.isArray(seqable);
    if (!isArray) {
      seqable = Iterable.from(seqable);
    }
    var size = isArray ? seqable.length : seqable.size;
    if (size === 0) {
      return $Vector.empty();
    }
    if (size > 0 && size < SIZE) {
      return makeVector(0, size, SHIFT, null, new VNode(isArray ? arrCopy(seqable) : seqable.toArray()));
    }
    return $Vector.empty().merge(seqable);
  }
}, IndexedCollection);
var VectorPrototype = Vector.prototype;
VectorPrototype[DELETE] = VectorPrototype.remove;
VectorPrototype.setIn = MapPrototype.setIn;
VectorPrototype.removeIn = MapPrototype.removeIn;
VectorPrototype.update = MapPrototype.update;
VectorPrototype.updateIn = MapPrototype.updateIn;
VectorPrototype.cursor = MapPrototype.cursor;
VectorPrototype.withMutations = MapPrototype.withMutations;
VectorPrototype.asMutable = MapPrototype.asMutable;
VectorPrototype.asImmutable = MapPrototype.asImmutable;
VectorPrototype.wasAltered = MapPrototype.wasAltered;
var VNode = function VNode(array, ownerID) {
  this.array = array;
  this.ownerID = ownerID;
};
var $VNode = VNode;
($traceurRuntime.createClass)(VNode, {
  removeBefore: function(ownerID, level, index) {
    if (index === level ? 1 << level : 0 || this.array.length === 0) {
      return this;
    }
    var originIndex = (index >>> level) & MASK;
    if (originIndex >= this.array.length) {
      return new $VNode([], ownerID);
    }
    var removingFirst = originIndex === 0;
    var newChild;
    if (level > 0) {
      var oldChild = this.array[originIndex];
      newChild = oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
      if (newChild === oldChild && removingFirst) {
        return this;
      }
    }
    if (removingFirst && !newChild) {
      return this;
    }
    var editable = editableVNode(this, ownerID);
    if (!removingFirst) {
      for (var ii = 0; ii < originIndex; ii++) {
        editable.array[ii] = undefined;
      }
    }
    if (newChild) {
      editable.array[originIndex] = newChild;
    }
    return editable;
  },
  removeAfter: function(ownerID, level, index) {
    if (index === level ? 1 << level : 0 || this.array.length === 0) {
      return this;
    }
    var sizeIndex = ((index - 1) >>> level) & MASK;
    if (sizeIndex >= this.array.length) {
      return this;
    }
    var removingLast = sizeIndex === this.array.length - 1;
    var newChild;
    if (level > 0) {
      var oldChild = this.array[sizeIndex];
      newChild = oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
      if (newChild === oldChild && removingLast) {
        return this;
      }
    }
    if (removingLast && !newChild) {
      return this;
    }
    var editable = editableVNode(this, ownerID);
    if (!removingLast) {
      editable.array.pop();
    }
    if (newChild) {
      editable.array[sizeIndex] = newChild;
    }
    return editable;
  }
}, {});
function iterateVNode(node, level, offset, max, fn, reverse) {
  var ii;
  var array = node && node.array;
  if (level === 0) {
    var from = offset < 0 ? -offset : 0;
    var to = max - offset;
    if (to > SIZE) {
      to = SIZE;
    }
    for (ii = from; ii < to; ii++) {
      if (fn(array && array[reverse ? from + to - 1 - ii : ii]) === false) {
        return false;
      }
    }
  } else {
    var step = 1 << level;
    var newLevel = level - SHIFT;
    for (ii = 0; ii <= MASK; ii++) {
      var levelIndex = reverse ? MASK - ii : ii;
      var newOffset = offset + (levelIndex << level);
      if (newOffset < max && newOffset + step > 0) {
        var nextNode = array && array[levelIndex];
        if (!iterateVNode(nextNode, newLevel, newOffset, max, fn, reverse)) {
          return false;
        }
      }
    }
  }
  return true;
}
var VectorIterator = function VectorIterator(vector, type, reverse) {
  this._type = type;
  this._reverse = !!reverse;
  this._maxIndex = vector.size - 1;
  var tailOffset = getTailOffset(vector._capacity);
  var rootStack = vectIteratorFrame(vector._root && vector._root.array, vector._level, -vector._origin, tailOffset - vector._origin - 1);
  var tailStack = vectIteratorFrame(vector._tail && vector._tail.array, 0, tailOffset - vector._origin, vector._capacity - vector._origin - 1);
  this._stack = reverse ? tailStack : rootStack;
  this._stack.__prev = reverse ? rootStack : tailStack;
};
($traceurRuntime.createClass)(VectorIterator, {next: function() {
    var stack = this._stack;
    while (stack) {
      var array = stack.array;
      var rawIndex = stack.index++;
      if (this._reverse) {
        rawIndex = MASK - rawIndex;
        if (rawIndex > stack.rawMax) {
          rawIndex = stack.rawMax;
          stack.index = SIZE - rawIndex;
        }
      }
      if (rawIndex >= 0 && rawIndex < SIZE && rawIndex <= stack.rawMax) {
        var value = array && array[rawIndex];
        if (stack.level === 0) {
          var type = this._type;
          var index;
          if (type !== 1) {
            index = stack.offset + (rawIndex << stack.level);
            if (this._reverse) {
              index = this._maxIndex - index;
            }
          }
          return iteratorValue(type, index, value);
        } else {
          this._stack = stack = vectIteratorFrame(value && value.array, stack.level - SHIFT, stack.offset + (rawIndex << stack.level), stack.max, stack);
        }
        continue;
      }
      stack = this._stack = this._stack.__prev;
    }
    return iteratorDone();
  }}, {}, Iterator);
function vectIteratorFrame(array, level, offset, max, prevFrame) {
  return {
    array: array,
    level: level,
    offset: offset,
    max: max,
    rawMax: ((max - offset) >> level),
    index: 0,
    __prev: prevFrame
  };
}
function makeVector(origin, capacity, level, root, tail, ownerID, hash) {
  var vect = Object.create(VectorPrototype);
  vect.size = capacity - origin;
  vect._origin = origin;
  vect._capacity = capacity;
  vect._level = level;
  vect._root = root;
  vect._tail = tail;
  vect.__ownerID = ownerID;
  vect.__hash = hash;
  vect.__altered = false;
  return vect;
}
function updateVector(vector, index, value) {
  index = wrapIndex(vector, index);
  if (index >= vector.size || index < 0) {
    return vector.withMutations((function(vect) {
      index < 0 ? setVectorBounds(vect, index).set(0, value) : setVectorBounds(vect, 0, index + 1).set(index, value);
    }));
  }
  index += vector._origin;
  var newTail = vector._tail;
  var newRoot = vector._root;
  var didAlter = MakeRef(DID_ALTER);
  if (index >= getTailOffset(vector._capacity)) {
    newTail = updateVNode(newTail, vector.__ownerID, 0, index, value, didAlter);
  } else {
    newRoot = updateVNode(newRoot, vector.__ownerID, vector._level, index, value, didAlter);
  }
  if (!didAlter.value) {
    return vector;
  }
  if (vector.__ownerID) {
    vector._root = newRoot;
    vector._tail = newTail;
    vector.__hash = undefined;
    vector.__altered = true;
    return vector;
  }
  return makeVector(vector._origin, vector._capacity, vector._level, newRoot, newTail);
}
function updateVNode(node, ownerID, level, index, value, didAlter) {
  var idx = (index >>> level) & MASK;
  var nodeHas = node && idx < node.array.length;
  if (!nodeHas && value === undefined) {
    return node;
  }
  var newNode;
  if (level > 0) {
    var lowerNode = node && node.array[idx];
    var newLowerNode = updateVNode(lowerNode, ownerID, level - SHIFT, index, value, didAlter);
    if (newLowerNode === lowerNode) {
      return node;
    }
    newNode = editableVNode(node, ownerID);
    newNode.array[idx] = newLowerNode;
    return newNode;
  }
  if (nodeHas && node.array[idx] === value) {
    return node;
  }
  SetRef(didAlter);
  newNode = editableVNode(node, ownerID);
  if (value === undefined && idx === newNode.array.length - 1) {
    newNode.array.pop();
  } else {
    newNode.array[idx] = value;
  }
  return newNode;
}
function editableVNode(node, ownerID) {
  if (ownerID && node && ownerID === node.ownerID) {
    return node;
  }
  return new VNode(node ? node.array.slice() : [], ownerID);
}
function vectorNodeFor(vector, rawIndex) {
  if (rawIndex >= getTailOffset(vector._capacity)) {
    return vector._tail;
  }
  if (rawIndex < 1 << (vector._level + SHIFT)) {
    var node = vector._root;
    var level = vector._level;
    while (node && level > 0) {
      node = node.array[(rawIndex >>> level) & MASK];
      level -= SHIFT;
    }
    return node;
  }
}
function setVectorBounds(vector, begin, end) {
  var owner = vector.__ownerID || new OwnerID();
  var oldOrigin = vector._origin;
  var oldCapacity = vector._capacity;
  var newOrigin = oldOrigin + begin;
  var newCapacity = end === undefined ? oldCapacity : end < 0 ? oldCapacity + end : oldOrigin + end;
  if (newOrigin === oldOrigin && newCapacity === oldCapacity) {
    return vector;
  }
  if (newOrigin >= newCapacity) {
    return vector.clear();
  }
  var newLevel = vector._level;
  var newRoot = vector._root;
  var offsetShift = 0;
  while (newOrigin + offsetShift < 0) {
    newRoot = new VNode(newRoot && newRoot.array.length ? [undefined, newRoot] : [], owner);
    newLevel += SHIFT;
    offsetShift += 1 << newLevel;
  }
  if (offsetShift) {
    newOrigin += offsetShift;
    oldOrigin += offsetShift;
    newCapacity += offsetShift;
    oldCapacity += offsetShift;
  }
  var oldTailOffset = getTailOffset(oldCapacity);
  var newTailOffset = getTailOffset(newCapacity);
  while (newTailOffset >= 1 << (newLevel + SHIFT)) {
    newRoot = new VNode(newRoot && newRoot.array.length ? [newRoot] : [], owner);
    newLevel += SHIFT;
  }
  var oldTail = vector._tail;
  var newTail = newTailOffset < oldTailOffset ? vectorNodeFor(vector, newCapacity - 1) : newTailOffset > oldTailOffset ? new VNode([], owner) : oldTail;
  if (oldTail && newTailOffset > oldTailOffset && newOrigin < oldCapacity && oldTail.array.length) {
    newRoot = editableVNode(newRoot, owner);
    var node = newRoot;
    for (var level = newLevel; level > SHIFT; level -= SHIFT) {
      var idx = (oldTailOffset >>> level) & MASK;
      node = node.array[idx] = editableVNode(node.array[idx], owner);
    }
    node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
  }
  if (newCapacity < oldCapacity) {
    newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);
  }
  if (newOrigin >= newTailOffset) {
    newOrigin -= newTailOffset;
    newCapacity -= newTailOffset;
    newLevel = SHIFT;
    newRoot = null;
    newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);
  } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
    offsetShift = 0;
    while (newRoot) {
      var beginIndex = (newOrigin >>> newLevel) & MASK;
      if (beginIndex !== (newTailOffset >>> newLevel) & MASK) {
        break;
      }
      if (beginIndex) {
        offsetShift += (1 << newLevel) * beginIndex;
      }
      newLevel -= SHIFT;
      newRoot = newRoot.array[beginIndex];
    }
    if (newRoot && newOrigin > oldOrigin) {
      newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
    }
    if (newRoot && newTailOffset < oldTailOffset) {
      newRoot = newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);
    }
    if (offsetShift) {
      newOrigin -= offsetShift;
      newCapacity -= offsetShift;
    }
  }
  if (vector.__ownerID) {
    vector.size = newCapacity - newOrigin;
    vector._origin = newOrigin;
    vector._capacity = newCapacity;
    vector._level = newLevel;
    vector._root = newRoot;
    vector._tail = newTail;
    vector.__hash = undefined;
    vector.__altered = true;
    return vector;
  }
  return makeVector(newOrigin, newCapacity, newLevel, newRoot, newTail);
}
function mergeIntoVectorWith(vector, merger, iterables) {
  var seqs = [];
  for (var ii = 0; ii < iterables.length; ii++) {
    var seq = iterables[ii];
    seq && seqs.push(Iterable(seq));
  }
  var maxSize = Math.max.apply(Math, seqs.map((function(s) {
    return s.size || 0;
  })));
  if (maxSize > vector.size) {
    vector = vector.setSize(maxSize);
  }
  return mergeIntoCollectionWith(vector, merger, seqs);
}
function getTailOffset(size) {
  return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
}
var EMPTY_VECT;
var Stack = function Stack(seqable) {
  return arguments.length === 0 ? $Stack.empty() : seqable && seqable.constructor === $Stack ? seqable : $Stack.empty().unshiftAll(seqable);
};
var $Stack = Stack;
($traceurRuntime.createClass)(Stack, {
  toString: function() {
    return this.__toString('Stack [', ']');
  },
  get: function(index, notSetValue) {
    var head = this._head;
    while (head && index--) {
      head = head.next;
    }
    return head ? head.value : notSetValue;
  },
  peek: function() {
    return this._head && this._head.value;
  },
  push: function() {
    if (arguments.length === 0) {
      return this;
    }
    var newSize = this.size + arguments.length;
    var head = this._head;
    for (var ii = arguments.length - 1; ii >= 0; ii--) {
      head = {
        value: arguments[ii],
        next: head
      };
    }
    if (this.__ownerID) {
      this.size = newSize;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return makeStack(newSize, head);
  },
  pushAll: function(seq) {
    seq = Iterable(seq);
    if (seq.size === 0) {
      return this;
    }
    var newSize = this.size;
    var head = this._head;
    seq.reverse().forEach((function(value) {
      newSize++;
      head = {
        value: value,
        next: head
      };
    }));
    if (this.__ownerID) {
      this.size = newSize;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return makeStack(newSize, head);
  },
  pop: function() {
    return this.slice(1);
  },
  unshift: function() {
    return this.push.apply(this, arguments);
  },
  unshiftAll: function(seq) {
    return this.pushAll(seq);
  },
  shift: function() {
    return this.pop.apply(this, arguments);
  },
  clear: function() {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = 0;
      this._head = undefined;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return $Stack.empty();
  },
  slice: function(begin, end) {
    if (wholeSlice(begin, end, this.size)) {
      return this;
    }
    var resolvedBegin = resolveBegin(begin, this.size);
    var resolvedEnd = resolveEnd(end, this.size);
    if (resolvedEnd !== this.size) {
      return $traceurRuntime.superCall(this, $Stack.prototype, "slice", [begin, end]);
    }
    var newSize = this.size - resolvedBegin;
    var head = this._head;
    while (resolvedBegin--) {
      head = head.next;
    }
    if (this.__ownerID) {
      this.size = newSize;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return makeStack(newSize, head);
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeStack(this.size, this._head, ownerID, this.__hash);
  },
  __iterate: function(fn, reverse) {
    if (reverse) {
      return this.toSeq().cacheResult.__iterate(fn, reverse);
    }
    var iterations = 0;
    var node = this._head;
    while (node) {
      if (fn(node.value, iterations++, this) === false) {
        break;
      }
      node = node.next;
    }
    return iterations;
  },
  __iterator: function(type, reverse) {
    if (reverse) {
      return this.toSeq().cacheResult().__iterator(type, reverse);
    }
    var iterations = 0;
    var node = this._head;
    return new Iterator((function() {
      if (node) {
        var value = node.value;
        node = node.next;
        return iteratorValue(type, iterations++, value);
      }
      return iteratorDone();
    }));
  }
}, {empty: function() {
    return EMPTY_STACK || (EMPTY_STACK = makeStack(0));
  }}, IndexedCollection);
var StackPrototype = Stack.prototype;
StackPrototype.withMutations = MapPrototype.withMutations;
StackPrototype.asMutable = MapPrototype.asMutable;
StackPrototype.asImmutable = MapPrototype.asImmutable;
StackPrototype.wasAltered = MapPrototype.wasAltered;
function makeStack(size, head, ownerID, hash) {
  var map = Object.create(StackPrototype);
  map.size = size;
  map._head = head;
  map.__ownerID = ownerID;
  map.__hash = hash;
  map.__altered = false;
  return map;
}
var EMPTY_STACK;
var Set = function Set(seqable) {
  return arguments.length === 0 ? $Set.empty() : seqable && seqable.constructor === $Set ? seqable : $Set.empty().union(seqable);
};
var $Set = Set;
($traceurRuntime.createClass)(Set, {
  has: function(value) {
    return this._map.has(value);
  },
  add: function(value) {
    var newMap = this._map.set(value, true);
    if (this.__ownerID) {
      this.size = newMap.size;
      this._map = newMap;
      return this;
    }
    return newMap === this._map ? this : makeSet(newMap);
  },
  remove: function(value) {
    var newMap = this._map.remove(value);
    if (this.__ownerID) {
      this.size = newMap.size;
      this._map = newMap;
      return this;
    }
    return newMap === this._map ? this : newMap.size === 0 ? $Set.empty() : makeSet(newMap);
  },
  clear: function() {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = 0;
      this._map.clear();
      return this;
    }
    return $Set.empty();
  },
  union: function() {
    var seqs = arguments;
    if (seqs.length === 0) {
      return this;
    }
    return this.withMutations((function(set) {
      for (var ii = 0; ii < seqs.length; ii++) {
        Iterable(seqs[ii]).forEach((function(value) {
          return set.add(value);
        }));
      }
    }));
  },
  intersect: function() {
    for (var seqs = [],
        $__8 = 0; $__8 < arguments.length; $__8++)
      seqs[$__8] = arguments[$__8];
    if (seqs.length === 0) {
      return this;
    }
    seqs = seqs.map((function(seq) {
      return Iterable(seq);
    }));
    var originalSet = this;
    return this.withMutations((function(set) {
      originalSet.forEach((function(value) {
        if (!seqs.every((function(seq) {
          return seq.contains(value);
        }))) {
          set.remove(value);
        }
      }));
    }));
  },
  subtract: function() {
    for (var seqs = [],
        $__9 = 0; $__9 < arguments.length; $__9++)
      seqs[$__9] = arguments[$__9];
    if (seqs.length === 0) {
      return this;
    }
    seqs = seqs.map((function(seq) {
      return Iterable(seq);
    }));
    var originalSet = this;
    return this.withMutations((function(set) {
      originalSet.forEach((function(value) {
        if (seqs.some((function(seq) {
          return seq.contains(value);
        }))) {
          set.remove(value);
        }
      }));
    }));
  },
  merge: function() {
    return this.union.apply(this, arguments);
  },
  mergeWith: function(merger) {
    for (var seqs = [],
        $__10 = 1; $__10 < arguments.length; $__10++)
      seqs[$__10 - 1] = arguments[$__10];
    return this.union.apply(this, seqs);
  },
  wasAltered: function() {
    return this._map.wasAltered();
  },
  __iterate: function(fn, reverse) {
    var $__0 = this;
    return this._map.__iterate((function(_, k) {
      return fn(k, k, $__0);
    }), reverse);
  },
  __iterator: function(type, reverse) {
    return this._map.map((function(_, k) {
      return k;
    })).__iterator(type, reverse);
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this._map = newMap;
      return this;
    }
    return makeSet(newMap, ownerID);
  }
}, {
  empty: function() {
    return EMPTY_SET || (EMPTY_SET = makeSet(Map.empty()));
  },
  fromKeys: function(seqable) {
    return $Set(Iterable(seqable).flip());
  }
}, SetCollection);
var SetPrototype = Set.prototype;
SetPrototype[DELETE] = SetPrototype.remove;
SetPrototype.mergeDeep = SetPrototype.merge;
SetPrototype.mergeDeepWith = SetPrototype.mergeWith;
SetPrototype.withMutations = MapPrototype.withMutations;
SetPrototype.asMutable = MapPrototype.asMutable;
SetPrototype.asImmutable = MapPrototype.asImmutable;
function makeSet(map, ownerID) {
  var set = Object.create(SetPrototype);
  set.size = map ? map.size : 0;
  set._map = map;
  set.__ownerID = ownerID;
  return set;
}
var EMPTY_SET;
var OrderedMap = function OrderedMap(seqable) {
  return arguments.length === 0 ? $OrderedMap.empty() : seqable && seqable.constructor === $OrderedMap ? seqable : $OrderedMap.empty().merge(seqable);
};
var $OrderedMap = OrderedMap;
($traceurRuntime.createClass)(OrderedMap, {
  toString: function() {
    return this.__toString('OrderedMap {', '}');
  },
  get: function(k, notSetValue) {
    var index = this._map.get(k);
    return index !== undefined ? this._vector.get(index)[1] : notSetValue;
  },
  clear: function() {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = 0;
      this._map.clear();
      this._vector.clear();
      return this;
    }
    return $OrderedMap.empty();
  },
  set: function(k, v) {
    return updateOrderedMap(this, k, v);
  },
  remove: function(k) {
    return updateOrderedMap(this, k, NOT_SET);
  },
  wasAltered: function() {
    return this._map.wasAltered() || this._vector.wasAltered();
  },
  __iterate: function(fn, reverse) {
    var $__0 = this;
    return this._vector.__iterate((function(entry) {
      return entry && fn(entry[1], entry[0], $__0);
    }), reverse);
  },
  __iterator: function(type, reverse) {
    return this._vector.fromEntrySeq().__iterator(type, reverse);
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map.__ensureOwner(ownerID);
    var newVector = this._vector.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this._map = newMap;
      this._vector = newVector;
      return this;
    }
    return makeOrderedMap(newMap, newVector, ownerID, this.__hash);
  }
}, {empty: function() {
    return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(Map.empty(), Vector.empty()));
  }}, Map);
OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;
function makeOrderedMap(map, vector, ownerID, hash) {
  var omap = Object.create(OrderedMap.prototype);
  omap.size = map ? map.size : 0;
  omap._map = map;
  omap._vector = vector;
  omap.__ownerID = ownerID;
  omap.__hash = hash;
  return omap;
}
function updateOrderedMap(omap, k, v) {
  var map = omap._map;
  var vector = omap._vector;
  var i = map.get(k);
  var has = i !== undefined;
  var removed = v === NOT_SET;
  if ((!has && removed) || (has && v === vector.get(i)[1])) {
    return omap;
  }
  if (!has) {
    i = vector.size;
  }
  var newMap = removed ? map.remove(k) : has ? map : map.set(k, i);
  var newVector = removed ? vector.remove(i) : vector.set(i, [k, v]);
  if (omap.__ownerID) {
    omap.size = newMap.size;
    omap._map = newMap;
    omap._vector = newVector;
    omap.__hash = undefined;
    return omap;
  }
  return makeOrderedMap(newMap, newVector);
}
var EMPTY_ORDERED_MAP;
var Record = function Record(defaultValues, name) {
  var RecordType = function(values) {
    if (!(this instanceof RecordType)) {
      return new RecordType(values);
    }
    this._map = Map(values);
  };
  var keys = Object.keys(defaultValues);
  var RecordTypePrototype = RecordType.prototype = Object.create(RecordPrototype);
  RecordTypePrototype.constructor = RecordType;
  name && (RecordTypePrototype._name = name);
  RecordTypePrototype._defaultValues = defaultValues;
  RecordTypePrototype._keys = keys;
  RecordTypePrototype.size = keys.length;
  try {
    Iterable(defaultValues).forEach((function(_, key) {
      Object.defineProperty(RecordType.prototype, key, {
        get: function() {
          return this.get(key);
        },
        set: function(value) {
          invariant(this.__ownerID, 'Cannot set on an immutable record.');
          this.set(key, value);
        }
      });
    }));
  } catch (error) {}
  return RecordType;
};
($traceurRuntime.createClass)(Record, {
  toString: function() {
    return this.__toString(this._name + ' {', '}');
  },
  has: function(k) {
    return this._defaultValues.hasOwnProperty(k);
  },
  get: function(k, notSetValue) {
    if (notSetValue !== undefined && !this.has(k)) {
      return notSetValue;
    }
    return this._map.get(k, this._defaultValues[k]);
  },
  clear: function() {
    if (this.__ownerID) {
      this._map.clear();
      return this;
    }
    var SuperRecord = Object.getPrototypeOf(this).constructor;
    return SuperRecord._empty || (SuperRecord._empty = makeRecord(this, Map.empty()));
  },
  set: function(k, v) {
    if (!this.has(k)) {
      throw new Error('Cannot set unknown key "' + k + '" on ' + this._name);
    }
    var newMap = this._map.set(k, v);
    if (this.__ownerID || newMap === this._map) {
      return this;
    }
    return makeRecord(this, newMap);
  },
  remove: function(k) {
    if (!this.has(k)) {
      return this;
    }
    var newMap = this._map.remove(k);
    if (this.__ownerID || newMap === this._map) {
      return this;
    }
    return makeRecord(this, newMap);
  },
  keys: function() {
    return this._map.keys();
  },
  values: function() {
    return this._map.values();
  },
  entries: function() {
    return this._map.entries();
  },
  wasAltered: function() {
    return this._map.wasAltered();
  },
  __iterator: function(type, reverse) {
    return this._map.__iterator(type, reverse);
  },
  __iterate: function(fn, reverse) {
    var $__0 = this;
    return Iterable(this._defaultValues).map((function(_, k) {
      return $__0.get(k);
    })).__iterate(fn, reverse);
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map && this._map.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this._map = newMap;
      return this;
    }
    return makeRecord(this, newMap, ownerID);
  }
}, {}, KeyedCollection);
var RecordPrototype = Record.prototype;
RecordPrototype._name = 'Record';
RecordPrototype[DELETE] = RecordPrototype.remove;
RecordPrototype.merge = MapPrototype.merge;
RecordPrototype.mergeWith = MapPrototype.mergeWith;
RecordPrototype.mergeDeep = MapPrototype.mergeDeep;
RecordPrototype.mergeDeepWith = MapPrototype.mergeDeepWith;
RecordPrototype.update = MapPrototype.update;
RecordPrototype.updateIn = MapPrototype.updateIn;
RecordPrototype.cursor = MapPrototype.cursor;
RecordPrototype.withMutations = MapPrototype.withMutations;
RecordPrototype.asMutable = MapPrototype.asMutable;
RecordPrototype.asImmutable = MapPrototype.asImmutable;
function makeRecord(likeRecord, map, ownerID) {
  var record = Object.create(Object.getPrototypeOf(likeRecord));
  record._map = map;
  record.__ownerID = ownerID;
  return record;
}
var Range = function Range(start, end, step) {
  if (!(this instanceof $Range)) {
    return new $Range(start, end, step);
  }
  invariant(step !== 0, 'Cannot step a Range by 0');
  start = start || 0;
  if (end === undefined) {
    end = Infinity;
  }
  if (start === end && __EMPTY_RANGE) {
    return __EMPTY_RANGE;
  }
  step = step === undefined ? 1 : Math.abs(step);
  if (end < start) {
    step = -step;
  }
  this._start = start;
  this._end = end;
  this._step = step;
  this.size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
};
var $Range = Range;
($traceurRuntime.createClass)(Range, {
  toString: function() {
    if (this.size === 0) {
      return 'Range []';
    }
    return 'Range [ ' + this._start + '...' + this._end + (this._step > 1 ? ' by ' + this._step : '') + ' ]';
  },
  get: function(index, notSetValue) {
    return this.has(index) ? this._start + wrapIndex(this, index) * this._step : notSetValue;
  },
  contains: function(searchValue) {
    var possibleIndex = (searchValue - this._start) / this._step;
    return possibleIndex >= 0 && possibleIndex < this.size && possibleIndex === Math.floor(possibleIndex);
  },
  slice: function(begin, end) {
    if (wholeSlice(begin, end, this.size)) {
      return this;
    }
    begin = resolveBegin(begin, this.size);
    end = resolveEnd(end, this.size);
    if (end <= begin) {
      return __EMPTY_RANGE;
    }
    return new $Range(this.get(begin, this._end), this.get(end, this._end), this._step);
  },
  indexOf: function(searchValue) {
    var offsetValue = searchValue - this._start;
    if (offsetValue % this._step === 0) {
      var index = offsetValue / this._step;
      if (index >= 0 && index < this.size) {
        return index;
      }
    }
    return -1;
  },
  lastIndexOf: function(searchValue) {
    return this.indexOf(searchValue);
  },
  take: function(amount) {
    return this.slice(0, Math.max(0, amount));
  },
  skip: function(amount) {
    return this.slice(Math.max(0, amount));
  },
  __iterate: function(fn, reverse) {
    var maxIndex = this.size - 1;
    var step = this._step;
    var value = reverse ? this._start + maxIndex * step : this._start;
    for (var ii = 0; ii <= maxIndex; ii++) {
      if (fn(value, ii, this) === false) {
        return ii + 1;
      }
      value += reverse ? -step : step;
    }
    return ii;
  },
  __iterator: function(type, reverse) {
    var maxIndex = this.size - 1;
    var step = this._step;
    var value = reverse ? this._start + maxIndex * step : this._start;
    var ii = 0;
    return new Iterator((function() {
      var v = value;
      value += reverse ? -step : step;
      return ii > maxIndex ? iteratorDone() : iteratorValue(type, ii++, v);
    }));
  },
  __deepEquals: function(other) {
    return other instanceof $Range ? this._start === other._start && this._end === other._end && this._step === other._step : $traceurRuntime.superCall(this, $Range.prototype, "__deepEquals", [other]);
  }
}, {}, LazyIndexedSequence);
var RangePrototype = Range.prototype;
RangePrototype.__toJS = RangePrototype.toArray;
RangePrototype.first = VectorPrototype.first;
RangePrototype.last = VectorPrototype.last;
var __EMPTY_RANGE = Range(0, 0);
var Repeat = function Repeat(value, times) {
  if (times <= 0 && EMPTY_REPEAT) {
    return EMPTY_REPEAT;
  }
  if (!(this instanceof $Repeat)) {
    return new $Repeat(value, times);
  }
  this._value = value;
  this.size = times === undefined ? Infinity : Math.max(0, times);
  if (this.size === 0) {
    EMPTY_REPEAT = this;
  }
};
var $Repeat = Repeat;
($traceurRuntime.createClass)(Repeat, {
  toString: function() {
    if (this.size === 0) {
      return 'Repeat []';
    }
    return 'Repeat [ ' + this._value + ' ' + this.size + ' times ]';
  },
  get: function(index, notSetValue) {
    return this.has(index) ? this._value : notSetValue;
  },
  contains: function(searchValue) {
    return is(this._value, searchValue);
  },
  slice: function(begin, end) {
    var size = this.size;
    return wholeSlice(begin, end, size) ? this : new $Repeat(this._value, resolveEnd(end, size) - resolveBegin(begin, size));
  },
  reverse: function() {
    return this;
  },
  indexOf: function(searchValue) {
    if (is(this._value, searchValue)) {
      return 0;
    }
    return -1;
  },
  lastIndexOf: function(searchValue) {
    if (is(this._value, searchValue)) {
      return this.size;
    }
    return -1;
  },
  __iterate: function(fn, reverse) {
    for (var ii = 0; ii < this.size; ii++) {
      if (fn(this._value, ii, this) === false) {
        return ii + 1;
      }
    }
    return ii;
  },
  __iterator: function(type, reverse) {
    var $__0 = this;
    var ii = 0;
    return new Iterator((function() {
      return ii < $__0.size ? iteratorValue(type, ii++, $__0._value) : iteratorDone();
    }));
  },
  __deepEquals: function(other) {
    return other instanceof $Repeat ? is(this._value, other._value) : $traceurRuntime.superCall(this, $Repeat.prototype, "__deepEquals", [other]);
  }
}, {}, LazyIndexedSequence);
var RepeatPrototype = Repeat.prototype;
RepeatPrototype.last = RepeatPrototype.first;
RepeatPrototype.has = RangePrototype.has;
RepeatPrototype.take = RangePrototype.take;
RepeatPrototype.skip = RangePrototype.skip;
RepeatPrototype.__toJS = RangePrototype.__toJS;
var EMPTY_REPEAT;
function fromJS(json, converter) {
  if (converter) {
    return _fromJSWith(converter, json, '', {'': json});
  }
  return _fromJSDefault(json);
}
function _fromJSWith(converter, json, key, parentJSON) {
  if (json && (Array.isArray(json) || json.constructor === Object)) {
    return converter.call(parentJSON, key, Iterable(json).map((function(v, k) {
      return _fromJSWith(converter, v, k, json);
    })));
  }
  return json;
}
function _fromJSDefault(json) {
  if (json && typeof json === 'object') {
    if (Array.isArray(json)) {
      return Iterable.from(json, _fromJSDefault).toVector();
    }
    if (json.constructor === Object) {
      return Iterable.from(json, _fromJSDefault).toMap();
    }
  }
  return json;
}
var Cursor = function Cursor(rootData, keyPath, onChange, size) {
  this.size = size;
  this._rootData = rootData;
  this._keyPath = keyPath;
  this._onChange = onChange;
};
($traceurRuntime.createClass)(Cursor, {
  equals: function(second) {
    return is(this.deref(), second && (typeof second.deref === 'function' ? second.deref() : second));
  },
  deref: function(notSetValue) {
    return this._rootData.getIn(this._keyPath, notSetValue);
  },
  get: function(key, notSetValue) {
    if (Array.isArray(key) && key.length === 0) {
      return this;
    }
    var value = this._rootData.getIn(this._keyPath.concat(key), NOT_SET);
    return value === NOT_SET ? notSetValue : wrappedValue(this, key, value);
  },
  set: function(key, value) {
    return updateCursor(this, (function(m) {
      return m.set(key, value);
    }), key);
  },
  remove: function(key) {
    return updateCursor(this, (function(m) {
      return m.remove(key);
    }), key);
  },
  clear: function() {
    return updateCursor(this, (function(m) {
      return m.clear();
    }));
  },
  update: function(keyOrFn, notSetValue, updater) {
    return arguments.length === 1 ? updateCursor(this, keyOrFn) : updateCursor(this, (function(map) {
      return map.update(keyOrFn, notSetValue, updater);
    }), keyOrFn);
  },
  withMutations: function(fn) {
    return updateCursor(this, (function(m) {
      return (m || Map.empty()).withMutations(fn);
    }));
  },
  cursor: function(subKey) {
    return Array.isArray(subKey) && subKey.length === 0 ? this : subCursor(this, subKey);
  },
  __iterate: function(fn, reverse) {
    var $__0 = this;
    var deref = this.deref();
    return deref && deref.__iterate ? deref.__iterate((function(v, k) {
      return fn(wrappedValue($__0, k, v), k, $__0);
    }), reverse) : 0;
  },
  __iterator: function(type, reverse) {
    var $__0 = this;
    var deref = this.deref();
    var iterator = deref && deref.__iterator && deref.__iterator(ITERATE_ENTRIES, reverse);
    return new Iterator((function() {
      if (!iterator) {
        return iteratorDone();
      }
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      var k = entry[0];
      var v = entry[1];
      return iteratorValue(type, k, wrappedValue($__0, k, v), step);
    }));
  }
}, {}, LazyKeyedSequence);
var CursorPrototype = Cursor.prototype;
CursorPrototype[DELETE] = CursorPrototype.remove;
CursorPrototype.getIn = CursorPrototype.get;
var IndexedCursor = function IndexedCursor(rootData, keyPath, onChange, size) {
  this.size = size;
  this._rootData = rootData;
  this._keyPath = keyPath;
  this._onChange = onChange;
};
($traceurRuntime.createClass)(IndexedCursor, {}, {}, LazyIndexedSequence);
var IndexedCursorPrototype = IndexedCursor.prototype;
IndexedCursorPrototype.equals = CursorPrototype.equals;
IndexedCursorPrototype.deref = CursorPrototype.deref;
IndexedCursorPrototype.get = CursorPrototype.get;
IndexedCursorPrototype.getIn = CursorPrototype.getIn;
IndexedCursorPrototype.set = CursorPrototype.set;
IndexedCursorPrototype[DELETE] = IndexedCursorPrototype.remove = CursorPrototype.remove;
IndexedCursorPrototype.clear = CursorPrototype.clear;
IndexedCursorPrototype.update = CursorPrototype.update;
IndexedCursorPrototype.withMutations = CursorPrototype.withMutations;
IndexedCursorPrototype.cursor = CursorPrototype.cursor;
IndexedCursorPrototype.__iterate = CursorPrototype.__iterate;
IndexedCursorPrototype.__iterator = CursorPrototype.__iterator;
function makeCursor(rootData, keyPath, onChange, value) {
  if (arguments.length < 4) {
    value = rootData.getIn(keyPath);
  }
  var size = isIterable(value) ? value.size : undefined;
  var CursorClass = isIndexed(value) ? IndexedCursor : Cursor;
  return new CursorClass(rootData, keyPath, onChange, size);
}
function wrappedValue(cursor, key, value) {
  return isIterable(value) ? subCursor(cursor, key, value) : value;
}
function subCursor(cursor, key, value) {
  return makeCursor(cursor._rootData, cursor._keyPath.concat(key), cursor._onChange, value);
}
function updateCursor(cursor, changeFn, changeKey) {
  var newRootData = cursor._rootData.updateIn(cursor._keyPath, changeKey ? Map.empty() : undefined, changeFn);
  var keyPath = cursor._keyPath || [];
  cursor._onChange && cursor._onChange.call(undefined, newRootData, cursor._rootData, changeKey ? keyPath.concat(changeKey) : keyPath);
  return makeCursor(newRootData, cursor._keyPath, cursor._onChange);
}
var Immutable = {
  Iterable: Iterable,
  LazySequence: LazySequence,
  Collection: Collection,
  Map: Map,
  Vector: Vector,
  Stack: Stack,
  Set: Set,
  OrderedMap: OrderedMap,
  Record: Record,
  Range: Range,
  Repeat: Repeat,
  is: is,
  fromJS: fromJS
};

  return Immutable;
}
typeof exports === 'object' ? module.exports = universalModule() :
  typeof define === 'function' && define.amd ? define(universalModule) :
    Immutable = universalModule();
