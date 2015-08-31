class SAChannelPerformance extends HTMLElement {
    setProperties() {
        this.uri = '';
    };

    /**
     * load data
     */
    loadData() {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('load', () => {
            var data = JSON.parse(xhr.response);
            this.createChannelViews(data);
        });
        xhr.open("get", this.uri, true);
        xhr.send();
    };

    /**
     * create channel views
     * @param data
     */
    createChannelViews(data) {
        var channels = [];
        for (var c in data) {
            data[c].id = c;
            channels.push(data[c]);
        }

        this.channels = channels.sort(function(a,b) { if (a.assetsperday > b.assetsperday) { return -1; } else { return 1 }});

        var snapshotcount = 4;
        if (snapshotcount > this.channels.length) {
            snapshotcount = this.channels.length;
        }
        var bestperformers = this.channels.slice(0, snapshotcount);
        var worstperformers = this.channels.slice(this.channels.length-snapshotcount, this.channels.length);

        this.bigview = this.createHeaderView(this.channels[0]);
        this.headercontainer.appendChild(this.bigview);

        for (var c = 0; c < bestperformers.length; c++) {
            var bch = this.createChannelView(bestperformers[c]);
            bch.setAttribute('data-channelid', bestperformers[c].id);
            bch.addEventListener('click', (event) => { this.onChannelClick(event); });
            this.bestcontainer.appendChild(bch);
        }

        for (var c = 0; c < worstperformers.length; c++) {
            var wch = this.createChannelView(worstperformers[c]);
            wch.setAttribute('data-channelid', worstperformers[c].id);
            wch.addEventListener('click', (event) => { this.onChannelClick(event); });
            this.worstcontainer.appendChild(wch);
        }

        for (var c = 0; c < this.channels.length; c++) {
            var ch = document.createElement('div');
            ch.setAttribute('data-channelid', this.channels[c].id);
            ch.className = 'compact-channel';
            ch.innerHTML = '<h1>' +  this.channels[c].label + '</h1><span class="apd">' + parseFloat(this.channels[c].assetsperday).toPrecision(2) + '</span>&nbsp;<span>assets per day</span>';
            ch.addEventListener('click', (event) => { this.onChannelClick(event); });
            this.allchannels.appendChild(ch);
        }
    };

    /**
     * creates a channel view elem based on data
     * @param view
     * @returns {Element}
     */
    createChannelView(view) {
        var ch = document.createElement('sa-channel-view');
        ch.setAttribute('resolution', 7);
        ch.setAttribute('daystolookback', 30);
        ch.setAttribute('activedays', view.daysactive);
        ch.setAttribute('assetsperday', view.assetsperday);
        ch.setAttribute('label', view.label);
        ch.setAttribute('activity', view.timestamps);
        ch.setAttribute('barcolor', '#7bbedd');
        return ch;
    };

    /**
     * creates a header view elem based on data
     * @param view
     * @returns {Element}
     */
    createHeaderView(view) {
        var ch = document.createElement('sa-channel-view');
        ch.setAttribute('resolution', 14);
        ch.setAttribute('daystolookback', 365);
        ch.setAttribute('activedays', view.daysactive);
        ch.setAttribute('assetsperday', view.assetsperday);
        ch.setAttribute('label', view.label);
        ch.setAttribute('activity', view.timestamps);
        ch.setAttribute('barcolor', '#7bbedd');
        return ch;
    };

    /**
     * channel click handler
     * @param event
     */
    onChannelClick(event) {
        var id = event.currentTarget.getAttribute('data-channelid');
        if (this.bigview.parentNode) {
            this.headercontainer.removeChild(this.bigview);
        }
        for (var c = 0; c < this.channels.length; c++) {
            if (this.channels[c].id === id) {
                this.bigview = this.createHeaderView(this.channels[c]);
                this.headercontainer.appendChild(this.bigview)
            }
        }
    };

    /**
     * parse attributes on element
     */
    parseAttributes() {
        if (this.hasAttribute('uri')) {
            this.uri = this.getAttribute('uri');
        }

    };

    // Fires when an instance of the element is created.
    createdCallback() {
        this.setProperties();
        this.parseAttributes();
    };

    // Fires when an instance was inserted into the document.
    attachedCallback() {
        let template = this.owner.querySelector('template');
        this.root = this.createShadowRoot();
        let clone = document.importNode(template.content, true);
        this.root.appendChild(clone);
        this.bestcontainer = this.root.querySelector('.top-channels');
        this.worstcontainer = this.root.querySelector('.bottom-channels');
        this.allchannels = this.root.querySelector('.all-channels');
        this.headercontainer = this.root.querySelector('.header');
        this.loadData();
    }


    // Fires when an instance was removed from the document.
    detachedCallback() {};

    // Fires when an attribute was added, removed, or updated.
    attributeChangedCallback(attr, oldVal, newVal) {};

}

SAChannelPerformance.prototype.owner = (document._currentScript || document.currentScript).ownerDocument;
document.registerElement('sa-channel-performance', SAChannelPerformance);
