'use strict';

System.register(['app/plugins/sdk', 'jquery', 'angular', 'app/core/utils/kbn', './css/panel.css!', './transformers', './renderer'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, $, angular, kbn, transformDataToTable, transformers, LogRenderer, _createClass, _get, panelDefaults, LogPanelCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_jquery) {
      $ = _jquery.default;
    }, function (_angular) {
      angular = _angular.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_cssPanelCss) {}, function (_transformers) {
      transformDataToTable = _transformers.transformDataToTable;
      transformers = _transformers.transformers;
    }, function (_renderer) {
      LogRenderer = _renderer.LogRenderer;
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

      _get = function get(object, property, receiver) {
        if (object === null) object = Function.prototype;
        var desc = Object.getOwnPropertyDescriptor(object, property);

        if (desc === undefined) {
          var parent = Object.getPrototypeOf(object);

          if (parent === null) {
            return undefined;
          } else {
            return get(parent, property, receiver);
          }
        } else if ("value" in desc) {
          return desc.value;
        } else {
          var getter = desc.get;

          if (getter === undefined) {
            return undefined;
          }

          return getter.call(receiver);
        }
      };

      panelDefaults = {
        targets: [{}],
        transform: 'json',
        showHeader: true,
        styles: [{
          type: 'date',
          pattern: 'Time',
          dateFormat: 'YYYY-MM-DD HH:mm:ss'
        }, {
          type: 'string',
          pattern: '/.*/'
        }],
        columns: [],
        fontSize: '100%'
      };

      _export('LogPanelCtrl', LogPanelCtrl = function (_MetricsPanelCtrl) {
        _inherits(LogPanelCtrl, _MetricsPanelCtrl);

        function LogPanelCtrl($scope, $injector, uiSegmentSrv, annotationsSrv) {
          _classCallCheck(this, LogPanelCtrl);

          var _this2 = _possibleConstructorReturn(this, (LogPanelCtrl.__proto__ || Object.getPrototypeOf(LogPanelCtrl)).call(this, $scope, $injector));

          _this2.table = null;
          _this2.dataRaw = [];
          _this2.dataRenderer = {};
          _this2.scrollPos = null;
          _this2.transformers = transformers;
          _this2.annotationsSrv = annotationsSrv;
          _this2.uiSegmentSrv = uiSegmentSrv;

          _this2.addColumnSegment = uiSegmentSrv.newPlusButton();
          _this2.fontSizes = ['80%', '90%', '100%', '110%', '120%', '130%', '150%', '160%', '180%', '200%', '220%', '250%'];
          _this2.columnTypes = [{
            text: 'Number',
            value: 'number'
          }, {
            text: 'String',
            value: 'string'
          }, {
            text: 'Date',
            value: 'date'
          }, {
            text: 'Hidden',
            value: 'hidden'
          }];
          _this2.unitFormats = kbn.getUnitFormats();
          _this2.dateFormats = [{
            text: 'YYYY-MM-DD HH:mm:ss',
            value: 'YYYY-MM-DD HH:mm:ss'
          }, {
            text: 'MM/DD/YY h:mm:ss a',
            value: 'MM/DD/YY h:mm:ss a'
          }, {
            text: 'MMMM D, YYYY LT',
            value: 'MMMM D, YYYY LT'
          }];
          // this is used from bs-typeahead and needs to be instance bound
          _this2.getColumnNames = function () {
            if (!_this2.table) {
              return [];
            }
            return _.map(_this2.table.columns, function (col) {
              return col.text;
            });
          };

          if (_this2.panel.styles === void 0) {
            _this2.panel.styles = _this2.panel.columns;
            _this2.panel.columns = _this2.panel.fields;
            delete _this2.panel.columns;
            delete _this2.panel.fields;
          }
          _.defaults(_this2.panel, panelDefaults);

          _this2.dataLoaded = true;
          _this2.tail = true;
          _this2.events.on('data-received', _this2.onDataReceived.bind(_this2));
          _this2.events.on('data-error', _this2.onDataError.bind(_this2));
          _this2.events.on('data-snapshot-load', _this2.onDataReceived.bind(_this2));
          _this2.events.on('init-edit-mode', _this2.onInitEditMode.bind(_this2));
          _this2.events.on('panel-initialized', _this2.onInitPanel.bind(_this2));
          return _this2;
        }

        _createClass(LogPanelCtrl, [{
          key: 'onInitPanel',
          value: function onInitPanel() {}
        }, {
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            // determine the path to this plugin
            var panels = grafanaBootData.settings.panels;
            var thisPanel = panels[this.pluginId];
            var thisPanelPath = thisPanel.baseUrl + '/';
            // add the relative path to the partial
            var optionsPath = thisPanelPath + 'partials/editor.options.html';
            this.addEditorTab('Options', optionsPath, 2);
          }
        }, {
          key: 'onDataError',
          value: function onDataError(err) {
            this.dataRaw = [];
            this.render();
          }
        }, {
          key: 'tailScroll',
          value: function tailScroll() {
            var logger = $('#logstream-display-' + this.panel.id).get(0);
            if (logger) {
              $(logger).animate({
                scrollTop: logger.scrollHeight
              }, 500);
            }
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            this.dataRaw = dataList;
            // TODO: If we ever support other modes, detect the proper transform
            this.panel.transform = 'json';
            this.render();
          }
        }, {
          key: 'restoreScroll',
          value: function restoreScroll() {
            if (this.tail) {
              this.tailScroll();
            } else {
              $('#logstream-display-' + this.panel.id).scrollTop(this.scrollPos);
            }
          }
        }, {
          key: 'render',
          value: function render() {
            this.scrollPos = $('#logstream-display-' + this.panel.id).scrollTop();
            this.table = transformDataToTable(this.dataRaw, this.panel);
            return _get(LogPanelCtrl.prototype.__proto__ || Object.getPrototypeOf(LogPanelCtrl.prototype), 'render', this).call(this, this.table);
          }
        }, {
          key: 'getPanelHeight',
          value: function getPanelHeight() {
            var tmpPanelHeight = this.panel.height || String(this.height);
            tmpPanelHeight = tmpPanelHeight.replace("px", "");
            return parseInt(tmpPanelHeight);
          }
        }, {
          key: 'link',
          value: function link(scope, elem, attrs, ctrl) {
            var data;
            var panel = ctrl.panel;
            var _this = this;

            /**
             * [renderPanel description]
             * @return {[type]} [description]
             */
            function renderPanel() {
              var renderer = new LogRenderer(panel, ctrl.table, ctrl.dashboard.isTimezoneUtc(), ctrl.$sanitize);
              renderer.render();
              _this.dataLoaded = true;
              _this.restoreScroll();
            }

            ctrl.panel.panelHeight = this.getPanelHeight();
            ctrl.events.on('render', function (renderData) {
              data = renderData || data;
              if (data) {
                renderPanel();
              }
              ctrl.renderingCompleted();
            });
          }
        }, {
          key: 'transformChanged',
          value: function transformChanged() {
            this.panel.columns = [];
            this.render();
          }
        }, {
          key: 'removeColumn',
          value: function removeColumn(column) {
            this.panel.columns = _.without(this.panel.columns, column);
            this.render();
          }
        }, {
          key: 'getColumnOptions',
          value: function getColumnOptions() {
            var _this3 = this;

            if (!this.dataRaw) {
              return this.$q.when([]);
            }
            var columns = this.transformers[this.panel.transform].getColumns(this.dataRaw);
            var segments = _.map(columns, function (c) {
              return _this3.uiSegmentSrv.newSegment({
                value: c.text
              });
            });
            return this.$q.when(segments);
          }
        }, {
          key: 'addColumn',
          value: function addColumn() {
            var columns = transformers[this.panel.transform].getColumns(this.dataRaw);
            var column = _.find(columns, {
              text: this.addColumnSegment.value
            });

            if (column) {
              this.panel.columns.push(column);
              this.render();
            }

            var plusButton = this.uiSegmentSrv.newPlusButton();
            this.addColumnSegment.html = plusButton.html;
            this.addColumnSegment.value = plusButton.value;
          }
        }, {
          key: 'addColumnStyle',
          value: function addColumnStyle() {
            var columnStyleDefaults = {
              type: 'string',
              pattern: '/.*/',
              decimals: 2,
              unit: 'short',
              dateFormat: 'YYYY-MM-DD HH:mm:ss'
            };
            this.panel.styles.push(angular.copy(columnStyleDefaults));
          }
        }, {
          key: 'removeColumnStyle',
          value: function removeColumnStyle(style) {
            this.panel.styles = _.without(this.panel.styles, style);
          }
        }, {
          key: 'setUnitFormat',
          value: function setUnitFormat(column, subItem) {
            column.unit = subItem.value;
            this.render();
          }
        }]);

        return LogPanelCtrl;
      }(MetricsPanelCtrl));

      _export('LogPanelCtrl', LogPanelCtrl);

      LogPanelCtrl.templateUrl = 'partials/template.html';
    }
  };
});
//# sourceMappingURL=ctrl.js.map
