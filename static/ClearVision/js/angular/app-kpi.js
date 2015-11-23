var appKPI = angular.module('app.kpi', []);

appKPI.controller('KPICtrl', function ($scope, $http) {

        /*******************************************************************************
         kpi gauge chart
         *******************************************************************************/

        $scope.showKpiChart = function () {

            $scope.KpiChart = c3.generate({

                bindto: '#kpiChart',
                data: {
                    columns: [
                        ['Current Conversion Count', $scope.conversionCount]
                    ],
                    type: 'gauge'
                },
                gauge: {
                    label: {
                        format: function (value) {
                            return value;
                        }
                    },
                    min: 0,
                    max: $scope.kpiCount,
                    width: 50
                },
                color: {
                    pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'],
                    threshold: {
                        values: [15, 30, 45, 60]
                    }
                },
                size: {
                    height: 180
                }

            });
        };

        /*******************************************************************************
         retrieve kpi gauge reading
         *******************************************************************************/

        $scope.getGaugeReading = function () {
            $http.get('/Clearvision/_api/MonthSurgeryKPI')
                .success(function (kpi) {

                    var slashIndex = kpi.indexOf("/");
                    $scope.conversionCount = parseInt(kpi.substring(0, slashIndex));
                    $scope.kpiCount = parseInt(kpi.substring(slashIndex + 1));

                    $scope.showKpiChart();
                });
        };
        $scope.getGaugeReading();

        /*******************************************************************************
         d3 charting
         *******************************************************************************/

        var monthList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var referenceMonthList = [];

        /* function to get the conversion rate prediction */
        $scope.getConversionRatePrediction = function () {

            $http.get("http://127.0.0.1:8000/Clearvision/_api/ConversionRatePrediction/")
                .success(function (conversionPredictionResults) {

                    var mth = conversionPredictionResults[0].monthLong;
                    var idx = monthList.indexOf(mth) + 1;

                    if (idx == 12) {
                        idx = 0;
                    }

                    for (i = 0; i <= 12; i++) {
                        var monthSeq = monthList[idx];
                        referenceMonthList.push(monthSeq);
                        idx++;

                        if (idx == 12) {
                            idx = 0;
                        }
                    }

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
    }
);
