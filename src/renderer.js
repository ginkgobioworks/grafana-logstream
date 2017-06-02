import $ from 'jquery';
import kbn from 'app/core/utils/kbn';
import moment from 'moment';

export class LogRenderer {
  constructor(panel, table, isUtc, sanitize) {
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
  defaultCellFormatter(v, style) {
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

  /**
   * [createColumnFormatter description]
   * @param  {[type]} style  [description]
   * @param  {[type]} column [description]
   * @return {[type]}        [description]
   */
  createColumnFormatter(style, column) {
    if (!style) {
      return this.defaultCellFormatter;
    }
    if (style.type === 'hidden') {
      return v => {
        return undefined;
      };
    }
    if (style.type === 'date') {
      return v => {
        if (v === undefined || v === null) {
          return '-';
        }
        if (_.isArray(v)) {
          v = v[0];
        }
        var date = moment(v);
        if (this.isUtc) {
          date = date.utc();
        }
        return date.format(style.dateFormat);
      };
    }
    if (style.type === 'number') {
      let valueFormatter = kbn.valueFormats[column.unit || style.unit];
      return v => {
        if (v === null || v === void 0) {
          return '-';
        }
        if (_.isString(v)) {
          return this.defaultCellFormatter(v, style);
        }
        return valueFormatter(v, style.decimals, null);
      };
    }
    return (value) => {
      return this.defaultCellFormatter(value, style);
    };
  }

  /**
   * [formatColumnValue description]
   * @param  {[type]} colIndex [description]
   * @param  {[type]} value    [description]
   * @return {[type]}          [description]
   */
  formatColumnValue(colIndex, value) {
    if (this.formatters[colIndex]) {
      return this.formatters[colIndex](value);
    }

    for (let i = 0; i < this.panel.styles.length; i++) {
      let style = this.panel.styles[i];
      let column = this.table.columns[colIndex];
      var regex = kbn.stringToJsRegex(style.pattern);
      if (column.text.match(regex)) {
        this.formatters[colIndex] = this.createColumnFormatter(style, column);
        return this.formatters[colIndex](value);
      }
    }

    this.formatters[colIndex] = this.defaultCellFormatter;
    return this.formatters[colIndex](value);
  }

  /**
   * [generateFormattedData description]
   * @param  {[type]} rowData [description]
   * @return {[type]}         [description]
   */
  generateFormattedData(rowData) {
    let formattedRowData = [];
    for (var y = 0; y < rowData.length; y++) {
      let row = this.table.rows[y];
      let cellData = [];

      for (var i = 0; i < this.table.columns.length; i++) {
        let value = this.formatColumnValue(i, row[i]);
        if (value === undefined) {
          this.table.columns[i].hidden = true;
        }
        cellData.push(this.formatColumnValue(i, row[i]));
      }
      formattedRowData.push(cellData);
    }
    formattedRowData =  _.sortBy(formattedRowData, function(o) { return o[0]; });
    return formattedRowData;
  }

  render() {
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
}
