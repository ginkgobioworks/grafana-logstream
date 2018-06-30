import { MetricsPanelCtrl } from 'app/plugins/sdk';
import $ from 'jquery';
import angular from 'angular';
import kbn from 'app/core/utils/kbn';

import './css/panel.css!';

import {
  transformDataToTable,
  transformers
} from './transformers';

import { LogRenderer } from './renderer';

const panelDefaults = {
  targets: [{}],
  transform: 'json',
  showHeader: true,
  styles: [
    {
      type: 'date',
      pattern: 'Time',
      dateFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      type: 'string',
      pattern: '/.*/',
    }
  ],
  columns: [],
  fontSize: '100%',
};

export class LogPanelCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector, uiSegmentSrv, annotationsSrv) {
    super($scope, $injector);

    this.table = null;
    this.dataRaw = [];
    this.dataRenderer = {};
    this.scrollPos = null;
    this.transformers = transformers;
    this.annotationsSrv = annotationsSrv;
    this.uiSegmentSrv = uiSegmentSrv;

    this.addColumnSegment = uiSegmentSrv.newPlusButton();
    this.fontSizes = ['80%', '90%', '100%', '110%', '120%', '130%', '150%', '160%', '180%', '200%', '220%', '250%'];
    this.columnTypes = [
      {
        text: 'Number',
        value: 'number'
      },
      {
        text: 'String',
        value: 'string'
      },
      {
        text: 'Date',
        value: 'date'
      },
      {
        text: 'Hidden',
        value: 'hidden'
      }
    ];
    this.unitFormats = kbn.getUnitFormats();
    this.dateFormats = [
      {
        text: 'YYYY-MM-DD HH:mm:ss',
        value: 'YYYY-MM-DD HH:mm:ss'
      },
      {
        text: 'MM/DD/YY h:mm:ss a',
        value: 'MM/DD/YY h:mm:ss a'
      },
      {
        text: 'MMMM D, YYYY LT',
        value: 'MMMM D, YYYY LT'
      },
    ];
    // this is used from bs-typeahead and needs to be instance bound
    this.getColumnNames = () => {
      if (!this.table) {
        return [];
      }
      return _.map(this.table.columns, function(col) {
        return col.text;
      });
    };

    if (this.panel.styles === void 0) {
      this.panel.styles = this.panel.columns;
      this.panel.columns = this.panel.fields;
      delete this.panel.columns;
      delete this.panel.fields;
    }
    _.defaults(this.panel, panelDefaults);

    this.dataLoaded = true;
    this.tail = true;
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('panel-initialized', this.onInitPanel.bind(this));
  }


  onInitPanel() {

  }

  // setup the editor
  onInitEditMode() {
    // determine the path to this plugin
    var panels = grafanaBootData.settings.panels;
    var thisPanel = panels[this.pluginId];
    var thisPanelPath = thisPanel.baseUrl + '/';
    // add the relative path to the partial
    var optionsPath = thisPanelPath + 'partials/editor.options.html';
    this.addEditorTab('Options', optionsPath, 2);
  }

  onDataError(err) {
    this.dataRaw = [];
    this.render();
  }

  tailScroll() {
    var logger = $('#logstream-display-' + this.panel.id).get(0);
    if (logger) {
      $(logger).animate({
          scrollTop: logger.scrollHeight
      }, 500);
    }

  }

  onDataReceived(dataList) {
    this.dataRaw = dataList;
    // TODO: If we ever support other modes, detect the proper transform
    this.panel.transform = 'json';
    this.render();
  }

  restoreScroll() {
    if (this.tail) {
      this.tailScroll();
    } else {
      $('#logstream-display-' + this.panel.id).scrollTop(this.scrollPos);
    }
  }

  render() {
    this.scrollPos = $('#logstream-display-' + this.panel.id).scrollTop();
    this.table = transformDataToTable(this.dataRaw, this.panel);
    return super.render(this.table);
  }

  getPanelHeight() {
    let tmpPanelHeight = this.panel.height || String(this.height);
    tmpPanelHeight = tmpPanelHeight.replace("px","");
    return parseInt(tmpPanelHeight);
  }


  link(scope, elem, attrs, ctrl) {
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
    ctrl.events.on('render', function(renderData) {
      data = renderData || data;
      if (data) {
        renderPanel();
      }
      ctrl.renderingCompleted();
    });
  }

  // editor methods

  transformChanged() {
    this.panel.columns = [];
    this.render();
  }

  removeColumn(column) {
    this.panel.columns = _.without(this.panel.columns, column);
    this.render();
  }

  getColumnOptions() {
    if (!this.dataRaw) {
      return this.$q.when([]);
    }
    var columns = this.transformers[this.panel.transform].getColumns(this.dataRaw);
    var segments = _.map(columns, (c) => this.uiSegmentSrv.newSegment({
      value: c.text
    }));
    return this.$q.when(segments);
  }

  addColumn() {
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

  addColumnStyle() {
    var columnStyleDefaults = {
      type: 'string',
      pattern: '/.*/',
      decimals: 2,
      unit: 'short',
      dateFormat: 'YYYY-MM-DD HH:mm:ss',
    };
    this.panel.styles.push(angular.copy(columnStyleDefaults));
  }

  removeColumnStyle(style) {
    this.panel.styles = _.without(this.panel.styles, style);
  }

  setUnitFormat(column, subItem) {
    column.unit = subItem.value;
    this.render();
  }

}
LogPanelCtrl.templateUrl = 'partials/template.html';
