(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("application", function(exports, require, module) {
var Application, _dataCollection, _dataModel, _stateModel;

_dataModel = require('models/data-model');

_dataCollection = require('collections/data-collection');

_stateModel = require('models/state-model');

module.exports = Application = (function() {

  function Application() {}

  Application.prototype.dateFormat = 'DD/MM/YYYY';

  Application.prototype.toUnix = function(date) {
    return moment(date, this.dateFormat).unix();
  };

  Application.prototype.toDate = function(timestamp) {
    return moment.unix(timestamp).format(this.dateFormat);
  };

  Application.prototype.initialize = function() {
    var Router;
    Router = require('lib/router');
    this.DataCollection = new _dataCollection({
      model: _dataModel
    });
    this.State = new _stateModel();
    this.router = new Router();
    return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
  };

  return Application;

})();

module.exports = new Application();

});

require.register("collections/data-collection", function(exports, require, module) {
var Collection, app,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

app = require('application');

module.exports = Collection = (function(_super) {

  __extends(Collection, _super);

  function Collection() {
    return Collection.__super__.constructor.apply(this, arguments);
  }

  Collection.prototype.url = '/get';

  return Collection;

})(Backbone.Collection);

});

require.register("initialize", function(exports, require, module) {
var application;

application = require('application');

$(function() {
  application.initialize();
  return Backbone.history.start();
});

});

require.register("lib/router", function(exports, require, module) {
var HomeView, Router, app,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

app = require('application');

HomeView = require('views/home_view');

module.exports = Router = (function(_super) {

  __extends(Router, _super);

  function Router() {
    return Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.routes = {
    '': 'home'
  };

  Router.prototype.home = function() {
    var _this = this;
    return app.DataCollection.fetch({
      success: function(_collection) {
        var homeView;
        homeView = new HomeView({
          app: app,
          collection: _collection
        });
        return $('body').html(homeView.render().el);
      },
      error: function() {
        return console.log('Failed to get data');
      }
    });
  };

  return Router;

})(Backbone.Router);

});

require.register("lib/view_helper", function(exports, require, module) {



});

;require.register("models/collection", function(exports, require, module) {
var Collection,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Collection = (function(_super) {

  __extends(Collection, _super);

  function Collection() {
    return Collection.__super__.constructor.apply(this, arguments);
  }

  return Collection;

})(Backbone.Collection);

});

require.register("models/data-model", function(exports, require, module) {
var Model,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Model = (function(_super) {

  __extends(Model, _super);

  function Model() {
    return Model.__super__.constructor.apply(this, arguments);
  }

  Model.prototype.defaults = {
    'Date': '01/01/1970'
  };

  return Model;

})(Backbone.Model);

});

require.register("models/model", function(exports, require, module) {
var Model,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Model = (function(_super) {

  __extends(Model, _super);

  function Model() {
    return Model.__super__.constructor.apply(this, arguments);
  }

  return Model;

})(Backbone.Model);

});

require.register("models/state-model", function(exports, require, module) {
var Model,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Model = (function(_super) {

  __extends(Model, _super);

  function Model() {
    return Model.__super__.constructor.apply(this, arguments);
  }

  Model.prototype.defaults = {
    from: 0,
    to: Date.now()
  };

  return Model;

})(Backbone.Model);

});

require.register("views/chart-view", function(exports, require, module) {
var ChartView, View, app,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

app = require('application');

View = require('./view');

module.exports = ChartView = (function(_super) {

  __extends(ChartView, _super);

  function ChartView() {
    return ChartView.__super__.constructor.apply(this, arguments);
  }

  ChartView.prototype.initialize = function(opts) {
    var _this = this;
    this.app = opts.app || {};
    this.collection = opts.collection;
    this.initialCollection = _.clone(opts.collection);
    return this.app.State.on('change update', function(val) {
      return _this.render();
    });
  };

  ChartView.prototype.smoothOut = function(arr) {
    var a, l, n, _i, _len;
    if (arr == null) {
      arr = [];
    }
    a = [];
    l = null;
    for (_i = 0, _len = arr.length; _i < _len; _i++) {
      n = arr[_i];
      if (l != null) {
        a.push((n + l) / 2);
      }
      l = n;
    }
    return a;
  };

  ChartView.prototype.afterRender = function() {
    var axisItems, chart, date, filtered, i, l, paper, smoothingFactor, svgElement, x, y, z, _i, _j, _k, _len, _len1, _ref, _ref1, _results, _self,
      _this = this;
    _self = this;
    this.collection.reset(this.initialCollection.models, {
      silent: true
    });
    svgElement = this.$el;
    svgElement.empty();
    paper = Raphael(svgElement.get(0), svgElement.width(), svgElement.height());
    filtered = this.collection.filter(function(x) {
      var _date;
      _date = app.toUnix(x.get('Date'));
      return _date > _this.app.State.get('from') && _date < _this.app.State.get('to');
    });
    this.collection.reset(filtered);
    x = [];
    _ref = this.collection.pluck('Date');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      z = _ref[_i];
      x.push(app.toUnix(z));
    }
    y = [];
    _ref1 = this.collection.pluck('Balance');
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      z = _ref1[_j];
      y.push(parseFloat(z, 10));
    }
    smoothingFactor = this.app.State.get('smoothing') || 0;
    for (_k = 1; 1 <= smoothingFactor ? _k <= smoothingFactor : _k >= smoothingFactor; 1 <= smoothingFactor ? _k++ : _k--) {
      y = this.smoothOut(y);
    }
    chart = paper.linechart(20, 0, svgElement.width() - 25, svgElement.height() - 20, [x, [_.min(x), _.max(x)]], [y, [1, 1]], {
      width: 0.5,
      smooth: false,
      axis: '0 0 1 1'
    }).hoverColumn(function(e) {
      var axis, ting;
      axis = Math.round(this.axis);
      ting = _self.collection.find(function(x) {
        return x.get('Date') === app.toDate(axis);
      });
      if (ting != null) {
        return $('#description').html(ting.get('Date') + ' : ' + ting.get('Description') + ' / ' + ting.get('Value'));
      }
    });
    axisItems = chart.axis[0].text.items;
    i = 0;
    l = axisItems.length;
    _results = [];
    while (i < l) {
      date = axisItems[i].attr("text");
      axisItems[i].attr("text", app.toDate(date));
      _results.push(i++);
    }
    return _results;
  };

  return ChartView;

})(View);

});

require.register("views/home_view", function(exports, require, module) {
var ChartView, HomeView, ListView, SliderView, Template, View, app,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

app = require('application');

View = require('./view');

ChartView = require('./chart-view');

ListView = require('./list-view');

SliderView = require('./slider-view');

Template = require('./templates/home');

module.exports = HomeView = (function(_super) {

  __extends(HomeView, _super);

  function HomeView() {
    return HomeView.__super__.constructor.apply(this, arguments);
  }

  HomeView.prototype.id = 'home-view';

  HomeView.prototype.template = Template;

  HomeView.prototype.templateHelpers = function() {
    return {
      state: app.State.toJSON()
    };
  };

  HomeView.prototype.initialize = function(opts) {
    return this.app = opts.app || {};
  };

  HomeView.prototype.events = {
    'click .smooth': 'updateSmoothing'
  };

  HomeView.prototype.updateSmoothing = function(e) {
    return this.app.State.set('smoothing', $(e.target).val());
  };

  HomeView.prototype.afterRender = function() {
    this.chart = new ChartView({
      collection: this.collection,
      el: this.$el.find('#chart'),
      app: this.app
    });
    this.chart.render().$el;
    this.list = new ListView({
      collection: this.collection,
      el: this.$el.find('#list'),
      app: this.app
    });
    this.list.render().$el;
    this.months = new SliderView({
      model: app.State,
      data: this.collection,
      el: this.$el.find('#months'),
      app: this.app
    });
    this.months.render().$el;
    return this;
  };

  return HomeView;

})(View);

});

require.register("views/list-view", function(exports, require, module) {
var ChartView, Template, View, app,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

app = require('application');

View = require('./view');

Template = require('./templates/list');

module.exports = ChartView = (function(_super) {

  __extends(ChartView, _super);

  function ChartView() {
    return ChartView.__super__.constructor.apply(this, arguments);
  }

  ChartView.prototype.searchValue = '';

  ChartView.prototype.initialize = function(opts) {
    var _this = this;
    this.initialCollection = _.clone(opts.collection);
    return this.collection.on('reset', function() {
      console.log('reset');
      return _this.render();
    });
  };

  ChartView.prototype.afterRender = function() {
    console.log(this.collection);
    return this.$el.html(Template({
      data: this.collection,
      searchValue: this.searchValue || ''
    }));
  };

  ChartView.prototype.events = {
    'keyup #search-list': 'search'
  };

  ChartView.prototype.search = function(e) {
    var filtered,
      _this = this;
    this.searchValue = this.$el.find('#search-list').val();
    this.collection.reset(this.initialCollection.models, {
      silent: true
    });
    filtered = this.collection.filter(function(val) {
      var toGet;
      toGet = isFinite(_this.searchValue) ? val.get('Value') : val.get('Description').toLowerCase();
      return toGet.indexOf(_this.searchValue.toLowerCase()) > -1;
    });
    this.collection.reset(filtered);
    return console.log(this.collection);
  };

  return ChartView;

})(View);

});

require.register("views/slider-view", function(exports, require, module) {
var SliderView, Template, View, app,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

app = require('application');

View = require('./view');

Template = require('./templates/slider');

module.exports = SliderView = (function(_super) {

  __extends(SliderView, _super);

  function SliderView() {
    return SliderView.__super__.constructor.apply(this, arguments);
  }

  SliderView.prototype.tagName = 'div';

  SliderView.prototype.className = 'slider';

  SliderView.prototype.template = Template;

  SliderView.prototype.timeout = null;

  SliderView.prototype.updateMonths = function(from, to) {
    app.State.set('from', from);
    return app.State.set('to', to);
  };

  SliderView.prototype.afterRender = function() {
    var min,
      _this = this;
    min = app.toUnix(this.options.data.at(0).get('Date'));
    return $(this.$el).find('input').ionRangeSlider({
      type: 'double',
      min: +moment.unix(min).format("X"),
      max: +moment().add(7, "days").format("X"),
      prettify: function(num) {
        return moment(num, "X").format("MMM Do YYYY");
      },
      onFinish: function(data) {
        clearTimeout(_this.timeout);
        return _this.timeout = setTimeout(function() {
          return _this.updateMonths(data.from, data.to);
        }, 100);
      }
    });
  };

  return SliderView;

})(View);

});

require.register("views/templates/home", function(exports, require, module) {
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var foundHelper, self=this;


  return "<div id='description'></div>\n<div id='chart' style='width: 98%; height: 600px;'></div>\n<div id='months'></div>\nSmoothing:\n<input type='button' class='smooth' value='0' />\n<input type='button' class='smooth' value='1' />\n<input type='button' class='smooth' value='2' />\n<input type='button' class='smooth' value='4' />\n<input type='button' class='smooth' value='8' />\n<input type='button' class='smooth' value='16' />\n<input type='button' class='smooth' value='32' />\n<input type='button' class='smooth' value='64' />\n<input type='button' class='smooth' value='128' />\n<input type='button' class='smooth' value='256' />\n<input type='button' class='smooth' value='512' />\n<input type='button' class='smooth' value='1024' />\n<input type='button' class='smooth' value='2048' />\n<input type='button' class='smooth' value='4096' />\n\n<input type='hidden' id='refresh' value='Refresh!' />\n\n<div id='list'></div>\n";});
});

require.register("views/templates/list", function(exports, require, module) {
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <tr>\n      <td>";
  foundHelper = helpers.attributes;
  stack1 = foundHelper || depth0.attributes;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.Date);
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.Date", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</td>\n      <td>";
  foundHelper = helpers.attributes;
  stack1 = foundHelper || depth0.attributes;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.Description);
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.Description", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</td>\n      <td>";
  foundHelper = helpers.attributes;
  stack1 = foundHelper || depth0.attributes;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.Value);
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.Value", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</td>\n    </tr>\n  ";
  return buffer;}

  buffer += "<div id='list-inner'>\n  <table>\n  ";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.models);
  stack2 = helpers.each;
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  </table>\n</div>\n<input type='text' id='search-list' value='";
  foundHelper = helpers.searchValue;
  stack1 = foundHelper || depth0.searchValue;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "searchValue", { hash: {} }); }
  buffer += escapeExpression(stack1) + "' />\n";
  return buffer;});
});

require.register("views/templates/slider", function(exports, require, module) {
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var foundHelper, self=this;


  return "<input type=\"text\" value=\"\" />\n";});
});

require.register("views/view", function(exports, require, module) {
var View,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

require('lib/view_helper');

module.exports = View = (function(_super) {

  __extends(View, _super);

  function View() {
    this.render = __bind(this.render, this);
    return View.__super__.constructor.apply(this, arguments);
  }

  View.prototype.templateHelpers = {};

  View.prototype.template = function() {};

  View.prototype.getRenderData = function() {
    if (typeof this.templateHelpers === 'function') {
      return this.templateHelpers();
    } else {
      return this.templateHelpers;
    }
  };

  View.prototype.render = function() {
    var _this = this;
    this.$el.html(this.template(this.getRenderData()));
    setTimeout(function() {
      return _this.afterRender();
    }, 0);
    return this;
  };

  View.prototype.afterRender = function() {};

  return View;

})(Backbone.View);

});


//# sourceMappingURL=app.js.map