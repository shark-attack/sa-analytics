class SAChannelPerformance extends HTMLElement {
    setProperties() {
        // date resolution
        this.resolution = 14;
    };

    /**
     * on resolution change
     * @param new value
     */
    onResolutionChange(newval) {
        this.timeline = this.rebuildTimeline(this.data, this.resolution);
        this.drawTimeline(this.timeline);
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

        var chart = d3.select(this.viz)
            .attr("height", height * this.channels.length)
            .attr("width", barWidth * data.timeline.length);

        var count = 0;
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
                return date.getMonth() + '/' + date.getDate() });

        chart.selectAll("g")
            .data(data.timeline)
            .enter()
            .append('line')
            .attr('x1', function(d, i) { return i * barWidth; })
            .attr('x2', function(d, i) { return i * barWidth; })
            .attr('y1', 0 )
            .attr('y2', height * 50 )
            .attr('stroke-width', 1)
            .attr('stroke', '#eaeaea');

        for (var c in this.channels) {
            var currentID = this.channels[c].id;
            chart.selectAll("g")
                .data(data.timeline)
                .enter().append("rect")
                .attr("height", function(d, i) { return d[currentID] || 0; })
                .attr("fill", function(d, i) { return '#ff0000'; })
                .attr("x", function(d, i) { return i * barWidth + 5; })
                .attr("y", function(d, i) { return height * count - d[currentID] || 0; })
                .attr("width", barWidth - 10);

            chart.selectAll("g")
                .data(data.timeline)
                .enter()
                .append("text")
                .attr('font-size', '10px')
                .attr("x", 0)
                .attr("y", height * count + 15)
                .attr("dy", ".35em")
                .text(this.channels[c].id + ' (' + this.channels[c].assetsperday + ' apd)');

            count ++;
        }
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
            data[c] = data[c].sort();
            var channelactivityduration = (now - data[c][0])/ (1000 * 60 * 60 * 24);
            channels.push({ id: c,  assetsperday: (data[c].length / channelactivityduration).toPrecision(2) });
            for (var d in data[c]) {
                this.sanityCheckCount ++;
                var droppedres = this.changeDateResolution(data[c][d], resolution);
                if (!timesmap[droppedres]) {
                    timesmap[droppedres] = {};
                    if (!earliest || droppedres < earliest) { earliest = droppedres; }
                    if (!latest || droppedres > latest) { latest = droppedres; }
                }
                if (!timesmap[droppedres][c]) { timesmap[droppedres][c] = 0; }
                timesmap[droppedres][c] ++;
            }
        }

        channels.sort( function(a, b) {
            if (a.assetsperday > b.assetsperday) { return -1; } else { return 1; }
        });
        this.channels = channels;

        var timeline = [];
        var times = earliest;
        var increment = 1000 * 60 * 60 * 24 * this.resolution;
        while (times <= latest) {
            var entries = {};
            if (timesmap[times]) { entries = timesmap[times]; }
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
    };

    /**
     * change datetime number resolution so they can be grouped
     */
    changeDateResolution(datetime, resolution) {
        var date = new Date(datetime);
        var res = 1000 * 60 * 60 * 24 * resolution;
        return res * parseInt(datetime / res);
    };

    /**
     * load data
     */
    loadData() {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('load', () => {
            var data = JSON.parse(xhr.response);
            data = this.rebuildTimeline(data, this.resolution);
            this.drawTimeline(data);
        });
        xhr.open("get", '../data/channelfreq.json', true);
        xhr.send();
    };

    /**
     * parse attributes on element
     */
    parseAttributes() {
    };


    // Fires when an instance of the element is created.
    createdCallback() {
        this.setProperties();
        this.parseAttributes();
    };

    // Fires when an instance was inserted into the document.
    attachedCallback() {
        let template = this.owner.querySelector('template');
        let clone = template.content.cloneNode(true);
        this.root = this.createShadowRoot();
        this.root.appendChild(clone);

        this.viz = this.root.querySelector('#viz');

        this.loadData();
    }


    // Fires when an instance was removed from the document.
    detachedCallback() {};

    // Fires when an attribute was added, removed, or updated.
    attributeChangedCallback(attr, oldVal, newVal) {};

}

SAChannelPerformance.prototype.owner = (document._currentScript || document.currentScript).ownerDocument;
document.registerElement('sa-channel-performance', SAChannelPerformance);
