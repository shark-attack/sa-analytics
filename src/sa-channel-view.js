'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SAChannelView = (function (_HTMLElement) {
    _inherits(SAChannelView, _HTMLElement);

    function SAChannelView() {
        _classCallCheck(this, SAChannelView);

        _get(Object.getPrototypeOf(SAChannelView.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(SAChannelView, [{
        key: 'setProperties',

        /**
         * set initial properties
         */
        value: function setProperties() {
            this.barcolor = '#ff0000';
        }

        /**
         * parse attributes on element
         */
    }, {
        key: 'parseAttributes',
        value: function parseAttributes() {
            if (this.hasAttribute('label')) {
                this.label = this.getAttribute('label');
            }

            if (this.hasAttribute('assetsperday')) {
                this.assetsperday = this.getAttribute('assetsperday');
            }

            if (this.hasAttribute('activedays')) {
                this.activedays = this.getAttribute('activedays');
            }

            if (this.hasAttribute('activity')) {
                this.activity = this.getAttribute('activity').split(',');
            }

            if (this.hasAttribute('resolution')) {
                this.resolution = parseInt(this.getAttribute('resolution'));
            }

            if (this.hasAttribute('daystolookback')) {
                this.daystolookback = parseInt(this.getAttribute('daystolookback'));
            }

            if (this.hasAttribute('barcolor')) {
                this.barcolor = this.getAttribute('barcolor');
            }
        }
    }, {
        key: 'drawTimeline',

        /**
         * draw timeline
         * @param {Array} data
         */
        value: function drawTimeline(data) {
            var height = 50,
                barWidth = 30;

            var y = d3.scale.linear().domain([0, d3.max(data.timeline)]).range([0, height]);

            var chart = d3.select(this.svg).attr("height", height).attr("width", barWidth * data.timeline.length);

            var count = 0;
            var barcolor = this.barcolor;
            chart.selectAll("g").data(data.timeline).enter().append("text").attr('font-size', '10px').attr("x", function (d, i) {
                return i * barWidth + 5;
            }).attr("y", function () {
                return 5;
            }).attr("dy", ".35em").text(function (d, i) {
                var date = new Date(i * data.increment + data.start);
                return date.getMonth() + 1 + '/' + date.getDate();
            });

            chart.selectAll("g").data(data.timeline).enter().append('line').attr('x1', function (d, i) {
                return i * barWidth;
            }).attr('x2', function (d, i) {
                return i * barWidth;
            }).attr('y1', 0).attr('y2', height).attr('stroke-width', 1).attr('stroke', '#eaeaea');

            chart.selectAll("g").data(data.timeline).enter().append("rect").attr("height", function (d, i) {
                return d;
            }).attr("fill", function (d, i) {
                return barcolor;
            }).attr("x", function (d, i) {
                return i * barWidth + 5;
            }).attr("y", function (d, i) {
                return height - d;
            }).attr("width", barWidth - 10);
        }
    }, {
        key: 'rebuildTimeline',

        /**
         * rebuild the timeline with new data and resolution
         *
         * @param {Object}
         * @param {Number} resolution
         * @param {Array} timeline
         */
        value: function rebuildTimeline(data, resolution) {
            var now = new Date().getTime();
            var timesmap = {};
            var channels = [];
            var earliest, latest;
            for (var c in data) {
                //this.sanityCheckCount ++;
                var droppedres = this.changeDateResolution(data[c], resolution);
                if (!timesmap[droppedres]) {
                    timesmap[droppedres] = 0;
                }
                timesmap[droppedres]++;
            }

            var timeline = [];
            var now = this.changeDateResolution(new Date().getTime(), this.resolution);
            var lookback = this.changeDateResolution(now - this.daystolookback * 24 * 60 * 60 * 1000, this.resolution);
            var times = lookback;
            var increment = 1000 * 60 * 60 * 24 * this.resolution;
            while (times <= now) {
                var entries = 0;
                if (timesmap[times]) {
                    entries = timesmap[times];
                }
                timeline.push(entries);
                times += increment;
            }

            return { timeline: timeline, start: lookback, increment: increment };
        }
    }, {
        key: 'changeDateResolution',

        /**
         * change datetime number resolution
         * @param datetime
         * @param resolution
         */
        value: function changeDateResolution(datetime, resolution) {
            var date = new Date(datetime);
            var res = 1000 * 60 * 60 * 24 * resolution;
            return res * parseInt(datetime / res);
        }
    }, {
        key: 'createdCallback',

        // Fires when an instance of the element is created.
        value: function createdCallback() {}
    }, {
        key: 'attachedCallback',

        // Fires when an instance was inserted into the document.
        value: function attachedCallback() {
            this.setProperties();
            this.parseAttributes();

            var template = this.owner.querySelector('template');
            var clone = template.content.cloneNode(true);
            this.root = this.createShadowRoot();
            this.root.appendChild(clone);
            this.svg = this.root.querySelector('svg');

            this.labelElement = this.root.querySelector('h1');
            this.labelElement.innerText = this.label;

            this.activedaysElement = this.root.querySelector('.active-days');
            this.activedaysElement.innerText = parseInt(this.activedays);

            this.assetsperdayElement = this.root.querySelector('.assets-per-day');
            this.assetsperdayElement.innerText = parseFloat(this.assetsperday).toPrecision(2);

            var data = this.rebuildTimeline(this.activity, this.resolution);
            this.drawTimeline(data);
        }

        // Fires when an instance was removed from the document.
    }, {
        key: 'detachedCallback',
        value: function detachedCallback() {}
    }, {
        key: 'attributeChangedCallback',

        // Fires when an attribute was added, removed, or updated.
        value: function attributeChangedCallback(attr, oldVal, newVal) {}
    }]);

    return SAChannelView;
})(HTMLElement);

SAChannelView.prototype.owner = (document._currentScript || document.currentScript).ownerDocument;
document.registerElement('sa-channel-view', SAChannelView);
//# sourceMappingURL=sa-channel-view.js.map