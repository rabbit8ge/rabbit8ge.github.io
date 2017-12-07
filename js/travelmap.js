//var $ = jQuery;

function getChartData(posData) {
	var dl = [];
	for (var i = 0; i < posData['position'].length; i++) {
		var pos = posData['position'][i];
		dl.push({name: pos['name'], value: '0hf', selected: true});
	}
	return dl;
}

function findDataWithName(name, map) {
	for (var i = 0; i < map.length; i++) {
		if (name == map[i]['name'])
			return map[i];
	}
}

var worldMapOption;
var myChart;
var currentChinaMap = false;
var clickOutChina = true; // Re-set option to world map only if the flag is true.
function loadChinaMap(chart, td, ecConfig) {
	currentChinaMap = true;		
	var chartData = getChartData(td);
	var option = {
			title : {
				text: 'Cities Have Been To',
				subtext: 'yellow items are clickable, click blank area to return',
				x:'left'
			},
			tooltip : {
				trigger: 'item',
				formatter: function(params) {
					var str = params.name + '   ';
					
					if (params.seriesName.replace(' ','') == td['name']) { // Left chart.
						proData = findDataWithName(params.name, td['position']);
						if (proData) {
							str += proData['position'].length + (proData['children'] ? '/' + proData['children'] : '');
						}
					}
					return str;
				}
			},
			toolbox: {
				show: false,
				orient : 'vertical',
				x: 'right',
				y: 'center',
				feature : {
					mark : {show: true},
					dataView : {show: true, readOnly: false},
					restore : {show: true},
					saveAsImage : {show: true}
				}
			},
			series : [{
				name: td['name'],
				type: 'map',
				mapType: td['name'].toLowerCase(),
				hoverable: true,
				mapLocation: {
					x: 'left',
					width: '50%'
				},
				roam: false,
				itemStyle:{
					normal:{label:{show:false}},
					emphasis:{label:{show:true, formattera:function(params) {
						return "";
					}}}
				},
				data: chartData
				}, {
				name: chartData[0]['name'],
				type: 'map',
				mapType: chartData[0]['name'],
				mapLocation: {
					x: '60%'
				},
				itemStyle: {
					normal: {label:{show:false}},
					emphasis: {label:{show:true},
						border: 5,
						color: function(params) {
							var pro = findDataWithName(option.series[1].name, td['position']);
							if (!pro)
								return '#cc6600';
							var city = findDataWithName(params.data.name, pro['position']);
							if (city && city['link']) {
								return 'yellow';
							} else {
								return '#cc6600';
							}
						}},
				},
				data: getChartData(td['position'][0]),
				}
				]
		}; // end of option.
		chart.setOption(option, true);
		
		// On click.
		chart.on(ecConfig.EVENT.CLICK, function (param) {
			clickOutChina = false;
			var selectedName = param.name;
			
			if (param.seriesName == "" || param.seriesName.replace(' ','') == td['name']) { // Click on the left chart.
				// Default option for the province without data.
				option.series[1].name = selectedName;
				option.series[1].mapType = selectedName;
				option.series[1].data = [];
				for (var i = 0; i < chartData.length; i++) {
					if (chartData[i]['name'] == selectedName) {
						pos = td['position'][i];
						option.series[1].name = pos['name'];
						option.series[1].mapType = pos['name'];
						option.series[1].data = getChartData(td['position'][i]);
						break;
					}
				}
				chart.setOption(option, true);
			} else { // Click on the right chart.
				// Find the corresponding province.
				var proData = {};
				for (var i = 0; i < chartData.length; i++) {
					if (chartData[i].name == param.seriesName.replace(' ','')) {
						proData = td['position'][i];
						break;
					}
				}
				// Find the city.
				var link = proData['link'] ? proData['link'] : '';
				for (var i = 0; i < proData['position'].length; i++) {
					if (proData['position'][i]['name'] == selectedName) {
						link = (proData['position'][i]['link'] ? proData['position'][i]['link'] : link);
						if (link)
							window.open(link);
					}
				}
			}
		}) // end of chart.on().
}

function loadWorldMap(chart, wt, ecConfig) {		
	var chartData = getChartData(wt);
	var option = {
			title : {
				text: 'Countries Have Been To',
				subtext: 'yellow items are clickable',
				x:'left'
			},
			tooltip : {
				trigger: 'item'
			},
			toolbox: {
				show: false,
				orient : 'vertical',
				x: 'right',
				y: 'center',
				feature : {
					mark : {show: true},
					dataView : {show: true, readOnly: false},
					restore : {show: true},
					saveAsImage : {show: true}
				}
			},
			/*roamController: {
				show: false,
				x: 'right',
				mapTypeControl: {
					'china': true
				}
			},*/
			series : [{
				name: wt['name'],
				type: 'map',
				mapType: wt['name'],
				hoverable: true,
				mapLocation: {
					x: 'left',
					width: '100%'
				},
				roam: false,
				itemStyle:{
					normal:{label:{show:false}},
					emphasis:{label:{show:true},
						border: 5,
						color: function(params) {
							if (params.data.name == 'China')
								return 'yellow';
							var country = findDataWithName(params.data.name, wt['position']);
							if (country && country['link']) {
								return 'yellow';
							} else {
								return '#cc6600';
							}
						}}
				},
				data: chartData
				}]
		}; // end of option.
		worldMapOption = option;
		chart.setOption(option);
		
		// On click.
		chart.on(ecConfig.EVENT.CLICK, function (param) {
			var selectedName = param.name;
			for (var i = 0; i < chartData.length; i++) {
				if (chartData[i]['name'] == selectedName) {
					if (selectedName == 'China') {
						loadChinaMap(chart, wt['position'][i], ecConfig);
						clickOutChina = false; // China map will be replaced by world map if without this line when user first click china.
					} else if (wt['position'][i]['link']){
						window.open(wt['position'][i]['link']);
					}
					break;
				}
			}
		}) // end of chart.on().
}

function onClickMap() {
	if (currentChinaMap && clickOutChina) {
		myChart.setOption(worldMapOption, true);
		currentChinaMap = false;
	}
	clickOutChina = true;
}

function loadTravelMap(domEle, travels) {
	require.config({
			paths: {
				echarts: 'js/echarts'
			}
		});
	require([
		'echarts',
		'echarts/config',
		'echarts/chart/map'
	], function (ec, ecConfig) {
			$(domEle).css({
				height:'500px',
				width:'900px',
				left: 'center'
			});

	var chart = ec.init(domEle);
	myChart = chart;
	loadWorldMap(chart, travels, ecConfig);
	//loadChinaMap(chart, travels['position'][0], ecConfig);
	domEle.onclick = onClickMap;
	});
}