# Grafana Logstream Panel

This panel plugin provides a logging panel for [Grafana](http://www.grafana.org) 3.x/4.x.

It was created to provide a streaming log interface similar to solutions like loggly but to allow further customizations of what data is presented as well as from what sources. For example, with microservice based applications and multiple docker containers, logs may be spread over several machines and multiple docker containers. This allows the user to aggregate logs from a database, load balancer, cache layer, and several microservices into a single panel. Before this plugin, users could use the Table panel to aggregate data, but this panel is not suitable for streaming updates (and requires the user to read their logs in reverse if they want a streaming effect).

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

The source code from the "Datatable" panel by [Brian Gann](https://github.com/briangann/grafana-datatable-panel) was a great reference
for setting up this plugin.

#### Changelog


##### v0.0.1
- Initial commit
