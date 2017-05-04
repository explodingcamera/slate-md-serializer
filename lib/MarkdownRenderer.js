'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _markdownparser = require('./markdownparser');

var _markdownparser2 = _interopRequireDefault(_markdownparser);

var _slate = require('slate');

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * String.
 */

var String = new _immutable.Record({
  kind: 'string',
  text: ''
});

/**
 * Rules to (de)serialize nodes.
 *
 * @type {Object}
 */

var RULES = [{
  serialize: function serialize(obj, children) {
    if (obj.kind == 'string') {
      return children;
    }
  }
}, {
  serialize: function serialize(obj, children) {
    if (obj.kind != 'block') return;

    switch (obj.type) {
      case 'paragraph':
        return '\n' + children + '\n';
      case 'block-quote':
        return '> ' + children + '\n';
      case 'bulleted-list':
        return children;
      case 'list-item':
        return '* ' + children.trim() + '\n';
      case 'heading1':
        return '# ' + children;
      case 'heading2':
        return '## ' + children;
      case 'heading3':
        return '### ' + children;
      case 'heading4':
        return '#### ' + children;
      case 'heading5':
        return '##### ' + children;
      case 'heading6':
        return '###### ' + children;
      case 'heading6':
        return '###### ' + children;
      case 'horizontal-rule':
        return '---';
      case 'image':
        var title = obj.getIn(['data', 'title']);
        var src = obj.getIn(['data', 'src']);
        var alt = obj.getIn(['data', 'alt']);
        return '![' + title + '](' + src + ' "' + alt + '")';
    }
  }
}, {
  serialize: function serialize(obj, children) {
    if (obj.kind != 'inline') return;
    switch (obj.type) {
      case 'link':
        return '[' + children.trim() + '](' + obj.getIn(['data', 'href']) + ')';
    }
  }
},
// Add a new rule that handles marks...
{
  serialize: function serialize(obj, children) {
    if (obj.kind != 'mark') return;
    switch (obj.type) {
      case 'bold':
        return '**' + children + '**';
      case 'italic':
        return '*' + children + '*';
      case 'code':
        return '`' + children + '`';
      case 'inserted':
        return '__' + children + '__';
      case 'deleted':
        return '~~' + children + '~~';

    }
  }
}];

/**
 * Markdown serializer.
 *
 * @type {Markdown}
 */

var Markdown = function () {

  /**
   * Create a new serializer with `rules`.
   *
   * @param {Object} options
   *   @property {Array} rules
   * @return {Markdown} serializer
   */

  function Markdown() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Markdown);

    this.rules = [].concat(_toConsumableArray(options.rules || []), RULES);

    this.serializeNode = this.serializeNode.bind(this);
    this.serializeRange = this.serializeRange.bind(this);
    this.serializeString = this.serializeString.bind(this);
  }

  /**
   * Serialize a `state` object into an HTML string.
   *
   * @param {State} state
   * @return {String} markdown
   */

  _createClass(Markdown, [{
    key: 'serialize',
    value: function serialize(state) {
      var document = state.document;

      var elements = document.nodes.map(this.serializeNode);

      return elements.join('\n').trim();
    }

    /**
     * Serialize a `node`.
     *
     * @param {Node} node
     * @return {String}
     */

  }, {
    key: 'serializeNode',
    value: function serializeNode(node) {
      if (node.kind == 'text') {
        var ranges = node.getRanges();
        return ranges.map(this.serializeRange);
      }

      var children = node.nodes.map(this.serializeNode);
      children = children.flatten().length === 0 ? '' : children.flatten().join('');

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.rules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var rule = _step.value;

          if (!rule.serialize) continue;
          var ret = rule.serialize(node, children);
          if (ret) return ret;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    /**
     * Serialize a `range`.
     *
     * @param {Range} range
     * @return {String}
     */

  }, {
    key: 'serializeRange',
    value: function serializeRange(range) {
      var _this = this;

      var string = new String({ text: range.text });
      var text = this.serializeString(string);

      return range.marks.reduce(function (children, mark) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = _this.rules[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var rule = _step2.value;

            if (!rule.serialize) continue;
            var ret = rule.serialize(mark, children);
            if (ret) return ret;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }, text);
    }

    /**
     * Serialize a `string`.
     *
     * @param {String} string
     * @return {String}
     */

  }, {
    key: 'serializeString',
    value: function serializeString(string) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.rules[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var rule = _step3.value;

          if (!rule.serialize) continue;
          var ret = rule.serialize(string, string.text);
          if (ret) return ret;
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }

    /**
     * Deserialize a markdown `string`.
     *
     * @param {String} markdown
     * @return {State} state
     */

  }, {
    key: 'deserialize',
    value: function deserialize(markdown) {
      var nodes = _markdownparser2.default.parse(markdown);
      var state = _slate.Raw.deserialize(nodes, { terse: true });
      return state;
    }
  }]);

  return Markdown;
}();

/**
 * Export.
 */

exports.default = Markdown;