'use strict';

System.register(['jquery', 'app/core/utils/kbn', 'moment'], function (_export, _context) {
  "use strict";

  var $, kbn, moment, _createClass, LogRenderer;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_jquery) {
      $ = _jquery.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_moment) {
      moment = _moment.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('LogRenderer', LogRenderer = function () {
        function LogRenderer(panel, table, isUtc, sanitize) {
          _classCallCheck(this, LogRenderer);

          this.formatters = [];
          this.colorState = {};
          this.panel = panel;
          this.table = table;
          this.isUtc = isUtc;
          this.sanitize = sanitize;
          this.renderedData = {};
        }

        /**
         * [defaultCellFormatter description]
         * @param  {[type]} v     [description]
         * @param  {[type]} style [description]
         * @return {[type]}       [description]
         */


        _createClass(LogRenderer, [{
          key: 'defaultCellFormatter',
          value: function defaultCellFormatter(v, style) {
            if (v === null || v === void 0 || v === undefined) {
              return '';
            }
            if (_.isArray(v)) {
              v = v.join(', ');
            }
            if (style && style.sanitize) {
              return this.sanitize(v);
            } else {
              return _.escape(v);
            }
          }
        }, {
          key: 'createColumnFormatter',
          value: function createColumnFormatter(style, column) {
            var _this = this;

            if (!style) {
              return this.defaultCellFormatter;
            }
            if (style.type === 'hidden') {
              return function (v) {
                return undefined;
              };
            }
            if (style.type === 'date') {
              return function (v) {
                if (v === undefined || v === null) {
                  return '-';
                }
                if (_.isArray(v)) {
                  v = v[0];
                }
                var date = moment(v);
                if (_this.isUtc) {
                  date = date.utc();
                }
                return date.format(style.dateFormat);
              };
            }
            if (style.type === 'number') {
              var valueFormatter = kbn.valueFormats[column.unit || style.unit];
              return function (v) {
                if (v === null || v === void 0) {
                  return '-';
                }
                if (_.isString(v)) {
                  return _this.defaultCellFormatter(v, style);
                }
                return valueFormatter(v, style.decimals, null);
              };
            }
            return function (value) {
              return _this.defaultCellFormatter(value, style);
            };
          }
        }, {
          key: 'formatColumnValue',
          value: function formatColumnValue(colIndex, value) {
            if (this.formatters[colIndex]) {
              return this.formatters[colIndex](value);
            }

            for (var i = 0; i < this.panel.styles.length; i++) {
              var style = this.panel.styles[i];
              var column = this.table.columns[colIndex];
              var regex = kbn.stringToJsRegex(style.pattern);
              if (column.text.match(regex)) {
                this.formatters[colIndex] = this.createColumnFormatter(style, column);
                return this.formatters[colIndex](value);
              }
            }

            this.formatters[colIndex] = this.defaultCellFormatter;
            return this.formatters[colIndex](value);
          }
        }, {
          key: 'generateFormattedData',
          value: function generateFormattedData(rowData) {
            var formattedRowData = [];
            for (var y = 0; y < rowData.length; y++) {
              var row = this.table.rows[y];
              var cellData = [];

              for (var i = 0; i < this.table.columns.length; i++) {
                var value = this.formatColumnValue(i, row[i]);
                if (value === undefined) {
                  this.table.columns[i].hidden = true;
                }
                cellData.push(this.formatColumnValue(i, row[i]));
              }
              formattedRowData.push(cellData);
            }
            formattedRowData = _.sortBy(formattedRowData, function (o) {
              return o[0];
            });
            return formattedRowData;
          }
        }, {
          key: 'render',
          value: function render() {
            // TODO: Currently this just redraws everything. In the future, maybe some intelligent list insertions to minimize
            // redraws. It is currently done this way because when aggregating from multiple sources, we cannot guarantee the
            // timestamps from each service will be in ascending order and some services may send logs that need to be
            // interwoven in the current view

            if (this.table.columns.length === 0) return;

            var formattedData = this.generateFormattedData(this.table.rows);
            var $logger = $('#logstream-display-' + this.panel.id);
            var txt = [];
            _.forEach(formattedData, function (row) {
              txt.push(row.join('\t'));
            });
            $logger.html(txt.join('\n'));
          }
        }]);

        return LogRenderer;
      }());

      _export('LogRenderer', LogRenderer);
    }
  };
});
//# sourceMappingURL=renderer.js.map
