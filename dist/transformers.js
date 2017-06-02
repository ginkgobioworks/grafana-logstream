'use strict';

System.register(['lodash', 'app/core/utils/flatten', 'app/core/table_model'], function (_export, _context) {
  "use strict";

  var _, flatten, TableModel, transformers;

  function transformDataToTable(data, panel) {
    var model = new TableModel();

    if (!data || data.length === 0) {
      return model;
    }

    var transformer = transformers[panel.transform];
    if (!transformer) {
      throw { message: 'Transformer ' + panel.transformer + ' not found' };
    }

    transformer.transform(data, panel, model);
    return model;
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreUtilsFlatten) {
      flatten = _appCoreUtilsFlatten.default;
    }, function (_appCoreTable_model) {
      TableModel = _appCoreTable_model.default;
    }],
    execute: function () {
      _export('transformers', transformers = {});

      transformers.json = {
        description: 'JSON Data',
        getColumns: function getColumns(data) {
          if (!data || data.length === 0) {
            return [];
          }

          var names = {};
          for (var i = 0; i < data.length; i++) {
            var series = data[i];
            if (series.type !== 'docs') {
              continue;
            }

            // only look at 100 docs
            var maxDocs = Math.min(series.datapoints.length, 100);
            for (var y = 0; y < maxDocs; y++) {
              var doc = series.datapoints[y];
              var flattened = flatten(doc, null);
              for (var propName in flattened) {
                names[propName] = true;
              }
            }
          }

          return _.map(names, function (value, key) {
            return { text: key, value: key };
          });
        },
        transform: function transform(data, panel, model) {
          var i, y, z;
          for (i = 0; i < panel.columns.length; i++) {
            model.columns.push({ text: panel.columns[i].text });
          }

          if (model.columns.length === 0) {
            model.columns.push({ text: 'JSON' });
          }

          for (i = 0; i < data.length; i++) {
            var series = data[i];

            for (y = 0; y < series.datapoints.length; y++) {
              var dp = series.datapoints[y];
              var values = [];

              if (_.isObject(dp) && panel.columns.length > 0) {
                var flattened = flatten(dp, null);
                for (z = 0; z < panel.columns.length; z++) {
                  values.push(flattened[panel.columns[z].value]);
                }
              } else {
                values.push(JSON.stringify(dp));
              }

              model.rows.push(values);
            }
          }
        }
      };
      _export('transformers', transformers);

      _export('transformDataToTable', transformDataToTable);
    }
  };
});
//# sourceMappingURL=transformers.js.map
