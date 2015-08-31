'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SAChannelPerformance = (function (_HTMLElement) {
    _inherits(SAChannelPerformance, _HTMLElement);

    function SAChannelPerformance() {
        _classCallCheck(this, SAChannelPerformance);

        _get(Object.getPrototypeOf(SAChannelPerformance.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(SAChannelPerformance, [{
        key: 'setProperties',
        value: function setProperties() {}
    }, {
        key: 'loadData',

        /**
         * load data
         */
        value: function loadData() {
            var _this = this;

            var xhr = new XMLHttpRequest();
            xhr.addEventListener('load', function () {
                var data = JSON.parse(xhr.response);
                _this.createChannelViews(data);
            });
            xhr.open("get", '../data/channelfreq.json', true);
            xhr.send();
        }
    }, {
        key: 'createChannelViews',

        /**
         * create channel views
         * @param data
         */
        value: function createChannelViews(data) {
            var _this2 = this;

            var channels = [];
            for (var c in data) {
                data[c].id = c;
                channels.push(data[c]);
            }

            this.channels = channels.sort(function (a, b) {
                if (a.assetsperday > b.assetsperday) {
                    return -1;
                } else {
                    return 1;
                }
            });

            var snapshotcount = 4;
            if (snapshotcount > this.channels.length) {
                snapshotcount = this.channels.length;
            }
            var bestperformers = this.channels.slice(0, snapshotcount);
            var worstperformers = this.channels.slice(this.channels.length - snapshotcount, this.channels.length);

            this.bigview = this.createHeaderView(this.channels[0]);
            this.headercontainer.appendChild(this.bigview);

            for (var c = 0; c < bestperformers.length; c++) {
                var bch = this.createChannelView(bestperformers[c]);
                bch.setAttribute('data-channelid', bestperformers[c].id);
                bch.addEventListener('click', function (event) {
                    _this2.onChannelClick(event);
                });
                this.bestcontainer.appendChild(bch);
            }

            for (var c = 0; c < worstperformers.length; c++) {
                var wch = this.createChannelView(worstperformers[c]);
                wch.setAttribute('data-channelid', worstperformers[c].id);
                wch.addEventListener('click', function (event) {
                    _this2.onChannelClick(event);
                });
                this.worstcontainer.appendChild(wch);
            }

            for (var c = 0; c < this.channels.length; c++) {
                var ch = document.createElement('div');
                ch.setAttribute('data-channelid', this.channels[c].id);
                ch.className = 'compact-channel';
                ch.innerHTML = '<h1>' + this.channels[c].label + '</h1><span class="apd">' + parseFloat(this.channels[c].assetsperday).toPrecision(2) + '</span>&nbsp;<span>assets per day</span>';
                ch.addEventListener('click', function (event) {
                    _this2.onChannelClick(event);
                });
                this.allchannels.appendChild(ch);
            }
        }
    }, {
        key: 'createChannelView',

        /**
         * creates a channel view elem based on data
         * @param view
         * @returns {Element}
         */
        value: function createChannelView(view) {
            var ch = document.createElement('sa-channel-view');
            ch.setAttribute('resolution', 7);
            ch.setAttribute('daystolookback', 30);
            ch.setAttribute('activedays', view.daysactive);
            ch.setAttribute('assetsperday', view.assetsperday);
            ch.setAttribute('label', view.label);
            ch.setAttribute('activity', view.timestamps);
            ch.setAttribute('barcolor', '#7bbedd');
            return ch;
        }
    }, {
        key: 'createHeaderView',

        /**
         * creates a header view elem based on data
         * @param view
         * @returns {Element}
         */
        value: function createHeaderView(view) {
            var ch = document.createElement('sa-channel-view');
            ch.setAttribute('resolution', 14);
            ch.setAttribute('daystolookback', 365);
            ch.setAttribute('activedays', view.daysactive);
            ch.setAttribute('assetsperday', view.assetsperday);
            ch.setAttribute('label', view.label);
            ch.setAttribute('activity', view.timestamps);
            ch.setAttribute('barcolor', '#7bbedd');
            return ch;
        }
    }, {
        key: 'onChannelClick',

        /**
         * channel click handler
         * @param event
         */
        value: function onChannelClick(event) {
            var id = event.currentTarget.getAttribute('data-channelid');
            console.log(event.currentTarget, id);
            if (this.bigview.parentNode) {
                this.headercontainer.removeChild(this.bigview);
            }
            for (var c = 0; c < this.channels.length; c++) {
                if (this.channels[c].id === id) {
                    this.bigview = this.createHeaderView(this.channels[c]);
                    this.headercontainer.appendChild(this.bigview);
                }
            }
        }
    }, {
        key: 'parseAttributes',

        /**
         * parse attributes on element
         */
        value: function parseAttributes() {}
    }, {
        key: 'createdCallback',

        // Fires when an instance of the element is created.
        value: function createdCallback() {
            this.setProperties();
            this.parseAttributes();
        }
    }, {
        key: 'attachedCallback',

        // Fires when an instance was inserted into the document.
        value: function attachedCallback() {
            var template = this.owner.querySelector('template');
            this.root = this.createShadowRoot();
            var clone = document.importNode(template.content, true);
            this.root.appendChild(clone);
            this.bestcontainer = this.root.querySelector('.top-channels');
            this.worstcontainer = this.root.querySelector('.bottom-channels');
            this.allchannels = this.root.querySelector('.all-channels');
            this.headercontainer = this.root.querySelector('.header');
            this.loadData();
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

    return SAChannelPerformance;
})(HTMLElement);

SAChannelPerformance.prototype.owner = (document._currentScript || document.currentScript).ownerDocument;
document.registerElement('sa-channel-performance', SAChannelPerformance);
//# sourceMappingURL=sa-channel-performance.js.map