class SAChannelView extends HTMLElement {
    /**
     * set initial properties
     */
    setProperties() {
        this.barcolor = '#ff0000';
    }

    /**
     * parse attributes on element
     */
    parseAttributes() {
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
    };

    /**
     * draw timeline
     * @param {Array} data
     */
    drawTimeline(data) {
        var height = 50,
            barWidth = 30;

        var y = d3.scale.linear()
            .domain([0, d3.max(data.timeline)])
            .range([0, height]);

        var chart = d3.select(this.svg)
            .attr("height", height)
            .attr("width", barWidth * data.timeline.length);

        var count = 0;
        var barcolor = this.barcolor;
        chart.selectAll("g")
            .data(data.timeline)
            .enter()
            .append("text")
            .attr('font-size', '10px')
            .attr("x", function(d, i) { return i * barWidth + 5; })
            .attr("y", function() { return 5;})
            .attr("dy", ".35em")
            .text(function(d, i) {
                var date = new Date(i * data.increment + data.start);
                return date.getMonth()+1 + '/' + date.getDate() });

        chart.selectAll("g")
            .data(data.timeline)
            .enter()
            .append('line')
            .attr('x1', function(d, i) { return i * barWidth; })
            .attr('x2', function(d, i) { return i * barWidth; })
            .attr('y1', 0 )
            .attr('y2', height)
            .attr('stroke-width', 1)
            .attr('stroke', '#eaeaea');

        chart.selectAll("g")
            .data(data.timeline)
            .enter().append("rect")
            .attr("height", function(d, i) { return d; })
            .attr("fill", function(d, i) { return barcolor; })
            .attr("x", function(d, i) { return i * barWidth + 5; })
            .attr("y", function(d, i) { return height - d; })
            .attr("width", barWidth - 10);
    };

    /**
     * rebuild the timeline with new data and resolution
     *
     * @param {Object}
     * @param {Number} resolution
     * @param {Array} timeline
     */
    rebuildTimeline(data, resolution) {
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
            timesmap[droppedres] ++;
        }

        var timeline = [];
        var now = this.changeDateResolution(new Date().getTime(), this.resolution);
        var lookback = this.changeDateResolution(now - this.daystolookback * 24 * 60 * 60 * 1000, this.resolution);
        var times = lookback;
        var increment = 1000 * 60 * 60 * 24 * this.resolution;
        while (times <= now) {
            var entries = 0;
            if (timesmap[times]) { entries = timesmap[times]; }
            timeline.push(entries);
            times += increment;
        }

        return { timeline: timeline, start: lookback, increment: increment };
    };

    /**
     * change datetime number resolution
     * @param datetime
     * @param resolution
     */
    changeDateResolution(datetime, resolution) {
        var date = new Date(datetime);
        var res = 1000 * 60 * 60 * 24 * resolution;
        return res * parseInt(datetime / res);
    };

    // Fires when an instance of the element is created.
    createdCallback() {};

    // Fires when an instance was inserted into the document.
    attachedCallback() {
        this.setProperties();
        this.parseAttributes();

        let template = this.owner.querySelector('template');
        let clone = template.content.cloneNode(true);
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
    detachedCallback() {};

    // Fires when an attribute was added, removed, or updated.
    attributeChangedCallback(attr, oldVal, newVal) {};

}

SAChannelView.prototype.owner = (document._currentScript || document.currentScript).ownerDocument;
document.registerElement('sa-channel-view', SAChannelView);