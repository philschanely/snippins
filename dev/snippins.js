function Snippins() {

    // Instance properties


    // Prototype properties
    this.config = {
        template_dir: "tpl",
        extensions: ".tpl.html"
    };
    this.snips = [];


    // Prototype methods
    this.init = function(_config){
        this.syncConfig(_config);
        var snippins = this;
        $("*[data-snip]").each(function(_i, _snip){
            var $shell = $(_snip);
            snippins.initSnip($shell);
        });
    };
    this.initSnip = function(_shell) {
        var snip = new Snip(
            _shell.attr("data-snip"),
            _shell,
            this.snips.length+1,
            this.config
        );
        snip.load();
        this.snips.push(snip);
    };
    this.syncConfig = function(_config) {
        if (_config !== undefined) {
            for (var prop in _config) {
                if (_config.hasOwnProperty(prop) && this.config.hasOwnProperty(prop)) {
                    this.config[prop] = _config[prop];
                }
            }
        }
    };
}

function Snip(_name, _shell, _id, _config) {

    // Instance properties
    this.id = _id;
    this.name = _name;
    this.shell = _shell;
    this.config = _config;


    // Prototype properties
    this.onloadFunction = null;
    this.template = "";


    // Prototype methods
    this.append = function(_tplData) {
        this.shell.html(_tplData);
    };
    this.getOnloadFunction = function() {
        var onloadAttr = this.shell.attr("data-snip-onload");
        if (onloadAttr !== undefined) {
            this.onloadFunction = onloadAttr;
        }
    };
    this.inject = function(_data) {
        var fn = this.template;
        var tplWithData = fn(_data);
        this.append(tplWithData);
    };
    this.injectData = function(_dataURL, _params) {
        var snip = this;
        $.get(_dataURL, _params, function(_data){
            snip.inject(_data);
        });
    };
    this.load = function(_data) {
        var snip = this;
        var data = _data === undefined ? {} : _data;
        $.get(this.snipPath(), _data, function(_result){
            snip.template = Handlebars.compile(_result);
            snip.loaded(snip.template);
        });
    };
    this.loaded = function(_tplData) {
        if (this.onloadFunction !== null) {
            this[this.onloadFunction](_tplData, this.shell);
        } else {
            this.append(_tplData);
        }
    };
    this.snipPath = function() {
        return this.config.template_dir + "/" + this.name + this.config.extensions;
    };


    // Autorun code
    this.getOnloadFunction();
}

Handlebars.registerHelper('date', function(_date, _format) {
    var date = Date.parse(_date);
    return new Handlebars.SafeString(
        date.format(_format)
    );
});