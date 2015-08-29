"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SAChannelPerformance = (function (_HTMLElement) {
    _inherits(SAChannelPerformance, _HTMLElement);

    function SAChannelPerformance() {
        _classCallCheck(this, SAChannelPerformance);

        _get(Object.getPrototypeOf(SAChannelPerformance.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(SAChannelPerformance, [{
        key: "setProperties",
        value: function setProperties() {
            // date resolution
            this.resolution = 14;
        }
    }, {
        key: "onResolutionChange",

        /**
         * on resolution change
         * @param new value
         */
        value: function onResolutionChange(newval) {
            this.timeline = this.rebuildTimeline(this.data, this.resolution);
            this.drawTimeline(this.timeline);
        }
    }, {
        key: "drawTimeline",

        /**
         * draw timeline
         * @param {Array} data
         */
        value: function drawTimeline(data) {
            var height = 50,
                barWidth = 30;

            var y = d3.scale.linear().domain([0, d3.max(data.timeline)]).range([0, height]);

            var chart = d3.select(this.viz).attr("height", height * this.channels.length).attr("width", barWidth * data.timeline.length);

            var count = 0;
            chart.selectAll("g").data(data.timeline).enter().append("text").attr('font-size', '10px').attr("x", function (d, i) {
                return i * barWidth + 5;
            }).attr("y", function () {
                return 5;
            }).attr("dy", ".35em").text(function (d, i) {
                var date = new Date(i * data.increment + data.start);
                return date.getMonth() + '/' + date.getDate();
            });

            chart.selectAll("g").data(data.timeline).enter().append('line').attr('x1', function (d, i) {
                return i * barWidth;
            }).attr('x2', function (d, i) {
                return i * barWidth;
            }).attr('y1', 0).attr('y2', height * 50).attr('stroke-width', 1).attr('stroke', '#eaeaea');

            for (var c in this.channels) {
                var currentID = this.channels[c].id;
                chart.selectAll("g").data(data.timeline).enter().append("rect").attr("height", function (d, i) {
                    return d[currentID] || 0;
                }).attr("fill", function (d, i) {
                    return '#ff0000';
                }).attr("x", function (d, i) {
                    return i * barWidth + 5;
                }).attr("y", function (d, i) {
                    return height * count - d[currentID] || 0;
                }).attr("width", barWidth - 10);

                chart.selectAll("g").data(data.timeline).enter().append("text").attr('font-size', '10px').attr("x", 0).attr("y", height * count + 15).attr("dy", ".35em").text(this.channels[c].id + ' (' + this.channels[c].assetsperday + ' apd)');

                count++;
            }
        }
    }, {
        key: "rebuildTimeline",

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
                data[c] = data[c].sort();
                var channelactivityduration = (now - data[c][0]) / (1000 * 60 * 60 * 24);
                channels.push({ id: c, assetsperday: (data[c].length / channelactivityduration).toPrecision(2) });
                for (var d in data[c]) {
                    this.sanityCheckCount++;
                    var droppedres = this.changeDateResolution(data[c][d], resolution);
                    if (!timesmap[droppedres]) {
                        timesmap[droppedres] = {};
                        if (!earliest || droppedres < earliest) {
                            earliest = droppedres;
                        }
                        if (!latest || droppedres > latest) {
                            latest = droppedres;
                        }
                    }
                    if (!timesmap[droppedres][c]) {
                        timesmap[droppedres][c] = 0;
                    }
                    timesmap[droppedres][c]++;
                }
            }

            channels.sort(function (a, b) {
                if (a.assetsperday > b.assetsperday) {
                    return -1;
                } else {
                    return 1;
                }
            });
            this.channels = channels;

            var timeline = [];
            var times = earliest;
            var increment = 1000 * 60 * 60 * 24 * this.resolution;
            while (times <= latest) {
                var entries = {};
                if (timesmap[times]) {
                    entries = timesmap[times];
                }
                timeline.push(entries);
                times += increment;
            }

            return { timeline: timeline, start: earliest, increment: increment };

            /*var ttl = 0;
             for (var c in timeline) {
             for (var d in timeline[c]) {
             ttl += timeline[c][d];
             }
             }
             console.log(ttl, ' vs ', this.sanityCheckCount);*/
        }
    }, {
        key: "changeDateResolution",

        /**
         * change datetime number resolution so they can be grouped
         */
        value: function changeDateResolution(datetime, resolution) {
            var date = new Date(datetime);
            var res = 1000 * 60 * 60 * 24 * resolution;
            return res * parseInt(datetime / res);
        }
    }, {
        key: "loadData",

        /**
         * load data
         */
        value: function loadData() {
            var _this = this;

            var xhr = new XMLHttpRequest();
            xhr.addEventListener('load', function () {
                var data = JSON.parse(xhr.response);
                data = _this.rebuildTimeline(data, _this.resolution);
                _this.drawTimeline(data);
            });
            xhr.open("get", '../data/channelfreq.json', true);
            xhr.send();
        }
    }, {
        key: "parseAttributes",

        /**
         * parse attributes on element
         */
        value: function parseAttributes() {}
    }, {
        key: "createdCallback",

        // Fires when an instance of the element is created.
        value: function createdCallback() {
            this.setProperties();
            this.parseAttributes();
        }
    }, {
        key: "attachedCallback",

        // Fires when an instance was inserted into the document.
        value: function attachedCallback() {
            var template = this.owner.querySelector('template');
            var clone = template.content.cloneNode(true);
            this.root = this.createShadowRoot();
            this.root.appendChild(clone);

            this.viz = this.root.querySelector('#viz');

            this.loadData();
        }

        // Fires when an instance was removed from the document.
    }, {
        key: "detachedCallback",
        value: function detachedCallback() {}
    }, {
        key: "attributeChangedCallback",

        // Fires when an attribute was added, removed, or updated.
        value: function attributeChangedCallback(attr, oldVal, newVal) {}
    }]);

    return SAChannelPerformance;
})(HTMLElement);

SAChannelPerformance.prototype.owner = (document._currentScript || document.currentScript).ownerDocument;
document.registerElement('sa-channel-performance', SAChannelPerformance);
//# sourceMappingURL=sa-channel-performance.js.map