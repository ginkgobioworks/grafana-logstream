# Grafana Logstream Panel

This panel plugin provides a logging panel for [Grafana](http://www.grafana.org) 3.x/4.x

![Logstream Panel](https://github.com/ginkgobioworks/grafana-logstream/raw/master/src/img/logstream-example.png "Logstream Panel")

## Building

This plugin relies on Grunt/NPM/Bower, typical build sequence:

```
npm install
bower install
grunt
```

For development, you can run:
```
grunt watch
```
The code will be parsed then copied into "dist" if "jslint" passes without errors.


### Docker Support

A docker-compose.yml file is include for easy development and testing, just run
```
docker-compose up
```

Then browse to http://localhost:3000


## External Dependencies

* Grafana 3.x/4.x

## Build Dependencies

* npm
* bower
* grunt

#### Acknowledgements

This panel is based on the "Datatable" panel by [Brian Gann](https://github.com/briangann/grafana-datatable-panel)

#### Changelog


##### v0.0.1
- Initial commit
