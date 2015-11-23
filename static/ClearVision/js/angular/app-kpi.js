var appKPI = angular.module('app.kpi', []);

appKPI.controller('KPICtrl', function ($scope, $http, $modal, $route) {
    $scope.showRoiChart = function () {

        $scope.KpiChart = c3.generate({
            bindto: '#kpiChart',
            data: {
                columns: [
                    ['data', 91.4]
                ],
                type: 'gauge',
                onclick: function (d, i) {
                    console.log("onclick", d, i);
                },
                onmouseover: function (d, i) {
                    console.log("onmouseover", d, i);
                },
                onmouseout: function (d, i) {
                    console.log("onmouseout", d, i);
                }
            },
            gauge: {
//        label: {
//            format: function(value, ratio) {
//                return value;
//            },
//            show: false // to turn off the min/max labels.
//        },
//    min: 0, // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
//    max: 100, // 100 is default
//    units: ' %',
//    width: 39 // for adjusting arc thickness
            },
            color: {
                pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'], // the three color levels for the percentage values.
                threshold: {
//            unit: 'value', // percentage is default
//            max: 200, // 100 is default
                    values: [30, 60, 90, 100]
                }
            },
            size: {
                height: 180
            }

        });

    };

    var conversionData = [{
        "monthLong": "Nov",
        "monthShort": 10,
        "year": 2015,
        "type": "conversionCount",
        "count": 7,
        "sequence": 11
    }, {
        "monthLong": "Nov",
        "monthShort": 10,
        "year": 2015,
        "type": "preEvaluationCount",
        "count": 12,
        "sequence": 11
    }, {
        "monthLong": "Oct",
        "monthShort": 9,
        "year": 2015,
        "type": "conversionCount",
        "count": 20,
        "sequence": 10
    }, {
        "monthLong": "Oct",
        "monthShort": 9,
        "year": 2015,
        "type": "preEvaluationCount",
        "count": 28,
        "sequence": 10
    }, {
        "monthLong": "Sep",
        "monthShort": 8,
        "year": 2015,
        "type": "conversionCount",
        "count": 7,
        "sequence": 9
    }, {
        "monthLong": "Sep",
        "monthShort": 8,
        "year": 2015,
        "type": "preEvaluationCount",
        "count": 20,
        "sequence": 9
    }, {
        "monthLong": "Aug",
        "monthShort": 7,
        "year": 2015,
        "type": "conversionCount",
        "count": 19,
        "sequence": 8
    }, {
        "monthLong": "Aug",
        "monthShort": 7,
        "year": 2015,
        "type": "preEvaluationCount",
        "count": 13,
        "sequence": 8
    }, {
        "monthLong": "Jul",
        "monthShort": 6,
        "year": 2015,
        "type": "conversionCount",
        "count": 19,
        "sequence": 7
    }, {
        "monthLong": "Jul",
        "monthShort": 6,
        "year": 2015,
        "type": "preEvaluationCount",
        "count": 21,
        "sequence": 7
    }, {
        "monthLong": "Jun",
        "monthShort": 5,
        "year": 2015,
        "type": "conversionCount",
        "count": 19,
        "sequence": 6
    }, {
        "monthLong": "Jun",
        "monthShort": 5,
        "year": 2015,
        "type": "preEvaluationCount",
        "count": 32,
        "sequence": 6
    }, {
        "monthLong": "May",
        "monthShort": 4,
        "year": 2015,
        "type": "conversionCount",
        "count": 15,
        "sequence": 5
    }, {
        "monthLong": "May",
        "monthShort": 4,
        "year": 2015,
        "type": "preEvaluationCount",
        "count": 38,
        "sequence": 5
    }, {
        "monthLong": "Apr",
        "monthShort": 3,
        "year": 2015,
        "type": "conversionCount",
        "count": 17,
        "sequence": 4
    }, {
        "monthLong": "Apr",
        "monthShort": 3,
        "year": 2015,
        "type": "preEvaluationCount",
        "count": 23,
        "sequence": 4
    }, {
        "monthLong": "Mar",
        "monthShort": 2,
        "year": 2015,
        "type": "conversionCount",
        "count": 5,
        "sequence": 3
    }, {
        "monthLong": "Mar",
        "monthShort": 2,
        "year": 2015,
        "type": "preEvaluationCount",
        "count": 33,
        "sequence": 3
    }, {
        "monthLong": "Feb",
        "monthShort": 1,
        "year": 2015,
        "type": "conversionCount",
        "count": 9,
        "sequence": 2
    }, {
        "monthLong": "Feb",
        "monthShort": 1,
        "year": 2015,
        "type": "preEvaluationCount",
        "count": 25,
        "sequence": 2
    }, {
        "monthLong": "Jan",
        "monthShort": 0,
        "year": 2015,
        "type": "conversionCount",
        "count": 21,
        "sequence": 1
    }, {
        "monthLong": "Jan",
        "monthShort": 0,
        "year": 2015,
        "type": "preEvaluationCount",
        "count": 31,
        "sequence": 1
    }, {
        "monthLong": "Dec",
        "monthShort": 11,
        "year": 2014,
        "type": "conversionCount",
        "count": 18,
        "sequence": 0
    }, {
        "monthLong": "Dec",
        "monthShort": 11,
        "year": 2014,
        "type": "preEvaluationCount",
        "count": 15,
        "sequence": 0
    }];

    var monthList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var referenceMonthList = [];

    /* function to get the conversion rate prediction */
    $scope.getConversionRatePrediction = function () {

        $http.get("http://127.0.0.1:8000/Clearvision/_api/ConversionRatePrediction/")
            .success(function (conversionPredictionResults) {

                var mth = conversionPredictionResults[0].monthLong;
                var idx = monthList.indexOf(mth) + 1;

                for (i = 0; i <= 12; i++) {
                    var monthSeq = monthList[idx];
                    referenceMonthList.push(monthSeq);
                    idx++;

                    if (idx == 12) {
                        idx = 0;
                    }
                }

                console.log(referenceMonthList);

                /* function to show scatter plot, x-axis: month, y-axis: count */
                showScatterPlot(conversionPredictionResults);
            })

    };
    $scope.getConversionRatePrediction();


    function showScatterPlot(data) {
        // just to have some space around items.
        var margins = {
            "left": 40,
            "right": 30,
            "top": 30,
            "bottom": 40
        };

        var width = 1000;
        var height = 500;

        // this will be our colour scale. An Ordinal scale.
        var colors = d3.scale.category10();

        // we add the SVG component to the scatter-load div
        var svg = d3.select("#scatter-load").append("svg").attr("width", width).attr("height", height).append("g")
            .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

        // this sets the scale that we're using for the X axis.
        // the domain define the min and max variables to show. In this case, it's the min and max month.
        // this is made a compact piece of code due to d3.extent which gives back the max and min of the month variable within the data set
        var x = d3.scale.linear()
            .domain(d3.extent(data, function (d) {
                return d.sequence;
            }))
            // the range maps the domain to values from 0 to the width minus the left and right margins (used to space out the visualization)
            .range([0, width - margins.left - margins.right]);

        // this does the same as for the y axis but maps from the rating variable to the height to 0.
        var y = d3.scale.linear()
            .domain(d3.extent(data, function (d) {
                return d.count;
            }))
            // note that height goes first due to the weird SVG coordinate system
            .range([height - margins.top - margins.bottom, 0]);

        // we add the axes SVG component. At this point, this is just a placeholder. The actual axis will be added in a bit
        svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + y.range()[0] + ")");
        svg.append("g").attr("class", "y axis");

        // this is our X axis label
        svg.append("text")
            .attr("fill", "#414241")
            .attr("text-anchor", "end")
            .attr("x", width / 2)
            .attr("y", height - 35)
            .text("Last 12 months");

        // this is our Y axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margins.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Count");

        // this is the actual definition of our x and y axes. The orientation refers to where the labels appear - for the x axis, below or above the line, and for the y axis, left or right of the line. Tick padding refers to how much space between the tick and the label.
        var xAxis = d3.svg.axis().scale(x).tickFormat(function (d) {
            return referenceMonthList[d];
        }).orient("bottom").tickPadding(2);
        var yAxis = d3.svg.axis().scale(y).orient("left").tickPadding(2);

        // this is where we select the axis we created a few lines earlier. In our svg we appended a g element with a x/y and axis class. To pull that back up, we do this svg select, then 'call' the appropriate axis object for rendering.
        svg.selectAll("g.y.axis").call(yAxis);
        svg.selectAll("g.x.axis").call(xAxis);

        // now, we can get down to the data part, and drawing stuff. We are telling D3 that all nodes (g elements with class node) will have data attached to them. The 'key' we use (to let D3 know the uniqueness of items) will be the concatenated month + year + type.
        var appointment = svg.selectAll("g.node").data(data, function (d) {
            return d.monthLong + d.year + d.type;
        });

        // we 'enter' the data, making the SVG group (to contain a circle and text) with a class node. This corresponds with what we told the data it should be above.
        var appointmentGroup = appointment.enter().append("g").attr("class", "node")
            // this is how we set the position of the items
            .attr('transform', function (d) {
                return "translate(" + x(d.sequence) + "," + y(d.count) + ")";
            });

        // we add our first circle graphics element
        appointmentGroup.append("circle")
            .attr("r", function (d) {
                return Math.sqrt(d.count);
            })
            .attr("class", "dot")
            .style("fill", function (d) {
                // use the ordinal colors scale to get a colour for the type. Each node of unique type will be coloured
                return colors(d.type);
            });

        // now we add some text, so we can see what each item is
        appointmentGroup.append("text")
            .style("text-anchor", "middle")
            .attr("dy", -10)
            .text(function (d) {
                return d.count;
            });
    }

});
