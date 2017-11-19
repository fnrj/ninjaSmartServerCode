//	Source: http://bl.ocks.org/simenbrekken/6634070
//	Author: Simen Brekken
//	Note: D3 code for chart obtained from Source, but modified to facilitate Ajax call and process raw data from sensor

var limit = 60 * 1,
    duration = 750,
    now = new Date(Date.now() - duration)

var width = 500,
    height = 200

var groups = {
	current: {
		value: 0,
                color: 'orange',
                data: d3.range(limit).map(function() {
                    return 0
                })
	},
        target: {
                value: 0,
                color: 'green',
                data: d3.range(limit).map(function() {
                    return 0
                })
        },
        output: {
                value: 0,
                color: 'grey',
                data: d3.range(limit).map(function() {
                    return 0
                })
        }
}

var x = d3.time.scale()
	.domain([now - (limit - 2), now - duration])
	.range([0, width])

var y = d3.scale.linear()
	.domain([0, 100])
	.range([height, 0])

var line = d3.svg.line()
	.interpolate('basis')
	.x(function(d, i) {
		return x(now - (limit - 1 - i) * duration)
        })
	.y(function(d) {
                return y(d)
	})

var svg = d3.select('.graph').append('svg')
	.attr('class', 'chart')
	.attr('width', width)
	.attr('height', height + 50)

var axis = svg.append('g')
	.attr('class', 'x axis')
	.attr('transform', 'translate(0,' + height + ')')
	.call(x.axis = d3.svg.axis().scale(x).orient('bottom'))

var paths = svg.append('g')

for (var name in groups) {
	var group = groups[name]
	group.path = paths.append('path')
		.data([group.data])
                .attr('class', name + ' group')
                .style('stroke', group.color)
}

function tick() {
	now = new Date()
	var text = [];
	for (var name in groups) {
		var group = groups[name]
		$.get("http://ec2-13-58-6-147.us-east-2.compute.amazonaws.com/devices/status/all?userEmail=testElephant@gmail.com", text, function(text) {
			var dataObject = JSON.parse(text);
			console.log(dataObject.devices[1].uv);
			group.data.push(dataObject.devices[1].uv);
                	group.path.attr('d', line)
		})
	}

	x.domain([now - (limit - 2) * duration, now - duration])

	axis.transition()
		.duration(duration)
		.ease('linear')
		.call(x.axis)

	paths.attr('transform', null)
		.transition()
		.duration(duration)
		.ease('linear')
		.attr('transform', 'translate(' + x(now - (limit - 1) * duration) + ')')
		.each('end', tick)

	for (var name in groups) {
		var group = groups[name]
			group.data.shift()
	}
}

tick()
